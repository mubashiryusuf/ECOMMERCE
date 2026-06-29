import NextLink from 'next/link';
import { Box } from '@mui/material';

const BRANDS = ['Adidas', 'Puma', 'Nike', 'Reebok'];

export function SuperSaleBanner() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 7, md: 9 },
      }}
    >
      {/* Full orange background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #ff7a2e 0%, #f2541c 100%)',
        }}
      />
      {/* Left dark panel */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '22%',
          background: '#101012',
          clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)',
        }}
      />
      {/* Right dark panel */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '22%',
          background: '#101012',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      {/* Bottom dark V */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '180px solid transparent',
          borderRight: '180px solid transparent',
          borderBottom: '80px solid #101012',
        }}
      />

      {/* White card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          background: '#fff',
          borderRadius: '24px',
          px: { xs: 5, md: 8 },
          py: { xs: 4, md: 5 },
          textAlign: 'center',
          minWidth: { xs: 280, sm: 380, md: 440 },
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <Box
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: { xs: '30px', md: '42px' },
            color: '#18181b',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          Super Sale
        </Box>
        <Box
          sx={{
            fontFamily: '"Saira Condensed", sans-serif',
            fontWeight: 800,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: { xs: '22px', md: '32px' },
            color: '#f2622a',
            letterSpacing: '0.02em',
            mb: 3,
          }}
        >
          Upto 50% Off
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {BRANDS.map((b) => (
            <Box
              key={b}
              component={NextLink}
              href={`/?category=${b}`}
              sx={{
                display: 'inline-block',
                background: '#f2622a',
                borderRadius: '12px',
                px: '18px',
                py: '10px',
                fontFamily: '"Saira", sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#fff',
                textDecoration: 'none',
                transition: 'background 0.2s, transform 0.15s',
                '&:hover': { background: '#d94e18', transform: 'translateY(-2px)' },
              }}
            >
              {b}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
