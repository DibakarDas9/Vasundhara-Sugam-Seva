"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLocalInventory } from '@/lib/localInventory';

const POS_KEY = 'vasundhara_voice_button_pos_v1';

type Parsed = {
  name?: string;
  quantity?: number;
  unit?: string;
  expiryDays?: number | null; // days from now
  category?: string | null;
  raw?: string;
};

function daysFromNowToISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseFreeFormTranscript(t: string): Parsed {
  const raw = t.trim();
  const base = raw.toLowerCase();

  // Try to capture quantity + unit (e.g., "12 pieces", "2 kg")
  let quantity: number | undefined = undefined;
  let unit: string | undefined = undefined;
  const qtyMatch = base.match(/(\d+(?:\.\d+)?)\s*(pieces|pcs|piece|kg|g|grams|gram|kgs|litre|litres|l|ml|bunch|pack|packs|container|containers|boxes|box)?/i);
  if (qtyMatch) {
    quantity = Number(qtyMatch[1]);
    if (qtyMatch[2]) unit = qtyMatch[2];
  }

  // Expiry: look for patterns like "expiry 10 days", "in 3 days", "expires in 5 days"
  let expiryDays: number | null = null;
  const expiryMatch = base.match(/(?:expiry|expires? in|in|after)\s*(?:of\s*)?(\d+)\s*(days?|day|d)/i);
  if (expiryMatch) {
    expiryDays = Number(expiryMatch[1]);
  } else {
    // also catch 'ten days' -> kept simple: numbers mostly
    const alt = base.match(/(\d+)\s*days?\s*(from now)?/i);
    if (alt) expiryDays = Number(alt[1]);
  }

  // Category: look for explicit 'category' or a known category word
  const known = ['fruit', 'fruits', 'vegetable', 'vegetables', 'dairy', 'snack', 'snacks', 'grain', 'spice', 'beverage', 'meat', 'seafood', 'bakery', 'household'];
  let category: string | null = null;
  const catMatch = base.match(/category\s*(?:is|:)\s*([a-zA-Z]+)/i);
  if (catMatch) category = catMatch[1];
  else {
    for (const k of known) if (base.includes(k)) { category = k; break; }
  }

  // Name: remove leading verbs like 'add' and known tokens; take first segment before comma or before quantity/expiry keywords
  let name = raw;
  name = name.replace(/^add\s+/i, '');
  // strip quantity phrase
  if (qtyMatch) name = name.replace(qtyMatch[0], '');
  if (expiryDays !== null) {
    name = name.replace(new RegExp(expiryDays + "\\s*days?", 'i'), '');
  }
  name = name.replace(/expiry\s*:*/i, '');
  // stop at comma
  const commaIdx = name.indexOf(',');
  if (commaIdx > -1) name = name.slice(0, commaIdx);
  name = name.replace(/\b(category|expiry|expires|in|pieces|pcs|piece|kg|g|bunch|pack|packs|container|containers)\b/ig, '');
  name = name.replace(/\s{2,}/g, ' ').trim();

  return {
    name: name || undefined,
    quantity: quantity === undefined ? undefined : quantity,
    unit,
    expiryDays,
    category,
    raw
  };
}

