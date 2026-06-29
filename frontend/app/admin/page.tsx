'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Alert } from '@mui/material';
import { adminApi } from '@/lib/api';
import { StatsCard } from '@/components/admin/StatsCard';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice } from '@/utils/formatters';
import type { DashboardStats } from '@/types';
import {
  AttachMoney,
  ShoppingCart,
  LocalShipping,
  Inventory,
} from '@mui/icons-material';

const SalesChart = dynamic(
  () => import('@/components/admin/SalesChart').then((m) => ({ default: m.SalesChart })),
  { ssr: false }
);

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
    { label: 'Total Sales', value: formatPrice(stats.totalSalesCents), icon: <AttachMoney />, color: '#16a34a' },
    { label: 'Pending', value: stats.orderCountByStatus.PENDING ?? 0, icon: <ShoppingCart />, color: '#f59e0b' },
    { label: 'Shipped', value: stats.orderCountByStatus.SHIPPED ?? 0, icon: <LocalShipping />, color: '#1d4ed8' },
    { label: 'Delivered', value: stats.orderCountByStatus.DELIVERED ?? 0, icon: <Inventory />, color: '#16a34a' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '30px',
              m: 0,
              color: '#18181b',
            }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
            Welcome back — here&apos;s your store at a glance
          </Typography>
        </Box>
      </Box>

      {/* KPI stat cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: '22px',
        }}
      >
        {statCards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </Box>

      {/* Charts + Top Products */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 2 }}>
        <Box
          sx={{
            background: '#fff',
            border: '1px solid #ededf0',
            borderRadius: '14px',
            p: '22px',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: '20px',
              color: '#18181b',
            }}
          >
            Orders by Status
          </Typography>
          <SalesChart orderCountByStatus={stats.orderCountByStatus} />
        </Box>

        <Box
          sx={{
            background: '#fff',
            border: '1px solid #ededf0',
            borderRadius: '14px',
            p: '22px',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: '20px',
              color: '#18181b',
            }}
          >
            Top Products
          </Typography>
          {stats.topProducts.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#a1a1aa' }}>
                No sales data yet
              </Typography>
            </Box>
          ) : (
            stats.topProducts.map((product, index) => (
              <Box
                key={product.productId}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: '12px',
                  borderBottom: index < stats.topProducts.length - 1 ? '1px solid #f0f0f1' : 'none',
                }}
              >
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#a1a1aa' }}>
                    {product.unitsSold} units sold
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#f2622a',
                  }}
                >
                  {formatPrice(product.revenueCents)}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
