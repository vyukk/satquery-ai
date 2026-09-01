import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, dotColor, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-space-700 text-space-200 border border-space-600',
      primary: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      success: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
      outline: 'bg-transparent text-space-300 border border-space-600',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center font-medium rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor || 'currentColor' }}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'processing' | 'warning' | 'idle';
  label: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const configs = {
    online: { variant: 'success' as const, dot: true, dotColor: '#14b8a6', icon: '●' },
    offline: { variant: 'danger' as const, dot: true, dotColor: '#ef4444', icon: '●' },
    processing: { variant: 'primary' as const, dot: true, dotColor: '#06b6d4', icon: '◐' },
    warning: { variant: 'warning' as const, dot: true, dotColor: '#f59e0b', icon: '▲' },
    idle: { variant: 'outline' as const, dot: false, dotColor: '#6b7280', icon: '○' },
  };

  const config = configs[status];

  return (
    <Badge variant={config.variant} size={size} dot={config.dot} dotColor={config.dotColor}>
      {label}
    </Badge>
  );
}