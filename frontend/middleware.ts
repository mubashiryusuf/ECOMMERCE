import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware that enforces route-level auth guards.
 *
 * - /cart, /checkout, /orders/* — require any authenticated user (token cookie present)
 * - /admin/* — require ADMIN role embedded in the JWT payload
 *
 * Token is read from the `token` cookie set by the client after login.
 * Full JWT verification happens server-side in the NestJS API; the client-side
 * middleware only performs a lightweight presence + payload check to avoid
 * an extra network round-trip on every navigation.
 */

const AUTH_REQUIRED_PATHS = ['/cart', '/checkout', '/orders'];
const ADMIN_PATHS = ['/admin'];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value ?? null;

  // --- Admin route guard ---
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = decodeJwtPayload(token);
    if (!payload || payload['role'] !== 'ADMIN') {
      // Not an admin — redirect to storefront root
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // --- Customer auth-required paths ---
  const isAuthRequired = AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
  if (isAuthRequired) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
  ],
};
