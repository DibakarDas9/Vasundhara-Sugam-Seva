'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaperAirplaneIcon, MicrophoneIcon, XMarkIcon, SparklesIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useLocalInventory } from '@/lib/localInventory';
import { useAuth } from '@/contexts/AuthContext';
import { detectFoodFromImage } from '@/lib/vardVision';
import { generateProductImage } from '@/lib/productImages';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
}

type CommandResult = {
  reply: string;
  action?: () => void;
};

const ROUTE_MAP: Array<{ label: string; keywords: string[]; path: string }> = [
  { label: 'Dashboard', keywords: ['dashboard', 'home'], path: '/dashboard' },
  { label: 'Inventory', keywords: ['inventory', 'items', 'stock'], path: '/inventory' },
  { label: 'Meal Planning', keywords: ['meal', 'planning', 'recipes'], path: '/meal-planning' },
  { label: 'AI Scan', keywords: ['ai scan', 'ai scanner', 'vard', 'photo'], path: '/ai-scan' },
  { label: 'Analytics', keywords: ['analytics', 'stats', 'report'], path: '/analytics' },
  { label: 'Marketplace', keywords: ['marketplace', 'market'], path: '/marketplace' },
  { label: 'Settings', keywords: ['settings', 'preferences'], path: '/settings' },
];

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function extractDate(text: string) {
  const match = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match ? match[1] : null;
}

function stripPhrase(text: string, pattern: RegExp) {
  return text.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
}

