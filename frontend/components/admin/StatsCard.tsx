import { Box, Typography } from '@mui/material';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatsCard({ label, value, icon, color = '#f2622a', subtitle }: StatsCardProps) {
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #ededf0',
        borderRadius: '14px',
        p: '18px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: '12px',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Saira", sans-serif',
            fontWeight: 800,
            fontSize: typeof value === 'string' && value.length > 8 ? '22px' : '28px',
            mt: 1,
            mb: '4px',
            color: '#18181b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
}
