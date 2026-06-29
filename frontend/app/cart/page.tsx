'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { useCart } from '@/lib/hooks/useCart';
import { CartItemRow } from '@/components/cart/CartItem';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPrice } from '@/utils/formatters';

// Style constants
const summaryCardSx = {
  background: '#fff',
  border: '1px solid #ededf0',
  borderRadius: '16px',
  p: '24px',
  alignSelf: 'start',
  position: 'sticky' as const,
  top: 24,
};

const labelSx = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: '14px',
  color: '#71717a',
};

const valueSx = {
  fontFamily: '"Manrope", sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  color: '#18181b',
};

function EmptyCartState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '22px',
          background: '#f4f4f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: '#d1d5db',
        }}
      >
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6h15l-1.5 9h-12z" />
          <circle cx="9" cy="20" r="1.6" />
          <circle cx="18" cy="20" r="1.6" />
          <path d="M6 6 5 2H2" />
        </svg>
      </Box>
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          fontSize: '28px',
          color: '#18181b',
          mb: '8px',
        }}
      >
        Your Cart Is Empty
      </Typography>
      <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 4 }}>
        Add some items and come back!
      </Typography>
      <Box
        component={NextLink}
        href="/"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 48,
          px: '28px',
          background: '#f2622a',
          borderRadius: '12px',
          fontFamily: '"Saira", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '13px',
          color: '#fff',
          textDecoration: 'none',
          transition: 'background 0.2s',
          '&:hover': { background: '#d94e18' },
        }}
      >
        Start Shopping
      </Box>
    </Box>
  );
}

export default function CartPage() {
  const { cart, isLoading, refetch } = useCart();

  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const itemCount = cart?.items?.length ?? 0;
  const subtotalCents = cart?.totalCents ?? 0;
  const shippingCents = subtotalCents >= 20000 ? 0 : 999;
  const grandTotalCents = subtotalCents + shippingCents;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 5, width: '100%' }}>
        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '44px',
              color: '#18181b',
              lineHeight: 1,
              mb: '4px',
            }}
          >
            Your Cart
          </Typography>
          {!isLoading && itemCount > 0 && (
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Typography>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#f2622a' }} size={40} />
          </Box>
        ) : itemCount === 0 ? (
          <EmptyCartState />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Items list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart!.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
              <Box
                component={NextLink}
                href="/"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#f2622a',
                  textDecoration: 'none',
                  mt: '4px',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                ← Continue Shopping
              </Box>
            </Box>

            {/* Order summary */}
            <Box sx={summaryCardSx}>
              <Typography
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '13px',
                  color: '#71717a',
                  mb: '18px',
                }}
              >
                Order Summary
              </Typography>

              {/* Item lines */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mb: '14px' }}>
                {cart!.items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Box
                      sx={{
                        fontFamily: '"Manrope", sans-serif',
                        fontSize: '13px',
                        color: '#71717a',
                        flex: 1,
                        mr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.product.name}
                      <Box component="span" sx={{ color: '#a1a1aa', fontSize: '11px', ml: '4px' }}>
                        ×{item.quantity}
                      </Box>
                    </Box>
                    <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', fontWeight: 600, color: '#18181b', flexShrink: 0 }}>
                      {formatPrice(item.lineTotalCents)}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: '#f0f0f1', mb: '14px' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '10px' }}>
                <Box sx={labelSx}>Subtotal</Box>
                <Box sx={valueSx}>{formatPrice(subtotalCents)}</Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '14px' }}>
                <Box sx={labelSx}>Shipping</Box>
                <Box sx={{ ...valueSx, color: shippingCents === 0 ? '#16a34a' : '#18181b' }}>
                  {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#f0f0f1', mb: '14px' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '20px' }}>
                <Box sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#18181b' }}>
                  Total
                </Box>
                <Box sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontSize: '30px', color: '#f2622a' }}>
                  {formatPrice(grandTotalCents)}
                </Box>
              </Box>

              <Box
                component={NextLink}
                href="/checkout"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: 54,
                  background: '#f2622a',
                  color: '#fff',
                  borderRadius: '12px',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  '&:hover': { background: '#d94e18' },
                  mb: '12px',
                }}
              >
                Proceed to Checkout
              </Box>

              <Box sx={{ textAlign: 'center', fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
                🔒 Secure checkout · 30-day returns · Free shipping over $200
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