export default function VardAssistant() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, addItem, deleteItem, updateItem } = useLocalInventory();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi, I am VARD. Ask me to open pages, add items, or predict expiry from a photo.',
    },
  ]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [detecting, setDetecting] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const canUseVoice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }, []);

  const recentCommands = useMemo(() =>
    messages
      .filter((msg) => msg.role === 'user')
      .slice(-3)
      .reverse(),
  [messages]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('vard-open', handleOpen);
    return () => window.removeEventListener('vard-open', handleOpen);
  }, []);

  if (!user || !open) return null;

  const pushMessage = (role: ChatMessage['role'], text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, role, text },
    ]);
  };

  const pushImageMessage = (role: ChatMessage['role'], imageUrl: string, text?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text: text || '',
        imageUrl,
      },
    ]);
  };

  const runCommand = (rawText: string): CommandResult => {
    const text = normalize(rawText);

    if (text.includes('help')) {
      return {
        reply:
          'Try: "open dashboard", "add item rice qty 2 unit kg expiry 2026-06-01", "remove item rice", or "predict expiry".',
      };
    }

    if (text.startsWith('open ') || text.startsWith('go to ') || text.startsWith('show ')) {
      const match = ROUTE_MAP.find((route) =>
        route.keywords.some((kw) => text.includes(kw))
      );
      if (match) {
        return {
          reply: `Opening ${match.label}.`,
          action: () => router.push(match.path),
        };
      }
    }

    if (text.includes('predict expiry') || text.includes('estimate expiry') || text.includes('ai scan')) {
      return {
        reply: 'Opening AI scan so you can upload a photo.',
        action: () => router.push('/ai-scan'),
      };
    }

    if (text.startsWith('add ')) {
      const expiry = extractDate(text);
      const qtyMatch = text.match(/\bqty(?:uantity)?\s*(\d+(?:\.\d+)?)\b/);
      const unitMatch = text.match(/\bunit\s*([a-zA-Z]+)\b/);
      let cleaned = text;
      cleaned = stripPhrase(cleaned, /^add\s+(item\s+)?/i);
      cleaned = stripPhrase(cleaned, /\bqty(?:uantity)?\s*\d+(?:\.\d+)?\b/i);
      cleaned = stripPhrase(cleaned, /\bunit\s*[a-zA-Z]+\b/i);
      if (expiry) cleaned = stripPhrase(cleaned, new RegExp(expiry, 'i'));
      cleaned = stripPhrase(cleaned, /\bexpiry\b/i);

      if (!cleaned) {
        return { reply: 'Tell me the item name, like "add item rice qty 2 unit kg".' };
      }

      addItem({
        name: cleaned,
        quantity: qtyMatch ? Number(qtyMatch[1]) : 1,
        unit: unitMatch ? unitMatch[1] : undefined,
        expiryDate: expiry || undefined,
      });

      return {
        reply: `Added ${cleaned}.`,
      };
    }

    if (text.startsWith('remove ') || text.startsWith('delete ')) {
      let cleaned = stripPhrase(text, /^(remove|delete)\s+(item\s+)?/i);
      cleaned = stripPhrase(cleaned, /\bfrom\s+inventory\b/i);

      const target = items.find((item) => item.name.toLowerCase() === cleaned.toLowerCase());
      if (!target) {
        return { reply: `I could not find "${cleaned}" in your inventory.` };
      }
      deleteItem(target.id);
      return { reply: `Removed ${target.name}.` };
    }

    if (text.startsWith('set expiry')) {
      const expiry = extractDate(text);
      const name = stripPhrase(text, /^set\s+expiry\s+/i).replace(expiry || '', '').trim();
      if (!expiry || !name) {
        return { reply: 'Use: "set expiry 2026-06-01 for rice".' };
      }
      const target = items.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (!target) {
        return { reply: `I could not find "${name}" in your inventory.` };
      }
      updateItem(target.id, { expiryDate: expiry });
      return { reply: `Updated expiry for ${target.name} to ${expiry}.` };
    }

    return {
      reply: 'I can help with navigation, adding/removing items, and AI scan. Say "help" for examples.',
    };
  };

  const handleSend = (value?: string) => {
    const text = (value ?? input).trim();
    const imageToProcess = pendingImage;

    if (!text && !imageToProcess) return;

    if (imageToProcess) {
      const imageUrl = pendingPreview || URL.createObjectURL(imageToProcess);
      pushImageMessage('user', imageUrl, text || '');
      setInput('');
      setPendingImage(null);
      setPendingPreview(null);
      handleImage(imageToProcess);
      return;
    }

    pushMessage('user', text);
    setInput('');

    const photoRequest = text.match(/(?:generate|get|add)\s+(?:an?\s+)?(?:ai\s+)?(?:product\s+)?photo\s+(?:for\s+)?(.+)/i);
    if (photoRequest?.[1]) {
      handleGenerateInventoryPhoto(photoRequest[1].trim());
      return;
    }

    const result = runCommand(text);
    if (result.action) result.action();
    pushMessage('assistant', result.reply);
  };

  const handleGenerateInventoryPhoto = async (rawName: string) => {
    const targetName = rawName.replace(/\b(from|in)\s+inventory\b/i, '').trim();
    const target = items.find((item) => item.name.toLowerCase() === targetName.toLowerCase());
    if (!target) {
      pushMessage('assistant', `I could not find "${targetName}" in your inventory.`);
      return;
    }

    pushMessage('assistant', `Generating an AI product photo for ${target.name}...`);
    try {
      const imageUrl = await generateProductImage(target.name, target.category);
      updateItem(target.id, { photo: imageUrl });
      pushImageMessage('assistant', imageUrl, `Added this AI photo to ${target.name}.`);
    } catch (err: any) {
      pushMessage('assistant', err?.message || 'I could not generate that product photo.');
    }
  };

  const handleImage = async (file: File) => {
    setDetecting(true);
    pushMessage('assistant', 'Analyzing the image for items and expiry...');
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });
      const result = await detectFoodFromImage(dataUrl, file.type || 'image/jpeg');
      if (result.error) {
        pushMessage('assistant', `I could not analyze that image. ${result.error}`);
        return;
      }
      if (!result.items.length) {
        pushMessage('assistant', 'I could not find any food items. Try a clearer photo or better lighting.');
        return;
      }
      result.items.forEach((item) => {
        addItem({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate || undefined,
          photo: dataUrl,
        });
      });
      pushMessage('assistant', `Added ${result.items.length} item${result.items.length === 1 ? '' : 's'} from the photo.`);
    } catch (err: any) {
      pushMessage('assistant', err?.message || 'Something went wrong while processing the image.');
    } finally {
      setDetecting(false);
      setPendingImage(null);
      setPendingPreview(null);
    }
  };

  const stageImage = (file: File) => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
    }
    setPendingImage(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const toggleListening = () => {
    if (!canUseVoice) return;
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) handleSend(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div className="absolute right-6 top-24">
        <div className="w-[360px] sm:w-[560px] h-[560px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-950 shadow-2xl flex overflow-hidden">
          <div className="hidden sm:flex w-48 flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">VARD</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Operations copilot</p>
                </div>
              </div>
            </div>

            <div className="px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Quick</div>
            <div className="px-3 py-3 space-y-2">
              {['Open dashboard', 'Open inventory', 'Predict expiry', 'Generate photo for rice'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="w-full text-left text-[11px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-950 px-2.5 py-2 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Recent</div>
            <div className="px-3 py-3 space-y-2">
              {recentCommands.length === 0 && (
                <p className="text-[11px] text-gray-400">No commands yet.</p>
              )}
              {recentCommands.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-white dark:bg-neutral-950 border border-gray-200 dark:border-gray-800 px-2.5 py-2 text-[11px] text-gray-600 dark:text-gray-300">
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center sm:hidden">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">VARD Assistant</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Ask in chat or voice</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5"
                aria-label="Close VARD"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50 dark:from-neutral-950 dark:to-neutral-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.role === 'user'
                      ? 'ml-auto w-fit max-w-[78%] rounded-2xl bg-emerald-600 text-white px-3 py-2 text-xs shadow-sm'
                      : 'mr-auto w-fit max-w-[78%] rounded-2xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 text-xs'
                  }
                >
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Uploaded" className="mb-2 w-40 rounded-lg border border-white/20 object-cover" />
                  )}
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-neutral-950">
              <div className="flex flex-wrap gap-2 mb-3">
                {['Open dashboard', 'Predict expiry', 'Generate photo for milk'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {pendingPreview && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1">
                    <img src={pendingPreview} alt="Pending" className="h-8 w-8 rounded-md object-cover" />
                    <button
                      onClick={() => {
                        if (pendingPreview) URL.revokeObjectURL(pendingPreview);
                        setPendingPreview(null);
                        setPendingImage(null);
                      }}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSend();
                  }}
                  onPaste={(event) => {
                    const items = event.clipboardData?.items;
                    if (!items) return;
                    for (let i = 0; i < items.length; i += 1) {
                      const item = items[i];
                      if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                          stageImage(file);
                        }
                      }
                    }
                  }}
                  placeholder="Type a command or ask for help..."
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`px-3 py-2 rounded-lg border text-xs ${
                    detecting
                      ? 'border-gray-200 text-gray-400'
                      : 'border-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Upload image for VARD"
                  disabled={detecting}
                >
                  {detecting ? '...' : <PhotoIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg border text-xs ${
                    listening
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="Toggle voice input"
                  disabled={!canUseVoice}
                >
                  <MicrophoneIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSend()}
                  className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  aria-label="Send command"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) {
                    stageImage(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
