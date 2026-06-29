import { Suspense } from 'react';
import { Box } from '@mui/material';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';

interface CatalogPageProps {
  searchParams: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

/**
 * Storefront catalog page — server component.
 *
 * Reads filter state from URL query params (searchParams) and passes them
 * to ProductGrid. All filter interactions update the URL so state is
 * shareable/bookmarkable and handled via useSearchParams() on the client.
 */
export default function CatalogPage({ searchParams }: CatalogPageProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        <Suspense fallback={<PageLoader />}>
          <ProductGrid
            initialSearch={searchParams.search}
            initialCategory={searchParams.category}
            initialMinPrice={searchParams.minPrice ? Number(searchParams.minPrice) : undefined}
            initialMaxPrice={searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined}
            initialSort={searchParams.sort as 'price_asc' | 'price_desc' | 'newest' | undefined}
            initialPage={searchParams.page ? Number(searchParams.page) : 1}
          />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}
