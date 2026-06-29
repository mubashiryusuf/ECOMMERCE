'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { resolveImageUrl } from '@/lib/images';
import type { Brand } from '@/types';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type BrandFormValues = z.infer<typeof brandSchema>;

// ---------------------------------------------------------------------------
// Inline form component (same pattern as CategoryFormPanel)
// ---------------------------------------------------------------------------

interface BrandFormPanelProps {
  initial?: Brand;
  onSaved: (brand: Brand) => void;
  onCancel: () => void;
}

function BrandFormPanel({ initial, onSaved, onCancel }: BrandFormPanelProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Image state — managed outside RHF, same as categories page
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: initial?.name ?? '' },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    try {
      const url = await adminApi.uploadBrandImage(file);
      setImageUrl(url);
    } catch (err: unknown) {
      setImageError(getErrorMessage(err, 'Upload failed. Try again.'));
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (values: BrandFormValues) => {
    setSubmitError(null);
    const payload = {
      name: values.name,
      imageUrl: imageUrl || undefined,
    };
    try {
      let saved: Brand;
      if (initial) {
        saved = await adminApi.updateBrand(initial.id, payload);
        enqueueSnackbar('Brand updated', { variant: 'success' });
      } else {
        saved = await adminApi.createBrand(payload);
        enqueueSnackbar('Brand created', { variant: 'success' });
      }
      onSaved(saved);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, 'Failed to save brand'));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        background: '#fff',
        border: '1px solid #ededf0',
        borderRadius: '14px',
        p: '24px',
        mb: 3,
      }}
    >
      {/* Panel header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px' }}>
        <Typography
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '18px',
            color: '#18181b',
          }}
        >
          {initial ? 'Edit Brand' : 'New Brand'}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={onCancel}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#a1a1aa',
            display: 'flex',
            alignItems: 'center',
            '&:hover': { color: '#18181b' },
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ borderRadius: '10px', mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Brand Name"
              required
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: '13px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f2622a' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f2622a' },
              }}
            />
          )}
        />

        {/* File upload */}
        <Box>
          <Typography
            sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a', mb: '8px', fontWeight: 600 }}
          >
            Brand Image{' '}
            <Box component="span" sx={{ color: '#a1a1aa', fontWeight: 400 }}>
              (optional)
            </Box>
          </Typography>

          <Box
            component="label"
            htmlFor="brand-image-upload"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              height: 130,
              border: '2px dashed #ededf0',
              borderRadius: '12px',
              cursor: imageUploading ? 'not-allowed' : 'pointer',
              bgcolor: '#fafafa',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              '&:hover': !imageUploading ? { borderColor: '#f2622a', bgcolor: 'rgba(242,98,42,0.03)' } : {},
            }}
          >
            {imageUrl ? (
              <>
                <Box
                  component="img"
                  src={resolveImageUrl(imageUrl, '')}
                  alt="Brand"
                  sx={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', color: '#a1a1aa', mt: '2px' }}>
                  Click to change
                </Typography>
              </>
            ) : imageUploading ? (
              <CircularProgress size={28} sx={{ color: '#f2622a' }} />
            ) : (
              <>
                <Box sx={{ fontSize: 28, color: '#a1a1aa', lineHeight: 1 }}>&#8593;</Box>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', fontWeight: 500 }}>
                  Click to upload image
                </Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11px', color: '#a1a1aa' }}>
                  PNG, JPG, WEBP — max 5 MB
                </Typography>
              </>
            )}
            <input
              id="brand-image-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={imageUploading}
            />
          </Box>

          {imageUrl && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                ✓ Image uploaded
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={() => setImageUrl('')}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: '12px',
                  color: '#a1a1aa',
                  '&:hover': { color: '#e63946' },
                }}
              >
                Remove
              </Box>
            </Box>
          )}

          {imageError && (
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#e63946', mt: '4px' }}>
              {imageError}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: '20px' }}>
        <Box
          component="button"
          type="submit"
          disabled={isSubmitting || imageUploading}
          sx={{
            height: 44,
            px: '20px',
            border: 'none',
            borderRadius: '10px',
            background: '#f2622a',
            color: '#fff',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '13px',
            cursor: isSubmitting || imageUploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s ease',
            '&:hover:not(:disabled)': { background: '#d94e18' },
            '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
          }}
        >
          {isSubmitting && <CircularProgress size={14} sx={{ color: '#fff' }} />}
          {isSubmitting ? 'Saving…' : initial ? 'Update Brand' : 'Create Brand'}
        </Box>

        <Box
          component="button"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{
            height: 44,
            px: '20px',
            border: '1.5px solid #ededf0',
            borderRadius: '10px',
            background: 'transparent',
            color: '#52525b',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '13px',
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminBrandsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form panel state: null = hidden, 'new' = create, Brand = edit
  const [formTarget, setFormTarget] = useState<'new' | Brand | null>(null);

  // Confirm-delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchBrands = () => {
    setIsLoading(true);
    adminApi
      .listBrands()
      .then(setBrands)
      .catch((err: unknown) => setLoadError(getErrorMessage(err, 'Failed to load brands')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSaved = (saved: Brand) => {
    setBrands((prev) => {
      const exists = prev.findIndex((b) => b.id === saved.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    setFormTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteBrand(deleteTarget.id);
      setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      enqueueSnackbar('Brand deleted', { variant: 'success' });
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'Failed to delete brand'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: '30px',
              color: '#18181b',
            }}
          >
            Brands
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
            {brands.length} brand{brands.length !== 1 ? 's' : ''} configured
          </Typography>
        </Box>

        {formTarget === null && (
          <Box
            component="button"
            type="button"
            onClick={() => setFormTarget('new')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: 44,
              px: '20px',
              background: '#f2622a',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '13px',
              transition: 'background 0.2s ease',
              '&:hover': { background: '#d94e18' },
            }}
          >
            <Add sx={{ fontSize: 18 }} />
            Add Brand
          </Box>
        )}
      </Box>

      {/* Inline form panel */}
      {formTarget !== null && (
        <BrandFormPanel
          initial={formTarget === 'new' ? undefined : formTarget}
          onSaved={handleSaved}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}
      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      {/* Brands table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress sx={{ color: '#f2622a' }} size={36} />
        </Box>
      ) : (
        <Box
          sx={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #ededf0',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr 160px 130px',
              px: '20px',
              py: '12px',
              background: '#f7f7f8',
              borderBottom: '1px solid #ededf0',
            }}
          >
            {['Image', 'Name', 'Created', 'Actions'].map((col) => (
              <Typography
                key={col}
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '11px',
                  color: '#71717a',
                }}
              >
                {col}
              </Typography>
            ))}
          </Box>

          {brands.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
                No brands yet. Click &ldquo;Add Brand&rdquo; to create one.
              </Typography>
            </Box>
          )}

          {brands.map((brand) => (
            <Box
              key={brand.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr 160px 130px',
                px: '20px',
                py: '12px',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f1',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { background: 'rgba(242,98,42,0.03)' },
              }}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '8px',
                  border: '1px solid #ededf0',
                  overflow: 'hidden',
                  bgcolor: '#f4f4f5',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {brand.imageUrl ? (
                  <Box
                    component="img"
                    src={resolveImageUrl(brand.imageUrl, '')}
                    alt={brand.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontFamily: '"Saira", sans-serif',
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#a1a1aa',
                    }}
                  >
                    {brand.name.charAt(0).toUpperCase()}
                  </Typography>
                )}
              </Box>

              {/* Name */}
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    color: '#18181b',
                  }}
                >
                  {brand.name}
                </Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11.5px', color: '#a1a1aa' }}>
                  {brand.id.slice(-8)}
                </Typography>
              </Box>

              {/* Created at */}
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a' }}>
                {new Date(brand.createdAt).toLocaleDateString()}
              </Typography>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: '6px' }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setFormTarget(brand)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: 30,
                    px: '10px',
                    borderRadius: '7px',
                    border: '1px solid #ededf0',
                    background: 'transparent',
                    color: '#52525b',
                    cursor: 'pointer',
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    transition: 'border-color 0.15s ease, color 0.15s ease',
                    '&:hover': { borderColor: '#f2622a', color: '#f2622a' },
                  }}
                >
                  <Edit sx={{ fontSize: 13 }} />
                  Edit
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => setDeleteTarget(brand)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: 30,
                    px: '10px',
                    borderRadius: '7px',
                    border: '1px solid #ededf0',
                    background: 'transparent',
                    color: '#71717a',
                    cursor: 'pointer',
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    transition: 'border-color 0.15s ease, color 0.15s ease',
                    '&:hover': { borderColor: '#e63946', color: '#e63946' },
                  }}
                >
                  <Delete sx={{ fontSize: 13 }} />
                  Del
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', border: '1px solid #ededf0' } }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '20px',
            color: '#18181b',
          }}
        >
          Delete Brand
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a' }}>
            Delete &ldquo;<strong>{deleteTarget?.name}</strong>&rdquo;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: '8px' }}>
          <Box
            component="button"
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            sx={{
              height: 38,
              px: '16px',
              border: '1.5px solid #ededf0',
              borderRadius: '8px',
              background: 'transparent',
              color: '#52525b',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '12px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.15s ease',
              '&:hover:not(:disabled)': { borderColor: '#a1a1aa' },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            sx={{
              height: 38,
              px: '16px',
              border: 'none',
              borderRadius: '8px',
              background: '#e63946',
              color: '#fff',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '12px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
              '&:hover:not(:disabled)': { background: '#c0392b' },
              '&:disabled': { background: '#e7e7ea', color: '#a1a1aa' },
            }}
          >
            {isDeleting && <CircularProgress size={13} sx={{ color: '#fff' }} />}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
