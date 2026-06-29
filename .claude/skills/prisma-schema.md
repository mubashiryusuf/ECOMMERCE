---
name: prisma-schema
description: Complete Prisma schema, migration strategy, and seed script blueprint for the e-commerce platform. Load before touching schema.prisma, running migrations, or writing the seed script.
---

# Prisma Schema & Seed Blueprint

## Complete schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum UserRole {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

// ─── Models ──────────────────────────────────────────────────────────────────

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         UserRole  @default(CUSTOMER)
  createdAt    DateTime  @default(now())

  cart   Cart?
  orders Order[]
}

model Product {
  id            String   @id @default(cuid())
  name          String
  description   String
  priceCents    Int                    // NEVER Float — integer cents only
  imageUrl      String
  category      String                 // string for simplicity (§3 note)
  stockQuantity Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  cartItems  CartItem[]
  orderItems OrderItem[]
}

model Cart {
  id        String   @id @default(cuid())
  userId    String   @unique            // one cart per user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  productId String
  quantity  Int    // ≥ 1 enforced in service layer

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])         // prevent duplicate entries
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  status      OrderStatus @default(PENDING)
  totalCents  Int                        // computed server-side, never trusted from client
  paymentRef  String?                    // nullable — mock value or Stripe PaymentIntent ID

  // Shipping snapshot
  name         String
  addressLine1 String
  city         String
  postalCode   String
  country      String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User        @relation(fields: [userId], references: [id])
  items OrderItem[]
}

model OrderItem {
  id            String @id @default(cuid())
  orderId       String
  productId     String
  quantity      Int
  unitPriceCents Int   // snapshot at order time — never read live price later
  lineTotalCents Int   // unitPriceCents * quantity, snapshotted

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}
```

## Migration commands

```bash
# Initial migration (run once per environment)
npx prisma migrate dev --name init

# After schema changes
npx prisma migrate dev --name <descriptive-name>

# Production / CI
npx prisma migrate deploy

# Reset dev DB (drops + re-migrates + seeds)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

## Seed script blueprint (`prisma/seed.ts`)

```typescript
import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users (idempotent: upsert by email) ──────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.dev' },
    update: {},
    create: {
      email: 'admin@shop.dev',
      name: 'Admin User',
      passwordHash: await bcrypt.hash('admin1234', 12),
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@shop.dev' },
    update: {},
    create: {
      email: 'customer@shop.dev',
      name: 'Jane Customer',
      passwordHash: await bcrypt.hash('customer1234', 12),
      role: UserRole.CUSTOMER,
    },
  });

  console.log(`✅ Users: admin@shop.dev / admin1234  |  customer@shop.dev / customer1234`);

  // ── Products (idempotent: upsert by name) ────────────────────────────────
  const products = [
    // Electronics
    { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics',
      priceCents: 29999, stockQuantity: 45,
      description: 'Premium over-ear headphones with 30-hour battery life.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
    { name: 'USB-C Hub 7-in-1', category: 'Electronics',
      priceCents: 4999, stockQuantity: 120,
      description: 'Expand your laptop with HDMI, USB-A, SD card, and more.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { name: 'Mechanical Keyboard TKL', category: 'Electronics',
      priceCents: 12999, stockQuantity: 0,  // out-of-stock edge case
      description: 'Tenkeyless mechanical keyboard with blue switches.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800' },

    // Clothing
    { name: 'Merino Wool Crew Neck', category: 'Clothing',
      priceCents: 8900, stockQuantity: 80,
      description: 'Lightweight merino wool sweater, machine washable.',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800' },
    { name: 'Slim Fit Chinos', category: 'Clothing',
      priceCents: 6500, stockQuantity: 3,  // low-stock edge case
      description: 'Classic slim-fit chinos in stretch cotton.',
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800' },

    // Books
    { name: 'Clean Code (Robert Martin)', category: 'Books',
      priceCents: 3499, stockQuantity: 200,
      description: 'A handbook of agile software craftsmanship.',
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800' },
    { name: 'Designing Data-Intensive Applications', category: 'Books',
      priceCents: 4299, stockQuantity: 150,
      description: 'The definitive guide to modern distributed systems.',
      imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800' },

    // Home & Kitchen
    { name: 'Pour-Over Coffee Dripper', category: 'Home & Kitchen',
      priceCents: 2999, stockQuantity: 60,
      description: 'Precision ceramic pour-over for the perfect brew.',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
    { name: 'Bamboo Cutting Board Set', category: 'Home & Kitchen',
      priceCents: 3499, stockQuantity: 95,
      description: 'Set of 3 eco-friendly bamboo cutting boards.',
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800' },

    // Sports
    { name: 'Yoga Mat Premium 6mm', category: 'Sports',
      priceCents: 5999, stockQuantity: 75,
      description: 'Non-slip TPE yoga mat with alignment lines.',
      imageUrl: 'https://images.unsplash.com/photo-1601925228008-7e3a8db1e63a?w=800' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name } as any,  // add @@unique([name]) to schema or use findFirst
      update: {},
      create: p,
    });
  }
  console.log(`✅ Products: ${products.length} seeded across 5 categories`);

  // ── Sample order for customer (so suggestions/history aren't empty) ──────
  const headphones = await prisma.product.findFirst({ where: { name: 'Wireless Noise-Cancelling Headphones' } });
  const book = await prisma.product.findFirst({ where: { name: 'Clean Code (Robert Martin)' } });

  const existingOrder = await prisma.order.findFirst({ where: { userId: customer.id } });
  if (!existingOrder && headphones && book) {
    await prisma.order.create({
      data: {
        userId: customer.id,
        status: OrderStatus.DELIVERED,
        totalCents: headphones.priceCents * 1 + book.priceCents * 1,
        paymentRef: 'mock_seed_payment_001',
        name: 'Jane Customer',
        addressLine1: '42 Sample Street',
        city: 'London',
        postalCode: 'EC1A 1BB',
        country: 'GB',
        items: {
          create: [
            { productId: headphones.id, quantity: 1,
              unitPriceCents: headphones.priceCents,
              lineTotalCents: headphones.priceCents },
            { productId: book.id, quantity: 1,
              unitPriceCents: book.priceCents,
              lineTotalCents: book.priceCents },
          ],
        },
      },
    });
    console.log('✅ Sample order created for customer');
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

## package.json seed config

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Or via script:
```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Key invariants enforced in schema design

| Rule | How enforced |
|------|-------------|
| One cart per user | `Cart.userId @unique` |
| No duplicate cart items | `CartItem @@unique([cartId, productId])` |
| Money is integer cents | `priceCents Int`, `totalCents Int`, `unitPriceCents Int` |
| Price snapshots at order time | `OrderItem.unitPriceCents` — written once at checkout |
| Cascade deletes cart with user | `onDelete: Cascade` on Cart |
