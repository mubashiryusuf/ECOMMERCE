import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';
import { QueryProductsDto, SortOption } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async findAll(query: QueryProductsDto) {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = query;

    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.priceCents = {};
      if (minPrice !== undefined) filter.priceCents.$gte = minPrice;
      if (maxPrice !== undefined) filter.priceCents.$lte = maxPrice;
    }

    const sortMap: any =
      sort === SortOption.PRICE_ASC ? { priceCents: 1 }
      : sort === SortOption.PRICE_DESC ? { priceCents: -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort(sortMap).skip((page - 1) * limit).limit(limit).lean({ virtuals: true }),
      this.productModel.countDocuments(filter),
    ]);

    const mapped = items.map((p: any) => ({ ...p, id: p._id.toString(), _id: undefined, __v: undefined }));
    return { items: mapped, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).lean({ virtuals: true });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return { ...(product as any), id: (product as any)._id.toString(), _id: undefined, __v: undefined };
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category');
  }

  async getRelated(id: string) {
    const product = await this.findOne(id);
    const items = await this.productModel
      .find({ category: product.category, _id: { $ne: id }, stockQuantity: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean({ virtuals: true });
    return items.map((p: any) => ({ ...p, id: p._id.toString(), _id: undefined, __v: undefined }));
  }
}
