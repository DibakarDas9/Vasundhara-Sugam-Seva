'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface TeamMemberData {
    name: string;
    role: string;
    image: string;
    email: string;
    phone?: string;
    location: string;
    summary: string;
    modeOfCommunication?: string;
    skills: {
        programming: string[];
        frontend: string[];
        backend: string[];
        database: string[];
        tools: string[];
    };
    languages: { name: string; level: string }[];
    education: { degree: string; institution: string; year: string; score?: string }[];
    projects: { name: string; description: string; tech: string }[];
    achievements: string[];
    social: { github?: string; linkedin?: string };
}

const teamMembers: TeamMemberData[] = [
    {
        name: 'Dibakar Das',
        role: 'Full-Stack Developer',
        image: '/team/dibakar.jpg',
        email: 'dibakardas612@gmail.com',
        phone: '+91 8617697897',
        location: 'Kolkata',
        summary: 'Full-stack student skilled in React, Node, and MySQL; built AI-powered sustainable interactive projects and ed-tech marketplace; seeking to work with versatility.',
        modeOfCommunication: 'English',
        skills: {
            programming: ['Java', 'JavaScript', 'C++', 'Python'],
            frontend: ['React', 'HTML', 'CSS', 'Tailwind', 'Chart.js'],
            backend: ['Node.js', 'Express.js', 'REST APIs'],
            database: ['MySQL'],
            tools: ['Git/GitHub', 'Vercel/Netlify'],
        },
        languages: [
            { name: 'English', level: 'Proficient' },
            { name: 'Bengali', level: 'Proficient' },
            { name: 'Hindi', level: 'Intermediate' },
        ],
        education: [
            { degree: 'BTech-CSE', institution: 'Abacus Institute of Engineering and Management, Magra', year: 'Expected 2026', score: 'SGPA: 8.83' },
            { degree: 'Class XII (ISC)', institution: 'Jogamaya Memorial Institute', year: '2022', score: '71.75%' },
            { degree: 'Class X (ICSE)', institution: 'Jogamaya Memorial Institute', year: '2020', score: '76%' },
        ],
        projects: [
            { name: 'Vasundhara - AI Sustainability Assistant', description: 'A web-based, AI-powered chatbot that helps users understand the harmful impacts of everyday pollutants they use, and suggests sustainable alternatives.', tech: 'Built React + Tailwind UI with chat, context memory, and charts; integrated Gemini and ChatGPT for pollutant-to-alternative recommendations' },
            { name: 'Vasundhara-Sugam Seva (Your Kitchen Assistant)', description: 'A comprehensive full-stack food application that reduces household and retail food waste using predictive AI, meal planning, expiry alerts, gamification, and surplus sharing.', tech: 'Next.js PWA, Express API, and FastAPI ML services linked via Docker/K8s, delivering predictive expiry, meal planning, alerts, and surplus marketplace features' },
            { name: 'Scholar Soar', description: 'Designed relational schema (users, courses, enrollments, applications); implemented auth, role-based access, and recruiter filters.', tech: 'In-progress Node/Express + MySQL backend; target features: instructor onboarding, course CRUD, and recruiter search with pagination' },
            { name: 'Food Delivery WebApp', description: 'Implemented responsive UI and order flow in HTML/CSS/JS and servlets (Advanced Java); added cart, checkout, and order history', tech: 'HTML/CSS/JS with Java Servlets' },
        ],
        achievements: [
            'Singing (Adhya, Madhya, Purna)',
            'Passion to build extensive animation-based webpages on free time',
            'Research: Guide-To-Go - A Cutting-Edge Approach to Building a Real-Time Travel Guide Application',
            'The Complete 2023 Web Development Bootcamp',
            'GOOGLE ANDROID DEVELOPER VIRTUAL INTERNSHIP',
            'Google AI-ML VIRTUAL INTERNSHIP',
            'Java Full-Stack Developer Virtual Internship',
            'IBM SkillsBuild: Agentic AI - From Learner to Builder',
        ],
        social: {
            github: 'https://github.com/DibakarDas9',
            linkedin: 'https://www.linkedin.com/in/dibakar-das-453653248/',
        },
    },
    {
        name: 'Dipanjan Samanta',
        role: 'Developer',
        image: '/team/placeholder.jpg',
        email: 'dipanjan@example.com',
        location: 'TBD',
        summary: 'Details coming soon...',
        skills: { programming: [], frontend: [], backend: [], database: [], tools: [] },
        languages: [],
        education: [],
        projects: [],
        achievements: [],
        social: {},
    },
    {
        name: 'Soumadeep Dutta',
        role: 'Developer',
        image: '/team/placeholder.jpg',
        email: 'soumadeep@example.com',
        location: 'TBD',
        summary: 'Details coming soon...',
        skills: { programming: [], frontend: [], backend: [], database: [], tools: [] },
        languages: [],
        education: [],
        projects: [],
        achievements: [],
        social: {},
    },
];

const getAnimationVariant = (index: number) => {
    if (index === 0) return 'fromRight';
    if (index === 1) return 'fromTop';
    if (index === 2) return 'fromLeft';
    return 'fromRight';
};

