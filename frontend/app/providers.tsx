'use client';

import { useEffect } from 'react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-only provider tree.
 *
 * Responsibilities:
 * - Wrap children in MUI ThemeProvider (via lib/theme/ThemeProvider.tsx)
 * - Set up notistack SnackbarProvider for toast notifications
 * - Rehydrate auth state on first mount (reads token from localStorage + calls /auth/me)
 */
export function Providers({ children }: ProvidersProps) {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    // Rehydrate user session from stored token on first render
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}
