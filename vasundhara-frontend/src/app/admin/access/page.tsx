'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const ACCESS_ID = process.env.NEXT_PUBLIC_ADMIN_ACCESS_ID || 'admin';
const ACCESS_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSCODE || 'Admin@123';
const GATE_KEY = 'vasundhara_admin_gate_token';

export default function AdminAccessPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      if (adminId.trim() === ACCESS_ID && passcode === ACCESS_PASSCODE) {
        // Set gate token with timestamp for session management
        localStorage.setItem(GATE_KEY, 'granted');
        localStorage.setItem('vasundhara_admin_session_time', new Date().toISOString());
        toast.success('Admin access verified');

        // Use hard redirect to ensure localStorage is properly read
        window.location.href = '/admin';
      } else {
        toast.error('Invalid admin ID or passcode');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Admin Entry</p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Secure Console Access</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Provide the issued admin ID and passcode to continue to the control center.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="admin-id" className="text-sm font-medium text-gray-700 dark:text-slate-300">Admin ID</label>
            <input
              id="admin-id"
              type="text"
              autoComplete="off"
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter admin ID"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="admin-passcode" className="text-sm font-medium text-gray-700 dark:text-slate-300">Passcode</label>
            <input
              id="admin-passcode"
              type="password"
              autoComplete="off"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter secure passcode"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 dark:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Unlock Admin Console'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-slate-500">
          <button
            onClick={() => router.push('/')}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Return to main site
          </button>
        </div>
      </div>
    </div>
  );
}
