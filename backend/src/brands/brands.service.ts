import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../mongoose/schemas/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async listBrands(): Promise<BrandDocument[]> {
    return this.brandModel.find().sort({ name: 1 }).exec();
  }

  async createBrand(dto: CreateBrandDto): Promise<BrandDocument> {
    return this.brandModel.create(dto);
  }

  async updateBrand(id: string, dto: UpdateBrandDto): Promise<BrandDocument> {
    const updated = await this.brandModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Brand ${id} not found`);
    return updated;
  }

  async deleteBrand(id: string): Promise<void> {
    const existing = await this.brandModel.findByIdAndDelete(id).exec();
    if (!existing) throw new NotFoundException(`Brand ${id} not found`);
  }
}
