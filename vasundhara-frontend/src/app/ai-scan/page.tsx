'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useLocalInventory } from '@/lib/localInventory';
import { detectFoodFromImage, DetectedFoodItem } from '@/lib/vardVision';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'react-hot-toast';
import {
  CameraIcon,
  PhotoIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_COLORS: Record<string, string> = {
  Fruit:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Vegetable:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Dairy:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Grain:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Protein:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Beverage:   'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Packaged:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Snack:      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Spice:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Other:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function AiScanPage() {
  return (
    <ProtectedRoute>
      <AiScanContent />
    </ProtectedRoute>
  );
}

function AiScanContent() {
  const { addItem } = useLocalInventory();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [detecting, setDetecting] = useState(false);
  const [results, setResults] = useState<DetectedFoodItem[] | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addedCount, setAddedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [camActive, setCamActive] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ---------- Image handling ----------
  const loadFile = (file: File) => {
    setError(null);
    setResults(null);
    setSelected(new Set());
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setImageMime(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
  };

  // ---------- Camera ----------
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCamActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError('Camera access denied. Please allow camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setImagePreview(dataUrl);
    setImageMime('image/jpeg');
    setResults(null);
    setSelected(new Set());
    stopCamera();
  };

  // ---------- Detection ----------
  const detect = async () => {
    if (!imagePreview) return;
    setDetecting(true);
    setError(null);
    setResults(null);
    try {
      const result = await detectFoodFromImage(imagePreview, imageMime);
      if (result.error) {
        setError(result.error);
      } else if (result.items.length === 0) {
        setError('No food items detected. Try a clearer image with better lighting.');
      } else {
        setResults(result.items);
        setSelected(new Set(result.items.map((_, i) => i)));
      }
    } finally {
      setDetecting(false);
    }
  };

  // ---------- Editing ----------
  const updateItem = (idx: number, patch: Partial<DetectedFoodItem>) => {
    setResults(prev => prev ? prev.map((it, i) => i === idx ? { ...it, ...patch } : it) : prev);
  };

  // ---------- Add to inventory ----------
  const addSelected = () => {
    if (!results) return;
    let count = 0;
    results.forEach((item, idx) => {
      if (!selected.has(idx)) return;
      addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate || undefined,
        price: 0,
        photo: imagePreview || '',
      });
      count++;
    });
    setAddedCount(c => c + count);
    toast.success(`${count} item${count !== 1 ? 's' : ''} added to inventory!`);
    setResults(null);
    setImagePreview(null);
    setSelected(new Set());
  };

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  const confidenceColor = (c: string) =>
    c === 'high' ? 'text-green-600 dark:text-green-400' :
    c === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-500 dark:text-red-400';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="VARD Food Scanner"
          subtitle="Point camera or upload a photo. VARD identifies food items and estimates expiry dates automatically"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Stats banner */}
            {addedCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckIcon className="w-4 h-4" />
                <span><strong>{addedCount}</strong> items added to inventory this session</span>
              </div>
            )}

            {/* Camera / Upload zone */}
            {!camActive && (
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                className="relative rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Food to analyze" className="w-full max-h-72 object-contain bg-gray-50 dark:bg-black" />
                    <button
                      onClick={() => { setImagePreview(null); setResults(null); setError(null); }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Drop a food photo here</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Or use your camera to capture fruits, vegetables, and packaged goods. VARD will detect everything
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button onClick={startCamera} icon={<CameraIcon className="w-4 h-4" />}>
                        Open Camera
                      </Button>
                      <Button variant="outline" icon={<PhotoIcon className="w-4 h-4" />} onClick={() => fileRef.current?.click()}>
                        Upload Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live camera */}
            {camActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-72 object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-emerald-400 shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
                  >
                    <CameraIcon className="w-7 h-7 text-gray-800" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-full bg-black/60 text-white text-sm hover:bg-black/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

            {/* Detect button */}
            {imagePreview && !camActive && (
              <Button
                onClick={detect}
                disabled={detecting}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-base shadow-lg shadow-emerald-500/30"
                icon={detecting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
              >
                {detecting ? 'Analyzing with VARD...' : 'Detect Food Items & Expiry Dates'}
              </Button>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40 p-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {results.length} item{results.length !== 1 ? 's' : ''} detected
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review, edit if needed, then add selected to inventory</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(new Set(results.map((_, i) => i)))}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                    >Select all</button>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-xs text-gray-500 hover:underline"
                    >None</button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 transition-all duration-150 ${
                        selected.has(idx)
                          ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700/50'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 opacity-60'
                      }`}
                    >
                      {editingIdx === idx ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
                              <input
                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={item.name}
                                onChange={e => updateItem(idx, { name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
                              <select
                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={item.category}
                                onChange={e => updateItem(idx, { category: e.target.value })}
                              >
                                {['Fruit','Vegetable','Dairy','Grain','Protein','Beverage','Packaged','Snack','Spice','Other'].map(c => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantity</label>
                              <input
                                type="number" min={0} step={0.1}
                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={item.quantity}
                                onChange={e => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Unit</label>
                              <input
                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={item.unit}
                                onChange={e => updateItem(idx, { unit: e.target.value })}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Expiry Date</label>
                              <input
                                type="date"
                                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={item.expiryDate || ''}
                                onChange={e => updateItem(idx, { expiryDate: e.target.value || null })}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingIdx(null)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-medium"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleSelect(idx)}
                            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                              selected.has(idx)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {selected.has(idx) && <CheckIcon className="w-3 h-3 text-white" />}
                          </button>

                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-lg font-bold">{(item.name || 'U')[0]}</span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>
                                    {item.category}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.quantity} {item.unit}
                                  </span>
                                  <span className={`text-xs font-medium ${confidenceColor(item.confidence)}`}>
                                    {item.confidence} confidence
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingIdx(idx)}
                                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <span>
                                <span className="font-medium">Expiry:</span>{' '}
                                {item.expiryDate
                                  ? <span className={
                                      (() => {
                                        const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
                                        return days <= 3 ? 'text-red-500 dark:text-red-400 font-semibold' :
                                               days <= 7 ? 'text-yellow-600 dark:text-yellow-400' :
                                               'text-green-600 dark:text-green-400';
                                      })()
                                    }>{item.expiryDate}</span>
                                  : <span className="text-gray-400 italic">not detected</span>
                                }
                              </span>
                              {item.estimatedShelfLifeDays && (
                                <span>
                                  <span className="font-medium">Shelf life:</span> ~{item.estimatedShelfLifeDays} days
                                </span>
                              )}
                              {item.isPackaged && (
                                <span className="text-purple-600 dark:text-purple-400">📦 Packaged</span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 italic">
                                💡 {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={addSelected}
                  disabled={selected.size === 0}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-base shadow-lg shadow-emerald-500/30"
                  icon={<CheckIcon className="w-5 h-5" />}
                >
                  Add {selected.size} Selected Item{selected.size !== 1 ? 's' : ''} to Inventory
                </Button>
              </div>
            )}

            {/* How it works */}
            {!results && !detecting && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">How it works</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '1', icon: '📸', title: 'Capture or Upload', desc: 'Take a photo with your camera or upload an image of any food — fruits, vegetables, packaged products' },
                    { step: '2', icon: 'logo', title: 'VARD Analyzes', desc: 'VARD identifies each item, estimates shelf life, and calculates expiry dates' },
                    { step: '3', icon: '📦', title: 'Add to Inventory', desc: 'Review detected items, edit any details, then add selected items directly to your inventory' },
                  ].map(s => (
                    <div key={s.step} className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 dark:bg-neutral-800">
                      <div className="mb-2 flex h-10 items-center justify-center">
                        {s.icon === 'logo' ? (
                          <Logo className="h-9 w-9 text-emerald-600" />
                        ) : (
                          <span className="text-3xl">{s.icon}</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">STEP {s.step}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{s.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
