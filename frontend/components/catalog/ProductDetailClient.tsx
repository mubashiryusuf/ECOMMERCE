'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, Typography, Alert, Grid, CircularProgress } from '@mui/material';
import { productsApi } from '@/lib/api';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSnackbar } from 'notistack';
import { PageLoader } from '@/components/ui/PageLoader';
import { ProductCard } from './ProductCard';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';
import { useRouter } from 'next/navigation';

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([productsApi.getById(productId), productsApi.getRelated(productId)])
      .then(([prod, rel]) => {
        setProduct(prod);
        setRelated(rel);
        setQuantity(1);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Product not found');
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      enqueueSnackbar(`${product.name} added to cart`, { variant: 'success' });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not add to cart';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return null;

  const isOutOfStock = product.stockQuantity === 0;
  const maxQty = Math.min(product.stockQuantity, 10);

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
      {/* Breadcrumb */}
      <Box
        sx={{
          fontFamily: '"Manrope", sans-serif',
          fontSize: '12.5px',
          color: '#a1a1aa',
          mb: 3,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box component={NextLink} href="/" sx={{ color: '#f2622a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Home
        </Box>
        <span>/</span>
        <Box component={NextLink} href={`/?category=${product.category}`} sx={{ color: '#a1a1aa', textDecoration: 'none', '&:hover': { color: '#f2622a' } }}>
          {product.category}
        </Box>
        <span>/</span>
        <span style={{ color: '#18181b', fontWeight: 600 }}>{product.name}</span>
      </Box>

      <Grid container spacing={5}>
        {/* Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#f1f1f3',
              border: '1px solid #ededf0',
            }}
          >
            <Box
              component="img"
              src={product.imageUrl || 'https://placehold.co/600x600?text=No+Image'}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
              }}
            />
            {isOutOfStock && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'rgba(16,16,18,0.85)',
                  color: '#fff',
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '6px 14px',
                  borderRadius: '8px',
                }}
              >
                Out of Stock
              </Box>
            )}
          </Box>
        </Grid>

        {/* Info */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              color: '#f2622a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 1,
            }}
          >
            {product.category}
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: { xs: '32px', md: '44px' },
              lineHeight: 0.96,
              mb: 2,
              color: '#18181b',
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
            <Typography
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                fontSize: '32px',
                color: '#18181b',
              }}
            >
              {formatPrice(product.priceCents)}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontSize: '14.5px',
              lineHeight: 1.65,
              color: '#52525b',
              mb: 3,
            }}
          >
            {product.description}
          </Typography>

          {/* Stock status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontFamily: '"Manrope", sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              mb: 3,
              color: isOutOfStock ? '#e63946' : product.stockQuantity <= 5 ? '#f59e0b' : '#16a34a',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOutOfStock ? '#e63946' : product.stockQuantity <= 5 ? '#f59e0b' : '#16a34a',
              }}
            />
            {isOutOfStock
              ? 'Out of stock'
              : product.stockQuantity <= 5
              ? `Only ${product.stockQuantity} left in stock`
              : `${product.stockQuantity} in stock · Free shipping over $200`}
          </Box>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: '10px',
                  color: '#18181b',
                }}
              >
                Quantity
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #e7e7ea',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    sx={{
                      width: 46,
                      height: 52,
                      border: 'none',
                      background: '#fff',
                      fontSize: '22px',
                      cursor: 'pointer',
                      color: '#18181b',
                      '&:hover': { background: '#f4f4f5' },
                      '&:disabled': { color: '#a1a1aa', cursor: 'not-allowed' },
                    }}
                  >
                    −
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      textAlign: 'center',
                      fontFamily: '"Saira", sans-serif',
                      fontWeight: 700,
                      fontSize: '17px',
                    }}
                  >
                    {quantity}
                  </Box>
                  <Box
                    component="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    sx={{
                      width: 46,
                      height: 52,
                      border: 'none',
                      background: '#fff',
                      fontSize: '22px',
                      cursor: 'pointer',
                      color: '#18181b',
                      '&:hover': { background: '#f4f4f5' },
                      '&:disabled': { color: '#a1a1aa', cursor: 'not-allowed' },
                    }}
                  >
                    +
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Add to cart */}
          <Box
            component="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            sx={{
              width: '100%',
              height: 54,
              border: 'none',
              borderRadius: '12px',
              background: isOutOfStock ? '#e7e7ea' : '#f2622a',
              color: isOutOfStock ? '#a1a1aa' : '#fff',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '15px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.12s ease, background 0.2s ease',
              '&:hover:not(:disabled)': { background: '#d94e18' },
              '&:active:not(:disabled)': { transform: 'scale(0.97)' },
            }}
          >
            {isAdding ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              <>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6h15l-1.5 9h-12z" />
                  <circle cx="9" cy="20" r="1.6" />
                  <circle cx="18" cy="20" r="1.6" />
                  <path d="M6 6 5 2H2" />
                </svg>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Related products */}
      {related.length > 0 && (
        <Box sx={{ mt: 7 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontFamily: '"Saira Condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: '28px',
                m: 0,
                color: '#18181b',
              }}
            >
              You May Also Like
            </Typography>
            <Box sx={{ width: 54, height: 4, background: '#f2622a', borderRadius: 1, mt: '10px' }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2.5,
            }}
          >
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
