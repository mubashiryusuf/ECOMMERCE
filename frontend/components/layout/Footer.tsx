import NextLink from 'next/link';
import { Box, Typography, Grid, Link, Divider, Stack } from '@mui/material';

function ApexLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <Box
        sx={{
          display: 'inline-block',
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #ff7a2e, #f2541c)',
          clipPath: 'polygon(0 0, 100% 0, 68% 100%, 0% 100%)',
          transform: 'skewX(-8deg)',
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: '22px',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          color: '#fff',
          '& span': { color: '#f2622a' },
        }}
      >
        APEX<span>.</span>
      </Typography>
    </Box>
  );
}

const TRUST_ITEMS = [
  {
    label: 'Free Delivery',
    sub: 'Orders over $200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Easy Returns',
    sub: '30-day hassle-free',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
  },
  {
    label: 'Secure Payment',
    sub: '256-bit SSL',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: '24/7 Support',
    sub: 'Always here for you',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0c0c0e', color: '#fff', mt: 'auto' }}>
      {/* Trust strip */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', py: '20px', px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            maxWidth: 1320,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <Stack key={item.label} direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: '#f2622a', flexShrink: 0 }}>{item.icon}</Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#fff',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {item.sub}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>

      {/* Main footer content */}
      <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 }, py: 5 }}>
        <Grid container spacing={5}>
          {/* Brand column */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 2 }}>
              <ApexLogo />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '14px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 280,
              }}
            >
              Premium sports equipment, footwear, and apparel from the brands that define the game.
              Built for the relentless.
            </Typography>
          </Grid>

          {/* Shop links */}
          <Grid item xs={6} sm={4}>
            <Typography
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.4)',
                mb: 2,
              }}
            >
              Shop
            </Typography>
            {[
              { label: 'All Products', href: '/' },
              { label: 'New Arrivals', href: '/?sort=newest' },
              { label: 'Sale', href: '/?sort=price_asc' },
              { label: 'My Cart', href: '/cart' },
              { label: 'My Orders', href: '/orders' },
            ].map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#f2622a' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          {/* Account links */}
          <Grid item xs={6} sm={4}>
            <Typography
              sx={{
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.4)',
                mb: 2,
              }}
            >
              Account
            </Typography>
            {[
              { label: 'Sign In', href: '/login' },
              { label: 'Create Account', href: '/signup' },
            ].map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#f2622a' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 5, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography
            sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}
          >
            © {new Date().getFullYear()} APEX. All rights reserved. Prices in USD.
          </Typography>
          <Typography
            sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}
          >
            🔒 Secure checkout · 30-day returns · Free shipping over $200
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
