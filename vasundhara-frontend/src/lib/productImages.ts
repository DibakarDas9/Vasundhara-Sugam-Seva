import { formatAiError } from '@/lib/aiErrors';

const VARD_STORAGE_KEY = 'vasundhara_vard_api_key';

export async function generateProductImage(name: string, category?: string) {
  let apiKey = '';
  try {
    apiKey = localStorage.getItem(VARD_STORAGE_KEY) || '';
  } catch {}

  const response = await fetch('/api/ai/vard-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, apiKey }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatAiError(payload?.error || `Image generation failed (${response.status})`));
  }

  if (!payload?.imageUrl) {
    throw new Error('Image generation did not return a product photo');
  }

  return payload.imageUrl as string;
}
