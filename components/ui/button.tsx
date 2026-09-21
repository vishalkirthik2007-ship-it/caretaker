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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-2xl';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#0066FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white focus-visible:ring-[#0066FF] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30',
      secondary:
        'bg-blue-50/80 dark:bg-slate-800/80 text-[#0066FF] dark:text-[#42D9FF] hover:bg-blue-100/90 dark:hover:bg-slate-750 border border-blue-200/60 dark:border-slate-700/60',
      outline:
        'border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-750 focus-visible:ring-[#0066FF]',
      ghost:
        'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
      destructive:
        'bg-[#FF5C6C] text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm shadow-red-500/20',
      emergency:
        'bg-[#FF5C6C] text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-md shadow-red-500/30 font-bold tracking-wide animate-pulse',
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
