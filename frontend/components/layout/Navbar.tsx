'use client';

import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge, Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { AuthDrawer } from './AuthDrawer';
import { CartDrawer } from '../cart/CartDrawer';
import { useSnackbar } from 'notistack';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types';

function ApexLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
      <Box
        sx={{
          display: 'inline-block',
          width: 34,
          height: 34,
          background: 'linear-gradient(135deg, #ff7a2e, #f2541c)',
          clipPath: 'polygon(0 0, 100% 0, 68% 100%, 0% 100%)',
          transform: 'skewX(-8deg)',
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: '26px',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          color: '#18181b',
          '& span': { color: '#f2622a' },
        }}
      >
        APEX<span>.</span>
      </Typography>
    </Box>
  );
}

const getNavLinkSx = (highlight?: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  px: { xs: 1.5, md: 2 },
  py: '11px',
  fontFamily: '"Saira", sans-serif',
  fontWeight: 700,
  fontSize: { xs: '11px', md: '12px' },
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: highlight ? '#f2622a' : '#a1a1aa',
  textDecoration: 'none',
  borderBottom: '2px solid transparent',
  transition: 'color 0.15s, background 0.15s',
  '&:hover': {
    color: '#fff',
    background: 'rgba(242,98,42,0.16)',
    borderBottomColor: '#f2622a',
  },
});

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin') ?? false;
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const favoritesCount = useFavoritesStore((s) => s.favoriteIds.size);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pendingCart, setPendingCart] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const searchParams = useSearchParams();
  const { authPromptOpen, redirectAfterAuth, openAuthPrompt, closeAuthPrompt } = useUiStore();

  // Open auth drawer when URL has ?auth=login (e.g. after middleware bounce)
  useEffect(() => {
    if (searchParams.get('auth') === 'login') {
      const redirect = searchParams.get('redirect') ?? undefined;
      openAuthPrompt(redirect);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Role-based redirect: send admin users to the admin panel automatically.
  // Covers both fresh logins and page refreshes with an existing session.
  useEffect(() => {
    if (user?.role === 'ADMIN' && !isAdminPath) {
      router.replace('/admin');
    }
  }, [user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isAuthenticated) {
      setAnchorEl(event.currentTarget);
    } else {
      setDrawerOpen(true);
    }
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    useCartStore.getState().clearCart();
    handleMenuClose();
    enqueueSnackbar('You have been signed out.', { variant: 'info' });
    router.push('/');
  };


  if (isAdminPath) return null;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top bar: logo + search + icons */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0f0f1' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          maxWidth: 1320,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: 2,
        }}
      >
        {/* Logo */}
        <Box component={NextLink} href="/" sx={{ textDecoration: 'none', flexShrink: 0 }}>
          <ApexLogo />
        </Box>


        {/* Icon actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', ml: 'auto' }}>
          {/* Wishlist */}
          <IconButton
            component={NextLink}
            href="/favorites"
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              color: '#18181b',
              '&:hover': { background: '#f4f4f5' },
            }}
            aria-label={`Wishlist — ${favoritesCount} items`}
          >
            <Badge
              badgeContent={favoritesCount || 0}
              sx={{
                '& .MuiBadge-badge': {
                  background: '#f2622a',
                  color: '#fff',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 800,
                  fontSize: '11px',
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  borderRadius: '9px',
                },
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </Badge>
          </IconButton>

          {/* Account */}
          <IconButton
            onClick={handleAccountClick}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              color: '#18181b',
              '&:hover': { background: '#f4f4f5' },
            }}
            aria-label="Account"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </IconButton>

          {/* Cart */}
          <IconButton
            onClick={() => {
              if (!isAuthenticated) {
                setPendingCart(true);
                setDrawerOpen(true);
              } else {
                setCartOpen(true);
              }
            }}
            sx={{
              position: 'relative',
              width: 44,
              height: 44,
              borderRadius: '12px',
              color: '#18181b',
              '&:hover': { background: '#f4f4f5' },
            }}
            aria-label={`Cart — ${itemCount} items`}
          >
            <Badge
              badgeContent={itemCount || 0}
              sx={{
                '& .MuiBadge-badge': {
                  background: '#f2622a',
                  color: '#fff',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 800,
                  fontSize: '11px',
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  borderRadius: '9px',
                },
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
                <path d="M6 6 5 2H2" />
              </svg>
            </Badge>
          </IconButton>
        </Box>

        {/* Auth drawer (non-authenticated) */}
        <AuthDrawer
          open={drawerOpen || authPromptOpen}
          onClose={() => {
            setDrawerOpen(false);
            closeAuthPrompt();
            if (!isAuthenticated) setPendingCart(false);
          }}
          onAuthSuccess={() => {
            setDrawerOpen(false);
            closeAuthPrompt();
            const { user: freshUser } = useAuthStore.getState();
            if (freshUser?.role === 'ADMIN') {
              router.push('/admin');
              return;
            }
            if (pendingCart) {
              setPendingCart(false);
              setCartOpen(true);
              return;
            }
            router.push(redirectAfterAuth ?? '/');
          }}
        />

        {/* Cart drawer */}
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        {/* Account dropdown (authenticated) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: '12px',
              border: '1px solid #ededf0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 180,
            },
          }}
        >
          <MenuItem disabled sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
            {user?.email}
          </MenuItem>
          <MenuItem
            component={NextLink}
            href="/orders"
            onClick={handleMenuClose}
            sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            My Orders
          </MenuItem>
          {user?.role === 'ADMIN' && (
            <MenuItem
              component={NextLink}
              href="/admin"
              onClick={handleMenuClose}
              sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Admin Panel
            </MenuItem>
          )}
          <MenuItem
            onClick={handleLogout}
            sx={{ color: '#e63946', fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Box>
      </Box>

      {/* Dark nav strip */}
      <Box component="nav" sx={{ bgcolor: '#101012' }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'flex',
            alignItems: 'stretch',
            gap: '2px',
          }}
        >
          {categories.map((cat) => (
            <Box component="li" key={cat.id} sx={{ display: 'flex' }}>
              <Box
                component={NextLink}
                href={`/?category=${encodeURIComponent(cat.name)}`}
                sx={getNavLinkSx()}
              >
                {cat.name}
              </Box>
            </Box>
          ))}
        </Box>
        </Box>
      </Box>
    </header>
  );
}
