'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { adminApi } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice, formatDate } from '@/utils/formatters';
import { OrderStatus } from '@/types';
import type { Order } from '@/types';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: OrderStatus.PENDING, label: 'Pending' },
  { value: OrderStatus.PROCESSING, label: 'Processing' },
  { value: OrderStatus.SHIPPED, label: 'Shipped' },
  { value: OrderStatus.DELIVERED, label: 'Delivered' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    adminApi
      .listAllOrders()
      .then(setOrders)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '30px',
              color: '#18181b',
            }}
          >
            Orders
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            {statusFilter ? ` matching ${statusFilter.toLowerCase()}` : ' total'}
          </Typography>
        </Box>

        <TextField
          select
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
          size="small"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <Box
          sx={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #ededf0',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 120px 120px 110px 48px',
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

          {filteredOrders.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
                No orders found.
              </Typography>
            </Box>
          )}

          {filteredOrders.map((order) => (
            <Box
              key={order.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 180px 120px 120px 110px 48px',
                px: '20px',
                py: '14px',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f1',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { background: 'rgba(242,98,42,0.03)' },
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

              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#52525b' }} noWrap>
                {order.userId.slice(-8)}
              </Typography>

              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
                {formatDate(order.createdAt)}
              </Typography>

              <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', color: '#18181b' }}>
                {formatPrice(order.totalCents)}
              </Typography>

              <OrderStatusBadge status={order.status} />

              <Box
                component={NextLink}
                href={`/admin/orders/${order.id}`}
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
      )}
    </Box>
  );
}
