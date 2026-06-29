import NextLink from 'next/link';
import { Box, Typography, Chip } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';

interface OrderTableProps {
  orders: Order[];
  basePath?: string;
}

/**
 * Tabular list of orders for the admin panel.
 * Each row links to the order detail / status-update page.
 */
export function OrderTable({ orders, basePath = '/admin/orders' }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          No orders found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr 120px 120px 80px 48px',
          px: 2,
          py: 1.5,
          bgcolor: '#F8F9FA',
          borderBottom: '2px solid',
          borderColor: 'divider',
        }}
      >
        {['Order ID', 'Customer', 'Date', 'Total', 'Status', ''].map((col) => (
          <Typography
            key={col}
            variant="overline"
            sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem' }}
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
            gridTemplateColumns: '160px 1fr 120px 120px 80px 48px',
            px: 2,
            py: 1.5,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
            transition: 'background 0.1s ease',
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontFamily: 'monospace', color: 'primary.main' }}
          >
            #{order.id.slice(-8).toUpperCase()}
          </Typography>

          <Box>
            <Typography variant="body2" fontWeight={500} noWrap>
              {order.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {formatDate(order.createdAt)}
          </Typography>

          <Typography variant="body2" fontWeight={700}>
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
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
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
