# AGENTS.md — Mini E-Commerce Platform

> **Purpose of this file.** This is the single source of truth the agent must read before every task and re-check before marking anything "done." It exists so that _no functionality from the assessment spec is skipped_. If a request and this file ever conflict, ask before proceeding.

---

## 0. How to work in this repo (read first, every session)

- **Work in small, verifiable increments.** One feature slice at a time, end-to-end (DB → API → UI), then commit. Do not batch ten features into one change.
- **Commit as you go** with clear, conventional messages (`feat:`, `fix:`, `test:`, `chore:`, `docs:`). **Never** finish with a single squashed "final commit." The git history is graded.
- **Verify before claiming done.** After each slice: run the relevant test, hit the endpoint (curl or the UI), and confirm the acceptance criteria in this file are met. State what you checked.
- **Update `NOTES.md` as you go**, not at the end (see §12).
- **Never invent secrets or commit them.** Use `.env` + `.env.example`. Secrets stay out of git.
- **Mock honestly.** If you mock something, say so in code comments and in `NOTES.md`. Working-but-mocked beats broken-but-ambitious.
- **Stop and surface** any ambiguity beyond the one open-ended requirement, rather than guessing.

**Guiding principle (from the spec): _Working over polished. Coherent over complete._**

---

## 1. Tech stack (default — swappable, document any change in NOTES.md)

| Layer      | Choice                                               | Notes                                                    |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Backend    | **Node.js + NestJS**                                 | Modular structure, DTO validation, guards for auth/roles |
| Frontend   | **Next.js (App Router) + React + TypeScript**        | Two surfaces: storefront `/` and admin `/admin`          |
| DB         | **PostgreSQL**                                       |                                                          |
| ORM        | **Prisma**                                           | Migrations + type-safe queries + easy seed script        |
| Auth       | **JWT** (access token; refresh optional)             | Bcrypt-hashed passwords; role embedded in token claims   |
| Payments   | **Stripe test mode** OR a clearly-mocked step        | **No real payments, ever**                               |
| Charts     | **Recharts** (or Chart.js)                           | Admin dashboard                                          |
| Validation | **Zod** (client) + **class-validator** (server DTOs) | Validate on **both** sides                               |
| Tests      | **Jest** (+ Supertest for API)                       | Quality over quantity                                    |
| Styling    | **Tailwind + headless primitives** (e.g. Radix)      | Look & layout must be **your own design** (see §10)      |

If the candidate decides to swap any of the above, record the reason in `NOTES.md`.

---

## 2. Repository structure

```
/
├── apps/
│   ├── api/                 # NestJS backend
│   └── web/                 # Next.js frontend (storefront + admin)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # seed script (§9)
├── .env.example
├── README.md                # setup + run + seeded credentials (§11)
├── NOTES.md                 # required write-up (§12)
└── AGENTS.md                # this file
```

A monorepo is preferred but not mandatory. If splitting into two repos, document it.

---

## 3. Data model

Store **all money as integer minor units (cents)** to avoid floating-point errors. Never use `float` for prices.

**User**

- `id`, `email` (unique), `passwordHash`, `name`, `role` enum `CUSTOMER | ADMIN`, `createdAt`

**Product**

- `id`, `name`, `description`, `priceCents` (int), `imageUrl`, `category` (string), `stockQuantity` (int ≥ 0), `createdAt`, `updatedAt`

**Cart** (one active cart per user)

- `id`, `userId` (unique), `createdAt`, `updatedAt`

**CartItem**

- `id`, `cartId`, `productId`, `quantity` (int ≥ 1), unique on (`cartId`, `productId`)

**Order**

- `id`, `userId`, `status` enum `PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED` (default `PENDING`), `totalCents` (int), `paymentRef` (string, nullable), shipping fields (`name`, `addressLine1`, `city`, `postalCode`, `country`), `createdAt`, `updatedAt`

**OrderItem** (price is **snapshotted** at order time — do not read live product price later)

- `id`, `orderId`, `productId`, `quantity`, `unitPriceCents` (snapshot), `lineTotalCents`

Relationships: User 1—1 Cart, Cart 1—_ CartItem, User 1—_ Order, Order 1—\* OrderItem. Product is referenced by CartItem and OrderItem.

> Category is modeled as a string for simplicity. If time allows, promote to its own table. Document the choice.

---

## 4. API surface (REST)

All responses use sensible HTTP status codes. No raw stack traces to the client (global exception filter). Validate every input with DTOs.

### Auth

- `POST /auth/signup` → create CUSTOMER, return token + user
- `POST /auth/login` → return token + user
- `GET /auth/me` → current user (auth required)

