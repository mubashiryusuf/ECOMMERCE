'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Typography, Alert } from '@mui/material';
import { useCart } from '@/lib/hooks/useCart';
import { CartItemRow } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function CartPage() {
  const { cart, isLoading, error, refetch } = useCart();

  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5' }}>
      <Navbar />
      <Box component="main" sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

        <Typography
          component="h1"
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '38px',
            mb: '6px',
            color: '#18181b',
          }}
        >
          Your Cart
        </Typography>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 3 }}>
          {cart?.items?.length || 0} items in your bag
        </Typography>

        {isLoading && <PageLoader />}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {!isLoading && !error && (!cart || cart.items.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box sx={{ fontSize: '64px', mb: 2 }}>🛒</Box>
            <Typography
              sx={{
                fontFamily: '"Saira Condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: '28px',
                color: '#18181b',
                mb: 1,
              }}
            >
              Your Cart is Empty
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
              Browse our catalog and find something great
            </Typography>
            <Box
              component={NextLink}
              href="/"
              sx={{
                display: 'inline-block',
                background: '#f2622a',
                color: '#fff',
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '14px',
                padding: '14px 36px',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'background 0.2s',
                '&:hover': { background: '#d94e18' },
              }}
            >
              Continue Shopping
            </Box>
          </Box>
        )}

        {!isLoading && cart && cart.items.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
              gap: 4,
              alignItems: 'flex-start',
            }}
          >
            {/* Cart items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
              <Box
                component={NextLink}
                href="/"
                sx={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  color: '#f2622a',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  mt: 1,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                ← Continue Shopping
              </Box>
            </Box>

            {/* Order summary */}
            <CartSummary cart={cart} />
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
