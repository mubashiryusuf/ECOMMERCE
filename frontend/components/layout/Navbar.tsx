'use client';

import NextLink from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Badge, Box, IconButton, Menu, MenuItem, Typography, InputBase } from '@mui/material';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { AuthDrawer } from './AuthDrawer';
import { CartDrawer } from '../cart/CartDrawer';

const NAV_LINKS = [
  { label: 'Shop By Brands', href: '/?category=Brands' },
  { label: 'Men', href: '/?category=Men' },
  { label: 'Women', href: '/?category=Women' },
  { label: 'Kids', href: '/?category=Kids' },
  { label: 'Accessories & Equipment', href: '/?category=Equipment' },
  { label: 'New Arrivals', href: '/?sort=newest', highlight: true },
  { label: 'Sale', href: '/?sort=price_asc' },
];

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

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

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
    handleMenuClose();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdminPath = pathname?.startsWith('/admin');
  if (isAdminPath) return null;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top bar: logo + search + icons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 4,
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid #f0f0f1',
        }}
      >
        {/* Logo */}
        <Box component={NextLink} href="/" sx={{ textDecoration: 'none', flexShrink: 0 }}>
          <ApexLogo />
        </Box>

        {/* Search */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            flex: 1,
            maxWidth: 720,
            position: 'relative',
          }}
        >
          <InputBase
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for shoes, apparel, gear…"
            sx={{
              width: '100%',
              height: 48,
              border: '1.5px solid #e7e7ea',
              borderRadius: 999,
              px: '22px',
              pr: '56px',
              fontFamily: '"Manrope", sans-serif',
              fontSize: '14.5px',
              background: '#fafafa',
              color: '#18181b',
              '&.Mui-focused': { borderColor: '#f2622a', background: '#fff' },
              transition: 'border-color 0.2s, background 0.2s',
            }}
          />
          <Box
            component="button"
            type="submit"
            sx={{
              position: 'absolute',
              right: 5,
              top: 5,
              width: 38,
              height: 38,
              border: 'none',
              borderRadius: '50%',
              background: '#f2622a',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { background: '#d94e18' },
              transition: 'background 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </Box>
        </Box>

        {/* Icon actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', ml: 'auto' }}>
          {/* Wishlist */}
          <IconButton
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              color: '#18181b',
              '&:hover': { background: '#f4f4f5' },
            }}
            aria-label="Wishlist"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
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
            onClick={() => setCartOpen(true)}
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
        <AuthDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

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

      {/* Dark nav strip */}
      <Box component="nav" sx={{ bgcolor: '#101012', px: 4 }}>
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
          {NAV_LINKS.map((link) => (
            <Box component="li" key={link.label} sx={{ display: 'flex' }}>
              <Box
                component={NextLink}
                href={link.href}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: { xs: 1.5, md: 2 },
                  py: '11px',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '11px', md: '12px' },
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: (link as { highlight?: boolean }).highlight ? '#f2622a' : '#a1a1aa',
                  textDecoration: 'none',
                  borderBottom: '2px solid transparent',
                  transition: 'color 0.15s, background 0.15s',
                  '&:hover': {
                    color: '#fff',
                    background: 'rgba(242,98,42,0.16)',
                    borderBottomColor: '#f2622a',
                  },
                }}
              >
                {link.label}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </header>
  );
}
