'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import VoiceAdd from '@/components/voice/VoiceAdd';
import { useLocalInventory } from '@/lib/localInventory';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CameraIcon,
  QrCodeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const mockScannedItems = [
  {
    id: 1,
    name: 'Organic Bananas',
    brand: 'Fresh Farm',
    barcode: '1234567890123',
    category: 'Fruits',
    expiryDate: '2024-01-20',
    confidence: 0.95,
    image: '/api/placeholder/100/100',
    status: 'success'
  },
  {
    id: 2,
    name: 'Greek Yogurt',
    brand: 'Healthy Choice',
    barcode: '2345678901234',
    category: 'Dairy',
    expiryDate: '2024-01-25',
    confidence: 0.88,
    image: '/api/placeholder/100/100',
    status: 'success'
  },
  {
    id: 3,
    name: 'Unknown Item',
    brand: 'Unknown',
    barcode: '3456789012345',
    category: 'Unknown',
    expiryDate: null,
    confidence: 0.45,
    image: '/api/placeholder/100/100',
    status: 'warning'
  }
];

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanContent />
    </ProtectedRoute>
  );
}

function ScanContent() {
  const router = require('next/navigation').useRouter();
  const { t } = useLanguage();
  const [scanMode, setScanMode] = useState<'barcode' | 'qr' | 'camera' | 'manual'>('barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningError, setScanningError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [detectorAvailable, setDetectorAvailable] = useState<boolean | null>(null);
  const [framesScanned, setFramesScanned] = useState(0);
  const [pendingItem, setPendingItem] = useState<any | null>(null);
  const [scannedItems, setScannedItems] = useState(mockScannedItems);
  const [manualInput, setManualInput] = useState('');

  const { addItem } = useLocalInventory();

  // Helper: stop camera
  function stopCamera() {
    setIsScanning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start camera + scanning using BarcodeDetector when available.
  const handleScan = async () => {
    setScanningError(null);
    setLastScan(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanningError('Camera API not available in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsScanning(true);

      // attach stream to video element for preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // try to use BarcodeDetector if available
      const BarcodeDetectorClass = (window as any).BarcodeDetector || (window as any).webkitBarcodeDetector;
      setDetectorAvailable(Boolean(BarcodeDetectorClass));
      if (BarcodeDetectorClass) {
        // prefer a wide set of formats
        const formats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'];
        let detector: any;
        try {
          detector = new BarcodeDetectorClass({ formats });
        } catch (err) {
          // some browsers expect a different constructor signature
          try {
            detector = new (window as any).BarcodeDetector({ formats });
          } catch (e) {
            detector = null;
          }
        }

        if (!detector) {
          setScanningError('BarcodeDetector is not available correctly in this browser.');
          setDetectorAvailable(false);
          return;
        } else {
          setDetectorAvailable(true);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const tick = async () => {
          try {
            if (!videoRef.current || videoRef.current.readyState < 2) {
              rafRef.current = requestAnimationFrame(tick);
              return;
            }
            const vw = videoRef.current.videoWidth;
            const vh = videoRef.current.videoHeight;
            if (!vw || !vh) {
              rafRef.current = requestAnimationFrame(tick);
              return;
            }
            // scale canvas to same size
            canvas.width = vw;
            canvas.height = vh;
            ctx?.drawImage(videoRef.current, 0, 0, vw, vh);
            const imgData = ctx?.getImageData(0, 0, vw, vh);
            // detect
            const results = await detector.detect(canvas);
            setFramesScanned((f) => f + 1);
            // debugging
            if (framesScanned % 30 === 0) {
              console.debug('scanning frame', framesScanned, 'vw', vw, 'vh', vh);
            }
            if (results && results.length > 0) {
              // take the first
              const r = results[0];
              // try multiple common properties for different implementations
              const code = r.rawValue || r.raw || r.raw_text || r.displayValue || (r.value && (r.value.rawValue || r.value.raw)) || r.data || r.text || '';
              console.info('BarcodeDetector result', r, 'extractedCode=', code);
              if (code) {
                setLastScan(String(code));
                // lookup product details (OpenFoodFacts) and create a pending item for confirmation
                const barcode = String(code).trim();
                try {
                  // non-blocking: attempt to fetch product info
                  fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`)
                    .then(r => r.json())
                    .then((json) => {
                      if (json && json.status === 1 && json.product) {
                        const p = json.product;
                        const name = p.product_name || p.generic_name || barcode;
                        const brand = Array.isArray(p.brands_tags) && p.brands_tags.length ? p.brands_tags[0] : (p.brands || '');
                        const category = Array.isArray(p.categories_tags) && p.categories_tags.length ? p.categories_tags[0].replace('en:', '') : '';
                        const image = p.image_front_small_url || p.image_url || '/api/placeholder/100/100';
                        setPendingItem({
                          id: Date.now(),
                          name,
                          brand,
                          barcode,
                          category,
                          expiryDate: null,
                          confidence: 1,
                          image,
                          status: 'success'
                        });
                      } else {
                        // fallback: no product found
                        setPendingItem({
                          id: Date.now(),
                          name: barcode,
                          brand: '',
                          barcode,
                          category: '',
                          expiryDate: null,
                          confidence: 1,
                          image: '/api/placeholder/100/100',
                          status: 'warning'
                        });
                      }
                    })
                    .catch((e) => {
                      console.warn('Product lookup failed', e);
                      setPendingItem({
                        id: Date.now(),
                        name: barcode,
                        brand: '',
                        barcode,
                        category: '',
                        expiryDate: null,
                        confidence: 1,
                        image: '/api/placeholder/100/100',
                        status: 'warning'
                      });
                    });
                } catch (e) {
                  console.warn('Lookup error', e);
                }

                // stop camera while user confirms
                stopCamera();
                return;
              }
            }
          } catch (err) {
            // ignore detection errors and keep scanning
          }
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        // set a fallback timeout: if no code found in 12s, stop and show message
        if (!timeoutRef.current) {
          timeoutRef.current = window.setTimeout(() => {
            stopCamera();
            setScanningError('No barcode/QR code detected - invalid or not found.');
          }, 12_000) as unknown as number;
        }
        return;
      }

      // Fallback: if BarcodeDetector not available, show message (we could wire react-qr-scanner here)
      setDetectorAvailable(false);
      setScanningError('Barcode scanning is not supported in this browser. Try QR scanning with a modern Chrome/Edge or use Manual entry.');
    } catch (err: any) {
      if (err && err.name === 'NotAllowedError') {
        setScanningError('Camera permission was denied. Please enable camera permission to scan.');
      } else {
        setScanningError('Failed to access camera: ' + String(err?.message || err));
      }
      stopCamera();
    }
  };

  const handleManualAdd = () => {
    if (manualInput.trim()) {
      const newItem = {
        id: Date.now(),
        name: manualInput,
        brand: 'Manual Entry',
        barcode: 'Manual',
        category: 'Unknown',
        expiryDate: null,
        confidence: 1.0,
        image: '/api/placeholder/100/100',
        status: 'success' as const
      };
      setScannedItems(prev => [newItem, ...prev]);
      addItem({ name: newItem.name, category: newItem.category, expiryDate: newItem.expiryDate });
      setManualInput('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={t('scan.title', 'Scan Items')}
          subtitle={t('scan.subtitle', 'Add items to your inventory using barcode scanning, QR codes, or camera')}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Scan Options */}
            <Card>
              <CardHeader>
                <CardTitle>{t('scan.chooseMethod', 'Choose Scanning Method')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={scanMode === 'barcode' ? 'primary' : 'outline'}
                    onClick={() => setScanMode('barcode')}
                    className="h-20 flex-col gap-2"
                  >
                    <QrCodeIcon className="w-6 h-6" />
                    <span>{t('scan.method.barcode', 'Barcode')}</span>
                  </Button>

                  <Button
                    variant={scanMode === 'qr' ? 'primary' : 'outline'}
                    onClick={() => setScanMode('qr')}
                    className="h-20 flex-col gap-2"
                  >
                    <QrCodeIcon className="w-6 h-6" />
                    <span>{t('scan.method.qr', 'QR Code')}</span>
                  </Button>

                  <Button
                    variant={scanMode === 'camera' ? 'primary' : 'outline'}
                    onClick={() => setScanMode('camera')}
                    className="h-20 flex-col gap-2"
                  >
                    <CameraIcon className="w-6 h-6" />
                    <span>{t('scan.method.camera', 'Camera')}</span>
                  </Button>

                  <Button
                    variant={scanMode === 'manual' ? 'primary' : 'outline'}
                    onClick={() => setScanMode('manual')}
                    className="h-20 flex-col gap-2"
                  >
                    <DocumentTextIcon className="w-6 h-6" />
                    <span>{t('scan.method.manual', 'Manual')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scan Interface */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {scanMode === 'barcode' && t('scan.scanner.barcode', 'Barcode Scanner')}
                  {scanMode === 'qr' && t('scan.scanner.qr', 'QR Code Scanner')}
                  {scanMode === 'camera' && t('scan.scanner.camera', 'Camera Scanner')}
                  {scanMode === 'manual' && t('scan.scanner.manual', 'Manual Entry')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanMode === 'manual' ? (
                  <div className="space-y-4">
                    <Input
                      label={t('scan.input.itemName', 'Item Name')}
                      placeholder={t('scan.input.placeholder', 'Enter item name...')}
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                    />
                    <Button onClick={handleManualAdd} disabled={!manualInput.trim()}>
                      {t('scan.button.addItem', 'Add Item')}
                    </Button>
                    <VoiceAdd />
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="mx-auto w-40 h-40 rounded-lg overflow-hidden bg-black">
                      {/* video preview */}
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {isScanning ? t('scan.status.scanning', 'Scanning...') : t('scan.status.ready', 'Ready to Scan')}
                    </h3>

                    {scanningError && (
                      <p className="text-sm text-red-600">{scanningError}</p>
                    )}

                    {lastScan && (
                      <p className="text-sm text-green-700">{t('scan.status.lastScanned', 'Last scanned')}: {lastScan}</p>
                    )}

                    {detectorAvailable !== null && (
                      <p className="text-xs text-gray-500">BarcodeDetector available: {detectorAvailable ? 'yes' : 'no'}. Frames scanned: {framesScanned}</p>
                    )}

                    {/* Pending product confirmation when a product lookup returns */}
                    {pendingItem && (
                      <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto text-left">
                        <h4 className="font-semibold mb-2">{t('scan.confirm.title', 'Confirm scanned product')}</h4>
                        <div className="flex items-start gap-4">
                          <img src={pendingItem.image} alt="product" className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 dark:text-gray-400">{t('voice.floating.name', 'Name')}</label>
                            <input className="w-full border px-2 py-1 rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={pendingItem.name} onChange={(e) => setPendingItem({ ...pendingItem, name: e.target.value })} />
                            <label className="block text-xs text-gray-600 dark:text-gray-400">{t('scan.confirm.brand', 'Brand')}</label>
                            <input className="w-full border px-2 py-1 rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={pendingItem.brand} onChange={(e) => setPendingItem({ ...pendingItem, brand: e.target.value })} />
                            <label className="block text-xs text-gray-600 dark:text-gray-400">{t('inventory.modal.category', 'Category')}</label>
                            <input className="w-full border px-2 py-1 rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={pendingItem.category} onChange={(e) => setPendingItem({ ...pendingItem, category: e.target.value })} />
                            <label className="block text-xs text-gray-600 dark:text-gray-400">{t('scan.confirm.expiry', 'Expiry date (optional)')}</label>
                            <input type="date" className="w-full border px-2 py-1 rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={pendingItem.expiryDate || ''} onChange={(e) => setPendingItem({ ...pendingItem, expiryDate: e.target.value || null })} />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => {
                                // finalize add
                                addItem({ name: pendingItem.name, category: pendingItem.category, expiryDate: pendingItem.expiryDate });
                                setScannedItems(prev => [pendingItem, ...prev]);
                                setPendingItem(null);
                                setLastScan(null);
                                setScanningError(null);
                              }}>{t('scan.confirm.addInventory', 'Add to Inventory')}</Button>
                              <Button size="sm" variant="outline" onClick={() => { setPendingItem(null); setLastScan(null); setScanningError(null); }}>
                                {t('inventory.modal.cancel', 'Cancel')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-4">
                      {!isScanning ? (
                        <Button size="lg" onClick={handleScan} icon={<CameraIcon className="w-5 h-5" />}>
                          {t('scan.button.startScan', 'Start Scan')}
                        </Button>
                      ) : (
                        <Button size="lg" variant="destructive" onClick={() => stopCamera()}>
                          {t('scan.button.stop', 'Stop')}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('scan.hint.permission', 'Ensure camera permission is allowed. If scanning fails, try Manual entry.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scanned Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t('scan.recentTitle', 'Recently Scanned Items')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scannedItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {(item.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          {getStatusIcon(item.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {t('scan.method.barcode', 'Barcode')}: {item.barcode} • {t('scan.recent.confidence', 'Confidence')}: {Math.round(item.confidence * 100)}%
                        </p>
                        {item.expiryDate && (
                          <p className="text-xs text-gray-500">
                            {t('inventory.expires', 'Expires')}: {item.expiryDate}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/scan/${item.id}/edit`)}>
                          {t('scan.recent.edit', 'Edit')}
                        </Button>
                        <Button size="sm" onClick={() => { addItem({ name: item.name, category: item.category, expiryDate: item.expiryDate }); alert(t('scan.recent.added', 'Added to inventory')); }}>
                          {t('scan.confirm.addInventory', 'Add to Inventory')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
