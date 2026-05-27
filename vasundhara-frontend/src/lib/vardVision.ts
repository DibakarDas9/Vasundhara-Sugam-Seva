/**
 * VARD vision integration for Vasundhara
 * - Detects food items in images (fruits, vegetables, packaged goods)
 * - Estimates shelf life / expiry dates for fresh produce
 * - Returns structured data ready for inventory insertion
 */

import { formatAiError } from '@/lib/aiErrors';

export interface DetectedFoodItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedShelfLifeDays: number | null;
  expiryDate: string | null;   // ISO date string: YYYY-MM-DD
  confidence: 'high' | 'medium' | 'low';
  notes: string;
  isPackaged: boolean;
}

export interface VardDetectionResult {
  items: DetectedFoodItem[];
  rawDescription: string;
  error?: string;
}

export async function detectFoodFromImage(
  imageBase64: string,   // data:image/... base64 string
  mimeType: string = 'image/jpeg'
): Promise<VardDetectionResult> {
  try {
    let apiKey = '';
    try {
      apiKey = localStorage.getItem('vasundhara_vard_api_key') || '';
    } catch {}

    const response = await fetch('/api/ai/vard-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, apiKey }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error || errData?.message || `API error ${response.status}`;
      return { items: [], rawDescription: '', error: formatAiError(msg) };
    }
    const payload = await response.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];
    return { items, rawDescription: payload?.rawDescription || '' };
  } catch (err: any) {
    return {
      items: [],
      rawDescription: '',
      error: formatAiError(err?.message, 'Network error. Try again.'),
    };
  }
}
