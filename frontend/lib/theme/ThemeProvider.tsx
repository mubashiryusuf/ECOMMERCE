'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { theme } from './index';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in MUI's ThemeProvider with App Router SSR-compatible emotion cache.
 * Must be a client component because MUI uses React context internally.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
