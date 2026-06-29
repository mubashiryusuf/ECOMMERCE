'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, Skeleton } from '@mui/material';
import { categoriesApi } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import type { Category } from '@/types';

// Fallback background colours cycle when a category has no imageUrl
const FALLBACK_BGS = ['#fee2e2', '#dcfce7', '#d1fae5', '#f1f5f9', '#f0fdf4', '#fafafa'];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
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
        {children}
      </Box>
      <Box sx={{ width: 48, height: 4, background: '#f2622a', borderRadius: 1, mx: 'auto', mt: '10px' }} />
    </Box>
  );
}

export function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => {
        // Non-fatal — section simply won't render
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Nothing to show once loaded and empty
  if (!loading && categories.length === 0) return null;

  return (
    <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
        <SectionHeading>Top Category</SectionHeading>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
            gap: 2,
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ borderRadius: '14px', aspectRatio: '1', width: '100%', height: 'auto' }}
                />
              ))
            : categories.map((cat, i) => {
                const fallbackBg = FALLBACK_BGS[i % FALLBACK_BGS.length];
                return (
                  <Box
                    key={cat.id}
                    component={NextLink}
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    sx={{
                      display: 'block',
                      textDecoration: 'none',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: cat.imageUrl ? 'transparent' : fallbackBg,
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    {cat.imageUrl ? (
                      <Box
                        component="img"
                        src={resolveImageUrl(cat.imageUrl, '')}
                        alt={cat.name}
                        sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      // Solid colour tile when no image — fill the square
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          background: fallbackBg,
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
                            fontSize: '22px',
                            textTransform: 'uppercase',
                            color: '#71717a',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {cat.name.charAt(0)}
                        </Box>
                      </Box>
                    )}
                    <Box
                      sx={{
                        p: '10px 12px',
                        fontFamily: '"Saira", sans-serif',
                        fontWeight: 700,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#18181b',
                      }}
                    >
                      {cat.name}
                    </Box>
                  </Box>
                );
              })}
        </Box>
      </Box>
    </Box>
  );
}
