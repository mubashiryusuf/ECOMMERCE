'use client';

import { useState, useCallback } from 'react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';

/**
 * Hook for fetching the current user's orders.
 * Keeps it simple — no Zustand store since orders are not shared across components.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersApi.list();
      setOrders(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await ordersApi.getById(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderById,
  };
}
