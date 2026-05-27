'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';
import { cn } from '@/lib/utils';

const languages: { code: Language; label: string; short: string; native: string }[] = [
  { code: 'en', label: 'English',  short: 'EN', native: 'English' },
  { code: 'hi', label: 'Hindi',    short: 'HI', native: 'हिंदी'   },
  { code: 'bn', label: 'Bengali',  short: 'BN', native: 'বাংলা'   },
];

export default function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={ref}>
      {/* Trigger — icon + short code only */}
      <button
        id="lang-btn"
        aria-label="Select language"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold',
          'transition-all duration-150 outline-none select-none',
          'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
          'hover:bg-slate-100 dark:hover:bg-white/8',
          open && 'bg-slate-100 text-slate-800 dark:bg-white/8 dark:text-slate-100',
        )}
      >
        {/* Globe SVG — no external icon dep */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0"
        >
          <circle cx="10" cy="10" r="8.25" />
          <path d="M10 1.75C10 1.75 7 5.5 7 10s3 8.25 3 8.25M10 1.75C10 1.75 13 5.5 13 10s-3 8.25-3 8.25M1.75 10h16.5" strokeLinecap="round" />
        </svg>
        <span className="tracking-wide">{current.short}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute right-0 mt-1.5 w-36 rounded-xl border py-1 z-50',
            'bg-white dark:bg-neutral-900',
            'border-slate-200 dark:border-white/10',
            'shadow-lg shadow-slate-200/50 dark:shadow-black/40',
            'animate-in fade-in-0 zoom-in-95 duration-100',
          )}
        >
          {languages.map(lang => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs font-medium',
                  'transition-colors duration-100 outline-none',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5',
                )}
              >
                <span>{lang.native}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
