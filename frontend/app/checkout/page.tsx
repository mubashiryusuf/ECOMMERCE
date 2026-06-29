'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
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

function ApexStepper({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 5 }}>
      {steps.map((label, i) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: i <= activeStep ? '#f2622a' : 'transparent',
                border: i <= activeStep ? 'none' : '2px solid #e7e7ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: i <= activeStep ? '#fff' : '#a1a1aa',
                fontFamily: '"Saira", sans-serif',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              {i + 1}
            </Box>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: i <= activeStep ? '#18181b' : '#a1a1aa',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
            >
              {label}
            </Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                background: i < activeStep ? '#f2622a' : '#e7e7ea',
                mx: '12px',
                mb: '26px',
                flexShrink: 1,
                transition: 'background 0.3s ease',
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 3 }, py: 5 }}
      >
        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '40px',
              color: '#18181b',
              lineHeight: 1,
              mb: '4px',
            }}
          >
            Checkout
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a' }}>
            Complete your order securely
          </Typography>
        </Box>

        {/* APEX step indicators */}
        <ApexStepper steps={STEPS} activeStep={activeStep} />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: '12px', fontFamily: '"Manrope", sans-serif' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Step content card */}
        <Box
          sx={{
            background: '#fff',
            border: '1px solid #ededf0',
            borderRadius: '16px',
            p: { xs: '24px', md: '32px' },
          }}
        >
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
      </Box>
      <Footer />
    </Box>
  );
}
