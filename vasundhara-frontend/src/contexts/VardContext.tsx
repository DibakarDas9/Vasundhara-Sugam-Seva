'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VardContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  hasKey: boolean;
  clearKey: () => void;
}

const VardContext = createContext<VardContextType | undefined>(undefined);

const STORAGE_KEY = 'vasundhara_vard_api_key';

export function VardProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setApiKeyState(stored);
    } catch {}
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    try {
      if (key) localStorage.setItem(STORAGE_KEY, key);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const clearKey = () => setApiKey('');

  return (
    <VardContext.Provider value={{ apiKey, setApiKey, hasKey: Boolean(apiKey), clearKey }}>
      {children}
    </VardContext.Provider>
  );
}

export function useVard() {
  const ctx = useContext(VardContext);
  if (!ctx) throw new Error('useVard must be used within VardProvider');
  return ctx;
}
