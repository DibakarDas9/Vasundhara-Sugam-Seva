'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function ThemeController() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme === 'system') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  return null;
}

