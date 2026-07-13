import { useEffect, useState, useCallback, useRef } from 'react';
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
  photo?: string;
}

export const capitalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/** Sanitize a raw item from localStorage to ensure all fields are valid */
function sanitizeItem(raw: any): LocalItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null;
  if (!name) return null; // Skip items with no name
  return {
    id: typeof raw.id === 'number' ? raw.id : Date.now(),
    name: capitalizeName(name),
    category: typeof raw.category === 'string' && raw.category.trim() ? capitalizeName(raw.category.trim()) : 'Uncategorized',
    expiryDate: typeof raw.expiryDate === 'string' ? raw.expiryDate : null,
    quantity: typeof raw.quantity === 'number' ? raw.quantity : 1,
    unit: typeof raw.unit === 'string' ? raw.unit : '',
    price: typeof raw.price === 'number' ? raw.price : 0,
    photo: typeof raw.photo === 'string' ? raw.photo : '',
    addedDate: typeof raw.addedDate === 'string' ? raw.addedDate : new Date().toISOString().slice(0, 10),
    status: typeof raw.status === 'string' ? raw.status : 'good',
  };
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
  const { user, guestMode } = useAuth();
  const [items, setItems] = useState<LocalItem[]>([]);
  const [usageLog, setUsageLog] = useState<UsageLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasRevalidatedRef = useRef<Record<string, boolean>>({});

  // Construct user-specific key.
  // If logged in: bind to user.id.
  // If guest mode: use a shared guest key so they can explore freely.
  // Otherwise (no user, no guest): use null = no persistence.
  const storageKey = user
    ? `vasundhara_inventory_${user.id}`
    : guestMode
    ? 'vasundhara_inventory_guest'
    : null;
  const usageLogKey = user
    ? `vasundhara_usage_log_${user.id}`
    : guestMode
    ? 'vasundhara_usage_log_guest'
    : null;
  const notificationsKey = user
    ? `vasundhara_notifications_${user.id}`
    : guestMode
    ? 'vasundhara_notifications_guest'
    : null;

  // Load from storage when user changes or event triggers
  useEffect(() => {
    setIsLoaded(false);

    const loadLocalOnly = () => {
      if (!storageKey) return [];
      try {
        const rawItems = localStorage.getItem(storageKey);
        if (rawItems) {
          const parsed: any[] = JSON.parse(rawItems);
          const sanitized = Array.isArray(parsed)
            ? (parsed.map(sanitizeItem).filter(Boolean) as LocalItem[])
            : [];
          setItems(sanitized);
          return sanitized;
        }
      } catch (err) {
        console.error('Failed to read local inventory cache', err);
      }
      setItems([]);
      return [];
    };

    const loadItems = async (forceRevalidate = false) => {
      if (!storageKey) {
        setItems([]);
        setUsageLog([]);
        setNotifications([]);
        setIsLoaded(true);
        return;
      }

      // --- Migration Logic from Guest to User ---
      // If we are logged in, check if we have items. If not, see if guest has items to migrate.
      if (user && storageKey.startsWith('vasundhara_inventory_')) {
        const userItems = localStorage.getItem(storageKey);
        if (!userItems || JSON.parse(userItems).length === 0) {
          const guestItems = localStorage.getItem('vasundhara_inventory_guest');
          if (guestItems && JSON.parse(guestItems).length > 0) {
            // Migrate guest items to user
            localStorage.setItem(storageKey, guestItems);
            // Optionally clear guest inventory? Let's leave it for now or clear it.
            localStorage.removeItem('vasundhara_inventory_guest');
            console.log('Migrated guest inventory to user inventory.');
          }
        }
      }
      // ------------------------------------------

      // 1. Load from local cache instantly
      const localParsed = loadLocalOnly();

      // Load logs and notifications
      try {
        const rawUsageLog = localStorage.getItem(usageLogKey!);
        setUsageLog(rawUsageLog ? JSON.parse(rawUsageLog) : []);

        const rawNotifications = localStorage.getItem(notificationsKey!);
        setNotifications(rawNotifications ? JSON.parse(rawNotifications) : []);
      } catch (err) {
        console.error('Failed to read local logs/notifications cache', err);
      } finally {
        setIsLoaded(true);
      }

      // 2. Fetch and revalidate from remote backend in background
      const needsRevalidate = forceRevalidate || !hasRevalidatedRef.current[storageKey];
      if (needsRevalidate) {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        if (API_BASE && token && user) {
          try {
            hasRevalidatedRef.current[storageKey] = true;
            const response = await fetch(`${API_BASE}/api/inventory`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.items) {
                const remoteItems = data.items.map(sanitizeItem).filter(Boolean) as LocalItem[];
                
                // Only update state & cache if remote items are actually different
                if (JSON.stringify(remoteItems) !== JSON.stringify(localParsed)) {
                  if (remoteItems.length === 0 && localParsed.length > 0) {
                    // Possible silent fail previously or fresh DB. Sync local to remote instead of wiping local cache.
                    console.log('Remote has 0 items but local has items. Syncing local to remote...');
                    fetch(`${API_BASE}/api/inventory/sync`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ items: localParsed })
                    }).catch(err => console.warn('Sync up failed', err));
                  } else {
                    setItems(remoteItems);
                    localStorage.setItem(storageKey, JSON.stringify(remoteItems));
                  }
                }
              }
            }
          } catch (err) {
            console.warn('Failed to revalidate remote inventory', err);
            // Allow re-attempt next time
            hasRevalidatedRef.current[storageKey] = false;
          }
        }
      }
    };

    loadItems(false);

    const handleStorageChange = (e: StorageEvent) => {
      // Storage events only reload local data (no network revalidation to avoid loops/race conditions)
      if (storageKey && e.key === storageKey) loadLocalOnly();
      if (usageLogKey && e.key === usageLogKey) {
        try {
          const raw = localStorage.getItem(usageLogKey);
          setUsageLog(raw ? JSON.parse(raw) : []);
        } catch {}
      }
      if (notificationsKey && e.key === notificationsKey) {
        try {
          const raw = localStorage.getItem(notificationsKey);
          setNotifications(raw ? JSON.parse(raw) : []);
        } catch {}
      }
    };

    const handleLocalUpdate = () => {
      // Local updates within same tab only reload local data (no network calls)
      loadLocalOnly();
      try {
        const rawLog = localStorage.getItem(usageLogKey!);
        setUsageLog(rawLog ? JSON.parse(rawLog) : []);
        const rawNotif = localStorage.getItem(notificationsKey!);
        setNotifications(rawNotif ? JSON.parse(rawNotif) : []);
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-inventory-update', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-inventory-update', handleLocalUpdate);
    };
  }, [storageKey, usageLogKey, notificationsKey, user]);

  const saveInventory = useCallback((newItems: LocalItem[]) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
      window.dispatchEvent(new Event('local-inventory-update'));

      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (API_BASE && token && user) {
        fetch(`${API_BASE}/api/inventory/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: newItems })
        }).catch(err => console.warn('Background inventory sync failed', err));
      }
    } catch (err) {
      console.error('Failed to write inventory', err);
    }
  }, [storageKey, user]);

  const updateAndSaveItems = useCallback((updater: (prev: LocalItem[]) => LocalItem[]) => {
    setItems(prev => {
      const next = updater(prev);
      saveInventory(next);
      return next;
    });
  }, [saveInventory]);

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
    const capitalizedName = item.name ? capitalizeName(item.name) : 'New Item';
    const cleanBaseName = capitalizedName.replace(/ \((Old|New)\)$/i, '').trim();

    updateAndSaveItems(prev => {
      // Find items with same base name
      const existingItems = prev.filter(
        i => (i.name || '').replace(/ \((Old|New)\)$/i, '').trim().toLowerCase() === cleanBaseName.toLowerCase()
      );

      if (existingItems.length > 0) {
        // Check if there is an item with roughly the same expiry date
        const newExpiryDate = item.expiryDate ? new Date(item.expiryDate).getTime() : null;
        let matchedItem = null;

        for (const exist of existingItems) {
          const existExpiry = exist.expiryDate ? new Date(exist.expiryDate).getTime() : null;
          // If both null, or both same, or diff <= 2 days
          if (newExpiryDate === existExpiry) {
            matchedItem = exist;
            break;
          } else if (newExpiryDate && existExpiry && Math.abs(newExpiryDate - existExpiry) <= 2 * 24 * 60 * 60 * 1000) {
            matchedItem = exist;
            break;
          }
        }

        if (matchedItem) {
          // Merge quantities
          const newQuantity = (matchedItem.quantity || 0) + (item.quantity || 1);
          addNotification(
            'Item Updated',
            `Added ${item.quantity || 1} ${item.unit || matchedItem.unit || 'units'} to existing ${matchedItem.name}. Total: ${newQuantity} ${matchedItem.unit || ''}`,
            'success'
          );
          return prev.map(it =>
            it.id === matchedItem.id
              ? { ...it, quantity: newQuantity, photo: it.photo || item.photo || '' }
              : it
          );
        } else {
          // Expiry dates are different. Mark oldest existing as (Old) and this one as (New)
          const newId = Date.now();
          const newItem: LocalItem = {
            id: newId,
            name: `${cleanBaseName} (New)`,
            category: item.category ? capitalizeName(item.category) : 'Uncategorized',
            expiryDate: item.expiryDate ?? null,
            quantity: item.quantity ?? 1,
            unit: item.unit || '',
            price: item.price ?? 0,
            photo: item.photo || '',
            addedDate: item.addedDate || new Date().toISOString().slice(0, 10),
            status: item.status || (() => {
              if (!item.expiryDate) return 'good';
              const days = calculateDaysUntilExpiry(item.expiryDate);
              return getExpiryStatus(days);
            })(),
          };

          addNotification('Item Added', `${newItem.name} added to inventory`, 'success');

          // Rename existing items that don't have tags to (Old)
          return [
            newItem,
            ...prev.map(it => {
              if (existingItems.some(ei => ei.id === it.id)) {
                if (!it.name.match(/ \((Old|New)\)$/i)) {
                  return { ...it, name: `${it.name} (Old)` };
                }
                if (it.name.match(/ \(New\)$/i)) {
                  // The previous "New" is now "Old"
                  return { ...it, name: it.name.replace(/ \(New\)$/i, ' (Old)') };
                }
              }
              return it;
            })
          ];
        }
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
        photo: item.photo || '',
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
  }, [addNotification, updateAndSaveItems]);

  const updateItem = useCallback((id: number, patch: Partial<LocalItem>) => {
    updateAndSaveItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const mergedPatch = { ...patch };
      if (patch.name !== undefined) {
        mergedPatch.name = capitalizeName(patch.name);
      }
      if (patch.category !== undefined) {
        mergedPatch.category = capitalizeName(patch.category);
      }
      const updated = { ...it, ...mergedPatch } as LocalItem;
      if (patch.expiryDate !== undefined) {
        if (!updated.expiryDate) updated.status = 'good';
        else {
          const days = calculateDaysUntilExpiry(updated.expiryDate);
          updated.status = getExpiryStatus(days);
        }
      }
      return updated;
    }));
  }, [updateAndSaveItems]);

  const deleteItem = useCallback((id: number) => {
    updateAndSaveItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        // Log as waste if deleted and expired
        // For now, simple delete doesn't auto-log waste unless explicit
      }
      return prev.filter(item => item.id !== id);
    });
  }, [updateAndSaveItems]);

  const useNow = useCallback((id: number) => {
    updateAndSaveItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, (item.quantity || 0) - 1);

      // Log usage
      logUsage(item, 1, 'consumed');

      if (newQty === 0) {
        addNotification('Item Out of Stock', `You have used up all ${item.name}.`, 'warning');
      }

      return { ...item, quantity: newQty };
    }));
  }, [logUsage, addNotification, updateAndSaveItems]);

  const consumeItem = useCallback((id: number, amountUsed: number, unitUsed: string) => {
    updateAndSaveItems(prev => prev.map(it => {
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
  }, [logUsage, addNotification, updateAndSaveItems]);

  const restockItem = useCallback((id: number, amountToAdd: number, unitToAdd: string) => {
    updateAndSaveItems(prev => prev.map(it => {
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
  }, [updateAndSaveItems]);

  const clearInventory = useCallback(() => {
    updateAndSaveItems(prev => []);
    setUsageLog([]);
    setNotifications([]);
  }, [updateAndSaveItems]);

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
