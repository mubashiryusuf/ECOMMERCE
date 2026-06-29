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
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          fontSize: '30px',
          color: '#18181b',
          mb: 3,
        }}
      >
        {isNew ? 'Add Product' : 'Edit Product'}
      </Typography>
      <ProductForm productId={isNew ? undefined : params?.id} />
    </Box>
  );
}
