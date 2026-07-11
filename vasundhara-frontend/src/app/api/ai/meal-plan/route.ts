import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = process.env.GEMINI_MEAL_MODEL || ['ge', 'mini-2.5-flash'].join('');
const GEMINI_IMAGE_MODEL = process.env.GEMINI_RECIPE_IMAGE_MODEL || ['ge', 'mini-2.5-flash-image'].join('');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RATE_LIMIT = parseInt(process.env.AI_MEAL_RATE_LIMIT || '10', 10);
const RATE_WINDOW_MS = parseInt(process.env.AI_MEAL_RATE_WINDOW_MS || '60000', 10);
const MAX_ITEMS = parseInt(process.env.AI_MEAL_MAX_ITEMS || '120', 10);

const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function formatInventoryLine(item: any) {
  const parts = [item.name];
  if (item.quantity) parts.push(`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`.trim());
  if (item.expiryDate) parts.push(`expires ${item.expiryDate}`);
  if (item.category) parts.push(`category ${item.category}`);
  return parts.filter(Boolean).join(' - ');
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

function parseGeminiJson(rawText: string) {
  const cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  try {
    return cleaned ? JSON.parse(cleaned) : {};
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

function normalizeMealSlot(slot: unknown) {
  const value = typeof slot === 'string' ? slot.toLowerCase() : '';
  if (value.includes('breakfast')) return 'Breakfast';
  if (value.includes('lunch')) return 'Lunch';
  if (value.includes('dinner')) return 'Dinner';
  if (value.includes('snack')) return 'Snacks';
  return 'Snacks';
}

function buildRecipeImagePrompt(suggestion: any) {
  const ingredients = Array.isArray(suggestion?.usedIngredients) && suggestion.usedIngredients.length
    ? suggestion.usedIngredients.join(', ')
    : Array.isArray(suggestion?.ingredients)
      ? suggestion.ingredients.slice(0, 6).join(', ')
      : '';

  return `Create a realistic appetizing food photography image of "${suggestion?.name || 'home cooked meal'}".
Use these visible ingredients when possible: ${ingredients}.
Style: plated finished recipe, natural daylight, clean table, no people, no text, no watermark, no logo, square crop.`;
}

async function generateRecipeImage(suggestion: any, apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: buildRecipeImagePrompt(suggestion) }],
            },
          ],
        }),
      },
    );

    if (!response.ok) return '';

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part: any) => part?.inlineData?.data || part?.inline_data?.data);
    const inlineData = imagePart?.inlineData || imagePart?.inline_data;
    const imageData = inlineData?.data;
    const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png';

    return imageData ? `data:${mimeType};base64,${imageData}` : '';
  } catch {
    return '';
  }
}

