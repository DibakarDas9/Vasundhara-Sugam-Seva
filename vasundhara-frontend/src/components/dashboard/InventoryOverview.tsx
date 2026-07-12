'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { getExpiryStatus, calculateDaysUntilExpiry, formatDate } from '@/lib/utils';
import { useLocalInventory } from '@/lib/localInventory';
import { useLanguage } from '@/contexts/LanguageContext';

// Note: InventoryOverview now reads live data from the local inventory hook

const statusConfig = {
  critical: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-600 bg-red-50',
    label: 'Expires Today'
  },
  warning: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-50',
    label: 'Expires Soon'
  },
  caution: {
    color: 'bg-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    label: 'Expires Soon'
  },
  good: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50',
    label: 'Fresh'
  },
};

export function InventoryOverview() {
  const router = useRouter();
  const { t } = useLanguage();
  const { items } = useLocalInventory();
  const totalItems = items.length;
  const criticalItems = items.filter(item => item.status === 'critical').length;
  const warningItems = items.filter(item => item.status === 'warning').length;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return t('inventory.critical', 'Expires Today');
      case 'warning': return t('inventory.warning', 'Expires Soon');
      case 'caution': return t('inventory.caution', 'Expires Soon');
      case 'good': default: return t('inventory.good', 'Fresh');
    }
  };

  function handleAddItem() {
    // navigate to inventory add page (assumption: /inventory/new exists)
    router.push('/inventory');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('dashboard.inventoryOverview', 'Inventory Overview')}</CardTitle>
          <Button size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
            {t('inventory.addItem', 'Add Item')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.stats.total', 'Total Items')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.stats.critical', 'Critical')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.stats.warning', 'Warning')}</div>
            </div>
          </div>

          {/* Recent Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.recentItems', 'Recent Items')}</h4>
            {items.slice(0, 5).map((item) => {
              const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
              const Icon = config.icon;
              const days = item.expiryDate ? calculateDaysUntilExpiry(item.expiryDate) : null;

              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name || 'Unnamed Item'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.expiryDate 
                          ? `${t('dashboard.expiresDate', 'Expires')} ${formatDate(item.expiryDate)}` 
                          : t('dashboard.noExpiry', 'No expiry')
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                    {getStatusLabel(item.status || 'good')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
