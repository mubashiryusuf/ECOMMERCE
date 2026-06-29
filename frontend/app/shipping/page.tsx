import { Box, Typography } from '@mui/material';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const RATES = [
  { method: 'Standard Delivery', time: '3–5 business days', cost: 'Free over $200 · $5.99 below' },
  { method: 'Express Delivery', time: '1–2 business days', cost: '$12.99' },
  { method: 'Next Day Delivery', time: 'Order before 1 PM', cost: '$19.99' },
  { method: 'International', time: '7–14 business days', cost: 'From $24.99' },
];

const FAQS = [
  { q: 'When will my order ship?', a: 'Orders placed before 1 PM on business days are dispatched the same day. Orders placed after 1 PM or on weekends ship the next business day.' },
  { q: 'Can I change my delivery address?', a: 'If your order has not yet been dispatched, contact us at shipping@apex.store and we will update the address. Once shipped, address changes are not possible.' },
  { q: 'How do I track my order?', a: 'Once your order is dispatched, you will receive a tracking link via email. You can also visit My Orders in your account to view real-time status updates.' },
  { q: 'Do you ship to PO boxes?', a: 'We ship to PO boxes for Standard Delivery only. Express and Next Day services require a physical address.' },
];

export default function ShippingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#101012', py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', color: '#f2622a', textTransform: 'uppercase', mb: 1.5 }}>
            Delivery
          </Typography>
          <Typography sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: { xs: '40px', md: '56px' }, textTransform: 'uppercase', color: '#fff', lineHeight: 0.95 }}>
            Shipping<br /><Box component="span" sx={{ color: '#f2622a' }}>Information</Box>
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', mt: 2, maxWidth: 480 }}>
            Free standard delivery on orders over $200.
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, maxWidth: 860, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, width: '100%' }}>
        {/* Rates table */}
        <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#18181b', mb: 3 }}>
          Delivery Options
        </Typography>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '16px', overflow: 'hidden', mb: 5 }}>
          {RATES.map((r, i) => (
            <Box key={r.method} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, p: '20px 28px', borderBottom: i < RATES.length - 1 ? '1px solid #f0f0f1' : 'none', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '13.5px', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {r.method}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', color: '#52525b' }}>
                {r.time}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', fontWeight: 600, color: '#f2622a' }}>
                {r.cost}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* FAQs */}
        <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#18181b', mb: 3 }}>
          Common Questions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQS.map((f) => (
            <Box key={f.q} sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '14px', p: '22px 28px' }}>
              <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.02em', color: '#18181b', mb: 1 }}>
                {f.q}
              </Typography>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14px', color: '#52525b', lineHeight: 1.7 }}>
                {f.a}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
