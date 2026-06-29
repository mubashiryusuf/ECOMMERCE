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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
          Order History
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
