'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocalItem, capitalizeName } from '@/lib/localInventory';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateProductImage } from '@/lib/productImages';

interface Props {
  item?: LocalItem | null;
  onClose: () => void;
  onSave: (data: Partial<LocalItem>) => void;
}

export default function InventoryModal({ item, onClose, onSave }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '1');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [unit, setUnit] = useState(item?.unit || '');
  const [photo, setPhoto] = useState(item?.photo || '');
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    setName(item?.name || '');
    setCategory(item?.category || '');
    setExpiryDate(item?.expiryDate || '');
    setQuantity(item?.quantity?.toString() || '1');
    setPrice(item?.price?.toString() || '');
    setUnit(item?.unit || '');
    setPhoto(item?.photo || '');
  }, [item]);

  const handleNameBlur = () => {
    setName(prev => capitalizeName(prev));
  };

  const handleCategoryBlur = () => {
    setCategory(prev => capitalizeName(prev));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    setPhotoError(null);
  };

  const handleGeneratePhoto = async () => {
    const itemName = capitalizeName(name);
    if (!itemName) {
      setPhotoError('Enter an item name first.');
      return;
    }

    setGeneratingPhoto(true);
    setPhotoError(null);
    try {
      const imageUrl = await generateProductImage(itemName, category);
      setPhoto(imageUrl);
    } catch (err: any) {
      setPhotoError(err?.message || 'Could not generate product photo.');
    } finally {
      setGeneratingPhoto(false);
    }
  };

  function handleSave() {
    onSave({
      name: capitalizeName(name),
      category: capitalizeName(category),
      expiryDate: expiryDate || null,
      quantity: Number(quantity),
      price: Number(price),
      unit,
      photo
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {item ? t('inventory.modal.editTitle', 'Edit Item') : t('inventory.modal.addTitle', 'Add Item')}
        </h3>
        
        <div className="space-y-4">
          {/* Photo Uploader */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
            {photo ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                  title={t('auth.removePhoto', 'Remove photo')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors w-full h-full py-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{t('inventory.modal.uploadPhoto', 'Upload Product Photo')}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{t('inventory.modal.photoHint', 'PNG, JPG up to 2MB')}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={generatingPhoto}
              onClick={handleGeneratePhoto}
              className="mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              Get Photo From AI
            </Button>
            {photoError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{photoError}</p>
            )}
          </div>

          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            onBlur={handleNameBlur}
            placeholder={t('inventory.modal.itemName', 'Item name')} 
          />
          <Input 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            onBlur={handleCategoryBlur}
            placeholder={t('inventory.modal.category', 'Category')} 
          />
          <Input 
            type="date" 
            value={expiryDate || ''} 
            onChange={(e) => setExpiryDate(e.target.value)} 
            placeholder={t('inventory.modal.expiryDate', 'Expiry date')} 
          />
          
          <div className="flex gap-2">
            <Input 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              placeholder={t('inventory.modal.qty', 'Qty')} 
              className="flex-1" 
            />
            <Input 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              placeholder={t('inventory.modal.unit', 'Unit (kg, g...)')} 
              className="flex-1" 
            />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t('inventory.modal.price', 'Price')}
              className="flex-1"
              icon={<span className="text-gray-500 dark:text-gray-400 font-bold">₹</span>}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <Button variant="outline" onClick={onClose}>{t('inventory.modal.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            {item ? t('inventory.modal.save', 'Save') : t('inventory.modal.add', 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
