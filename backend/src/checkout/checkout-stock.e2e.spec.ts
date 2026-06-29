/**
 * Integration test: Checkout stock-overflow guard
 *
 * Verifies two scenarios end-to-end through the full NestJS HTTP stack:
 *
 * 1. Stock-race guard — if stockQuantity drops to 0 between "add to cart" and
 *    "checkout", the POST /api/checkout returns HTTP 400 with a message
 *    containing "Insufficient stock for item".
 *
 * 2. Happy-path checkout — when stock is available, POST /api/checkout returns
 *    201 (NestJS default for POST), the order has the correct shape, prices are
 *    snapshotted, and the cart is empty afterwards.
 *
 * Technique: The Product Mongoose model is obtained via app.get(getModelToken)
 * so we can manipulate stockQuantity directly in the DB to simulate a race
 * condition, without touching the HTTP API for that step.
 *
 * The global prefix is "api" (set in main.ts). Tests mirror the bootstrap
 * config from main.ts so guards and pipes behave identically to the live server.
 *
 * Seeded customer: customer@example.com / Customer1234!
 * Seeded product used: "Desk Lamp" (stockQuantity: 5 in seed)
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { Product } from '../mongoose/schemas/product.schema';

const SHIPPING_PAYLOAD = {
  name: 'Test User',
  addressLine1: '123 Main St',
  city: 'London',
  postalCode: 'SW1A 1AA',
  country: 'UK',
};

describe('Checkout stock-overflow guard', () => {
  let app: INestApplication;
  let productModel: Model<Product & Document>;
  let customerToken: string;
  let deskLampId: string;

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Mirror main.ts bootstrap exactly so guards/pipes/filters behave the same.
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    productModel = app.get(getModelToken(Product.name));

    // Login as the seeded customer.
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'Customer1234!' })
      .expect(200);

    customerToken = loginRes.body.token;
    expect(typeof customerToken).toBe('string');
    expect(customerToken.length).toBeGreaterThan(0);

    // Resolve the Desk Lamp product id from the live endpoint.
    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: 'Desk Lamp' })
      .expect(200);

    const items: any[] = productsRes.body.items ?? productsRes.body;
    const deskLamp = items.find((p: any) => p.name.toLowerCase().includes('desk lamp'));
    expect(deskLamp).toBeDefined();
    deskLampId = deskLamp.id;
  });

  afterAll(async () => {
    // Restore Desk Lamp stock to seed value so other test runs start clean.
    await productModel.findByIdAndUpdate(deskLampId, { stockQuantity: 5 });
    await app.close();
  });

  // ─── Shared helper ────────────────────────────────────────────────────────

  /** Clear every item from the customer's cart via the HTTP API. */
  async function clearCart() {
    const cartRes = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const items: any[] = cartRes.body.items ?? [];
    for (const item of items) {
      await request(app.getHttpServer())
        .delete(`/api/cart/items/${item.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
    }
  }

  // ─── Test 1: Stock-race → 400 ────────────────────────────────────────────

  it('returns 400 with "Insufficient stock for item" when stock is depleted after cart add (race condition)', async () => {
    // Step A: ensure a known stock level.
    await productModel.findByIdAndUpdate(deskLampId, { stockQuantity: 2 });

    // Step B: clean the cart so we start from zero.
    await clearCart();

    // Step C: add Desk Lamp qty=1 — stock is 2, so cart service allows it.
    const addRes = await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: deskLampId, quantity: 1 });

    expect([200, 201]).toContain(addRes.status);

    // Step D: simulate race — another customer buys out the remaining stock.
    await productModel.findByIdAndUpdate(deskLampId, { stockQuantity: 0 });

    // Step E: attempt checkout — should be rejected.
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(SHIPPING_PAYLOAD);

    // The checkout service throws BadRequestException → HttpExceptionFilter → 400.
    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.statusCode).toBe(400);

    const bodyString = JSON.stringify(checkoutRes.body);
    expect(bodyString).toContain('Insufficient stock for item');
  });

  // ─── Test 2: Happy-path checkout ─────────────────────────────────────────

  it('returns 201 with a populated order and clears the cart when stock is sufficient', async () => {
    // Step A: restore ample stock.
    await productModel.findByIdAndUpdate(deskLampId, { stockQuantity: 5 });

    // Step B: start from a clean cart.
    await clearCart();

    // Look up the current price so we can assert the snapshot later.
    const product = await productModel.findById(deskLampId).lean();
    const expectedUnitPrice = (product as any).priceCents;

    // Step C: add Desk Lamp qty=1.
    const addRes = await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: deskLampId, quantity: 1 });

    expect([200, 201]).toContain(addRes.status);

    // Step D: submit checkout.
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(SHIPPING_PAYLOAD);

    // NestJS returns 201 by default for POST handlers.
    expect([200, 201]).toContain(checkoutRes.status);

    const order = checkoutRes.body;

    // Order shape.
    expect(typeof order.id).toBe('string');
    expect(order.id.length).toBeGreaterThan(0);
    expect(order.status).toBe('PENDING');

    // Price snapshot: unitPriceCents in the order item must equal the product
    // price at order time (not a live read, and not client-submitted).
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBe(1);
    expect(order.items[0].unitPriceCents).toBe(expectedUnitPrice);

    // Total computed server-side from snapshot.
    expect(order.totalCents).toBe(expectedUnitPrice * 1);

    // Step E: cart must be empty after successful checkout.
    const cartRes = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const cartItems: any[] = cartRes.body.items ?? [];
    expect(cartItems.length).toBe(0);

    // Step F: confirm stockQuantity was decremented in the DB.
    const updatedProduct = await productModel.findById(deskLampId).lean();
    expect((updatedProduct as any).stockQuantity).toBe(4); // 5 - 1
  });
});
