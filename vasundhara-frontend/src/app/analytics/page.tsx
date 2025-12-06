'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useLocalInventory } from '@/lib/localInventory';

const mockAnalytics = {
  wasteReduction: {
    current: 23,
    previous: 15,
    trend: 'up'
  },
  moneySaved: {
    current: 127.50,
    previous: 89.30,
    trend: 'up'
  },
  itemsTracked: {
    current: 47,
    previous: 32,
    trend: 'up'
  },
  expiringItems: {
    current: 8,
    previous: 12,
    trend: 'down'
  }
};

const weeklyData = [
  { day: 'Mon', waste: 2.3, cost: 8.50, saved: 3.20 },
  { day: 'Tue', waste: 1.8, cost: 6.20, saved: 4.10 },
  { day: 'Wed', waste: 3.1, cost: 11.40, saved: 2.80 },
  { day: 'Thu', waste: 2.7, cost: 9.80, saved: 3.50 },
  { day: 'Fri', waste: 1.9, cost: 7.10, saved: 4.20 },
  { day: 'Sat', waste: 2.5, cost: 9.20, saved: 3.80 },
  { day: 'Sun', waste: 1.6, cost: 5.90, saved: 4.50 }
];

const categoryData = [
  { name: 'Fruits', waste: 5.6, cost: 18.50, percentage: 35, color: 'bg-red-500' },
  { name: 'Vegetables', waste: 4.5, cost: 14.20, percentage: 28, color: 'bg-green-500' },
  { name: 'Dairy', waste: 3.2, cost: 12.80, percentage: 20, color: 'bg-blue-500' },
  { name: 'Meat', waste: 2.7, cost: 22.40, percentage: 17, color: 'bg-purple-500' }
];

const monthlyComparison = [
  { month: 'Oct', waste: 18.5, cost: 65.20, saved: 25.30 },
  { month: 'Nov', waste: 15.9, cost: 58.10, saved: 32.50 },
  { month: 'Dec', waste: 12.3, cost: 45.80, saved: 38.70 }
];

import { ProtectedRoute } from '@/components/ProtectedRoute';

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { items } = useLocalInventory();
  const hasData = items.length > 0;

  const analyticsData = hasData ? mockAnalytics : {
    wasteReduction: { current: 0, previous: 0, trend: 'flat' },
    moneySaved: { current: 0, previous: 0, trend: 'flat' },
    itemsTracked: { current: 0, previous: 0, trend: 'flat' },
    expiringItems: { current: 0, previous: 0, trend: 'flat' }
  };

  const currentWeeklyData = hasData ? weeklyData : weeklyData.map(d => ({ ...d, waste: 0, cost: 0, saved: 0 }));
  const currentCategoryData = hasData ? categoryData : [];
  const currentMonthlyComparison = hasData ? monthlyComparison : [];

  const maxWaste = Math.max(...currentWeeklyData.map(d => d.waste)) || 10;
  const maxCost = Math.max(...currentWeeklyData.map(d => d.cost)) || 10;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title="Analytics"
          subtitle="Track your food waste reduction progress and savings"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'primary' : 'outline'}
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range}
                </Button>
              ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Waste Reduction</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.wasteReduction.current}%</p>
                      <div className="flex items-center mt-1">
                        {analyticsData.wasteReduction.trend === 'up' ? (
                          <ArrowUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : analyticsData.wasteReduction.trend === 'down' ? (
                          <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <span className="w-4 h-4 text-gray-400">-</span>
                        )}
                        <span className={`text-sm ml-1 ${analyticsData.wasteReduction.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                          analyticsData.wasteReduction.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                          }`}>
                          {Math.abs(analyticsData.wasteReduction.current - analyticsData.wasteReduction.previous)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <ArrowDownIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Money Saved</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.moneySaved.current)}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpIcon className={`w-4 h-4 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        <span className={`text-sm ml-1 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {formatCurrency(analyticsData.moneySaved.current - analyticsData.moneySaved.previous).replace('-', '+')}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Items Tracked</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.itemsTracked.current}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpIcon className={`w-4 h-4 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        <span className={`text-sm ml-1 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          +{analyticsData.itemsTracked.current - analyticsData.itemsTracked.previous}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Items</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.expiringItems.current}</p>
                      <div className="flex items-center mt-1">
                        <ArrowDownIcon className={`w-4 h-4 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        <span className={`text-sm ml-1 ${hasData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          -{analyticsData.expiringItems.previous - analyticsData.expiringItems.current}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Waste Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Waste Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {currentWeeklyData.map((day, index) => (
                      <div key={day.day} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative mb-2">
                          <div
                            className="bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-500"
                            style={{ height: `${(day.waste / maxWaste) * 200}px` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{day.day}</div>
                        <div className="text-xs font-medium text-gray-900 dark:text-white">{day.waste}kg</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost vs Savings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost vs Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {currentWeeklyData.map((day, index) => (
                      <div key={day.day} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col space-y-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative">
                            <div
                              className="bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg"
                              style={{ height: `${(day.cost / maxCost) * 100}px` }}
                            />
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-b-lg relative">
                            <div
                              className="bg-gradient-to-t from-green-500 to-green-400 rounded-b-lg"
                              style={{ height: `${(day.saved / maxCost) * 100}px` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{day.day}</div>
                        <div className="text-xs font-medium text-gray-900 dark:text-white">{formatCurrency(day.cost)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Cost</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Saved</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Waste by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!hasData && <p className="text-center text-gray-500 py-8">No data available yet</p>}
                  {currentCategoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${category.color}`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                          {category.percentage}%
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                          {category.waste}kg
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                          {formatCurrency(category.cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Month</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Waste (kg)</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Cost (₹)</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Saved (₹)</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hasData && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">No data available yet</td>
                        </tr>
                      )}
                      {currentMonthlyComparison.map((month, index) => (
                        <tr key={month.month} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{month.month}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{month.waste}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{formatCurrency(month.cost)}</td>
                          <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 text-right font-medium">{formatCurrency(month.saved)}</td>
                          <td className="py-3 px-4 text-right">
                            {index > 0 && (
                              <div className="flex items-center justify-end">
                                {month.waste < currentMonthlyComparison[index - 1].waste ? (
                                  <ArrowDownIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowUpIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AnalyticsContent;
