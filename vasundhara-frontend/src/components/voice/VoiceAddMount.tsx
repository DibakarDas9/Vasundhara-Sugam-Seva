"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import VoiceAddFloating from './VoiceAddFloating';

const HIDE_DELAY_MS = 1400;
const ALLOWED_PATHS = ['/dashboard', '/inventory'];

export default function VoiceAddMount() {
  const pathname = usePathname();
  const [delayPassed, setDelayPassed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayPassed(true), HIDE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const isAllowedPath = pathname && ALLOWED_PATHS.includes(pathname);

  if (!delayPassed || !isAllowedPath) {
    return null;
  }

  return <VoiceAddFloating />;
}
