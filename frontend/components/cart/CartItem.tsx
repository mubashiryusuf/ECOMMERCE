'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { useCart } from '@/lib/hooks/useCart';
import { useSnackbar } from 'notistack';
import { formatPrice } from '@/utils/formatters';
import type { CartItem as CartItemType } from '@/types';

interface CartItemRowProps {
  item: CartItemType;
}

/**
 * Single cart item row.
 * Shows product image, name, price per unit, quantity selector, line total, and remove button.
 */
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not update quantity';
      enqueueSnackbar(message, { variant: 'error' });
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
        alignItems: 'center',
        gap: 2,
        py: 2,
        opacity: isUpdating ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Product image */}
      <Box
        component="img"
        src={item.product.imageUrl || 'https://placehold.co/80x80?text=No+Image'}
        alt={item.product.name}
        sx={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: 2,
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'divider',
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
        }}
      />

      {/* Product info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {item.product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPrice(item.product.priceCents)} each
        </Typography>
        {item.product.stockQuantity <= 5 && item.product.stockQuantity > 0 && (
          <Typography variant="caption" color="warning.main">
            Only {item.product.stockQuantity} left
          </Typography>
        )}
      </Box>

      {/* Quantity controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Remove fontSize="small" />
        </IconButton>

        {isUpdating ? (
          <CircularProgress size={20} sx={{ mx: 1 }} />
        ) : (
          <TextField
            value={item.quantity}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 1) handleQuantityChange(v);
            }}
            type="number"
            size="small"
            sx={{ width: 56 }}
            inputProps={{
              min: 1,
              max: item.product.stockQuantity,
              style: { textAlign: 'center', padding: '4px 8px' },
            }}
          />
        )}

        <IconButton
          size="small"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating || item.quantity >= item.product.stockQuantity}
          aria-label="Increase quantity"
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>

      {/* Line total */}
      <Typography
        variant="body1"
        fontWeight={700}
        sx={{ minWidth: 80, textAlign: 'right', flexShrink: 0 }}
      >
        {formatPrice(item.lineTotalCents)}
      </Typography>

      {/* Remove */}
      <IconButton
        onClick={handleRemove}
        color="error"
        size="small"
        disabled={isUpdating}
        aria-label={`Remove ${item.product.name}`}
      >
        <Delete />
      </IconButton>
    </Box>
  );
}
