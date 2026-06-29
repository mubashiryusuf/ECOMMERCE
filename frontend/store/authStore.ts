/**
 * Zustand auth store.
 *
 * Owns: current user, token lifecycle, login/signup/logout actions.
 * Persists token via lib/auth.ts (localStorage + cookie) so it survives page reloads.
 */

import { create } from 'zustand';
import { authApi } from '@/lib/api';
import { getToken, setToken, clearToken, isTokenExpired } from '@/lib/auth';
import type { User, LoginPayload, SignupPayload } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const payload: LoginPayload = { email, password };
    try {
      const response = await authApi.login(payload);
      setToken(response.token);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Login failed');
      set({ error: message, isLoading: false });
      throw err; // let the UI handle form-level error display
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    const payload: SignupPayload = { name, email, password };
    try {
      const response = await authApi.signup(payload);
      setToken(response.token);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Signup failed');
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.googleAuth(credential);
      setToken(response.token);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Google login failed');
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, token: null, error: null });
  },

  /**
   * Called once on app mount (via useAuth hook) to rehydrate user state
   * from an existing token stored in localStorage.
   */
  loadUser: async () => {
    const storedToken = getToken();
    if (!storedToken) return;
    if (isTokenExpired()) {
      clearToken();
      return;
    }

    // Avoid redundant fetch if already loaded
    if (get().user) return;

    set({ isLoading: true, error: null });
    try {
      const user = await authApi.me();
      set({ user, token: storedToken, isLoading: false });
    } catch {
      // Token is invalid server-side — clear it
      clearToken();
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
