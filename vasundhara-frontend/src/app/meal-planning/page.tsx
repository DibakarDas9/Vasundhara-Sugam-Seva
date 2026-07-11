"use client";

import React, { useEffect, useMemo, useState } from 'react';
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



  const [dietaryMode, setDietaryMode] = useState(false);
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('vasundhara_diet_mode') === 'true';
      const savedWeight = localStorage.getItem('vasundhara_diet_weight') || '';
      const savedHeight = localStorage.getItem('vasundhara_diet_height') || '';
      setDietaryMode(savedMode);
      setWeightKg(savedWeight);
      setHeightCm(savedHeight);
    } catch {}
  }, []);

  const handleDietaryModeChange = (checked: boolean) => {
    setDietaryMode(checked);
    try {
      localStorage.setItem('vasundhara_diet_mode', String(checked));
    } catch {}
  };

  const handleWeightChange = (val: string) => {
    setWeightKg(val);
    try {
      localStorage.setItem('vasundhara_diet_weight', val);
    } catch {}
  };

  const handleHeightChange = (val: string) => {
    setHeightCm(val);
    try {
      localStorage.setItem('vasundhara_diet_height', val);
    } catch {}
  };

  const bmi = useMemo(() => {
    const w = Number(weightKg);
    const hCm = Number(heightCm);
    if (!w || !hCm) return null;
    const hM = hCm / 100;
    if (hM <= 0) return null;
    return w / (hM * hM);
  }, [weightKg, heightCm]);

  const dietaryPreferences = useMemo(() => {
    if (!dietaryMode) return [];
    if (!bmi) return [];
    const bmiVal = bmi;

    const prefs: string[] = [];
    if (bmiVal < 18.5) prefs.push('low-weight');
    else if (bmiVal < 25) prefs.push('normal-weight');
    else if (bmiVal < 30) prefs.push('overweight');
    else prefs.push('obese');

    // Add a generic label so backend can treat it as dietary mode
    prefs.push('dietary-bmi');
    return prefs;
  }, [dietaryMode, bmi]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAiMeals() {
      if (!items.length || items.length <= 2) {
        setAiMeals([]);
        setAiError(null);
        setAiLoading(false);
        return;
      }

      setAiLoading(true);
      try {
        const data = await fetchAiMealSuggestions({
          items,
          dietaryPreferences,
          weight: weightKg ? Number(weightKg) : undefined,
          height: heightCm ? Number(heightCm) : undefined,
          bmi: bmi || undefined,
          signal: controller.signal,
        });
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
  }, [items, aiRefreshTick, dietaryPreferences, weightKg, heightCm, bmi]);

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
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 flex-1 sm:text-right">
                    {aiLoading
                      ? t('meals.aiAnalyzing', 'Gemini is building recipes and images from your inventory...')
                      : aiMeals.length
                        ? t('meals.aiReady', 'Recipe suggestions are ready with meal timing beside each one.')
                        : t('meals.aiUnlock', 'Add inventory items to unlock Gemini recipes.')}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={refreshAiMeals} disabled={aiLoading}>
                      {aiLoading ? t('meals.thinking', 'Thinking...') : t('meals.refreshAi', 'Refresh Gemini')}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {items.length <= 2 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200 mb-4">
                    {t(
                      'meals.unlockPrompt',
                      'Add at least 3 items in your inventory to unlock AI meal suggestions.'
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/20 p-4 mb-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        {t('meals.dietaryTitle', 'Dietary recipes')}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {t('meals.dietarySub', 'Enter weight & height to calculate BMI and get diet-aligned recipes.')}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={dietaryMode}
                        onChange={(e) => handleDietaryModeChange(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 bg-transparent"
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('meals.dietaryToggle', 'Enable')}
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        {t('meals.weightKg', 'Weight (kg)')}
                      </label>
                      <input
                        value={weightKg}
                        onChange={(e) => handleWeightChange(e.target.value)}
                        type="number"
                        min="1"
                        step="0.1"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder={t('meals.weightPlaceholder', 'e.g., 60')}
                        disabled={!dietaryMode}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        {t('meals.heightCm', 'Height (cm)')}
                      </label>
                      <input
                        value={heightCm}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        type="number"
                        min="30"
                        step="0.1"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder={t('meals.heightPlaceholder', 'e.g., 170')}
                        disabled={!dietaryMode}
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        {t('meals.bmi', 'BMI')}
                      </label>
                      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-3 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                        <span>{bmi ? bmi.toFixed(1) : t('meals.bmiNotSet', '—')}</span>
                        {bmi && (
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            {bmi < 18.5
                              ? t('meals.bmiUnderweight', 'Underweight')
                              : bmi < 25
                                ? t('meals.bmiHealthy', 'Healthy')
                                : bmi < 30
                                  ? t('meals.bmiOverweight', 'Overweight')
                                  : t('meals.bmiObese', 'Obese')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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

                                {meal.youtubeLinks && meal.youtubeLinks.length > 0 && (
                                  <div className="mt-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      {t('meals.videoTutorials', 'Video Tutorials')}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                      {meal.youtubeLinks.slice(0, 2).map((link, idx) => (
                                        <a
                                          key={`${meal.id}-yt-${idx}`}
                                          href={link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-3.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100/50 transition-colors"
                                        >
                                          <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                          {t('meals.watchTutorial', 'Watch Tutorial')} {idx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
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
