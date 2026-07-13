'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  className?: string;
  premiumOnly?: boolean;
  isPremium?: boolean;
}

const colorVariants = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

import { SparklesIcon } from '@heroicons/react/24/outline';

export function StatsCard({
  title,
  value,
  change,
  icon,
  color = 'green',
  className,
  premiumOnly,
  isPremium
}: StatsCardProps) {
  const isLocked = premiumOnly && !isPremium;

  return (
    <Card className={cn('relative overflow-hidden hover:shadow-lg transition-all duration-200', className)}>
      <CardContent className={cn("p-6", isLocked && "blur-[2px] opacity-60 select-none pointer-events-none")}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center',
            colorVariants[color]
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>

      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-white shadow-md">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">Premium</span>
          </div>
        </div>
      )}
    </Card>
  );
}
