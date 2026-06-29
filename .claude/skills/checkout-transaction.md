---
name: checkout-transaction
description: Step-by-step implementation guide for the transactional checkout flow — the most critical path in the platform. Load before implementing POST /checkout or its tests.
---

# Transactional Checkout Implementation

The checkout is the most critical path in the platform. Every step must be atomic. A failure at any point leaves the system in its original state.

## Why a transaction is required

Without a transaction:
- Stock might be decremented but the order never created (money taken, no record)
- Two simultaneous purchases of the last unit could both succeed (oversell)
- Cart might be cleared before the order is committed

With a transaction: all-or-nothing. Either the order exists, stock is decremented, and the cart is empty — or none of it happened.

## Implementation (NestJS + Prisma interactive transaction)

```typescript
// checkout.service.ts
async checkout(userId: string, dto: CheckoutDto): Promise<Order> {
  return this.prisma.$transaction(async (tx) => {

    // 1. Load the user's cart with items and products
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException('Cart is empty');
    }

    // 2. Re-validate stock for every item (critical — user may have had cart open for hours)
    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for "${item.product.name}". ` +
          `Available: ${item.product.stockQuantity}, Requested: ${item.quantity}`
        );
      }
    }

    // 3. Compute total server-side — NEVER trust client-submitted amounts
    const totalCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0
    );

    // 4. Mock payment (clearly labeled)
    // MOCK: In production this would call Stripe's PaymentIntent API.
    // Test-mode only — no real money moves.
    const paymentRef = `mock_${Date.now()}_${userId.slice(0, 8)}`;

    // 5. Decrement stock for each product
    await Promise.all(
      cart.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      )
    );

    // 6. Create the order with snapshotted prices
    const order = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
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
            unitPriceCents: item.product.priceCents,      // snapshot
            lineTotalCents: item.product.priceCents * item.quantity, // snapshot
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // 7. Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
```

## DTO (class-validator)

```typescript
// dto/checkout.dto.ts
import { IsString, MinLength, Length } from 'class-validator';

export class CheckoutDto {
  @IsString() @MinLength(2)  name: string;
  @IsString() @MinLength(5)  addressLine1: string;
  @IsString() @MinLength(2)  city: string;
  @IsString() @MinLength(3)  postalCode: string;
  @IsString() @Length(2, 2)  country: string;
}
```

## Error catalogue

| Condition | Status | Message pattern |
|-----------|--------|-----------------|
| Cart is empty | 422 | "Cart is empty" |
| Item stock < quantity | 409 | "Insufficient stock for \"X\". Available: N, Requested: M" |
| Product deleted since added to cart | 404 | "Product \"X\" is no longer available" |

## Price snapshot verification

After creating the order, verify in tests:
```typescript
// Change product price after checkout
await prisma.product.update({ where: { id }, data: { priceCents: 99999 } });
// Order still shows original price
const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
expect(order.items[0].unitPriceCents).toBe(originalPrice); // NOT 99999
```

## Transaction failure modes to test

1. **Single item over stock** → 409, no order created, stock unchanged
2. **Second item over stock (first OK)** → 409, no order created, FIRST item's stock unchanged too
3. **Empty cart** → 422, no order created
4. **Concurrent purchases** → only one succeeds (Postgres row-level locking via transaction handles this)
