/**
 * Client-side auth token utilities.
 *
 * Tokens are stored in both:
 * - localStorage (for axios interceptor reads — works in browser JS)
 * - A cookie named "token" (for middleware.ts server-side route guards)
 *
 * Cookie is set with SameSite=Strict; it is NOT httpOnly because the
 * middleware only performs a lightweight role check for UX redirects.
 * Real authorization is always enforced by the NestJS API.
 */

const TOKEN_KEY = 'ecom_token';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also write a cookie so Next.js middleware can read it server-side
  document.cookie = `token=${token}; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 7}`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  // Expire the cookie
  document.cookie = 'token=; path=/; SameSite=Strict; max-age=0';
}

// ---------------------------------------------------------------------------
// JWT payload decode (no signature verification — that is the API's job)
// ---------------------------------------------------------------------------

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function getDecodedToken(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url decode the payload segment
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    // Malformed token — treat as unauthenticated
    return null;
  }
}

export function isAdmin(): boolean {
  const payload = getDecodedToken();
  return payload?.role === 'ADMIN';
}

export function isTokenExpired(): boolean {
  const payload = getDecodedToken();
  if (!payload?.exp) return false;
  return Date.now() / 1000 > payload.exp;
}
