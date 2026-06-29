'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const FAQS = [
  {
    category: 'Orders',
    items: [
      { q: 'How do I place an order?', a: 'Browse our catalogue, add items to your cart, and proceed to checkout. You will need an account to complete your purchase.' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters fulfilment and cannot be changed. Contact us immediately at hello@apex.store.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. All transactions are secured with 256-bit SSL encryption.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { q: 'How do I find my size?', a: 'Each product page includes a size guide. We recommend measuring your foot length and comparing it to the chart. If you are between sizes, we suggest sizing up for footwear.' },
      { q: 'Are your products authentic?', a: 'All products sold on APEX are 100% authentic and sourced directly from official brand distributors. We do not sell replicas or grey-market goods.' },
      { q: 'What does "Only X left" mean?', a: 'This badge means stock is running low — 5 or fewer units remain. We recommend adding to cart promptly as we cannot reserve items.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I create an account?', a: 'Click the person icon in the top navigation and select Sign Up. You will need a valid email address and a password of at least 8 characters.' },
      { q: 'I forgot my password. What should I do?', a: 'Click "Forgot password" on the login screen and enter your email address. We will send you a reset link valid for 24 hours.' },
      { q: 'Can I save items for later?', a: 'Yes — click the heart icon on any product card to add it to your Favourites. Access your saved items by clicking the heart icon in the top navigation.' },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{ borderBottom: '1px solid #f0f0f1', cursor: 'pointer' }}
      onClick={() => setOpen((o) => !o)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '18px', px: '24px', gap: 2 }}>
        <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.02em', color: '#18181b' }}>
          {q}
        </Typography>
        <Box sx={{ color: '#f2622a', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Box>
      </Box>
      {open && (
        <Box sx={{ px: '24px', pb: '18px' }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#52525b', lineHeight: 1.75 }}>
            {a}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function FaqsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#101012', py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', color: '#f2622a', textTransform: 'uppercase', mb: 1.5 }}>
            Help Centre
          </Typography>
          <Typography sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: { xs: '40px', md: '56px' }, textTransform: 'uppercase', color: '#fff', lineHeight: 0.95 }}>
            Frequently<br /><Box component="span" sx={{ color: '#f2622a' }}>Asked Questions</Box>
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', mt: 2 }}>
            Can&apos;t find what you need? Email us at hello@apex.store
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, maxWidth: 860, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FAQS.map((section) => (
            <Box key={section.category}>
              <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f2622a', mb: 2 }}>
                {section.category}
              </Typography>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '16px', overflow: 'hidden' }}>
                {section.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
