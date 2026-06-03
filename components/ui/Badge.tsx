import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'glow' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, children, variant = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border tracking-wide transition-all';
  
  const variants = {
    default: 'bg-white/5 border-white/10 text-slate-300',
    primary: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    glow: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.2)]',
    outline: 'bg-transparent border-slate-500/30 text-slate-400'
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
