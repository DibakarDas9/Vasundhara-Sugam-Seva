'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddItemModal from '@/components/inventory/AddItemModal';
import InventoryModal from '@/components/inventory/InventoryModal';
import UseItemModal from '@/components/inventory/UseItemModal';
import { useLocalInventory } from '@/lib/localInventory';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  QrCodeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { calculateDaysUntilExpiry } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { generateProductImage } from '@/lib/productImages';
import { toast } from 'react-hot-toast';
import { loadMarketplaceListings, saveMarketplaceListings } from '@/lib/marketplaceStore';

function getSessionGuestId(): string {
  if (typeof window === 'undefined') return 'local-user';
  let guestId = localStorage.getItem('vasundhara_guest_session_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('vasundhara_guest_session_id', guestId);
  }
  return guestId;
}

const statusConfig = {
  critical: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30',
    label: 'Expires Today',
  },
  warning: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/30',
    label: 'Expires Soon',
  },
  caution: {
    icon: ClockIcon,
    color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30',
    label: 'Expires This Week',
  },
  good: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30',
    label: 'Fresh',
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
  const { t } = useLanguage();
  const router = useRouter();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical':
        return t('inventory.critical', 'Expires Today');
      case 'warning':
        return t('inventory.warning', 'Expires Soon');
      case 'caution':
        return t('inventory.caution', 'Expires This Week');
      case 'good':
      default:
        return t('inventory.good', 'Fresh');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { items, addItem, updateItem, deleteItem, useNow, consumeItem, restockItem, clearInventory } = useLocalInventory();
  const [editing, setEditing] = useState<number | null>(null);
  const [usingItem, setUsingItem] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState<number | null>(null);
  const [sharingItem, setSharingItem] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingPhotoFor, setGeneratingPhotoFor] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');

  function handleShareItem(id: number) {
    setSharingItem(id);
  }

  function handleAddItem() {
    setEditing(null);
    setShowModal(true);
  }

  function handleOpenVardFoodScanner() {
    router.push('/ai-scan');
  }

  function handleEditItem(id: number) {
    setEditing(id);
    setShowModal(true);
  }

  function handleUseNow(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const u = (item.unit || '').toLowerCase();
    const isWeighted = ['kg', 'g', 'l', 'ml', 'gram', 'kilogram', 'litre', 'liter'].some(w => u.includes(w));

    if (isWeighted) {
      setUsingItem(id);
    } else {
      useNow(id);
    }
  }

  function handleAddItemStock(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const u = (item.unit || '').toLowerCase();
    const isWeighted = ['kg', 'g', 'l', 'ml', 'gram', 'kilogram', 'litre', 'liter'].some(w => u.includes(w));

    if (isWeighted) {
      setAddingItem(id);
    } else {
      restockItem(id, 1, item.unit || '');
    }
  }

  async function handleGenerateItemPhoto(id: number) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setGeneratingPhotoFor(id);
    try {
      const imageUrl = await generateProductImage(item.name, item.category);
      updateItem(id, { photo: imageUrl });
      toast.success(`AI photo added for ${item.name}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not generate product photo');
    } finally {
      setGeneratingPhotoFor(null);
    }
  }

  const filteredItems = items.filter(item => {
    const itemName = item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (item.status || 'good') === filterStatus;
    const matchesCategory = filterCategory === 'all' || (item.category || '') === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(item => item.category || 'Uncategorized')));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={t('inventory.title', 'Inventory Management')}
          subtitle={t('inventory.subtitle', 'Track and manage your food items with AI-powered insights')}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder={t('inventory.searchPlaceholder', 'Search items...')}
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
                    <option value="all">{t('inventory.allStatus', 'All Status')}</option>
                    <option value="critical">{t('inventory.critical', 'Expires Today')}</option>
                    <option value="warning">{t('inventory.warning', 'Expires Soon')}</option>
                    <option value="caution">{t('inventory.caution', 'Expires This Week')}</option>
                    <option value="good">{t('inventory.good', 'Fresh')}</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">{t('inventory.allCategories', 'All Categories')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setViewMode('tile')}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${viewMode === 'tile'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800'
                    }`}
                    title="Tile view"
                    aria-label="Tile view"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800'
                    }`}
                    title="List view"
                    aria-label="List view"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
                <Button icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
                  {t('inventory.addItem', 'Add Item')}
                </Button>
                <Button
                  variant="outline"
                  icon={<QrCodeIcon className="w-4 h-4" />}
                  onClick={handleOpenVardFoodScanner}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                >
                  Vard Food Scanner
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="destructive"
                className="w-full sm:w-auto btn-danger clickable"
                onClick={() => {
                  if (!confirm(t('inventory.confirmClear', 'Are you sure you want to clear your entire inventory? This cannot be undone.'))) return;
                  clearInventory();
                  const el = document.querySelector('.btn-danger');
                  if (el) {
                    el.classList.add('animate-bounce-gentle');
                    setTimeout(() => el.classList.remove('animate-bounce-gentle'), 800);
                  }
                }}
              >
                {t('inventory.clearInventory', 'Clear Inventory')}
              </Button>
            </div>

            {viewMode === 'tile' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
                  const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate || '1970-01-01');

                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          {item.photo ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-150 dark:border-gray-800 shadow-sm flex-shrink-0">
                              <img src={item.photo} alt={item.name || 'Product'} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-start gap-1.5">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">
                                  {(item.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateItemPhoto(item.id);
                                }}
                                disabled={generatingPhotoFor === item.id}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                                title="Generate product photo with AI"
                              >
                                <SparklesIcon className="w-3 h-3" />
                                {generatingPhotoFor === item.id ? 'Generating...' : 'AI photo'}
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {item.expiryDate && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                                {getStatusLabel(item.status || 'good')}
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
                                if (confirm(t('inventory.confirmDelete', `Remove "${item.name}" from inventory?`))) {
                                  deleteItem(item.id);
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
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.name || 'Unnamed Item'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.category || 'Uncategorized'}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('inventory.quantity', 'Quantity')}:</span>
                            <span className="font-medium dark:text-gray-200">{item.quantity} {item.unit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('inventory.price', 'Price')}:</span>
                            <span className="font-medium dark:text-gray-200">{item.price ? `₹${item.price}` : '-'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('inventory.unitCost', 'Unit Cost')}:</span>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              {item.price && item.quantity ? `₹${(item.price / item.quantity).toFixed(2)} / ${item.unit || 'unit'}` : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('inventory.expires', 'Expires')}:</span>
                            <span className="font-medium dark:text-gray-200">{item.expiryDate || '-'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('inventory.daysLeft', 'Days left')}:</span>
                            <span className={`font-medium ${!item.expiryDate ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry < 0 ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry === 0 ? 'text-red-600 dark:text-red-400' : daysUntilExpiry <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                              {!item.expiryDate
                                ? t('inventory.enterExpiry', 'Enter expiry')
                                : daysUntilExpiry < 0
                                ? t('inventory.expired', 'Expired')
                                : daysUntilExpiry === 0
                                ? t('inventory.expiresToday', 'Expires today')
                                : daysUntilExpiry === 1
                                ? t('inventory.day', '1 day')
                                : `${daysUntilExpiry} ${t('inventory.days', 'days')}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20" onClick={() => handleAddItemStock(item.id)}>
                            {t('inventory.add', 'Add')}
                          </Button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareItem(item.id);
                            }}
                            className="inline-flex h-9 px-3.5 items-center justify-center rounded-lg border border-amber-200 bg-amber-50/20 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 text-xs font-bold transition"
                            title="List on Marketplace"
                          >
                            Share
                          </button>
                          <Button size="sm" className="flex-1" onClick={() => handleUseNow(item.id)}>
                            {t('inventory.useNow', 'Use Now')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1040px] space-y-2 pb-1">
                <div className="grid grid-cols-[minmax(250px,1.35fr)_100px_92px_82px_104px_92px_92px_170px] gap-2 px-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <div>{t('inventory.item', 'Item')}</div>
                  <div>{t('inventory.category', 'Category')}</div>
                  <div>{t('inventory.quantity', 'Quantity')}</div>
                  <div>{t('inventory.price', 'Price')}</div>
                  <div>{t('inventory.expires', 'Expires On')}</div>
                  <div>{t('inventory.daysLeft', 'Days Left')}</div>
                  <div>{t('inventory.status', 'Status')}</div>
                  <div className="text-right">{t('inventory.actions', 'Actions')}</div>
                </div>
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
                  const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate || '1970-01-01');

                  return (
                    <Card key={item.id} className="overflow-hidden border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-neutral-950">
                      <CardContent className="px-3 py-2">
                        <div className="grid min-w-[1040px] grid-cols-[minmax(250px,1.35fr)_100px_92px_82px_104px_92px_92px_170px] items-center gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {item.photo ? (
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                                <img src={item.photo} alt={item.name || 'Product'} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-blue-500 shadow-sm">
                                <span className="text-[10px] font-bold text-white">
                                  {(item.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name || 'Unnamed Item'}</h3>
                                {item.expiryDate && (
                                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
                                    {getStatusLabel(item.status || 'good')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <span className={`inline-flex h-6.5 w-6.5 items-center justify-center rounded-full border ${config.color}`}>
                              <span className="text-[10px] font-semibold">{(item.category || 'U').charAt(0).toUpperCase()}</span>
                            </span>
                            <span className="truncate text-sm">{item.category || 'Uncategorized'}</span>
                          </div>

                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.quantity} {item.unit}</div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.price ? `₹${item.price}` : '-'}</div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.expiryDate || '-'}</div>
                          <div className={`text-sm font-semibold ${!item.expiryDate ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry < 0 ? 'text-gray-500 dark:text-gray-400' : daysUntilExpiry === 0 ? 'text-red-600 dark:text-red-400' : daysUntilExpiry <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {!item.expiryDate
                              ? t('inventory.enterExpiry', 'Enter expiry')
                              : daysUntilExpiry < 0
                              ? t('inventory.expired', 'Expired')
                              : daysUntilExpiry === 0
                              ? t('inventory.expiresToday', 'Expires today')
                              : daysUntilExpiry === 1
                              ? t('inventory.day', '1 day')
                              : `${daysUntilExpiry} ${t('inventory.days', 'days')}`}
                          </div>
                          <div>
                            {item.expiryDate && (
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
                                {getStatusLabel(item.status || 'good')}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareItem(item.id);
                                }}
                                className="inline-flex h-8.5 px-2.5 items-center justify-center rounded-md border border-amber-200 bg-amber-50/20 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 text-xs font-bold transition"
                                title="List on Marketplace"
                              >
                                Share
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item.id);
                                }}
                                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-200 dark:hover:bg-neutral-800"
                                title="Edit item"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(t('inventory.confirmDelete', `Remove "${item.name}" from inventory?`))) {
                                    deleteItem(item.id);
                                    if (editing === item.id) setShowModal(false);
                                  }
                                }}
                                aria-label={`Remove ${item.name}`}
                                title="Remove item"
                                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:bg-neutral-900 dark:text-red-300 dark:hover:bg-red-900/20"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            <Button size="sm" className="h-8.5 px-4" onClick={() => handleUseNow(item.id)}>
                              {t('inventory.useNow', 'Use Now')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              </div>
            )}

            {filteredItems.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('inventory.noItems', 'No items found')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                      ? t('inventory.noItemsDetailFilters', 'Try adjusting your search or filters')
                      : t('inventory.noItemsDetailEmpty', 'Start by adding your first food item to track')}
                  </p>
                  <Button icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
                    {t('inventory.addFirstItem', 'Add Your First Item')}
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

            {usingItem && (
              <UseItemModal
                item={items.find(i => i.id === usingItem)!}
                onClose={() => setUsingItem(null)}
                onConfirm={(amount, unit) => {
                  consumeItem(usingItem, amount, unit);
                }}
              />
            )}

            {addingItem && (
              <AddItemModal
                item={items.find(i => i.id === addingItem)!}
                onClose={() => setAddingItem(null)}
                onConfirm={(amount, unit) => {
                  restockItem(addingItem, amount, unit);
                }}
              />
            )}

            {sharingItem !== null && (
              <MarketplaceShareVerificationModal
                item={items.find(i => i.id === sharingItem)!}
                onClose={() => setSharingItem(null)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface MarketplaceShareVerificationModalProps {
  item: any;
  onClose: () => void;
}

function MarketplaceShareVerificationModal({ item, onClose }: MarketplaceShareVerificationModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('vasundhara_marketplace_location') || '' : '';
  
  const validCategories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Protein', 'Bakery', 'Packaged Food', 'Beverages', 'Other'];
  let matchedCategory = 'Other';
  if (item.category) {
    const found = validCategories.find(c => c.toLowerCase() === item.category.toLowerCase());
    if (found) matchedCategory = found;
  }

  const [itemName, setItemName] = useState(item.name || '');
  const [expiryDate, setExpiryDate] = useState(item.expiryDate || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(matchedCategory);
  const [location, setLocation] = useState(savedLocation);
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [image, setImage] = useState(item.photo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleUseFormFetchLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const getCoords = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            reject,
            { timeout: 10000 }
          );
        });
      };
      
      const reverseGeocode = async (coords: { lat: number; lng: number }) => {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`);
        const data = await response.json();
        return [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', ');
      };

      const coords = await getCoords();
      const name = await reverseGeocode(coords);
      setLocation(name || `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`);
    } catch {
      toast.error('Unable to fetch your location automatically.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleConfirmShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !expiryDate || !location.trim() || !phone.trim()) {
      toast.error('Item name, expiry date, location, and mobile number are required.');
      return;
    }

    const priceNum = isFree ? 0 : (Number(price) || 0);
    const finalFree = isFree || priceNum === 0;

    setIsSubmitting(true);
    try {
      const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Marketplace user';
      const listingPayload = {
        title: itemName.trim(),
        expiryDate,
        location: location.trim(),
        postedBy: ownerName,
        category,
        price: priceNum,
        isFree: finalFree,
        image: image || undefined,
        ownerId: user?.id || getSessionGuestId(),
        phone: phone.trim() || user?.phoneNumber || '',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('vasundhara_marketplace_location', location.trim());
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      const fallbackListing = {
        id: `market_${Date.now()}`,
        title: listingPayload.title,
        description: `Expires on ${expiryDate}`,
        category: listingPayload.category,
        quantity: 1,
        unit: 'item',
        price: priceNum,
        originalPrice: priceNum,
        location: listingPayload.location,
        postedBy: ownerName,
        postedTime: 'Just now',
        image: listingPayload.image || '/hero-slides/marketplace.png',
        isFree: finalFree,
        rating: 5,
        pickupTime: expiryDate,
        ownerId: user?.id || getSessionGuestId(),
        ownerRole: (user?.role || 'household') as any,
        coordinates: { lat: 0, lng: 0 },
        radiusKm: 0,
        status: 'available' as any,
        createdAt: Date.now(),
        phone: listingPayload.phone,
      };

      if (API_BASE) {
        try {
          const response = await fetch(`${API_BASE}/api/marketplace`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listingPayload),
          });
          if (!response.ok) throw new Error('Marketplace save failed');
        } catch {
          const existingListings = loadMarketplaceListings();
          saveMarketplaceListings([fallbackListing, ...existingListings]);
        }
      } else {
        const existingListings = loadMarketplaceListings();
        saveMarketplaceListings([fallbackListing, ...existingListings]);
      }

      toast.success('Successfully listed on Marketplace!');
      onClose();
    } catch {
      toast.error('Failed to share item on marketplace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    itemName.trim() &&
    expiryDate &&
    location.trim() &&
    phone.trim() &&
    (isFree || (price.trim() && Number(price) > 0))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b pb-3 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Marketplace Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review and verify the details before listing this item</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleConfirmShare} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
            <Input
              label="Expiry date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-900 dark:text-white"
                required
              >
                {validCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Pricing
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (Number(e.target.value) > 0) setIsFree(false);
                      else setIsFree(true);
                    }}
                    disabled={isFree}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-neutral-950 dark:disabled:text-neutral-600 transition"
                  />
                </div>
                <Button
                  type="button"
                  variant={isFree ? 'solid' : 'outline'}
                  onClick={() => {
                    const nextFree = !isFree;
                    setIsFree(nextFree);
                    if (nextFree) setPrice('');
                  }}
                  className={isFree ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                >
                  {isFree ? '✓ Free' : 'Set Free'}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="Location"
              placeholder="Enter area, society, locality or ward"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="outline"
              icon={<MapPinIcon className="h-4 w-4" />}
              loading={isFetchingLocation}
              onClick={handleUseFormFetchLocation}
            >
              Auto fetch
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Mobile number"
              type="tel"
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Product image
            </label>
            <div className="flex items-center gap-4">
              {image ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex-shrink-0 shadow-md">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center bg-gray-50/50 dark:bg-neutral-900/50 text-gray-400 hover:text-emerald-600 transition-colors shadow-sm">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-semibold">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
              <div className="text-xs text-gray-500">
                You can keep the inventory photo or upload a new one. Max size 2MB.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} loading={isSubmitting}>
              List on Marketplace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
