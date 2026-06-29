/**
 * Integration test: Personalized product suggestions
 *
 * Tests two scenarios for GET /api/me/suggestions:
 *
 * 1. Cold-start — a brand new customer with zero order history receives
 *    a non-empty list of in-stock products (the popularity-based fallback).
 *    The response must never be empty even when the user has no history.
 *
 * 2. Personalized — a customer who has placed an order in a known category
 *    receives suggestions from that category, excluding products they have
 *    already purchased.
 *
 * Also verifies:
 * - Unauthenticated request to GET /api/me/suggestions → 401
 * - Suggestions only contain in-stock products (stockQuantity > 0)
 *
 * Technique: fresh user accounts are registered per test run to avoid
 * coupling to the pre-seeded customer's order history.
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

const SHIPPING = {
  name: 'Suggestion Tester',
  addressLine1: '1 Test Street',
  city: 'Manchester',
  postalCode: 'M1 1AA',
  country: 'UK',
};

describe('Personalized product suggestions (GET /api/me/suggestions)', () => {
  let app: INestApplication;

  // ─── Bootstrap ─────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());

  // ─── Unauthenticated ──────────────────────────────────────────────────────

  it('returns 401 without an auth token', async () => {
    const res = await request(app.getHttpServer()).get('/api/me/suggestions');
    expect(res.status).toBe(401);
  });

  // ─── Cold-start fallback ──────────────────────────────────────────────────

  it('returns a non-empty list for a brand-new user with no order history', async () => {
    // Register a completely fresh user
    const email = `cold_start_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, name: 'Cold Start User', password: 'Test1234!' })
      .expect(201);

    const token: string = signupRes.body.token;
    expect(token).toBeTruthy();

    const res = await request(app.getHttpServer())
      .get('/api/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Should return an array (may be empty only if the DB has zero products,
    // but the seeded database always has products)
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ─── Cold-start: only in-stock items returned ─────────────────────────────

  it('cold-start response contains only in-stock products (stockQuantity > 0)', async () => {
    const email = `cold_stock_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, name: 'Stock Check User', password: 'Test1234!' })
      .expect(201);

    const token: string = signupRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/api/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const items: any[] = res.body;
    // Every suggestion must have stock
    for (const item of items) {
      expect(item.stockQuantity).toBeGreaterThan(0);
    }
  });

  // ─── Personalized path ────────────────────────────────────────────────────

  it('returns category-filtered suggestions after the user purchases a product', async () => {
    // Step 1: register fresh customer
    const email = `personalized_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, name: 'Personalized User', password: 'Test1234!' })
      .expect(201);
    const token: string = signupRes.body.token;

    // Step 2: find any in-stock product and note its category
    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ limit: 20 })
      .expect(200);
    const inStockProducts: any[] = (productsRes.body.items as any[]).filter(
      (p: any) => p.stockQuantity > 0,
    );
    expect(inStockProducts.length).toBeGreaterThan(0);
    const targetProduct = inStockProducts[0];
    const purchasedCategory: string = targetProduct.category;

    // Step 3: add to cart
    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: targetProduct.id, quantity: 1 })
      .expect((r) => expect([200, 201]).toContain(r.status));

    // Step 4: checkout — creates order history for this user
    await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(SHIPPING)
      .expect((r) => expect([200, 201]).toContain(r.status));

    // Step 5: request suggestions
    const res = await request(app.getHttpServer())
      .get('/api/me/suggestions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const suggestions: any[] = res.body;

    // Suggestions array must not contain the product the user just bought
    const containsPurchased = suggestions.some((s: any) => s.id === targetProduct.id);
    expect(containsPurchased).toBe(false);

    // If suggestions are non-empty, they should be from the purchased category
    // (personalized path), or from any category (cold-start if same category
    // has no other in-stock products). This is valid in both cases.
    if (suggestions.length > 0) {
      // All returned products must be in-stock
      for (const s of suggestions) {
        expect(s.stockQuantity).toBeGreaterThan(0);
      }
    }

    // When other products exist in the same category, at least some should match
    const otherInCategory = inStockProducts.filter(
      (p: any) => p.category === purchasedCategory && p.id !== targetProduct.id,
    );
    if (otherInCategory.length > 0 && suggestions.length > 0) {
      const hasCategoryMatch = suggestions.some((s: any) => s.category === purchasedCategory);
      expect(hasCategoryMatch).toBe(true);
    }
  });

  // ─── Cross-user order isolation ────────────────────────────────────────────

  it('user cannot access another user\'s order (GET /api/orders/:id → 404)', async () => {
    // User A: register, add to cart, checkout → order A
    const emailA = `user_a_${Date.now()}@example.com`;
    const signupA = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: emailA, name: 'User A', password: 'Test1234!' })
      .expect(201);
    const tokenA: string = signupA.body.token;

    const productsRes = await request(app.getHttpServer())
      .get('/api/products').query({ limit: 5 }).expect(200);
    const inStock = (productsRes.body.items as any[]).find((p: any) => p.stockQuantity > 0);
    expect(inStock).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ productId: inStock.id, quantity: 1 })
      .expect((r) => expect([200, 201]).toContain(r.status));

    const checkoutA = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(SHIPPING)
      .expect((r) => expect([200, 201]).toContain(r.status));
    const orderAId: string = checkoutA.body.id;

    // User B: register (no orders)
    const emailB = `user_b_${Date.now()}@example.com`;
    const signupB = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: emailB, name: 'User B', password: 'Test1234!' })
      .expect(201);
    const tokenB: string = signupB.body.token;

    // User B tries to read User A's order — must be 403 or 404
    const res = await request(app.getHttpServer())
      .get(`/api/orders/${orderAId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect([403, 404]).toContain(res.status);
  });
});
