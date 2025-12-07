'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
    className?: string;
    size?: number;
}

export function AnimatedLogo({ className, size = 64 }: AnimatedLogoProps) {
    // Animation: Two strokes sliding in to meet
    const slideLeft = {
        hidden: { pathLength: 0, opacity: 0, x: -20, y: 10 },
        visible: {
            pathLength: 1,
            opacity: 0.9,
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: 0.1
            }
        }
    };

    const slideRight = {
        hidden: { pathLength: 0, opacity: 0, x: 20, y: 10 },
        visible: {
            pathLength: 1,
            opacity: 0.9,
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: 0.3
            }
        }
    };

    // Rising Sun Animation
    const sunRise = {
        hidden: {
            cy: 70, // Start low (behind the V juncture)
            r: 0,   // Start small
            opacity: 0
        },
        visible: {
            cy: 20, // Rise to top
            r: 8,   // Grow to full size
            opacity: 1,
            transition: {
                delay: 0.8, // Start after V forms
                duration: 1.5,
                type: "spring",
                stiffness: 40, // Gentle rise
                damping: 10
            }
        }
    };

    return (
        <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
            <motion.svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial="hidden"
                animate="visible"
            >
                <defs>
                    <linearGradient id="gradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6EE7B7" />
                        <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>

                    {/* Sun Gradient: Orange to Gold/Yellow */}
                    <radialGradient id="sunGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 20) rotate(90) scale(10)">
                        <stop stopColor="#FBBF24" /> {/* Amber-400 */}
                        <stop offset="1" stopColor="#F59E0B" /> {/* Amber-500 */}
                    </radialGradient>

                    <filter id="multiply">
                        <feBlend mode="multiply" in="SourceGraphic" in2="BackgroundImage" />
                    </filter>
                    <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* The Rising Sun - Placed FIRST in DOM so it appears BEHIND the V if they overlap, 
            but we want it effectively independent. 
            Actually, let's put it behind for the "rising behind mountain" effect if path crosses,
            or on top if we want it to shine. 
            "Sun rising" usually implies coming up from behind. 
            Let's place it first so it renders behind the V strokes. 
        */}
                <motion.circle
                    cx="50"
                    cy="20"
                    r="8"
                    fill="url(#sunGradient)"
                    variants={sunRise}
                    filter="url(#sunGlow)"
                />

                {/* Left Stroke (The "V" left arm) */}
                <motion.path
                    d="M25 25 L50 75"
                    stroke="url(#gradientLeft)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    variants={slideLeft}
                    className="mix-blend-multiply dark:mix-blend-screen"
                />

                {/* Right Stroke (The "V" right arm) */}
                <motion.path
                    d="M75 25 L50 75"
                    stroke="url(#gradientRight)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    variants={slideRight}
                    className="mix-blend-multiply dark:mix-blend-screen"
                />

            </motion.svg>
        </div>
    );
}
