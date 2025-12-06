'use client';

import { useEffect, useMemo, useState, useRef, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  UserPlusIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'About Us', href: '#about' },
  { label: 'Inventory', href: '#inventory' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Scan', href: '/scan' },
  { label: 'Analytics', href: '#analytics' }
];

const heroStats = [
  { label: 'Neighborhoods live', value: '42', detail: '+6 joined this month' },
  { label: 'Food saved each week', value: '18.4 tons', detail: 'Shared instead of wasted' },
  { label: 'Help response time', value: '2m 13s', detail: 'From alert to action' }
];

const featureHighlights: Array<{ title: string; description: string; icon: IconType; badge: string; accent: string }> = [
  {
    title: 'Quick barcode scan',
    description: 'Point a camera or scan a code to add items and expiries in seconds.',
    icon: CameraIcon,
    badge: 'Scan fast',
    accent: 'from-emerald-400/80 to-cyan-400/80'
  },
  {
    title: 'Talk-to-add',
    description: 'Say “add 10 kg rice for ward 3” and the form fills up for you.',
    icon: MicrophoneIcon,
    badge: 'Voice input',
    accent: 'from-blue-400/80 to-indigo-400/80'
  },
  {
    title: 'Smart planning',
    description: 'We suggest what to cook, donate, or sell so nothing spoils.',
    icon: CpuChipIcon,
    badge: 'Plan smart',
    accent: 'from-purple-400/80 to-fuchsia-400/80'
  },
  {
    title: 'Impact reports',
    description: 'Simple dashboards show meals served, money saved, and carbon reduced.',
    icon: ChartBarIcon,
    badge: 'See results',
    accent: 'from-amber-400/80 to-orange-400/80'
  }
];

const aboutPillars = [
  {
    title: 'Safe for public teams',
    copy: 'Secure logins and audit trails protect citizen data.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Made for everyone',
    copy: 'Households, shops, NGOs, and city staff share one simple picture.',
    icon: UserPlusIcon
  },
  {
    title: 'Helpful automation',
    copy: 'The system suggests next steps while you stay in control.',
    icon: SparklesIcon
  }
];

const journeySteps = [
  {
    title: 'Capture in seconds',
    copy: 'Scan or speak to log stock. No spreadsheets or long forms.'
  },
  {
    title: 'Organize automatically',
    copy: 'Expiry dates, locations, and recipes link themselves up.'
  },
  {
    title: 'Share or sell fast',
    copy: 'Push items to donation drives, kitchens, or the marketplace with one tap.'
  },
  {
    title: 'Celebrate impact',
    copy: 'See live counts of meals served and waste avoided.'
  }
];

