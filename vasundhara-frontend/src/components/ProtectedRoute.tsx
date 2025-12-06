'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { LoginPrompt } from '@/components/auth/LoginPrompt';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Protects routes from unauthorized access
 * Shows a login prompt to unauthenticated users
 */
export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // If auth is required and user is not authenticated, show login prompt
    if (requireAuth && !user) {
        return <LoginPrompt />;
    }

    // Render children if authenticated or auth not required
    return <>{children}</>;
}
