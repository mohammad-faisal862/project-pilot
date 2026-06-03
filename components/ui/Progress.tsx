import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  barClassName?: string;
  animate?: boolean;
  glow?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className, 
  barClassName, 
  animate = true, 
  glow = true 
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('h-2 w-full bg-white/5 rounded-full overflow-hidden relative', className)}>
      <motion.div
        className={cn(
          'h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full',
          glow && 'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
          barClassName
        )}
        initial={animate ? { width: 0 } : { width: `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};
