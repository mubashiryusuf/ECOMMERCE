'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';

// Initialise Stripe outside the component so the object is stable across renders.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const cardElementOptions = {
  style: {
    base: {
      fontFamily: '"Manrope", sans-serif',
      fontSize: '15px',
      color: '#18181b',
      '::placeholder': { color: '#a1a1aa' },
    },
    invalid: { color: '#e63946' },
  },
};

// ---------------------------------------------------------------------------
// Inner form — lives inside <Elements> so useStripe/useElements are available.
// ---------------------------------------------------------------------------

interface StripeCardFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

function StripeCardForm({
  clientSecret,
  onSuccess,
  onBack,
  isSubmitting,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);

  const isBusy = processing || isSubmitting;

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setStripeError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setProcessing(false);
      return;
    }

    // clientSecret is already in the Elements context via options={{ clientSecret }},
    // but confirmCardPayment still requires it as the first argument.
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      setStripeError(error.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setProcessing(false);
  };

  return (
    <Box>
      {/* Section label */}
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

      {/* Security notice */}
      <Box
        sx={{
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          background: 'rgba(242,98,42,0.06)',
          border: '1px solid rgba(242,98,42,0.2)',
          borderRadius: '12px',
          p: '14px 18px',
          mb: 3,
        }}
      >
        <Lock sx={{ color: '#f2622a', mt: '2px', flexShrink: 0, fontSize: 18 }} />
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: '13px',
            color: '#52525b',
            lineHeight: 1.6,
          }}
        >
          Your payment is processed securely by Stripe. We never store your card
          details. Use test card{' '}
          <Box component="span" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
            4242 4242 4242 4242
          </Box>{' '}
          with any future expiry and any 3-digit CVC.
        </Typography>
      </Box>

      {/* Card input */}
      <Box
        sx={{
          border: cardFocused ? '1.5px solid #f2622a' : '1.5px solid #e7e7ea',
          borderRadius: '12px',
          p: '16px 18px',
          background: '#fff',
          mb: stripeError ? 1 : 3,
          transition: 'border-color 0.2s ease',
        }}
      >
        <CardElement
          options={cardElementOptions}
          onFocus={() => setCardFocused(true)}
          onBlur={() => setCardFocused(false)}
        />
      </Box>

      {/* Stripe error message */}
      {stripeError && (
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: '13px',
            color: '#e63946',
            mb: 3,
            pl: '2px',
          }}
        >
          {stripeError}
        </Typography>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          component="button"
          type="button"
          onClick={onBack}
          disabled={isBusy}
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
            cursor: isBusy ? 'not-allowed' : 'pointer',
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
          onClick={handlePay}
          disabled={isBusy || !stripe}
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
            cursor: isBusy ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease',
            '&:hover:not(:disabled)': { background: '#d94e18' },
            '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
          }}
        >
          {isBusy ? (
            <CircularProgress size={20} sx={{ color: '#fff' }} />
          ) : (
            <Lock sx={{ fontSize: 18 }} />
          )}
          {isBusy ? 'Processing…' : 'Pay Now'}
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Public export — wraps the inner form in the Stripe Elements provider.
// ---------------------------------------------------------------------------

export interface PaymentStepProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function PaymentStep({
  clientSecret,
  onSuccess,
  onBack,
  isSubmitting,
}: PaymentStepProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCardForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onBack={onBack}
        isSubmitting={isSubmitting}
      />
    </Elements>
  );
}
