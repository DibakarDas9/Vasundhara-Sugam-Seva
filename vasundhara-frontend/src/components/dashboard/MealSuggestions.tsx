'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClockIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';
import { useLocalInventory } from '@/lib/localInventory';
import { calculateDaysUntilExpiry } from '@/lib/utils';
import { fetchAiMealSuggestions, type AiMealSuggestion } from '@/lib/aiMeals';

const mockRecipes = [
  {
    id: 1,
    name: 'Banana Smoothie Bowl',
    prepTime: '10 min',
    difficulty: 'Easy',
    rating: 4.8,
    ingredients: ['Bananas', 'Greek Yogurt', 'Honey'],
    image: '/api/placeholder/200/150',
    priority: 'high'
  },
  {
    id: 2,
    name: 'Spinach & Chicken Salad',
    prepTime: '15 min',
    difficulty: 'Easy',
    rating: 4.6,
    ingredients: ['Fresh Spinach', 'Chicken Breast', 'Tomatoes'],
    image: '/api/placeholder/200/150',
    priority: 'high'
  },
  {
    id: 3,
    name: 'Creamy Mushroom Pasta',
    prepTime: '25 min',
    difficulty: 'Medium',
    rating: 4.4,
    ingredients: ['Mushrooms', 'Pasta', 'Cream'],
    image: '/api/placeholder/200/150',
    priority: 'medium'
  },
];

export function MealSuggestions() {
  const router = useRouter();
  const { items } = useLocalInventory();
  const [aiRecipes, setAiRecipes] = useState<AiMealSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAiMeals() {
      if (!items.length) {
        setAiRecipes([]);
        return;
      }
      setAiLoading(true);
      try {
        const nextMeals = await fetchAiMealSuggestions({ items, signal: controller.signal });
        if (!controller.signal.aborted) {
          setAiRecipes(nextMeals);
          setAiError(null);
        }
      } catch (err: any) {
        if (controller.signal.aborted) return;
        setAiError(err?.message || 'Could not fetch AI meals');
        setAiRecipes([]);
      } finally {
        if (!controller.signal.aborted) setAiLoading(false);
      }
    }

    loadAiMeals();
    return () => controller.abort();
  }, [items]);

  function handleViewAll() {
    router.push('/meal-planning');
  }

  function handleCookNow(id?: number | string, isAi = false) {
    // navigate to recipe detail if id provided, otherwise to meal planning
    if (isAi || typeof id === 'string') {
      router.push('/meal-planning?focus=ai');
      return;
    }
    if (id) router.push(`/recipes/${id}`);
    else router.push('/meal-planning');
  }

  function recipeHasExpiringIngredient(recipe: typeof mockRecipes[number]) {
    // find if any ingredient in recipe matches an inventory item (simple substring match)
    return recipe.ingredients.some(ing => {
      const found = items.find(it => it.name.toLowerCase().includes(ing.toLowerCase()) || ing.toLowerCase().includes(it.name.toLowerCase()));
      if (!found || !found.expiryDate) return false;
      const days = calculateDaysUntilExpiry(found.expiryDate);
      return days <= 3; // expiring soon
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Suggested Meals</CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(aiRecipes.length ? aiRecipes : mockRecipes).map((recipe) => {
            const isAi = typeof recipe.id === 'string';
            const expiring = isAi
              ? true
              : recipeHasExpiringIngredient(recipe as typeof mockRecipes[number]);
            const prepTime = isAi ? recipe.prepTime || '15 min' : (recipe as typeof mockRecipes[number]).prepTime;
            const difficulty = isAi ? recipe.difficulty || 'Easy' : (recipe as typeof mockRecipes[number]).difficulty;
            const rating = isAi ? recipe.rating || 4.3 : (recipe as typeof mockRecipes[number]).rating;
            const ingredients = recipe.ingredients || [];
            const name = recipe.name;
            return (
            <div key={recipe.id} className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${expiring ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {name.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {name}
                  </h4>
                  {((!isAi && (recipe as typeof mockRecipes[number]).priority === 'high') || expiring) && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {isAi ? 'AI Pick' : 'Priority'}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{prepTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FireIcon className="w-3 h-3" />
                    <span>{difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-3 h-3 text-yellow-500" />
                    <span>{rating}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600">
                    Uses: {ingredients.slice(0, 2).join(', ')}
                    {ingredients.length > 2 && ` +${ingredients.length - 2} more`}
                  </p>
                </div>
              </div>
              
              <Button size="sm" onClick={() => handleCookNow(recipe.id, isAi)}>
                {isAi ? 'Plan Meal' : 'Cook Now'}
              </Button>
              </div>
            );
          })}
          <div className="text-xs text-gray-500">
            {aiLoading && 'Asking AI to prioritize your expiring items...'}
            {!aiLoading && aiRecipes.length > 0 && 'AI picks are tailored to what is expiring in your pantry.'}
            {!aiLoading && !aiRecipes.length && !aiError && 'Showing starter recipes until AI has expiring items to work with.'}
            {aiError && <span className="text-red-600"> {aiError}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
