'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminNotificationsPage() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Notification Center" subtitle="Send updates to users and shopkeepers." />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-gray-500">Notification center interface coming soon...</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
