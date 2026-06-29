import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: Set<string>;
  setFavoriteIds: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),

  setFavoriteIds: (ids) => set({ favoriteIds: new Set(ids) }),

  addFavorite: (id) =>
    set((s) => ({ favoriteIds: new Set(Array.from(s.favoriteIds).concat(id)) })),

  removeFavorite: (id) => {
    const next = new Set(get().favoriteIds);
    next.delete(id);
    set({ favoriteIds: next });
  },

  isFavorite: (id) => get().favoriteIds.has(id),
}));
