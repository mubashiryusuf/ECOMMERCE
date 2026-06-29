'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  MenuItem,
  TextField,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { adminApi, ordersApi } from '@/lib/api';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { OrderStatus } from '@/types';
import type { Order } from '@/types';

/**
 * Valid lifecycle transitions (enforced both here and server-side).
 *
 * pending → processing → shipped → delivered
 * Any status → cancelled (except delivered)
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

/**
 * Admin order detail page.
 * Shows full order info and allows status transitions via a dropdown.
 */
export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    ordersApi
      .getById(params.id)
      .then((o) => {
        setOrder(o);
        setNewStatus('');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Order not found');
      })
      .finally(() => setIsLoading(false));
  }, [params?.id]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const updated = await adminApi.updateOrderStatus(order.id, { status: newStatus });
      setOrder(updated);
      setNewStatus('');
      setUpdateSuccess(`Order status updated to ${newStatus}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update status';
      setUpdateError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const allowedNextStatuses = order ? ALLOWED_TRANSITIONS[order.status] : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button
        component={NextLink}
        href="/admin/orders"
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
        variant="text"
      >
        Back to orders
      </Button>

      {isLoading && <PageLoader />}
      {error && <Alert severity="error">{error}</Alert>}

      {!isLoading && order && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Order #{order.id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed {formatDateTime(order.createdAt)} · Customer ID: {order.userId.slice(-8)}
              </Typography>
            </Box>
            <OrderStatusBadge status={order.status} />
          </Box>

          {/* Status update */}
          {updateError && (
            <Alert severity="error" onClose={() => setUpdateError(null)}>
              {updateError}
            </Alert>
          )}
          {updateSuccess && (
            <Alert severity="success" onClose={() => setUpdateSuccess(null)}>
              {updateSuccess}
            </Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Update Status
              </Typography>
              {allowedNextStatuses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {order.status === OrderStatus.DELIVERED
                    ? 'Order has been delivered — no further transitions allowed.'
                    : 'Order is cancelled — no further transitions allowed.'}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    select
                    label="New status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    sx={{ minWidth: 200 }}
                  >
                    {allowedNextStatuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || isUpdating}
                  >
                    {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Update'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Order items */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Items
                  </Typography>
                  {order.items.map((item, index) => (
                    <Box key={item.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.product?.name ?? item.productId.slice(-8)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} × {formatPrice(item.unitPriceCents)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700}>
                          {formatPrice(item.lineTotalCents)}
                        </Typography>
                      </Box>
                      {index < order.items.length - 1 && <Divider />}
                    </Box>
                  ))}
                  <Divider sx={{ mt: 2, mb: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="secondary.main">
                      {formatPrice(order.totalCents)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Shipping + payment */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">{order.name}</Typography>
                  <Typography variant="body2">{order.addressLine1}</Typography>
                  <Typography variant="body2">
                    {order.city}, {order.postalCode}
                  </Typography>
                  <Typography variant="body2">{order.country}</Typography>
                  {order.paymentRef && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary">
                        Payment ref: {order.paymentRef}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
