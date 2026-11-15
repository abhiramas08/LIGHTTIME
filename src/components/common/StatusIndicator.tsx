import React from 'react';
import { cn } from '@/utils/cn';

export type SystemStatus = 'nominal' | 'caution' | 'warning' | 'critical' | 'standby' | 'offline';

export interface StatusIndicatorProps {
  status: SystemStatus;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  size = 'md',
  className,
}) => {
  const statusConfig = {
    nominal: {
      color: 'bg-nominal-green',
      ring: 'ring-nominal-green/30',
      text: 'text-nominal-green',
      border: 'border-nominal-green/40',
      glow: 'shadow-nominal-sm',
      defaultLabel: 'NOMINAL (GO)',
    },
    caution: {
      color: 'bg-warning-amber',
      ring: 'ring-warning-amber/30',
      text: 'text-warning-amber',
      border: 'border-warning-amber/40',
      glow: 'shadow-warning-sm',
      defaultLabel: 'CAUTION',
    },
    warning: {
      color: 'bg-warning-amber',
      ring: 'ring-warning-amber/50 animate-ping',
      text: 'text-warning-amber',
      border: 'border-warning-amber/50',
      glow: 'shadow-warning-sm',
      defaultLabel: 'WARNING',
    },
    critical: {
      color: 'bg-critical-red animate-pulse',
      ring: 'ring-critical-red/50 animate-ping',
      text: 'text-critical-red',
      border: 'border-critical-red/60',
      glow: 'shadow-critical-sm',
      defaultLabel: 'CRITICAL (ABORT)',
    },
    standby: {
      color: 'bg-telemetry-cyan',
      ring: 'ring-telemetry-cyan/20',
      text: 'text-telemetry-cyan',
      border: 'border-telemetry-cyan/30',
      glow: 'shadow-telemetry-sm',
      defaultLabel: 'STANDBY',
    },
    offline: {
      color: 'bg-offwhite/30',
      ring: 'ring-offwhite/10',
      text: 'text-offwhite/50',
      border: 'border-offwhite/20',
      glow: '',
      defaultLabel: 'OFFLINE / LOS',
    },
  };

  const config = statusConfig[status];

  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <span className="relative flex items-center justify-center">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            config.color,
            config.ring
          )}
        />
        <span className={cn('relative inline-flex rounded-full', dotSize[size], config.color)} />
      </span>

      {(label || config.defaultLabel) && (
        <div className="flex flex-col">
          <span className={cn('font-mono text-xs uppercase font-semibold tracking-wider', config.text)}>
            {label ?? config.defaultLabel}
          </span>
          {sublabel && (
            <span className="font-mono text-[10px] text-offwhite/50 tracking-tight">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
