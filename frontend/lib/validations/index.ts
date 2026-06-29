/**
 * Shared Zod validation schemas used across form modules.
 * Import from here rather than redefining in each form component.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

// ---------------------------------------------------------------------------
// Checkout schema
// ---------------------------------------------------------------------------

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Full name is required').max(100),
  addressLine1: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
});

// ---------------------------------------------------------------------------
// Product schema (admin form)
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  priceDollars: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than zero')
    .multipleOf(0.01, 'Max 2 decimal places'),
  category: z.string().min(2, 'Category is required').max(100),
  imageUrl: z.string().url('Enter a valid image URL'),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
});

// ---------------------------------------------------------------------------
// Types inferred from schemas
// ---------------------------------------------------------------------------

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
