'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Convenience hook for accessing auth state and actions.
 * Automatically loads the current user on first mount if a token is present.
 */
export function useAuth() {
  const { user, token, isLoading, error, login, signup, logout, loadUser } = useAuthStore();

  useEffect(() => {
    // Hydrate user from token on first render (e.g. page refresh)
    if (!user && !isLoading) {
      loadUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    signup,
    logout,
  };
}
