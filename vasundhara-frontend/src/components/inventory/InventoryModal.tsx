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

  useEffect(() => {
    setName(item?.name || '');
    setCategory(item?.category || '');
    setExpiryDate(item?.expiryDate || '');
    setQuantity(item?.quantity?.toString() || '1');
  }, [item]);

  function handleSave() {
    onSave({ name, category, expiryDate: expiryDate || null, quantity: Number(quantity) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{item ? 'Edit Item' : 'Add Item'}</h3>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <Input value={expiryDate || ''} onChange={(e) => setExpiryDate(e.target.value)} placeholder="Expiry date (YYYY-MM-DD)" />
          <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{item ? 'Save' : 'Add'}</Button>
        </div>
      </div>
    </div>
  );
}
