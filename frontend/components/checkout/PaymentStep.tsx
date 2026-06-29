'use client';

import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Lock, CreditCard, ArrowBack } from '@mui/icons-material';

interface PaymentStepProps {
  onConfirm: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

/**
 * Step 2 of checkout: Mock payment confirmation.
 * MOCK: No real payment is processed. Simulates a successful payment for the assessment.
 */
export function PaymentStep({ onConfirm, onBack, isSubmitting }: PaymentStepProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Saira", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '13px',
          color: '#71717a',
          mb: '20px',
        }}
      >
        Payment
      </Typography>

      {/* Mock payment notice */}
      <Box
        sx={{
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px',
          p: '16px 20px',
          mb: 3,
        }}
      >
        <Lock sx={{ color: '#f59e0b', mt: '2px', flexShrink: 0 }} />
        <Box>
          <Typography
            sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13px', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', mb: '4px' }}
          >
            Test Environment — No Real Payment
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>
            This is a mock checkout. No card details are collected, no charges will be made.
            Clicking &ldquo;Place Order&rdquo; simulates a successful payment.
          </Typography>
        </Box>
      </Box>

      {/* Mock gateway box */}
      <Box
        sx={{
          p: '28px',
          border: '2px dashed #ededf0',
          borderRadius: '14px',
          mb: 3,
          textAlign: 'center',
          background: '#fafafa',
        }}
      >
        <CreditCard sx={{ fontSize: 52, color: '#d1d1d6', mb: '10px' }} />
        <Typography
          sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#71717a' }}
        >
          Mock Payment Gateway
        </Typography>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#a1a1aa', mt: '6px' }}>
          In production: Stripe, PayPal, or similar would appear here
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          component="button"
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          sx={{
            height: 54,
            px: '24px',
            border: '1.5px solid #ededf0',
            borderRadius: '12px',
            background: 'transparent',
            color: '#52525b',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            transition: 'border-color 0.2s ease',
            '&:hover:not(:disabled)': { borderColor: '#a1a1aa' },
          }}
        >
          <ArrowBack sx={{ fontSize: 18 }} />
          Back
        </Box>

        <Box
          component="button"
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          sx={{
            flex: 1,
            height: 54,
            border: 'none',
            borderRadius: '12px',
            background: '#f2622a',
            color: '#fff',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '15px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease',
            '&:hover:not(:disabled)': { background: '#d94e18' },
            '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Lock sx={{ fontSize: 18 }} />
          )}
          {isSubmitting ? 'Placing Order…' : 'Place Order (Mock)'}
        </Box>
      </Box>
    </Box>
  );
}
