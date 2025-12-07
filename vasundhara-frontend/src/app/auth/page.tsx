'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
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
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] dark:opacity-[0.02]" />

        {/* Light mode gradients - Premium & Vibrant */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden dark:opacity-20 transition-opacity duration-300">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
        </div>

        {/* Dark mode gradients - Subtle & Deep */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-300">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-900/20 rounded-full filter blur-[128px] animate-pulse animation-delay-2000" />
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {showSplash ? (
          <div className="animate-fade-in text-center z-10">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30 dark:opacity-50">
                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full" />
              </div>
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <AnimatedLogo size={160} className="drop-shadow-2xl" />
              </div>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent tracking-tight mb-2">Vasundhara</h2>
            <p className="text-emerald-700 dark:text-emerald-400 text-lg font-bold tracking-[0.2em]">SUGAM SEVA</p>
            <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wider">Loading your experience...</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Branding */}
              <div className="hidden lg:block space-y-10 px-4">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="absolute inset-0 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl" />
                      </div>
                      <div className="relative w-20 h-20 transition-transform duration-500 group-hover:scale-105">
                        <Logo className="w-20 h-20 drop-shadow-xl text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Vasundhara</h1>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Sugam Seva</p>
                    </div>
                  </div>
                  <h2 className="text-5xl font-bold text-slate-800 dark:text-slate-100 leading-[1.15]">
                    Smart Inventory<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Management for</span><br />
                    Modern Living
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                    Join thousands of households and shopkeepers streamlining their inventory with AI-powered insights.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-6">
                  {[
                    { icon: '🏠', text: 'Track household essentials effortlessly', desc: 'Never run out of what you need' },
                    { icon: '📊', text: 'Get smart recommendations & analytics', desc: 'Data-driven decisions for your home' },
                    { icon: '🛒', text: 'Connect with local shops & marketplace', desc: 'Seamless shopping experience' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 backdrop-blur-sm transition-all hover:translate-x-2">
                      <span className="text-3xl bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">{item.icon}</span>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-lg">{item.text}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Auth form */}
              <div className="w-full">
                <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 dark:shadow-white/5 border border-white/40 dark:border-gray-800/50 p-6 sm:p-10 transition-all duration-300">
                  {/* Mobile logo */}
                  <div className="lg:hidden flex items-center gap-4 mb-8">
                    <Logo className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Vasundhara</h3>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold">Sugam Seva</p>
                    </div>
                  </div>

                  {!user && (
                    <>
                      {/* Tab switcher */}
                      <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <button
                          onClick={() => setIsLogin(true)}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${isLogin
                            ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                          Login
                        </button>
                        <button
                          onClick={() => setIsLogin(false)}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${!isLogin
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                          Sign up
                        </button>
                      </div>

                      {/* Role selector */}
                      <div className="mb-8">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 px-1">Continue as:</p>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(roleConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            const isActive = effectiveRole === key;
                            return (
                              <button
                                key={key}
                                onClick={() => handleRoleSelect(key as 'household' | 'shopkeeper' | 'admin')}
                                className={`relative p-3 rounded-2xl border-2 transition-all duration-200 group ${isActive
                                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 bg-transparent'
                                  }`}
                              >
                                <Icon className={`w-7 h-7 mx-auto mb-2 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                <p className={`text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {config.label}
                                </p>
                                {isActive && (
                                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white dark:border-slate-900 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Form */}
                      {isLogin ? (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email</label>
                            <Input
                              placeholder="you@example.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Password</label>
                            <Input
                              placeholder="Enter your password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              type="password"
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                              <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 bg-transparent" />
                              Remember me
                            </label>
                            <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold">
                              Forgot password?
                            </button>
                          </div>

                          <Button
                            onClick={handleLogin}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/40 transition-all duration-200 transform hover:-translate-y-0.5"
                          >
                            <span className="flex items-center justify-center gap-2">
                              Sign in
                              <ArrowRightIcon className="w-4 h-4" />
                            </span>
                          </Button>

                          <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white dark:bg-black text-gray-500 dark:text-gray-400 font-medium">or continue with</span>
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
                            className="w-full h-12 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-900 font-semibold rounded-xl transition-all duration-200"
                          >
                            Continue as Guest
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">First name</label>
                              <Input placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Last name</label>
                              <Input placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Profile picture</label>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                  <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                                ) : (
                                  <UserCircleIcon className="w-10 h-10 text-emerald-400 dark:text-emerald-600" />
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="inline-flex items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors">
                                  Upload photo
                                  <input type="file" accept="image/*" className="sr-only" onChange={handleProfileImageUpload} />
                                </label>
                                {profileImage && (
                                  <button type="button" onClick={() => setProfileImage(null)} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-left">
                                    Remove photo
                                  </button>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-500">Square images work best. Max 3 MB.</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Phone number</label>
                            <Input placeholder="+91 98765 43210" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email</label>
                            <Input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Password</label>
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
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/40 transition-all duration-200 transform hover:-translate-y-0.5"
                          >
                            <span className="flex items-center justify-center gap-2">
                              Create Account
                              <ArrowRightIcon className="w-4 h-4" />
                            </span>
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">or continue with</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => { setGuestMode(true); router.push('/'); }}
                            className="w-full h-12 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-900 font-semibold rounded-xl transition-all duration-200"
                          >
                            Try as Guest
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {user && (
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-emerald-100 dark:border-emerald-900 shadow-xl">
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
                        <p className="text-xl font-bold text-slate-900 dark:text-white">Welcome back!</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{user.firstName} {user.lastName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => router.push('/')}
                          className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl"
                        >
                          Go to Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={logout}
                          className="h-12 border-2 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-xl"
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-8">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold underline decoration-2 decoration-transparent hover:decoration-emerald-500 transition-all">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold underline decoration-2 decoration-transparent hover:decoration-emerald-500 transition-all">Privacy Policy</a>
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