export default function VoiceAddFloating() {
  const { addItem } = useLocalInventory();
  const ref = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return { x: 24, y: 200 };
  });
  const draggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);
  const [stoppedFlash, setStoppedFlash] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [expiryInput, setExpiryInput] = useState<string>(''); // expected dd/mm/yyyy
  const [expiryError, setExpiryError] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch (e) {}
  }, [pos]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      if (!pointerStartRef.current || !originRef.current) return;
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      // mark as moved if beyond small threshold to distinguish drag vs click
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) didMoveRef.current = true;
      setPos({ x: Math.max(8, originRef.current.x + dx), y: Math.max(8, originRef.current.y + dy) });
    };
    const onPointerUp = () => { draggingRef.current = false; pointerStartRef.current = null; originRef.current = null; };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  function startDrag(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    originRef.current = { x: pos.x, y: pos.y };
  }

  // Speech recognition and parsing
  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('SpeechRecognition not supported in this browser');
      if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 3000);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListening(true);
      setTranscript('');
      setParsed(null);
      setShowConfirm(false);
      setMessage('Recording started');
      if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current);
      // keep 'recording started' until end (or 3s)
      messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 3000);
    };
    rec.onerror = (ev: any) => {
      setMessage('Voice recognition error: ' + (ev.error || 'unknown'));
      setListening(false);
      if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 4000);
    };
    rec.onend = () => {
      setListening(false);
      setStoppedFlash(true);
      setMessage('Recording stopped');
      if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 2500);
      // clear flash after short delay
      window.setTimeout(() => setStoppedFlash(false), 1400);
    };
    rec.onresult = (ev: any) => {
      const t = ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript ? ev.results[0][0].transcript : '';
      setTranscript(t);
      const p = parseFreeFormTranscript(t);
      setParsed(p);
      setShowConfirm(true);
    };

    try {
      rec.start();
    } catch (e) {
      setMessage('Failed to start speech recognition');
      console.warn(e);
    }
  }

  function confirmAdd() {
    if (!parsed) return;
    const payload: any = { name: parsed.name || 'New Item' };
    if (parsed.quantity !== undefined) payload.quantity = parsed.quantity;
    if (parsed.unit) payload.unit = parsed.unit;
    // prefer manual category input if provided, else parsed
    if (categoryInput && categoryInput.trim().length > 0) payload.category = categoryInput.trim();
    else if (parsed.category) payload.category = parsed.category;

    // expiry: accept dd/mm/yyyy from expiryInput (optional)
    if (expiryInput && expiryInput.trim().length > 0) {
      const iso = ddmmyyyyToISO(expiryInput.trim());
      if (!iso) {
        setExpiryError('Invalid date (use dd/mm/yyyy)');
        return;
      }
      payload.expiryDate = iso;
    } else if (parsed.expiryDays !== null && parsed.expiryDays !== undefined) {
      payload.expiryDate = daysFromNowToISO(parsed.expiryDays);
    }

    const added = addItem(payload);
    setMessage('Added ' + (added.name || 'item'));
    setShowConfirm(false);
    setParsed(null);
    setTranscript('');
    setCategoryInput('');
    setExpiryInput('');
    setExpiryError(null);
    setTimeout(() => setMessage(null), 3000);
  }

  function ddmmyyyyToISO(s: string) {
    // accepts dd/mm/yyyy or d/m/yyyy
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    if (mo < 1 || mo > 12) return null;
    if (d < 1 || d > 31) return null;
    // basic month/day validity (doesn't check leap year thoroughly)
    const iso = new Date(y, mo - 1, d);
    if (isNaN(iso.getTime())) return null;
    // ensure day/month match (avoid overflow like 32 -> next month)
    if (iso.getDate() !== d || iso.getMonth() !== mo - 1 || iso.getFullYear() !== y) return null;
    return iso.toISOString().slice(0, 10);
  }

  function isoToDDMMYYYY(iso?: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const btnBg = listening ? 'bg-red-600 hover:bg-red-500' : (stoppedFlash ? 'bg-emerald-500/95' : 'bg-emerald-600 hover:bg-emerald-500');

  return (
    <div>
      <button
        ref={ref}
        onPointerDown={startDrag}
        onClick={(e) => {
          // if we moved (dragged) recently, ignore click
          if (didMoveRef.current) {
            // reset flag for next interaction
            didMoveRef.current = false;
            return;
          }
          // else start listening
          startListening();
        }}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
        }}
  className={`no-invert voice-animate ${btnBg} active:scale-95 transition-transform duration-150 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl ring-2 ring-white/20 relative`}
        aria-label="Voice add"
        title="Voice Add — drag to move"
      >
        {/* main mic icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 ${listening ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 1v11m0 0a3 3 0 0 0 3-3V4a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
          <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 0 1-14 0" />
        </svg>
        {/* plus badge to indicate add/inventory */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-emerald-700 text-xs font-semibold">+</div>
      </button>

      {/* small label so user recognizes purpose */}
      <div style={{ position: 'fixed', left: pos.x + 50, top: pos.y + 10 }} className="z-50 select-none">
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">Voice Add</div>
      </div>

      {/* confirmation popup */}
      {showConfirm && parsed && (
        <div style={{ position: 'fixed', left: pos.x + 64, top: pos.y }} className="z-50 max-w-xs p-3 bg-white rounded-lg shadow-lg border">
          <div className="text-sm text-slate-700">Detected:</div>
          <div className="mt-1 font-medium">{parsed.name || '—'}</div>
          <div className="text-xs text-slate-500 mt-1">{parsed.quantity ?? ''} {parsed.unit ?? ''}</div>

          {/* editable category and expiry fields (optional) */}
          <div className="mt-3">
            <label className="text-xs text-slate-600">Category (optional)</label>
            <input
              value={categoryInput || parsed.category || ''}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="e.g. fruit"
              className="mt-1 block w-full border px-2 py-1 rounded text-sm"
            />
          </div>

          <div className="mt-3">
            <label className="text-xs text-slate-600">Expiry date (optional, dd/mm/yyyy)</label>
            <input
              value={expiryInput || (parsed.expiryDays ? isoToDDMMYYYY(daysFromNowToISO(parsed.expiryDays)) : '')}
              onChange={(e) => { setExpiryInput(e.target.value); setExpiryError(null); }}
              placeholder="dd/mm/yyyy"
              className="mt-1 block w-full border px-2 py-1 rounded text-sm"
            />
            {expiryError && <div className="text-xs text-red-600 mt-1">{expiryError}</div>}
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={confirmAdd} className="px-3 py-1 bg-emerald-600 text-white rounded">Add</button>
            <button onClick={() => {
              setShowConfirm(false); setParsed(null); setTranscript(''); setCategoryInput(''); setExpiryInput(''); setExpiryError(null);
            }} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* transient message */}
      {message && (
        <div style={{ position: 'fixed', left: pos.x, top: pos.y + 72 }} className="z-50 p-2 bg-black/80 text-white rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
