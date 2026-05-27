"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLocalInventory } from '@/lib/localInventory';
import { cn } from '@/lib/utils';
import { parseVoiceInput, parseDateString, parsePrice } from '@/lib/voiceParser';
import { useLanguage } from '@/contexts/LanguageContext';

type VoiceStep = 'IDLE' | 'LISTENING_INITIAL' | 'PROCESSING_INITIAL' | 'ASK_QUANTITY' | 'LISTENING_QUANTITY' | 'ASK_CATEGORY' | 'LISTENING_CATEGORY' | 'ASK_EXPIRY' | 'LISTENING_EXPIRY' | 'ASK_PRICE' | 'LISTENING_PRICE' | 'CONFIRM';

export default function VoiceAddFloating() {
  const { addItem } = useLocalInventory();
  const { t, language } = useLanguage();

  // State
  const [step, setStep] = useState<VoiceStep>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tempItem, setTempItem] = useState<any>({});

  const recognitionRef = useRef<any>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  // Helper to show transient messages
  const showMessage = (msg: string, duration = 3000) => {
    setMessage(msg);
    if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = window.setTimeout(() => setMessage(null), duration);
  };

  // Text-to-Speech Helper with translations support
  const speak = (textKey: string, defaultText: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const translatedText = t(textKey, defaultText);
      const utterance = new SpeechSynthesisUtterance(translatedText);

      // Select voice based on current language
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice;
      if (language === 'hi') {
        preferredVoice = voices.find(v => v.lang.startsWith('hi'));
      } else if (language === 'bn') {
        preferredVoice = voices.find(v => v.lang.startsWith('bn'));
      } else {
        // Priority: Google US English -> Microsoft Zira -> Any English
        preferredVoice = voices.find(v => v.name.includes('Google US English')) ||
          voices.find(v => v.name.includes('Zira')) ||
          voices.find(v => v.lang.startsWith('en'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        // Fallback setting lang property directly on the utterance
        const langMap = {
          en: 'en-IN',
          hi: 'hi-IN',
          bn: 'bn-IN'
        };
        utterance.lang = langMap[language] || 'en-US';
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if no TTS
      if (onEnd) setTimeout(onEnd, 1000);
    }
  };

  // Start Listening with language-specific locale
  const startListening = (nextStep: VoiceStep) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showMessage(t('voice.manual.notSupported', 'Speech recognition not supported'));
      return;
    }

    const rec = new SpeechRecognition();
    
    // Set speech recognition locale dynamically
    const locales = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN'
    };
    rec.lang = locales[language] || 'en-IN';
    rec.interimResults = true; // Enable real-time feedback
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setStep(nextStep);
      setTranscript('');
      showMessage(t('voice.floating.listening', 'Listening...'));
    };

    rec.onerror = (ev: any) => {
      console.error('Speech error', ev);
      if (ev.error === 'no-speech') {
        showMessage(t('voice.floating.noSpeech', 'No speech detected. Please try again.'));
      } else {
        showMessage('Error: ' + (ev.error || 'unknown'));
      }
      // Don't reset immediately on no-speech, let user try again or cancel manually
      if (ev.error !== 'no-speech') {
        setStep('IDLE');
      }
    };

    rec.onend = () => {
      // If we are still in a listening state, it means we stopped naturally or silence
      // We'll handle logic in onresult, but if no result, we might need to prompt again or go idle
    };

    rec.onresult = (ev: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = ev.resultIndex; i < ev.results.length; ++i) {
        if (ev.results[i].isFinal) {
          finalTranscript += ev.results[i][0].transcript;
        } else {
          interimTranscript += ev.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        handleVoiceInput(nextStep, finalTranscript);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Stop Listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Handle Voice Input based on current step
  const handleVoiceInput = (currentStep: VoiceStep, text: string) => {
    switch (currentStep) {
      case 'LISTENING_INITIAL': {
        const parsed = parseVoiceInput(text);

        // Capitalize product name
        const capitalizeName = (name: string) => {
          return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };

        const capitalizedParsed = {
          ...parsed,
          name: parsed.name ? capitalizeName(parsed.name) : parsed.name
        };

        setTempItem(capitalizedParsed);

        // Check if quantity is missing
        if (!capitalizedParsed.quantity) {
          setStep('ASK_QUANTITY');
          speak('voice.floating.speakQty', 'How many?', () => startListening('LISTENING_QUANTITY'));
          break;
        }

        // Move to next step: Ask Category
        setStep('ASK_CATEGORY');
        speak('voice.floating.speakCategory', 'What category is this?', () => startListening('LISTENING_CATEGORY'));
        break;
      }
      case 'LISTENING_QUANTITY': {
        // Parse quantity from text (e.g. "5", "5 kg", "five")
        // We can reuse parseVoiceInput but just look for quantity
        const parsed = parseVoiceInput(text);
        if (parsed.quantity) {
          setTempItem((prev: any) => ({ ...prev, quantity: parsed.quantity, unit: parsed.unit || prev.unit }));
        } else {
          // Fallback if just a number
          const num = parseFloat(text);
          if (!isNaN(num)) {
            setTempItem((prev: any) => ({ ...prev, quantity: num }));
          }
        }

        setStep('ASK_CATEGORY');
        speak('voice.floating.speakCategory', 'What category is this?', () => startListening('LISTENING_CATEGORY'));
        break;
      }
      case 'LISTENING_CATEGORY': {
        // Simple cleanup for category
        let cat = text.replace(/[.,]/g, '').trim();
        // Capitalize
        cat = cat.charAt(0).toUpperCase() + cat.slice(1);

        setTempItem((prev: any) => ({ ...prev, category: cat }));

        // Move to next step: Ask Expiry
        setStep('ASK_EXPIRY');
        speak('voice.floating.speakExpiry', 'When does it expire?', () => startListening('LISTENING_EXPIRY'));
        break;
      }
      case 'LISTENING_EXPIRY': {
        const dateStr = parseDateString(text);
        if (dateStr) {
          setTempItem((prev: any) => ({ ...prev, expiryDate: dateStr }));
        } else {
          showMessage(`Could not understand date: "${text}". Skipping.`);
        }

        // Move to next step: Ask Price
        setStep('ASK_PRICE');
        speak('voice.floating.speakPrice', 'What is the price?', () => startListening('LISTENING_PRICE'));
        break;
      }
      case 'LISTENING_PRICE': {
        const priceData = parsePrice(text);
        if (priceData !== null) {
          let finalPrice = priceData.amount;
          let priceMsg = `₹${finalPrice}`;

          // If per-unit pricing, calculate total
          if (priceData.isPerUnit && tempItem.quantity) {
            finalPrice = priceData.amount * tempItem.quantity;
            priceMsg = `₹${priceData.amount} / unit × ${tempItem.quantity} = ₹${finalPrice}`;
            showMessage(`Calculated Total: ${priceMsg}`);
          }

          setTempItem((prev: any) => ({ ...prev, price: finalPrice }));
        } else {
          showMessage(`Could not understand price: "${text}". Skipping.`);
        }

        // Move to Confirm
        setStep('CONFIRM');
        speak('voice.floating.speakConfirm', 'Please confirm the details.');
        break;
      }
      default:
        break;
    }
  };

  // Initial Trigger
  const handleMainClick = () => {
    if (step === 'IDLE') {
      speak('voice.floating.speakInitial', 'What would you like to add?', () => startListening('LISTENING_INITIAL'));
    } else {
      // Cancel/Reset
      window.speechSynthesis.cancel();
      stopListening();
      setStep('IDLE');
      setTempItem({});
    }
  };

  const confirmAdd = () => {
    const finalItem = {
      name: tempItem.name ? tempItem.name.charAt(0).toUpperCase() + tempItem.name.slice(1) : 'New Item',
      quantity: tempItem.quantity || 1,
      unit: tempItem.unit || '',
      category: tempItem.category ? tempItem.category.charAt(0).toUpperCase() + tempItem.category.slice(1) : 'Uncategorized',
      expiryDate: tempItem.expiryDate || null,
      price: tempItem.price || 0
    };

    const added = addItem(finalItem);
    showMessage(t('voice.floating.added', 'Added') + ` ${added.name}`);
    setStep('IDLE');
    setTempItem({});
  };

  const cancelAdd = () => {
    setStep('IDLE');
    setTempItem({});
    window.speechSynthesis.cancel();
  };

  // Render
  const isListening = step.includes('LISTENING');
  const btnBg = isListening ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500';

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Helper Label */}
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
          {t('voice.floating.label', 'Interactive Voice Add')}
        </div>

        <button
          onClick={handleMainClick}
          className={cn(
            "no-invert transition-all duration-200 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl ring-2 ring-white/20 relative",
            btnBg
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {isListening ? (
              <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            ) : (
              <>
                <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 1v11m0 0a3 3 0 0 0 3-3V4a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
                <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 0 1-14 0" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Confirmation / Progress Modal */}
      {step !== 'IDLE' && (
        <div className="fixed bottom-24 right-6 z-50 w-80 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            {step === 'LISTENING_INITIAL' && t('voice.floating.listeningItem', 'Listening for item...')}
            {step === 'ASK_QUANTITY' && t('voice.floating.processing', 'Processing...')}
            {step === 'LISTENING_QUANTITY' && t('voice.floating.listeningQty', 'Listening for quantity...')}
            {step === 'ASK_CATEGORY' && t('voice.floating.processing', 'Processing...')}
            {step === 'LISTENING_CATEGORY' && t('voice.floating.listeningCategory', 'Listening for category...')}
            {step === 'ASK_EXPIRY' && t('voice.floating.processing', 'Processing...')}
            {step === 'LISTENING_EXPIRY' && t('voice.floating.listeningExpiry', 'Listening for expiry...')}
            {step === 'ASK_PRICE' && t('voice.floating.processing', 'Processing...')}
            {step === 'LISTENING_PRICE' && t('voice.floating.listeningPrice', 'Listening for price...')}
            {step === 'CONFIRM' && t('voice.floating.confirmDetails', 'Confirm Details')}
          </div>

          {/* Live Transcript */}
          {isListening && transcript && (
            <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm italic text-slate-600 dark:text-slate-300">
              "{transcript}"
            </div>
          )}

          {/* Item Preview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 w-20">{t('voice.floating.name', 'Name')}:</span>
              {step === 'CONFIRM' ? (
                <input
                  value={tempItem.name || ''}
                  onChange={e => setTempItem({ ...tempItem, name: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                />
              ) : (
                <span className="font-medium dark:text-white capitalize">{tempItem.name || '...'}</span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 w-20">{t('voice.floating.qty', 'Qty')}:</span>
              {step === 'CONFIRM' ? (
                <div className="flex gap-1 flex-1 justify-end">
                  <input
                    type="number"
                    value={tempItem.quantity || ''}
                    onChange={e => setTempItem({ ...tempItem, quantity: parseFloat(e.target.value) })}
                    className="w-16 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                    placeholder={t('voice.floating.qty', 'Qty')}
                  />
                  <input
                    value={tempItem.unit || ''}
                    onChange={e => setTempItem({ ...tempItem, unit: e.target.value })}
                    className="w-16 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                    placeholder="Unit"
                  />
                </div>
              ) : (
                <span className="font-medium dark:text-white">{tempItem.quantity ? `${tempItem.quantity} ${tempItem.unit || ''}` : '...'}</span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 w-20">{t('voice.floating.category', 'Category')}:</span>
              {step === 'CONFIRM' ? (
                <input
                  value={tempItem.category || ''}
                  onChange={e => setTempItem({ ...tempItem, category: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                />
              ) : (
                <span className="font-medium dark:text-white">{tempItem.category || '...'}</span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 w-20">{t('voice.floating.expiry', 'Expiry')}:</span>
              {step === 'CONFIRM' ? (
                <input
                  value={tempItem.expiryDate || ''}
                  onChange={e => setTempItem({ ...tempItem, expiryDate: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <span className="font-medium dark:text-white">{tempItem.expiryDate || '...'}</span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 w-20">{t('voice.floating.price', 'Price')}:</span>
              {step === 'CONFIRM' ? (
                <input
                  type="number"
                  value={tempItem.price || ''}
                  onChange={e => setTempItem({ ...tempItem, price: parseFloat(e.target.value) })}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border-none rounded px-2 py-1 text-right"
                  placeholder="₹"
                />
              ) : (
                <span className="font-medium dark:text-white">{tempItem.price ? `₹${tempItem.price}` : '...'}</span>
              )}
            </div>
          </div>

          {step === 'CONFIRM' && (
            <div className="mt-4 flex gap-2">
              <button onClick={confirmAdd} className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">{t('voice.floating.confirm', 'Confirm')}</button>
              <button onClick={cancelAdd} className="px-3 py-2 border dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors">{t('voice.floating.cancel', 'Cancel')}</button>
            </div>
          )}
          {step !== 'CONFIRM' && (
            <div className="mt-4">
              <button onClick={cancelAdd} className="w-full px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm">{t('voice.floating.cancelInteraction', 'Cancel Interaction')}</button>
            </div>
          )}
        </div>
      )}

      {/* Transient Message */}
      {message && (
        <div className="fixed bottom-24 right-6 z-[60] p-3 bg-black/80 backdrop-blur text-white rounded-lg text-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
          {message}
        </div>
      )}
    </div>
  );
}
