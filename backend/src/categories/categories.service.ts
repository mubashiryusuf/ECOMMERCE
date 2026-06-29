import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../mongoose/schemas/category.schema';
import { CreateCategoryDto } from '../admin/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../admin/categories/dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel
      .findOne({ name: { $regex: `^${dto.name}$`, $options: 'i' } })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }
    return this.categoryModel.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    if (dto.name) {
      const duplicate = await this.categoryModel
        .findOne({ name: { $regex: `^${dto.name}$`, $options: 'i' }, _id: { $ne: id } })
        .exec();
      if (duplicate) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
    }
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Category ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!existing) throw new NotFoundException(`Category ${id} not found`);
  }
}
