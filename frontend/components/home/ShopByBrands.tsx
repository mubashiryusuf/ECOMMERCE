'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, Skeleton } from '@mui/material';
import { brandsApi } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import type { Brand } from '@/types';

export function ShopByBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandsApi
      .list()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Hide section entirely if no brands exist and loading is done
  if (!isLoading && brands.length === 0) return null;

  return (
    <Box component="section" sx={{ bgcolor: '#f4f4f5', py: { xs: 5, md: 7 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            component="h2"
            sx={{
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: { xs: '28px', md: '36px' },
              m: 0,
              color: '#18181b',
              letterSpacing: '0.02em',
            }}
          >
            Shop By Brands
          </Box>
          <Box sx={{ width: 48, height: 4, background: '#f2622a', borderRadius: 1, mx: 'auto', mt: '10px' }} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ borderRadius: '16px', aspectRatio: '3/4', height: 'auto' }}
                />
              ))
            : brands.map((brand) => (
                <Box
                  key={brand.id}
                  component={NextLink}
                  href={`/?brand=${encodeURIComponent(brand.name)}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#101012',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                    '&:hover img': { opacity: 0.85 },
                  }}
                >
                  {/* Brand name overlay top */}
                  <Box
                    sx={{
                      p: '14px 16px',
                      fontFamily: '"Saira Condensed", sans-serif',
                      fontWeight: 800,
                      fontStyle: 'italic',
                      fontSize: '20px',
                      textTransform: 'uppercase',
                      color: '#fff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {brand.name}
                  </Box>

                  {/* Brand image */}
                  {brand.imageUrl ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(brand.imageUrl)}
                      alt={brand.name}
                      sx={{
                        width: '100%',
                        aspectRatio: '4/3',
                        objectFit: 'cover',
                        opacity: 0.75,
                        transition: 'opacity 0.2s',
                        flex: 1,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    /* Fallback placeholder when no image is set */
                    <Box
                      sx={{
                        aspectRatio: '4/3',
                        background: 'linear-gradient(135deg, #1a1a1e 0%, #2d2d35 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          fontFamily: '"Saira Condensed", sans-serif',
                          fontWeight: 800,
                          fontStyle: 'italic',
                          fontSize: '48px',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.12)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {brand.name.charAt(0)}
                      </Box>
                    </Box>
                  )}

                  {/* Orange footer bar */}
                  <Box
                    sx={{
                      background: '#f2622a',
                      py: '10px',
                      px: '16px',
                      textAlign: 'center',
                      fontFamily: '"Saira", sans-serif',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#fff',
                    }}
                  >
                    Shop {brand.name}
                  </Box>
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
}
