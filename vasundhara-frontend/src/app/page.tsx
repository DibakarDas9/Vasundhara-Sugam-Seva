'use client';

import { useEffect, useMemo, useState, useRef, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowRightIcon,
  CameraIcon,
  MicrophoneIcon,
  ChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  UserPlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Footer from '@/components/layout/Footer';
import VardOverlay from '@/components/ai/VardOverlay';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const motionFade = {
  hidden: { opacity: 0, y: 32 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.1 * index,
      ease: 'easeOut'
    }
  })
};

export default function HomePage() {
  const router = useRouter();
  const { login, register, user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [vardOpen, setVardOpen] = useState(false);
  const sevaWords = useMemo(
    () => ['Seva', 'সেবা', 'सेवा', 'சேவை', 'సేవ', 'സേവ', 'سیوا', 'Seva'],
    []
  );

  const navLinks = useMemo(() => [
    { label: t('nav.dashboard', 'Dashboard'), href: '/dashboard' },
    { label: t('nav.founders', 'Founders'), href: '/about' },
    { label: t('nav.inventory', 'Inventory'), href: '#inventory' },
    { label: t('nav.marketplace', 'Marketplace'), href: '/marketplace' },
    { label: t('nav.analytics', 'Analytics'), href: '#analytics' }
  ], [t]);

  const heroStats = useMemo(() => [
    { label: t('stats.neighborhoods', 'Neighborhoods live'), value: '42', detail: t('stats.neighborhoods.detail', '+6 joined this month') },
    { label: t('stats.foodSaved', 'Food saved each week'), value: '18.4 tons', detail: t('stats.foodSaved.detail', 'Shared instead of wasted') },
    { label: t('stats.responseTime', 'Help response time'), value: '2m 13s', detail: t('stats.responseTime.detail', 'From alert to action') }
  ], [t]);

  const featureHighlights = useMemo(() => [
    {
      title: t('features.scan.title', 'Quick barcode scan'),
      description: t('features.scan.copy', 'Point a camera or scan a code to add items and expiries in seconds.'),
      icon: CameraIcon,
      badge: t('features.scan.badge', 'Scan fast'),
      accent: 'from-emerald-400/80 to-cyan-400/80'
    },
    {
      title: t('features.voice.title', 'Talk-to-add'),
      description: t('features.voice.copy', 'Say “add 10 kg rice for ward 3” and the form fills up for you.'),
      icon: MicrophoneIcon,
      badge: t('features.voice.badge', 'Voice input'),
      accent: 'from-blue-400/80 to-indigo-400/80'
    },
    {
      title: t('features.planning.title', 'Smart planning'),
      description: t('features.planning.copy', 'We suggest what to cook, donate, or sell so nothing spoils.'),
      icon: CpuChipIcon,
      badge: t('features.planning.badge', 'Plan smart'),
      accent: 'from-purple-400/80 to-fuchsia-400/80'
    },
    {
      title: t('features.reports.title', 'Impact reports'),
      description: t('features.reports.copy', 'Simple dashboards show meals served, money saved, and carbon reduced.'),
      icon: ChartBarIcon,
      badge: t('features.reports.badge', 'See results'),
      accent: 'from-amber-400/80 to-orange-400/80'
    }
  ], [t]);

  const aboutPillars = useMemo(() => [
    {
      title: t('pillar.safe.title', 'Safe for public teams'),
      copy: t('pillar.safe.copy', 'Secure logins and audit trails protect citizen data.'),
      icon: ShieldCheckIcon
    },
    {
      title: t('pillar.everyone.title', 'Made for everyone'),
      copy: t('pillar.everyone.copy', 'Households, shops, NGOs, and city staff share one simple picture.'),
      icon: UserPlusIcon
    },
    {
      title: t('pillar.automation.title', 'Helpful automation'),
      copy: t('pillar.automation.copy', 'The system suggests next steps while you stay in control.'),
      icon: SparklesIcon
    }
  ], [t]);

  const journeySteps = useMemo(() => [
    {
      title: t('journey.step1.title', 'Capture in seconds'),
      copy: t('journey.step1.copy', 'Scan or speak to log stock. No spreadsheets or long forms.')
    },
    {
      title: t('journey.step2.title', 'Organize automatically'),
      copy: t('journey.step2.copy', 'Expiry dates, locations, and recipes link themselves up.')
    },
    {
      title: t('journey.step3.title', 'Share or sell fast'),
      copy: t('journey.step3.copy', 'Push items to donation drives, kitchens, or the marketplace with one tap.')
    },
    {
      title: t('journey.step4.title', 'Celebrate impact'),
      copy: t('journey.step4.copy', 'See live counts of meals served and waste avoided.')
    }
  ], [t]);

  const liveMoments = useMemo(() => [
    {
      title: t('live.pantryTitle', 'Pantry update'),
      detail: t('live.pantryDetail', '17 items arriving today • 5 expiring soon'),
      highlight: t('live.pantryHighlight', 'Extra stock automatically sent to nearby NGOs'),
      accent: 'from-emerald-500/80 to-sky-500/80'
    },
    {
      title: t('live.marketTitle', 'Marketplace spotlight'),
      detail: t('live.marketDetail', '138 local buyers online'),
      highlight: t('live.marketHighlight', 'Prices adjust so farmers and SHGs earn fairly'),
      accent: 'from-orange-500/80 to-pink-500/80'
    },
    {
      title: t('live.drivesTitle', 'Community drives'),
      detail: t('live.drivesDetail', '4 Sugam Seva drives live right now'),
      highlight: t('live.drivesHighlight', 'Volunteers get credits and UPI payouts on time'),
      accent: 'from-indigo-500/80 to-violet-500/80'
    }
  ], [t]);
  const [sevaIndex, setSevaIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const word = sevaWords[sevaIndex];
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 65;
    const deleteSpeed = 45;
    const holdDelay = 220;

    function handleType() {
      if (!isDeleting) {
        if (charIndex <= word.length) {
          setTypedText(word.slice(0, charIndex));
          charIndex += 1;
          typingRef.current = setTimeout(handleType, typeSpeed);
        } else {
          isDeleting = true;
          typingRef.current = setTimeout(handleType, holdDelay);
        }
      } else {
        if (charIndex >= 0) {
          setTypedText(word.slice(0, charIndex));
          charIndex -= 1;
          typingRef.current = setTimeout(handleType, deleteSpeed);
        } else {
          setSevaIndex((prev) => (prev + 1) % sevaWords.length);
        }
      }
    }

    handleType();
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [sevaIndex, sevaWords]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleAuth = async () => {
    if (!form.email || !form.password || (authMode === 'signup' && !form.firstName)) {
      setFeedback('complete');
      return;
    }

    setAuthLoading(true);
    setFeedback('');
    try {
      if (authMode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          role: 'household',
          householdProfile: {},
        });
      }
      setFeedback('welcome');
      router.push('/dashboard');
    } catch (error) {
      setFeedback('failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.trim() || user.email?.[0] || 'U'
    : '';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <motion.div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[40rem] bg-gradient-to-b from-emerald-500/10 via-slate-900 to-transparent"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.header
        className={`fixed top-0 left-0 right-0 z-20 border-b transition-all ${scrolled ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <Logo className="h-10 w-10 text-emerald-400" />
            <div>
              <p className="font-semibold tracking-wide">Vasundhara</p>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Sugam Seva</p>
            </div>
          </Link>

          <div className="hidden items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-white/70 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                className="relative transition hover:text-white"
              >
                <span>{link.label}</span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-0.5 w-full bg-emerald-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <LanguageSelector />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-200 hover:text-white hover:bg-emerald-500/20 text-xs"
                onClick={() => setVardOpen(true)}
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                VARD
              </Button>
            )}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 pr-3 hover:bg-white/10 transition outline-none"
                >
                  <div className="h-8 w-8 rounded-full border border-white/20 bg-emerald-500/20 overflow-hidden flex items-center justify-center text-xs font-semibold text-white">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.firstName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-white/90 hidden sm:inline-block max-w-[80px] truncate">{user.firstName}</span>
                  <ChevronDownIcon className="w-3 h-3 text-white/50" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border p-1.5 shadow-xl z-50 backdrop-blur-xl bg-slate-950/90 border-white/10 text-white"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1.5">
                        <p className="text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-emerald-300 truncate capitalize">{user.role}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => { setProfileMenuOpen(false); router.push('/dashboard'); }}
                          className="w-full flex items-center px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/5 transition"
                        >
                          {t('nav.dashboard', 'Dashboard')}
                        </button>
                        <button
                          onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center px-3 py-2 rounded-xl text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                        >
                          {t('nav.signout', 'Sign out')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t('nav.login', 'Login')}
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
                >
                  {t('nav.signup', 'Sign up')}
                </Link>
              </>
            )}
          </div>

          <button className="inline-flex lg:hidden" onClick={() => setNavOpen((prev) => !prev)} aria-label="Toggle navigation">
            {navOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden"
            >
              <div className="space-y-3 border-t border-white/10 bg-slate-900/95 px-4 py-4 text-sm font-semibold text-white/80">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    prefetch={false}
                    className="block rounded-2xl border border-white/10 px-4 py-3"
                    onClick={() => setNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border border-white/20 bg-white/10 overflow-hidden flex items-center justify-center text-lg font-semibold">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.firstName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{userInitials}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-emerald-200">{t('nav.loggedIn', 'You are signed in')}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => { setNavOpen(false); router.push('/dashboard'); }}
                        className="flex-1 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        {t('nav.openApp', 'Go to dashboard')}
                      </button>
                      <button
                        onClick={() => { setNavOpen(false); handleLogout(); }}
                        className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80"
                      >
                        {t('nav.signout', 'Sign out')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/auth"
                      className="flex-1 rounded-2xl border border-white/20 px-4 py-2 text-center"
                      onClick={() => setNavOpen(false)}
                    >
                      {t('nav.login', 'Login')}
                    </Link>
                    <Link
                      href="/auth"
                      className="flex-1 rounded-2xl bg-emerald-400 px-4 py-2 text-center text-slate-900"
                      onClick={() => setNavOpen(false)}
                    >
                      {t('nav.signup', 'Sign up')}
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 px-2">
                  <span className="text-xs font-semibold text-white/60">Language / ভাষা / भाषा</span>
                  <LanguageSelector />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {user && (
        <VardOverlay open={vardOpen} onClose={() => setVardOpen(false)} />
      )}

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-14 px-4 pb-20 pt-24 sm:px-8 lg:gap-16 lg:pt-28">
        <section id="hero" className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div className="flex h-full flex-col" initial="hidden" animate="visible" variants={motionFade}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em]">
              <SparklesIcon className="h-4 w-4 text-emerald-300" />
              {t('hero.platform', 'Sugam Seva Platform')}
            </div>
            <h1 className="max-w-[10.5ch] text-3xl font-semibold leading-[0.95] text-white sm:max-w-[11ch] sm:text-4xl lg:max-w-[12ch] lg:text-5xl">
              {t('hero.title', 'Less waste, more meals for every ward.')}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
              {t('hero.subtitle', 'Vasundhara helps community kitchens, volunteers, and city teams track food, move extra stock quickly, and show the impact in plain language.')}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-300 sm:px-6 sm:text-base"
              >
                {t('hero.enterDashboard', 'Enter Dashboard')}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-300 sm:text-xs sm:tracking-[0.3em]">{stat.label}</div>
                  <div className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-emerald-200 sm:text-sm">{stat.detail}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
 
          <div className="relative h-full">
            <motion.div
              className="flex h-full flex-col rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-4 shadow-[0_40px_120px_rgba(15,118,110,0.35)] backdrop-blur-xl sm:p-5"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{t('live.signal', 'Vasundhara')}</p>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">{t('live.realtime', 'Realtime')}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Sugam{' '}
                <span className="relative inline-flex min-w-[120px] justify-start">
                  <motion.span
                    key={`${sevaIndex}-${typedText}`}
                    className="inline-flex items-center font-semibold text-white"
                    animate={{
                      opacity: [0.5, 1, 0.8],
                      textShadow: ['0 0 6px rgba(255,255,255,0.5)', '0 0 14px rgba(255,255,255,0.9)', '0 0 6px rgba(255,255,255,0.5)']
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {typedText}
                    <motion.span
                      className="ml-1 block h-6 w-0.5 bg-white"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                    />
                  </motion.span>
                </span>
              </p>
              <p className="mt-1.5 text-sm text-slate-300">{t('live.ribbon', 'Vision + Voice + ML fused in one ribbon.')}</p>
 
              <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-300">
                  <span>{t('live.demo', 'Homepage explainer')}</span>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] tracking-normal text-emerald-200">অন্ন যদি হয় সঞ্চয়, বসুন্ধরার হবে জয়</span>
                </div>
                <video
                  className="h-full min-h-[320px] w-full flex-1 object-cover"
                  src="/Create_a_homepage_explainer_vi.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Homepage explainer video for Vasundhara"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">{t('about.title', 'About us')}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t('about.heading', 'Built with cities and citizens together.')}</h2>
              <p className="mt-2 max-w-2xl text-base text-slate-200">
                {t('about.description', 'Vasundhara is a simple mission hub where households, volunteers, NGOs, and city offices work off the same facts and move faster for the community.')}
              </p>
            </div>
            <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100">
              {t('about.playbook', 'Read our playbook')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3 lg:mt-8">
            {aboutPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                className="rounded-3xl border border-white/10 bg-slate-900/40 p-6"
                variants={motionFade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index}
              >
                <pillar.icon className="h-8 w-8 text-emerald-200" />
                <h3 className="mt-4 text-xl font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-200">{pillar.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="inventory">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">{t('features.title', 'Inventory & workflows')}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t('features.heading', 'Everything in one simple place.')}</h2>
              <p className="mt-2 max-w-2xl text-base text-slate-200">
                {t('features.description', 'Scan stock, speak updates, plan meals, donate extras, and sell fresh produce without jumping across apps.')}
              </p>
            </div>
            <Link href="/analytics" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              {t('features.previewAnalytics', 'Preview analytics')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:mt-10">
            {featureHighlights.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl"
                variants={motionFade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={index}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-20`} />
                <div className="relative flex items-center gap-3">
                  <feature.icon className="h-8 w-8 text-white" />
                  <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90">{feature.badge}</span>
                </div>
                <h3 className="relative mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="relative mt-3 text-sm text-slate-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="analytics" className="rounded-[40px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">{t('journey.title', 'How it works')}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t('journey.heading', 'Follow the journey at a glance.')}</h2>
              <p className="mt-2 max-w-xl text-base text-slate-200">{t('journey.description', 'These four steps show how food moves from scan to table without waste.')}</p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-300">
              <CloudArrowUpIcon className="h-4 w-4" />
              {t('journey.synced', 'synced across devices')}
            </span>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-4 lg:mt-10">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-6"
                variants={motionFade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={index}
              >
                <div className="flex items-center gap-3 text-sm text-emerald-200">
                  <CheckCircleIcon className="h-5 w-5" />
                  {t('journey.phase', 'Phase')} {index + 1}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-200">{step.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/15 bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-emerald-900/40 p-6 shadow-[0_40px_120px_rgba(16,185,129,0.25)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">{t('exp.title', 'Friendly experience')}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t('exp.heading', 'Feels alive, not complicated.')}</h2>
              <p className="mt-3 max-w-2xl text-base text-white/80">
                {t('exp.description', 'Smooth animations guide your eye, show live changes, and make every action feel rewarding for citizens and staff alike.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-white/70">
              <span className="rounded-full border border-white/40 px-4 py-2">{t('exp.badge1', 'Micro-interactions')}</span>
              <span className="rounded-full border border-white/40 px-4 py-2">{t('exp.badge2', 'Lottie ready')}</span>
              <span className="rounded-full border border-white/40 px-4 py-2">{t('exp.badge3', 'Framer Motion')}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-10">
            {['Tap-friendly cards', 'Floating action rails', 'Holographic stats'].map((item, index) => (
              <motion.div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-900"
                style={{ color: 'rgb(15, 118, 110)' }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-lg font-semibold">{item}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {t('exp.cardText', 'Designed for continuous discovery—drag, tap, hover, and feel the platform respond.')}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/5 p-5 text-white sm:flex-row sm:items-center sm:justify-between lg:mt-10">
            <div>
              <p className="text-lg font-semibold">{t('exp.pilotTitle', 'Ready to launch Sugam Seva drives in your ward?')}</p>
              <p className="text-sm text-white/80">{t('exp.pilotSubtitle', 'Spin up the dashboard, invite volunteers, and broadcast impact in minutes.')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                {t('exp.pilotLaunch', 'Launch pilot')}
              </Link>
              <Link href="/marketplace" className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                {t('exp.pilotMarketplace', 'View marketplace')}
              </Link>
            </div>
          </div>
        </section>

        <section id="access" className="rounded-[40px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">{t('nav.login', 'Login')} & {t('nav.signup', 'Sign up')}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t('auth.heading', 'Sign in or create an account.')}</h2>
              <p className="mt-3 text-base text-slate-200">
                {language === 'hi' ? (
                  <>आप इस त्वरित फ़ॉर्म का उपयोग कर सकते हैं या पूर्ण <Link href="/auth" className="text-emerald-300 underline">प्रमाणीकरण पृष्ठ</Link> खोल सकते हैं। दोनों ही मामलों में आपको समान उपकरण प्राप्त होते हैं।</>
                ) : language === 'bn' ? (
                  <>আপনি এই দ্রুত ফর্মটি ব্যবহার করতে পারেন বা সম্পূর্ণ <Link href="/auth" className="text-emerald-300 underline">প্রমাণীকরণ পৃষ্ঠাটি</Link> খুলতে পারেন। উভয় ক্ষেত্রেই আপনি একই সরঞ্জামগুলিতে অ্যাক্সেস পাবেন।</>
                ) : (
                  <>You can use this quick form or open the full <Link href="/auth" className="text-emerald-300 underline">auth page</Link>. Either way you get access to the same tools.</>
                )}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                <li>• {t('auth.benefit1', 'One login covers the dashboard, drives, and marketplace.')}</li>
                <li>• {t('auth.benefit2', 'Light or dark mode keeps your screen comfortable.')}</li>
                <li>• {t('auth.benefit3', 'Guests can still explore before signing up.')}</li>
              </ul>
            </div>

            <motion.div
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_20px_60px_rgba(16,185,129,0.25)]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex gap-2 rounded-2xl bg-white/5 p-1 text-sm font-semibold text-slate-200">
                {['login', 'signup'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAuthMode(mode as 'login' | 'signup')}
                    className={`flex-1 rounded-2xl px-4 py-2 transition ${authMode === mode ? 'bg-emerald-400 text-slate-900' : 'text-slate-200'
                      }`}
                  >
                    {mode === 'login' ? t('nav.login', 'Login') : t('nav.signup', 'Sign up')}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {authMode === 'signup' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder={t('auth.placeholderFirstName', 'First name')}
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                    <Input
                      placeholder={t('auth.placeholderLastName', 'Last name')}
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                )}
                <Input
                  placeholder={t('auth.placeholderEmail', 'Email')}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder={t('auth.placeholderPassword', 'Password')}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <Button className="w-full" onClick={handleAuth} disabled={authLoading}>
                  {authLoading ? t('auth.processing', 'Processing...') : authMode === 'login' ? t('auth.buttonLogin', 'Login and continue') : t('auth.buttonSignup', 'Create account')}
                </Button>
                {feedback && (
                  <p className="text-sm text-emerald-200">
                    {feedback === 'complete'
                      ? t('auth.feedbackComplete', 'Please complete all required fields.')
                      : feedback === 'welcome'
                      ? t('auth.feedbackWelcome', 'Welcome aboard! Redirecting you to the dashboard.')
                      : feedback === 'failed'
                      ? t('auth.feedbackFailed', 'Authentication failed. Please double-check your details.')
                      : feedback}
                  </p>
                )}
                <div className="text-xs text-slate-400">
                  {t('auth.missionText', 'By continuing you agree to the mission: reduce waste, feed more, and keep Sugam Seva thriving.')}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
