'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { InventoryOverview } from '@/components/dashboard/InventoryOverview';
import { MealSuggestions } from '@/components/dashboard/MealSuggestions';
import { WasteAnalytics } from '@/components/dashboard/WasteAnalytics';
import { calculateDaysUntilExpiry, formatCurrency } from '@/lib/utils';
import type { LocalItem } from '@/lib/localInventory';
import { useLocalInventory } from '@/lib/localInventory';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  ShoppingCartIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

function DashboardContent() {
  const router = useRouter();
  const { items, clearInventory } = useLocalInventory();
  const { pendingApproval, user } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const total = items.length;
  const expiringSoon = items.filter((it: LocalItem) => it.expiryDate !== null && it.expiryDate !== undefined && calculateDaysUntilExpiry(it.expiryDate) <= 3).length;
  const expired = items.filter((it: LocalItem) => it.expiryDate !== null && it.expiryDate !== undefined && calculateDaysUntilExpiry(it.expiryDate) < 0).length;
  const isApprovalRestricted = Boolean(pendingApproval && user?.role !== 'admin');
  const approvalMessage = 'Your account is pending admin approval. You can explore data but can\'t make changes yet.';

  function ensureApproved(action: () => void) {
    if (isApprovalRestricted) {
      toast.error(approvalMessage);
      return;
    }
    action();
  }

  function handleProtectedNavigation(path: string) {
    ensureApproved(() => router.push(path));
  }

  function handleConfirmClear() {
    if (isApprovalRestricted) {
      toast.error(approvalMessage);
      setShowClearConfirm(false);
      return;
    }
    clearInventory();
    setShowClearConfirm(false);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your food waste management."
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {isApprovalRestricted && (
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <div className="rounded-xl bg-white/70 p-2 text-amber-600">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold">Awaiting admin approval</p>
                  <p className="text-sm text-amber-800">
                    {approvalMessage} We'll notify you as soon as an administrator reviews your application.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Items"
                value={total}
                change={{ value: 12, type: 'increase' }}
                icon={<ShoppingCartIcon className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Expiring Soon"
                value={expiringSoon}
                change={{ value: 25, type: 'decrease' }}
                icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Money Saved"
                value={formatCurrency(127)}
                change={{ value: 18, type: 'increase' }}
                icon={<CurrencyDollarIcon className="w-6 h-6" />}
                color="green"
              />
              <StatsCard
                title="Waste Reduced"
                value="23%"
                change={{ value: 8, type: 'increase' }}
                icon={<ArrowDownIcon className="w-6 h-6" />}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InventoryOverview />
                <MealSuggestions />
              </div>

              <div className="space-y-6">
                <WasteAnalytics />
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleProtectedNavigation('/inventory/new')}
                      disabled={isApprovalRestricted}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:from-green-100 hover:to-blue-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <ShoppingCartIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Add New Item</span>
                      </div>
                      <span className="text-xs text-gray-500">→</span>
                    </button>

                    <button
                      onClick={() => handleProtectedNavigation('/scan')}
                      disabled={isApprovalRestricted}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Scan Barcode</span>
                      </div>
                      <span className="text-xs text-gray-500">→</span>
                    </button>

                    <button
                      onClick={() => handleProtectedNavigation('/meal-planning')}
                      disabled={isApprovalRestricted}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Plan Meals</span>
                      </div>
                      <span className="text-xs text-gray-500">→</span>
                    </button>

                    <button
                      onClick={() => ensureApproved(() => setShowClearConfirm(true))}
                      disabled={isApprovalRestricted}
                      className="w-full flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-red-800 block">Clear Inventory</span>
                          <span className="text-xs text-red-600">Deletes all items permanently</span>
                        </div>
                      </div>
                      <span className="text-xs text-red-600 font-semibold">⚠</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowClearConfirm(false)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Clear inventory?</h4>
                    <p className="text-sm text-gray-600">This permanently deletes every inventory item. This action cannot be undone.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
