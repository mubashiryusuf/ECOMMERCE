import { Chip } from '@mui/material';
import { getStatusColor } from '@/utils/formatters';
import { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

const STATUS_STYLES: Record<OrderStatus, object> = {
  [OrderStatus.PENDING]: { background: '#FEF3C7', color: '#92400E' },
  [OrderStatus.PROCESSING]: { background: '#DBEAFE', color: '#1E40AF' },
  [OrderStatus.SHIPPED]: { background: '#EDE9FE', color: '#5B21B6' },
  [OrderStatus.DELIVERED]: { background: '#D1FAE5', color: '#065F46' },
  [OrderStatus.CANCELLED]: { background: '#FEE2E2', color: '#991B1B' },
};

/**
 * Semantic status badge for order status values.
 * Uses inline color styles to avoid MUI color prop limitations on custom palettes.
 */
export function OrderStatusBadge({ status, size = 'small' }: OrderStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { background: '#F3F4F6', color: '#374151' };

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        fontFamily: '"Saira", sans-serif',
        fontWeight: 700,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: '6px',
        ...style,
      }}
    />
  );
}
