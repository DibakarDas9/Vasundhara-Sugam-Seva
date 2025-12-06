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
}

// We no longer use a single static key.
// const STORAGE_KEY = 'vasundhara_local_inventory_v1';

export function useLocalInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<LocalItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Construct user-specific key. If no user, we can use a guest key or just empty.
  // The requirement is "new user everything should be empty".
  // So we strictly bind to user.id.
  const storageKey = user ? `vasundhara_inventory_${user.id}` : null;

  // Load from storage when user changes
  useEffect(() => {
    if (!storageKey) {
      setItems([]);
      setIsLoaded(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to read inventory', err);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Save to storage whenever items change
  useEffect(() => {
    if (!isLoaded || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to write inventory', err);
    }
  }, [items, isLoaded, storageKey]);

  const addItem = useCallback((item: Partial<LocalItem>) => {
    const newItem: LocalItem = {
      id: Date.now(),
      name: item.name || 'New Item',
      category: item.category || 'Uncategorized',
      expiryDate: item.expiryDate ?? null,
      quantity: item.quantity ?? 1,
      unit: item.unit || '',
      addedDate: item.addedDate || new Date().toISOString().slice(0, 10),
      status: item.status || (() => {
        if (!item.expiryDate) return 'good';
        const days = calculateDaysUntilExpiry(item.expiryDate);
        return getExpiryStatus(days);
      })(),
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

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
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const useNow = useCallback((id: number) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const newQty = (it.quantity ?? 1) - 1;
      return { ...it, quantity: newQty > 0 ? newQty : 0 };
    }));
  }, []);

  const clearInventory = useCallback(() => {
    setItems([]);
    // The useEffect will handle the localStorage update.
    // We don't need to manually write to localStorage here, avoiding race conditions.
  }, []);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    useNow,
    clearInventory,
    isLoaded
  } as const;
}
