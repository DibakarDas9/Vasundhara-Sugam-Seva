import { forwardRef, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-8 w-8', className)}
        {...props}
      >
        {/* Leaf/Plant icon representing sustainability and growth */}
        <path
          d="M20 2C20 2 8 8 8 20C8 28 12 32 20 32C28 32 32 28 32 20C32 8 20 2 20 2Z"
          fill="currentColor"
          fillOpacity="0.8"
        />
        <path
          d="M20 4C20 4 10 9 10 20C10 26 13 29 20 29C27 29 30 26 30 20C30 9 20 4 20 4Z"
          fill="currentColor"
        />
        {/* Stem */}
        <path
          d="M20 32L20 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Small leaves */}
        <path
          d="M16 6C16 6 12 8 12 12C12 14 13 15 16 15C19 15 20 14 20 12C20 8 16 6 16 6Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <path
          d="M24 6C24 6 28 8 28 12C28 14 27 15 24 15C21 15 20 14 20 12C20 8 24 6 24 6Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </svg>
    );
  }
);

Logo.displayName = 'Logo';
