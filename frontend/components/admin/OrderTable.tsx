import NextLink from 'next/link';
import { Box, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';

interface OrderTableProps {
  orders: Order[];
  basePath?: string;
}

export function OrderTable({ orders, basePath = '/admin/orders' }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
          No orders found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: '#fff',
        borderRadius: '14px',
        border: '1px solid #ededf0',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr 120px 120px 100px 48px',
          px: '20px',
          py: '12px',
          background: '#f7f7f8',
          borderBottom: '1px solid #ededf0',
        }}
      >
        {['Order ID', 'Customer', 'Date', 'Total', 'Status', ''].map((col) => (
          <Typography
            key={col}
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '11px',
              color: '#71717a',
            }}
          >
            {col}
          </Typography>
        ))}
      </Box>

      {/* Data rows */}
      {orders.map((order) => (
        <Box
          key={order.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 120px 120px 100px 48px',
            px: '20px',
            py: '14px',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f1',
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { background: 'rgba(242,98,42,0.03)' },
            transition: 'background 0.1s ease',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#f2622a',
            }}
          >
            #{order.id.slice(-8).toUpperCase()}
          </Typography>

          <Box>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: '13.5px', color: '#18181b' }} noWrap>
              {order.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
            {formatDate(order.createdAt)}
          </Typography>

          <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', color: '#18181b' }}>
            {formatPrice(order.totalCents)}
          </Typography>

          <OrderStatusBadge status={order.status} />

          <Box
            component={NextLink}
            href={`${basePath}/${order.id}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a1a1aa',
              '&:hover': { color: '#f2622a' },
              transition: 'color 0.15s ease',
            }}
            aria-label={`View order ${order.id}`}
          >
            <Visibility fontSize="small" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
