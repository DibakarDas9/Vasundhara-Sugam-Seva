'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'vasundhara_theme_v1';

export function ThemeController() {
    useEffect(() => {
        // Restore saved invert preference (legacy dark mode behavior)
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const shouldInvert = saved === 'inverted';
            document.documentElement.classList.toggle('invert-theme', shouldInvert);
        } catch {
            document.documentElement.classList.remove('invert-theme');
        }
    }, []);

    return null;
}
