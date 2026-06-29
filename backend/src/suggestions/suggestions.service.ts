import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../mongoose/schemas/order.schema';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Returns personalized product suggestions for the user.
   *
   * Personalized path (user has order history):
   *   1. Collect distinct productIds from the user's OrderItems
   *   2. Collect distinct categories from those products
   *   3. Query in-stock products in those categories, excluding purchased productIds
   *   4. Rank by total units sold across all orders (popularity)
   *   5. Return top 10
   *
   * Cold-start fallback (no order history):
   *   1. Return top 10 in-stock products ranked by total units sold
   *   2. Tie-break by createdAt DESC (newest)
   */
  async getSuggestions(userId: string) {
    const userOrders = await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean({ virtuals: true });

    const purchasedProductIds = [
      ...new Set(
        (userOrders as any[]).flatMap((o) => o.items.map((i: any) => i.productId.toString())),
      ),
    ];

    if (purchasedProductIds.length === 0) return this.coldStartSuggestions();

    const purchasedProducts = await this.productModel
      .find({ _id: { $in: purchasedProductIds } })
      .lean({ virtuals: true });
    const categories = [...new Set(purchasedProducts.map((p: any) => p.category))];

    const candidates = await this.productModel
      .find({
        category: { $in: categories },
        _id: { $nin: purchasedProductIds },
        stockQuantity: { $gt: 0 },
      })
      .lean({ virtuals: true });

    // Rank by total units sold across all orders
    const allOrders = await this.orderModel.find().lean({ virtuals: true });
    const salesMap: Record<string, number> = {};
    for (const order of allOrders as any[]) {
      for (const item of order.items) {
        const pid = item.productId.toString();
        salesMap[pid] = (salesMap[pid] ?? 0) + item.quantity;
      }
    }

    const ranked = candidates
      .map((p: any) => ({
        ...p,
        id: p._id.toString(),
        _id: undefined,
        __v: undefined,
        totalSold: salesMap[p._id.toString()] ?? 0,
      }))
      .sort((a: any, b: any) => b.totalSold - a.totalSold)
      .slice(0, 10)
      .map(({ totalSold: _omit, ...p }: any) => p);

    return ranked;
  }

  private async coldStartSuggestions() {
    const allOrders = await this.orderModel.find().lean({ virtuals: true });
    const salesMap: Record<string, number> = {};
    for (const order of allOrders as any[]) {
      for (const item of (order as any).items) {
        const pid = item.productId.toString();
        salesMap[pid] = (salesMap[pid] ?? 0) + item.quantity;
      }
    }

    const products = await this.productModel
      .find({ stockQuantity: { $gt: 0 } })
      .lean({ virtuals: true });

    const ranked = products
      .map((p: any) => ({
        ...p,
        id: p._id.toString(),
        _id: undefined,
        __v: undefined,
        totalSold: salesMap[p._id.toString()] ?? 0,
      }))
      .sort(
        (a: any, b: any) =>
          b.totalSold - a.totalSold ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10)
      .map(({ totalSold: _omit, ...p }: any) => p);

    return ranked;
  }
}
