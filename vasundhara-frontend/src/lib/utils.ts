import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  // Format currency for Indian Rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateDaysUntilExpiry(expiryDate: string | Date) {
  // Normalize both dates to local midnight to compute whole days difference
  const today = new Date();
  const expiry = new Date(expiryDate);

  // Check for invalid date
  if (isNaN(expiry.getTime())) {
    return 0; // Return 0 or some indicator for invalid date
  }

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfExpiry = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffTime = startOfExpiry.getTime() - startOfToday.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryStatus(daysUntilExpiry: number) {
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 1) return 'critical';
  if (daysUntilExpiry <= 3) return 'warning';
  if (daysUntilExpiry <= 7) return 'caution';
  return 'good';
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function compressImageToThumbnail(base64Str: string, maxWidth = 160, maxHeight = 160): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve('');
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve('');
    };
  });
}