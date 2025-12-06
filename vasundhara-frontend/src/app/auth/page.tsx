'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function AuthLanding() {
  const router = useRouter();
  const { login, register, guestMode, setGuestMode, role, setRole, user, logout, guestName, guestEmail, setGuestInfo } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [householdFamilySize, setHouseholdFamilySize] = useState('');
  const [householdAddress, setHouseholdAddress] = useState('');
  const [householdWard, setHouseholdWard] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const effectiveRole = useMemo<'household' | 'shopkeeper' | 'admin'>(() => {
    if (role === 'shopkeeper' || role === 'admin' || role === 'household') return role;
    return 'household';
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  async function handleLogin() {
    try {
      await login(email, password);
    } catch (e) {
      // ignore - toast handled
    }
  }

  async function handleRegister() {
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        profileImage: profileImage || undefined,
        role: effectiveRole,
        householdProfile: effectiveRole === 'household' ? {
          familySize: householdFamilySize ? Number(householdFamilySize) : undefined,
          address: householdAddress,
          ward: householdWard,
        } : undefined,
        shopkeeperProfile: effectiveRole === 'shopkeeper' ? {
          businessName,
          licenseNumber,
          address: shopAddress,
        } : undefined,
      });
    } catch (e) { }
  }

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const roleConfig = {
    household: {
      icon: HomeIcon,
      label: 'Household',
      description: 'Manage your home inventory',
      gradient: 'from-emerald-500 to-teal-600'
    },
    shopkeeper: {
      icon: BuildingStorefrontIcon,
      label: 'Shopkeeper',
      description: 'Manage your shop & orders',
      gradient: 'from-amber-500 to-orange-600'
    },
    admin: {
      icon: ShieldCheckIcon,
      label: 'Admin',
      description: 'System administration',
      gradient: 'from-purple-500 to-indigo-600'
    }
  };

  const handleRoleSelect = (targetRole: 'household' | 'shopkeeper' | 'admin') => {
    if (targetRole === 'admin') {
      router.push('/admin/access');
      return;
    }
    setRole(targetRole);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {showSplash ? (
          <div className="animate-fade-in text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-50">
                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full" />
              </div>
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <Image src="/logo.svg" alt="Vasundhara emblem" width={160} height={160} priority className="drop-shadow-2xl" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">Vasundhara</h2>
            <p className="text-emerald-600 mt-3 text-lg font-semibold tracking-widest">SUGAM SEVA</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-500">
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Loading your experience...</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left side - Branding */}
              <div className="hidden lg:block space-y-8 px-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 blur-xl opacity-50">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl" />
                      </div>
                      <div className="relative w-16 h-16">
                        <Image src="/logo.svg" alt="Vasundhara emblem" width={64} height={64} className="drop-shadow-lg" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Vasundhara</h1>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">Sugam Seva</p>
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                    Smart Inventory<br />Management for<br />Modern Living
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Join thousands of households and shopkeepers streamlining their inventory with AI-powered insights.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-4">
                  {[
                    { icon: '🏠', text: 'Track household essentials effortlessly' },
                    { icon: '📊', text: 'Get smart recommendations & analytics' },
                    { icon: '🛒', text: 'Connect with local shops & marketplace' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Auth form */}
              <div className="w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-500/10 border border-white/20 p-8 sm:p-10">
                  {/* Mobile logo */}
                  <div className="lg:hidden flex items-center gap-3 mb-6">
                    <Image src="/logo.svg" alt="Vasundhara emblem" width={40} height={40} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Vasundhara</h3>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">Sugam Seva</p>
                    </div>
                  </div>

                  {!user && (
                    <>
                      {/* Tab switcher */}
                      <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
                        <button
                          onClick={() => setIsLogin(true)}
                          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${isLogin
                              ? 'bg-white text-emerald-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          Login
                        </button>
                        <button
                          onClick={() => setIsLogin(false)}
                          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${!isLogin
                              ? 'bg-white text-emerald-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          Sign up
                        </button>
                      </div>

                      {/* Role selector */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Continue as:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(roleConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            const isActive = effectiveRole === key;
                            return (
                              <button
                                key={key}
                                onClick={() => handleRoleSelect(key as 'household' | 'shopkeeper' | 'admin')}
                                className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${isActive
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}
                              >
                                <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <p className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-gray-600'}`}>
                                  {config.label}
                                </p>
                                {isActive && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Form */}
                      {isLogin ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <Input
                              placeholder="you@example.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <Input
                              placeholder="Enter your password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              type="password"
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                              Remember me
                            </label>
                            <button className="text-emerald-600 hover:text-emerald-700 font-semibold">
                              Forgot password?
                            </button>
                          </div>

                          <Button
                            onClick={handleLogin}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200"
                          >
                            <span className="flex items-center justify-center gap-2">
                              Sign in
                              <ArrowRightIcon className="w-4 h-4" />
                            </span>
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!guestName || !guestEmail) {
                                const name = prompt('Enter your name for guest mode') || '';
                                const mail = prompt('Enter your email for guest mode (optional)') || '';
                                if (name) setGuestInfo(name, mail);
                              }
                              setGuestMode(true);
                              router.push('/');
                            }}
                            className="w-full h-12 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold rounded-xl transition-all duration-200"
                          >
                            Continue as Guest
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">First name</label>
                              <Input placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Last name</label>
                              <Input placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Profile picture</label>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                  <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                                ) : (
                                  <UserCircleIcon className="w-10 h-10 text-emerald-400" />
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 cursor-pointer hover:border-emerald-400">
                                  Upload photo
                                  <input type="file" accept="image/*" className="sr-only" onChange={handleProfileImageUpload} />
                                </label>
                                {profileImage && (
                                  <button type="button" onClick={() => setProfileImage(null)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 text-left">
                                    Remove photo
                                  </button>
                                )}
                                <p className="text-xs text-gray-500">Square images work best. Max 3 MB.</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone number</label>
                            <Input placeholder="+91 98765 43210" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <Input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <Input placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
                          </div>

                          {effectiveRole === 'household' && (
                            <div className="space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-xl p-4">
                              <p className="text-emerald-900 font-bold text-sm flex items-center gap-2">
                                <HomeIcon className="w-4 h-4" />
                                Household details
                              </p>
                              <Input placeholder="Family size (e.g., 4)" value={householdFamilySize} onChange={e => setHouseholdFamilySize(e.target.value)} type="number" min={1} />
                              <Input placeholder="Address" value={householdAddress} onChange={e => setHouseholdAddress(e.target.value)} />
                              <Input placeholder="Ward / Block" value={householdWard} onChange={e => setHouseholdWard(e.target.value)} />
                            </div>
                          )}

                          {effectiveRole === 'shopkeeper' && (
                            <div className="space-y-3 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 rounded-xl p-4">
                              <p className="text-amber-900 font-bold text-sm flex items-center gap-2">
                                <BuildingStorefrontIcon className="w-4 h-4" />
                                Shopkeeper details
                              </p>
                              <Input placeholder="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                              <Input placeholder="License / GST number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                              <Input placeholder="Shop address" value={shopAddress} onChange={e => setShopAddress(e.target.value)} />
                            </div>
                          )}

                          <Button
                            onClick={handleRegister}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200"
                          >
                            <span className="flex items-center justify-center gap-2">
                              Create Account
                              <ArrowRightIcon className="w-4 h-4" />
                            </span>
                          </Button>

                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => { setGuestMode(true); router.push('/'); }}
                            className="w-full h-12 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold rounded-xl transition-all duration-200"
                          >
                            Try as Guest
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {user && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border border-emerald-100">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          <span>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
                        <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => router.push('/')}
                          className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl"
                        >
                          Go to Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={logout}
                          className="h-12 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl"
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
