'use client';

import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Skeleton,
  FormGroup,
} from '@mui/material';
import { formatPrice } from '@/utils/formatters';

interface FilterPanelProps {
  categories: string[];
  categoriesLoading?: boolean;
  selectedCategories: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (range: [number, number]) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: '"Saira", sans-serif',
        fontWeight: 700,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#18181b',
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}

export function FilterPanel({
  categories,
  categoriesLoading,
  selectedCategories,
  onCategoryChange,
  priceRange,
  maxPrice,
  onPriceChange,
  sort,
  onSortChange,
}: FilterPanelProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        sx={{
          fontFamily: '"Saira Condensed", sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          fontSize: '22px',
          color: '#18181b',
          letterSpacing: '0.02em',
        }}
      >
        Filters
      </Typography>

      {/* Sort */}
      <Box
        sx={{
          background: '#fff',
          border: '1px solid #ededf0',
          borderRadius: '12px',
          p: '16px 18px',
        }}
      >
        <SectionHeading>Sort By</SectionHeading>
        <FormGroup>
          {SORT_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt.value}
              control={
                <Checkbox
                  size="small"
                  checked={sort === opt.value}
                  onChange={() => onSortChange(opt.value)}
                  sx={{
                    color: '#e7e7ea',
                    '&.Mui-checked': { color: '#f2622a' },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', color: '#52525b' }}>
                  {opt.label}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      {/* Category */}
      <Box
        sx={{
          background: '#fff',
          border: '1px solid #ededf0',
          borderRadius: '12px',
          p: '16px 18px',
        }}
      >
        <SectionHeading>Category</SectionHeading>
        {categoriesLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={32} sx={{ my: 0.25 }} />
          ))
        ) : (
          <FormGroup>
            {categories.map((cat) => (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategories.includes(cat)}
                    onChange={(e) => onCategoryChange(cat, e.target.checked)}
                    sx={{
                      color: '#e7e7ea',
                      '&.Mui-checked': { color: '#f2622a' },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '13.5px', color: '#52525b' }}>
                    {cat}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        )}
      </Box>

      {/* Price range */}
      <Box
        sx={{
          background: '#fff',
          border: '1px solid #ededf0',
          borderRadius: '12px',
          p: '16px 18px',
        }}
      >
        <SectionHeading>Price Range</SectionHeading>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            min={0}
            max={maxPrice}
            step={100}
            onChange={(_, value) => onPriceChange(value as [number, number])}
            sx={{ color: '#f2622a', '& .MuiSlider-thumb': { background: '#f2622a' } }}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => formatPrice(v)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a' }}>
              {formatPrice(priceRange[0])}
            </Typography>
            <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: '12px', color: '#71717a' }}>
              {formatPrice(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
