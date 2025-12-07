import { forwardRef, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string; // Kept for compatibility, though we mostly rely on props
}

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-8 w-8', className)}
        {...props}
      >
        <defs>
          <linearGradient id="staticGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="staticGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="staticSunGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 20) rotate(90) scale(10)">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#F59E0B" />
          </radialGradient>
        </defs>

        {/* Sun - Orange/Gold */}
        <circle
          cx="50"
          cy="20"
          r="8"
          fill="url(#staticSunGradient)"
        />

        {/* Left Arm */}
        <path
          d="M25 25 L50 75"
          stroke="url(#staticGrad1)"
          strokeWidth="16"
          strokeLinecap="round"
          className="mix-blend-multiply dark:mix-blend-screen"
        />

        {/* Right Arm */}
        <path
          d="M75 25 L50 75"
          stroke="url(#staticGrad2)"
          strokeWidth="16"
          strokeLinecap="round"
          className="mix-blend-multiply dark:mix-blend-screen"
        />

      </svg>
    );
  }
);

Logo.displayName = 'Logo';
