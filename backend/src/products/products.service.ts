import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductsDto, SortOption } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    // TODO: search/filter/sort/paginate — return { items, total, page, limit }
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = query;

    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceCents = {};
      if (minPrice !== undefined) where.priceCents.gte = minPrice;
      if (maxPrice !== undefined) where.priceCents.lte = maxPrice;
    }

    const orderBy: any =
      sort === SortOption.PRICE_ASC ? { priceCents: 'asc' }
      : sort === SortOption.PRICE_DESC ? { priceCents: 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    // TODO: return full product or 404
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async getCategories(): Promise<string[]> {
    // TODO: distinct categories
    const results = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return results.map((r) => r.category);
  }

  async getRelated(id: string) {
    // TODO: same-category products ranked by popularity, exclude self
    const product = await this.findOne(id);
    return this.prisma.product.findMany({
      where: { category: product.category, id: { not: id }, stockQuantity: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
