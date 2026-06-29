/**
 * Display-layer formatting utilities.
 *
 * All money is stored internally as integer cents.
 * These helpers convert to human-readable strings for the UI.
 * Never use these values in any data/API layer — they are for display only.
 */

import { OrderStatus } from '@/types';

// ---------------------------------------------------------------------------
// Price formatting
// ---------------------------------------------------------------------------

/**
 * Convert an integer cents value to a formatted currency string.
 *
 * @example
 * formatPrice(1099)  // "$10.99"
 * formatPrice(0)     // "$0.00"
 * formatPrice(50000) // "$500.00"
 */
export function formatPrice(cents: number): string {
  // Guard: ensure we are always working with an integer
  const safeCents = Math.round(cents);
  const dollars = safeCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Alias used in some MUI spec template references.
 */
export const formatCents = formatPrice;

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Convert an ISO date string to a human-readable date.
 *
 * @example
 * formatDate("2024-03-15T10:30:00Z") // "Mar 15, 2024"
 */
export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Convert an ISO date string to a date-time string.
 *
 * @example
 * formatDateTime("2024-03-15T10:30:00Z") // "Mar 15, 2024, 10:30 AM"
 */
export function formatDateTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Order status
// ---------------------------------------------------------------------------

/**
 * Returns an MUI color string appropriate for the given OrderStatus.
 * Used in Badge / Chip components to apply semantic colour.
 *
 * MUI color values: 'default' | 'primary' | 'secondary' | 'error' |
 *                   'info' | 'success' | 'warning'
 */
export function getStatusColor(
  status: OrderStatus,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.PROCESSING:
      return 'info';
    case OrderStatus.SHIPPED:
      return 'primary';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Human-readable label for an order status.
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.PROCESSING]: 'Processing',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status] ?? status;
}

// ---------------------------------------------------------------------------
// Stock helpers
// ---------------------------------------------------------------------------

/**
 * Returns a display label for stock quantity.
 */
export function getStockLabel(stockQuantity: number): string {
  if (stockQuantity === 0) return 'Out of stock';
  if (stockQuantity <= 5) return `Only ${stockQuantity} left`;
  return 'In stock';
}

/**
 * Returns an MUI color string for a stock quantity.
 */
export function getStockColor(
  stockQuantity: number,
): 'error' | 'warning' | 'success' {
  if (stockQuantity === 0) return 'error';
  if (stockQuantity <= 5) return 'warning';
  return 'success';
}
