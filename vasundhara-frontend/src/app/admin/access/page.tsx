'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ADMIN_CREDENTIALS_KEY = 'vasundhara_admin_credentials';
const GATE_KEY = 'vasundhara_admin_gate_token';

// Default credentials
const DEFAULT_ACCESS_ID = 'Dibakar';
const DEFAULT_ACCESS_PASSCODE = 'admin';

// Get stored or default credentials
function getAdminCredentials() {
  if (typeof window === 'undefined') return { id: DEFAULT_ACCESS_ID, passcode: DEFAULT_ACCESS_PASSCODE };

  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { id: DEFAULT_ACCESS_ID, passcode: DEFAULT_ACCESS_PASSCODE };
    }
  }
  return { id: DEFAULT_ACCESS_ID, passcode: DEFAULT_ACCESS_PASSCODE };
}

// Save new credentials
function saveAdminCredentials(id: string, passcode: string) {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({ id, passcode }));
}

export default function AdminAccessPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newId, setNewId] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const credentials = getAdminCredentials();
      if (adminId.trim() === credentials.id && passcode === credentials.passcode) {
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

  const handleResetCredentials = (event: FormEvent) => {
    event.preventDefault();

    if (!newId.trim()) {
      toast.error('Admin ID cannot be empty');
      return;
    }

    if (!newPasscode) {
      toast.error('Passcode cannot be empty');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      toast.error('Passcodes do not match');
      return;
    }

    saveAdminCredentials(newId.trim(), newPasscode);
    toast.success('Admin credentials updated successfully!');
    setShowForgotPassword(false);
    setNewId('');
    setNewPasscode('');
    setConfirmPasscode('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm backdrop-blur-xl">
        {!showForgotPassword ? (
          <>
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
                <div className="relative">
                  <input
                    id="admin-passcode"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    value={passcode}
                    onChange={(event) => setPasscode(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter secure passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 dark:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Unlock Admin Console'}
              </button>
            </form>

            <div className="space-y-2">
              <div className="text-center text-sm">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-slate-500">
                <button
                  onClick={() => router.push('/')}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Return to main site
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Reset Credentials</p>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Update Admin Access</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Set new admin ID and passcode. No restrictions apply.
              </p>
            </div>

            <form onSubmit={handleResetCredentials} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-id" className="text-sm font-medium text-gray-700 dark:text-slate-300">New Admin ID</label>
                <input
                  id="new-id"
                  type="text"
                  autoComplete="off"
                  value={newId}
                  onChange={(event) => setNewId(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter new admin ID"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-passcode" className="text-sm font-medium text-gray-700 dark:text-slate-300">New Passcode</label>
                <div className="relative">
                  <input
                    id="new-passcode"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="off"
                    value={newPasscode}
                    onChange={(event) => setNewPasscode(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter new passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirm-passcode" className="text-sm font-medium text-gray-700 dark:text-slate-300">Confirm Passcode</label>
                <div className="relative">
                  <input
                    id="confirm-passcode"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="off"
                    value={confirmPasscode}
                    onChange={(event) => setConfirmPasscode(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Confirm new passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 dark:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:hover:bg-emerald-700"
              >
                Update Credentials
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setNewId('');
                  setNewPasscode('');
                  setConfirmPasscode('');
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
