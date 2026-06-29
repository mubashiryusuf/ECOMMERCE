'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { favoritesApi } from '@/lib/api';
import { ProductCard } from '@/components/catalog/ProductCard';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { Product } from '@/types';

/**
 * Favourites / wishlist page — shows all products the user has hearted.
 * Loads favourite IDs via the useFavorites hook (shared store), then fetches
 * the full product objects from the API to render ProductCard components.
 */
export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    favoritesApi
      .list()
      .then(setProducts)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load favourites';
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [favoriteIds.size]); // re-fetch when the count changes (toggle)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ flex: 1, maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 }, py: 4, width: '100%' }}
      >
        {/* Page header */}
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: '38px',
            mb: '6px',
            color: '#18181b',
          }}
        >
          My Favourites
        </Typography>
        <Typography
          sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#71717a', mb: 3 }}
        >
          {products.length > 0
            ? `${products.length} saved item${products.length !== 1 ? 's' : ''}`
            : 'Products you heart will appear here'}
        </Typography>

        {isLoading && <PageLoader />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Favorite sx={{ fontSize: 64, color: '#ededf0', mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Saira Condensed", sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: '22px',
                color: '#71717a',
                mb: 1,
              }}
            >
              No favourites yet
            </Typography>
            <Typography
              sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#a1a1aa' }}
            >
              Heart a product on the catalogue to save it here
            </Typography>
          </Box>
        )}

        {!isLoading && products.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
