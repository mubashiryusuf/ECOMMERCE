'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSnackbar } from 'notistack';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Box
      sx={{
        border: '1px solid #ededf0',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.32s cubic-bezier(.2,.7,.2,1), box-shadow 0.32s cubic-bezier(.2,.7,.2,1), border-color 0.32s',
        '&:hover': {
          boxShadow: '0 18px 40px rgba(0,0,0,0.14)',
          transform: 'translateY(-6px)',
          borderColor: 'transparent',
        },
      }}
    >
      {/* Image area */}
      <Box
        component={NextLink}
        href={`/products/${product.id}`}
        sx={{
          position: 'relative',
          aspectRatio: '1',
          overflow: 'hidden',
          background: '#f1f1f3',
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
            transition: 'transform 0.55s cubic-bezier(.2,.7,.2,1)',
            '&:hover': { transform: 'scale(1.08)' },
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
          }}
        />

        {/* Category badge — top-left */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: '#f2622a',
            color: '#fff',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            fontSize: '11px',
            padding: '4px 9px',
            borderRadius: '6px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {product.category}
        </Box>

        {/* Stock badge — top-right */}
        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(16,16,18,0.85)',
              color: '#fff',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Out of Stock
          </Box>
        )}
        {isLowStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: '#f59e0b',
              color: '#fff',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '6px',
              letterSpacing: '0.05em',
            }}
          >
            Only {product.stockQuantity} left
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            fontSize: '13.5px',
            lineHeight: 1.35,
            mb: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '38px',
            color: '#18181b',
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: '14px' }}>
          <Typography
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              color: '#18181b',
            }}
          >
            {formatPrice(product.priceCents)}
          </Typography>
        </Box>

        {/* Add to cart button */}
        <Box
          component="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          sx={{
            mt: 'auto',
            width: '100%',
            height: 44,
            border: 'none',
            borderRadius: '10px',
            background: isOutOfStock ? '#e7e7ea' : '#f2622a',
            color: isOutOfStock ? '#a1a1aa' : '#fff',
            fontFamily: '"Saira", sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease, transform 0.12s ease',
            '&:hover:not(:disabled)': { background: '#d94e18' },
            '&:active:not(:disabled)': { transform: 'scale(0.97)' },
          }}
        >
          {isAdding ? (
            <CircularProgress size={16} sx={{ color: '#fff' }} />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
                <path d="M6 6 5 2H2" />
              </svg>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
