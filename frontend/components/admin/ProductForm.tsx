'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { Input } from '@/components/ui/Input';
import { adminApi, categoriesApi, productsApi, brandsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { resolveImageUrl } from '@/lib/images';
import type { Brand, Category, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priceDollars: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be positive')
    .multipleOf(0.01, 'Max 2 decimal places'),
  category: z.string().min(2, 'Category is required'),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const MAX_IMAGES = 6;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = Boolean(productId);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  // Brands
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  // Multi-image state
  const [images, setImages] = useState<string[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Per-slot hidden file inputs
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', priceDollars: undefined, category: '', stockQuantity: 0 },
  });

  useEffect(() => {
    brandsApi.list().then(setBrands).catch(() => {});
  }, []);

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
          stockQuantity: product.stockQuantity,
        });
        setSelectedBrand(product.brand ?? '');
        // Restore images: prefer images[] array, fall back to single imageUrl
        const existing = (product as any).images?.length
          ? (product as any).images
          : product.imageUrl
          ? [product.imageUrl]
          : [];
        setImages(existing);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Product not found');
      });
  }, [productId, reset]);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  const handleFileChange = async (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected later
    e.target.value = '';
    setImageError(null);
    setUploadingIdx(slotIdx);
    try {
      const url = await adminApi.uploadImage(file);
      setImages((prev) => {
        const next = [...prev];
        if (slotIdx < next.length) {
          next[slotIdx] = url; // replace existing slot
        } else {
          next.push(url); // new slot
        }
        return next;
      });
    } catch (err: unknown) {
      setImageError(getErrorMessage(err, 'Upload failed. Try again.'));
    } finally {
      setUploadingIdx(null);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitError(null);
    if (images.length === 0) {
      setSubmitError('Please upload at least one product image.');
      return;
    }

    const payload = {
      name: values.name,
      description: values.description,
      priceCents: Math.round(values.priceDollars * 100),
      category: values.category,
      brand: selectedBrand || undefined,
      imageUrl: images[0],
      images,
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
      setSubmitError(getErrorMessage(err, 'Failed to save product'));
    }
  };

  if (loadError) {
    return <Alert severity="error" sx={{ borderRadius: '12px' }}>{loadError}</Alert>;
  }

  const canAddMore = images.length < MAX_IMAGES && uploadingIdx === null;

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
          <Input {...field} label="Product Name" required error={!!errors.name} helperText={errors.name?.message} />
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
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
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
          <FormControl fullWidth error={!!errors.category} size="small">
            <InputLabel
              id="category-label"
              sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', '&.Mui-focused': { color: '#f2622a' } }}
            >
              Category *
            </InputLabel>
            <Select
              {...field}
              labelId="category-label"
              label="Category *"
              disabled={catsLoading}
              sx={{
                borderRadius: '8px',
                fontFamily: '"Manrope", sans-serif',
                fontSize: '13px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ededf0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a1a1aa' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f2622a' },
              }}
            >
              {catsLoading ? (
                <MenuItem disabled value=""><em>Loading categories…</em></MenuItem>
              ) : categories.length === 0 ? (
                <MenuItem disabled value=""><em>No categories found — add one first</em></MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name} sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px' }}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.category && (
              <FormHelperText sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px' }}>
                {errors.category.message}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Brand (optional) */}
      <FormControl fullWidth size="small">
        <InputLabel
          id="brand-label"
          sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', '&.Mui-focused': { color: '#f2622a' } }}
        >
          Brand (optional)
        </InputLabel>
        <Select
          labelId="brand-label"
          label="Brand (optional)"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          sx={{
            borderRadius: '8px',
            fontFamily: '"Manrope", sans-serif',
            fontSize: '13px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ededf0' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a1a1aa' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f2622a' },
          }}
        >
          <MenuItem value="" sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#a1a1aa' }}>
            <em>No brand</em>
          </MenuItem>
          {brands.map((b) => (
            <MenuItem key={b.id} value={b.name} sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px' }}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ------------------------------------------------------------------ */}
      {/* Multi-image upload                                                   */}
      {/* ------------------------------------------------------------------ */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '8px' }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>
            Product Images
            <Box component="span" sx={{ color: '#a1a1aa', fontWeight: 400, ml: '4px' }}>
              (first is primary · max {MAX_IMAGES})
            </Box>
          </Typography>
          {images.length > 0 && (
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', color: '#a1a1aa' }}>
              {images.length} / {MAX_IMAGES} uploaded
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {/* Uploaded image slots */}
          {images.map((url, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '10px',
                overflow: 'hidden',
                border: idx === 0 ? '2px solid #f2622a' : '1.5px solid #ededf0',
                bgcolor: '#f4f4f5',
                cursor: uploadingIdx === idx ? 'not-allowed' : 'pointer',
              }}
              onClick={() => uploadingIdx === null && fileInputRefs.current[idx]?.click()}
            >
              {uploadingIdx === idx ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress size={24} sx={{ color: '#f2622a' }} />
                </Box>
              ) : (
                <Box
                  component="img"
                  src={resolveImageUrl(url, '')}
                  alt={`Product image ${idx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}

              {/* Primary badge */}
              {idx === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    left: 5,
                    background: '#f2622a',
                    color: '#fff',
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    px: '6px',
                    py: '2px',
                    borderRadius: '4px',
                  }}
                >
                  Primary
                </Box>
              )}

              {/* Remove button */}
              <Box
                component="button"
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(16,16,18,0.7)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'background 0.15s',
                  '&:hover': { background: '#e63946' },
                }}
              >
                <Close sx={{ fontSize: 13 }} />
              </Box>

              <input
                ref={(el) => { fileInputRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(idx, e)}
              />
            </Box>
          ))}

          {/* Add new image slot */}
          {canAddMore && (
            <Box
              component="label"
              htmlFor="product-image-add"
              sx={{
                aspectRatio: '1',
                borderRadius: '10px',
                border: '2px dashed #ededf0',
                bgcolor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                '&:hover': { borderColor: '#f2622a', bgcolor: 'rgba(242,98,42,0.03)' },
              }}
            >
              <Add sx={{ fontSize: 28, color: '#a1a1aa' }} />
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', color: '#a1a1aa', textAlign: 'center', px: 1 }}>
                {images.length === 0 ? 'Add primary image' : 'Add image'}
              </Typography>
              <input
                id="product-image-add"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(images.length, e)}
              />
            </Box>
          )}

          {/* Loading slot for new upload */}
          {uploadingIdx === images.length && (
            <Box
              sx={{
                aspectRatio: '1',
                borderRadius: '10px',
                border: '1.5px solid #ededf0',
                bgcolor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={24} sx={{ color: '#f2622a' }} />
            </Box>
          )}
        </Box>

        {imageError && (
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#e63946', mt: '6px' }}>
            {imageError}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Box
          component="button"
          type="submit"
          disabled={isSubmitting || uploadingIdx !== null}
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
            cursor: isSubmitting || uploadingIdx !== null ? 'not-allowed' : 'pointer',
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
