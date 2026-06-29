import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../mongoose/schemas/order.schema';
import { Product, ProductDocument } from '../../mongoose/schemas/product.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Returns aggregated stats for the admin dashboard:
   *  - totalSalesCents: sum of totalCents across DELIVERED orders
   *  - orderCountByStatus: count of orders grouped by status
   *  - topProducts: top-selling products by total units sold across all orders
   */
  async getStats() {
    // Total sales from delivered orders
    const salesAgg = await this.orderModel.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, total: { $sum: '$totalCents' } } },
    ]);
    const totalSalesCents = salesAgg[0]?.total ?? 0;

    // Order count grouped by status
    const statusAgg = await this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const orderCountByStatus = Object.fromEntries(statusAgg.map((g) => [g._id, g.count]));

    // Top-selling products by total units sold
    const topAgg = await this.orderModel.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', unitsSold: { $sum: '$items.quantity' } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
    ]);

    const productIds = topAgg.map((r) => r._id);
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean({ virtuals: true });
    const pMap = Object.fromEntries(products.map((p: any) => [p._id.toString(), p]));

    const topProducts = topAgg
      .filter((r) => pMap[r._id.toString()])
      .map((r) => ({
        productId: r._id.toString(),
        name: pMap[r._id.toString()].name,
        unitsSold: r.unitsSold,
        revenueCents: r.unitsSold * pMap[r._id.toString()].priceCents,
      }));

    return { totalSalesCents, orderCountByStatus, topProducts };
  }
}
