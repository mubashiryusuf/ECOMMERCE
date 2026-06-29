---
name: api-contracts
description: Complete REST API contract for the e-commerce platform — request/response shapes, status codes, and validation rules for every endpoint. Load this skill before implementing or consuming any API endpoint.
---

# API Contracts

Reference these contracts when implementing NestJS controllers/services (backend) or API client functions (frontend). All shapes are TypeScript-style pseudocode.

## Auth

### POST /auth/signup
```
Request:  { email: string, password: string (min 8), name: string }
Response: 201 { token: string, user: UserPublic }
Errors:   400 validation | 409 email already exists
```

### POST /auth/login
```
Request:  { email: string, password: string }
Response: 200 { token: string, user: UserPublic }
Errors:   400 validation | 401 invalid credentials
```

### GET /auth/me  [JWT required]
```
Response: 200 UserPublic
Errors:   401 no/invalid token
```

```typescript
// UserPublic — NEVER include passwordHash
type UserPublic = {
  id: string; email: string; name: string;
  role: 'CUSTOMER' | 'ADMIN'; createdAt: string;
}
```

## Products (public)

### GET /products
```
Query:    search?, category?, minPrice?, maxPrice?, sort?, page?, limit?
          sort values: 'price_asc' | 'price_desc' | 'newest'
          page default: 1, limit default: 12, max limit: 100
Response: 200 { items: Product[], total: number, page: number, limit: number }
```

### GET /products/categories
```
Response: 200 string[]
NOTE: This route MUST be registered BEFORE /products/:id in the controller
```

### GET /products/:id
```
Response: 200 Product
Errors:   404 not found
```

### GET /products/:id/related
```
Response: 200 Product[]  (same category, excl. current, ranked by sales, max 8)
Errors:   404 product not found
```

```typescript
type Product = {
  id: string; name: string; description: string;
  priceCents: number; imageUrl: string; category: string;
  stockQuantity: number; createdAt: string; updatedAt: string;
}
```

## Cart [JWT required — customer owns their own cart]

### GET /cart
```
Response: 200 {
  id: string;
  items: CartItemWithProduct[];
  orderTotalCents: number;
}
type CartItemWithProduct = {
  id: string; quantity: number; lineTotalCents: number;
  product: Product;
}
```

### POST /cart/items
```
Request:  { productId: string, quantity: number (min 1) }
Response: 201 CartItem
Errors:   400 validation | 404 product | 409 insufficient stock
```

### PATCH /cart/items/:itemId
```
Request:  { quantity: number (min 0) }   // 0 = remove
Response: 200 CartItem | 204 (if removed)
Errors:   400 | 403 not your cart item | 404 | 409 stock
```

### DELETE /cart/items/:itemId
```
Response: 204
Errors:   403 not your item | 404
```

## Checkout & Orders [JWT required]

### POST /checkout
```
Request:  {
  name: string; addressLine1: string; city: string;
  postalCode: string; country: string;
}
Response: 201 Order (fully populated with OrderItems)
Errors:   400 validation | 409 stock issue | 422 empty cart
NOTE: Server re-validates stock and prices; never trusts client totals.
      Runs in a DB transaction. Mocked payment OK.
```

### GET /orders
```
Response: 200 Order[]
```

### GET /orders/:id
```
Response: 200 Order
Errors:   403 not your order | 404
```

```typescript
type Order = {
  id: string; status: OrderStatus; totalCents: number;
  paymentRef: string | null;
  name: string; addressLine1: string; city: string;
  postalCode: string; country: string;
  items: OrderItem[]; createdAt: string; updatedAt: string;
}
type OrderItem = {
  id: string; productId: string; quantity: number;
  unitPriceCents: number; lineTotalCents: number;
  product: { name: string; imageUrl: string };
}
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
```

## Suggestions [JWT required]

### GET /me/suggestions
```
Response: 200 Product[]  (max 10, never empty)
Logic:    personalized if user has orders; cold-start otherwise
```

## Admin [JWT required + ADMIN role]

### POST /admin/products
```
Request:  { name, description, priceCents: number, imageUrl, category, stockQuantity }
Response: 201 Product
Errors:   400 | 403
```

### PATCH /admin/products/:id
```
Request:  Partial<above>
Response: 200 Product
Errors:   400 | 403 | 404
```

### DELETE /admin/products/:id
```
Response: 204
Errors:   403 | 404
```

### GET /admin/orders
```
Query:    status? page? limit?
Response: 200 { items: Order[], total, page, limit }
```

### PATCH /admin/orders/:id/status
```
Request:  { status: OrderStatus }
Response: 200 Order
Errors:   403 | 404 | 422 invalid transition
```

### GET /admin/dashboard/stats
```
Response: 200 {
  totalSalesCents: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: Array<{ productId, name, unitsSold, revenueCents }>;
}
```
