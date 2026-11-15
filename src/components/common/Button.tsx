import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'nominal';
  size?: 'sm' | 'md' | 'lg';
  isTelemetryAction?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isTelemetryAction = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-mono font-medium tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-telemetry-cyan disabled:pointer-events-none disabled:opacity-40 select-none';

    const sizeStyles = {
      sm: 'h-7 px-2.5 text-xs uppercase',
      md: 'h-9 px-4 text-xs uppercase tracking-wider',
      lg: 'h-11 px-6 text-sm uppercase tracking-widest',
    };

    const variantStyles = {
      primary:
        'bg-telemetry-cyan text-space-deep font-semibold hover:bg-telemetry-cyan/90 shadow-telemetry-sm active:translate-y-px',
      secondary:
        'bg-control-navy text-offwhite border border-panel-blue hover:bg-control-highlight hover:border-telemetry-cyan/40 active:translate-y-px',
      outline:
        'bg-transparent text-telemetry-cyan border border-telemetry-cyan/50 hover:bg-telemetry-cyan/10 active:translate-y-px',
      nominal:
        'bg-nominal-green text-space-deep font-semibold hover:bg-nominal-green/90 shadow-nominal-sm active:translate-y-px',
      danger:
        'bg-critical-red text-offwhite font-semibold hover:bg-critical-red/90 shadow-critical-sm active:translate-y-px',
      ghost:
        'bg-transparent text-offwhite/80 hover:bg-control-navy hover:text-telemetry-cyan',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          isTelemetryAction && 'hud-bracket border-t border-b',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
