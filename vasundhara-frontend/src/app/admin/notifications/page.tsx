'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';

export default function AdminNotificationsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Notification Center" subtitle="Send updates to users and shopkeepers." />
            <div className="p-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-gray-500">Notification center interface coming soon...</p>
                </div>
            </div>
        </div>
    );
}
