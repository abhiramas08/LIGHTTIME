import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'nominal' | 'warning' | 'critical' | 'telemetry' | 'neutral';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'telemetry',
  pulse = false,
  children,
  ...props
}) => {
  const variantStyles = {
    nominal: 'bg-nominal-green/10 text-nominal-green border-nominal-green/40',
    warning: 'bg-warning-amber/10 text-warning-amber border-warning-amber/40',
    critical: 'bg-critical-red/10 text-critical-red border-critical-red/40',
    telemetry: 'bg-telemetry-cyan/10 text-telemetry-cyan border-telemetry-cyan/40',
    neutral: 'bg-panel-blue/30 text-offwhite/80 border-panel-blue/60',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-none font-semibold select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full animate-pulse',
            variant === 'nominal' && 'bg-nominal-green',
            variant === 'warning' && 'bg-warning-amber',
            variant === 'critical' && 'bg-critical-red',
            variant === 'telemetry' && 'bg-telemetry-cyan',
            variant === 'neutral' && 'bg-offwhite/50'
          )}
        />
      )}
      {children}
    </span>
  );
};
