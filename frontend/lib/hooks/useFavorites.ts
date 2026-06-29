'use client';

import { useCallback, useEffect } from 'react';
import { favoritesApi } from '@/lib/api';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';

export function useFavorites() {
  const { favoriteIds, setFavoriteIds, addFavorite, removeFavorite, isFavorite } =
    useFavoritesStore();
  const isAuthenticated = useAuthStore((s) => !!s.token);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }
    favoritesApi
      .list()
      .then((products) => setFavoriteIds(products.map((p) => p.id)))
      .catch(() => {});
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;
      const was = isFavorite(productId);
      // optimistic update
      if (was) {
        removeFavorite(productId);
      } else {
        addFavorite(productId);
      }
      try {
        if (was) {
          await favoritesApi.remove(productId);
        } else {
          await favoritesApi.add(productId);
        }
      } catch {
        // rollback on error
        if (was) {
          addFavorite(productId);
        } else {
          removeFavorite(productId);
        }
      }
    },
    [isAuthenticated, isFavorite, addFavorite, removeFavorite],
  );

  return { favoriteIds, isFavorite, toggle };
}
