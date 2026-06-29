'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  Skeleton,
  Alert,
  Pagination,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { productsApi } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';
import type { Product, PaginatedResponse } from '@/types';

const ITEMS_PER_PAGE = 12;
const DEFAULT_MAX_PRICE_CENTS = 100_000; // $1000

interface ProductGridProps {
  initialSearch?: string;
  initialCategory?: string;
  initialMinPrice?: number; // in cents
  initialMaxPrice?: number; // in cents
  initialSort?: 'price_asc' | 'price_desc' | 'newest';
  initialPage?: number;
}

/**
 * Main product grid for the catalog page.
 *
 * - Reads filter state from URL query params via useSearchParams()
 * - Renders FilterPanel in a persistent left drawer (desktop) or overlay (mobile)
 * - Shows skeleton placeholders while loading
 * - Pagination at the bottom
 * - All filter changes are pushed to URL (shareable, bookmarkable state)
 */
export function ProductGrid({
  initialSearch,
  initialCategory,
  initialMinPrice = 0,
  initialMaxPrice = DEFAULT_MAX_PRICE_CENTS,
  initialSort = 'newest',
  initialPage = 1,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current filter state from URL (takes precedence over initial props)
  const search = searchParams.get('search') ?? initialSearch ?? '';
  const category = searchParams.get('category') ?? initialCategory ?? '';
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : initialMinPrice;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : initialMaxPrice;
  const sort = (searchParams.get('sort') ?? initialSort) as 'price_asc' | 'price_desc' | 'newest';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : initialPage;

  // Fetch categories for the filter panel
  useEffect(() => {
    productsApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productsApi.list({
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < DEFAULT_MAX_PRICE_CENTS ? maxPrice : undefined,
        sort: sort || undefined,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Utility: push filter changes to URL
  const updateUrl = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 0) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (q: string) => {
    updateUrl({ search: q || undefined, page: undefined });
  };

  const handleCategoryChange = (cat: string, _checked: boolean) => {
    const next = category === cat ? '' : cat;
    updateUrl({ category: next || undefined, page: undefined });
  };

  const handlePriceChange = (range: [number, number]) => {
    updateUrl({
      minPrice: range[0] > 0 ? range[0] : undefined,
      maxPrice: range[1] < DEFAULT_MAX_PRICE_CENTS ? range[1] : undefined,
      page: undefined,
    });
  };

  const handleSortChange = (s: string) => {
    updateUrl({ sort: s, page: undefined });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    updateUrl({ page: newPage > 1 ? newPage : undefined });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageCount = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const filterPanel = (
    <FilterPanel
      categories={categories}
      selectedCategories={category ? [category] : []}
      onCategoryChange={handleCategoryChange}
      priceRange={[minPrice, maxPrice]}
      maxPrice={DEFAULT_MAX_PRICE_CENTS}
      onPriceChange={handlePriceChange}
      sort={sort}
      onSortChange={handleSortChange}
    />
  );

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Desktop sidebar filter */}
      {!isMobile && (
        <Box sx={{ width: 260, flexShrink: 0 }}>
          {filterPanel}
        </Box>
      )}

      {/* Mobile filter drawer */}
      {isMobile && (
        <Drawer
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{ sx: { width: 300, p: 2 } }}
        >
          {filterPanel}
        </Drawer>
      )}

      {/* Product area */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Search + mobile filter toggle */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <SearchBar defaultValue={search} onSearch={handleSearch} />
          {isMobile && (
            <IconButton
              onClick={() => setMobileFilterOpen(true)}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              aria-label="Open filters"
            >
              <FilterList />
            </IconButton>
          )}
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {data && (
            <Typography variant="body2" color="text.secondary">
              {data.total === 0
                ? 'No products found'
                : `${data.total} product${data.total === 1 ? '' : 's'}`}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Skeleton loading */}
        {isLoading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 2.5 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: '16px' }} />
            ))}
          </Box>
        )}

        {/* Products */}
        {!isLoading && data && data.items.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 2.5 }}>
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && data && data.items.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search term
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {!isLoading && pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
