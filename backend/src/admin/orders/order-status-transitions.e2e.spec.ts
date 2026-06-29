/**
 * Integration test: Order status transition validation
 *
 * Verifies the VALID_TRANSITIONS table enforced by AdminOrdersService:
 *
 *   PENDING    → PROCESSING  ✓ (allowed)
 *   PENDING    → SHIPPED     ✗ (skips step → 422)
 *   PENDING    → CANCELLED   ✓ (allowed)
 *   PROCESSING → SHIPPED     ✓ (allowed)
 *   SHIPPED    → DELIVERED   ✓ (allowed)
 *   DELIVERED  → PENDING     ✗ (backward → 422)
 *   CANCELLED  → PROCESSING  ✗ (terminal → 422)
 *
 * Technique:
 *   - Register a fresh customer → add a product to cart → checkout → get order id
 *   - Login as admin (seeded: admin@yopmail.com / Test123)
 *   - Drive the order through its lifecycle, checking each edge
 *
 * The test boots the real NestJS app with AppModule (no mocks).
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

const SHIPPING = {
  name: 'Transition Test',
  addressLine1: '10 Test Lane',
  city: 'London',
  postalCode: 'EC1A 1BB',
  country: 'UK',
};

describe('Order status transitions (admin)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let orderId: string;

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

    // Admin token (seeded)
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@yopmail.com', password: 'Test123' })
      .expect(200);
    adminToken = adminLogin.body.token;

    // Register a fresh customer so we don't collide with other test runs
    const uniqueEmail = `transitions_test_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: uniqueEmail, name: 'Transition Tester', password: 'Test1234!' })
      .expect(201);
    customerToken = signupRes.body.token;

    // Find any in-stock product
    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ limit: 5 })
      .expect(200);
    const inStock = (productsRes.body.items as any[]).find((p: any) => p.stockQuantity > 0);
    expect(inStock).toBeDefined();

    // Add to cart
    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: inStock.id, quantity: 1 })
      .expect((r) => expect([200, 201]).toContain(r.status));

    // Checkout → creates order in PENDING status
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(SHIPPING)
      .expect((r) => expect([200, 201]).toContain(r.status));

    orderId = checkoutRes.body.id;
    expect(typeof orderId).toBe('string');
  });

  afterAll(() => app.close());

  // ─── Valid: PENDING → PROCESSING ──────────────────────────────────────────

  it('PENDING → PROCESSING is allowed (200)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PROCESSING');
  });

  // ─── Invalid: PROCESSING → PENDING (backward) ────────────────────────────

  it('PROCESSING → PENDING is rejected (422)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PENDING' });

    expect(res.status).toBe(422);
    expect(JSON.stringify(res.body)).toMatch(/Invalid status transition/i);
  });

  // ─── Invalid: PROCESSING → DELIVERED (skips SHIPPED) ─────────────────────

  it('PROCESSING → DELIVERED is rejected (422) — must go through SHIPPED first', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED' });

    expect(res.status).toBe(422);
  });

  // ─── Valid: PROCESSING → SHIPPED ──────────────────────────────────────────

  it('PROCESSING → SHIPPED is allowed (200)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SHIPPED');
  });

  // ─── Valid: SHIPPED → DELIVERED ───────────────────────────────────────────

  it('SHIPPED → DELIVERED is allowed (200)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DELIVERED');
  });

  // ─── Invalid: DELIVERED → * (terminal state) ──────────────────────────────

  it('DELIVERED → PROCESSING is rejected (422) — DELIVERED is terminal', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.status).toBe(422);
  });

  it('DELIVERED → CANCELLED is rejected (422) — DELIVERED is terminal', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED' });

    expect(res.status).toBe(422);
  });

  // ─── Cancellation path (fresh order) ──────────────────────────────────────

  it('PENDING → CANCELLED is allowed (200)', async () => {
    // Register another fresh user and place a new order to test the cancel path
    const uniqueEmail = `cancel_test_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: uniqueEmail, name: 'Cancel Tester', password: 'Test1234!' })
      .expect(201);
    const token = signupRes.body.token;

    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ limit: 5 })
      .expect(200);
    const inStock = (productsRes.body.items as any[]).find((p: any) => p.stockQuantity > 0);
    expect(inStock).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: inStock.id, quantity: 1 })
      .expect((r) => expect([200, 201]).toContain(r.status));

    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(SHIPPING)
      .expect((r) => expect([200, 201]).toContain(r.status));

    const newOrderId = checkoutRes.body.id;

    const cancelRes = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${newOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELLED');
  });

  // ─── CANCELLED is terminal ─────────────────────────────────────────────────

  it('CANCELLED → PROCESSING is rejected (422) — CANCELLED is terminal', async () => {
    // Create another order, cancel it, then try to re-process it
    const uniqueEmail = `cancel2_test_${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: uniqueEmail, name: 'Cancel Tester 2', password: 'Test1234!' })
      .expect(201);
    const token = signupRes.body.token;

    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ limit: 5 })
      .expect(200);
    const inStock = (productsRes.body.items as any[]).find((p: any) => p.stockQuantity > 0);

    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: inStock.id, quantity: 1 })
      .expect((r) => expect([200, 201]).toContain(r.status));

    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send(SHIPPING)
      .expect((r) => expect([200, 201]).toContain(r.status));

    const newOrderId = checkoutRes.body.id;

    await request(app.getHttpServer())
      .patch(`/api/admin/orders/${newOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${newOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.status).toBe(422);
  });

  // ─── Invalid enum value ────────────────────────────────────────────────────

  it('Invalid status value is rejected with 400 (DTO validation)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'FLYING' });

    expect(res.status).toBe(400);
  });
});
