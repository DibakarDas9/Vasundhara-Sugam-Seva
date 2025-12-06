'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'vasundhara_theme_v1';

export default function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial = saved === 'inverted';
      setInverted(initial);
      document.documentElement.classList.toggle('invert-theme', initial);
    } catch {
      document.documentElement.classList.remove('invert-theme');
    }
  }, []);

  if (!mounted) {
    return (
      <span
        className={cn('inline-flex h-8 w-12 animate-pulse rounded-full bg-slate-200/70', className)}
        aria-hidden
      />
    );
  }

  const handleToggle = () => {
    const next = !inverted;
    setInverted(next);
    document.documentElement.classList.toggle('invert-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'inverted' : 'normal');
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      aria-label="Toggle inverted theme"
      aria-pressed={inverted}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-8 w-12 items-center rounded-full border border-slate-200 bg-white px-1 shadow-sm transition-colors hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
        className
      )}
    >
      <span
        className={cn(
          'absolute left-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-900 transition-all duration-200 ease-out',
          'bg-amber-300 shadow ring-1 ring-black/10',
          inverted && 'translate-x-4 bg-slate-700 text-slate-100'
        )}
      >
        {inverted ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      </span>
    </button>
  );
}
