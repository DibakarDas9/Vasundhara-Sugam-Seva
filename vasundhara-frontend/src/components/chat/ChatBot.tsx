"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChatBot } from '@/lib/chatbot';
import type { LocalItem } from '@/lib/localInventory';

export default function ChatBot() {
  const router = useRouter();
  const { ask, suggestions } = useChatBot();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{q:string,answers:{text:string;nav?:string}[]}[]>([]);
  const [pos, setPos] = useState<{left:number, top:number} | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = React.useRef<{startX:number,startY:number,startLeft:number,startTop:number} | null>(null);

  const BUTTON_KEY = 'vasundhara_chatbot_pos_v1';

  // initialize position from localStorage or default to bottom-right
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(BUTTON_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setPos({ left: p.left, top: p.top });
        return;
      }
    } catch (e) {
      // ignore
    }

    // default position: bottom-right with 24px margin
    const btnSize = 56; // px
    const margin = 24;
    const left = Math.max(12, window.innerWidth - btnSize - margin);
    const top = Math.max(12, window.innerHeight - btnSize - margin);
    setPos({ left, top });
  }, []);

  // save position
  function persistPos(p: {left:number, top:number}){
    try{ localStorage.setItem(BUTTON_KEY, JSON.stringify(p)); }catch(e){}
  }

  // pointer handlers for dragging
  function onPointerDown(e: React.PointerEvent) {
    if (!pos) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: pos.left, startTop: pos.top };
  }

  React.useEffect(()=>{
    function onPointerMove(e: PointerEvent) {
      if (!dragRef.current) return;
      const { startX, startY, startLeft, startTop } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const btnSize = 56;
      const left = Math.min(Math.max(0, startLeft + dx), window.innerWidth - btnSize - 8);
      const top = Math.min(Math.max(0, startTop + dy), window.innerHeight - btnSize - 8);
      setPos({ left, top });
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragRef.current) return;
      setDragging(false);
      persistPos(pos!);
      dragRef.current = null;
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [pos]);

  function submit() {
    if (!query.trim()) return;
    const answers = ask(query.trim());
    setHistory(prev => [{ q: query.trim(), answers }, ...prev]);
    setQuery('');
  }

  function handleNav(url?: string) {
    if (!url) return;
    setOpen(false);
    router.push(url);
  }

  // compute panel placement relative to button
  const panelWidth = 320;
  const panelHeight = 360; // approx
  const panelStyle = React.useMemo(() => {
    if (!pos) return { right: 24, bottom: 96 } as React.CSSProperties;
    // try place above the button, otherwise below
    const spaceAbove = pos.top;
    const spaceBelow = window.innerHeight - pos.top;
    const top = (spaceAbove > panelHeight + 24) ? pos.top - panelHeight - 12 : pos.top + 64 + 12;
    let left = pos.left;
    // clamp so panel fits
    left = Math.min(Math.max(8, left), window.innerWidth - panelWidth - 8);
    return { position: 'fixed' as const, left: `${left}px`, top: `${top}px`, zIndex: 60 };
  }, [pos]);

  return (
    <div className="z-50">
      {open ? (
        <div style={panelStyle} className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-medium">Assistant</div>
            <div className="flex items-center space-x-2">
              <Button size="xs" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>

          <div className="p-3 space-y-2 max-h-64 overflow-auto">
            {history.length === 0 && (
              <div className="text-sm text-gray-600">Ask me about your inventory, recipes, navigation or commands. Try: "what's expiring soon"</div>
            )}

            {history.map((h, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xs text-gray-500">You: {h.q}</div>
                <div className="space-y-1">
                  {h.answers.map((a, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-800">{a.text}</div>
                      {a.nav && (
                        <div className="mt-2">
                          <Button size="xs" variant="ghost" onClick={() => handleNav(a.nav)}>{`Open ${a.nav}`}</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder="Ask anything..." />
              <Button onClick={submit}>Ask</Button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.slice(0,6).map((s: string, i: number) => (
                <button key={i} onClick={() => { setQuery(s); const answers = ask(s); setHistory(prev => [{ q: s, answers }, ...prev]); }} className="px-2 py-1 text-xs bg-gray-100 rounded">{s}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // draggable button
        pos && (
          <div style={{ position: 'fixed', left: pos.left, top: pos.top, zIndex: 70 }}>
            <div
              role="button"
              tabIndex={0}
              onPointerDown={onPointerDown}
              onDoubleClick={() => { /* reset to default */ persistPos({ left: window.innerWidth - 80 - 24, top: window.innerHeight - 80 - 24 }); setPos({ left: window.innerWidth - 80 - 24, top: window.innerHeight - 80 - 24 }); }}
              onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
              className={`w-14 h-14 rounded-full ${dragging ? 'opacity-80' : ''} bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg flex items-center justify-center cursor-grab`}
            >
              <button onClick={() => setOpen(true)} className="w-full h-full rounded-full flex items-center justify-center text-white" aria-label="Open assistant">🤖</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
