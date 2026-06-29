'use client';

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
  [OrderStatus.PENDING]: '#f59e0b',
  [OrderStatus.PROCESSING]: '#1d4ed8',
  [OrderStatus.SHIPPED]: '#7c3aed',
  [OrderStatus.DELIVERED]: '#16a34a',
  [OrderStatus.CANCELLED]: '#e63946',
};

export function SalesChart({ orderCountByStatus }: SalesChartProps) {
  const chartData = Object.entries(orderCountByStatus).map(([status, count]) => ({
    status,
    count: count ?? 0,
    color: STATUS_COLORS[status] ?? '#a1a1aa',
  }));

  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {chartData.map((d) => (
            <div
              key={d.status}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: `${d.color}22`,
                border: `1.5px solid ${d.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, opacity: 0.5 }} />
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: '#a1a1aa', margin: 0 }}>
          No orders yet — chart will appear here
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 8, left: -8, bottom: 4 }}
        barCategoryGap="38%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f1" />
        <XAxis
          dataKey="status"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'Saira, sans-serif', fontWeight: 700 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#a1a1aa', fontFamily: 'Manrope, sans-serif' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(242,98,42,0.05)' }}
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid #ededf0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
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
  );
}
