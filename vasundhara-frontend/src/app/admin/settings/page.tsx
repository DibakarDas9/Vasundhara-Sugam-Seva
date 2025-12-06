'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';

export default function AdminSettingsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="System Settings" subtitle="Configure platform settings and maintenance modes." />
            <div className="p-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-gray-500">System settings interface coming soon...</p>
                </div>
            </div>
        </div>
    );
}
