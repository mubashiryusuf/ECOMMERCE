import { Suspense } from 'react';
import { Box } from '@mui/material';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/layout/HeroSection';
import { TopCategories } from '@/components/home/TopCategories';
import { ShopByBrands } from '@/components/home/ShopByBrands';
import { Bestsellers } from '@/components/home/Bestsellers';
import { SuperSaleBanner } from '@/components/home/SuperSaleBanner';
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

  const isHome = !hasFilters && !searchParams.page;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f4f5' }}>
      <Navbar />

      {/* Home-only promotional sections */}
      {isHome && (
        <>
          <HeroSection />
          <TopCategories />
          <ShopByBrands />
          <Bestsellers />
        </>
      )}

      {/* Product catalog — always visible */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1320, mx: 'auto', px: { xs: 2, md: 4 } }}>
          {isHome && (
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
                Top Trending
              </Box>
              <Box sx={{ width: 48, height: 4, background: '#f2622a', borderRadius: 1, mx: 'auto', mt: '10px' }} />
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
      </Box>

      {/* Super Sale banner — home only */}
      {isHome && <SuperSaleBanner />}

      <Footer />
    </Box>
  );
}
