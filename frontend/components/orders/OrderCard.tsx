import NextLink from 'next/link';
import { Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Box
      component={NextLink}
      href={`/orders/${order.id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: '18px 20px',
        background: '#fff',
        border: '1px solid #ededf0',
        borderRadius: '14px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: '#f2622a',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Order meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '17px',
            color: '#18181b',
            letterSpacing: '0.02em',
          }}
        >
          #{order.id.slice(-8).toUpperCase()}
        </Typography>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
          {formatDate(order.createdAt)} &bull;{' '}
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Status badge */}
      <OrderStatusBadge status={order.status} />

      {/* Total */}
      <Typography
        sx={{
          fontFamily: '"Saira", sans-serif',
          fontWeight: 800,
          fontSize: '17px',
          color: '#f2622a',
          flexShrink: 0,
        }}
      >
        {formatPrice(order.totalCents)}
      </Typography>

      {/* Arrow */}
      <ChevronRight sx={{ color: '#a1a1aa', flexShrink: 0 }} />
    </Box>
  );
}
