'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ordersApi } from '@/lib/api';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import type { Order } from '@/types';

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 3 }, py: 5 }}
      >
        {/* Back link */}
        <Box
          component={NextLink}
          href="/orders"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            mb: 3,
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            color: '#71717a',
            textDecoration: 'none',
            '&:hover': { color: '#f2622a' },
          }}
        >
          <ArrowBack sx={{ fontSize: 17 }} />
          Back to orders
        </Box>

        {isLoading && <PageLoader />}
        {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}

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
                <Typography
                  sx={{
                    fontFamily: '"Saira Condensed", sans-serif',
                    fontWeight: 800,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    fontSize: '36px',
                    color: '#18181b',
                    lineHeight: 1,
                    mb: '4px',
                  }}
                >
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
                  Placed on {formatDateTime(order.createdAt)}
                </Typography>
              </Box>
              <OrderStatusBadge status={order.status} size="medium" />
            </Box>

            {/* Content grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' }, gap: 3 }}>
              {/* Order items card */}
              <Box
                sx={{
                  background: '#fff',
                  border: '1px solid #ededf0',
                  borderRadius: '16px',
                  p: '24px',
                }}
              >
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
                  Items Ordered
                </Typography>

                {order.items.map((item, index) => (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: '14px',
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: '14px', color: '#18181b' }}
                        >
                          {item.product?.name ?? `Product ${item.productId.slice(-6)}`}
                        </Typography>
                        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
                          Qty: {item.quantity} × {formatPrice(item.unitPriceCents)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '15px', color: '#18181b' }}
                      >
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
                  <Typography
                    sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '13px', color: '#71717a' }}
                  >
                    Order Total
                  </Typography>
                  <Typography
                    sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '22px', color: '#f2622a' }}
                  >
                    {formatPrice(order.totalCents)}
                  </Typography>
                </Box>
              </Box>

              {/* Shipping + payment card */}
              <Box
                sx={{
                  background: '#fff',
                  border: '1px solid #ededf0',
                  borderRadius: '16px',
                  p: '24px',
                  alignSelf: 'start',
                }}
              >
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
                    <Typography
                      sx={{
                        fontFamily: '"Saira", sans-serif',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontSize: '11px',
                        color: '#a1a1aa',
                        mb: '6px',
                      }}
                    >
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
      <Footer />
    </Box>
  );
}
