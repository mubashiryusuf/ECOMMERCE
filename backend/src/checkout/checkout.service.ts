import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  /**
   * Transactional checkout:
   * 1. Re-read cart and lock product rows
   * 2. Validate stock for every item — reject with 409 if any item exceeds stock
   * 3. Compute totalCents server-side (never trust client total)
   * 4. Decrement stockQuantity for each product
   * 5. Create Order + OrderItems (snapshot unitPriceCents + lineTotalCents)
   * 6. Clear CartItems
   * 7. Mock payment: paymentRef = `mock_${Date.now()}_${userId}`
   * 8. Return populated order
   */
  async checkout(userId: string, dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Step 1 & 2: Re-validate stock
      for (const item of cart.items) {
        if (item.quantity > item.product.stockQuantity) {
          throw new ConflictException(
            `Insufficient stock for "${item.product.name}". Available: ${item.product.stockQuantity}, requested: ${item.quantity}`,
          );
        }
      }

      // Step 3: Compute total server-side
      const totalCents = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.priceCents,
        0,
      );

      // Step 4: Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Step 7: Mock payment reference
      const paymentRef = `mock_${Date.now()}_${userId}`;

      // Step 5: Create Order + OrderItems (snapshotted prices)
      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          paymentRef,
          name: dto.name,
          addressLine1: dto.addressLine1,
          city: dto.city,
          postalCode: dto.postalCode,
          country: dto.country,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.product.priceCents,
              lineTotalCents: item.quantity * item.product.priceCents,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Step 6: Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }
}
