'use client';

import { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useCart } from '@/lib/hooks/useCart';
import { useSnackbar } from 'notistack';
import { formatPrice } from '@/utils/formatters';
import { getErrorMessage } from '@/lib/errors';
import { resolveImageUrl } from '@/lib/images';
import type { CartItem as CartItemType } from '@/types';

interface CartItemRowProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stockQuantity) {
      enqueueSnackbar(`Only ${item.product.stockQuantity} in stock`, { variant: 'warning' });
      return;
    }
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (err: unknown) {
      enqueueSnackbar(getErrorMessage(err, 'Could not update quantity'), { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
      enqueueSnackbar(`${item.product.name} removed`, { variant: 'info' });
    } catch {
      enqueueSnackbar('Could not remove item', { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2.5,
        border: '1px solid #ededf0',
        borderRadius: '16px',
        padding: '16px',
        background: '#fff',
        opacity: isUpdating ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: 104,
          height: 104,
          background: '#f1f1f3',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={resolveImageUrl(item.product.imageUrl, 'https://placehold.co/104x104?text=No+Image')}
          alt={item.product.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/104x104?text=No+Image';
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {item.product.category}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                mt: '3px',
                color: '#18181b',
              }}
            >
              {item.product.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12.5px', color: '#71717a' }}>
              {formatPrice(item.product.priceCents)} each
            </Typography>
          </Box>
          {/* Remove button */}
          <Box
            component="button"
            onClick={handleRemove}
            disabled={isUpdating}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a1a1aa',
              height: 'fit-content',
              p: '4px',
              borderRadius: '6px',
              '&:hover': { color: '#e63946', background: '#fef2f2' },
              transition: 'color 0.15s, background 0.15s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
            </svg>
          </Box>
        </Box>

        {/* Quantity + total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #e7e7ea',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <Box
              component="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              sx={{
                width: 36,
                height: 36,
                border: 'none',
                background: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                '&:hover': { background: '#f4f4f5' },
                '&:disabled': { color: '#a1a1aa', cursor: 'not-allowed' },
              }}
            >
              −
            </Box>
            {isUpdating ? (
              <Box sx={{ width: 34, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={14} sx={{ color: '#f2622a' }} />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 34,
                  textAlign: 'center',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                }}
              >
                {item.quantity}
              </Box>
            )}
            <Box
              component="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stockQuantity}
              sx={{
                width: 36,
                height: 36,
                border: 'none',
                background: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                '&:hover': { background: '#f4f4f5' },
                '&:disabled': { color: '#a1a1aa', cursor: 'not-allowed' },
              }}
            >
              +
            </Box>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              color: '#18181b',
            }}
          >
            {formatPrice(item.lineTotalCents)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
