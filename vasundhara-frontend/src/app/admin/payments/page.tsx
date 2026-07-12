'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/layout/Sidebar';
import { fetchAdminUsers, type AdminUser, isLocalAdminDataMode } from '@/lib/admin';
import { SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_ID } from '@/lib/localAuth';

export default function AdminPaymentsPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [localMode, setLocalMode] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchAdminUsers({ limit: 100, sort: 'desc' });
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

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="User Payout Details" subtitle="View payment and payout details configured by users." />

                <main className="flex-1 overflow-y-auto p-6">
                    {localMode && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="text-blue-700 font-medium">Local Prototype Mode:</div>
                            <div className="text-blue-600 text-sm">
                                You are viewing local mock users because backend connection is not configured or failed.
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No users found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Payout Details</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => {
                                            const isSystemAdmin = user._id === SYSTEM_ADMIN_ID || user.email?.toLowerCase() === SYSTEM_ADMIN_EMAIL;
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
                                                            {user.role.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.payoutDetails && (user.payoutDetails.upiId || user.payoutDetails.accNumber) ? (
                                                            <div className="text-xs">
                                                                {user.payoutDetails.upiId ? (
                                                                    <div className="font-mono text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                                                        <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                                                                        UPI: {user.payoutDetails.upiId}
                                                                    </div>
                                                                ) : (
                                                                    <div className="font-mono text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 whitespace-nowrap">
                                                                        <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                                                                        Bank: {user.payoutDetails.accNumber} <span className="text-gray-500 ml-1">({user.payoutDetails.bankIfsc})</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No payment details configured</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
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
