/**
 * Re-exports formatters for modules that import from @/lib/utils.
 * This provides compatibility with the path used in the CLAUDE.md spec templates.
 */
export { formatPrice as formatCents, formatPrice, formatDate, formatDateTime, getStatusColor, getStatusLabel, getStockLabel, getStockColor } from '@/utils/formatters';
