import { useEffect, useState, useCallback } from 'react';
import { calculateDaysUntilExpiry, getExpiryStatus } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export interface LocalItem {
  id: number;
  name: string;
  category?: string;
  expiryDate?: string | null;
  quantity?: number;
  unit?: string;
  addedDate?: string;
  status?: string;
  price?: number;
}

export interface UsageLog {
  id: string;
  itemId: number;
  itemName: string;
  amount: number;
  unit: string;
  value: number;
  date: string;
  type: 'consumed' | 'waste';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  kind: 'success' | 'warning' | 'info';
  read: boolean;
}

export function useLocalInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<LocalItem[]>([]);
  const [usageLog, setUsageLog] = useState<UsageLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Construct user-specific key. If no user, we can use a guest key or just empty.
  // The requirement is "new user everything should be empty".
  // So we strictly bind to user.id.
  const storageKey = user ? `vasundhara_inventory_${user.id}` : null;
  const usageLogKey = user ? `vasundhara_usage_log_${user.id}` : null;
  const notificationsKey = user ? `vasundhara_notifications_${user.id}` : null;

  // Load from storage when user changes or event triggers
  useEffect(() => {
    const loadItems = () => {
      if (!storageKey) {
        setItems([]);
        setUsageLog([]);
        setNotifications([]);
        setIsLoaded(true);
        return;
      }
      try {
        const rawItems = localStorage.getItem(storageKey);
        if (rawItems) {
          setItems(JSON.parse(rawItems));
        } else {
          setItems([]);
        }

        const rawUsageLog = localStorage.getItem(usageLogKey!);
        if (rawUsageLog) {
          setUsageLog(JSON.parse(rawUsageLog));
        } else {
          setUsageLog([]);
        }

        const rawNotifications = localStorage.getItem(notificationsKey!);
        if (rawNotifications) {
          setNotifications(JSON.parse(rawNotifications));
        } else {
          setNotifications([]);
        }

      } catch (err) {
        console.error('Failed to read inventory data', err);
        setItems([]);
        setUsageLog([]);
        setNotifications([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadItems();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) loadItems();
      if (e.key === usageLogKey) loadItems();
      if (e.key === notificationsKey) loadItems();
    };

    const handleLocalUpdate = () => loadItems();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-inventory-update', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-inventory-update', handleLocalUpdate);
    };
  }, [storageKey, usageLogKey, notificationsKey]);

  // Save to storage whenever items change
  useEffect(() => {
    if (!isLoaded || !storageKey) return;
    try {
      const currentStored = localStorage.getItem(storageKey);
      const newString = JSON.stringify(items);

      // Only write and dispatch if actually changed to avoid loops
      if (currentStored !== newString) {
        localStorage.setItem(storageKey, newString);
        window.dispatchEvent(new Event('local-inventory-update'));
      }
    } catch (err) {
      console.error('Failed to write inventory', err);
    }
  }, [items, isLoaded, storageKey]);

  // Save usage log
  useEffect(() => {
    if (!isLoaded || !usageLogKey) return;
    try {
      const currentStored = localStorage.getItem(usageLogKey);
      const newString = JSON.stringify(usageLog);
      if (currentStored !== newString) {
        localStorage.setItem(usageLogKey, newString);
        window.dispatchEvent(new Event('local-inventory-update')); // Dispatch general update
      }
    } catch (err) {
      console.error('Failed to write usage log', err);
    }
  }, [usageLog, isLoaded, usageLogKey]);

  // Save notifications
  useEffect(() => {
    if (!isLoaded || !notificationsKey) return;
    try {
      const currentStored = localStorage.getItem(notificationsKey);
      const newString = JSON.stringify(notifications);
      if (currentStored !== newString) {
        localStorage.setItem(notificationsKey, newString);
        window.dispatchEvent(new Event('local-inventory-update')); // Dispatch general update
      }
    } catch (err) {
      console.error('Failed to write notifications', err);
    }
  }, [notifications, isLoaded, notificationsKey]);

  const addNotification = useCallback((title: string, message: string, kind: 'success' | 'warning' | 'info' = 'info') => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      kind,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const logUsage = useCallback((item: LocalItem, amount: number, type: 'consumed' | 'waste') => {
    const value = (item.price && item.quantity) ? (item.price / item.quantity) * amount : 0;
    const newLog: UsageLog = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      amount,
      unit: item.unit || 'units',
      value: value || 0,
      date: new Date().toISOString(),
      type
    };
    setUsageLog(prev => [newLog, ...prev]);
  }, []);

  const addItem = useCallback((item: Partial<LocalItem>) => {
    // Capitalize first letter of product name (handle multi-word names properly)
    const capitalizeName = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const capitalizedName = item.name ? capitalizeName(item.name) : 'New Item';

    // Check for existing item (case-insensitive) and merge quantities
    setItems(prev => {
      const existingItem = prev.find(
        i => i.name.toLowerCase() === capitalizedName.toLowerCase()
      );

      if (existingItem) {
        // Merge quantities instead of creating duplicate
        const newQuantity = (existingItem.quantity || 0) + (item.quantity || 1);

        // Add notification about merging
        addNotification(
          'Item Updated',
          `Added ${item.quantity || 1} ${item.unit || existingItem.unit || 'units'} to existing ${existingItem.name}. Total: ${newQuantity} ${existingItem.unit || ''}`,
          'success'
        );

        // Update the quantity of existing item
        return prev.map(it =>
          it.id === existingItem.id
            ? { ...it, quantity: newQuantity }
            : it
        );
      }

      // Create new item if no duplicate found
      const newItem: LocalItem = {
        id: Date.now(),
        name: capitalizedName,
        category: item.category ? capitalizeName(item.category) : 'Uncategorized',
        expiryDate: item.expiryDate ?? null,
        quantity: item.quantity ?? 1,
        unit: item.unit || '',
        price: item.price ?? 0,
        addedDate: item.addedDate || new Date().toISOString().slice(0, 10),
        status: item.status || (() => {
          if (!item.expiryDate) return 'good';
          const days = calculateDaysUntilExpiry(item.expiryDate);
          return getExpiryStatus(days);
        })(),
      };

      // Add notification about new item
      addNotification(
        'Item Added',
        `${newItem.name} added to inventory`,
        'success'
      );

      return [newItem, ...prev];
    });

    // Return a mock item since we can't easily return the actual item from setItems
    // The actual item will be in state after the update
    return { id: Date.now(), name: capitalizedName } as LocalItem;
  }, [addNotification]);

  const updateItem = useCallback((id: number, patch: Partial<LocalItem>) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, ...patch } as LocalItem;
      if (patch.expiryDate !== undefined) {
        if (!updated.expiryDate) updated.status = 'good';
        else {
          const days = calculateDaysUntilExpiry(updated.expiryDate);
          updated.status = getExpiryStatus(days);
        }
      }
      return updated;
    }));
  }, []);

  const deleteItem = useCallback((id: number) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        // Log as waste if deleted and expired
        // For now, simple delete doesn't auto-log waste unless explicit
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const useNow = useCallback((id: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, (item.quantity || 0) - 1);

      // Log usage
      logUsage(item, 1, 'consumed');

      if (newQty === 0) {
        addNotification('Item Out of Stock', `You have used up all ${item.name}.`, 'warning');
      }

      return { ...item, quantity: newQty };
    }));
  }, [logUsage, addNotification]);

  const consumeItem = useCallback((id: number, amountUsed: number, unitUsed: string) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;

      let currentQty = it.quantity || 0;
      const currentUnit = (it.unit || '').toLowerCase();
      const usedUnit = unitUsed.toLowerCase();

      let deduction = amountUsed;

      // Unit Conversion Logic
      // 1. Same unit
      if (currentUnit === usedUnit) {
        deduction = amountUsed;
      }
      // 2. kg -> g (User used grams from kg stock)
      else if (currentUnit === 'kg' && usedUnit === 'g') {
        deduction = amountUsed / 1000;
      }
      // 3. g -> kg (User used kg from g stock)
      else if (currentUnit === 'g' && usedUnit === 'kg') {
        deduction = amountUsed * 1000;
      }
      // 4. l -> ml
      else if (currentUnit === 'l' && usedUnit === 'ml') {
        deduction = amountUsed / 1000;
      }
      // 5. ml -> l
      else if (currentUnit === 'ml' && usedUnit === 'l') {
        deduction = amountUsed * 1000;
      }

      const newQty = Math.max(0, currentQty - deduction);

      // Log usage
      logUsage(it, deduction, 'consumed');

      if (newQty === 0) {
        addNotification('Item Out of Stock', `You have used up all ${it.name}.`, 'warning');
      }

      // Optional: Auto-switch unit if quantity becomes small (e.g. 0.5kg -> 500g)
      // For now, keep original unit to avoid confusion

      return { ...it, quantity: parseFloat(newQty.toFixed(3)) };
    }));
  }, [logUsage, addNotification]);

  const restockItem = useCallback((id: number, amountToAdd: number, unitToAdd: string) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;

      let currentQty = it.quantity || 0;
      const currentUnit = (it.unit || '').toLowerCase();
      const addUnit = unitToAdd.toLowerCase();

      let addition = amountToAdd;

      // Unit Conversion Logic (same as consume but adding)
      if (currentUnit === addUnit) {
        addition = amountToAdd;
      }
      else if (currentUnit === 'kg' && addUnit === 'g') {
        addition = amountToAdd / 1000;
      }
      else if (currentUnit === 'g' && addUnit === 'kg') {
        addition = amountToAdd * 1000;
      }
      else if (currentUnit === 'l' && addUnit === 'ml') {
        addition = amountToAdd / 1000;
      }
      else if (currentUnit === 'ml' && addUnit === 'l') {
        addition = amountToAdd * 1000;
      }

      const newQty = currentQty + addition;

      return { ...it, quantity: parseFloat(newQty.toFixed(3)) };
    }));
  }, []);

  const clearInventory = useCallback(() => {
    setItems([]);
    setUsageLog([]);
    setNotifications([]);
    // The useEffect will handle the localStorage update.
    // We don't need to manually write to localStorage here, avoiding race conditions.
  }, []);

  return {
    items,
    usageLog,
    notifications,
    addItem,
    updateItem,
    deleteItem,
    useNow,
    consumeItem,
    restockItem,
    clearInventory,
    addNotification,
    markNotificationRead,
    clearNotifications,
    isLoaded
  } as const;
}
