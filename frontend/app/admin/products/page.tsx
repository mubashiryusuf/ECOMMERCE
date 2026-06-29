'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { adminApi } from '@/lib/api';
import { productsApi } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';

/**
 * Admin products list page.
 * Displays all products in a table with edit/delete actions.
 * Create button links to /admin/products/new.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = () => {
    setIsLoading(true);
    productsApi
      .list({ limit: 100 })
      .then((res) => setProducts(res.items))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setDeleteError(null);
    try {
      await adminApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to delete product';
      setDeleteError(message);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Products
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          component={NextLink}
          href="/admin/products/new"
        >
          Add Product
        </Button>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px 120px 100px 80px 120px',
              px: 2,
              py: 1.5,
              bgcolor: '#F8F9FA',
              borderBottom: '2px solid',
              borderColor: 'divider',
            }}
          >
            {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((col) => (
              <Typography
                key={col}
                variant="overline"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                {col}
              </Typography>
            ))}
          </Box>

          {products.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No products found. Add one to get started.
              </Typography>
            </Box>
          )}

          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px 120px 100px 80px 120px',
                px: 2,
                py: 1.5,
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
              }}
            >
              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=No+Image';
                }}
              />
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.id.slice(-8)}
                </Typography>
              </Box>
              <Chip label={product.category} size="small" sx={{ borderRadius: 1 }} />
              <Typography variant="body2" fontWeight={700}>
                {formatPrice(product.priceCents)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color:
                    product.stockQuantity === 0
                      ? 'error.main'
                      : product.stockQuantity <= 5
                      ? 'warning.main'
                      : 'success.main',
                  fontWeight: 600,
                }}
              >
                {product.stockQuantity}
              </Typography>
              <Chip
                label={product.stockQuantity === 0 ? 'Out' : 'Active'}
                size="small"
                color={product.stockQuantity === 0 ? 'error' : 'success'}
                sx={{ borderRadius: 1, fontSize: '0.7rem' }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  component={NextLink}
                  href={`/admin/products/${product.id}`}
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  sx={{ minWidth: 0, px: 1 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete fontSize="small" />}
                  sx={{ minWidth: 0, px: 1 }}
                  onClick={() => handleDelete(product.id, product.name)}
                >
                  Del
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