### Products — public read

- `GET /products` — query params:
  - `search` (by name), `category`, `minPrice`, `maxPrice`, `sort` (`price_asc | price_desc | newest`), `page`, `limit`
  - **Must paginate** — never return all products at once. Return `{ items, total, page, limit }`.
- `GET /products/:id` — full detail
- `GET /products/categories` — distinct categories (for filter UI)
- `GET /products/:id/related` — related items for the PDP (see §8)

### Cart — auth, customer-owned

- `GET /cart` — current user's cart with line totals + order total
- `POST /cart/items` — `{ productId, quantity }` (validate stock)
- `PATCH /cart/items/:itemId` — `{ quantity }` (validate stock; quantity 0 removes)
- `DELETE /cart/items/:itemId`

### Checkout & Orders — auth, customer-owned

- `POST /checkout` — create (mock/Stripe-test) payment, then create order **transactionally**: re-validate stock and prices server-side, decrement stock, snapshot prices, clear cart, return order
- `GET /orders` — current user's orders + status
- `GET /orders/:id` — single order (must belong to the user)

### Suggestions — auth

- `GET /me/suggestions` — personalized recommendations (see §8)

### Admin — auth + ADMIN role only (guard on every route)

- `POST /admin/products` / `PATCH /admin/products/:id` / `DELETE /admin/products/:id`
- `GET /admin/orders` — all orders
- `PATCH /admin/orders/:id/status` — enforce valid lifecycle transitions
- `GET /admin/dashboard/stats` — total sales, order count by status, top-selling products

---

## 5. Feature checklist — Storefront (Part 1)

Each box must be demonstrably working end-to-end.

**Catalog**

- [ ] Browse products showing name, description, price, image, category, stock
- [ ] Search by product name
- [ ] Filter by category
- [ ] Filter by price range
- [ ] Sort by price (asc/desc) and by newest
- [ ] Pagination (server-side)

**Product detail page**

- [ ] Full product info
- [ ] Quantity selector + add-to-cart
- [ ] Related products shown (§8)

**Cart**

- [ ] Add / remove / update quantity
- [ ] Persists across sessions for a logged-in user (stored in DB, not just localStorage)
- [ ] Line totals + order total correct

**Checkout**

- [ ] Checkout flow captures the order
- [ ] Mock or Stripe **test-mode** payment (clearly not real)
- [ ] On success → order created + confirmation screen

**Order history**

- [ ] Logged-in customer sees past orders + each order's status

**Auth**

- [ ] Signup + login
- [ ] A customer can only see/act on their **own** cart and orders (enforced server-side, not just hidden in UI)

---

## 6. Feature checklist — Admin Panel (Part 2)

**Product management**

- [ ] Create, edit, delete products
- [ ] Product image via **upload or image URL** — pick one, document it (URL is simpler and acceptable)

**Order management**

- [ ] View all orders
- [ ] Update status through `pending → processing → shipped → delivered`, plus a `cancelled` path
- [ ] Reject invalid transitions (e.g. delivered → pending)

**Dashboard**

- [ ] Total sales
- [ ] Order count by status
- [ ] Top-selling products
- [ ] At least one of these rendered as a **chart**

**Access control**

- [ ] Admin panel + endpoints restricted to ADMIN role
- [ ] Customers cannot reach admin functionality (route guard + API guard; verify a customer token gets 403)

---

## 7. Cross-cutting requirements (graded as heavily as features)

- **Input validation** on **both** client and server. Reject bad input gracefully.
- **Error handling** — meaningful messages, correct status codes, global filter so no stack traces leak.
- **Data integrity**
  - Order totals computed server-side from snapshotted prices, never trusted from the client.
  - Stock cannot go negative; ordering more than is in stock must fail cleanly.
  - Checkout runs in a DB transaction (re-check stock + price, decrement, create order, clear cart — all or nothing).
  - Status transitions validated.
- **Security**
  - Passwords hashed (bcrypt/argon2), never stored or returned in plain text.
  - Auth enforced where required; authorization (ownership + role) checked server-side.
  - Secrets in `.env`, never committed. `.env.example` lists keys with dummy values.
  - No sensitive fields (passwordHash) ever serialized in responses.
- **Seed script** (§9), **README** (§11), **Tests** (§13) — all required.

---

## 8. Open-ended requirement — "relevant product suggestions"

> Spec: _"Customers should be able to see product suggestions that are relevant to them."_ Intentionally open. The interpretation must be **documented in NOTES.md**.

**Default interpretation (implement this, adjust if desired):** a layered relevance strategy with graceful fallback.

