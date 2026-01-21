import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocalItem } from '@/lib/localInventory';

interface Props {
    item: LocalItem;
    onClose: () => void;
    onConfirm: (amount: number, unit: string) => void;
}

export default function AddItemModal({ item, onClose, onConfirm }: Props) {
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState(item.unit || 'units');

    // Smart unit suggestions based on item unit
    const getUnitOptions = (baseUnit: string) => {
        const u = baseUnit.toLowerCase();
        if (['kg', 'kilogram', 'g', 'gram'].includes(u)) return ['kg', 'g'];
        if (['l', 'litre', 'ml', 'millilitre'].includes(u)) return ['l', 'ml'];
        return [baseUnit];
    };

    const unitOptions = getUnitOptions(item.unit || '');

    const handleConfirm = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onConfirm(val, unit);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Add Stock: {item.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Current Stock: {item.quantity} {item.unit}
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Amount to Add</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="e.g. 1"
                                className="flex-1"
                                autoFocus
                            />
                            <select
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            >
                                {unitOptions.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                            Add Stock
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
