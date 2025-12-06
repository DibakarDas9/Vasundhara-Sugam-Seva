'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  validateCredentials,
  saveUser,
  hashPassword,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  updateUser as updateStoredUser,
  changePassword as changeStoredPassword,
  type StoredUser
} from '@/lib/localAuth';

interface HouseholdProfile {
  familySize?: number;
  address?: string;
  ward?: string;
}

interface ShopkeeperProfile {
  businessName?: string;
  licenseNumber?: string;
  address?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'household' | 'shopkeeper' | 'admin' | 'user' | 'retail_partner';
  isActive: boolean;
  profileImage?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  preferences: {
    notifications: boolean;
    alerts: boolean;
    gamification: boolean;
    language: string;
    timezone: string;
  };
  householdProfile?: HouseholdProfile;
  shopkeeperProfile?: ShopkeeperProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  // guest mode & role selection
  guestMode: boolean;
  setGuestMode: (v: boolean) => void;
  role?: 'household' | 'shopkeeper' | 'admin' | null;
  setRole: (r: 'household' | 'shopkeeper' | 'admin' | null) => void;
  guestName?: string | null;
  guestEmail?: string | null;
  setGuestInfo: (name: string, email: string) => void;
  pendingApproval: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'household' | 'shopkeeper' | 'admin';
  householdProfile?: HouseholdProfile;
  shopkeeperProfile?: ShopkeeperProfile;
  profileImage?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REMOTE_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_REMOTE_AUTH === 'true';
const DEFAULT_TIMEZONE = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

type RemoteAuthResponse = {
  user: any;
  pendingApproval?: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

function buildPreferences(overrides?: Partial<User['preferences']>): User['preferences'] {
  return {
    notifications: overrides?.notifications ?? true,
    alerts: overrides?.alerts ?? true,
    gamification: overrides?.gamification ?? false,
    language: overrides?.language ?? 'en',
    timezone: overrides?.timezone ?? DEFAULT_TIMEZONE,
  };
}

function mapStoredUserToUser(localUser: StoredUser): User {
  return {
    id: localUser.id,
    email: localUser.email,
    firstName: localUser.firstName,
    lastName: localUser.lastName,
    role: localUser.role,
    isActive: localUser.isActive,
    approvalStatus: localUser.approvalStatus,
    profileImage: localUser.profileImage,
    preferences: buildPreferences(),
    householdProfile: localUser.householdProfile,
    shopkeeperProfile: localUser.shopkeeperProfile,
  };
}

function mapRemoteUserToUser(remoteUser: any): User {
  return {
    id: remoteUser._id || remoteUser.id,
    email: remoteUser.email,
    firstName: remoteUser.firstName,
    lastName: remoteUser.lastName,
    role: remoteUser.role,
    isActive: remoteUser.isActive ?? true,
    approvalStatus: remoteUser.approvalStatus || 'pending',
    profileImage: remoteUser.profileImage,
    preferences: buildPreferences(remoteUser.preferences),
    householdProfile: remoteUser.householdProfile,
    shopkeeperProfile: remoteUser.shopkeeperProfile,
  };
}

async function remoteAuthRequest(endpoint: 'login' | 'register', payload: Record<string, any>): Promise<RemoteAuthResponse> {
  if (!API_URL) {
    throw new Error('API URL is not configured');
  }

  const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || 'Authentication failed';
    throw new Error(message);
  }

  return data as RemoteAuthResponse;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [guestMode, setGuestModeState] = useState<boolean>(() => {
    try { return localStorage.getItem('guestMode') === '1'; } catch { return false; }
  });
  const [role, setRoleState] = useState<'household' | 'shopkeeper' | 'admin' | null>(() => {
    try {
      const v = localStorage.getItem('vasundhara_role');
      return (v === 'household' || v === 'shopkeeper' || v === 'admin') ? v : null;
    } catch {
      return null;
    }
  });
  const router = useRouter();
  const [guestName, setGuestName] = useState<string | null>(() => {
    try { return localStorage.getItem('guest_name') || null; } catch { return null; }
  });
  const [guestEmail, setGuestEmail] = useState<string | null>(() => {
    try { return localStorage.getItem('guest_email') || null; } catch { return null; }
  });

  const hydrateLocalUser = useCallback((localUser: StoredUser) => {
    const normalized = mapStoredUserToUser(localUser);
    setUser(normalized);
    const validRole = ['household', 'shopkeeper', 'admin'].includes(normalized.role)
      ? normalized.role as 'household' | 'shopkeeper' | 'admin'
      : 'household';
    setRoleState(validRole);
    setPendingApproval(false);
  }, []);

  const persistRemoteSession = useCallback((payload: RemoteAuthResponse) => {
    const normalized = mapRemoteUserToUser(payload.user);
    try {
      localStorage.setItem('accessToken', payload.tokens.accessToken);
      localStorage.setItem('refreshToken', payload.tokens.refreshToken);
      localStorage.setItem('vasundhara_auth_mode', 'remote');
    } catch (error) {
      console.warn('Failed to persist remote tokens', error);
    }
    setUser(normalized);
    setPendingApproval(Boolean(payload.pendingApproval));
    const validRole = ['household', 'shopkeeper', 'admin'].includes(normalized.role)
      ? normalized.role as 'household' | 'shopkeeper' | 'admin'
      : 'household';
    setRoleState(validRole);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!REMOTE_AUTH_ENABLED || !API_URL) {
      setLoading(false);
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const normalized = mapRemoteUserToUser(data.user);
      setUser(normalized);
      setPendingApproval(false);
      const validRole = ['household', 'shopkeeper', 'admin'].includes(normalized.role)
        ? normalized.role as 'household' | 'shopkeeper' | 'admin'
        : 'household';
      setRoleState(validRole);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoteLogin = useCallback(async (email: string, password: string) => {
    const payload = await remoteAuthRequest('login', { email, password });
    persistRemoteSession(payload);
    toast.success('Welcome back!');
    if ((payload.user?.role || 'household') === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  }, [persistRemoteSession, router]);

  const handleRemoteRegister = useCallback(async (userData: RegisterData) => {
    const payload = await remoteAuthRequest('register', userData);
    persistRemoteSession(payload);
    toast.success('Account created successfully!');
    if ((payload.user?.role || 'household') === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  }, [persistRemoteSession, router]);

  useEffect(() => {
    // Check for existing local session
    const localUser = getCurrentUser();
    if (localUser) {
      hydrateLocalUser(localUser);
      setLoading(false);
      return;
    }

    if (REMOTE_AUTH_ENABLED && API_URL && typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      fetchUserProfile();
      return;
    }

    setLoading(false);
  }, [hydrateLocalUser, fetchUserProfile]);

  const login = async (email: string, password: string) => {
    if (REMOTE_AUTH_ENABLED && API_URL) {
      try {
        await handleRemoteLogin(email, password);
        return;
      } catch (error) {
        console.warn('Remote login failed, attempting local auth', error);
      }
    }

    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('vasundhara_auth_mode');
    } catch { }

    const localUser = validateCredentials(email, password);

    if (!localUser) {
      toast.error('Invalid email or password');
      throw new Error('Invalid credentials');
    }

    const normalized = mapStoredUserToUser(localUser);

    setCurrentUser(localUser.id);
    setUser(normalized);
    const validRole = ['household', 'shopkeeper', 'admin'].includes(normalized.role)
      ? (normalized.role as 'household' | 'shopkeeper' | 'admin')
      : 'household';
    setRoleState(validRole);
    setPendingApproval(false);

    toast.success('Welcome back!');

    if (normalized.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (userData: RegisterData) => {
    if (REMOTE_AUTH_ENABLED && API_URL) {
      try {
        await handleRemoteRegister(userData);
        return;
      } catch (error) {
        console.warn('Remote registration failed, attempting local fallback', error);
      }
    }

    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('vasundhara_auth_mode');
    } catch { }

    try {
      const storedUser = saveUser({
        email: userData.email,
        password: hashPassword(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        householdProfile: userData.householdProfile,
        shopkeeperProfile: userData.shopkeeperProfile,
        profileImage: userData.profileImage,
      });

      const normalized = mapStoredUserToUser(storedUser);

      setCurrentUser(storedUser.id);
      setUser(normalized);
      const validRole = ['household', 'shopkeeper', 'admin'].includes(normalized.role)
        ? (normalized.role as 'household' | 'shopkeeper' | 'admin')
        : 'household';
      setRoleState(validRole);
      setPendingApproval(false);

      toast.success('Account created successfully!');

      if (normalized.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create account');
      }
      throw error;
    }
  };

  const logout = () => {
    clearCurrentUser();
    setUser(null);
    setRoleState(null);
    setPendingApproval(false);
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('vasundhara_auth_mode');
      localStorage.removeItem('vasundhara_admin_gate_token');
      localStorage.removeItem('vasundhara_admin_session_time');
    } catch { }
    toast.success('Logged out successfully');
    router.push('/');
  };

  function setGuestMode(v: boolean) {
    try { localStorage.setItem('guestMode', v ? '1' : '0'); } catch { }
    setGuestModeState(v);
  }

  function setRole(r: 'household' | 'shopkeeper' | 'admin' | null) {
    try {
      if (r) localStorage.setItem('vasundhara_role', r);
      else localStorage.removeItem('vasundhara_role');
    } catch { }
    setRoleState(r);
  }

  function setGuestInfo(name: string, email: string) {
    try { localStorage.setItem('guest_name', name); localStorage.setItem('guest_email', email); } catch { }
    setGuestName(name);
    setGuestEmail(email);
  }


  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (REMOTE_AUTH_ENABLED && API_URL && token) {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error?.message || 'Update failed');
        }

        setUser(mapRemoteUserToUser(responseData.user));
        toast.success('Profile updated successfully');
        return;
      }

      const current = getCurrentUser();
      if (!current) {
        throw new Error('No active session found');
      }

      const payload: Partial<StoredUser> = {};
      if (typeof data.firstName !== 'undefined') payload.firstName = data.firstName as string;
      if (typeof data.lastName !== 'undefined') payload.lastName = data.lastName as string;
      if (typeof data.profileImage !== 'undefined') payload.profileImage = data.profileImage;
      if (typeof data.householdProfile !== 'undefined') payload.householdProfile = data.householdProfile as any;
      if (typeof data.shopkeeperProfile !== 'undefined') payload.shopkeeperProfile = data.shopkeeperProfile as any;

      const updated = updateStoredUser(current.id, payload);
      if (!updated) {
        throw new Error('Failed to update profile');
      }
      hydrateLocalUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (REMOTE_AUTH_ENABLED && API_URL && token) {
        throw new Error('Remote password updates are not configured for this environment.');
      }

      const current = getCurrentUser();
      if (!current) {
        throw new Error('No active session found');
      }

      const success = changeStoredPassword(current.id, currentPassword, newPassword);
      if (!success) {
        throw new Error('Current password is incorrect');
      }
      toast.success('Password updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    guestMode,
    setGuestMode,
    role,
    setRole,
    guestName,
    guestEmail,
    setGuestInfo,
    pendingApproval,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
