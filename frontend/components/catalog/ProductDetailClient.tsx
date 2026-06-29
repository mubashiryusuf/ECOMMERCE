'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Alert,
  Grid,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add, Remove, ShoppingCart, ArrowBack } from '@mui/icons-material';
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

/**
 * Product Detail Page — client component.
 *
 * Handles:
 * - Fetching product by ID
 * - Quantity selector (1 to stockQuantity)
 * - Add to cart action
 * - Related products section (same category, from /products/:id/related)
 */
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
    Promise.all([
      productsApi.getById(productId),
      productsApi.getRelated(productId),
    ])
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
    <Box>
      <Button
        component={NextLink}
        href="/"
        startIcon={<ArrowBack />}
        variant="text"
        sx={{ mb: 2 }}
      >
        Back to catalog
      </Button>

      <Grid container spacing={4}>
        {/* Product image */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#F8F9FA',
              border: '1px solid',
              borderColor: 'divider',
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
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Chip
                  label="Out of Stock"
                  sx={{ bgcolor: 'error.main', color: '#fff', fontWeight: 700, fontSize: '1rem' }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product info */}
        <Grid item xs={12} md={7}>
          <Chip label={product.category} size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: 'primary.main' }}>
            {product.name}
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 800, color: 'secondary.dark' }}>
            {formatPrice(product.priceCents)}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            {product.description}
          </Typography>

          {/* Stock */}
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color:
                product.stockQuantity === 0
                  ? 'error.main'
                  : product.stockQuantity <= 5
                  ? 'warning.main'
                  : 'success.main',
              fontWeight: 600,
            }}
          >
            {product.stockQuantity === 0
              ? 'Out of stock'
              : product.stockQuantity <= 5
              ? `Only ${product.stockQuantity} left in stock`
              : `${product.stockQuantity} in stock`}
          </Typography>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Quantity:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  sx={{ borderRadius: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  sx={{ borderRadius: 0 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : <ShoppingCart />}
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            sx={{ minWidth: 200 }}
          >
            {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
          </Button>
        </Grid>
      </Grid>

      {/* Related products */}
      {related.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Related Products
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
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
