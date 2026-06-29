'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Drawer, CircularProgress, Divider } from '@mui/material';
import { useCart } from '@/lib/hooks/useCart';
import { CartItemRow } from './CartItem';
import { formatPrice } from '@/utils/formatters';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        textAlign: 'center',
      }}
    >
      {/* Bag illustration */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: '#f4f4f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: '#d1d5db',
        }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6h15l-1.5 9h-12z" />
          <circle cx="9" cy="20" r="1.6" />
          <circle cx="18" cy="20" r="1.6" />
          <path d="M6 6 5 2H2" />
        </svg>
      </Box>
      <Box
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          fontSize: '22px',
          color: '#18181b',
          mb: '8px',
        }}
      >
        Your Bag is Empty
      </Box>
      <Box
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontSize: '14px',
          color: '#71717a',
          mb: 4,
          lineHeight: 1.55,
        }}
      >
        Looks like you haven&apos;t added anything yet.
      </Box>
      <Box
        component={NextLink}
        href="/"
        onClick={onClose}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 46,
          px: '28px',
          background: '#f2622a',
          borderRadius: '10px',
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

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, isLoading, refetch } = useCart();

  useEffect(() => {
    if (open) refetch();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemCount = cart?.items?.length ?? 0;
  const shipping = (cart?.totalCents ?? 0) >= 20000 ? 0 : 999;
  const grandTotal = (cart?.totalCents ?? 0) + shipping;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          boxShadow: '-4px 0 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '24px',
          py: '18px',
          borderBottom: '1px solid #f0f0f1',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '22px',
              color: '#18181b',
              letterSpacing: '0.02em',
            }}
          >
            Your Cart
          </Box>
          {itemCount > 0 && (
            <Box
              sx={{
                minWidth: 22,
                height: 22,
                borderRadius: '11px',
                background: '#f2622a',
                color: '#fff',
                fontFamily: '"Saira", sans-serif',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: '6px',
              }}
            >
              {itemCount}
            </Box>
          )}
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#71717a',
            display: 'flex',
            alignItems: 'center',
            p: '6px',
            borderRadius: '8px',
            '&:hover': { background: '#f4f4f5', color: '#18181b' },
            transition: 'background 0.15s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress sx={{ color: '#f2622a' }} size={32} />
          </Box>
        ) : !cart || itemCount === 0 ? (
          <EmptyCart onClose={onClose} />
        ) : (
          <Box sx={{ px: '20px', py: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}

            {/* Continue shopping link */}
            <Box
              component={NextLink}
              href="/"
              onClick={onClose}
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
        )}
      </Box>

      {/* ── Footer summary (only when items exist) ── */}
      {!isLoading && cart && itemCount > 0 && (
        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid #f0f0f1',
            background: '#fff',
            px: '24px',
            pt: '20px',
            pb: '24px',
          }}
        >
          {/* Item subtotals */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mb: '14px' }}>
            {cart.items.map((item) => (
              <Box
                key={item.id}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
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
                <Box
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#18181b',
                    flexShrink: 0,
                  }}
                >
                  {formatPrice(item.lineTotalCents)}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: '#f0f0f1', mb: '14px' }} />

          {/* Shipping */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '10px' }}>
            <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a' }}>
              Shipping
            </Box>
            <Box
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: shipping === 0 ? '#16a34a' : '#18181b',
              }}
            >
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </Box>
          </Box>

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '20px' }}>
            <Box
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#18181b',
              }}
            >
              Total
            </Box>
            <Box
              sx={{
                fontFamily: '"Saira Condensed", sans-serif',
                fontWeight: 800,
                fontSize: '28px',
                color: '#f2622a',
                letterSpacing: '0.01em',
              }}
            >
              {formatPrice(grandTotal)}
            </Box>
          </Box>

          {/* Checkout CTA */}
          <Box
            component={NextLink}
            href="/checkout"
            onClick={onClose}
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
              '&:active': { transform: 'scale(0.98)' },
              mb: '12px',
            }}
          >
            Proceed to Checkout
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              fontFamily: '"Manrope", sans-serif',
              fontSize: '12px',
              color: '#a1a1aa',
            }}
          >
            🔒 Secure checkout · 30-day returns · Free shipping over $200
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
