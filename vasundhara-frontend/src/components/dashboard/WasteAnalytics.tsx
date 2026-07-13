'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

import { useLocalInventory } from '@/lib/localInventory';
import { calculateDaysUntilExpiry, formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// Derive small analytics from the local inventory so the dashboard updates when items change
const mockData = {
  weeklyWaste: [
    { day: 'Mon', amount: 2.3, cost: 8.50 },
    { day: 'Tue', amount: 1.8, cost: 6.20 },
    { day: 'Wed', amount: 3.1, cost: 11.40 },
    { day: 'Thu', amount: 2.7, cost: 9.80 },
    { day: 'Fri', amount: 1.9, cost: 7.10 },
    { day: 'Sat', amount: 2.5, cost: 9.20 },
    { day: 'Sun', amount: 1.6, cost: 5.90 },
  ],
  monthlyStats: {
    totalWaste: 15.9,
    totalCost: 58.10,
    wasteReduction: 23,
    moneySaved: 18.50,
  },
  categories: [
    { name: 'Fruits', percentage: 35, amount: 5.6 },
    { name: 'Vegetables', percentage: 28, amount: 4.5 },
    { name: 'Dairy', percentage: 20, amount: 3.2 },
    { name: 'Meat', percentage: 17, amount: 2.7 },
  ]
};

export function WasteAnalytics({ premiumOnly, isPremium }: { premiumOnly?: boolean; isPremium?: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { items, usageLog } = useLocalInventory();

  // Calculate actual analytics from inventory
  const { calculateWasteAnalytics } = require('@/lib/analytics');
  const analytics = calculateWasteAnalytics(items, usageLog);

  // Calculate weekly waste from logs
  const weeklyWaste = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().slice(0, 10);

      // Filter logs for this day (waste only)
      const dayLogs = usageLog.filter(log =>
        log.type === 'waste' &&
        log.date.startsWith(dateStr)
      );

      const amount = dayLogs.reduce((sum, log) => sum + log.amount, 0);

      return { day: dayName, amount: Number(amount.toFixed(2)) };
    });
  }, [usageLog]);

  const maxAmount = Math.max(...weeklyWaste.map(d => d.amount), 1); // Avoid div by 0

  function handleViewAnalytics() {
    router.push('/analytics');
  }

  const isLocked = premiumOnly && !isPremium;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className={isLocked ? "blur-[2px] opacity-60 select-none pointer-events-none" : ""}>
        <CardTitle>{t('dashboard.wasteAnalytics', 'Waste Analytics')}</CardTitle>
      </CardHeader>
      <CardContent className={isLocked ? "blur-[2px] opacity-60 select-none pointer-events-none" : ""}>
        <div className="space-y-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalWasteKg}kg</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.stats.waste', 'Waste Reduced')}</div>
              <div className="flex items-center justify-center mt-1">
                <ArrowDownIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{analytics.wasteReductionPercent}% {t('dashboard.less', 'less')}</span>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analytics.totalWasteCost)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.stats.money', 'Money Saved')}</div>
              <div className="flex items-center justify-center mt-1">
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{formatCurrency(analytics.moneySaved)} {t('dashboard.saved', 'saved')}</span>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('dashboard.thisWeekWaste', "This Week's Waste")}</h4>
            <div className="flex items-end space-x-2 h-32">
              {weeklyWaste.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative flex-1 flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{day.day}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">{day.amount}kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste by Category */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('dashboard.wasteByCategory', 'Waste by Category')}</h4>
            <div className="space-y-3">
              {analytics.categoryBreakdown.length > 0 ? (
                analytics.categoryBreakdown.slice(0, 4).map((category: any) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category.wasteKg}kg</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({category.percentage}%)</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">{t('dashboard.noWasteData', 'No waste data yet')}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button className="text-sm text-blue-600 hover:underline" onClick={handleViewAnalytics}>
              {t('dashboard.viewDetails', 'View Details')}
            </button>
          </div>
        </div>
      </CardContent>

      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-xs font-bold tracking-wide">Premium</span>
          </div>
        </div>
      )}
    </Card>
  );
}
