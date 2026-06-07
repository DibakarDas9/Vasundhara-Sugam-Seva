"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ClockIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useLocalInventory } from '@/lib/localInventory';
import { fetchAiMealSuggestions, type AiMealSuggestion } from '@/lib/aiMeals';
import { useLanguage } from '@/contexts/LanguageContext';

function slotForMeal(meal: AiMealSuggestion) {
  const raw = (meal.mealSlot || meal.suggestedMeal || '').toLowerCase();
  if (raw.includes('breakfast')) return 'Breakfast';
  if (raw.includes('lunch')) return 'Lunch';
  if (raw.includes('dinner')) return 'Dinner';
  if (raw.includes('snack')) return 'Snacks';
  return 'Snacks';
}

export default function MealPlanningPage() {
  const { t } = useLanguage();
  const { items } = useLocalInventory();
  const [aiMeals, setAiMeals] = useState<AiMealSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRefreshTick, setAiRefreshTick] = useState(0);

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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={t('meals.title', 'Meal Planning')}
          subtitle={t('meals.subtitle', 'Gemini recipes from your current inventory')}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-400">
                  <SparklesIcon className="w-5 h-5 text-emerald-500" />
                  {t('meals.aiBlueprint', 'Vard Meal Suggestion')}
                </CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 flex-1">
                    {aiLoading
                      ? t('meals.aiAnalyzing', 'Gemini is building recipes and images from your inventory...')
                      : aiMeals.length
                        ? t('meals.aiReady', 'Recipe suggestions are ready with meal timing beside each one.')
                        : t('meals.aiUnlock', 'Add inventory items to unlock Gemini recipes.')}
                  </span>
                  <Button size="sm" variant="outline" onClick={refreshAiMeals} disabled={aiLoading}>
                    {aiLoading ? t('meals.thinking', 'Thinking...') : t('meals.refreshAi', 'Refresh Gemini')}
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
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                  </div>
                )}

                <div className="space-y-5">
                  {aiMeals.map((meal) => {
                    const mealSlot = slotForMeal(meal);

                    return (
                      <section
                        key={meal.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 transition dark:border-gray-800 dark:bg-neutral-950"
                      >
                        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                            {meal.imageUrl ? (
                              <img
                                src={meal.imageUrl}
                                alt={meal.name}
                                className="h-56 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-56 w-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-amber-100 px-4 text-center text-sm font-semibold text-emerald-900">
                                {meal.name}
                              </div>
                            )}

                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{meal.name}</h4>
                                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                    {t(`meals.slot.${mealSlot}`, mealSlot)}
                                  </span>
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                    {t('meals.aiPick', 'AI Pick')}
                                  </span>
                                </div>
                                {meal.summary && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{meal.summary}</p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
                                  <ClockIcon className="h-4 w-4" />
                                  {meal.prepTime || '20 min'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
                                  <StarIcon className="h-4 w-4" />
                                  {meal.difficulty || 'Easy'}
                                </span>
                                {meal.calories && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
                                    <FireIcon className="h-4 w-4" />
                                    {meal.calories} cal
                                  </span>
                                )}
                                {meal.servings && (
                                  <span className="rounded-full border border-gray-200 px-2.5 py-1">
                                    {meal.servings} servings
                                  </span>
                                )}
                              </div>

                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Inventory used</p>
                                <div className="flex flex-wrap gap-2">
                                  {(meal.usedIngredients?.length ? meal.usedIngredients : meal.ingredients).slice(0, 8).map((ingredient) => (
                                    <span key={ingredient} className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-700">
                                      {ingredient}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recipe steps</p>
                                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                  {(meal.steps?.length ? meal.steps : ['Prepare the ingredients.', 'Cook everything until done.', 'Serve warm.']).map((step, index) => (
                                    <li key={`${meal.id}-step-${index}`} className="flex gap-2">
                                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                                        {index + 1}
                                      </span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                      </section>
                    );
                  })}
                </div>

                {!aiLoading && !aiError && aiMeals.length === 0 && (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {t('meals.emptyText', 'Your meal plan is empty. Add items to your inventory to get AI-powered suggestions!')}
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
