'use client';

import NextLink from 'next/link';
import { Box, Typography } from '@mui/material';
import { formatPrice } from '@/utils/formatters';
import type { Cart } from '@/types';

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <Box
      sx={{
        border: '1px solid #ededf0',
        borderRadius: '18px',
        p: '26px',
        background: '#fafafa',
        position: 'sticky',
        top: 90,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          fontSize: '22px',
          mb: '20px',
          color: '#18181b',
        }}
      >
        Order Summary
      </Typography>

      {/* Item breakdown */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pb: '18px', borderBottom: '1px solid #e7e7ea' }}>
        {cart.items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '13px',
                color: '#71717a',
                flex: 1,
                mr: 1,
              }}
            >
              {item.product.name}{' '}
              <Box component="span" sx={{ color: '#a1a1aa', fontSize: '12px' }}>
                ×{item.quantity}
              </Box>
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
              {formatPrice(item.lineTotalCents)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Shipping */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '18px', pb: '14px', borderBottom: '1px solid #e7e7ea' }}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a' }}>
          Shipping
        </Typography>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
          {cart.totalCents >= 20000 ? 'Free' : formatPrice(999)}
        </Typography>
      </Box>

      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: '18px' }}>
        <Typography
          sx={{
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            textTransform: 'uppercase',
            color: '#18181b',
          }}
        >
          Total
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Saira", sans-serif',
            fontWeight: 800,
            fontSize: '26px',
            color: '#f2622a',
          }}
        >
          {formatPrice(cart.totalCents)}
        </Typography>
      </Box>

      {/* CTA */}
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
          letterSpacing: '0.05em',
          fontSize: '15px',
          textDecoration: 'none',
          transition: 'transform 0.12s ease, background 0.2s ease',
          '&:hover': { background: '#d94e18' },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        Proceed to Checkout
      </Box>

      <Typography
        sx={{
          textAlign: 'center',
          fontFamily: '"Manrope", sans-serif',
          fontSize: '12px',
          color: '#a1a1aa',
          mt: '14px',
        }}
      >
        🔒 Secure checkout · 30-day returns
      </Typography>
    </Box>
  );
}
