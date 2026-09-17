'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/hooks/use-accessibility';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'emergency';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const { easyMode } = useAccessibility();

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl';

    const variants = {
      primary:
        'bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600 shadow-sm',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400',
      outline:
        'border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
      ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
      emergency:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-md font-bold tracking-wide animate-pulse',
    };

    const sizes = {
      sm: easyMode ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-xs',
      md: easyMode ? 'px-6 py-3.5 text-lg' : 'px-4 py-2 text-sm',
      lg: easyMode ? 'px-8 py-4 text-xl' : 'px-5 py-2.5 text-base',
      xl: 'px-7 py-4 text-lg font-semibold shadow',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
