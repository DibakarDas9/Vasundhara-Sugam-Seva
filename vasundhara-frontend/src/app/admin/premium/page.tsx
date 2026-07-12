'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/layout/Sidebar';
import { fetchAdminUsers, type AdminUser, isLocalAdminDataMode } from '@/lib/admin';
import { updateUser, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_ID } from '@/lib/localAuth';

export default function AdminPremiumPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [localMode, setLocalMode] = useState(true);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchAdminUsers({ limit: 200, sort: 'desc' });
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Error loading users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLocalMode(isLocalAdminDataMode());
        loadUsers();

        const handleStorage = (event: StorageEvent) => {
            if (!event.key) return;
            if (event.key === 'vasundhara_users') {
                loadUsers();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadUsers]);

    const handleTogglePremium = async (userId: string, isCurrentlyPremium: boolean) => {
        if (!localMode) {
            toast.error('Updates are only available in local admin mode.');
            return;
        }
        try {
            const newExpiry = isCurrentlyPremium ? 0 : Date.now() + (100 * 365 * 24 * 60 * 60 * 1000); // 100 years
            const success = updateUser(userId, { premiumExpiry: newExpiry });
            if (!success) throw new Error('Failed to update premium status');
            toast.success(isCurrentlyPremium ? 'Premium revoked' : 'Premium granted');
            await loadUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error updating user');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Premium Access" subtitle="Assign or revoke premium access for users." />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {loading ? (
                            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                                Loading users...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                                No users found.
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Premium Status</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => {
                                            const isSystemAdmin = user._id === SYSTEM_ADMIN_ID || user.email?.toLowerCase() === SYSTEM_ADMIN_EMAIL;
                                            const hasPremium = user.premiumExpiry ? user.premiumExpiry > Date.now() : false;
                                            
                                            return (
                                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                            <UserCircleIcon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                            {isSystemAdmin && (
                                                                <p className="text-[11px] font-semibold text-purple-600 mt-1">Protected system admin</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            user.role === 'shopkeeper' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-emerald-100 text-emerald-700'}`}>
                                                        {user.role?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {hasPremium ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                                                            <SparklesIcon className="w-3 h-3" />
                                                            Premium
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-transparent">
                                                            Basic
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {hasPremium ? (
                                                        <button 
                                                            onClick={() => handleTogglePremium(user._id, true)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm disabled:opacity-50"
                                                            disabled={!localMode}
                                                        >
                                                            Revoke
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleTogglePremium(user._id, false)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm disabled:opacity-50"
                                                            disabled={!localMode}
                                                        >
                                                            <SparklesIcon className="w-4 h-4" />
                                                            Grant
                                                        </button>
                                                    )}
                                                </td>
                                                </tr>
                                            );
                                        })}
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
