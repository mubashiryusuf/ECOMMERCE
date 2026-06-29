'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSnackbar } from 'notistack';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

/**
 * Storefront product card.
 *
 * - Square image (aspect-ratio 1:1)
 * - Category chip (top-left overlay)
 * - Stock badge (top-right) — red=out, amber=low, hidden=plenty
 * - Price in bold brand color
 * - "Add to Cart" button — disabled + shows spinner while adding
 */
export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent card link navigation
    if (!isAuthenticated) {
      enqueueSnackbar('Please sign in to add items to your cart', { variant: 'info' });
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <Box
        component={NextLink}
        href={`/products/${product.id}`}
        sx={{
          position: 'relative',
          aspectRatio: '1',
          overflow: 'hidden',
          bgcolor: '#F8F9FA',
          display: 'block',
          textDecoration: 'none',
        }}
      >
        <Box
          component="img"
          src={product.imageUrl || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' },
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
          }}
        />

        {/* Category badge */}
        <Chip
          label={product.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(26,26,46,0.85)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            height: 22,
          }}
        />

        {/* Stock badge */}
        {isOutOfStock && (
          <Chip
            label="Out of Stock"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 22,
            }}
          />
        )}
        {isLowStock && (
          <Chip
            label={`Only ${product.stockQuantity} left`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'warning.main',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 22,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            mb: 1,
          }}
        >
          {product.name}
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontSize: '1.1rem' }}>
          {formatPrice(product.priceCents)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={isAdding ? <CircularProgress size={14} color="inherit" /> : <ShoppingCart />}
          disabled={isOutOfStock || isAdding}
          onClick={handleAddToCart}
          sx={{ borderRadius: 2, fontSize: '0.8125rem' }}
        >
          {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
        </Button>
        <Button
          component={NextLink}
          href={`/products/${product.id}`}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2, minWidth: 42, px: 1 }}
          aria-label="View product details"
        >
          <Visibility fontSize="small" />
        </Button>
      </CardActions>
    </Card>
  );
}
