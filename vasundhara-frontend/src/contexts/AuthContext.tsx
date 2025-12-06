'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  validateCredentials,
  saveUser,
  hashPassword,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
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

  useEffect(() => {
    // Check for existing local session
    const localUser = getCurrentUser();
    if (localUser) {
      // Convert StoredUser to User format
      const user: User = {
        id: localUser.id,
        email: localUser.email,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
        role: localUser.role,
        isActive: localUser.isActive,
        approvalStatus: localUser.approvalStatus,
        preferences: {
          notifications: true,
          alerts: true,
          gamification: false,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        householdProfile: localUser.householdProfile,
        shopkeeperProfile: localUser.shopkeeperProfile,
      };
      setUser(user);
      const validRole = ['household', 'shopkeeper', 'admin'].includes(user.role)
        ? (user.role as 'household' | 'shopkeeper' | 'admin')
        : 'household';
      setRoleState(validRole);
      setPendingApproval(false);
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPendingApproval(Boolean(data.pendingApproval));
        setRoleState((data.user.role as any) || 'household');
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Use local authentication system
    const localUser = validateCredentials(email, password);

    if (!localUser) {
      toast.error('Invalid email or password');
      throw new Error('Invalid credentials');
    }

    // Convert StoredUser to User format
    const user: User = {
      id: localUser.id,
      email: localUser.email,
      firstName: localUser.firstName,
      lastName: localUser.lastName,
      role: localUser.role,
      isActive: localUser.isActive,
      approvalStatus: localUser.approvalStatus,
      preferences: {
        notifications: true,
        alerts: true,
        gamification: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      householdProfile: localUser.householdProfile,
      shopkeeperProfile: localUser.shopkeeperProfile,
    };

    // Set current user session
    setCurrentUser(localUser.id);
    setUser(user);
    const validRole = ['household', 'shopkeeper', 'admin'].includes(user.role)
      ? (user.role as 'household' | 'shopkeeper' | 'admin')
      : 'household';
    setRoleState(validRole);
    setPendingApproval(false);

    toast.success('Welcome back!');

    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // Save user to local storage
      const storedUser = saveUser({
        email: userData.email,
        password: hashPassword(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        householdProfile: userData.householdProfile,
        shopkeeperProfile: userData.shopkeeperProfile,
      });

      // Convert StoredUser to User format
      const user: User = {
        id: storedUser.id,
        email: storedUser.email,
        firstName: storedUser.firstName,
        lastName: storedUser.lastName,
        role: storedUser.role,
        isActive: storedUser.isActive,
        approvalStatus: storedUser.approvalStatus,
        preferences: {
          notifications: true,
          alerts: true,
          gamification: false,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        householdProfile: storedUser.householdProfile,
        shopkeeperProfile: storedUser.shopkeeperProfile,
      };

      // Set current user session
      setCurrentUser(storedUser.id);
      setUser(user);
      const validRole = ['household', 'shopkeeper', 'admin'].includes(user.role)
        ? (user.role as 'household' | 'shopkeeper' | 'admin')
        : 'household';
      setRoleState(validRole);
      setPendingApproval(false);

      toast.success('Account created successfully!');

      if (user.role === 'admin') {
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        setUser(responseData.user);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(responseData.error?.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
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
