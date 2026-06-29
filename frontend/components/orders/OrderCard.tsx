import NextLink from 'next/link';
import { Box, Typography, Paper } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

/**
 * Summary card for an order in the order history list.
 * Links to the order detail page.
 */
export function OrderCard({ order }: OrderCardProps) {
  return (
    <Paper
      elevation={0}
      component={NextLink}
      href={`/orders/${order.id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Order meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
          #{order.id.slice(-8).toUpperCase()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(order.createdAt)} &bull;{' '}
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Status badge */}
      <OrderStatusBadge status={order.status} />

      {/* Total */}
      <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ flexShrink: 0 }}>
        {formatPrice(order.totalCents)}
      </Typography>

      {/* Arrow */}
      <ChevronRight sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </Paper>
  );
}
