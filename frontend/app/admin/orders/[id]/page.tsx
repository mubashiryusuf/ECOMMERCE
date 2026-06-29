'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Alert,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { adminApi } from '@/lib/api';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { OrderStatus } from '@/types';
import type { Order } from '@/types';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

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
    adminApi
      .getOrderById(params.id)
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
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Back link */}
      <Box
        component={NextLink}
        href="/admin/orders"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          mb: 3,
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 600,
          fontSize: '13px',
          color: '#71717a',
          textDecoration: 'none',
          '&:hover': { color: '#f2622a' },
        }}
      >
        <ArrowBack sx={{ fontSize: 16 }} />
        Back to orders
      </Box>

      {isLoading && <PageLoader />}
      {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}

      {!isLoading && order && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Saira Condensed", sans-serif',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  textTransform: 'uppercase',
                  fontSize: '32px',
                  color: '#18181b',
                  lineHeight: 1,
                  mb: '4px',
                }}
              >
                Order #{order.id.slice(-8).toUpperCase()}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
                Placed {formatDateTime(order.createdAt)} · Customer: {order.userId.slice(-8)}
              </Typography>
            </Box>
            <OrderStatusBadge status={order.status} size="medium" />
          </Box>

          {updateError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }} onClose={() => setUpdateError(null)}>
              {updateError}
            </Alert>
          )}
          {updateSuccess && (
            <Alert severity="success" sx={{ borderRadius: '12px' }} onClose={() => setUpdateSuccess(null)}>
              {updateSuccess}
            </Alert>
          )}

          {/* Status update card */}
          <Box sx={{ background: '#fff', border: '1px solid #ededf0', borderRadius: '16px', p: '24px' }}>
            <Typography
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: '13px',
                color: '#71717a',
                mb: '18px',
              }}
            >
              Update Status
            </Typography>

            {allowedNextStatuses.length === 0 ? (
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
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
                  size="small"
                >
                  {allowedNextStatuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>

                <Box
                  component="button"
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || isUpdating}
                  sx={{
                    height: 40,
                    px: '20px',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#f2622a',
                    color: '#fff',
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '13px',
                    cursor: !newStatus || isUpdating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease',
                    '&:hover:not(:disabled)': { background: '#d94e18' },
                    '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
                  }}
                >
                  {isUpdating && <CircularProgress size={14} sx={{ color: '#fff' }} />}
                  {isUpdating ? 'Updating…' : 'Update'}
                </Box>
              </Box>
            )}
          </Box>

          {/* Content grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' }, gap: 3 }}>
            {/* Items card */}
            <Box sx={{ background: '#fff', border: '1px solid #ededf0', borderRadius: '16px', p: '24px' }}>
              <Typography
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '13px',
                  color: '#71717a',
                  mb: '18px',
                }}
              >
                Items
              </Typography>

              {order.items.map((item, index) => (
                <Box key={item.id}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '13px' }}
                  >
                    <Box>
                      <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: '14px', color: '#18181b' }}>
                        {item.product?.name ?? item.productId.slice(-8)}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
                        {item.quantity} × {formatPrice(item.unitPriceCents)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', color: '#18181b' }}>
                      {formatPrice(item.lineTotalCents)}
                    </Typography>
                  </Box>
                  {index < order.items.length - 1 && (
                    <Box sx={{ height: '1px', background: '#f0f0f1' }} />
                  )}
                </Box>
              ))}

              <Box sx={{ height: '1px', background: '#ededf0', mt: 2, mb: '14px' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '13px', color: '#71717a' }}>
                  Order Total
                </Typography>
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '22px', color: '#f2622a' }}>
                  {formatPrice(order.totalCents)}
                </Typography>
              </Box>
            </Box>

            {/* Shipping card */}
            <Box sx={{ background: '#fff', border: '1px solid #ededf0', borderRadius: '16px', p: '24px', alignSelf: 'start' }}>
              <Typography
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '13px',
                  color: '#71717a',
                  mb: '18px',
                }}
              >
                Shipping Address
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: '14px', color: '#18181b' }}>
                {order.name}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#52525b', mt: '4px' }}>
                {order.addressLine1}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#52525b' }}>
                {order.city}, {order.postalCode}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#52525b' }}>
                {order.country}
              </Typography>

              {order.paymentRef && (
                <>
                  <Box sx={{ height: '1px', background: '#ededf0', my: '18px' }} />
                  <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px', color: '#a1a1aa', mb: '6px' }}>
                    Payment Reference
                  </Typography>
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#52525b' }}>
                    {order.paymentRef}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
