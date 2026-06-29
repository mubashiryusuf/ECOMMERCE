# NOTES.md — Mini E-Commerce Platform

> Written incrementally per CLAUDE.md §12. Each phase appended as work completes.

---

## Agent Workflow

- **Tools used:** Claude Code (claude-sonnet-4-6), Claude Design MCP for APEX storefront design
- **Task scoping:** CLAUDE.md is read each session as the source of truth. Features delegated to specialist agents (backend-engineer, frontend-engineer) per the orchestrator spec. Commits made per phase, not batched.
- **Context management:** Conversation summaries carry state between sessions. CLAUDE.md checklist tracked against each build phase.

---

## Design Workflow — APEX Storefront

- **Design agent:** Claude Design MCP (project `3018b02b-0812-4e88-9657-5813b099876c`)
- **Design system:** APEX brand — primary orange `#f2622a` (gradient `#ff7a2e → #f2541c`), dark surface `#101012` (nav/admin), body `#f4f4f5`, card `#fff` with `#ededf0` border
- **Typography:** Saira Condensed 800 italic uppercase for display headers; Saira 700 uppercase for UI/buttons; Manrope 400–800 for body
- **Components:** Diamond clip-path logo, pill search bar, hover lift `translateY(-6px)`, APEX step indicators (numbered circles + orange connectors replacing MUI Stepper)
- **Iteration:** Design tokens extracted from the Claude Design HTML file and applied consistently across all 35 frontend files

---

## Phase 3 — Auth (2026-06-29)

**Built:**
- `POST /auth/signup` — creates CUSTOMER role user, bcrypt hashes password (10 rounds), returns `{ token, user }` (no passwordHash)
- `POST /auth/login` — validates credentials, same return shape
- `GET /auth/me` — JWT-guarded, returns user profile (select-safe, no hash)
- `POST /auth/forgot-password` — generates 15-minute signed JWT reset token
- `POST /auth/reset-password` — verifies token type + expiry, updates passwordHash
- `JwtStrategy` — extracts Bearer token, attaches `{ id, email, role }` to request
- `JwtAuthGuard` — passport-jwt guard used on all protected routes
- `RolesGuard` — reflector-based, checks `@Roles('ADMIN')` metadata
- Admin role guard applied to all three admin controllers (`/admin/products`, `/admin/orders`, `/admin/dashboard`)
- Cart + orders controllers enforce ownership via `user.id` from JWT (no user can see another's cart/orders)
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform) on all DTOs
- Global `HttpExceptionFilter` — no raw stack traces leaked to client

**Mocked:**
- Forgot-password email: token returned in response body (`resetToken` field) in non-production environments. In production (`NODE_ENV=production`) only the generic message is returned. **Documented here.** In production this would use nodemailer + SMTP to email the link.

**Assumptions:**
- Reset token uses the same JWT secret as access tokens but with `type: 'password-reset'` claim to prevent cross-use. A separate secret would be more secure at scale but adds config complexity for this assessment.
- Forgot-password always returns the same `message` to prevent email enumeration — the `resetToken` is an addendum for testability.

**Agent mistakes caught:** None — all types aligned on first build pass.

**Verification:**
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"password123"}'
# → { token, user: { id, email, name, role: "CUSTOMER", createdAt } }

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# → { token, user }

# Forgot password (mock)
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# → { message: "...", resetToken: "<15-min JWT>" }

# Reset password
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<resetToken>","newPassword":"newpassword123"}'
# → { message: "Password updated successfully..." }

# Admin guard — customer token rejected
curl -X GET http://localhost:3001/api/admin/dashboard/stats \
  -H "Authorization: Bearer <customer-token>"
# → 403 Forbidden
```

---

## Bug Fix — Admin Login (2026-06-29)

**Root cause (two issues):**

1. **Middleware redirect target**: `frontend/middleware.ts` was redirecting unauthenticated `/admin` attempts to `/` (the homepage) rather than `/login?redirect=/admin`. This left the user on the storefront with no indication they needed to log in. The `matcher` config also had `'/admin/:path*'` which, despite Next.js treating `:path*` as zero-or-more, was acting inconsistently — added explicit `'/admin'` entry to cover the bare dashboard path.

2. **AuthDrawer timing**: `SignInForm.onSubmit` called `onAuthSuccess` inside a `setTimeout(..., 350)` to wait for the drawer close animation. This was fragile — if React batched re-renders or the callback reference changed (Navbar re-render on `drawerOpen` state change), the admin redirect could miss. After `await login()`, the Zustand store is synchronously updated, so `onAuthSuccess` can be called immediately after `onSuccess()` (the close). Removed all `setTimeout` wrappers across email login, signup, and Google OAuth paths.

**Fixes applied:**
- `frontend/middleware.ts`: unauthenticated `/admin` → `/login?redirect=/admin`; added `/admin` to matcher
- `frontend/components/layout/AuthDrawer.tsx`: removed 350ms setTimeout; `onAuthSuccess` called synchronously

**Verification:**
```bash
# No token → redirects to /login?redirect=%2Fadmin
curl -I http://localhost:3000/admin
# HTTP/1.1 307 → location: /login?redirect=%2Fadmin

