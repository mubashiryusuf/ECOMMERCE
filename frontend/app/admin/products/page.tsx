'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { adminApi } from '@/lib/api';
import { productsApi } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';

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
    <Box sx={{ p: { xs: 2, md: '28px 30px' } }}>
      {/* Header */}
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
            Products
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13px', color: '#71717a', mt: '2px' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} in catalogue
          </Typography>
        </Box>

        <Box
          component={NextLink}
          href="/admin/products/new"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: 44,
            px: '20px',
            background: '#f2622a',
            color: '#fff',
            borderRadius: '10px',
            textDecoration: 'none',
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
          Add Product
        </Box>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

      {isLoading ? (
        <PageLoader />
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
              gridTemplateColumns: '72px 1fr 130px 110px 90px 80px 120px',
              px: '20px',
              py: '12px',
              background: '#f7f7f8',
              borderBottom: '1px solid #ededf0',
            }}
          >
            {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((col) => (
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

          {products.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}>
                No products found. Add one to get started.
              </Typography>
            </Box>
          )}

          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr 130px 110px 90px 80px 120px',
                px: '20px',
                py: '12px',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f1',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { background: 'rgba(242,98,42,0.03)' },
              }}
            >
              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                sx={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '8px', border: '1px solid #ededf0' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/52x52?text=No+Image';
                }}
              />

              <Box>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 600, fontSize: '13.5px', color: '#18181b', lineHeight: 1.3 }}>
                  {product.name}
                </Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '11.5px', color: '#a1a1aa' }}>
                  {product.id.slice(-8)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignSelf: 'center',
                  px: '10px',
                  py: '3px',
                  background: 'rgba(242,98,42,0.08)',
                  borderRadius: '6px',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#f2622a',
                }}
              >
                {product.category}
              </Box>

              <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', color: '#18181b' }}>
                {formatPrice(product.priceCents)}
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  color:
                    product.stockQuantity === 0
                      ? '#e63946'
                      : product.stockQuantity <= 5
                      ? '#f59e0b'
                      : '#16a34a',
                }}
              >
                {product.stockQuantity}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignSelf: 'center',
                  px: '10px',
                  py: '3px',
                  background: product.stockQuantity === 0 ? 'rgba(230,57,70,0.1)' : 'rgba(22,163,74,0.1)',
                  borderRadius: '6px',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: product.stockQuantity === 0 ? '#e63946' : '#16a34a',
                }}
              >
                {product.stockQuantity === 0 ? 'Out' : 'Active'}
              </Box>

              <Box sx={{ display: 'flex', gap: '6px' }}>
                <Box
                  component={NextLink}
                  href={`/admin/products/${product.id}`}
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
                    textDecoration: 'none',
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
                  onClick={() => handleDelete(product.id, product.name)}
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
    </Box>
  );
}
