/**
 * Shared TypeScript interfaces for the e-commerce platform.
 *
 * Rules enforced here:
 * - No passwordHash field anywhere — it must never be serialized to the client
 * - All money fields are integers (cents), never floats
 * - Matches CLAUDE.md §3 data model exactly
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string; // ISO date string from API
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in minor currency units (cents). Never a float. */
  priceCents: number;
  imageUrl: string;
  /** All product images; imageUrl is always images[0]. Falls back to [imageUrl] when absent. */
  images?: string[];
  category: string;
  brand?: string | null;
  /** Must be >= 0. Zero means out of stock. */
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number; // >= 1
  product: Product;
  /** Computed line total in cents: quantity * product.priceCents */
  lineTotalCents: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  /** Sum of all lineTotalCents values in cents */
  totalCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  /**
   * Price snapshotted at order-creation time.
   * This must NOT be read from the live product — it is frozen at purchase.
   */
  unitPriceCents: number;
  /** quantity * unitPriceCents, also snapshotted */
  lineTotalCents: number;
  product: Product; // may be a partial/denormalized snapshot depending on API
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  /** Order total in cents, computed server-side from snapshotted prices */
  totalCents: number;
  paymentRef: string | null;
  // Shipping fields captured at checkout
  name: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenueCents: number;
}

export interface DashboardStats {
  /** Grand total revenue across all delivered/completed orders in cents */
  totalSalesCents: number;
  /** Map of OrderStatus → count */
  orderCountByStatus: Record<OrderStatus, number>;
  topProducts: TopProduct[];
}

// ---------------------------------------------------------------------------
// Form / request shapes
// ---------------------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface CheckoutPayload {
  name: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  paymentIntentId?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  /** Must be submitted as cents (integer) */
  priceCents: number;
  imageUrl: string;
  images?: string[];
  category: string;
  brand?: string;
  stockQuantity: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ---------------------------------------------------------------------------
// Catalog query params (mirrors API query string shape)
// ---------------------------------------------------------------------------

export interface CatalogFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number; // in cents
  maxPrice?: number; // in cents
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  imageUrl?: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export interface Brand {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreateBrandPayload {
  name: string;
  imageUrl?: string;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export interface ContactQuery {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REVIEWED';
  createdAt: string;
}
