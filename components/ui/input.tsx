'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/hooks/use-accessibility';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { easyMode } = useAccessibility();

    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#10283B]/80 backdrop-blur-md px-4 py-2.5 text-sm text-slate-900 dark:text-white transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-[#0866FF] dark:focus-visible:border-[#00C6D7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866FF]/20 dark:focus-visible:ring-[#00C6D7]/25 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs',
          easyMode ? 'py-4 text-lg border-2 border-slate-600' : '',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
