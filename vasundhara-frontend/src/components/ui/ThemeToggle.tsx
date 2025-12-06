'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={cn('inline-flex h-8 w-12 animate-pulse rounded-full bg-slate-200/70', className)}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex h-8 w-12 items-center rounded-full border border-slate-200 bg-white px-1 shadow-sm transition-colors hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800',
        className
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={cn(
          'absolute left-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-900 transition-all duration-200 ease-out',
          'bg-amber-300 shadow ring-1 ring-black/10 dark:bg-slate-700 dark:text-slate-100',
          theme === 'dark' && 'translate-x-4'
        )}
      >
        {theme === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      </span>
    </button>
  );
}
