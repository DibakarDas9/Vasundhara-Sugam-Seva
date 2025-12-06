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
    icon: ClockIcon, 
    color: 'text-orange-600 bg-orange-50', 
    label: 'Expires This Week' 
  },
  good: { 
    icon: CheckCircleIcon, 
    color: 'text-green-600 bg-green-50', 
    label: 'Fresh' 
  },
};

export function InventoryOverview() {
  const router = useRouter();
  const { items } = useLocalInventory();
  const totalItems = items.length;
  const criticalItems = items.filter(item => item.status === 'critical').length;
  const warningItems = items.filter(item => item.status === 'warning').length;

  function handleAddItem() {
    // navigate to inventory add page (assumption: /inventory/new exists)
    router.push('/inventory');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Overview</CardTitle>
          <Button size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningItems}</div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
          </div>

          {/* Recent Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Recent Items</h4>
            {items.slice(0, 5).map((item) => {
              const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
              const Icon = config.icon;
              const days = item.expiryDate ? calculateDaysUntilExpiry(item.expiryDate) : null;

              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.expiryDate ? `Expires ${formatDate(item.expiryDate)}` : 'No expiry'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                    {config.label}
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
