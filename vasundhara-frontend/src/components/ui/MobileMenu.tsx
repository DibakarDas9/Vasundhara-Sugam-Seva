'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{ name: string; href: string }>;
  isAuthenticated: boolean;
  user: any;
  unreadCount: number;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigation,
  isAuthenticated,
  user,
  unreadCount,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            {item.name}
          </Link>
        ))}
        
        {isAuthenticated ? (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Welcome, {user?.firstName}
            </div>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/login" onClick={onClose}>
                Sign In
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/register" onClick={onClose}>
                Get Started
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
