'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SparklesIcon, PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

interface VardOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function VardOverlay({ open, onClose }: VardOverlayProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  if (!open) return null;

  const handleAction = (label: string) => {
    if (!file) {
      toast.error('Please upload a photo first.');
      return;
    }
    toast.success(`${label} queued. AI wiring is next.`);
  };

  const handleClear = () => {
    setFile(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Logo className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">VARD AI</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Photo-to-inventory actions by VARD</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Close VARD"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-neutral-900">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-gray-700 dark:text-gray-200">
                VARD AI is managed on the server
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <PhotoIcon className="w-4 h-4" />
                Upload a pantry photo
              </div>
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-950 p-4 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:border-emerald-400 hover:text-emerald-600 transition">
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Click to add or drop image here</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              {previewUrl ? (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img src={previewUrl} alt="VARD upload" className="w-full h-40 object-cover" />
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Preview will appear here.</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Supported: JPG, PNG</span>
                <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-600">Clear</button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-neutral-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Actions</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  VARD will detect items, update inventory, and estimate expiry from the photo.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Button variant="primary" onClick={() => handleAction('Add items')}>Add items</Button>
                  <Button variant="secondary" onClick={() => handleAction('Remove items')}>Remove items</Button>
                  <Button variant="outline" onClick={() => handleAction('Predict expiry')}>Predict expiry</Button>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Hover mode</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80 mt-1">
                  Coming next: hover across the site to tag items directly on screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
