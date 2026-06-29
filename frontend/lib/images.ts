const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(/\/api\/?$/, '');

export function resolveImageUrl(raw: string | undefined | null, fallback = 'https://placehold.co/400x400?text=No+Image') {
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${API_ORIGIN}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
