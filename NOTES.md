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

## Assumptions & Trade-offs

- **Category as string:** Stored as a plain string on Product (not a separate table). Simple, sufficient for filtering. Would promote to its own table with more time.
- **Forgot-password mock:** No SMTP server wired up. Token returned in body in dev/test. Clearly mocked and documented.
- **Stock validation:** Enforced at cart-add time and again at checkout (transactional). Stock cannot go negative.
- **Price snapshots:** `unitPriceCents` captured at order creation time — live product price changes do not affect existing orders.
- **Suggestions strategy:** Layered relevance — personalized by category affinity from order history → popularity fallback for cold-start → same-category on PDP. No collaborative filtering (time constraint); category + popularity is a reasonable proxy.
