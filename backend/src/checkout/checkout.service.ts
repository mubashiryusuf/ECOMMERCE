import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Cart, CartDocument } from '../mongoose/schemas/cart.schema';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';
import { Order, OrderDocument } from '../mongoose/schemas/order.schema';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2026-06-24.dahlia' as any },
    );
  }

  /**
   * Creates a Stripe PaymentIntent for the given amount in cents.
   * The client uses the returned clientSecret to confirm payment on the frontend.
   */
  async createPaymentIntent(amountCents: number) {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret };
  }

  /**
   * Sequential checkout (no replica set in dev, so no native MongoDB transactions).
   * Operations: validate stock → compute total → verify Stripe payment (if provided) →
   * create order → decrement stock → clear cart.
   * If paymentIntentId is present in the DTO, it is verified with Stripe before the
   * order is persisted. Falls back to mock paymentRef when no paymentIntentId is sent.
   */
  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const productIds = (cart.items as any[]).map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } });
    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

    // Step 1 & 2: Re-validate stock server-side
    for (const item of cart.items as any[]) {
      const prod = productMap[item.productId.toString()];
      if (!prod) throw new BadRequestException(`Product not found: ${item.productId}`);
      if (item.quantity > prod.stockQuantity) {
        throw new BadRequestException(`Insufficient stock for "${prod.name}"`);
      }
    }

    // Step 3: Compute total server-side — never trust client total
    const totalCents = (cart.items as any[]).reduce((sum, item) => {
      return sum + item.quantity * productMap[item.productId.toString()].priceCents;
    }, 0);

    // Step 4: Determine paymentRef — verify real Stripe intent or use mock fallback
    let paymentRef = `mock_${Date.now()}_${userId}`;
    if (dto.paymentIntentId) {
      const intent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
      if (intent.status !== 'succeeded') {
        throw new BadRequestException('Payment not completed');
      }
      paymentRef = dto.paymentIntentId;
    }

    // Step 5: Snapshot prices for order items
    const orderItems = (cart.items as any[]).map((item) => {
      const prod = productMap[item.productId.toString()];
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: prod.priceCents,
        lineTotalCents: item.quantity * prod.priceCents,
      };
    });

    // Step 6: Create Order with snapshotted prices
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      totalCents,
      paymentRef,
      status: 'PENDING',
      name: dto.name,
      addressLine1: dto.addressLine1,
      city: dto.city,
      postalCode: dto.postalCode,
      country: dto.country,
      items: orderItems,
    });

    // Step 7: Decrement stock
    for (const item of cart.items as any[]) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // Step 8: Clear cart
    await this.cartModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $set: { items: [] } },
    );

    // Step 9: Return populated order
    const populated = await this.orderModel.findById(order._id).lean({ virtuals: true });
    if (!populated) return order;

    const allProducts = await this.productModel
      .find({ _id: { $in: (populated as any).items.map((i: any) => i.productId) } })
      .lean({ virtuals: true });
    const pMap = Object.fromEntries(
      allProducts.map((p: any) => [p._id.toString(), { ...p, id: p._id.toString(), _id: undefined, __v: undefined }]),
    );

    return {
      id: (populated as any)._id.toString(),
      userId: (populated as any).userId.toString(),
      status: (populated as any).status,
      totalCents: (populated as any).totalCents,
      paymentRef: (populated as any).paymentRef,
      name: (populated as any).name,
      addressLine1: (populated as any).addressLine1,
      city: (populated as any).city,
      postalCode: (populated as any).postalCode,
      country: (populated as any).country,
      createdAt: (populated as any).createdAt,
      updatedAt: (populated as any).updatedAt,
      items: ((populated as any).items || []).map((item: any) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
        product: pMap[item.productId.toString()] || null,
      })),
    };
  }
}
