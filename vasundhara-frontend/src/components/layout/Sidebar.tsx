'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileNav } from '@/contexts/MobileNavContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HomeIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ClockIcon,
  MapIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  GiftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { isSystemAdminAccount } from '@/lib/localAuth';

const baseNav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Inventory', href: '/inventory', icon: ShoppingCartIcon },
  { name: 'Meal Planning', href: '/meal-planning', icon: ClockIcon },
  { name: 'AI Scanner', href: '/ai-scan', icon: SparklesIcon },
  { name: 'Marketplace', href: '/marketplace', icon: MapIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

const homeownerNav = [
  ...baseNav,
  { name: 'Rewards', href: '/rewards', icon: GiftIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const shopNav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Marketplace', href: '/marketplace', icon: MapIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Inventory (Shop)', href: '/inventory', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const adminNav = [
  { name: 'Overview', href: '/admin', icon: Squares2X2Icon },
  { name: 'Users & Shops', href: '/admin/users', icon: UserIcon },
  { name: 'Inventory', href: '/admin/inventory', icon: ShoppingCartIcon },
  { name: 'Marketplace', href: '/admin/marketplace', icon: MapIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Rewards', href: '/admin/rewards', icon: GiftIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },

  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, guestMode, guestName, guestEmail, user } = useAuth();
  const { t } = useLanguage();

  const getTranslatedName = (name: string) => {
    switch (name) {
      case 'Home': return t('nav.home', 'Home');
      case 'Dashboard': return t('nav.dashboard', 'Dashboard');
      case 'Inventory': return t('nav.inventory', 'Inventory');
      case 'Meal Planning': return t('nav.mealPlanning', 'Meal Planning');
      case 'AI Scanner': return t('nav.aiScanner', 'AI Scanner');
      case 'Marketplace': return t('nav.marketplace', 'Marketplace');
      case 'Analytics': return t('nav.analytics', 'Analytics');
      case 'Rewards': return t('nav.rewards', 'Rewards');
      case 'Notifications': return t('nav.notifications', 'Notifications');
      case 'Settings': return t('nav.settings', 'Settings');
      case 'Orders': return t('nav.orders', 'Orders');
      case 'Inventory (Shop)': return t('nav.inventoryShop', 'Inventory (Shop)');
      case 'Overview': return t('nav.overview', 'Overview');
      case 'Users & Shops': return t('nav.usersShops', 'Users & Shops');
      default: return name;
    }
  };

  // Check if we're in the admin area by URL path
  const isAdminArea = pathname?.startsWith('/admin');

  // Determine navigation items based on context
  const persona = isAdminArea
    ? 'admin'
    : (user?.role && ['household', 'shopkeeper'].includes(user.role)
      ? (user.role as 'household' | 'shopkeeper')
      : (role || 'household'));

  const navItems = persona === 'shopkeeper' ? shopNav : persona === 'admin' ? adminNav : homeownerNav;
  const { open, setOpen } = useMobileNav();
  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const profileName = guestMode
    ? (guestName || 'Guest User')
    : userFullName;
  const profileEmail = guestMode
    ? (guestEmail || '')
    : user?.email || '';
  const normalizedEmail = profileEmail.trim().toLowerCase();
  const normalizedName = profileName.trim().toLowerCase();
  const isDibakarAccount = Boolean(
    normalizedEmail.includes('dibakar') ||
    normalizedName.includes('dibakar') ||
    normalizedEmail.includes('dibakardas612@gmail.com')
  );
  const avatarSrc = user?.profileImage?.trim()
    || (isSystemAdminAccount(user || {}) || isDibakarAccount ? '/team/dibakar.jpg' : undefined);
  const hasAvatar = Boolean(avatarSrc);
  const showProfileDetails = Boolean(profileName || profileEmail || hasAvatar);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (open && previousPathnameRef.current !== pathname) {
      setOpen(false);
    }
    previousPathnameRef.current = pathname;
  }, [pathname, open, setOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden md:flex flex-col h-full app-sidebar border-app transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 relative">
              <Logo className="w-full h-full text-emerald-600" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="block text-xl font-bold text-app">Vasundhara</span>
                <span className="text-xs uppercase tracking-[0.4em] text-emerald-600">Sugam Seva</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover-soft transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-muted" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-muted" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            // hide some pages for guest mode
            if (guestMode && ['/notifications', '/rewards', '/orders'].includes(item.href)) return null;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive ? 'active-nav' : 'text-muted hover-soft',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className={cn('w-5 h-5', collapsed && 'mx-auto')} />
                {!collapsed && <span className="text-app">{getTranslatedName(item.name)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        {showProfileDetails && (
          <div className="p-4 border-t border-app">
            <div className={cn(
              'flex items-center space-x-3',
              collapsed && 'justify-center'
            )}>
              <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profileName || 'Profile'} className="w-full h-full object-cover" loading="eager" />
                ) : (
                  <UserIcon className="w-5 h-5 text-gray-600" />
                )}
              </div>
              {!collapsed && (profileName || profileEmail) && (
                <div className="flex-1 min-w-0">
                  {profileName && (
                    <p className="text-sm font-medium text-app truncate">
                      {profileName}
                    </p>
                  )}
                  {profileEmail && (
                    <p className="text-xs text-muted truncate">
                      {profileEmail}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile drawer overlay */}
      <div className="md:hidden">
        {open && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[86vw] max-w-xs flex-col overflow-y-auto rounded-r-3xl border-r border-app bg-app p-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-app pb-4 pt-1">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
                    <img src="/logo.svg" alt="Vasundhara logo" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-lg font-bold leading-tight text-app block">Vasundhara</span>
                    <span className="block text-[10px] uppercase tracking-[0.4em] text-emerald-600">Sugam Seva</span>
                  </div>
                </Link>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close navigation menu">
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-2">
                {navItems.map((item) => {
                  if (guestMode && ['/notifications', '/rewards', '/orders'].includes(item.href)) return null;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={cn(
                      'flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive ? 'active-nav' : 'text-muted hover-soft'
                    )}>
                      <item.icon className="w-5 h-5" />
                      <span>{getTranslatedName(item.name)}</span>
                    </Link>
                  );
                })}
              </nav>
              {showProfileDetails && (
                <div className="border-t border-app pt-4 pb-2">
                  <div className="flex items-center space-x-3 rounded-2xl border border-app bg-white/60 p-3 dark:bg-white/5">
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={profileName || 'Profile'} className="w-full h-full object-cover" loading="eager" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {profileName && (
                        <p className="truncate text-sm font-medium text-app">{profileName}</p>
                      )}
                      {profileEmail && (
                        <p className="truncate text-xs text-muted">{profileEmail}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
