import NextLink from 'next/link';
import { Box, Divider } from '@mui/material';

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
      <Box
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
      </Box>
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

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Box
      component={NextLink}
      href={href}
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
      {children}
    </Box>
  );
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        fontFamily: '"Saira", sans-serif',
        fontWeight: 700,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.4)',
        mb: 2.5,
      }}
    >
      {children}
    </Box>
  );
}

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
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ color: '#f2622a', flexShrink: 0 }}>{item.icon}</Box>
              <Box>
                <Box
                  sx={{
                    fontFamily: '"Saira", sans-serif',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#fff',
                  }}
                >
                  {item.label}
                </Box>
                <Box
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {item.sub}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main footer content */}
      <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 }, py: 5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1.4fr 1fr 1fr 1fr' },
            gap: { xs: 4, md: 5 },
          }}
        >
          {/* Brand column */}
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
            <Box sx={{ mb: 2 }}>
              <ApexLogo />
            </Box>
            <Box
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 260,
                mb: 2,
              }}
            >
              Performance footwear, apparel and equipment for athletes who refuse to settle. Built for the relentless.
            </Box>
            <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', mb: '4px' }}>
              Email: hello@apex.store
            </Box>
            <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              Available: Mon–Sat · 10:30–18:30
            </Box>
          </Box>

          {/* Shop column */}
          <Box>
            <ColHeading>Shop</ColHeading>
            <FooterLink href="/?category=Men">Men</FooterLink>
            <FooterLink href="/?category=Women">Women</FooterLink>
            <FooterLink href="/?category=Kids">Kids</FooterLink>
            <FooterLink href="/?sort=newest">New Arrivals</FooterLink>
            <FooterLink href="/?sort=price_asc">Sale</FooterLink>
          </Box>

          {/* Help column */}
          <Box>
            <ColHeading>Help</ColHeading>
            <FooterLink href="/returns">Returns &amp; Exchanges</FooterLink>
            <FooterLink href="/shipping">Shipping</FooterLink>
            <FooterLink href="/orders">Order Tracking</FooterLink>
            <FooterLink href="/faqs">FAQs</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </Box>

          {/* Follow column */}
          <Box>
            <ColHeading>Follow</ColHeading>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {/* Instagram */}
              <Box
                component="a"
                href="#"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                  '&:hover': { borderColor: '#f2622a', color: '#f2622a' },
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </Box>
              {/* Facebook */}
              <Box
                component="a"
                href="#"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                  '&:hover': { borderColor: '#f2622a', color: '#f2622a' },
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 5, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 APEX Store. All rights reserved. · A design-reference mockup.
          </Box>
          <Box sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            Secure checkout · 30-day returns · Free shipping over $200
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
