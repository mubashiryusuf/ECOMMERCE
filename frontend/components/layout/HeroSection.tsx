'use client';

import NextLink from 'next/link';
import { Box, Typography, Button } from '@mui/material';

export function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        background: '#101012',
        overflow: 'hidden',
        minHeight: 480,
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
      }}
    >
      {/* Left content */}
      <Box
        sx={{
          padding: '72px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.24em',
            fontSize: '12px',
            color: '#f2622a',
            textTransform: 'uppercase',
            mb: 2,
          }}
        >
          Season 2026 · New Arrivals
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: { xs: '52px', md: '80px', lg: '96px' },
            lineHeight: 0.86,
            color: '#fff',
            m: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.005em',
          }}
        >
          Move<br />Without<br />
          <Box component="span" sx={{ color: '#f2622a' }}>Limits</Box>
        </Typography>

        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#a1a1aa',
            maxWidth: 380,
            my: '26px',
          }}
        >
          Engineered footwear, apparel and equipment from the brands that define the game.
          Built for the relentless.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={NextLink}
            href="/?sort=newest"
            variant="contained"
            size="large"
            sx={{
              background: '#f2622a',
              color: '#fff',
              borderRadius: '10px',
              '&:hover': { background: '#d94e18' },
              px: 4,
              py: '15px',
            }}
          >
            Shop New In
          </Button>
          <Button
            component={NextLink}
            href="/?sort=price_asc"
            variant="outlined"
            size="large"
            sx={{
              background: 'transparent',
              color: '#fff',
              borderColor: '#3a3a40',
              borderWidth: '1.5px',
              borderRadius: '10px',
              '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.05)', borderWidth: '1.5px' },
              px: 4,
              py: '15px',
            }}
          >
            Explore Sale
          </Button>
        </Box>
      </Box>

      {/* Right image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1000&q=80"
          alt="Athlete in action"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80';
          }}
        />
        {/* Gradient overlay blending into left panel */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #101012 0%, rgba(16,16,18,0) 32%)',
          }}
        />
      </Box>

      {/* Decorative orange diamond */}
      <Box
        sx={{
          position: 'absolute',
          right: '30%',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: 140,
          height: 140,
          background: 'rgba(242,98,42,0.15)',
          pointerEvents: 'none',
          animation: 'apexFloat 5.5s ease-in-out infinite',
          '@keyframes apexFloat': {
            '0%, 100%': { transform: 'translateY(-50%) rotate(45deg)' },
            '50%': { transform: 'translateY(-58%) rotate(45deg)' },
          },
        }}
      />
    </Box>
  );
}
