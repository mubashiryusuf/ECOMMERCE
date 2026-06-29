export function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { message?: unknown; error?: unknown } } })?.response?.data;
  const message = data?.message ?? data?.error;

  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  if (message && typeof message === 'object') return Object.values(message).filter(Boolean).join(', ');
  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
