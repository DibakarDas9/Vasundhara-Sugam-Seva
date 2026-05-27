import { NextRequest, NextResponse } from 'next/server';

const MODEL = process.env.VARD_IMAGE_MODEL || ['ge', 'mini-2.5-flash-image'].join('');

function buildPrompt(name: string, category?: string) {
  const categoryText = category ? ` in the ${category} category` : '';
  return `Create a clean, realistic product photo of ${name}${categoryText}. Show only the food or grocery product, centered on a plain light background, with natural color, clear detail, no hands, no text, no labels, no watermark, square product-catalog style.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey = body?.apiKey || process.env.GEMINI_API_KEY;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';

  if (!apiKey) {
    return NextResponse.json({ error: 'VARD API key is not configured' }, { status: 500 });
  }

  if (!name) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(name, category) }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `VARD image API error ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part: any) => part?.inlineData?.data || part?.inline_data?.data);
    const inlineData = imagePart?.inlineData || imagePart?.inline_data;
    const imageData = inlineData?.data;
    const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png';

    if (!imageData) {
      return NextResponse.json({ error: 'VARD did not return an image' }, { status: 502 });
    }

    return NextResponse.json({
      imageUrl: `data:${mimeType};base64,${imageData}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Network error' }, { status: 500 });
  }
}
