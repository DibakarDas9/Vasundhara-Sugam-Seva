'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { SparklesIcon, ShoppingBagIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getUserTransactions, type Transaction } from '@/lib/transactions';

export default function UserPaymentsPage() {
  const { user, updateProfile } = useAuth();
  const [payoutDetails, setPayoutDetails] = useState({ upiId: '', accNumber: '', bankIfsc: '' });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user && user.payoutDetails) {
      setPayoutDetails({
        upiId: user.payoutDetails.upiId || '',
        accNumber: user.payoutDetails.accNumber || '',
        bankIfsc: user.payoutDetails.bankIfsc || ''
      });
    }
  }, [user]);

  const loadTransactions = useCallback(() => {
    if (user?.id) {
      setTransactions(getUserTransactions(user.id));
    }
  }, [user?.id]);

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

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        payoutDetails: {
          upiId: payoutDetails.upiId || undefined,
          accNumber: payoutDetails.accNumber || undefined,
          bankIfsc: payoutDetails.bankIfsc || undefined
        }
      });
    } catch (error) {
      console.error('Error saving payout details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Payments & Payouts" 
          subtitle="Manage your payout credentials and view transaction history." 
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Cards for Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-emerald-500">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transactions</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{transactions.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600">
                    <CreditCardIcon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-amber-500">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unsettled Deals</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {transactions.filter(t => t.status === 'unsettled').length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-600">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-violet-500">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled Deals</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {transactions.filter(t => t.status === 'settled').length}
                    </p>
                  </div>
                  <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-2xl text-violet-600">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Payout Details Form */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                      Payout Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <form onSubmit={handleSavePayout} className="space-y-4">
                      <p className="text-xs text-gray-500">
                        Provide your UPI ID or Bank details so admins can settle payouts for items sold or services provided.
                      </p>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">UPI ID</label>
                        <Input
                          value={payoutDetails.upiId}
                          onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                          placeholder="username@bank"
                          className="text-sm"
                        />
                      </div>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                        <span className="flex-shrink mx-3 text-gray-400 text-xs">OR</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Account Number</label>
                        <Input
                          value={payoutDetails.accNumber}
                          onChange={(e) => setPayoutDetails({ ...payoutDetails, accNumber: e.target.value })}
                          placeholder="Enter account number"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bank IFSC Code</label>
                        <Input
                          value={payoutDetails.bankIfsc}
                          onChange={(e) => setPayoutDetails({ ...payoutDetails, bankIfsc: e.target.value })}
                          placeholder="IFSC Code"
                          className="text-sm"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl transition-all duration-300 mt-2 shadow-sm"
                      >
                        {loading ? 'Saving...' : 'Save Payout Details'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Transaction History */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5 text-emerald-600" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    {transactions.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No transactions recorded yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Transactions from buying Premium Analytics or listing sales appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((txn) => (
                          <div
                            key={txn.id}
                            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all duration-200"
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${txn.type === 'premium' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                              {txn.type === 'premium' ? (
                                <SparklesIcon className="w-5 h-5" />
                              ) : (
                                <ShoppingBagIcon className="w-5 h-5" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${txn.type === 'premium' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                  {txn.type}
                                </span>
                                {txn.razorpayPaymentId && (
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    ID: {txn.razorpayPaymentId}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{txn.description}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Ordered on {new Date(txn.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </p>
                              {txn.settledAt && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium flex items-center gap-1">
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  Settled on {new Date(txn.settledAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`text-base font-bold ${txn.amount === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {txn.amount === 0 ? 'Free' : `₹${txn.amount}`}
                              </span>
                              {txn.status === 'settled' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircleIcon className="w-3.5 h-3.5" /> Settled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  <ClockIcon className="w-3.5 h-3.5" /> Unsettled
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
