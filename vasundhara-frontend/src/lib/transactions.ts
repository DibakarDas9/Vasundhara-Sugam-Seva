/**
 * Vasundhara Transaction Store
 * ----------------------------
 * All transactions (premium subscriptions + marketplace deals) are stored in a single
 * localStorage key: `vasundhara_transactions`
 * This enables the admin (same device or when backend synced) to view all transactions.
 *
 * Structure per transaction:
 * {
 *   id, userId, userName, userEmail,
 *   type: 'premium' | 'marketplace',
 *   amount, description,
 *   status: 'unsettled' | 'settled',
 *   date, settledAt?, settledBy?, listingId?
 * }
 */

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'premium' | 'marketplace';
  amount: number; // in INR (0 = free)
  description: string;
  status: 'unsettled' | 'settled';
  date: string; // ISO string
  settledAt?: string;
  settledBy?: string;
  listingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const TXN_KEY = 'vasundhara_transactions';

// ─── Read/Write helpers ──────────────────────────────────────────────────────

export function getAllTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TXN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TXN_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new Event('vasundhara-transactions-update'));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

// ─── Add transaction ─────────────────────────────────────────────────────────

export function addTransaction(txn: Omit<Transaction, 'id' | 'status' | 'date'>): Transaction {
  const all = getAllTransactions();
  const newTxn: Transaction = {
    ...txn,
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'unsettled',
    date: new Date().toISOString(),
  };
  all.unshift(newTxn); // newest first
  saveAllTransactions(all);
  return newTxn;
}

// ─── Settle a transaction ─────────────────────────────────────────────────────

export function settleTransaction(txnId: string, settledBy: string): Transaction | null {
  const all = getAllTransactions();
  const idx = all.findIndex((t) => t.id === txnId);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    status: 'settled',
    settledAt: new Date().toISOString(),
    settledBy,
  };
  saveAllTransactions(all);
  return all[idx];
}

// ─── Get transactions for a specific user ────────────────────────────────────

export function getUserTransactions(userId: string): Transaction[] {
  return getAllTransactions().filter((t) => t.userId === userId);
}

// ─── Push a notification to any user's notification key ──────────────────────

export function pushNotificationToUser(
  userId: string,
  notification: { title: string; message: string; kind: 'success' | 'warning' | 'info' }
): void {
  try {
    const key = `vasundhara_notifications_${userId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
      kind: notification.kind,
      read: false,
    };
    existing.unshift(newNotif);
    localStorage.setItem(key, JSON.stringify(existing));
    // Trigger update event so UI picks it up in same tab
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch (err) {
    console.error('Failed to push notification to user', err);
  }
}
