---
name: test-strategy
description: Testing strategy, test setup patterns, and complete test case specifications for the e-commerce platform (§13 of CLAUDE.md). Load before writing any test file.
---

# Testing Strategy

## Philosophy

Test the load-bearing logic — the stuff that costs real money when broken:
1. **Checkout transaction** — oversell or missing orders = revenue loss
2. **Authorization** — wrong role or missing ownership check = data breach
3. **Status transitions** — invalid state = broken fulfillment workflow
4. **Suggestions** — empty result = bad UX; wrong data = irrelevant noise

## Setup

### Test environment

Create a separate `.env.test`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ecommerce_test"
JWT_SECRET="test-jwt-secret-not-for-production"
```

Configure Jest to load it:
```javascript
// jest.config.js (in apps/api/)
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
};

// jest-e2e.config.js
module.exports = {
  ...require('./jest.config.js'),
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  setupFiles: ['dotenv/config'],  // loads .env.test
};
```

### App bootstrap helper

```typescript
// test/app.helper.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';

export async function createApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  const prisma = app.get(PrismaService);
  return { app, prisma };
}

export async function createUserAndLogin(
  app: INestApplication,
  prisma: PrismaService,
  role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER',
  email = `test-${Date.now()}@example.com`,
): Promise<{ token: string; userId: string }> {
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Test User',
      passwordHash: await bcrypt.hash('password123', 10),
      role,
    },
  });

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'password123' });

  return { token: res.body.token, userId: user.id };
}

