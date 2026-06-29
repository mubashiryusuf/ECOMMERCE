'use client';

import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import type { CheckoutPayload } from '@/types';

// ---------------------------------------------------------------------------
// Zod schema — shipping information
// ---------------------------------------------------------------------------
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

/**
 * Step 1 of checkout: Shipping information form.
 * Validated with Zod + react-hook-form before advancing to payment step.
 */
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
      <Typography variant="h6" fontWeight={700} mb={2}>
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

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 1 }}
        >
          {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Continue to Payment'}
        </Button>
      </Box>
    </Box>
  );
}
