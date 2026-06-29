'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Alert,
  TextField,
  MenuItem,
  Chip,
  Button,
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

/**
 * Admin orders list page.
 * Shows all orders across all users with status filter.
 */
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
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
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Orders
        </Typography>
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 120px 120px 100px 100px',
              px: 2,
              py: 1.5,
              bgcolor: '#F8F9FA',
              borderBottom: '2px solid',
              borderColor: 'divider',
            }}
          >
            {['Order ID', 'Customer', 'Date', 'Total', 'Items', 'Status'].map((col) => (
              <Typography
                key={col}
                variant="overline"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                {col}
              </Typography>
            ))}
          </Box>

          {filteredOrders.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No orders found.
              </Typography>
            </Box>
          )}

          {filteredOrders.map((order) => (
            <Box
              key={order.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 180px 120px 120px 100px 100px',
                px: 2,
                py: 1.5,
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
              }}
            >
              <Box>
                <Button
                  component={NextLink}
                  href={`/admin/orders/${order.id}`}
                  size="small"
                  startIcon={<Visibility fontSize="small" />}
                  sx={{ fontFamily: 'monospace', fontWeight: 700, textTransform: 'none' }}
                >
                  #{order.id.slice(-8).toUpperCase()}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {order.userId.slice(-8)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(order.createdAt)}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatPrice(order.totalCents)}
              </Typography>
              <Chip
                label={`${order.items?.length ?? 0} items`}
                size="small"
                sx={{ borderRadius: 1 }}
              />
              <OrderStatusBadge status={order.status} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
