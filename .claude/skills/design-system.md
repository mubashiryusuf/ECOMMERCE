---
name: design-system
description: Design system specification for the e-commerce platform — color tokens, typography, spacing, component library, and Tailwind config. Load before writing any UI component or page.
---

# Design System

This design system was evolved through iterative prompting with Claude (design agent). The goal: an original, coherent UI — not a copy of any template.

## Design principles

- **Storefront**: Warm, inviting, product-forward. White space, clear imagery, confident CTAs.
- **Admin**: Dense, utilitarian, data-first. Sidebar navigation, tables over cards, muted palette.
- **Shared**: Consistent type scale, 4px grid, same button shapes — roles differentiated by color and density, not by different component shapes.

## MUI Theme tokens (NOT Tailwind — this project uses Material UI)

```typescript
// Defined in lib/theme/index.ts — see frontend-engineer agent for full config
// Key tokens:
palette.primary.main    = '#200E32'  // deep purple-navy (sportsplus brand anchor)
palette.secondary.main  = '#2ECC71'  // vibrant green (CTAs, active states)
palette.error.main      = '#E74C3C'  // sale badges, stock-out warnings
palette.background.paper    = '#FFFFFF'
palette.background.default  = '#F5F5F5'
palette.text.primary    = '#200E32'
palette.text.secondary  = '#6B7280'
```

> No Tailwind in this project. All styles use MUI `sx` props with style objects defined in `*.styles.tsx` files.

## Typography scale

| Class       | Size     | Use |
|-------------|----------|-----|
| `text-xs`   | 0.75rem  | Labels, badges, meta |
| `text-sm`   | 0.875rem | Body secondary, table cells |
| `text-base` | 1rem     | Body primary |
| `text-lg`   | 1.125rem | Card titles |
| `text-xl`   | 1.25rem  | Section headings |
| `text-2xl`  | 1.5rem   | Page headings (admin) |
| `text-3xl`  | 1.875rem | Hero headings (storefront) |

Font weight: `font-normal` for body, `font-medium` for labels, `font-semibold` for headings, `font-bold` for CTAs.

## Component specifications

### Button (`components/ui/Button.tsx`)

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// Variant styles:
// primary:   bg-brand-600 hover:bg-brand-700 text-white
// secondary: border border-gray-300 bg-white hover:bg-gray-50 text-gray-700
// ghost:     hover:bg-gray-100 text-gray-700
// danger:    bg-red-600 hover:bg-red-700 text-white

// Size styles:
// sm: px-3 py-1.5 text-sm rounded-md
// md: px-4 py-2 text-sm rounded-lg     (default)
// lg: px-6 py-3 text-base rounded-lg
```

### Input (`components/ui/Input.tsx`)

```tsx
// Base: border border-gray-300 rounded-lg px-3 py-2 text-sm
//       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
// Error: border-red-500 focus:ring-red-500
// With label above, error message below in text-red-600 text-xs
```

### Card — Product (`components/ui/Card.tsx`)

```tsx
// Container: bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow
// Image:     aspect-square object-cover rounded-t-xl w-full
// Body:      p-4 space-y-2
// Title:     text-sm font-semibold text-gray-900 line-clamp-2
// Category:  text-xs text-gray-500 uppercase tracking-wide
// Price:     text-lg font-bold text-brand-600
// Stock:     text-xs — green if >5, amber if 1-5, red if 0
```

### Badge (`components/ui/Badge.tsx`)

```tsx
// OrderStatus colors:
const STATUS_STYLES = {
  PENDING:    'bg-amber-100 text-amber-800 ring-amber-200',
  PROCESSING: 'bg-blue-100 text-blue-800 ring-blue-200',
  SHIPPED:    'bg-indigo-100 text-indigo-800 ring-indigo-200',
  DELIVERED:  'bg-green-100 text-green-800 ring-green-200',
  CANCELLED:   'bg-red-100 text-red-800 ring-red-200',
};
// Base: inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1
```

### Pagination (`components/ui/Pagination.tsx`)

```tsx
// Prev/Next buttons (disabled at boundaries)
// Page numbers: show current ±2, ellipsis for gaps
// "Showing X–Y of Z results" text above
```

### Spinner (`components/ui/Spinner.tsx`)

```tsx
// animate-spin border-2 border-gray-200 border-t-brand-600 rounded-full
// Sizes: w-4 h-4 (sm) | w-6 h-6 (md) | w-10 h-10 (lg)
```

## Storefront layout

```
┌─────────────────────────────────────────────────┐
│ Nav: Logo | Categories | Search | Cart | Account│ ← sticky, bg-white/95 backdrop-blur
├─────────────────────────────────────────────────┤
│ [Filters sidebar] │ [Product grid 3 cols]        │
│  Category         │  ProductCard ProductCard ... │
│  Price range      │  ProductCard ProductCard ... │
│  Sort             │  [Pagination]                │
└─────────────────────────────────────────────────┘
Mobile: filters in a slide-over drawer
```

## Admin layout

```
┌──────────┬──────────────────────────────────────┐
│ SIDEBAR  │  MAIN CONTENT                        │
│ Logo     │  Page title + breadcrumb             │
│ ─────    │  ────────────────────────────────    │
│ Dashboard│  [Stats cards / tables / forms]      │
│ Products │                                      │
│ Orders   │                                      │
│ ─────    │                                      │
│ [Avatar] │                                      │
│ Logout   │                                      │
└──────────┴──────────────────────────────────────┘
Mobile: sidebar collapses to top hamburger nav
```

## Admin stats card

```tsx
// bg-white rounded-xl p-6 shadow-card
// Icon in colored circle (top-left)
// Label: text-sm font-medium text-gray-500
// Value: text-2xl font-bold text-gray-900
// Delta: text-sm text-green-600 or text-red-600
```

## Recharts dashboard chart

```tsx
// Recommended: ResponsiveContainer + BarChart (orders by status)
// OR PieChart (sales distribution)
// Color per status: same as Badge colors
// Tooltip shows formatted value + label
// Legend below chart

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={ordersByStatus}>
    <XAxis dataKey="status" />
    <YAxis />
    <Tooltip formatter={(value) => [value, 'Orders']} />
    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

## formatCents utility

```typescript
// lib/utils.ts
export function formatCents(cents: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

// Usage: formatCents(2999) → "£29.99"
```

## cn() utility (className merge)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Design agent notes (for NOTES.md)

This design system was generated through an iterative process with Claude (claude-sonnet-4-6) using sportsplus.pk as the storefront UI reference.

**Reference site analysed:** https://www.sportsplus.pk — Pakistani sports retail. Key patterns adopted:
- Deep purple-navy (`#200E32`) as brand anchor — matches the site's dark authoritative header
- Green (`#2ECC71`) as CTA/accent — mirrors their energetic interactive green
- Hierarchical category sidebar with accordion expand (MEN → SHOES/CLOTHING)
- "Deal Zone" horizontal strip with price-range chips
- Trust indicator icon strip (delivery, returns, secure, support)
- Multi-column product grid with sale/stock badges

**Stack pivot (documented for NOTES.md):**  
Switched from Tailwind CSS to **Material UI v5** for richer component library, built-in theme system, MUI X Charts for admin dashboard, and faster form/table implementation. Trade-off: larger bundle; mitigated by MUI's tree-shaking.

**Module structure introduced:**  
Each feature module has `index | use-hook | data | styles | interface` files — prevents style sprawl and keeps business logic out of JSX.
