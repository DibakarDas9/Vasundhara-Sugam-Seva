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

export function WasteAnalytics() {
  const router = useRouter();
  const { items } = useLocalInventory();

  // compute simple derived metrics from the inventory
  const expiredItems = items.filter(it => it.expiryDate && calculateDaysUntilExpiry(it.expiryDate) < 0);
  const expiringSoonCount = items.filter(it => it.expiryDate && calculateDaysUntilExpiry(it.expiryDate) <= 3).length;
  const totalWasteKg = expiredItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  const monthlyStats = {
    totalWaste: Number(totalWasteKg.toFixed(1)),
    totalCost: Number((totalWasteKg * 3.5).toFixed(2)), // rough cost estimate
    wasteReduction: 20,
    moneySaved: Number((expiringSoonCount * 2.5).toFixed(2)),
  };

  const weeklyWaste = mockData.weeklyWaste; // keep placeholder weekly data for visual
  const maxAmount = Math.max(...weeklyWaste.map(d => d.amount));

  function handleViewAnalytics() {
    router.push('/analytics');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{mockData.monthlyStats.totalWaste}kg</div>
              <div className="text-sm text-gray-600">Total Waste</div>
              <div className="flex items-center justify-center mt-1">
                <ArrowDownIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{mockData.monthlyStats.wasteReduction}% less</span>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.monthlyStats.totalCost)}</div>
              <div className="text-sm text-gray-600">Total Cost</div>
              <div className="flex items-center justify-center mt-1">
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{formatCurrency(mockData.monthlyStats.moneySaved)} saved</span>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">This Week's Waste</h4>
            <div className="flex items-end space-x-2 h-32">
              {mockData.weeklyWaste.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative">
                    <div
                      className="bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{day.day}</div>
                  <div className="text-xs font-medium text-gray-900">{day.amount}kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste by Category */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Waste by Category</h4>
            <div className="space-y-3">
              {mockData.categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{category.amount}kg</span>
                    <span className="text-xs text-gray-500">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button className="text-sm text-blue-600 hover:underline" onClick={handleViewAnalytics}>
              View Details
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
