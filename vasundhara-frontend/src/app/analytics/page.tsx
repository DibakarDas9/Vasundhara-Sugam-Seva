'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Script from 'next/script';
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  CloudIcon,
  ArrowDownTrayIcon,
  FireIcon,
  BeakerIcon,
  TrophyIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { useLocalInventory, type UsageLog } from '@/lib/localInventory';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Constants ────────────────────────────────────────────────────────────────
const CO2_PER_KG_FOOD_WASTE = 2.5; // kg CO2 per kg food wasted (EPA estimate)
const AVG_WEIGHT_PER_ITEM = 0.3; // kg (default weight estimate per item if no unit)
const CATEGORY_COLORS: Record<string, string> = {
  Fruits: 'bg-red-500',
  Vegetables: 'bg-green-500',
  Dairy: 'bg-blue-500',
  Meat: 'bg-purple-500',
  Grains: 'bg-yellow-500',
  Beverages: 'bg-cyan-500',
  Snacks: 'bg-pink-500',
  Uncategorized: 'bg-gray-500',
};
const CATEGORY_BAR_COLORS: Record<string, string> = {
  Fruits: '#ef4444',
  Vegetables: '#22c55e',
  Dairy: '#3b82f6',
  Meat: '#a855f7',
  Grains: '#eab308',
  Beverages: '#06b6d4',
  Snacks: '#ec4899',
  Uncategorized: '#6b7280',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDateRangeBounds(timeRange: 'week' | 'month' | 'year') {
  const now = new Date();
  const from = new Date(now);
  if (timeRange === 'week') from.setDate(from.getDate() - 7);
  else if (timeRange === 'month') from.setMonth(from.getMonth() - 1);
  else from.setFullYear(from.getFullYear() - 1);
  return { from, to: now };
}

function getPrevDateRangeBounds(timeRange: 'week' | 'month' | 'year') {
  const curr = getDateRangeBounds(timeRange);
  const prevTo = new Date(curr.from.getTime() - 1);
  const prevFrom = new Date(prevTo);
  if (timeRange === 'week') prevFrom.setDate(prevFrom.getDate() - 7);
  else if (timeRange === 'month') prevFrom.setMonth(prevFrom.getMonth() - 1);
  else prevFrom.setFullYear(prevFrom.getFullYear() - 1);
  return { from: prevFrom, to: prevTo };
}

function filterLogByRange(log: UsageLog[], from: Date, to: Date) {
  return log.filter((l) => {
    const d = new Date(l.date);
    return d >= from && d <= to;
  });
}

// ─── AI Insight Generator ─────────────────────────────────────────────────────
function generateInsights(wasteLog: UsageLog[], items: any[]): string[] {
  const insights: string[] = [];
  if (wasteLog.length === 0) {
    insights.push('Start adding items to your inventory and logging usage to get personalized AI insights.');
    return insights;
  }

  // Top wasted category
  const categoryWaste: Record<string, number> = {};
  wasteLog.forEach((l) => {
    const item = items.find((i) => i.id === l.itemId);
    const cat = item?.category || 'Uncategorized';
    categoryWaste[cat] = (categoryWaste[cat] || 0) + l.value;
  });
  const topWasteCategory = Object.entries(categoryWaste).sort((a, b) => b[1] - a[1])[0];
  if (topWasteCategory) {
    insights.push(`You frequently waste ${topWasteCategory[0]} items. Consider buying smaller quantities or using a FIFO (First In, First Out) storage method.`);
  }

  // High value waste
  const highValueWaste = wasteLog.filter((l) => l.value > 50);
  if (highValueWaste.length > 0) {
    const item = highValueWaste.sort((a, b) => b.value - a.value)[0];
    insights.push(`Your most expensive waste item was "${item.itemName}" worth ₹${item.value.toFixed(0)}. Consider meal planning before buying high-value perishables.`);
  }

  // Waste volume trending
  const totalWasteKg = wasteLog.reduce((s, l) => s + (l.amount * AVG_WEIGHT_PER_ITEM), 0);
  if (totalWasteKg > 2) {
    insights.push(`You wasted an estimated ${totalWasteKg.toFixed(1)} kg of food this period. Even reducing this by 30% could save you over ${formatCurrency(wasteLog.reduce((s, l) => s + l.value, 0) * 0.3)} annually.`);
  }

  // Positive reinforcement
  const consumedLog = wasteLog.filter((l) => l.type === 'consumed');
  if (consumedLog.length > wasteLog.length * 0.7) {
    insights.push('Great job! Over 70% of your logged usage is consumption, not waste. You\'re making the most of your groceries!');
  }

  // Default tip
  if (insights.length < 2) {
    insights.push('Consider checking expiry dates every Sunday to plan meals around items that expire soon — a simple habit that can cut waste by up to 25%.');
  }

  return insights.slice(0, 4);
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function downloadCSV(log: UsageLog[], fileName: string) {
  const headers = ['Date', 'Item', 'Type', 'Amount', 'Unit', 'Value (₹)'];
  const rows = log.map((l) => [
    new Date(l.date).toLocaleDateString('en-IN'),
    `"${l.itemName}"`,
    l.type === 'waste' ? 'Waste' : 'Consumed',
    l.amount,
    l.unit || 'unit',
    l.value.toFixed(2),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = max > 0 ? Math.max((value / max) * 160, value > 0 ? 4 : 0) : 0;
  return (
    <div
      className="rounded-t-md transition-all duration-700"
      style={{ height: `${height}px`, background: color, minHeight: value > 0 ? '4px' : '0' }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { items, usageLog } = useLocalInventory();
  const { user, updateProfile } = useAuth();

  const [isPremium, setIsPremium] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user?.premiumExpiry && user.premiumExpiry > Date.now()) {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  }, [user?.premiumExpiry]);

  // ─── Data Aggregation ──────────────────────────────────────────────────────
  const { from, to } = useMemo(() => getDateRangeBounds(timeRange), [timeRange]);
  const { from: prevFrom, to: prevTo } = useMemo(() => getPrevDateRangeBounds(timeRange), [timeRange]);

  const currLog = useMemo(() => filterLogByRange(usageLog, from, to), [usageLog, from, to]);
  const prevLog = useMemo(() => filterLogByRange(usageLog, prevFrom, prevTo), [usageLog, prevFrom, prevTo]);

  const currWaste = useMemo(() => currLog.filter((l) => l.type === 'waste'), [currLog]);
  const currConsumed = useMemo(() => currLog.filter((l) => l.type === 'consumed'), [currLog]);
  const prevWaste = useMemo(() => prevLog.filter((l) => l.type === 'waste'), [prevLog]);
  const prevConsumed = useMemo(() => prevLog.filter((l) => l.type === 'consumed'), [prevLog]);

  const currTotalValue = useMemo(() => currLog.reduce((s, l) => s + l.value, 0), [currLog]);
  const currWasteValue = useMemo(() => currWaste.reduce((s, l) => s + l.value, 0), [currWaste]);
  const currSavedValue = useMemo(() => currConsumed.reduce((s, l) => s + l.value, 0), [currConsumed]);
  const prevSavedValue = useMemo(() => prevConsumed.reduce((s, l) => s + l.value, 0), [prevConsumed]);

  const currWasteCount = currWaste.length;
  const currTotalLogged = currLog.length;
  const prevWasteCount = prevWaste.length;
  const prevTotalLogged = prevLog.length;

  const currWasteReduction = currTotalLogged > 0
    ? Math.round(((currTotalLogged - currWasteCount) / currTotalLogged) * 100)
    : 0;
  const prevWasteReduction = prevTotalLogged > 0
    ? Math.round(((prevTotalLogged - prevWasteCount) / prevTotalLogged) * 100)
    : 0;

  const wasteReductionDelta = currWasteReduction - prevWasteReduction;
  const moneySavedDelta = currSavedValue - prevSavedValue;

  // Expiring items (next 7 days)
  const expiringItems = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    return items.filter((it) => {
      if (!it.expiryDate) return false;
      const exp = new Date(it.expiryDate);
      return exp >= now && exp <= soon;
    });
  }, [items]);

  // ─── Chart: daily bars (last 7 days or 4 weeks or 12 months) ─────────────
  const chartBars = useMemo(() => {
    if (timeRange === 'week') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayStr = d.toISOString().slice(0, 10);
        const dayLog = usageLog.filter((l) => l.date.slice(0, 10) === dayStr);
        const wasteVal = dayLog.filter((l) => l.type === 'waste').reduce((s, l) => s + l.value, 0);
        const savedVal = dayLog.filter((l) => l.type === 'consumed').reduce((s, l) => s + l.value, 0);
        days.push({ label, waste: wasteVal, saved: savedVal });
      }
      return days;
    } else if (timeRange === 'month') {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const wEnd = new Date(); wEnd.setDate(wEnd.getDate() - i * 7);
        const wStart = new Date(wEnd); wStart.setDate(wStart.getDate() - 7);
        const label = `Wk ${4 - i}`;
        const wLog = usageLog.filter((l) => { const d = new Date(l.date); return d >= wStart && d <= wEnd; });
        const wasteVal = wLog.filter((l) => l.type === 'waste').reduce((s, l) => s + l.value, 0);
        const savedVal = wLog.filter((l) => l.type === 'consumed').reduce((s, l) => s + l.value, 0);
        weeks.push({ label, waste: wasteVal, saved: savedVal });
      }
      return weeks;
    } else {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString('en-IN', { month: 'short' });
        const mLog = usageLog.filter((l) => {
          const ld = new Date(l.date);
          return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
        });
        const wasteVal = mLog.filter((l) => l.type === 'waste').reduce((s, l) => s + l.value, 0);
        const savedVal = mLog.filter((l) => l.type === 'consumed').reduce((s, l) => s + l.value, 0);
        months.push({ label, waste: wasteVal, saved: savedVal });
      }
      return months;
    }
  }, [usageLog, timeRange]);

  const maxBar = useMemo(() => Math.max(...chartBars.map((b) => Math.max(b.waste, b.saved)), 1), [chartBars]);

  // ─── Category Breakdown ────────────────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, { waste: number; cost: number; count: number }> = {};
    currWaste.forEach((l) => {
      const item = items.find((i) => i.id === l.itemId);
      const cat = item?.category || 'Uncategorized';
      if (!cats[cat]) cats[cat] = { waste: 0, cost: 0, count: 0 };
      cats[cat].waste += l.amount * AVG_WEIGHT_PER_ITEM;
      cats[cat].cost += l.value;
      cats[cat].count += 1;
    });
    const total = Object.values(cats).reduce((s, c) => s + c.cost, 0) || 1;
    return Object.entries(cats)
      .map(([name, data]) => ({
        name,
        waste: parseFloat(data.waste.toFixed(2)),
        cost: parseFloat(data.cost.toFixed(2)),
        percentage: Math.round((data.cost / total) * 100),
        color: CATEGORY_COLORS[name] || 'bg-gray-500',
        barColor: CATEGORY_BAR_COLORS[name] || '#6b7280',
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [currWaste, items]);

  // ─── Premium: Carbon Footprint ─────────────────────────────────────────────
  const carbonData = useMemo(() => {
    const totalWasteKg = currWaste.reduce((s, l) => s + l.amount * AVG_WEIGHT_PER_ITEM, 0);
    const co2Saved = parseFloat((totalWasteKg * CO2_PER_KG_FOOD_WASTE).toFixed(2));
    const treesEquiv = parseFloat((co2Saved / 21).toFixed(2)); // avg tree absorbs 21kg CO2/year
    const waterSaved = parseFloat((totalWasteKg * 1000).toFixed(0)); // 1000L per kg food
    return { co2Saved, treesEquiv, waterSaved, totalWasteKg: parseFloat(totalWasteKg.toFixed(2)) };
  }, [currWaste]);

  // ─── Premium: Financial Forecast ──────────────────────────────────────────
  const forecast = useMemo(() => {
    const daysInRange = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const dailySaved = currSavedValue / daysInRange;
    const annualProjection = dailySaved * 365;
    const monthlyProjection = dailySaved * 30;
    return {
      annual: parseFloat(annualProjection.toFixed(0)),
      monthly: parseFloat(monthlyProjection.toFixed(0)),
      dailyAvg: parseFloat(dailySaved.toFixed(2)),
    };
  }, [currSavedValue, timeRange]);

  // ─── Premium: AI Insights ─────────────────────────────────────────────────
  const aiInsights = useMemo(() => generateInsights(currWaste, items), [currWaste, items]);

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (currLog.length === 0) {
      toast.error('No data to export for this time range.');
      return;
    }
    downloadCSV(currLog, `vasundhara_analytics_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Report downloaded successfully!');
  }, [currLog, timeRange]);

  // ─── Payment Handler ───────────────────────────────────────────────────────
  const handleSubscribe = async (tier: 'day' | 'month' | 'year', amount: number) => {
    setIsProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `sub_${tier}` }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Payment initialization failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vasundhara Sugam Seva',
        description: `Premium Analytics - 1 ${tier}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          const now = Date.now();
          const multipliers = { day: 86400000, month: 2592000000, year: 31536000000 };
          const expiry = now + multipliers[tier];
          await updateProfile({ premiumExpiry: expiry });
          setIsPremium(true);
          toast.success('Successfully upgraded to Premium! 🎉');
          setIsProcessingPayment(false);
        },
        theme: { color: '#eab308' },
        modal: { ondismiss: () => setIsProcessingPayment(false) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast.error('Payment failed: ' + r.error.description);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment error occurred');
      setIsProcessingPayment(false);
    }
  };

  const hasLog = usageLog.length > 0;
  const hasCurrLog = currLog.length > 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Analytics"
          subtitle="Track your food waste reduction progress and savings"
        />

        <main className="flex-1 overflow-y-auto p-6 relative">

          {/* ─── Blurred Content (locked) ──────────────────────────────── */}
          <div className={`space-y-6 transition-all duration-500 ${!isPremium ? 'blur-lg pointer-events-none opacity-40 grayscale select-none' : ''}`}>

            {/* Time Range Selector + Export */}
            <div className="flex items-center justify-between flex-wrap gap-3">
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
              {isPremium && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>

            {/* No data notice */}
            {!hasCurrLog && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No usage logs for this period yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add items to inventory and mark them as consumed or wasted to see real analytics here.</p>
              </div>
            )}

            {/* ─── Key Metrics ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Waste Reduction */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Waste Reduction</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{currWasteReduction}%</p>
                      <div className="flex items-center mt-1 gap-1">
                        {wasteReductionDelta >= 0
                          ? <ArrowUpIcon className="w-4 h-4 text-green-500" />
                          : <ArrowDownIcon className="w-4 h-4 text-red-500" />}
                        <span className={`text-xs font-semibold ${wasteReductionDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.abs(wasteReductionDelta)}% vs last {timeRange}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                      <ScaleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Money Saved */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Value Consumed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(currSavedValue)}</p>
                      <div className="flex items-center mt-1 gap-1">
                        {moneySavedDelta >= 0
                          ? <ArrowUpIcon className="w-4 h-4 text-green-500" />
                          : <ArrowDownIcon className="w-4 h-4 text-red-500" />}
                        <span className={`text-xs font-semibold ${moneySavedDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {moneySavedDelta >= 0 ? '+' : ''}{formatCurrency(moneySavedDelta)} vs last {timeRange}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Tracked */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Items Tracked</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{items.length}</p>
                      <div className="flex items-center mt-1 gap-1">
                        <span className="text-xs text-gray-400">{currLog.length} usage events this {timeRange}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Items */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiring (7 days)</p>
                      <p className={`text-2xl font-bold mt-1 ${expiringItems.length > 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{expiringItems.length}</p>
                      <p className="text-xs text-gray-400 mt-1">{expiringItems.length > 0 ? 'Act now to avoid waste!' : 'Nothing expiring soon'}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow">
                      <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── Cost of Waste vs Consumed Value ─────────────────────── */}
            {hasCurrLog && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bar Chart — Waste vs Saved */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <span className="flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-emerald-500" />
                        Waste vs. Consumed Value
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-44">
                      {chartBars.map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex gap-0.5 items-end">
                            <div className="flex-1"><MiniBar value={bar.waste} max={maxBar} color="#f87171" /></div>
                            <div className="flex-1"><MiniBar value={bar.saved} max={maxBar} color="#34d399" /></div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-xs text-gray-500 dark:text-gray-400">Waste</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400" /><span className="text-xs text-gray-500 dark:text-gray-400">Consumed</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <span className="flex items-center gap-2">
                        <BeakerIcon className="w-5 h-5 text-blue-500" />
                        Waste by Category
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryBreakdown.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">No waste events logged for this period.</p>
                    ) : (
                      <div className="space-y-3">
                        {categoryBreakdown.map((cat) => (
                          <div key={cat.name}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{cat.waste.toFixed(1)} kg</span>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(cat.cost)}</span>
                                <span className="text-xs text-gray-400 w-8 text-right">{cat.percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-700 ${cat.color}`}
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── Waste Summary Table ──────────────────────────────────── */}
            {hasCurrLog && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center gap-2">
                      <FireIcon className="w-5 h-5 text-orange-500" />
                      Waste Log — {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last year'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Item</th>
                          <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Value</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currLog.slice(-20).reverse().map((l) => (
                          <tr key={l.id} className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{l.itemName}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${l.type === 'waste' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                {l.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(l.value)}</td>
                            <td className="py-2 px-3 text-right text-gray-400 text-xs">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {currLog.length > 20 && (
                      <p className="text-center text-xs text-gray-400 mt-3">Showing last 20 events. Export CSV to view all {currLog.length} events.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ─── PREMIUM: Financial Forecast ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center shadow">
                      <TrophyIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-violet-500 uppercase tracking-wider">Premium</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Financial Forecast</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-violet-100 dark:border-violet-900/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Projected Monthly</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">{formatCurrency(forecast.monthly)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-violet-100 dark:border-violet-900/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Projected Annual</span>
                      <span className="font-bold text-2xl text-violet-600 dark:text-violet-400">{formatCurrency(forecast.annual)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Daily Avg. Consumed</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(forecast.dailyAvg)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">Based on current {timeRange} pace</p>
                </CardContent>
              </Card>

              {/* ─── PREMIUM: Carbon Footprint ─────────────────────────── */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow">
                      <CloudIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Premium</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Carbon Footprint</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Food Wasted</span>
                      <span className="font-bold text-red-500">{carbonData.totalWasteKg} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">CO₂ Emitted</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{carbonData.co2Saved} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trees Equivalent</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{carbonData.treesEquiv} 🌳</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Water Wasted</span>
                      <span className="font-bold text-blue-500">{carbonData.waterSaved.toLocaleString()} L</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ─── PREMIUM: Waste Score ─────────────────────────────── */}
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Premium</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Efficiency Score</p>
                    </div>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-6xl font-black text-amber-500">{currWasteReduction}</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">/ 100</div>
                    <div className="mt-3">
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-1000"
                          style={{ width: `${currWasteReduction}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      {currWasteReduction >= 80
                        ? '🌟 Excellent! You\'re a food waste champion.'
                        : currWasteReduction >= 50
                        ? '👍 Good progress! Keep reducing waste.'
                        : currWasteReduction > 0
                        ? '📈 Keep going — small changes add up!'
                        : '🚀 Start logging items to build your score.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── PREMIUM: AI Insights ─────────────────────────────────── */}
            <Card className="bg-gradient-to-br from-slate-900 to-gray-900 dark:from-black dark:to-gray-950 border-gray-700 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    Vard AI — Waste Reduction Insights
                    <span className="ml-auto text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">PREMIUM</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center mt-0.5">
                        <span className="text-yellow-400 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4 text-center">Insights generated from your {currLog.length} usage events this {timeRange}. Powered by Vard AI.</p>
              </CardContent>
            </Card>

          </div>{/* end blur wrapper */}

          {/* ─── Paywall Overlay ──────────────────────────────────────────── */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-black/20">
              <div className="max-w-2xl w-full text-center space-y-6 bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-2xl border border-yellow-200 dark:border-yellow-900/40">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-full flex items-center justify-center shadow-inner">
                  <SparklesIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Unlock Premium Analytics</h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mt-2">
                    Get real-time insights, AI-powered waste reduction tips, carbon footprint tracking, financial forecasting, and CSV exports.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div
                    onClick={() => !isProcessingPayment && handleSubscribe('day', 1)}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center bg-gray-50 dark:bg-neutral-900/50"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily</h3>
                    <p className="text-2xl font-black text-yellow-600 my-2">₹1</p>
                    <p className="text-xs text-gray-500 font-medium">24 hours access</p>
                  </div>
                  <div
                    onClick={() => !isProcessingPayment && handleSubscribe('month', 20)}
                    className="relative rounded-2xl border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 p-5 shadow-xl transform sm:-translate-y-2 flex flex-col items-center cursor-pointer hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20 transition-all"
                  >
                    <div className="absolute -top-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Most Popular</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Monthly</h3>
                    <p className="text-3xl font-black text-yellow-600 my-2">₹20</p>
                    <p className="text-xs text-gray-500 font-medium">Billed monthly</p>
                  </div>
                  <div
                    onClick={() => !isProcessingPayment && handleSubscribe('year', 200)}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center bg-gray-50 dark:bg-neutral-900/50"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Yearly</h3>
                    <p className="text-2xl font-black text-yellow-600 my-2">₹200</p>
                    <p className="text-xs text-green-600 font-bold mt-1 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">Save 17%</p>
                  </div>
                </div>
                {isProcessingPayment && (
                  <p className="text-sm font-semibold text-yellow-600 animate-pulse pt-2">Connecting to secure checkout...</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <ProtectedRoute>
        <AnalyticsContent />
      </ProtectedRoute>
    </>
  );
}
