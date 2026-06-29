import { Suspense } from 'react';
import { Box } from '@mui/material';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductDetailClient } from '@/components/catalog/ProductDetailClient';
import { PageLoader } from '@/components/ui/PageLoader';

interface ProductPageProps {
  params: { id: string };
}

/**
 * Product Detail Page (PDP) — server component shell.
 *
 * The actual data fetching and interactive elements (add-to-cart, quantity selector)
 * are handled in ProductDetailClient (client component) to support cart interactions.
 */
export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <ProductDetailClient productId={params.id} />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}
