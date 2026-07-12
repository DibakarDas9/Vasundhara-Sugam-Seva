'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { toast } from 'react-hot-toast';
import {
  BanknotesIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllTransactions,
  settleTransaction,
  pushNotificationToUser,
  type Transaction,
} from '@/lib/transactions';

function formatCurrency(amount: number) {
  if (amount === 0) return '₹0 (Free)';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type Filter = 'all' | 'unsettled' | 'settled' | 'premium' | 'marketplace';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [settling, setSettling] = useState<string | null>(null);

  const loadTransactions = useCallback(() => {
    setTransactions(getAllTransactions());
  }, []);

  useEffect(() => {
    loadTransactions();
    const handler = () => loadTransactions();
    window.addEventListener('vasundhara-transactions-update', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('vasundhara-transactions-update', handler);
      window.removeEventListener('storage', handler);
    };
  }, [loadTransactions]);

  const handleSettle = async (txn: Transaction) => {
    if (txn.status === 'settled') return;
    setSettling(txn.id);
    try {
      const adminName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin' : 'Admin';
      const updated = settleTransaction(txn.id, adminName);
      if (updated) {
        // Push notification to the user
        pushNotificationToUser(txn.userId, {
          title: 'Payment Settled ✅',
          message: `Your ${txn.type === 'premium' ? 'Premium Analytics' : 'Marketplace'} transaction of ${formatCurrency(txn.amount)} (${txn.description}) has been settled by admin.`,
          kind: 'success',
        });
        toast.success(`Transaction settled and user notified!`);
        loadTransactions();
      }
    } finally {
      setSettling(null);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'unsettled') return t.status === 'unsettled';
    if (filter === 'settled') return t.status === 'settled';
    if (filter === 'premium') return t.type === 'premium';
    if (filter === 'marketplace') return t.type === 'marketplace';
    return true;
  });

  // Summary stats
  const totalRevenue = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const unsettledCount = transactions.filter((t) => t.status === 'unsettled').length;
  const premiumCount = transactions.filter((t) => t.type === 'premium').length;
  const marketplaceCount = transactions.filter((t) => t.type === 'marketplace').length;

  const filterOptions: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unsettled', label: 'Unsettled' },
    { value: 'settled', label: 'Settled' },
    { value: 'premium', label: 'Premium' },
    { value: 'marketplace', label: 'Marketplace' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Payments & Transactions"
          subtitle="All user transactions — Premium subscriptions and Marketplace deals"
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ─── Summary Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Unsettled</p>
              <p className={`text-2xl font-bold ${unsettledCount > 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{unsettledCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Premium Txns</p>
              <p className="text-2xl font-bold text-violet-600">{premiumCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Marketplace Txns</p>
              <p className="text-2xl font-bold text-emerald-600">{marketplaceCount}</p>
            </div>
          </div>

          {/* ─── Filter Bar ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <FunnelIcon className="w-4 h-4 text-gray-400 shrink-0" />
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === opt.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* ─── Transactions Table ──────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <BanknotesIcon className="w-12 h-12 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Transactions appear here when users buy Premium Analytics or complete Marketplace deals.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">User</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Description</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                      <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{txn.userName}</div>
                          <div className="text-xs text-gray-400">{txn.userEmail}</div>
                        </td>

                        {/* Type badge */}
                        <td className="px-5 py-4">
                          {txn.type === 'premium' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                              <SparklesIcon className="w-3 h-3" />
                              Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <ShoppingBagIcon className="w-3 h-3" />
                              Marketplace
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{txn.description}</p>
                          {txn.razorpayPaymentId && (
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{txn.razorpayPaymentId}</p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 text-right">
                          <span className={`font-bold text-sm ${txn.amount === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-center">
                          {txn.status === 'settled' ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircleIcon className="w-3 h-3" />
                                Settled
                              </span>
                              {txn.settledAt && (
                                <span className="text-[10px] text-gray-400 mt-0.5">{formatDate(txn.settledAt)}</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <ClockIcon className="w-3 h-3" />
                              Unsettled
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-right text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(txn.date)}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-center">
                          {txn.status === 'unsettled' ? (
                            <button
                              onClick={() => handleSettle(txn)}
                              disabled={settling === txn.id}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {settling === txn.id ? 'Settling...' : 'Mark Settled'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              by {txn.settledBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
