'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export type NotificationKind = 'success' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  kind?: NotificationKind;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right';
}

const demoNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Expiring items moved',
    message: '4 kg tomatoes queued for donation drive #27.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    kind: 'success',
  },
  {
    id: 'notif_2',
    title: 'Shopkeeper request',
    message: 'Sharma Kirana asked to restock rice inventory.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    kind: 'info',
  },
  {
    id: 'notif_3',
    title: 'Temperature alert',
    message: 'Cold storage Ward 5 is 4°C higher than safe range.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    kind: 'warning',
  },
];

function timeAgo(dateISO: string) {
  const now = Date.now();
  const then = new Date(dateISO).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationPanel({ open, onClose, anchor = 'right' }: NotificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(demoNotifications);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = setTimeout(() => {
      setItems(demoNotifications);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [open]);

  const unreadCount = useMemo(() => items.length, [items]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-50 flex justify-end bg-black/20 opacity-0 transition',
        open && 'pointer-events-auto opacity-100'
      )}
      onClick={onClose}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'relative h-full w-full max-w-sm bg-white shadow-2xl transition duration-300 ease-out',
          anchor === 'right' ? 'translate-x-full' : '-translate-x-full',
          open && 'translate-x-0'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Notifications</p>
            <h3 className="text-lg font-semibold text-gray-900">Activity center</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close notifications">
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-500">
          <span>{unreadCount} updates</span>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setItems([]);
                setLoading(false);
              }, 400);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 hover:bg-gray-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        <div className="h-[calc(100%-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-4 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-gray-100 p-4">
                  <div className="h-4 w-28 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-full rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
              <BellIcon className="h-10 w-10 text-gray-300" />
              All caught up! We'll ping you when there's something new.
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    {item.kind === 'success' && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
                    {item.kind === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-rose-500" />}
                    {item.kind !== 'success' && item.kind !== 'warning' && <ArrowPathIcon className="h-5 w-5 text-blue-500" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{timeAgo(item.timestamp)}</p>
                      <p className="mt-2 text-sm text-gray-700">{item.message}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
