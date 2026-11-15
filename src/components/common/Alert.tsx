import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'nominal' | 'warning' | 'critical' | 'info';
  title?: string;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, onDismiss, children, ...props }, ref) => {
    const config = {
      nominal: {
        border: 'border-nominal-green/60 bg-nominal-green/10',
        text: 'text-nominal-green',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-nominal-green" />,
        defaultTitle: 'SYSTEM NOMINAL',
      },
      warning: {
        border: 'border-warning-amber/60 bg-warning-amber/10 shadow-warning-sm',
        text: 'text-warning-amber',
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-warning-amber" />,
        defaultTitle: 'CAUTION ADVISORY',
      },
      critical: {
        border: 'border-critical-red/70 bg-critical-red/10 shadow-critical-sm animate-pulse',
        text: 'text-critical-red',
        icon: <AlertOctagon className="h-4 w-4 shrink-0 text-critical-red" />,
        defaultTitle: 'MASTER ALARM: CRITICAL EVENT',
      },
      info: {
        border: 'border-telemetry-cyan/50 bg-control-navy/80',
        text: 'text-telemetry-cyan',
        icon: <Info className="h-4 w-4 shrink-0 text-telemetry-cyan" />,
        defaultTitle: 'FLIGHT DIRECTIVE NOTICE',
      },
    };

    const current = config[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full border p-3 font-mono text-xs flex gap-3 items-start select-none',
          current.border,
          className
        )}
        {...props}
      >
        <div className="mt-0.5">{current.icon}</div>

        <div className="flex-1">
          <div className={cn('font-semibold uppercase tracking-wider', current.text)}>
            {title ?? current.defaultTitle}
          </div>
          <div className="mt-0.5 text-offwhite/80 font-sans text-xs">{children}</div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-offwhite/50 hover:text-offwhite transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';
