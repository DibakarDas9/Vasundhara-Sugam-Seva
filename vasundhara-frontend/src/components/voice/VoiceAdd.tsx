"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useLocalInventory } from '@/lib/localInventory';
import { useLanguage } from '@/contexts/LanguageContext';

type StepKey = 'name' | 'brand' | 'category' | 'quantity' | 'unit' | 'expiry';

const STEPS: { key: StepKey; placeholder?: string }[] = [
  { key: 'name' },
  { key: 'brand' },
  { key: 'category' },
  { key: 'quantity', placeholder: 'eg. 2' },
  { key: 'unit', placeholder: 'eg. kg' },
  { key: 'expiry', placeholder: 'YYYY-MM-DD' }
];

export default function VoiceAdd() {
  const { addItem } = useLocalInventory();
  const { t, language } = useLanguage();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string | number | null>>({});
  const [transcript, setTranscript] = useState('');
  const recogRef = useRef<any>(null);

  const getStepLabel = (key: StepKey) => {
    switch (key) {
      case 'name': return t('inventory.modal.itemName', 'Product name');
      case 'brand': return t('scan.confirm.brand', 'Brand');
      case 'category': return t('inventory.modal.category', 'Category');
      case 'quantity': return t('inventory.modal.qty', 'Quantity');
      case 'unit': return t('inventory.modal.unit', 'Unit');
      case 'expiry': return t('inventory.modal.expiryDate', 'Expiry date');
    }
  };

  useEffect(() => {
    const Recog = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
    setSupported(Boolean(Recog));
    return () => {
      if (recogRef.current) {
        try { recogRef.current.stop(); } catch (e) {}
        recogRef.current = null;
      }
    };
  }, []);

  function startListening() {
    const Recog = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
    if (!Recog) return setSupported(false);
    const r = new Recog();
    
    // Set speech recognition locale dynamically
    const locales = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN'
    };
    r.lang = locales[language] || 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript.trim();
      setTranscript(text);
      // save value for current step
      const key = STEPS[stepIndex].key;
      setValues(prev => ({ ...prev, [key]: text }));
      // auto-advance
      setTimeout(() => setListening(false), 100);
    };
    r.onerror = (e: any) => {
      console.warn('Speech error', e);
      setListening(false);
    };
    r.onend = () => {
      setListening(false);
    };
    recogRef.current = r;
    try {
      r.start();
      setListening(true);
    } catch (e) {
      console.warn('Speech start failed', e);
    }
  }

  function stopListening() {
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch (e) {}
      recogRef.current = null;
    }
    setListening(false);
  }

  function nextStep() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1);
      setTranscript('');
    }
  }

  // capitalize helper (per requirement: every product name's first alphabet will be capital by default)
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  function prevStep() {
    if (stepIndex > 0) {
      setStepIndex(i => i - 1);
      setTranscript('');
    }
  }

  function finishAdd() {
    // construct item
    const finalName = capitalize(String(values.name || 'New Item'));
    const item: any = {
      id: Date.now(),
      name: finalName,
      brand: capitalize(String(values.brand || '')),
      category: capitalize(String(values.category || '')),
      expiryDate: values.expiry || null,
      quantity: values.quantity ? Number(values.quantity) : 1,
      unit: String(values.unit || ''),
      addedDate: new Date().toISOString().slice(0, 10),
      status: 'good'
    };
    addItem(item);
    // reset
    setValues({});
    setStepIndex(0);
    setTranscript('');
    alert(t('voice.manual.addedAlert', 'Item added via voice:') + ' ' + item.name);
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white">
      <h3 className="text-sm font-semibold mb-2">{t('voice.manual.title', 'Add item by voice')}</h3>
      {supported === false && (
        <p className="text-xs text-red-600">{t('voice.manual.notSupported', 'Speech recognition not supported in this browser. Use Manual entry.')}</p>
      )}

      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          {t('voice.manual.step', 'Step')}: {getStepLabel(STEPS[stepIndex].key)}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => startListening()} disabled={!supported || listening}>
            {t('voice.manual.micStart', '🎤 Start listening')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => stopListening()} disabled={!listening}>
            {t('voice.manual.stop', 'Stop')}
          </Button>
          <div className="text-sm text-gray-700">
            {transcript || <span className="text-gray-400">{t('voice.manual.noInput', 'No input yet')}</span>}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={prevStep} disabled={stepIndex === 0}>
            {t('voice.manual.prev', 'Prev')}
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button size="sm" onClick={nextStep}>
              {t('voice.manual.next', 'Next')}
            </Button>
          ) : (
            <Button size="sm" onClick={finishAdd}>
              {t('voice.manual.finish', 'Finish & Add')}
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">Captured: {JSON.stringify(values)}</div>
      </div>
    </div>
  );
}
