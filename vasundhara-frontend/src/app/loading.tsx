'use client';

import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-[9999]">
            <AnimatedLogo size={120} className="mb-8" />
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 animate-pulse">
                    Vasundhara
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                    Sugam Seva
                </p>
            </div>
        </div>
    );
}
