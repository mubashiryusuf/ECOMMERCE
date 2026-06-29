import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../mongoose/schemas/order.schema';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private async populateOrderItems(order: any) {
    const productIds = (order.items || []).map((i: any) =>
      i.productId.toString ? i.productId.toString() : i.productId,
    );
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean({ virtuals: true });
    const pMap = Object.fromEntries(
      products.map((p: any) => [
        p._id.toString(),
        { ...p, id: p._id.toString(), _id: undefined, __v: undefined },
      ]),
    );
    return {
      id: order._id.toString(),
      userId: order.userId.toString(),
      status: order.status,
      totalCents: order.totalCents,
      paymentRef: order.paymentRef,
      name: order.name,
      addressLine1: order.addressLine1,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items || []).map((item: any) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
        product: pMap[item.productId.toString()] || null,
      })),
    };
  }

  async getOrders(userId: string) {
    const orders = await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
    return Promise.all(orders.map((o) => this.populateOrderItems(o)));
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId).lean({ virtuals: true });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if ((order as any).userId.toString() !== userId) throw new ForbiddenException('Not your order');
    return this.populateOrderItems(order);
  }
}
