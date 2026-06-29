'use client';

import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
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
 *
 * MOCK: No real payment is processed. This step simulates a successful payment
 * to satisfy the assessment requirement. In production this would render
 * Stripe Elements or a similar secure payment form.
 *
 * The mock is clearly communicated to the user via warning banners.
 */
export function PaymentStep({ onConfirm, onBack, isSubmitting }: PaymentStepProps) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Payment
      </Typography>

      <Alert severity="warning" icon={<Lock />} sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={700}>
          Test Environment — No Real Payment
        </Typography>
        <Typography variant="body2">
          This is a mock checkout. No card details are collected, no charges will be made.
          Clicking &ldquo;Place Order&rdquo; simulates a successful payment.
        </Typography>
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          mb: 3,
          textAlign: 'center',
        }}
      >
        <CreditCard sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Mock Payment Gateway
        </Typography>
        <Typography variant="body2" color="text.disabled" mt={0.5}>
          In production: Stripe, PayPal, or similar would appear here
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBack />}
          disabled={isSubmitting}
        >
          Back
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={onConfirm}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Lock />}
          sx={{ flex: 1 }}
        >
          {isSubmitting ? 'Placing Order…' : 'Place Order (Mock)'}
        </Button>
      </Stack>
    </Box>
  );
}
