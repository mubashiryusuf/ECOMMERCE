import { Box, Typography } from '@mui/material';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const SECTIONS = [
  {
    title: '30-Day Return Policy',
    body: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached. Sale items are final sale and cannot be returned.',
  },
  {
    title: 'How to Start a Return',
    body: 'Email us at returns@apex.store with your order number and the item(s) you wish to return. We will send you a prepaid return label within 1–2 business days. Drop the parcel at any authorised courier location.',
  },
  {
    title: 'Exchanges',
    body: 'Want a different size or colour? We offer free exchanges on all full-price items. Simply start a return and place a new order — your refund will be processed as soon as we receive the original item.',
  },
  {
    title: 'Refund Timeline',
    body: 'Once we receive and inspect your return (1–3 business days), your refund will be issued to your original payment method within 5–7 business days. You will receive a confirmation email when the refund is processed.',
  },
  {
    title: 'Non-Returnable Items',
    body: 'For hygiene reasons, socks, insoles, and face coverings cannot be returned. Customised or personalised products are also excluded from our return policy.',
  },
];

export default function ReturnsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{ bgcolor: '#101012', py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', color: '#f2622a', textTransform: 'uppercase', mb: 1.5 }}>
            Customer Care
          </Typography>
          <Typography sx={{ fontFamily: '"Saira Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: { xs: '40px', md: '56px' }, textTransform: 'uppercase', color: '#fff', lineHeight: 0.95 }}>
            Returns &<br /><Box component="span" sx={{ color: '#f2622a' }}>Exchanges</Box>
          </Typography>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', mt: 2, maxWidth: 480 }}>
            Hassle-free returns within 30 days. No questions asked.
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box component="main" sx={{ flex: 1, maxWidth: 860, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {SECTIONS.map((s) => (
            <Box key={s.title} sx={{ bgcolor: '#fff', border: '1px solid #ededf0', borderRadius: '16px', p: { xs: '24px', md: '32px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 4, height: 28, bgcolor: '#f2622a', borderRadius: 2, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: '"Saira", sans-serif', fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#18181b' }}>
                  {s.title}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '14.5px', color: '#52525b', lineHeight: 1.75, pl: '20px' }}>
                {s.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
