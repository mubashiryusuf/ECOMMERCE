/**
 * Integration test: Authorization guard enforcement on admin routes
 *
 * Verifies that:
 *  1. A CUSTOMER JWT token is rejected with 403 on GET /api/admin/orders
 *  2. A CUSTOMER JWT token is rejected with 403 on GET /api/admin/dashboard/stats
 *  3. An unauthenticated request (no token) to GET /api/admin/orders is rejected with 401
 *
 * The test boots the real NestJS application (AppModule) and exercises the full
 * HTTP stack — including JwtAuthGuard, RolesGuard, and the global exception filter —
 * through Supertest. No mocks are used for the guards or the database.
 *
 * Seeded customer credentials (from backend/prisma/seed.ts):
 *   email:    customer@example.com
 *   password: Customer1234!
 *
 * The global prefix is "api" (set in main.ts via app.setGlobalPrefix('api')).
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('Admin route authorization', () => {
  let app: INestApplication;
  let customerToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Mirror the exact bootstrap configuration from main.ts so guards and
    // pipes behave identically to the running server.
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    // Obtain a real CUSTOMER JWT by calling the live login endpoint.
    // The customer is pre-seeded by backend/prisma/seed.ts.
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'Customer1234!' })
      .expect(200);

    customerToken = loginRes.body.token;
    expect(typeof customerToken).toBe('string');
    expect(customerToken.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Unauthenticated access ──────────────────────────────────────────────────

  it('GET /api/admin/orders without a token → 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/admin/orders');

    expect(res.status).toBe(401);
    // The HttpExceptionFilter always serialises the status code into the body.
    expect(res.body.statusCode).toBe(401);
  });

  // ─── CUSTOMER token on admin endpoints ──────────────────────────────────────

  it('GET /api/admin/orders with CUSTOMER token → 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    // Confirm the body also carries the correct status code (not 200 from cached response).
    expect(res.body.statusCode).toBe(403);
  });

  it('GET /api/admin/dashboard/stats with CUSTOMER token → 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });

  // ─── Negative sanity: CUSTOMER token should still work on customer routes ───

  it('GET /api/auth/me with CUSTOMER token → 200 (guards do not over-block)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('CUSTOMER');
    // passwordHash must never be returned in the response
    expect(res.body.passwordHash).toBeUndefined();
  });
});
