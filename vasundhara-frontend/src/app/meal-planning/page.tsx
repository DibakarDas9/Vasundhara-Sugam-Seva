"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ClockIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  PlusIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useLocalInventory } from '@/lib/localInventory';
import { calculateDaysUntilExpiry } from '@/lib/utils';
import { fetchAiMealSuggestions, type AiMealSuggestion } from '@/lib/aiMeals';

// We'll load recipes from public/recipes.json at runtime so the meal-planning UI shows all recipes
type Recipe = {
  id: number;
  name: string;
  prepTime?: number | null;
  difficulty?: string | null;
  rating?: number | null;
  servings?: number | null;
  calories?: number | null;
  ingredients: { name: string; amount?: string; available?: boolean; expiring?: boolean }[];
  instructions?: string[];
  image?: string;
  priority?: string;
  tags?: string[];
};

const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function MealPlanningPage() {
  const router = useRouter();
  const { items } = useLocalInventory();
  // const [recipes, setRecipes] = useState<Recipe[]>([]); // Removed static recipes
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealTime, setSelectedMealTime] = useState('Breakfast');
  // const [favorites, setFavorites] = useState<number[]>([]); // Removed favorites
  const [aiMeals, setAiMeals] = useState<AiMealSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRefreshTick, setAiRefreshTick] = useState(0);

  /* Removed static recipe loading
  const toggleFavorite = (recipeId: number) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  useEffect(() => {
    // ... fetch recipes.json logic removed
  }, []);
  */

  useEffect(() => {
    const controller = new AbortController();

    async function loadAiMeals() {
      if (!items.length) {
        setAiMeals([]);
        setAiError(null);
        setAiLoading(false);
        return;
      }
      setAiLoading(true);
      try {
        const data = await fetchAiMealSuggestions({ items, signal: controller.signal });
        if (!controller.signal.aborted) {
          setAiMeals(data);
          setAiError(null);
        }
      } catch (error: any) {
        if (controller.signal.aborted) return;
        setAiMeals([]);
        setAiError(error?.message || 'Unable to fetch AI plan');
      } finally {
        if (!controller.signal.aborted) setAiLoading(false);
      }
    }

    loadAiMeals();
    return () => controller.abort();
  }, [items, aiRefreshTick]);

  function refreshAiMeals() {
    setAiRefreshTick((tick) => tick + 1);
  }

  /* Removed importAllRecipeIngredients */

  function handlePlanFromAi(suggestion: AiMealSuggestion) {
    router.push(`/meal-planning/add?aiMeal=${encodeURIComponent(suggestion.name)}`);
  }

  /* Removed getAvailableRecipes and getPriorityRecipes */

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title="Meal Planning"
          subtitle="Plan delicious meals using your expiring ingredients"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Meal Time Selector */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {mealTimes.map((mealTime) => (
                  <Button
                    key={mealTime}
                    variant={selectedMealTime === mealTime ? 'primary' : 'outline'}
                    onClick={() => setSelectedMealTime(mealTime)}
                    className="min-w-[100px]"
                  >
                    {mealTime}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <SparklesIcon className="w-5 h-5 text-emerald-500" />
                  AI Meal Blueprint
                </CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 flex-1">
                    {aiLoading
                      ? 'AI is analyzing your expiring ingredients...'
                      : aiMeals.length
                        ? 'Personalized picks ready to schedule.'
                        : 'Add expiring items to unlock AI guidance.'}
                  </span>
                  <Button size="sm" variant="outline" onClick={refreshAiMeals} disabled={aiLoading}>
                    {aiLoading ? 'Thinking...' : 'Refresh AI'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aiError && (
                  <div className="text-sm text-red-600 mb-4">
                    {aiError}
                  </div>
                )}
                {aiLoading && (
                  <div className="animate-pulse space-y-3 mb-4">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiMeals.slice(0, 4).map((suggestion) => (
                    <div key={suggestion.id} className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                          <p className="text-xs text-gray-500">{suggestion.prepTime} · {suggestion.difficulty}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">AI Pick</span>
                      </div>
                      {suggestion.summary && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{suggestion.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(suggestion.usedIngredients || suggestion.ingredients.slice(0, 3)).map((ingredient) => (
                          <span key={ingredient} className="px-2 py-1 text-xs bg-white border border-emerald-200 rounded-full text-emerald-700">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handlePlanFromAi(suggestion)}>
                          Schedule Meal
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePlanFromAi(suggestion)}>
                          View Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {!aiLoading && !aiError && aiMeals.length === 0 && (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Your meal plan is empty. Add items to your inventory to get AI-powered suggestions!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
