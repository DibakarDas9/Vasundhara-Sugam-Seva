'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { SystemAdminControls } from '@/components/admin/SystemAdminControls';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminSettingsPage() {
    const { user, loading } = useAuth();
    const [hasGateAccess, setHasGateAccess] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const readGate = () => {
            try {
                setHasGateAccess(localStorage.getItem('vasundhara_admin_gate_token') === 'granted');
            } catch {
                setHasGateAccess(false);
            }
        };
        readGate();
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'vasundhara_admin_gate_token') {
                readGate();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const canManage = (user?.role === 'admin') || hasGateAccess;

    if (loading) {
        return (
            <div className="flex h-full flex-col">
                <Header title="System Settings" subtitle="Manage the protected system admin account." />
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-gray-500">Checking admin privileges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="System Settings" subtitle="Manage the protected system admin account." />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {canManage ? (
                        <SystemAdminControls />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin access required</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                                <p>You need to unlock the admin console or sign in with the system admin account before updating these settings.</p>
                                <p>Visit <span className="font-semibold">/admin/access</span> to complete the gate, or log in with the `admin` user to manage credentials.</p>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}
