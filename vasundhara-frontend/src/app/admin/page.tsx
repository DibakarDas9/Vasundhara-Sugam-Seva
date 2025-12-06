'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  approveUser,
  fetchAdminUsers,
  fetchAuditLogs,
  rejectUser,
  type AdminUser,
  type AuditLogEntry,
} from '@/lib/admin';
import { formatDate } from '@/lib/utils';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const PAGE_SIZE = 10;
const GATE_KEY = 'vasundhara_admin_gate_token';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type RoleFilter = 'all' | 'household' | 'shopkeeper' | 'admin' | 'user' | 'retail_partner';

type StatusCounts = {
  pending: number;
  approved: number;
  rejected: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0 });
  const [actionMode, setActionMode] = useState<'approve' | 'reject' | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [hasGateAccess, setHasGateAccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const token = localStorage.getItem(GATE_KEY);
    setHasGateAccess(token === 'granted');
    setGateReady(true);
    setAuthLoading(false);

    // Redirect to access page if no gate token
    if (token !== 'granted') {
      router.replace('/admin/access');
    }
  }, [router]);

  const loadUsers = useCallback(async () => {
    if (!hasGateAccess) return;
    setListLoading(true);
    try {
      const response = await fetchAdminUsers({
        status: statusFilter === 'all' ? undefined : statusFilter,
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: searchTerm || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setListLoading(false);
    }
  }, [hasGateAccess, statusFilter, roleFilter, searchTerm, page]);

  const loadCounts = useCallback(async () => {
    if (!hasGateAccess) return;
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetchAdminUsers({ status: 'pending', limit: 1 }),
        fetchAdminUsers({ status: 'approved', limit: 1 }),
        fetchAdminUsers({ status: 'rejected', limit: 1 }),
      ]);
      setCounts({
        pending: pendingRes.pagination.total,
        approved: approvedRes.pagination.total,
        rejected: rejectedRes.pagination.total,
      });
    } catch (error) {
      console.warn('Failed to load status counts', error);
    }
  }, [hasGateAccess]);

  const loadAuditLogsData = useCallback(async () => {
    if (!hasGateAccess) return;
    try {
      const response = await fetchAuditLogs({ limit: 12 });
      setAuditLogs(response.data);
    } catch (error) {
      console.warn('Failed to load audit logs', error);
    }
  }, [hasGateAccess]);

  useEffect(() => {
    if (!hasGateAccess) return;
    loadUsers();
  }, [hasGateAccess, loadUsers]);

  useEffect(() => {
    if (!hasGateAccess) return;
    loadCounts();
    loadAuditLogsData();
  }, [hasGateAccess, loadCounts, loadAuditLogsData]);

  const openActionModal = (userRecord: AdminUser, mode: 'approve' | 'reject') => {
    setSelectedUser(userRecord);
    setActionMode(mode);
    setActionNote('');
    setRejectReason('');
  };

  const closeActionModal = () => {
    setSelectedUser(null);
    setActionMode(null);
    setActionNote('');
    setRejectReason('');
  };

  const handleActionSubmit = async () => {
    if (!selectedUser || !actionMode) return;

    if (actionMode === 'reject' && rejectReason.trim().length < 5) {
      toast.error('Rejection reason should be at least 5 characters.');
      return;
    }

    setActionLoading(true);
    try {
      if (actionMode === 'approve') {
        await approveUser(selectedUser._id, actionNote.trim() || undefined);
        toast.success(`${selectedUser.firstName} approved`);
      } else {
        await rejectUser(selectedUser._id, rejectReason.trim(), actionNote.trim() || undefined);
        toast.success(`${selectedUser.firstName} rejected`);
      }
      closeActionModal();
      await Promise.all([loadUsers(), loadCounts(), loadAuditLogsData()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const statusPillClass = useCallback((status: AdminUser['approvalStatus']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }, []);

  const actorLabel = (entry: AuditLogEntry['actorId']) => {
    if (!entry) return 'System';
    return typeof entry === 'string'
      ? entry
      : `${entry.firstName} ${entry.lastName}`;
  };

  const targetLabel = (entry?: AuditLogEntry['targetUserId']) => {
    if (!entry) return '—';
    return typeof entry === 'string'
      ? entry
      : `${entry.firstName} ${entry.lastName}`;
  };

  if (authLoading || !gateReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading admin tools...</p>
      </div>
    );
  }

  if (!hasGateAccess) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Admin Console"
          subtitle="Review sign-ups, enforce policy, and monitor the network."
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[{
                title: 'Pending approvals',
                value: counts.pending,
                icon: ClockIcon,
                accent: 'from-amber-100 to-orange-100 text-amber-900',
              }, {
                title: 'Approved users',
                value: counts.approved,
                icon: ShieldCheckIcon,
                accent: 'from-emerald-100 to-teal-100 text-emerald-900',
              }, {
                title: 'Rejected/flagged',
                value: counts.rejected,
                icon: XCircleIcon,
                accent: 'from-rose-100 to-red-100 text-rose-900',
              }].map((card) => (
                <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${card.accent} px-3 py-2 text-sm font-semibold`}>
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <p className="mt-3 text-4xl font-semibold text-gray-900">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status as StatusFilter); setPage(1); }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
                      placeholder="Search name or email"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(event) => { setRoleFilter(event.target.value as RoleFilter); setPage(1); }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-700 focus:border-gray-400 focus:bg-white focus:outline-none sm:w-52"
                  >
                    <option value="all">All roles</option>
                    <option value="household">Households</option>
                    <option value="shopkeeper">Shopkeepers</option>
                    <option value="retail_partner">Retail partners</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requested</th>
                      <th className="px-4 py-3">Last login</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {listLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10">
                          <div className="flex animate-pulse flex-col gap-4">
                            <div className="h-4 rounded bg-gray-100" />
                            <div className="h-4 rounded bg-gray-100" />
                            <div className="h-4 rounded bg-gray-100" />
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                          No users match your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((candidate) => (
                        <tr key={candidate._id} className="text-sm text-gray-700">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{candidate.firstName} {candidate.lastName}</div>
                            <div className="text-xs text-gray-500">{candidate.email}</div>
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {candidate.role.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${statusPillClass(candidate.approvalStatus)}`}>
                              {candidate.approvalStatus === 'approved' && <CheckCircleIcon className="h-4 w-4" />}
                              {candidate.approvalStatus === 'rejected' && <XCircleIcon className="h-4 w-4" />}
                              {candidate.approvalStatus === 'pending' && <ClockIcon className="h-4 w-4" />}
                              {candidate.approvalStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(candidate.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {candidate.lastLoginAt ? formatDate(candidate.lastLoginAt) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openActionModal(candidate, 'approve')}
                                disabled={candidate.approvalStatus === 'approved'}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal(candidate, 'reject')}
                                disabled={candidate.approvalStatus === 'rejected'}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Showing page {pagination?.page || 1} of {pagination?.pages || 1} — {pagination?.total || 0} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={!pagination || pagination.page <= 1}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((prev) => (!pagination ? prev : Math.min(prev + 1, pagination.pages)))}
                    disabled={!pagination || pagination.page >= pagination.pages}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Why approvals matter</h3>
                    <p className="text-sm text-gray-500">Keep the marketplace safe by validating real households and trusted shopkeepers.</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <ShieldCheckIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Verify every shopkeeper before they can list inventory.
                  </li>
                  <li className="flex items-start gap-3">
                    <ClockIcon className="mt-0.5 h-4 w-4 text-amber-500" />
                    Respond to pending applications within 48 hours to keep sign-ups engaged.
                  </li>
                  <li className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 text-rose-500" />
                    Use rejection notes to explain what applicants must fix before retrying.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent admin actions</h3>
                    <p className="text-sm text-gray-500">Latest 12 items from the audit log.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent decisions logged.</p>
                  ) : (
                    auditLogs.map((entry) => (
                      <div key={entry._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900">{entry.action.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                        <p className="mt-2 text-xs text-gray-600">
                          By <span className="font-medium text-gray-800">{actorLabel(entry.actorId)}</span> → {targetLabel(entry.targetUserId)}
                        </p>
                        {entry.metadata?.note && (
                          <p className="mt-1 text-xs text-gray-500">“{entry.metadata.note}”</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {actionMode && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              {actionMode === 'approve' ? (
                <ShieldCheckIcon className="h-6 w-6 text-emerald-500" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-rose-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionMode === 'approve' ? 'Approve account' : 'Reject account'}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedUser.firstName} {selectedUser.lastName} · {selectedUser.email}
                </p>
              </div>
            </div>

            {actionMode === 'reject' && (
              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
                  placeholder="Explain why the application is rejected"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Note (optional)</label>
              <textarea
                value={actionNote}
                onChange={(event) => setActionNote(event.target.value)}
                rows={actionMode === 'reject' ? 2 : 3}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-gray-400 focus:bg-white focus:outline-none"
                placeholder={actionMode === 'approve' ? 'Share context for this approval' : 'Guidance for the applicant'}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${actionMode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} disabled:cursor-not-allowed`}
              >
                {actionLoading ? 'Processing…' : actionMode === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
