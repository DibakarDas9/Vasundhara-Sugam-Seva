'use client';

import React, { useState } from 'react';
import AddItemModal from '@/components/inventory/AddItemModal';
import InventoryModal from '@/components/inventory/InventoryModal';
import UseItemModal from '@/components/inventory/UseItemModal';
import { useLocalInventory } from '@/lib/localInventory';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CameraIcon,
  QrCodeIcon,
  XMarkIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { calculateDaysUntilExpiry } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const statusConfig = {
  critical: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30',
    label: 'Expires Today'
  },
  warning: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/30',
    label: 'Expires Soon'
  },
  caution: {
    icon: ClockIcon,
    color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30',
    label: 'Expires This Week'
  },
  good: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30',
    label: 'Fresh'
  },
};

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  );
}

function InventoryContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { items, addItem, updateItem, deleteItem, useNow, consumeItem, restockItem, clearInventory } = useLocalInventory();
  const [editing, setEditing] = useState<number | null>(null);
  const [usingItem, setUsingItem] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  function handleScan() {
    router.push('/scan');
  }

  function handleQRCode() {
    router.push('/scan');
  }

  function handleAddItem() {
    setEditing(null);
    setShowModal(true);
  }

  function handleEditItem(id: number) {
    setEditing(id);
    setShowModal(true);
  }

  function handleUseNow(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Check if item is weighted (kg, g, l, ml)
    const u = (item.unit || '').toLowerCase();
    const isWeighted = ['kg', 'g', 'l', 'ml', 'gram', 'kilogram', 'litre', 'liter'].some(w => u.includes(w));

    if (isWeighted) {
      setUsingItem(id);
    } else {
      // Simple decrement for pieces/packets
      useNow(id);
    }
  }

  function handleAddItemStock(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Check if item is weighted
    const u = (item.unit || '').toLowerCase();
    const isWeighted = ['kg', 'g', 'l', 'ml', 'gram', 'kilogram', 'litre', 'liter'].some(w => u.includes(w));

    if (isWeighted) {
      setAddingItem(id);
    } else {
      // Simple increment for pieces/packets
      restockItem(id, 1, item.unit || '');
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title="Inventory Management"
          subtitle="Track and manage your food items with AI-powered insights"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="caution">Caution</option>
                    <option value="good">Good</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" icon={<CameraIcon className="w-4 h-4" />} onClick={handleScan}>
                  Scan Item
                </Button>
                <Button variant="outline" icon={<QrCodeIcon className="w-4 h-4" />} onClick={handleQRCode}>
                  QR Code
                </Button>
                <Button icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
            </div>

            {/* Full-width destructive clear inventory button (prominent + animated) */}
            <div className="mt-4">
              <Button
                variant="destructive"
                className="w-full sm:w-auto btn-danger clickable"
                onClick={() => {
                  if (!confirm('Are you sure you want to clear your entire inventory? This cannot be undone.')) return;
                  clearInventory();
                  const el = document.querySelector('.btn-danger');
                  if (el) {
                    el.classList.add('animate-bounce-gentle');
                    setTimeout(() => el.classList.remove('animate-bounce-gentle'), 800);
                  }
                }}
              >
                Clear Inventory
              </Button>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
                const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate || '1970-01-01');

                return (
                  <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.expiryDate && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                              {config.label}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item.id);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit item"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // simple confirm before deleting
                              if (confirm(`Remove "${item.name}" from inventory?`)) {
                                deleteItem(item.id);
                                // close modal if editing this item
                                if (editing === item.id) setShowModal(false);
                              }
                            }}
                            aria-label={`Remove ${item.name}`}
                            title="Remove item"
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.category}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                          <span className="font-medium dark:text-gray-200">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Price:</span>
                          <span className="font-medium dark:text-gray-200">{item.price ? `₹${item.price}` : '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Unit Cost:</span>
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            {item.price && item.quantity ? `₹${(item.price / item.quantity).toFixed(2)} / ${item.unit || 'unit'}` : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <span className="font-medium dark:text-gray-200">{item.expiryDate || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Days left:</span>
                          <span className={`font-medium ${!item.expiryDate ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry < 0 ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry === 0 ? 'text-red-600 dark:text-red-400' : daysUntilExpiry <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {!item.expiryDate ? 'Enter expiry' : daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry === 0 ? 'Expires today' : daysUntilExpiry === 1 ? '1 day' : `${daysUntilExpiry} days`}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20" onClick={() => handleAddItemStock(item.id)}>
                          Add
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleUseNow(item.id)}>
                          Use Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Start by adding your first food item to track'
                    }
                  </p>
                  <Button icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
                    Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            )}

            {showModal && (
              <InventoryModal
                item={editing ? items.find(i => i.id === editing) || null : null}
                onClose={() => setShowModal(false)}
                onSave={(data) => {
                  if (editing) updateItem(editing, data);
                  else addItem(data);
                }}
              />
            )}

            {/* Partial Usage Modal */}
            {usingItem && (
              <UseItemModal
                item={items.find(i => i.id === usingItem)!}
                onClose={() => setUsingItem(null)}
                onConfirm={(amount, unit) => {
                  consumeItem(usingItem, amount, unit);
                }}
              />
            )}

            {/* Add Stock Modal */}
            {addingItem && (
              <AddItemModal
                item={items.find(i => i.id === addingItem)!}
                onClose={() => setAddingItem(null)}
                onConfirm={(amount, unit) => {
                  restockItem(addingItem, amount, unit);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
