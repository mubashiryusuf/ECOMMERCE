'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ordersApi } from '@/lib/api';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import type { Order } from '@/types';

/**
 * Single order detail page.
 * Shows order items, shipping address, status, and totals.
 * Accessible only to the owning user (enforced server-side by the API).
 */
export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    setIsLoading(true);
    ordersApi
      .getById(params.id)
      .then(setOrder)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Order not found');
      })
      .finally(() => setIsLoading(false));
  }, [params?.id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}
      >
        <Button
          component={NextLink}
          href="/orders"
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
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDateTime(order.createdAt)}
                </Typography>
              </Box>
              <OrderStatusBadge status={order.status} />
            </Box>

            <Grid container spacing={3}>
              {/* Order items */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                      Items Ordered
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
                            <Typography variant="body1" fontWeight={600}>
                              {item.product?.name ?? `Product ${item.productId.slice(-6)}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {item.quantity} × {formatPrice(item.unitPriceCents)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight={700}>
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
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        {formatPrice(order.totalCents)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Shipping details */}
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
      <Footer />
    </Box>
  );
}
