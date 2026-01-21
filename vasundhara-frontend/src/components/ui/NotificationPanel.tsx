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

import { NotificationItem } from '@/lib/localInventory';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right';
  notifications: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onClearAll?: () => void;
}

export function NotificationPanel({ open, onClose, anchor = 'right', notifications, onMarkRead, onClearAll }: NotificationPanelProps) {
  const [loading, setLoading] = useState(false);

  // No internal items state, use props

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

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
          <span>{unreadCount} unread</span>
          <button
            onClick={() => {
              if (onClearAll) onClearAll();
            }}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 hover:bg-gray-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Clear all
          </button>
        </div>

        <div className="h-[calc(100%-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-4 p-5">
              {/* Skeletons */}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
              <BellIcon className="h-10 w-10 text-gray-300" />
              All caught up! We'll ping you when there's something new.
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {notifications.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border p-4 ${item.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                  onClick={() => onMarkRead && onMarkRead(item.id)}
                >
                  <div className="flex items-start gap-3">
                    {item.kind === 'success' && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
                    {item.kind === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-rose-500" />}
                    {(!item.kind || item.kind === 'info') && <ArrowPathIcon className="h-5 w-5 text-blue-500" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
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
