'use client';

import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Divider,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { formatPrice } from '@/utils/formatters';

interface FilterPanelProps {
  categories: string[];
  categoriesLoading?: boolean;
  selectedCategories: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  priceRange: [number, number]; // in cents
  maxPrice: number; // in cents
  onPriceChange: (range: [number, number]) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

/**
 * Left sidebar filter panel for the catalog page.
 * All state is owned by the parent (CatalogPage / ProductGrid) and
 * pushed to the URL as query params.
 */
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
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Filters
      </Typography>

      {/* Sort */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" fontWeight={700}>
            Sort By
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <FormGroup>
            {SORT_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    size="small"
                    checked={sort === opt.value}
                    onChange={() => onSortChange(opt.value)}
                    color="secondary"
                  />
                }
                label={<Typography variant="body2">{opt.label}</Typography>}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Categories */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" fontWeight={700}>
            Category
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
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
                      color="secondary"
                    />
                  }
                  label={<Typography variant="body2">{cat}</Typography>}
                />
              ))}
            </FormGroup>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important' }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" fontWeight={700}>
            Price Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={priceRange}
              min={0}
              max={maxPrice}
              step={100} // 100 cents = $1
              onChange={(_, value) => onPriceChange(value as [number, number])}
              color="secondary"
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => formatPrice(v)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {formatPrice(priceRange[0])}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPrice(priceRange[1])}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
}
