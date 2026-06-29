import NextLink from 'next/link';
import { Box } from '@mui/material';

const BRANDS = [
  { name: 'Adidas', href: '/?category=Adidas', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { name: 'Puma', href: '/?category=Puma', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80' },
  { name: 'Nike', href: '/?category=Nike', img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80' },
  { name: 'Reebok', href: '/?category=Reebok', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80' },
];

export function ShopByBrands() {
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
          {BRANDS.map((brand) => (
            <Box
              key={brand.name}
              component={NextLink}
              href={brand.href}
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
              {/* Image */}
              <Box
                component="img"
                src={brand.img}
                alt={brand.name}
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  opacity: 0.75,
                  transition: 'opacity 0.2s',
                  flex: 1,
                }}
              />
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
