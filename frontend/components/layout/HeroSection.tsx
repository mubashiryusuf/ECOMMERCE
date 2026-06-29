'use client';

import NextLink from 'next/link';
import { Box } from '@mui/material';

export function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        background: '#101012',
        overflow: 'hidden',
        minHeight: { xs: 420, md: 520 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
      }}
    >
      {/* Left content */}
      <Box
        sx={{
          padding: { xs: '52px 28px 52px', md: '72px 56px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.2em',
            fontSize: '11px',
            color: '#f2622a',
            textTransform: 'uppercase',
            mb: 2,
          }}
        >
          Season 2026 · Drop 01
        </Box>

        <Box
          component="h1"
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: { xs: '50px', md: '68px', lg: '80px' },
            lineHeight: 0.92,
            color: '#fff',
            m: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.005em',
            mb: 3,
          }}
        >
          Gear Up for<br />
          Greatness With<br />
          <Box component="span" sx={{ color: '#f2622a' }}>New Arrivals</Box>
        </Box>

        {/* Category pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 999,
            px: '20px',
            py: '10px',
            mb: 4,
            width: 'fit-content',
          }}
        >
          {['Apparel', 'Footwear', 'Hardware'].map((label, i) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box
                sx={{
                  fontFamily: '"Saira", sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#fff',
                }}
              >
                {label}
              </Box>
              {i < 2 && (
                <Box sx={{ width: 20, height: 2, background: '#f2622a', borderRadius: 1 }} />
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box
            component={NextLink}
            href="/?sort=newest"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 50,
              px: '28px',
              background: '#f2622a',
              borderRadius: '10px',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '13px',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background 0.2s',
              '&:hover': { background: '#d94e18' },
            }}
          >
            Shop New In
          </Box>
          <Box
            component={NextLink}
            href="/?sort=price_asc"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 50,
              px: '28px',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.22)',
              borderRadius: '10px',
              fontFamily: '"Saira", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '13px',
              color: '#fff',
              textDecoration: 'none',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: '#fff' },
            }}
          >
            Explore Sale
          </Box>
        </Box>
      </Box>

      {/* Right image */}
      <Box sx={{ position: 'relative', overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1000&q=80"
          alt="Athlete training"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #101012 0%, rgba(16,16,18,0) 35%)',
          }}
        />
      </Box>

      {/* Orange right accent bar */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, #ff7a2e 0%, #f2541c 100%)',
        }}
      />
    </Box>
  );
}
