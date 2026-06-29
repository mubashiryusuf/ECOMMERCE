'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { ShoppingCart, ArrowForward } from '@mui/icons-material';
import { useCart } from '@/lib/hooks/useCart';
import { CartItemRow } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Cart page — client component (needs real-time cart state + mutations).
 */
export default function CartPage() {
  const { cart, isLoading, error, refetch } = useCart();

  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
          Your Cart
        </Typography>

        {isLoading && <PageLoader />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && (!cart || cart.items.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse our catalog and add some items
            </Typography>
            <Button
              variant="contained"
              component={NextLink}
              href="/"
              endIcon={<ArrowForward />}
            >
              Continue shopping
            </Button>
          </Box>
        )}

        {!isLoading && cart && cart.items.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
              gap: 3,
            }}
          >
            {/* Cart items list */}
            <Box>
              {cart.items.map((item, index) => (
                <Box key={item.id}>
                  <CartItemRow item={item} />
                  {index < cart.items.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Box>

            {/* Order summary sidebar */}
            <CartSummary cart={cart} />
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
