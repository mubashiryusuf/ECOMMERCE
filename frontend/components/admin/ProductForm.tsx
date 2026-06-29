'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { Input } from '@/components/ui/Input';
import { adminApi, productsApi } from '@/lib/api';
import type { Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priceDollars: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be positive')
    .multipleOf(0.01, 'Max 2 decimal places'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().url('Enter a valid URL (https://...)'),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = Boolean(productId);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      priceDollars: undefined,
      category: '',
      imageUrl: '',
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    if (!productId) return;
    productsApi
      .getById(productId)
      .then((product: Product) => {
        reset({
          name: product.name,
          description: product.description,
          priceDollars: product.priceCents / 100,
          category: product.category,
          imageUrl: product.imageUrl,
          stockQuantity: product.stockQuantity,
        });
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Product not found');
      });
  }, [productId, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitError(null);
    const payload = {
      name: values.name,
      description: values.description,
      priceCents: Math.round(values.priceDollars * 100),
      category: values.category,
      imageUrl: values.imageUrl,
      stockQuantity: values.stockQuantity,
    };

    try {
      if (isEditMode && productId) {
        await adminApi.updateProduct(productId, payload);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await adminApi.createProduct(payload);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      router.push('/admin/products');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save product';
      setSubmitError(message);
    }
  };

  if (loadError) {
    return <Alert severity="error" sx={{ borderRadius: '12px' }}>{loadError}</Alert>;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      {submitError && (
        <Alert severity="error" sx={{ borderRadius: '12px' }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Product Name"
            required
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Description"
            required
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="priceDollars"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Price"
              required
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!errors.priceDollars}
              helperText={errors.priceDollars?.message ?? 'Enter in dollars (e.g. 19.99)'}
              sx={{ flex: 1 }}
            />
          )}
        />

        <Controller
          name="stockQuantity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Stock Quantity"
              required
              type="number"
              inputProps={{ min: '0', step: '1' }}
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity?.message}
              sx={{ flex: 1 }}
            />
          )}
        />
      </Box>

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Category"
            required
            placeholder="e.g. Football, Running, Cricket"
            error={!!errors.category}
            helperText={errors.category?.message}
          />
        )}
      />

      <Controller
        name="imageUrl"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Image URL"
            required
            type="url"
            placeholder="https://example.com/image.jpg"
            error={!!errors.imageUrl}
            helperText={errors.imageUrl?.message ?? 'Paste a direct image URL'}
          />
        )}
      />

      {/* Image preview */}
      <Controller
        name="imageUrl"
        control={control}
        render={({ field: { value } }) =>
          value ? (
            <Box>
              <Typography
                sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a', mb: '6px' }}
              >
                Image preview
              </Typography>
              <Box
                component="img"
                src={value}
                alt="Product preview"
                sx={{
                  height: 120,
                  width: 120,
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid #ededf0',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Box>
          ) : <></>
        }
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Box
          component="button"
          type="submit"
          disabled={isSubmitting}
          sx={{
            height: 54,
            px: '28px',
            border: 'none',
            borderRadius: '12px',
            background: '#f2622a',
            color: '#fff',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s ease',
            '&:hover:not(:disabled)': { background: '#d94e18' },
            '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
          }}
        >
          {isSubmitting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
          {isSubmitting ? 'Saving…' : isEditMode ? 'Update Product' : 'Create Product'}
        </Box>

        <Box
          component="button"
          type="button"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
          sx={{
            height: 54,
            px: '28px',
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
            transition: 'border-color 0.2s ease',
            '&:hover:not(:disabled)': { borderColor: '#a1a1aa' },
          }}
        >
          Cancel
        </Box>
      </Box>
    </Box>
  );
}
