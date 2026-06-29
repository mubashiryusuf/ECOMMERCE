'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, CircularProgress } from '@mui/material';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';

export function Bestsellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list({ sort: 'newest', limit: 4, page: 1 })
      .then((res) => setProducts(res.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 5 }}>
          <Box>
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
              Bestsellers
            </Box>
            <Box sx={{ width: 48, height: 4, background: '#f2622a', borderRadius: 1, mt: '10px' }} />
          </Box>
          <Box
            component={NextLink}
            href="/"
            sx={{
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#f2622a',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All →
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#f2622a' }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {products.map((p, i) => (
              <Box
                key={p.id}
                component={NextLink}
                href={`/products/${p.id}`}
                sx={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    background: '#fff',
                    border: '1px solid #ededf0',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'transform 0.2s, border-color 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', borderColor: '#f2622a' },
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f9f9f9' }}>
                    {i === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 1,
                          background: '#f2622a',
                          color: '#fff',
                          fontFamily: '"Saira", sans-serif',
                          fontWeight: 700,
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          px: '7px',
                          py: '3px',
                          borderRadius: '6px',
                        }}
                      >
                        Hot
                      </Box>
                    )}
                    <Box
                      component="img"
                      src={p.imageUrl}
                      alt={p.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                  </Box>
                  <Box sx={{ p: '14px' }}>
                    <Box
                      sx={{
                        fontFamily: '"Manrope", sans-serif',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#a1a1aa',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        mb: '4px',
                      }}
                    >
                      {p.category}
                    </Box>
                    <Box
                      sx={{
                        fontFamily: '"Manrope", sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#18181b',
                        mb: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.name}
                    </Box>
                    <Box
                      sx={{
                        fontFamily: '"Saira Condensed", sans-serif',
                        fontWeight: 800,
                        fontSize: '20px',
                        color: '#18181b',
                      }}
                    >
                      ${(p.priceCents / 100).toFixed(2)}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
