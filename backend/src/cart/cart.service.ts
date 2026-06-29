import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../mongoose/schemas/cart.schema';
import { Product, ProductDocument } from '../mongoose/schemas/product.schema';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /** Finds or creates the active cart for the given user. */
  private async findOrCreateCart(userId: string) {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId), items: [] } },
      { upsert: true, new: true },
    );
    return cart;
  }

  /** Builds and returns the full cart response shape expected by the frontend. */
  private async buildCartResponse(userId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).lean({ virtuals: true });
    if (!cart) return { id: null, userId, items: [], totalCents: 0 };

    const productIds = (cart.items as any[]).map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean({ virtuals: true });
    const productMap = Object.fromEntries(products.map((p: any) => [p._id.toString(), p]));

    const items = (cart.items as any[]).map((item) => {
      const prod = productMap[item.productId.toString()];
      return {
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        product: prod ? { ...prod, id: prod._id.toString(), _id: undefined, __v: undefined } : null,
        lineTotalCents: item.quantity * (prod?.priceCents ?? 0),
      };
    });

    const totalCents = items.reduce((sum, i) => sum + i.lineTotalCents, 0);
    return { id: (cart as any)._id.toString(), userId, items, totalCents };
  }

  async getCart(userId: string) {
    return this.buildCartResponse(userId);
  }

  async addItem(userId: string, dto: AddItemDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const cart = await this.findOrCreateCart(userId);
    const existingItem = (cart.items as any[]).find((i) => i.productId.toString() === dto.productId);
    const newQty = (existingItem?.quantity ?? 0) + dto.quantity;

    if (newQty > product.stockQuantity) {
      throw new ConflictException(`Insufficient stock. Available: ${product.stockQuantity}`);
    }

    if (existingItem) {
      await this.cartModel.updateOne(
        { userId: new Types.ObjectId(userId), 'items._id': existingItem._id },
        { $set: { 'items.$.quantity': newQty } },
      );
    } else {
      await this.cartModel.updateOne(
        { userId: new Types.ObjectId(userId) },
        { $push: { items: { productId: new Types.ObjectId(dto.productId), quantity: dto.quantity } } },
      );
    }

    return this.buildCartResponse(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = (cart.items as any[]).find((i) => i._id.toString() === itemId);
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);

    if (dto.quantity === 0) {
      await this.cartModel.updateOne(
        { userId: new Types.ObjectId(userId) },
        { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
      );
    } else {
      const product = await this.productModel.findById(item.productId);
      if (product && dto.quantity > product.stockQuantity) {
        throw new ConflictException(`Insufficient stock. Available: ${product.stockQuantity}`);
      }
      await this.cartModel.updateOne(
        { userId: new Types.ObjectId(userId), 'items._id': new Types.ObjectId(itemId) },
        { $set: { 'items.$.quantity': dto.quantity } },
      );
    }

    return this.buildCartResponse(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = (cart.items as any[]).find((i) => i._id.toString() === itemId);
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);

    await this.cartModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
    );

    return this.buildCartResponse(userId);
  }
}