export async function createProduct(prisma: PrismaService, overrides: Partial<any> = {}) {
  return prisma.product.create({
    data: {
      name: `Product ${Date.now()}`,
      description: 'Test product',
      priceCents: 1000,
      imageUrl: 'https://example.com/img.jpg',
      category: 'Electronics',
      stockQuantity: 10,
      ...overrides,
    },
  });
}
```

---

## Test Suite 1: Checkout (`checkout.e2e-spec.ts`)

```typescript
describe('POST /checkout', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createApp());
  });
  afterAll(async () => { await prisma.$disconnect(); await app.close(); });
  beforeEach(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    ({ token, userId } = await createUserAndLogin(app, prisma));
  });

  const shippingDto = {
    name: 'John Doe', addressLine1: '123 Test St',
    city: 'London', postalCode: 'EC1A 1BB', country: 'GB',
  };

  async function addToCart(productId: string, quantity: number) {
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity });
  }

  it('computes totalCents server-side from snapshotted prices', async () => {
    const product = await createProduct(prisma, { priceCents: 2500, stockQuantity: 5 });
    await addToCart(product.id, 2);

    const res = await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(201);

    expect(res.body.totalCents).toBe(5000); // 2500 * 2 — server computed
  });

  it('snapshots price at order time — later price change does not affect order', async () => {
    const product = await createProduct(prisma, { priceCents: 3000, stockQuantity: 5 });
    await addToCart(product.id, 1);
    const orderRes = await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(201);

    // Change product price after checkout
    await prisma.product.update({ where: { id: product.id }, data: { priceCents: 99999 } });

    const order = await prisma.order.findUnique({
      where: { id: orderRes.body.id }, include: { items: true },
    });
    expect(order.items[0].unitPriceCents).toBe(3000); // original price, not 99999
  });

  it('rejects when quantity exceeds stock (409)', async () => {
    const product = await createProduct(prisma, { stockQuantity: 2 });
    await addToCart(product.id, 3); // adding 3 with stock 2 (stock check is at checkout)

    const res = await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(409);

    expect(res.body.message).toContain('Insufficient stock');
  });

  it('does not decrement stock when checkout fails mid-transaction', async () => {
    const product1 = await createProduct(prisma, { stockQuantity: 5 });
    const product2 = await createProduct(prisma, { stockQuantity: 0 }); // out of stock
    await addToCart(product1.id, 1);
    await addToCart(product2.id, 1);

    await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(409);

    // product1's stock must NOT have been decremented (transaction rolled back)
    const p1 = await prisma.product.findUnique({ where: { id: product1.id } });
    expect(p1.stockQuantity).toBe(5);
  });

  it('decrements stock correctly after successful checkout', async () => {
    const product = await createProduct(prisma, { stockQuantity: 10 });
    await addToCart(product.id, 3);

    await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(201);

    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updated.stockQuantity).toBe(7);
  });

  it('clears the cart after successful checkout', async () => {
    const product = await createProduct(prisma, { stockQuantity: 10 });
    await addToCart(product.id, 1);

    await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(201);

    const cartRes = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(cartRes.body.items).toHaveLength(0);
  });

  it('rejects checkout with empty cart (422)', async () => {
    await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(shippingDto)
      .expect(422);
  });
});
```

---

## Test Suite 2: Authorization (`auth.e2e-spec.ts`)

```typescript
describe('Authorization', () => {
  // ... setup ...

  it('CUSTOMER token → GET /admin/orders returns 403', async () => {
    const { token } = await createUserAndLogin(app, prisma, 'CUSTOMER');
    await request(app.getHttpServer())
      .get('/admin/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('CUSTOMER token → GET /admin/dashboard/stats returns 403', async () => {
    const { token } = await createUserAndLogin(app, prisma, 'CUSTOMER');
    await request(app.getHttpServer())
      .get('/admin/dashboard/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('No token → GET /cart returns 401', async () => {
    await request(app.getHttpServer()).get('/cart').expect(401);
  });

  it('User A cannot access User B\'s order', async () => {
    const { token: tokenA, userId: userAId } = await createUserAndLogin(app, prisma, 'CUSTOMER', 'a@test.com');
    const { token: tokenB } = await createUserAndLogin(app, prisma, 'CUSTOMER', 'b@test.com');

    // Create an order belonging to User B via direct DB insert
    const product = await createProduct(prisma);
    const order = await prisma.order.create({
      data: {
        userId: /* userB.id — fetch from DB */ ...,
        status: 'PENDING', totalCents: 1000, paymentRef: null,
        name: 'B', addressLine1: '1 B St', city: 'B', postalCode: 'B1', country: 'GB',
      },
    });

    await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenA}`) // User A trying to read User B's order
      .expect(403);
  });

  it('ADMIN token → GET /admin/orders returns 200', async () => {
    const { token } = await createUserAndLogin(app, prisma, 'ADMIN');
    await request(app.getHttpServer())
      .get('/admin/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

---

## Test Suite 3: Status Transitions (`orders.e2e-spec.ts`)

```typescript
const VALID_TRANSITIONS = [
  ['PENDING', 'PROCESSING'],
  ['PENDING', 'CANCELLED'],
  ['PROCESSING', 'SHIPPED'],
  ['PROCESSING', 'CANCELLED'],
  ['SHIPPED', 'DELIVERED'],
];

const INVALID_TRANSITIONS = [
  ['PENDING', 'SHIPPED'],
  ['PENDING', 'DELIVERED'],
  ['DELIVERED', 'PENDING'],
  ['DELIVERED', 'PROCESSING'],
  ['CANCELLED', 'PROCESSING'],
  ['SHIPPED', 'PENDING'],
];

describe('Order status transitions (admin)', () => {
  it.each(VALID_TRANSITIONS)('%s → %s succeeds (200)', async (from, to) => {
    const order = await createOrderWithStatus(from);
    await request(app.getHttpServer())
      .patch(`/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: to })
      .expect(200);
  });

  it.each(INVALID_TRANSITIONS)('%s → %s fails (422)', async (from, to) => {
    const order = await createOrderWithStatus(from);
    const res = await request(app.getHttpServer())
      .patch(`/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: to })
      .expect(422);
    expect(res.body.message).toContain('Invalid status transition');
  });
});
```

---

## Test Suite 4: Suggestions (`suggestions.e2e-spec.ts`)

```typescript
describe('GET /me/suggestions', () => {
  it('returns products from purchased categories (excluding already bought)', async () => {
    // Setup: user bought product in Electronics
    // Expect: suggestions include other Electronics products, not the bought one
    const boughtProduct = await createProduct(prisma, { category: 'Electronics' });
    const relatedProduct = await createProduct(prisma, { category: 'Electronics', stockQuantity: 5 });
    await createOrderForUser(userId, [boughtProduct]);

    const res = await request(app.getHttpServer())
      .get('/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = res.body.map((p: any) => p.id);
    expect(ids).toContain(relatedProduct.id);
    expect(ids).not.toContain(boughtProduct.id);
  });

  it('cold-start user gets non-empty fallback (top-selling)', async () => {
    const { token } = await createUserAndLogin(app, prisma, 'CUSTOMER', 'coldstart@test.com');
    await createProduct(prisma, { stockQuantity: 10 }); // at least one in-stock product

    const res = await request(app.getHttpServer())
      .get('/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('out-of-stock products never appear in suggestions', async () => {
    const outOfStock = await createProduct(prisma, { stockQuantity: 0 });

    const res = await request(app.getHttpServer())
      .get('/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ids = res.body.map((p: any) => p.id);
    expect(ids).not.toContain(outOfStock.id);
  });
});
```

---

## Running

```bash
# From d:\e-commerce\apps\api\
npx jest --config jest-e2e.config.js                            # all e2e
npx jest --config jest-e2e.config.js checkout.e2e-spec          # single file
npx jest --config jest-e2e.config.js --verbose                  # see each test name
```

Expected output for passing suite:
```
PASS  test/checkout.e2e-spec.ts (8.2s)
PASS  test/auth.e2e-spec.ts (3.1s)
PASS  test/orders.e2e-spec.ts (5.6s)
PASS  test/suggestions.e2e-spec.ts (4.3s)

Test Suites: 4 passed, 4 total
Tests:       22 passed, 22 total
```
