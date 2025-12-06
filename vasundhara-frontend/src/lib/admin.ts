const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const ML_BASE = (process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');

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

function ensureBrowserToken(): string {
  if (typeof window === 'undefined') {
    throw new Error('Admin API helpers are browser-only');
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('You need to be signed in to perform this action');
  }

  return token;
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
