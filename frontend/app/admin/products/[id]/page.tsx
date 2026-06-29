'use client';

import { useParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { ProductForm } from '@/components/admin/ProductForm';

/**
 * Admin create/edit product page.
 *
 * When id === "new" → create mode (empty form, POST /admin/products).
 * When id is a valid product ID → edit mode (pre-filled form, PATCH /admin/products/:id).
 */
export default function AdminProductFormPage() {
  const params = useParams<{ id: string }>();
  const isNew = params?.id === 'new';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'text.primary' }}>
        {isNew ? 'Add Product' : 'Edit Product'}
      </Typography>
      <ProductForm productId={isNew ? undefined : params?.id} />
    </Box>
  );
}
