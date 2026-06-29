/**
 * Zustand cart store.
 *
 * Cart is persisted in the database (not localStorage) — this store is simply
 * a client-side cache of the server state. Every mutation calls the API and
 * then updates the local state from the response.
 */

import { create } from 'zustand';
import { cartApi } from '@/lib/api';
import type { Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  clearError: () => void;
}

export const useCartStore = create<CartState & CartActions>((set) => ({
  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  cart: null,
  isLoading: false,
  error: null,

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.get();
      set({ cart, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load cart';
      set({ error: message, isLoading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.addItem(productId, quantity);
      set({ cart, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Failed to add item');
      set({ error: message, isLoading: false });
      throw err; // surface to UI for snackbar
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.removeItem(itemId);
      set({ cart, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      // quantity === 0 is handled by the API as a delete; the response reflects
      // the updated cart (item removed when quantity reaches 0)
      const cart = await cartApi.updateItem(itemId, quantity);
      set({ cart, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Failed to update quantity');
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /** Local-only reset used after successful checkout */
  clearCart: () => set({ cart: null, error: null }),

  clearError: () => set({ error: null }),
}));
