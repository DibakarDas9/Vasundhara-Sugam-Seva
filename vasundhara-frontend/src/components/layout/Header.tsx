'use client';

import React, { useState, useEffect } from 'react';
import { BellIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileNav } from '@/contexts/MobileNavContext';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLocalInventory } from '@/lib/localInventory';

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggle } = useMobileNav();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { notifications, markNotificationRead, clearNotifications } = useLocalInventory();

  useEffect(() => {
    if (user?.premiumExpiry && user.premiumExpiry > Date.now()) {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  }, [user?.premiumExpiry]);

  // Check if we're in the admin area
  const isAdminArea = pathname?.startsWith('/admin');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (isAdminArea) {
      // Admin logout: clear gate token and redirect to access page
      localStorage.removeItem('vasundhara_admin_gate_token');
      localStorage.removeItem('vasundhara_admin_session_time');
      router.push('/admin/access');
    } else {
      // Regular logout
      logout();
    }
  };

  return (
    <>
      <header className={`app-header px-4 py-3 sm:px-6 sm:py-4 ${className}`}>
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={() => toggle()} aria-label="Open navigation menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" /></svg>
            </Button>

            <div className="flex items-center gap-1.5">
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-900/20"
                  onClick={() => window.dispatchEvent(new Event('vard-open'))}
                  aria-label="Open VARD AI"
                >
                  <SparklesIcon className="w-5 h-5" />
                </Button>
              )}

              <ThemeToggle />

              <LanguageSelector />

              <Button
                variant="ghost"
                size="sm"
                className="relative"
                aria-label="Open notifications"
                onClick={() => setNotificationsOpen(true)}
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {isAdminArea ? (
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" aria-label="Logout">
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </Button>
              ) : !user ? (
                <Button variant="ghost" size="icon" onClick={() => router.push('/auth')} aria-label="Login or sign up">
                  <UserCircleIcon className="w-7 h-7 text-gray-400" />
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {user.profileImage ? (
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700"
                      aria-label={`${user.firstName} ${user.lastName}`.trim() || 'Profile'}
                    >
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" aria-label="Logout">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold leading-tight text-app">{title}</h1>
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  <SparklesIcon className="w-2.5 h-2.5 text-yellow-100" />
                  Premium
                </span>
              )}
            </div>
            {subtitle && (
              <p className="hidden">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="md:hidden shrink-0">
              <Button variant="ghost" size="icon" onClick={() => toggle()} aria-label="Open navigation menu">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" /></svg>
              </Button>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold leading-tight text-app sm:text-2xl">{title}</h1>
                {isPremium && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm ring-1 ring-inset ring-yellow-500/20">
                    <SparklesIcon className="w-3 h-3 text-yellow-100" />
                    Premium
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted sm:mt-1 sm:text-sm">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-1.5">
            {/* Search */}
            {!isAdminArea && (
              <div className="hidden md:block mr-2">
                <Input
                  placeholder="Search items, recipes..."
                  icon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                  className="w-64"
                />
              </div>
            )}

            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-900/20 text-xs"
                  onClick={() => window.dispatchEvent(new Event('vard-open'))}
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  VARD
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-900/20"
                  onClick={() => window.dispatchEvent(new Event('vard-open'))}
                  aria-label="Open VARD AI"
                >
                  <SparklesIcon className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language Selector — minimal */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="Open notifications"
              onClick={() => setNotificationsOpen(true)}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Auth / Profile - Admin or Regular */}
            {isAdminArea ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden text-sm text-muted sm:inline">Admin</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </Button>
              </div>
            ) : !user ? (
              <Button variant="primary" size="sm" className="whitespace-nowrap" onClick={() => router.push('/auth')}>Login / Sign up</Button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:block">{user.firstName} {user.lastName}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {user.profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onClearAll={clearNotifications}
      />
    </>
  );
}