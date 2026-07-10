'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!mounted) return;
    if (resolvedTheme === 'system') {
      setTheme('light');
    }
  }, [mounted, resolvedTheme, setTheme]);

  if (!mounted) {
    // Reserve exact space while hydrating so layout doesn't shift
    return (
      <span
        className={cn(
          'inline-block w-[52px] h-7 rounded-full bg-slate-200/70 dark:bg-slate-700/50 animate-pulse',
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => {
          setTheme(isDark ? 'light' : 'dark');
        }}
        className={cn(
          'relative inline-flex h-7 w-[52px] flex-shrink-0 cursor-pointer rounded-full outline-none',
          'transition-colors duration-300 ease-in-out',
          'focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
          isDark ? 'bg-slate-700 ring-1 ring-white/8' : 'bg-slate-200 ring-1 ring-black/5',
          className,
        )}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              'h-3.5 w-3.5 transition-opacity duration-300',
              isDark ? 'opacity-30 text-slate-400' : 'opacity-100 text-amber-400',
            )}
          >
            <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06L5.404 4.343a.75.75 0 1 0-1.06 1.06l1.06 1.061Z" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              'h-3.5 w-3.5 transition-opacity duration-300',
              isDark ? 'opacity-100 text-slate-300' : 'opacity-30 text-slate-500',
            )}
          >
            <path
              fillRule="evenodd"
              d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        <span
          className={cn(
            'absolute left-0.5 top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full',
            'shadow-md ring-1 transition-all duration-300 ease-in-out will-change-transform',
            isDark ? 'translate-x-[26px] bg-slate-900 ring-white/10' : 'translate-x-0 bg-white ring-black/8',
          )}
        />
      </button>
    </div>
  );
}
