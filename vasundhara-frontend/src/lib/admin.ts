import { getAllUsers, updateUser, getCurrentUser, isSystemAdminAccount, type StoredUser } from '@/lib/localAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const ML_BASE = (process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
const LOCAL_AUDIT_LOG_KEY = 'vasundhara_admin_audit_logs';
const ENABLE_REMOTE_ADMIN = process.env.NEXT_PUBLIC_ENABLE_REMOTE_ADMIN === 'true';

type UserRole = 'household' | 'shopkeeper' | 'admin' | 'user' | 'retail_partner';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  approvalMetadata?: {
    reviewerId?: string;
    note?: string;
    reviewedAt?: string;
  };
  isActive: boolean;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  householdProfile?: {
    familySize?: number;
    address?: string;
    ward?: string;
  };
  shopkeeperProfile?: {
    businessName?: string;
    licenseNumber?: string;
    address?: string;
  };
  flags?: {
    isFlagged: boolean;
    reason?: string;
    lastReviewedAt?: string;
  };
  isProtected?: boolean;
  protectedLabel?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  pagination: Pagination;
}

export interface AuditLogEntry {
  _id: string;
  actorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  } | string;
  action: string;
  targetUserId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  } | string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLogEntry[];
}

export interface ModelMetricSummary {
  count: number;
  success: number;
  failure: number;
  success_rate: number;
  avg_latency_ms: number;
}

export interface MonitoringSnapshot {
  models: Record<string, ModelMetricSummary>;
  recent_inferences: Array<{
    model: string;
    operation: string;
    latency_ms: number;
    status: 'success' | 'failure' | string;
    metadata: Record<string, any>;
    timestamp: string;
  }>;
  recent_retraining_events: Array<{
    status: string;
    initiated_by?: string;
    details?: Record<string, any>;
    timestamp: string;
  }>;
}

export interface MonitoringMetricsResponse {
  timestamp: string;
  metrics: MonitoringSnapshot;
}

export interface FetchAdminUsersParams {
  status?: ApprovalStatus;
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function shouldUseLocalAdminMode() {
  if (!ENABLE_REMOTE_ADMIN) {
    return true;
  }
  if (!API_BASE) {
    return true;
  }
  if (!isBrowser()) {
    return false;
  }
  const token = localStorage.getItem('accessToken');
  return !token;
}

export function isLocalAdminDataMode() {
  return shouldUseLocalAdminMode();
}

function ensureBrowserToken(): string {
  if (shouldUseLocalAdminMode()) {
    return 'local-admin-token';
  }

  if (!isBrowser()) {
    throw new Error('Admin API helpers are browser-only');
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('You need to be signed in to perform this action');
  }

  return token;
}

function mapStoredUserToAdminUser(user: StoredUser): AdminUser {
  const systemAdmin = isSystemAdminAccount(user);
  return {
    _id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    approvalStatus: user.approvalStatus,
    isActive: user.isActive,
    isEmailVerified: true,
    phoneNumber: user.phoneNumber,
    lastLoginAt: undefined,
    createdAt: user.createdAt,
    updatedAt: user.createdAt,
    householdProfile: user.householdProfile,
    shopkeeperProfile: user.shopkeeperProfile,
    flags: user.approvalStatus === 'rejected' ? { isFlagged: true, reason: 'Rejected locally' } : undefined,
    isProtected: systemAdmin,
    protectedLabel: systemAdmin ? 'System admin • cannot be removed' : undefined,
  };
}

function getLocalUsers(): AdminUser[] {
  if (!isBrowser()) {
    return [];
  }
  return getAllUsers()
    .map(mapStoredUserToAdminUser)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), pages);
  const start = (currentPage - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    pagination: { page: currentPage, limit, total, pages },
  };
}

function readLocalAuditLogs(): AuditLogEntry[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return parsed;
  } catch {
    return [];
  }
}

function writeLocalAuditLogs(entries: AuditLogEntry[]) {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(LOCAL_AUDIT_LOG_KEY, JSON.stringify(entries.slice(0, 50)));
}

