import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  stripes?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, label, variant = 'default', size = 'md', animated = false, stripes = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const variantStyles = {
      default: 'bg-cyan-500',
      success: 'bg-teal-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    };
    
    const sizeStyles = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-space-300">{label || ''}</span>
            {showLabel && (
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}
        <div className={clsx('relative w-full bg-space-800 rounded-full overflow-hidden', sizeStyles[size])}>
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500 ease-out',
              variantStyles[variant],
              animated && 'animate-pulse',
              stripes && 'bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_1s_linear_infinite]'
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const variantStyles = {
    default: 'text-cyan-500',
    success: 'text-teal-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-space-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className={clsx('transition-all duration-500', variantStyles[variant])}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-medium text-space-100" style={{ fontSize: size * 0.18 }}>
            {label ?? `${percentage.toFixed(0)}%`}
          </span>
        </div>
      )}
    </div>
  );
}