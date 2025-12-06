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
}

const colorVariants = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'green',
  className 
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
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
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
    </Card>
  );
}