const liveMoments = [
  {
    title: 'Pantry update',
    detail: '17 items arriving today • 5 expiring soon',
    highlight: 'Extra stock automatically sent to nearby NGOs',
    accent: 'from-emerald-500/80 to-sky-500/80'
  },
  {
    title: 'Marketplace spotlight',
    detail: '138 local buyers online',
    highlight: 'Prices adjust so farmers and SHGs earn fairly',
    accent: 'from-orange-500/80 to-pink-500/80'
  },
  {
    title: 'Community drives',
    detail: '4 Sugam Seva drives live right now',
    highlight: 'Volunteers get credits and UPI payouts on time',
    accent: 'from-indigo-500/80 to-violet-500/80'
  }
];

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
  const { login, register } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const sevaWords = useMemo(
    () => ['Seva', 'সেবা', 'सेवा', 'சேவை', 'సేవ', 'സേവ', 'سیوا', 'Seva'],
    []
  );
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
      setFeedback('Please complete all required fields.');
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
      setFeedback('Welcome aboard! Redirecting you to the dashboard.');
      router.push('/dashboard');
    } catch (error) {
      setFeedback('Authentication failed. Please double-check your details.');
    } finally {
      setAuthLoading(false);
    }
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
            <Image src="/logo.svg" alt="Vasundhara Sugam Seva logo" width={40} height={40} className="h-10 w-10" priority />
            <div>
              <p className="font-semibold tracking-wide">Vasundhara</p>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Sugam Seva</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/80 lg:flex">
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
            <Link
              href="/auth"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/auth"
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
            >
              Sign up
            </Link>
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
                <div className="flex gap-3 pt-2">
                  <Link
                    href="/auth"
                    className="flex-1 rounded-2xl border border-white/20 px-4 py-2 text-center"
                    onClick={() => setNavOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth"
                    className="flex-1 rounded-2xl bg-emerald-400 px-4 py-2 text-center text-slate-900"
                    onClick={() => setNavOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-32 pt-40 sm:px-8">
        <section id="hero" className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial="hidden" animate="visible" variants={motionFade}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em]">
              <SparklesIcon className="h-4 w-4 text-emerald-300" />
              Sugam Seva Platform
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Less waste, more meals for every ward.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              Vasundhara helps community kitchens, volunteers, and city teams track food, move extra stock quickly, and show the impact in plain language.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-900 shadow-xl shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Enter Dashboard
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Watch scan-to-sale
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-300">{stat.label}</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-emerald-200">{stat.detail}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-6 shadow-[0_40px_120px_rgba(15,118,110,0.35)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Live signal</p>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">Realtime</span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
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
              <p className="mt-2 text-sm text-slate-300">Vision + Voice + ML fused in one ribbon.</p>

              <div className="mt-8 space-y-4">
                {liveMoments.map((moment, index) => (
                  <motion.div
                    key={moment.title}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br ${moment.accent} p-4 text-slate-900 shadow-lg backdrop-blur-lg`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * index, duration: 0.6 }}
                  >
                    <div className="text-sm font-semibold">{moment.title}</div>
                    <p className="text-xs text-slate-900/80">{moment.detail}</p>
                    <p className="mt-1 text-sm font-semibold">{moment.highlight}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <BoltIcon className="h-5 w-5 text-amber-300" />
                98.4% automation for repetitive inputs—humans just approve the magic.
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">About us</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Built with cities and citizens together.</h2>
              <p className="mt-2 max-w-2xl text-base text-slate-200">
                Vasundhara is a simple mission hub where households, volunteers, NGOs, and city offices work off the same facts and move faster for the community.
              </p>
            </div>
            <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100">
              Read our playbook
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
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
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Inventory & workflows</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Everything in one simple place.</h2>
              <p className="mt-2 max-w-2xl text-base text-slate-200">
                Scan stock, speak updates, plan meals, donate extras, and sell fresh produce without jumping across apps.
              </p>
            </div>
            <Link href="/analytics" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              Preview analytics
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
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

        <section id="analytics" className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Follow the journey at a glance.</h2>
              <p className="mt-2 max-w-xl text-base text-slate-200">These four steps show how food moves from scan to table without waste.</p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-300">
              <CloudArrowUpIcon className="h-4 w-4" />
              synced across devices
            </span>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-4">
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
                  Phase {index + 1}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-200">{step.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/15 bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-emerald-900/40 p-8 shadow-[0_40px_120px_rgba(16,185,129,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">Friendly experience</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Feels alive, not complicated.</h2>
              <p className="mt-3 max-w-2xl text-base text-white/80">
                Smooth animations guide your eye, show live changes, and make every action feel rewarding for citizens and staff alike.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-white/70">
              <span className="rounded-full border border-white/40 px-4 py-2">Micro-interactions</span>
              <span className="rounded-full border border-white/40 px-4 py-2">Lottie ready</span>
              <span className="rounded-full border border-white/40 px-4 py-2">Framer Motion</span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
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
                  Designed for continuous discovery—drag, tap, hover, and feel the platform respond.
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/5 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">Ready to launch Sugam Seva drives in your ward?</p>
              <p className="text-sm text-white/80">Spin up the dashboard, invite volunteers, and broadcast impact in minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Launch pilot
              </Link>
              <Link href="/marketplace" className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                View marketplace
              </Link>
            </div>
          </div>
        </section>

        <section id="access" className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Login & signup</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Sign in or create an account.</h2>
              <p className="mt-3 text-base text-slate-200">
                You can use this quick form or open the full <Link href="/auth" className="text-emerald-300 underline">auth page</Link>. Either way you get access to the same tools.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                <li>• One login covers the dashboard, drives, and marketplace.</li>
                <li>• Light or dark mode keeps your screen comfortable.</li>
                <li>• Guests can still explore before signing up.</li>
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
                    {mode === 'login' ? 'Login' : 'Sign up'}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {authMode === 'signup' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                    <Input
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                )}
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <Button className="w-full" onClick={handleAuth} disabled={authLoading}>
                  {authLoading ? 'Processing...' : authMode === 'login' ? 'Login and continue' : 'Create account'}
                </Button>
                {feedback && <p className="text-sm text-emerald-200">{feedback}</p>}
                <div className="text-xs text-slate-400">
                  By continuing you agree to the mission: reduce waste, feed more, and keep Sugam Seva thriving.
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}