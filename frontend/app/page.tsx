import { Suspense } from 'react';
import { Box } from '@mui/material';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/layout/HeroSection';
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

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  const hasFilters = !!(
    searchParams.search ||
    searchParams.category ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.sort
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5' }}>
      <Navbar />

      {/* Hero — only on unfiltered home */}
      {!hasFilters && !searchParams.page && <HeroSection />}

      {/* Catalog section */}
      <Box
        sx={{
          maxWidth: 1320,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        {/* Section heading */}
        {!hasFilters && (
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              component="h2"
              sx={{
                fontFamily: '"Saira Condensed", sans-serif',
                fontWeight: 800,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                fontSize: '34px',
                m: 0,
                letterSpacing: '0.02em',
                color: '#18181b',
              }}
            >
              Top Trending
            </Box>
            <Box
              sx={{
                width: 54,
                height: 4,
                background: '#f2622a',
                borderRadius: 1,
                mx: 'auto',
                mt: '10px',
              }}
            />
          </Box>
        )}

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
