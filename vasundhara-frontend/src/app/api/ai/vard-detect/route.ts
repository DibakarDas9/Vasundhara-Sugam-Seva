import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.VARD_DETECTION_MODEL || ['ge', 'mini-2.5-flash'].join('');

function buildPrompt(today: string) {
  return `You are an expert food analyst and nutritionist. Analyze this image and identify ALL food items visible.

For each food item, return a JSON array with objects having these exact fields:
- name: string (capitalize first letter of each word, e.g. "Fresh Tomatoes", "Whole Wheat Bread")
- category: string (one of: "Fruit", "Vegetable", "Dairy", "Grain", "Protein", "Beverage", "Packaged", "Snack", "Spice", "Other")
- quantity: number (estimate the quantity visible)
- unit: string (e.g. "kg", "g", "pieces", "litres", "packets")
- estimatedShelfLifeDays: number (realistic shelf life at room temperature from today, for fresh produce estimate conservatively)
  Examples: banana=5, tomato=7, apple=14, spinach=4, milk=7, bread=5, rice=365, packaged chips=180
  For packaged goods with visible expiry, still estimate a reasonable number.
- expiryDate: string (ISO format YYYY-MM-DD based on today + estimatedShelfLifeDays, today is ${today})
- confidence: string ("high", "medium", or "low")
- notes: string (any useful observations, e.g. "looks very ripe", "sealed package", "partially used")
- isPackaged: boolean (true if it's a sealed packaged product, false if it's fresh produce)

IMPORTANT:
- Be specific about what you see
- If you see multiple different items, list each separately
- For packaged items with a visible expiry date printed, use that date if readable
- If image doesn't show food, return an empty array
- Return ONLY valid JSON, no markdown, no explanation, just the raw JSON array

Return format: [{"name":"...","category":"...","quantity":1,"unit":"pieces","estimatedShelfLifeDays":7,"expiryDate":"2024-01-01","confidence":"high","notes":"...","isPackaged":false}]`;
}

function parseItems(rawText: string) {
  let items: any[] = [];
  try {
    const cleaned = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    items = JSON.parse(cleaned);
    if (!Array.isArray(items)) items = [];
  } catch {
    const match = rawText.match(/\[[\s\S]*\]/);
    if (match) {
      try { items = JSON.parse(match[0]); } catch {}
    }
  }
  return items;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey = body?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const { imageBase64, mimeType = 'image/jpeg' } = body || {};

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
  }

  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const prompt = buildPrompt(new Date().toISOString().slice(0, 10));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `API error ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const items = parseItems(rawText);

    return NextResponse.json({ items, rawDescription: rawText });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Network error' }, { status: 500 });
  }
}
