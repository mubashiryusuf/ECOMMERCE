'use client';

import { useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Receipt } from '@mui/icons-material';

/**
 * Order history page — lists all orders for the current authenticated user.
 */
export default function OrdersPage() {
  const { orders, isLoading, error, fetchOrders } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ flex: 1, maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 4, width: '100%' }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '38px',
            mb: '6px',
            color: '#18181b',
          }}
        >
          My Orders
        </Typography>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 3 }}>
          Track and manage your purchases
        </Typography>

        {isLoading && <PageLoader />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your completed orders will appear here
            </Typography>
          </Box>
        )}

        {!isLoading && orders.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