1. **Personalized (`GET /me/suggestions`)** — derive the categories the user has bought from (their `OrderItem`s); recommend in-stock products from those categories that they haven't purchased, ranked by overall sales popularity.
2. **Cold-start fallback** — if the user has no order history, fall back to global **top-selling / newest in-stock** products. Never return an empty/ broken section.
3. **Contextual on PDP (`GET /products/:id/related`)** — same-category products, excluding the current one, ranked by popularity.

Document this reasoning and the trade-offs (e.g. "no collaborative filtering due to time; category affinity + popularity is a reasonable proxy") in `NOTES.md`.

---

## 9. Seed script

`prisma/seed.ts` must populate, idempotently:

- **≥ 1 ADMIN user** and **≥ 1 CUSTOMER user**, with known credentials echoed in the README.
- A spread of **sample products** across **several categories**, with images, varied prices, and varied stock (include at least one low/zero-stock item to demo edge cases).
- Optionally one sample order for the customer so suggestions and order history aren't empty.

Run via `npm run seed` (or `prisma db seed`).

---

## 10. Design (must be your own, via design agents — not a template)

- Generate the UI through a **design agent** (Codex Design, v0, Figma AI, etc.). Do **not** drop in a ready-made theme/UI kit. Headless primitives are fine as building blocks.
- Define a small, deliberate **design system first** and reuse it across both surfaces: color tokens, type scale, spacing, button/input/card components. Keep storefront and admin visually coherent but role-appropriate (admin denser/utilitarian, storefront more inviting).
- Consistent layout + sensible nav on both sides. Not pixel-perfect — cohesive and clearly _directed_, not generic.
- Record in `NOTES.md`: which design agent(s), how you prompted/iterated, and how the look evolved.

---

## 11. README requirements

Must let a reviewer run from a clean clone:

- Prerequisites (Node version, Postgres, package manager)
- Env vars (point to `.env.example`)
- Install, migrate, seed, and run commands for **both** backend and frontend
- **Seeded login credentials** (admin + customer)
- How to run tests
- The stack and why (or a pointer to NOTES.md)

---

## 12. NOTES.md requirements (write incrementally)

Must cover:

- **Agent workflow** — tools used, how tasks were scoped, prompt/instruction structure, context management (this file).
- **Where the agent helped and where it failed** — concrete mistakes (subtle or obvious), how they were caught and fixed. _(Heavily weighted — keep a running log as you go.)_
- **Supervision & verification** — how output was checked, not accepted blind.
- **Design workflow** — design agent(s) and iteration.
- **Assumptions** — every ambiguous decision, including the §8 interpretation.
- **Trade-offs & scope** — built fully vs mocked/simplified vs would-do-with-more-time.

---

## 13. Testing (quality over quantity — pick the load-bearing logic)

Prioritize tests for the parts where bugs hurt most:

- Checkout/order creation: total calculation from snapshots; **ordering more than in stock fails**; stock decrements correctly; runs transactionally.
- Authorization: a CUSTOMER token is rejected (403) from admin endpoints; a user cannot read another user's order/cart.
- Order status transition validation (valid path allowed, invalid path rejected).
- Suggestions: personalized result for a user with history; fallback for a cold-start user.

A few meaningful, passing tests beat many shallow ones.

---

## 14. Suggested build order (phased — commit at each phase)

1. Scaffold monorepo; "hello world" on both ends; Prisma + DB connection.
2. Schema + migrations + seed script.
3. **Auth first** (signup/login, JWT, role guard) — verify with curl.
4. Storefront **read paths**: catalog (search/filter/sort/paginate) → PDP.
5. Cart (persistent) → checkout (transactional, mock/Stripe-test) → order confirmation.
6. Order history.
7. Admin: product CRUD → order management/status → dashboard + chart → access control hardening.
8. Open-ended suggestions feature (§8).
9. Tests (§13) + NOTES.md polish.
10. **Clean-clone dry run**: fresh folder, follow your own README, confirm it boots and seeds.

---

## 15. Definition of done (check before declaring complete)

- [ ] Runs from a clean clone following only the README.
- [ ] Every box in §5 and §6 verified working.
- [ ] All §7 cross-cutting requirements satisfied (validation both sides, transactional checkout, no leaked secrets/stack traces, role + ownership enforced server-side).
- [ ] Seed script produces admin + customer + products.
- [ ] §8 suggestions implemented + documented.
- [ ] Tests pass; §13 cases covered.
- [ ] Git history is incremental and readable (no single dump commit).
- [ ] NOTES.md complete.
