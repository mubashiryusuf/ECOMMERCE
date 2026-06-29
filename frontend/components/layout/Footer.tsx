import NextLink from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Link,
  Divider,
  Stack,
} from '@mui/material';
import {
  LocalShipping,
  Replay,
  Lock,
  SupportAgent,
} from '@mui/icons-material';

/**
 * Storefront footer.
 *
 * Contains:
 * - Trust indicators strip (free delivery, easy returns, secure payment, support)
 * - Multi-column footer links
 * - Copyright
 */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        mt: 'auto',
      }}
    >
      {/* Trust indicators */}
      <Box
        sx={{
          bgcolor: 'primary.light',
          py: 2,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {[
            { icon: <LocalShipping />, label: 'Free Delivery', sub: 'Orders over $50' },
            { icon: <Replay />, label: 'Easy Returns', sub: '30-day hassle-free' },
            { icon: <Lock />, label: 'Secure Payment', sub: '256-bit SSL' },
            { icon: <SupportAgent />, label: 'Support', sub: 'Mon–Sat 9am–6pm' },
          ].map((item) => (
            <Stack
              key={item.label}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <Box sx={{ color: 'secondary.main', flexShrink: 0 }}>{item.icon}</Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                  {item.sub}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Links grid */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              SportsPlusStore
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              Your one-stop destination for premium sports equipment and apparel.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              Shop
            </Typography>
            {[
              { label: 'All Products', href: '/' },
              { label: 'Cart', href: '/cart' },
              { label: 'Orders', href: '/orders' },
            ].map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.main' },
                  fontSize: '0.875rem',
                }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              Account
            </Typography>
            {[
              { label: 'Sign in', href: '/login' },
              { label: 'Create account', href: '/signup' },
            ].map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.main' },
                  fontSize: '0.875rem',
                }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 4, mb: 2 }} />

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} SportsPlusStore. All rights reserved. Prices in USD.
        </Typography>
      </Box>
    </Box>
  );
}
