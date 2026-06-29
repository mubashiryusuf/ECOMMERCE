import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from '../mongoose/schemas/favorite.schema';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /** Returns all favorited products for the given user (populated, with virtual id). */
  async getFavorites(userId: string): Promise<any[]> {
    const favorites = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('productId')
      .exec();

    return favorites
      .filter((f) => f.productId != null)
      .map((f) => {
        const product = f.productId as unknown as ProductDocument;
        return product.toJSON();
      });
  }

  /**
   * Adds a product to the user's favorites.
   * Silently ignores duplicate (already-favorited) entries.
   * Throws NotFoundException if the product does not exist.
   */
  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<void> {
    const product = await this.productModel.findById(dto.productId).exec();
    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    await this.favoriteModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          productId: new Types.ObjectId(dto.productId),
        },
        {
          userId: new Types.ObjectId(userId),
          productId: new Types.ObjectId(dto.productId),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  /** Removes a product from the user's favorites. */
  async removeFavorite(userId: string, productId: string): Promise<void> {
    await this.favoriteModel
      .findOneAndDelete({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
      })
      .exec();
  }
}
