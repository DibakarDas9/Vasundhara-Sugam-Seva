'use client';

import React, { useEffect, useState } from 'react';
import { useVard } from '@/contexts/VardContext';
import { XMarkIcon, KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Logo } from '@/components/ui/Logo';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey, hasKey, clearKey } = useVard();
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(apiKey);
  }, [apiKey, open]);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = draft.trim();
    setStorageError(null);
    setApiKey(trimmed);
    try {
      if (trimmed) localStorage.setItem('vasundhara_vard_api_key', trimmed);
      else localStorage.removeItem('vasundhara_vard_api_key');
    } catch {
      setStorageError('Could not write to localStorage. Check browser privacy settings.');
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const handleClear = () => {
    clearKey();
    setDraft('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl p-6 border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Logo className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">VARD AI Setup</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect VARD to your AI key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        {hasKey && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">API key is active</span>
          </div>
        )}

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your VARD API Key
            </label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => { setDraft(e.target.value); setSaved(false); }}
                placeholder="AIza..."
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-semibold">🔑 How to get your free API key:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
              <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">aistudio.google.com/app/apikey</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy and paste it here</li>
            </ol>
            <p className="text-blue-500 dark:text-blue-400 mt-1">✓ Free tier · ✓ No credit card needed · ✓ Stored only on your device</p>
          </div>

          <div className="flex gap-2 pt-1">
            {hasKey && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-700/40 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-500 hover:to-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
            >
              {saved ? (
                <><CheckCircleIcon className="w-4 h-4" /> Saved!</>
              ) : (
                <><KeyIcon className="w-4 h-4" /> Save API Key</>
              )}
            </button>
          </div>
          {storageError && (
            <p className="text-xs text-red-600">{storageError}</p>
          )}
        </div>

        {/* What it enables */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Unlocks AI features:</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            {[
              '📸 AI Food Detection',
              '📅 Expiry Date Estimation',
              '🥦 Produce Recognition',
              '📦 Package Label Reading',
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-neutral-800">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
