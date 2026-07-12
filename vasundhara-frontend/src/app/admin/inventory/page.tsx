'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminInventoryPage() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Inventory Oversight" subtitle="Monitor and manage global inventory." />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-gray-500">Inventory oversight interface coming soon...</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
