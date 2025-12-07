'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileNav } from '@/contexts/MobileNavContext';
import {
  HomeIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ClockIcon,
  CameraIcon,
  MapIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  GiftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const baseNav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Inventory', href: '/inventory', icon: ShoppingCartIcon },
  { name: 'Meal Planning', href: '/meal-planning', icon: ClockIcon },
  { name: 'Scan Items', href: '/scan', icon: CameraIcon },
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
  { name: 'ML Monitoring', href: '/admin/monitoring', icon: BoltIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, guestMode, guestName, guestEmail, user } = useAuth();

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
  const profileName = guestMode
    ? (guestName || 'Guest User')
    : user
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'John Doe';
  const profileEmail = guestMode
    ? (guestEmail || '')
    : user?.email || 'john@example.com';
  const profileImage = !guestMode ? user?.profileImage : undefined;

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
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 relative">
              <Logo className="w-full h-full text-emerald-600" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="block text-xl font-bold text-app">Vasundhara</span>
                <span className="text-xs uppercase tracking-[0.4em] text-emerald-600">Sugam Seva</span>
              </div>
            )}
          </div>
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
                {!collapsed && <span className="text-app">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-app">
          <div className={cn(
            'flex items-center space-x-3',
            collapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt={profileName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-600" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-app truncate">
                  {profileName}
                </p>
                <p className="text-xs text-muted truncate">
                  {profileEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <div className="md:hidden">
        {open && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-app border-app p-2">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 relative">
                    <Logo className="w-full h-full text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-app block leading-tight">Vasundhara</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-600">Sugam Seva</span>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5 text-gray-600" /></button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  if (guestMode && ['/notifications', '/rewards', '/orders'].includes(item.href)) return null;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive ? 'active-nav' : 'text-muted hover-soft'
                    )}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