function buildPrompt({
  items,
  dietaryPreferences,
  windowDays,
  weight,
  height,
  bmi,
}: {
  items: any[];
  dietaryPreferences: string[];
  windowDays: number;
  weight?: number;
  height?: number;
  bmi?: number;
}) {
  const inventorySummary = items
    .slice(0, 60)
    .map(formatInventoryLine)
    .join('\n');

  let dietDetails = '';
  if (dietaryPreferences.length > 0 && bmi) {
    let dietCategory = 'Healthy/Normal';
    let recommendations = 'Suggest standard, well-balanced recipes that help maintain weight and overall vitality.';
    if (bmi < 18.5) {
      dietCategory = 'Underweight';
      recommendations = 'Focus strictly on nutrient-dense, calorie-dense, and high-protein recipes suitable for healthy weight gain.';
    } else if (bmi < 25) {
      dietCategory = 'Healthy/Normal';
      recommendations = 'Focus on balanced recipes with moderate portions to maintain a healthy weight.';
    } else if (bmi < 30) {
      dietCategory = 'Overweight';
      recommendations = 'Focus on low-calorie, high-fiber, low-carb, and high-protein recipes suitable for weight management and moderate weight loss.';
    } else {
      dietCategory = 'Obese';
      recommendations = 'Focus on portion-controlled, high-fiber, low-calorie, and high-protein recipes suitable for weight loss.';
    }

    dietDetails = `\n
DIETARY REQUIREMENT:
The user has enabled Dietary Mode. Here are their biometrics:
- Weight: ${weight} kg
- Height: ${height} cm
- BMI: ${bmi.toFixed(1)} (${dietCategory})
Please strictly tailor the recipe suggestions for a ${dietCategory} individual. Specifically: ${recommendations}
Ensure all suggested recipes align with this goal. Include appropriate calories per recipe: Breakfast (150-350 kcal), Lunch/Dinner (400-650 kcal), Snacks (80-200 kcal) depending on dietary status.`;
  }

  return `You are an AI chef helping a household reduce food waste.
Suggest meals based on the inventory below. Prioritize items expiring within the next ${windowDays} days, but use all available inventory when helpful.

Dietary preferences: ${dietaryPreferences.join(', ') || 'none provided'}${dietDetails}

Rules:
- Suggest exactly 4 practical recipes: one Breakfast, one Lunch, one Dinner, and one Snacks.
- Use inventory ingredients first.
- Suggest only recipes that can be made with the inventory provided (avoid recipes requiring lots of missing ingredients).
- Respect dietary preferences and biometric diet status strictly.
- Keep each summary short and useful.
- Include clear cooking steps for every recipe.
- For each recipe, provide a "youtubeQueries" array containing exactly 2 specific search queries that can be used on YouTube to find cooking videos for this recipe (e.g. ["how to make lentil soup", "simple lentil rice khichdi recipe"]).
- Return only valid JSON. Do not use markdown.

Inventory:
${inventorySummary}

Return this exact JSON shape:
{
  "suggestions": [
    {
      "id": "short-stable-id",
      "name": "meal name",
      "ingredients": ["all ingredients used"],
      "prepTime": "15 min",
      "difficulty": "Easy",
      "rating": 4.6,
      "summary": "why this meal fits the inventory",
      "usedIngredients": ["inventory ingredients used"],
      "mealSlot": "Breakfast",
      "steps": ["step 1", "step 2", "step 3"],
      "servings": 2,
      "calories": 420,
      "imagePrompt": "short food photo prompt for this finished recipe",
      "youtubeQueries": [
        "youtube search query 1",
        "youtube search query 2"
      ]
    }
  ],
  "shoppingList": ["optional extra pantry item"],
  "reasoning": "short explanation"
}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    items = [],
    dietaryPreferences = [],
    windowDays = 5,
    apiKey: clientApiKey,
    weight,
    height,
    bmi,
  }: {
    items: any[];
    dietaryPreferences?: string[];
    windowDays?: number;
    apiKey?: string;
    weight?: number;
    height?: number;
    bmi?: number;
  } = body;

  if (!Array.isArray(items) || items.length <= 2) {
    return NextResponse.json({ suggestions: [] });
  }

  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Too many items submitted. Max supported is ${MAX_ITEMS}.` },
      { status: 400 },
    );
  }

  const apiKey = clientApiKey || GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId);
  if (!rateCheck.allowed) {
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

  const normalizedWindow = Math.min(Math.max(windowDays || 1, 1), 14);
  const safePreferences = Array.isArray(dietaryPreferences)
    ? dietaryPreferences.filter((pref) => typeof pref === 'string' && pref.trim())
    : [];

  try {
    const prompt = buildPrompt({
      items,
      dietaryPreferences: safePreferences,
      windowDays: normalizedWindow,
      weight,
      height,
      bmi,
    });

    console.info('[meal-plan] gemini request', {
      clientId,
      itemCount: items.length,
      prefCount: safePreferences.length,
      windowDays: normalizedWindow,
      hasCustomApiKey: !!clientApiKey,
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error('[meal-plan] gemini error', {
        clientId,
        status: response.status,
        message: errorPayload?.error?.message,
      });
      return NextResponse.json(
        { error: errorPayload?.error?.message || 'Gemini meal planning failed' },
        { status: response.status },
      );
    }

    const completion = await response.json();
    const rawText: string = completion?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseGeminiJson(rawText);

    if (!Array.isArray(parsed?.suggestions)) {
      console.error('[meal-plan] invalid JSON response', {
        clientId,
        rawSnippet: rawText.slice(0, 250),
      });
      return NextResponse.json({ error: 'Gemini response was not valid meal JSON' }, { status: 502 });
    }

    const normalizedSuggestions = parsed.suggestions.slice(0, 4).map((suggestion: any, index: number) => {
      let queries: string[] = [];
      if (Array.isArray(suggestion?.youtubeQueries)) {
        queries = suggestion.youtubeQueries.filter((x: any) => typeof x === 'string' && x.trim());
      } else if (Array.isArray(suggestion?.youtubeLinks)) {
        // Fallback if the model returned youtubeLinks instead of queries
        queries = suggestion.youtubeLinks.filter((x: any) => typeof x === 'string' && x.trim());
      }

      if (queries.length === 0 && typeof suggestion?.youtubeUrl === 'string' && suggestion.youtubeUrl.startsWith('http')) {
        queries.push(suggestion.youtubeUrl);
      }

      if (queries.length < 1) {
        queries.push(`how to cook ${suggestion?.name || 'recipe'}`);
      }
      if (queries.length < 2) {
        queries.push(`${suggestion?.name || 'recipe'} easy cooking tutorial`);
      }

      const finalYoutubeLinks = queries.slice(0, 2).map((q) => {
        if (q.startsWith('http')) return q;
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      });

      return {
        id: suggestion?.id || `${normalizeMealSlot(suggestion?.mealSlot).toLowerCase()}-${index + 1}`,
        name: suggestion?.name || `Recipe ${index + 1}`,
        ingredients: Array.isArray(suggestion?.ingredients) ? suggestion.ingredients : [],
        prepTime: suggestion?.prepTime || suggestion?.prep_time || '20 min',
        difficulty: suggestion?.difficulty || 'Easy',
        rating: typeof suggestion?.rating === 'number' ? suggestion.rating : 4.5,
        summary: suggestion?.summary || suggestion?.description || '',
        usedIngredients: Array.isArray(suggestion?.usedIngredients)
          ? suggestion.usedIngredients
          : Array.isArray(suggestion?.ingredients)
            ? suggestion.ingredients
            : [],
        mealSlot: normalizeMealSlot(suggestion?.mealSlot),
        steps: Array.isArray(suggestion?.steps) ? suggestion.steps : [],
        servings: typeof suggestion?.servings === 'number' ? suggestion.servings : undefined,
        calories: typeof suggestion?.calories === 'number' ? suggestion.calories : undefined,
        imagePrompt: suggestion?.imagePrompt || '',
        imageUrl: '',
        youtubeUrl: finalYoutubeLinks[0],
        youtubeLinks: finalYoutubeLinks,
      };
    });

    const suggestionsWithImages = await Promise.all(
      normalizedSuggestions.map(async (suggestion: any) => ({
        ...suggestion,
        imageUrl: await generateRecipeImage(suggestion, apiKey),
      })),
    );

    const payload = {
      suggestions: suggestionsWithImages,
      shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : [],
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    };

    console.info('[meal-plan] gemini success', {
      clientId,
      suggestionCount: payload.suggestions.length,
    });

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('[meal-plan] failure', { clientId, message: error?.message || String(error) });
    return NextResponse.json({ error: 'Failed to generate AI plan' }, { status: 500 });
  }
}
