'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { toast } from 'react-hot-toast';
import { TrashIcon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/layout/Sidebar';
import { fetchAdminUsers, type AdminUser, isLocalAdminDataMode } from '@/lib/admin';
import { deleteUser, updateUser, SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_ID } from '@/lib/localAuth';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [localMode, setLocalMode] = useState(true);

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
            if (event.key === 'vasundhara_users' || event.key === 'vasundhara_admin_audit_logs') {
                loadUsers();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadUsers]);

    const handleDelete = async () => {
        if (!deleteId) return;

        if (!localMode) {
            toast.error('User removal is only available in local admin mode.');
            setDeleteId(null);
            return;
        }

        try {
            const removed = deleteUser(deleteId);
            if (!removed) {
                throw new Error('Unable to remove user');
            }
            toast.success('User removed successfully');
            setDeleteId(null);
            await loadUsers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to remove user');
            console.error(error);
        }
    };

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
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="User & Shopkeeper Management" subtitle="Manage accounts, approvals, and profiles." />

                <main className="flex-1 overflow-y-auto p-6">
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
                                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Payout Details</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Premium</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Joined</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
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
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${(user.isActive ?? true) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${(user.isActive ?? true) ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {(user.isActive ?? true) ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className="mt-1 text-xs text-gray-500 capitalize">{user.approvalStatus}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.payoutDetails && (user.payoutDetails.upiId || user.payoutDetails.accNumber) ? (
                                                        <div className="text-xs">
                                                            {user.payoutDetails.upiId ? (
                                                                <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                                                                    UPI: {user.payoutDetails.upiId}
                                                                </div>
                                                            ) : (
                                                                <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block whitespace-nowrap">
                                                                    Bank: {user.payoutDetails.accNumber} <span className="text-gray-500 ml-1">({user.payoutDetails.bankIfsc})</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not set</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.premiumExpiry && user.premiumExpiry > Date.now() ? (
                                                        <button 
                                                            onClick={() => handleTogglePremium(user._id, true)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:border-red-200 transition-all"
                                                            title="Click to revoke premium"
                                                        >
                                                            <SparklesIcon className="w-3 h-3" />
                                                            Premium
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleTogglePremium(user._id, false)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 border border-transparent transition-all"
                                                            title="Click to grant premium"
                                                        >
                                                            Basic
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setDeleteId(user._id)}
                                                        className={`text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ${(localMode && !isSystemAdmin) ? '' : 'opacity-40 cursor-not-allowed'}`}
                                                        title={isSystemAdmin
                                                            ? 'The system admin account cannot be removed.'
                                                            : (localMode ? 'Remove User' : 'Removal disabled in remote mode')}
                                                        disabled={!localMode || isSystemAdmin}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
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

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Remove User?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will permanently remove the user and all their associated data from the system. This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Remove User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
