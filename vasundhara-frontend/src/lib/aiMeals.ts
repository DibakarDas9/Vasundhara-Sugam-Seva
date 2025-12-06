import { calculateDaysUntilExpiry } from '@/lib/utils';
import type { LocalItem } from '@/lib/localInventory';

export type AiMealSuggestion = {
  id: string;
  name: string;
  ingredients: string[];
  prepTime?: string;
  difficulty?: string;
  rating?: number;
  summary?: string;
  usedIngredients?: string[];
  suggestedMeal?: string;
};

const DEFAULT_ML_URL = 'http://localhost:8000';

export function pickExpiringIngredientNames(items: LocalItem[], windowDays = 5) {
  return items
    .filter((item) => {
      if (!item.expiryDate) return false;
      const days = calculateDaysUntilExpiry(item.expiryDate);
      return days <= windowDays;
    })
    .map((item) => item.name)
    .filter(Boolean);
}

interface FetchAiMealsOptions {
  items: LocalItem[];
  dietaryPreferences?: string[];
  windowDays?: number;
  signal?: AbortSignal;
}

export async function fetchAiMealSuggestions({
  items,
  dietaryPreferences = [],
  windowDays = 5,
  signal,
}: FetchAiMealsOptions): Promise<AiMealSuggestion[]> {
  if (!items.length) return [];

  try {
    const aiSuggestions = await callServerAiEndpoint({ items, dietaryPreferences, windowDays, signal });
    if (aiSuggestions.length) return aiSuggestions;
  } catch (err) {
    console.warn('AI route failed, falling back to ML service', err);
  }

  return callMlFallback({ items, dietaryPreferences, windowDays, signal });
}

async function callServerAiEndpoint({
  items,
  dietaryPreferences,
  windowDays,
  signal,
}: FetchAiMealsOptions): Promise<AiMealSuggestion[]> {
  const response = await fetch('/api/ai/meal-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, dietaryPreferences, windowDays }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AI meal route failed with status ${response.status}`);
  }

  const payload = await response.json();
  const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];

  return suggestions.map((suggestion: any, index: number) => ({
    id: suggestion.id ?? `${Date.now()}-ai-${index}`,
    name: suggestion.name ?? `AI Meal ${index + 1}`,
    ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : [],
    prepTime: suggestion.prepTime ?? suggestion.prep_time ?? '15 min',
    difficulty: suggestion.difficulty ?? 'Easy',
    rating: typeof suggestion.rating === 'number' ? suggestion.rating : 4.4,
    summary: suggestion.summary ?? suggestion.reason ?? suggestion.description ?? '',
    usedIngredients: Array.isArray(suggestion.usedIngredients)
      ? suggestion.usedIngredients
      : Array.isArray(suggestion.ingredients)
        ? suggestion.ingredients
        : [],
    suggestedMeal: suggestion.mealSlot ?? suggestion.mealTime ?? suggestion.suggestedMeal ?? 'Any',
  }));
}

async function callMlFallback({
  items,
  dietaryPreferences = [],
  windowDays = 5,
  signal,
}: FetchAiMealsOptions): Promise<AiMealSuggestion[]> {
  const expiringItems = pickExpiringIngredientNames(items, windowDays);
  if (!expiringItems.length) return [];

  const baseUrl = (process.env.NEXT_PUBLIC_ML_SERVICE_URL || DEFAULT_ML_URL).replace(/\/$/, '');
  const params = new URLSearchParams();
  expiringItems.forEach((name) => params.append('expiring_items', name));
  dietaryPreferences.filter(Boolean).forEach((pref) => params.append('dietary_preferences', pref));

  const response = await fetch(`${baseUrl}/suggest-recipes?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiring_items: expiringItems, dietary_preferences: dietaryPreferences }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`ML recipe suggestion failed with status ${response.status}`);
  }

  const payload = await response.json();
  const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];

  return suggestions.map((suggestion: any, index: number) => ({
    id: suggestion.id ?? `${Date.now()}-ml-${index}`,
    name: suggestion.name ?? `AI Meal ${index + 1}`,
    ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : [],
    prepTime: suggestion.prep_time ?? suggestion.prepTime ?? '15 min',
    difficulty: suggestion.difficulty ?? 'Easy',
    rating: typeof suggestion.rating === 'number' ? suggestion.rating : 4.2,
    summary: suggestion.summary ?? suggestion.description ?? '',
    usedIngredients: Array.isArray(suggestion.ingredients)
      ? suggestion.ingredients.filter((ingredient: string) =>
          expiringItems.some((item) => ingredient.toLowerCase().includes(item.toLowerCase())),
        )
      : [],
    suggestedMeal: suggestion.meal_slot ?? suggestion.mealTime ?? 'Any',
  }));
}
