'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Alert } from '@mui/material';
import { adminApi } from '@/lib/api';
import { StatsCard } from '@/components/admin/StatsCard';
import { SalesChart } from '@/components/admin/SalesChart';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice } from '@/utils/formatters';
import type { DashboardStats } from '@/types';
import {
  AttachMoney,
  ShoppingCart,
  LocalShipping,
  Inventory,
} from '@mui/icons-material';

/**
 * Admin dashboard page.
 *
 * Displays:
 * - KPI stat cards (total sales, order counts by status)
 * - Top-selling products chart
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Box sx={{ p: 3 }}><PageLoader /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Sales',
      value: formatPrice(stats.totalSalesCents),
      icon: <AttachMoney />,
      color: '#2ECC71',
    },
    {
      label: 'Pending',
      value: stats.orderCountByStatus.PENDING ?? 0,
      icon: <ShoppingCart />,
      color: '#F39C12',
    },
    {
      label: 'Shipped',
      value: stats.orderCountByStatus.SHIPPED ?? 0,
      icon: <LocalShipping />,
      color: '#2980B9',
    },
    {
      label: 'Delivered',
      value: stats.orderCountByStatus.DELIVERED ?? 0,
      icon: <Inventory />,
      color: '#27AE60',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'text.primary' }}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <StatsCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SalesChart
            orderCountByStatus={stats.orderCountByStatus}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Top Products
            </Typography>
            {stats.topProducts.map((product, index) => (
              <Box
                key={product.productId}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index < stats.topProducts.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.unitsSold} units sold
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} color="secondary.main">
                  {formatPrice(product.revenueCents)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
