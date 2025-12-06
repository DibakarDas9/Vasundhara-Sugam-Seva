'use client';

import React from 'react';
import { BellIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileNav } from '@/contexts/MobileNavContext';

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

  // Check if we're in the admin area
  const isAdminArea = pathname?.startsWith('/admin');

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
    <header className={`app-header px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => toggle()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" /></svg>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-app">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {!isAdminArea && (
            <div className="hidden md:block">
              <Input
                placeholder="Search items, recipes..."
                icon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                className="w-64"
              />
            </div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Theme toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Auth / Profile - Admin or Regular */}
          {isAdminArea ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Admin</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </Button>
            </div>
          ) : !user ? (
            <Button variant="primary" size="sm" onClick={() => router.push('/auth')}>Login / Sign up</Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</span>
              <div className="flex items-center gap-2">
                {user.profileImage ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500 hover:text-red-500" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}