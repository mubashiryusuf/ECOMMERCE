'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from './useAuth';

/**
 * Convenience hook for cart state and actions.
 * Fetches cart from the API when the user is authenticated.
 */
export function useCart() {
  const { cart, isLoading, error, fetchCart, addItem, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !cart && !isLoading) {
      fetchCart();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cart,
    isLoading,
    error,
    itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    totalCents: cart?.totalCents ?? 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refetch: fetchCart,
  };
}