# Customer token → redirects to /
curl -I -H "Cookie: token=<customer-jwt>" http://localhost:3000/admin
# HTTP/1.1 307 → location: /

# Admin token → 200 OK
curl -I -H "Cookie: token=<admin-jwt>" http://localhost:3000/admin
# HTTP/1.1 200 OK
```

**Agent mistakes caught:** Previous implementation used a 350ms `setTimeout` for the auth drawer post-login callback — a timing anti-pattern that works most of the time but is not reliable. Also missed that the middleware redirect target for admin was `/` (unhelpful) instead of `/login`.

---

## Open-Ended Requirement — Personalized Suggestions (§8)

### Interpretation

The spec says _"Customers should be able to see product suggestions that are relevant to them"_ and intentionally leaves the implementation open. The chosen strategy is a **layered relevance model** — progressively more personalized as user history accumulates, always falling back to a useful signal.

### Strategy

**1. Personalized recommendations — `GET /me/suggestions` (auth required)**

_Trigger:_ User has at least one completed order.

_Algorithm:_
1. Collect all `productId` values from the user's `OrderItem` rows (their purchase history).
2. Resolve the distinct `category` values from those products.
3. Query in-stock (`stockQuantity > 0`) products in those categories, **excluding** products the user has already purchased (by `productId`).
4. Rank candidates by **total units sold across all orders** (global popularity within those categories).
5. Return the top 10.

_Why popularity as the ranking signal?_ Collaborative filtering (users-who-bought-X-also-bought-Y) is the gold standard but requires a minimum dataset size and significant implementation time. Category affinity + popularity is a practical proxy: it keeps results topically relevant to the user's interests while surfacing items other buyers validated.

**2. Cold-start fallback — same endpoint, no order history**

_Trigger:_ User is authenticated but has zero order history.

_Algorithm:_ Return the top 10 in-stock products ranked by total units sold globally, tie-broken by `createdAt DESC` (newest first). This surfaces what's popular right now rather than returning an empty shelf.

_Why not random?_ Popularity is self-correcting — popular products earned that signal. Random would surface dead stock and low-quality items equally.

**3. Contextual (PDP) — `GET /products/:id/related` (public)**

_Trigger:_ Any visitor on a product detail page, regardless of auth state.

_Algorithm:_ In-stock products from the same category as the current product, excluding the current product itself, ordered by `createdAt DESC`.

_Why newest?_ On a PDP, the visitor has already expressed interest in a category. New arrivals in that category are the most likely to be unknown to them and worth surfacing. Popularity would favor already-discovered bestsellers.

### Frontend wiring (Product Detail Page)

The "You May Also Like" grid on `/products/[id]` uses a **hybrid selection rule**:

| User state | Data source | Label |
|---|---|---|
| Authenticated, has order history in matching categories | `GET /me/suggestions` (filtered to exclude current product) | "You May Also Like" + "Personalized for you" badge |
| Authenticated, cold-start (no matching suggestions after filter) | Falls back to `GET /products/:id/related` | "You May Also Like" |
| Unauthenticated | `GET /products/:id/related` | "You May Also Like" |

Both API calls are made in parallel on page load. For unauthenticated users the personalized call is skipped entirely (no unnecessary auth error). If personalized suggestions are non-empty after filtering out the current product, they take priority.

The "Personalized for you" badge appears inline next to the orange accent bar — visible only when the personalized path is active.

### Trade-offs documented

- **No collaborative filtering:** Would require user-item matrix, cosine similarity or an embedding model. Out of scope for time; category + popularity is a reasonable proxy at this scale.
- **No recency weighting on suggestions:** Older purchases weigh equally to recent ones. A decay function on `order.createdAt` would better reflect evolving taste but adds complexity.
- **Suggestions not paginated:** Returns 10 items; PDP shows 4. The extra items are unused client-side but retained in the response for future homepage or sidebar use.
- **Related products ranked by newest, not popularity:** Intentional — on a PDP the goal is discovery of new items in the category, not reinforcing the same bestsellers the user has already seen.

---

## Assumptions & Trade-offs

- **Category as string:** Stored as a plain string on Product (not a separate table). Simple, sufficient for filtering. Would promote to its own table with more time.
- **Forgot-password mock:** No SMTP server wired up. Token returned in body in dev/test. Clearly mocked and documented.
- **Stock validation:** Enforced at cart-add time and again at checkout (transactional). Stock cannot go negative.
- **Price snapshots:** `unitPriceCents` captured at order creation time — live product price changes do not affect existing orders.
