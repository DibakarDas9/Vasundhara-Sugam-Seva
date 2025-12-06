'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/solid';

const STORAGE_KEY = 'vasundhara_theme_v1';

const trackVariants = {
  light: {
    background: 'linear-gradient(120deg, rgba(254, 249, 237, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)'
  },
  dark: {
    background: 'linear-gradient(120deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.9) 100%)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    boxShadow: '0 8px 30px rgba(14, 165, 233, 0.28)'
  }
};

const knobVariants = {
  light: { x: 2, background: 'linear-gradient(135deg,#fef3c7,#fde68a,#fcd34d)', color: '#92400e' },
  dark: { x: 28, background: 'linear-gradient(135deg,#0ea5e9,#6366f1,#8b5cf6)', color: '#e0e7ff' }
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function ThemeToggle({ className }: { className?: string }) {
  const [inverted, setInverted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const isInverted = saved === 'inverted';
        setInverted(isInverted);
        document.documentElement.classList.toggle('invert-theme', isInverted);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setInverted(prefersDark);
        document.documentElement.classList.toggle('invert-theme', prefersDark);
      }
    } catch (e) {
      console.warn('ThemeInit:', e);
    }
  }, []);

  function toggle() {
    const next = !inverted;
    setInverted(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'inverted' : 'normal');
    } catch (e) {
      // ignore
    }
    document.documentElement.classList.toggle('invert-theme', next);
  }

  const orbits = useMemo(
    () => [
      { delay: 0, rotate: -8, scale: 1 },
      { delay: 0.4, rotate: 6, scale: 0.82 }
    ],
    []
  );

  const mode = inverted ? 'dark' : 'light';

  return (
    <motion.button
      aria-label="Toggle theme"
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex h-8 w-16 items-center justify-center overflow-hidden rounded-full border bg-white/10 p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
        className || ''
      }`}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={trackVariants[mode]}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute -inset-1 rounded-full opacity-60 blur-3xl"
        animate={{
          background:
            mode === 'dark'
              ? 'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.25), transparent 60%)'
              : 'radial-gradient(circle at 30% 30%, rgba(251,191,36,0.4), transparent 60%)',
          filter: ['blur(24px)', 'blur(30px)', 'blur(24px)']
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {orbits.map((orbit, index) => (
        <motion.div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="pointer-events-none absolute inset-[6px] rounded-full border border-white/10"
          animate={{ rotate: orbit.rotate, scale: orbit.scale, opacity: inverted ? 0.35 : 0.6 }}
          transition={{ duration: 6, repeat: Infinity, delay: orbit.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 flex h-full w-full items-center">
        <motion.div
          className="relative ml-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shadow-lg"
          animate={knobVariants[mode]}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {mode === 'light' ? (
            <motion.div variants={iconVariants} initial="hidden" animate="visible">
              <SunIcon className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div variants={iconVariants} initial="hidden" animate="visible">
              <MoonIcon className="h-5 w-5" />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="ml-auto mr-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px]"
          animate={{
            background: mode === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.65)',
            color: mode === 'light' ? '#facc15' : '#93c5fd'
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {mode === 'light' ? '☀️' : '🌙'}
        </motion.div>
      </div>

      <motion.span
        className="pointer-events-none absolute -left-0.5 -top-0.5 text-amber-200"
        animate={{ scale: mode === 'light' ? [0.7, 1.1, 0.7] : 0.3, opacity: mode === 'light' ? [0.5, 0.9, 0.5] : 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <SparklesIcon className="h-3 w-3" />
      </motion.span>
      <motion.span
        className="pointer-events-none absolute -bottom-0.5 -right-0.5 text-sky-200"
        animate={{ scale: mode === 'dark' ? [0.6, 1, 0.6] : 0.3, opacity: mode === 'dark' ? [0.4, 0.9, 0.4] : 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <SparklesIcon className="h-3 w-3" />
      </motion.span>

      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