function appendLocalAuditLog(action: string, target: StoredUser, metadata?: Record<string, any>) {
  if (!isBrowser()) {
    return;
  }
  const actor = getCurrentUser();
  const entry: AuditLogEntry = {
    _id: `audit_${Date.now()}`,
    action,
    actorId: actor ? {
      _id: actor.id,
      firstName: actor.firstName,
      lastName: actor.lastName,
      email: actor.email,
      role: actor.role,
    } : 'Local Admin',
    targetUserId: {
      _id: target.id,
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      role: target.role,
    },
    metadata,
    createdAt: new Date().toISOString(),
  };
  const existing = readLocalAuditLogs();
  writeLocalAuditLogs([entry, ...existing]);
}

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const token = ensureBrowserToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch (error) {
    // Swallow JSON parse errors for empty responses
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error?.message || 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchAdminUsers(params: FetchAdminUsersParams = {}): Promise<AdminUserListResponse> {
  if (shouldUseLocalAdminMode()) {
    const search = params.search?.toLowerCase() || '';
    const all = getLocalUsers().filter((user) => {
      if (params.status && user.approvalStatus !== params.status) {
        return false;
      }
      if (params.role && user.role !== params.role) {
        return false;
      }
      if (search && !(`${user.firstName} ${user.lastName}`.toLowerCase().includes(search) || user.email.toLowerCase().includes(search))) {
        return false;
      }
      return true;
    });

    const limit = Math.max(1, params.limit ?? 10);
    const page = params.page ?? 1;
    const { data, pagination } = paginate(all, page, limit);
    return Promise.resolve({ data, pagination });
  }

  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.role) {
    searchParams.set('role', params.role);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.page) {
    searchParams.set('page', params.page.toString());
  }
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();
  const path = `/api/admin/users${query ? `?${query}` : ''}`;

  return adminRequest<AdminUserListResponse>(path);
}

export async function approveUser(userId: string, note?: string) {
  if (shouldUseLocalAdminMode()) {
    const updated = updateUser(userId, { approvalStatus: 'approved' });
    if (!updated) {
      throw new Error('User not found');
    }
    appendLocalAuditLog('user.approved', updated, note ? { note } : undefined);
    return { message: 'User approved locally', user: mapStoredUserToAdminUser(updated) };
  }

  const body = note ? { note } : {};
  return adminRequest<{ message: string; user: AdminUser }>(`/api/admin/users/${userId}/approve`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function rejectUser(userId: string, reason: string, note?: string) {
  if (shouldUseLocalAdminMode()) {
    if (!reason?.trim()) {
      throw new Error('Rejection reason is required');
    }
    const updated = updateUser(userId, { approvalStatus: 'rejected' });
    if (!updated) {
      throw new Error('User not found');
    }
    appendLocalAuditLog('user.rejected', updated, { reason, ...(note ? { note } : {}) });
    return { message: 'User rejected locally', user: mapStoredUserToAdminUser(updated) };
  }

  const body = { reason, ...(note ? { note } : {}) };
  return adminRequest<{ message: string; user: AdminUser }>(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function fetchAuditLogs(options: { action?: string; limit?: number } = {}) {
  if (shouldUseLocalAdminMode()) {
    const logs = readLocalAuditLogs();
    const filtered = options.action ? logs.filter((log) => log.action === options.action) : logs;
    const limited = options.limit ? filtered.slice(0, options.limit) : filtered;
    return { data: limited };
  }

  const searchParams = new URLSearchParams();
  if (options.action) {
    searchParams.set('action', options.action);
  }
  if (options.limit) {
    searchParams.set('limit', options.limit.toString());
  }

  const query = searchParams.toString();
  const path = `/api/admin/audit-logs${query ? `?${query}` : ''}`;
  return adminRequest<AuditLogResponse>(path);
}

export async function fetchMonitoringMetrics(signal?: AbortSignal): Promise<MonitoringMetricsResponse> {
  if (shouldUseLocalAdminMode()) {
    const allUsers = getLocalUsers();
    const metrics: MonitoringSnapshot = {
      models: {
        'inventory-curator': {
          count: allUsers.length,
          success: allUsers.filter((u) => u.approvalStatus === 'approved').length,
          failure: allUsers.filter((u) => u.approvalStatus === 'rejected').length,
          success_rate: allUsers.length === 0 ? 1 : Number((allUsers.filter((u) => u.approvalStatus === 'approved').length / allUsers.length).toFixed(2)),
          avg_latency_ms: 42,
        },
      },
      recent_inferences: [],
      recent_retraining_events: [],
    };
    return Promise.resolve({ timestamp: new Date().toISOString(), metrics });
  }

  if (!ML_BASE) {
    throw new Error('NEXT_PUBLIC_ML_SERVICE_URL is not configured');
  }

  const token = ensureBrowserToken();
  const response = await fetch(`${ML_BASE}/metrics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    let message = 'Failed to load monitoring metrics';
    try {
      const payload = await response.json();
      message = payload?.detail || payload?.message || message;
    } catch (error) {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const payload = await response.json();
  return {
    timestamp: payload?.timestamp || new Date().toISOString(),
    metrics: payload?.metrics || { models: {}, recent_inferences: [], recent_retraining_events: [] },
  };
}
