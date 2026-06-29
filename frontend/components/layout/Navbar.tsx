'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  SportsSoccer,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

/**
 * Storefront top navigation bar.
 *
 * Layout (sportsplus.pk pattern):
 * - Left: logo
 * - Right: cart icon with item count badge, account menu
 *
 * The CategoryStrip (horizontal category chips) sits below the AppBar
 * and is rendered separately in CatalogPage.
 */
export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Box
          component={NextLink}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1,
          }}
        >
          <SportsSoccer sx={{ fontSize: 28, color: 'secondary.main' }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: '-0.01em', display: { xs: 'none', sm: 'block' } }}
          >
            SportsPlusStore
          </Typography>
        </Box>

        {/* Cart */}
        <IconButton
          color="inherit"
          component={NextLink}
          href="/cart"
          aria-label={`Cart — ${itemCount} items`}
        >
          <Badge badgeContent={itemCount} color="error" max={99}>
            <ShoppingCart />
          </Badge>
        </IconButton>

        {/* Account */}
        {isAuthenticated ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleAccountClick}
              aria-label="Account menu"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem component={NextLink} href="/orders" onClick={handleMenuClose}>
                My Orders
              </MenuItem>
              {user?.role === 'ADMIN' && (
                <MenuItem component={NextLink} href="/admin" onClick={handleMenuClose}>
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                Sign out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="outlined"
            size="small"
            component={NextLink}
            href="/login"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.4)',
              '&:hover': { borderColor: 'white' },
            }}
          >
            Sign in
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
