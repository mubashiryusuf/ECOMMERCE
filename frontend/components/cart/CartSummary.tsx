'use client';

import NextLink from 'next/link';
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import { ShoppingCartCheckout, ArrowForward } from '@mui/icons-material';
import { formatPrice } from '@/utils/formatters';
import type { Cart } from '@/types';

interface CartSummaryProps {
  cart: Cart;
}

/**
 * Cart order summary sidebar.
 * Shows per-item subtotals, total, and "Proceed to Checkout" CTA.
 */
export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        position: 'sticky',
        top: 80,
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
        Order Summary
      </Typography>

      {/* Item subtotals */}
      {cart.items.map((item) => (
        <Box
          key={item.id}
          sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mr: 1 }}>
            {item.product.name}{' '}
            <Typography component="span" variant="caption" color="text.disabled">
              ×{item.quantity}
            </Typography>
          </Typography>
          <Typography variant="body2" fontWeight={500} sx={{ flexShrink: 0 }}>
            {formatPrice(item.lineTotalCents)}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          {formatPrice(cart.totalCents)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        fullWidth
        component={NextLink}
        href="/checkout"
        endIcon={<ArrowForward />}
        startIcon={<ShoppingCartCheckout />}
      >
        Proceed to Checkout
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
        Free delivery on orders over $50
      </Typography>
    </Paper>
  );
}
