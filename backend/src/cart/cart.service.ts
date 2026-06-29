import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /** Finds or creates the active cart for the given user. */
  private async findOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /** Builds and returns the full cart response shape expected by the frontend. */
  private async buildCartResponse(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return { id: null, userId, items: [], totalCents: 0 };
    }

    const items = cart.items.map((item) => ({
      ...item,
      lineTotalCents: item.quantity * item.product.priceCents,
    }));

    const totalCents = items.reduce((sum, i) => sum + i.lineTotalCents, 0);
    return { ...cart, items, totalCents };
  }

  async getCart(userId: string) {
    return this.buildCartResponse(userId);
  }

  async addItem(userId: string, dto: AddItemDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const cart = await this.findOrCreateCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    const newQty = (existing?.quantity ?? 0) + dto.quantity;
    if (newQty > product.stockQuantity) {
      throw new ConflictException(`Insufficient stock. Available: ${product.stockQuantity}`);
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
      update: { quantity: newQty },
      create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
    });

    return this.buildCartResponse(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);
    if (item.cart.userId !== userId) throw new ForbiddenException('Not your cart item');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (dto.quantity > item.product.stockQuantity) {
        throw new ConflictException(`Insufficient stock. Available: ${item.product.stockQuantity}`);
      }

      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity },
      });
    }

    return this.buildCartResponse(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);
    if (item.cart.userId !== userId) throw new ForbiddenException('Not your cart item');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.buildCartResponse(userId);
  }
}