export default function AboutPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const isTransitioningRef = useRef(false);

    const animationVariants = {
        fromRight: {
            initial: { x: '100%', opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: '-100%', opacity: 0 },
        },
        fromTop: {
            initial: { y: '-100%', opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: '100%', opacity: 0 },
        },
        fromLeft: {
            initial: { x: '-100%', opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: '100%', opacity: 0 },
        },
    };

    const handleScroll = () => {
        if (!contentRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 50;
        setIsAtBottom(atBottom);
    };

    const handleWheel = (e: WheelEvent) => {
        if (!contentRef.current || isTransitioningRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 20;
        const atTop = scrollTop <= 20;

        // Only intercept scroll at boundaries to change members
        if (e.deltaY > 0 && atBottom && currentIndex < teamMembers.length - 1) {
            e.preventDefault();
            isTransitioningRef.current = true;
            setCurrentIndex(currentIndex + 1);
            setTimeout(() => {
                if (contentRef.current) contentRef.current.scrollTop = 0;
                setTimeout(() => { isTransitioningRef.current = false; }, 500);
            }, 100);
        } else if (e.deltaY < 0 && atTop && currentIndex > 0) {
            e.preventDefault();
            isTransitioningRef.current = true;
            setCurrentIndex(currentIndex - 1);
            setTimeout(() => {
                if (contentRef.current) {
                    const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
                    contentRef.current.scrollTop = Math.max(0, maxScroll - 100);
                }
                setTimeout(() => { isTransitioningRef.current = false; }, 500);
            }, 100);
        }
        // Otherwise allow normal scrolling (don't prevent default)
    };

    useEffect(() => {
        const content = contentRef.current;
        if (content) {
            content.addEventListener('wheel', handleWheel as any, { passive: false });
            content.addEventListener('scroll', handleScroll);
            return () => {
                content.removeEventListener('wheel', handleWheel as any);
                content.removeEventListener('scroll', handleScroll);
            };
        }
    }, [currentIndex]);

    const currentMember = teamMembers[currentIndex];
    const variant = getAnimationVariant(currentIndex);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
            {/* Animated background */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                />

                {/* Floating particles */}
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.sin(i) * 50, 0],
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 5 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut',
                        }}
                        className="absolute h-1 w-1 rounded-full bg-emerald-400/30 blur-sm"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Navigation indicators */}
            <div className="absolute right-8 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3">
                {teamMembers.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        whileHover={{ scale: 1.3 }}
                        className={`h-3 w-3 rounded-full transition-all ${index === currentIndex ? 'bg-emerald-400 scale-125' : 'bg-white/30'
                            }`}
                    />
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    variants={animationVariants[variant]}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    ref={contentRef}
                    className="absolute inset-0 overflow-y-auto px-8 py-12"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        {/* Profile Section */}
                        <div className="flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="relative"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 p-1"
                                    style={{ width: '280px', height: '280px' }}
                                >
                                    <div className="h-full w-full rounded-full bg-slate-950" />
                                </motion.div>

                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-emerald-400 to-cyan-400 p-0.5 opacity-50"
                                    style={{ width: '288px', height: '288px', margin: '-4px' }}
                                />

                                <div className="relative z-10 h-64 w-64 overflow-hidden rounded-full border-4 border-slate-950">
                                    <Image src={currentMember.image} alt={currentMember.name} fill className="object-cover object-top" />
                                </div>

                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -35 + Math.sin(i) * 12, 0],
                                            x: [0, Math.cos(i) * 18, 0],
                                            opacity: [0.2, 0.7, 0.2],
                                            scale: [1, 1.6, 1],
                                        }}
                                        transition={{
                                            duration: 3 + i * 0.2,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                            ease: 'easeInOut',
                                        }}
                                        className="absolute rounded-full blur-md"
                                        style={{
                                            width: `${9 + (i % 3) * 3}px`,
                                            height: `${9 + (i % 3) * 3}px`,
                                            top: `${35 + (i * 16) % 200}px`,
                                            left: `${i % 2 === 0 ? -35 : 290}px`,
                                            background: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#06b6d4' : '#a855f7',
                                        }}
                                    />
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8"
                            >
                                <motion.h1
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                    className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-5xl font-bold text-transparent"
                                    style={{ backgroundSize: '200% 200%' }}
                                >
                                    {currentMember.name}
                                </motion.h1>
                                <motion.p
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="mt-3 text-2xl text-emerald-400"
                                >
                                    {currentMember.role}
                                </motion.p>
                                <p className="mt-2 text-lg text-slate-400">{currentMember.location}</p>

                                {currentMember.modeOfCommunication && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                        className="mt-5"
                                    >
                                        <motion.div
                                            animate={{
                                                boxShadow: [
                                                    '0 0 20px rgba(16, 185, 129, 0.4)',
                                                    '0 0 50px rgba(16, 185, 129, 0.8)',
                                                    '0 0 20px rgba(16, 185, 129, 0.4)',
                                                ],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-400 bg-emerald-500/10 px-6 py-3 backdrop-blur-sm"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="h-2.5 w-2.5 rounded-full bg-emerald-400"
                                            />
                                            <span className="text-sm font-bold text-emerald-300">
                                                Mode of Communication: {currentMember.modeOfCommunication}
                                            </span>
                                        </motion.div>
                                    </motion.div>
                                )}

                                <div className="mt-6 flex justify-center gap-5">
                                    {currentMember.social.github && (
                                        <motion.a
                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                            href={currentMember.social.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 transition hover:text-emerald-400"
                                        >
                                            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                            </svg>
                                        </motion.a>
                                    )}
                                    {currentMember.social.linkedin && (
                                        <motion.a
                                            whileHover={{ scale: 1.2, rotate: -5 }}
                                            href={currentMember.social.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 transition hover:text-emerald-400"
                                        >
                                            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </motion.a>
                                    )}
                                    <motion.a
                                        whileHover={{ scale: 1.2 }}
                                        href={`mailto:${currentMember.email}`}
                                        className="text-slate-400 transition hover:text-emerald-400"
                                    >
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </motion.a>
                                </div>
                            </motion.div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* About */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6 backdrop-blur-sm border border-white/10"
                            >
                                <h2 className="text-2xl font-bold text-emerald-400">About</h2>
                                <p className="mt-3 text-base leading-relaxed text-slate-300">{currentMember.summary}</p>
                            </motion.div>

                            {/* Skills */}
                            {Object.values(currentMember.skills).some((arr) => arr.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-sm border border-white/10"
                                >
                                    <h2 className="text-2xl font-bold text-purple-400">Skills</h2>
                                    <div className="mt-4 space-y-3">
                                        {Object.entries(currentMember.skills).map(([category, skills]) =>
                                            skills.length > 0 ? (
                                                <div key={category}>
                                                    <h3 className="text-sm font-semibold uppercase text-emerald-400">{category}</h3>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {skills.map((skill) => (
                                                            <motion.span
                                                                key={skill}
                                                                whileHover={{ scale: 1.05, y: -2 }}
                                                                className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300"
                                                            >
                                                                {skill}
                                                            </motion.span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Languages */}
                            {currentMember.languages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 backdrop-blur-sm border border-white/10"
                                >
                                    <h2 className="text-2xl font-bold text-cyan-400">Languages</h2>
                                    <div className="mt-4 space-y-2">
                                        {currentMember.languages.map((lang) => (
                                            <div key={lang.name} className="flex justify-between text-base">
                                                <span className="text-slate-300">{lang.name}</span>
                                                <span className="text-emerald-400">{lang.level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Education */}
                            {currentMember.education.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 backdrop-blur-sm border border-white/10"
                                >
                                    <h2 className="text-2xl font-bold text-orange-400">Education</h2>
                                    <div className="mt-4 space-y-4">
                                        {currentMember.education.map((edu, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ x: 5 }}
                                                className="border-l-2 border-emerald-400 pl-4"
                                            >
                                                <h3 className="text-base font-semibold text-white">{edu.degree}</h3>
                                                <p className="text-sm text-slate-400">{edu.institution}</p>
                                                <p className="text-sm text-slate-500">
                                                    {edu.year} {edu.score && `• ${edu.score}`}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Projects */}
                        {currentMember.projects.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 backdrop-blur-sm border border-white/10"
                            >
                                <h2 className="text-2xl font-bold text-indigo-400">Projects</h2>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {currentMember.projects.map((project, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            className="rounded-xl bg-white/5 p-4"
                                        >
                                            <h3 className="text-base font-semibold text-emerald-400">{project.name}</h3>
                                            <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                                            <p className="mt-2 text-xs text-slate-500">{project.tech}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Achievements */}
                        {currentMember.achievements.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 backdrop-blur-sm border border-white/10"
                            >
                                <h2 className="text-2xl font-bold text-pink-400">Achievements</h2>
                                <ul className="mt-4 grid gap-2 md:grid-cols-2">
                                    {currentMember.achievements.map((achievement, i) => (
                                        <motion.li
                                            key={i}
                                            whileHover={{ x: 5 }}
                                            className="flex items-start gap-2 text-sm text-slate-300"
                                        >
                                            <motion.span
                                                animate={{ scale: [1, 1.4, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400"
                                            />
                                            {achievement}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Scroll indicator */}
                        {!isAtBottom && (
                            <motion.div
                                animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="pb-8 text-center text-sm text-slate-500"
                            >
                                <p>Scroll down for more details</p>
                                <p className="mt-1">↓</p>
                            </motion.div>
                        )}

                        {/* Next person indicator */}
                        {isAtBottom && currentIndex < teamMembers.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="pb-8 text-center text-sm text-emerald-400"
                            >
                                <p>Scroll down to view {teamMembers[currentIndex + 1].name}</p>
                                <motion.p
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="mt-2 text-2xl"
                                >
                                    ↓
                                </motion.p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <Link href="/" className="absolute left-8 top-8 z-50 text-sm text-slate-400 transition hover:text-white">
                ← Back to Home
            </Link>
        </div>
    );
}
