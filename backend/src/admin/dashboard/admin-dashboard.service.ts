import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns aggregated stats for the admin dashboard:
   *  - totalSalesCents: sum of totalCents across DELIVERED orders
   *  - ordersByStatus: count of orders grouped by status
   *  - topProducts: top-selling products by total units sold across all orders
   */
  async getStats() {
    // Total sales from delivered orders (in cents — integer)
    const salesAgg = await this.prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalCents: true },
    });
    const totalSalesCents = salesAgg._sum.totalCents ?? 0;

    // Order count grouped by status
    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const ordersByStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count._all]),
    );

    // Top-selling products by total units sold
    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = topProductsRaw.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const topProducts = topProductsRaw;

    return {
      totalSalesCents,
      orderCountByStatus: ordersByStatus,
      topProducts: topProducts
        .filter((r) => !!productMap[r.productId])
        .map((r) => ({
          productId: r.productId,
          name: productMap[r.productId].name,
          unitsSold: r._sum.quantity ?? 0,
          revenueCents: (r._sum.quantity ?? 0) * productMap[r.productId].priceCents,
        })),
    };
  }
}
