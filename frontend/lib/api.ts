/**
 * Axios instance + typed API functions.
 *
 * All money values flowing through these functions are integers (cents).
 * The display layer (formatters.ts) is responsible for converting to "$X.XX".
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken } from './auth';
import type {
  AuthResponse,
  Brand,
  Cart,
  Category,
  CatalogFilters,
  CheckoutPayload,
  ContactQuery,
  CreateBrandPayload,
  CreateCategoryPayload,
  CreateProductPayload,
  DashboardStats,
  LoginPayload,
  Order,
  PaginatedResponse,
  Product,
  SignupPayload,
  UpdateBrandPayload,
  UpdateCategoryPayload,
  UpdateOrderStatusPayload,
  UpdateProductPayload,
} from '@/types';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// Request interceptor — attach Bearer token when available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale/invalid token and redirect to login
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/?auth=login';
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient };

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
    return data;
  },

  me: async (): Promise<AuthResponse['user']> => {
    const { data } = await apiClient.get<AuthResponse['user']>('/auth/me');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    const { data } = await apiClient.post<{ message: string; resetToken?: string }>(
      '/auth/forgot-password',
      { email },
    );
    return data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/google', { credential });
    return data;
  },
};

// ---------------------------------------------------------------------------
// Products API (public read + admin write)
// ---------------------------------------------------------------------------

export const productsApi = {
  list: async (filters: CatalogFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params: Record<string, string | number> = {};
    if (filters.search) params['search'] = filters.search;
    if (filters.category) params['category'] = filters.category;
    if (filters.minPrice !== undefined) params['minPrice'] = filters.minPrice;
    if (filters.maxPrice !== undefined) params['maxPrice'] = filters.maxPrice;
    if (filters.sort) params['sort'] = filters.sort;
    if (filters.page !== undefined) params['page'] = filters.page;
    if (filters.limit !== undefined) params['limit'] = filters.limit;

    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/products/categories');
    return data;
  },

  getRelated: async (id: string): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>(`/products/${id}/related`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Cart API (auth required)
// ---------------------------------------------------------------------------

export const cartApi = {
  get: async (): Promise<Cart> => {
    const { data } = await apiClient.get<Cart>('/cart');
    return data;
  },

  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    const { data } = await apiClient.post<Cart>('/cart/items', { productId, quantity });
    return data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const { data } = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity });
    return data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const { data } = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Orders API (auth required)
// ---------------------------------------------------------------------------

export const ordersApi = {
  createPaymentIntent: async (amount: number): Promise<{ clientSecret: string }> => {
    const { data } = await apiClient.post<{ clientSecret: string }>('/checkout/payment-intent', { amount });
    return data;
  },

  checkout: async (payload: CheckoutPayload): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/checkout', payload);
    return data;
  },

  list: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Suggestions API (auth required)
// ---------------------------------------------------------------------------

export const suggestionsApi = {
  getPersonalized: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/me/suggestions');
    return data;
  },
};

// ---------------------------------------------------------------------------
// Contact API (public)
// ---------------------------------------------------------------------------

export const contactApi = {
  submit: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> => {
    await apiClient.post('/contact', payload);
  },
};

// ---------------------------------------------------------------------------
// Favorites API (auth required)
// ---------------------------------------------------------------------------

export const favoritesApi = {
  list: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/me/favorites');
    return data;
  },
  add: async (productId: string): Promise<void> => {
    await apiClient.post('/me/favorites', { productId });
  },
  remove: async (productId: string): Promise<void> => {
    await apiClient.delete(`/me/favorites/${productId}`);
  },
};

// ---------------------------------------------------------------------------
// Brands API (public read)
// ---------------------------------------------------------------------------

export const brandsApi = {
  list: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<Brand[]>('/brands');
    return data;
  },
};

// ---------------------------------------------------------------------------
// Categories API (public read)
// ---------------------------------------------------------------------------

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
};

// ---------------------------------------------------------------------------
// Admin API (auth + ADMIN role required)
// ---------------------------------------------------------------------------

export const adminApi = {
  // Products
  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/admin/products', payload);
    return data;
  },

  updateProduct: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/admin/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  // Orders
  listAllOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/admin/orders');
    return data;
  },

  updateOrderStatus: async (id: string, payload: UpdateOrderStatusPayload): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/admin/orders/${id}/status`, payload);
    return data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/admin/orders/${id}`);
    return data;
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return data;
  },

  // Image upload — products
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string }>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },

  // Image upload — categories
  uploadCategoryImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string }>('/admin/upload/category', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },

  // Categories
  listCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/admin/categories');
    return data;
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/admin/categories', payload);
    return data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/admin/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  // Brands
  listBrands: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<Brand[]>('/admin/brands');
    return data;
  },

  createBrand: async (payload: CreateBrandPayload): Promise<Brand> => {
    const { data } = await apiClient.post<Brand>('/admin/brands', payload);
    return data;
  },

  updateBrand: async (id: string, payload: UpdateBrandPayload): Promise<Brand> => {
    const { data } = await apiClient.patch<Brand>(`/admin/brands/${id}`, payload);
    return data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/brands/${id}`);
  },

  uploadBrandImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string }>('/admin/upload/brand', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },

  // Contact queries
  listContactQueries: async (): Promise<ContactQuery[]> => {
    const { data } = await apiClient.get<ContactQuery[]>('/admin/contact-queries');
    return data;
  },

  updateContactQueryStatus: async (id: string, status: 'NEW' | 'REVIEWED'): Promise<ContactQuery> => {
    const { data } = await apiClient.patch<ContactQuery>(`/admin/contact-queries/${id}/status`, { status });
    return data;
  },
};
