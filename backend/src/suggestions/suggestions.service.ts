import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuggestionsService {
  constructor(private prisma: PrismaService) {}

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
    // Collect this user's order items
    const userOrderItems = await this.prisma.orderItem.findMany({
      where: { order: { userId } },
      select: { productId: true },
    });

    const purchasedProductIds = [...new Set(userOrderItems.map((oi) => oi.productId))];

    if (purchasedProductIds.length === 0) {
      // Cold-start fallback: top-selling in-stock products
      return this.coldStartSuggestions();
    }

    // Get categories from purchased products
    const purchasedProducts = await this.prisma.product.findMany({
      where: { id: { in: purchasedProductIds } },
      select: { category: true },
    });

    const categories = [...new Set(purchasedProducts.map((p) => p.category))];

    // Find in-stock products in those categories, excluding already purchased
    const candidates = await this.prisma.product.findMany({
      where: {
        category: { in: categories },
        id: { notIn: purchasedProductIds },
        stockQuantity: { gt: 0 },
      },
      include: {
        orderItems: { select: { quantity: true } },
      },
    });

    // Rank by total units sold
    const ranked = candidates
      .map((p) => ({
        ...p,
        totalSold: p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Strip internal orderItems from the response
    return ranked.map(({ orderItems: _omit, ...product }) => product);
  }

  private async coldStartSuggestions() {
    const products = await this.prisma.product.findMany({
      where: { stockQuantity: { gt: 0 } },
      include: { orderItems: { select: { quantity: true } } },
    });

    const ranked = products
      .map((p) => ({
        ...p,
        totalSold: p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
      }))
      .sort((a, b) => b.totalSold - a.totalSold || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return ranked.map(({ orderItems: _omit, ...product }) => product);
  }
}
