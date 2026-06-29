'use client';

import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import type { CheckoutPayload } from '@/types';

const shippingSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface CheckoutFormProps {
  defaultValues?: Partial<CheckoutPayload>;
  onNext: (data: Omit<CheckoutPayload, 'paymentToken'>) => void;
}

export function CheckoutForm({ defaultValues, onNext }: CheckoutFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      addressLine1: defaultValues?.addressLine1 ?? '',
      city: defaultValues?.city ?? '',
      postalCode: defaultValues?.postalCode ?? '',
      country: defaultValues?.country ?? '',
    },
  });

  const onSubmit = (values: ShippingFormValues) => {
    onNext(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        Shipping Information
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Full Name"
              required
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="addressLine1"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Address Line 1"
              required
              autoComplete="street-address"
              error={!!errors.addressLine1}
              helperText={errors.addressLine1?.message}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="City"
                required
                autoComplete="address-level2"
                error={!!errors.city}
                helperText={errors.city?.message}
                sx={{ flex: 1 }}
              />
            )}
          />
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Postal Code"
                required
                autoComplete="postal-code"
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
                sx={{ flex: 1 }}
              />
            )}
          />
        </Box>

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Country"
              required
              autoComplete="country-name"
              error={!!errors.country}
              helperText={errors.country?.message}
            />
          )}
        />

        <Box
          component="button"
          type="submit"
          disabled={isSubmitting}
          sx={{
            mt: 1,
            width: '100%',
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
          {isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Continue to Payment'}
        </Box>
      </Box>
    </Box>
  );
}
