import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../mongoose/schemas/order.schema';
import { Product, ProductDocument } from '../../mongoose/schemas/product.schema';
import { User, UserDocument } from '../../users/user.schema';
import { UpdateStatusDto, OrderStatus } from './dto/update-status.dto';

/** Valid forward transitions per the spec order lifecycle. */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async populateOrder(order: any) {
    const [user, products] = await Promise.all([
      this.userModel.findById(order.userId).lean({ virtuals: true }),
      this.productModel
        .find({ _id: { $in: order.items.map((i: any) => i.productId) } })
        .lean({ virtuals: true }),
    ]);
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
      user: user
        ? {
            id: (user as any)._id.toString(),
            email: (user as any).email,
            name: (user as any).name,
          }
        : null,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
        product: pMap[item.productId.toString()] || null,
      })),
    };
  }

  async getAll() {
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).lean({ virtuals: true });
    return Promise.all(orders.map((o) => this.populateOrder(o)));
  }

  async getById(id: string) {
    const order = await this.orderModel.findById(id).lean({ virtuals: true });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.populateOrder(order);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const current = order.status as OrderStatus;
    const allowed = VALID_TRANSITIONS[current];

    if (!allowed.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Invalid status transition from ${current} to ${dto.status}`,
      );
    }

    const updated = await this.orderModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .lean({ virtuals: true });
    return this.populateOrder(updated);
  }
}
