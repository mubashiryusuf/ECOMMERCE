import NextLink from 'next/link';
import { Box } from '@mui/material';

const CATEGORIES = [
  { label: 'Running Shoes', href: '/?category=Running+Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', bg: '#fee2e2' },
  { label: 'Casual Shoes', href: '/?category=Casual+Shoes', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80', bg: '#dcfce7' },
  { label: 'Soccer Shoes', href: '/?category=Soccer', img: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=80', bg: '#d1fae5' },
  { label: 'Tees', href: '/?category=Apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', bg: '#f1f5f9' },
  { label: 'Pants / Tights', href: '/?category=Apparel', img: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&q=80', bg: '#f0fdf4' },
  { label: 'Tracksuits', href: '/?category=Apparel', img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80', bg: '#fafafa' },
];

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
          {CATEGORIES.map((cat) => (
            <Box
              key={cat.label}
              component={NextLink}
              href={cat.href}
              sx={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: '14px',
                overflow: 'hidden',
                background: cat.bg,
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Box
                component="img"
                src={cat.img}
                alt={cat.label}
                sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
              />
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
                {cat.label}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
