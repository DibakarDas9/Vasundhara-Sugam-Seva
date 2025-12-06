"use client";

import React, { createContext, useContext, useState } from 'react';

type MobileNavState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const MobileNavContext = createContext<MobileNavState | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(v => !v);
  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error('useMobileNav must be used within MobileNavProvider');
  return ctx;
}

export default MobileNavProvider;
