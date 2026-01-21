'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocalItem } from '@/lib/localInventory';

interface Props {
  item?: LocalItem | null;
  onClose: () => void;
  onSave: (data: Partial<LocalItem>) => void;
}

export default function InventoryModal({ item, onClose, onSave }: Props) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '1');
  const [price, setPrice] = useState(item?.price?.toString() || '');

  useEffect(() => {
    setName(item?.name || '');
    setCategory(item?.category || '');
    setExpiryDate(item?.expiryDate || '');
    setQuantity(item?.quantity?.toString() || '1');
    setPrice(item?.price?.toString() || '');
  }, [item]);

  function handleSave() {
    onSave({ name, category, expiryDate: expiryDate || null, quantity: Number(quantity), price: Number(price) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{item ? 'Edit Item' : 'Add Item'}</h3>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <Input type="date" value={expiryDate || ''} onChange={(e) => setExpiryDate(e.target.value)} placeholder="Expiry date" />
          <div className="flex gap-2">
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" className="flex-1" />
            <Input value={item?.unit || ''} onChange={(e) => onSave({ ...item, unit: e.target.value })} placeholder="Unit (kg, g...)" className="flex-1" />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="flex-1"
              icon={<span className="text-gray-500 dark:text-gray-400 font-bold">₹</span>}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{item ? 'Save' : 'Add'}</Button>
        </div>
      </div>
    </div>
  );
}
