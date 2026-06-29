'use client';

import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { OrderStatus } from '@/types';
import type { DashboardStats } from '@/types';

interface SalesChartProps {
  orderCountByStatus: DashboardStats['orderCountByStatus'];
}

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.PENDING]: '#F39C12',
  [OrderStatus.PROCESSING]: '#2980B9',
  [OrderStatus.SHIPPED]: '#8E44AD',
  [OrderStatus.DELIVERED]: '#27AE60',
  [OrderStatus.CANCELLED]: '#E74C3C',
};

/**
 * Bar chart showing order count by status.
 * Uses Recharts (not MUI X Charts) as Recharts is more stable for SSR.
 *
 * NOTE: MOCK — uses the order count data from /admin/dashboard/stats.
 * In production you'd also add a revenue-over-time line chart.
 */
export function SalesChart({ orderCountByStatus }: SalesChartProps) {
  const chartData = Object.entries(orderCountByStatus).map(([status, count]) => ({
    status,
    count: count ?? 0,
    color: STATUS_COLORS[status] ?? '#6B7280',
  }));

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={3}>
        Orders by Status
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          barCategoryGap="35%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => [value, 'Orders']}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
