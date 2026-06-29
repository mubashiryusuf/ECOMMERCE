'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ordersApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import type { CheckoutPayload } from '@/types';

const STEPS = ['Shipping Details', 'Payment', 'Confirmation'];

/**
 * Checkout page — multi-step form.
 *
 * Step 1: Shipping form (name, address fields) — validated with Zod
 * Step 2: Payment stub (mock payment notice — not real card processing)
 * Step 3: Submit → POST /checkout → redirect to /orders/:id
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const clearCart = useCartStore((state) => state.clearCart);

  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState<Partial<CheckoutPayload>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShippingNext = (data: Omit<CheckoutPayload, 'paymentToken'>) => {
    setShippingData(data);
    setActiveStep(1);
  };

  const handlePaymentConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CheckoutPayload = {
        ...(shippingData as CheckoutPayload),
        // Mock payment token — clearly not a real card. The API accepts any string.
        paymentToken: 'mock_payment_token_test_only',
      };
      const order = await ordersApi.checkout(payload);
      clearCart();
      enqueueSnackbar('Order placed successfully!', { variant: 'success' });
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Checkout failed. Please try again.';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <CheckoutForm
            defaultValues={shippingData}
            onNext={handleShippingNext}
          />
        )}

        {activeStep === 1 && (
          <PaymentStep
            onConfirm={handlePaymentConfirm}
            onBack={() => setActiveStep(0)}
            isSubmitting={isSubmitting}
          />
        )}
      </Box>
      <Footer />
    </Box>
  );
}
