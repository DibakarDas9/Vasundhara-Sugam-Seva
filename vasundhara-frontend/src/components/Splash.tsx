'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Splash({ duration = 1500 }: { duration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center animate-fade-in">
        <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
          <Image src="/logo.svg" alt="Vasundhara emblem" width={192} height={192} priority className="drop-shadow-2xl" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-app">Vasundhara</h2>
        <p className="text-emerald-600 mt-2 text-lg font-medium">Sugam Seva</p>
      </div>
    </div>
  );
}
