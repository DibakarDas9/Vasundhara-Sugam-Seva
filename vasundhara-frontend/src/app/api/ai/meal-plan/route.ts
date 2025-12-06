import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MEAL_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RATE_LIMIT = parseInt(process.env.AI_MEAL_RATE_LIMIT || '10', 10); // requests per window
const RATE_WINDOW_MS = parseInt(process.env.AI_MEAL_RATE_WINDOW_MS || '60000', 10); // ms
const MAX_ITEMS = parseInt(process.env.AI_MEAL_MAX_ITEMS || '120', 10);
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const schema = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
          },
          prepTime: { type: 'string' },
          difficulty: { type: 'string' },
          rating: { type: 'number' },
          summary: { type: 'string' },
          usedIngredients: {
            type: 'array',
            items: { type: 'string' },
          },
          mealSlot: { type: 'string' },
        },
        required: ['name', 'ingredients'],
        additionalProperties: true,
      },
    },
    shoppingList: {
      type: 'array',
      items: { type: 'string' },
    },
    reasoning: { type: 'string' },
  },
  required: ['suggestions'],
  additionalProperties: true,
};

function formatInventoryLine(item: any) {
  const parts = [item.name];
  if (item.quantity) parts.push(`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`.trim());
  if (item.expiryDate) parts.push(`exp:${item.expiryDate}`);
  if (item.category) parts.push(`[${item.category}]`);
  return parts.filter(Boolean).join(' — ');
}

function getClientId(request: NextRequest) {
  return (
    request.headers.get('x-user-id') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.ip ||
    'anonymous'
  );
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  const bucket = rateLimiter.get(clientId);
  if (!bucket || bucket.resetAt < now) {
    rateLimiter.set(clientId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.max(0, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    items = [],
    dietaryPreferences = [],
    windowDays = 5,
  }: {
    items: any[];
    dietaryPreferences?: string[];
    windowDays?: number;
  } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Too many items submitted. Max supported is ${MAX_ITEMS}.` },
      { status: 400 },
    );
  }

  const normalizedWindow = Math.min(Math.max(windowDays || 1, 1), 14);

  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId);
  if (!rateCheck.allowed) {
    console.warn('[meal-plan] rate-limit hit', { clientId });
    return NextResponse.json(
      { error: 'Too many meal plan requests. Please wait a moment and try again.' },
      {
        status: 429,
        headers: rateCheck.retryAfter
          ? { 'Retry-After': rateCheck.retryAfter.toString() }
          : undefined,
      },
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const summary = items
      .slice(0, 60)
      .map(formatInventoryLine)
      .join('\n');

    const systemPrompt = `You are an AI chef helping a community kitchen minimize waste.
Focus on freshness, nutrition, and cultural sensitivity. Avoid suggesting dishes that would require items not listed unless absolutely necessary.
NEVER include raw output besides valid JSON. If you are unsure, respond with an empty suggestions array.`;

    const guardRails = [
      'Prioritize items expiring within the requested window.',
      'Respect dietary preferences strictly (vegetarian, vegan, allergies).',
      'Limit suggestions to 3-5 meals balancing breakfast/lunch/dinner.',
      'Keep reasoning concise (<280 chars).',
      'If the inventory lacks essentials, recommend simple pantry recipes and mention substitutes in reasoning.',
    ].join('\n- ');

    const userPrompt = `Inventory window: next ${normalizedWindow} days\nDietary preferences: ${
      dietaryPreferences.join(', ') || 'none provided'
    }\nGuidelines:\n- ${guardRails}\nInventory list:\n${summary}`;

    console.info('[meal-plan] request', {
      clientId,
      itemCount: items.length,
      prefCount: dietaryPreferences.length,
      windowDays: normalizedWindow,
    });

    const aiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.6,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'meal_plan',
            schema,
          },
        },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              userPrompt +
              '\nReturn 3-5 meal suggestions prioritized by how well they consume perishable ingredients.',
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorPayload = await aiResponse.text();
      return NextResponse.json(
        { error: 'Upstream AI error' },
        { status: aiResponse.status },
      );
    }

    const completion = await aiResponse.json();
    const raw = completion?.choices?.[0]?.message?.content;
    let parsed: any = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('[meal-plan] invalid JSON response', { clientId, rawSnippet: raw?.slice(0, 250) });
      return NextResponse.json({ error: 'AI response was not valid JSON' }, { status: 502 });
    }

    const payload = {
      suggestions: parsed?.suggestions ?? [],
      shoppingList: parsed?.shoppingList ?? [],
      reasoning: parsed?.reasoning ?? '',
    };

    console.info('[meal-plan] success', {
      clientId,
      suggestionCount: payload.suggestions.length,
    });

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('[meal-plan] failure', { clientId, message: error?.message || String(error) });
    return NextResponse.json({ error: 'Failed to generate AI plan' }, { status: 500 });
  }
}
