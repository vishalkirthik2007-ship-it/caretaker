import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-blue-50/80 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#42D9FF] border-blue-200/60 dark:border-blue-800/60',
    secondary: 'bg-cyan-50/80 dark:bg-cyan-950/60 text-[#00C6D7] dark:text-[#42D9FF] border-cyan-200/60 dark:border-cyan-800/60',
    success: 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#20C997] border-emerald-200/60 dark:border-emerald-850',
    warning: 'bg-amber-50/80 dark:bg-amber-950/60 text-amber-700 dark:text-[#FFB547] border-amber-200/60 dark:border-amber-850',
    danger: 'bg-red-50/80 dark:bg-red-950/60 text-red-600 dark:text-[#FF5C6C] border-red-200/60 dark:border-red-850',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
