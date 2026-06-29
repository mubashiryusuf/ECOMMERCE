import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../mongoose/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto) {
    const product = await this.productModel.create(dto);
    return { ...product.toJSON(), id: product._id.toString() };
  }

  async update(id: string, dto: UpdateProductDto) {
    const updated = await this.productModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException(`Product ${id} not found`);
    return { ...updated.toJSON(), id: updated._id.toString() };
  }

  async remove(id: string) {
    const existing = await this.productModel.findByIdAndDelete(id);
    if (!existing) throw new NotFoundException(`Product ${id} not found`);
    return { deleted: true };
  }
}
