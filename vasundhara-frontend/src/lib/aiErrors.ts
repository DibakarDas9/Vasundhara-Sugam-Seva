export function formatAiError(message: unknown, fallback = 'AI request failed. Try again later.') {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  if (!text) return fallback;
  if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('429')) {
    return 'AI quota exceeded. Try again later.';
  }
  if (lower.includes('api key') || lower.includes('permission') || lower.includes('unauthorized') || lower.includes('403')) {
    return 'VARD API key issue. Check your key.';
  }
  if (lower.includes('model') && lower.includes('not found')) {
    return 'AI model unavailable. Try again later.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network error. Try again.';
  }

  return text.length > 120 ? fallback : text;
}
