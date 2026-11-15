import React from 'react';
import { cn } from '@/utils/cn';

export interface TechnicalLabelProps {
  idCode?: string;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'nominal' | 'warning' | 'critical' | 'telemetry';
  trend?: 'up' | 'down' | 'steady';
  className?: string;
}

export const TechnicalLabel: React.FC<TechnicalLabelProps> = ({
  idCode,
  label,
  value,
  unit,
  status = 'telemetry',
  trend,
  className,
}) => {
  const statusColor = {
    nominal: 'text-nominal-green',
    warning: 'text-warning-amber',
    critical: 'text-critical-red',
    telemetry: 'text-telemetry-cyan',
  };

  return (
    <div
      className={cn(
        'flex flex-col border border-panel-blue/40 bg-control-navy/50 p-2 font-mono transition-colors hover:border-telemetry-cyan/30',
        className
      )}
    >
      <div className="flex items-center justify-between gap-1 text-[10px] text-offwhite/50 tracking-wider">
        <span className="truncate uppercase">{label}</span>
        {idCode && <span className="text-[9px] text-telemetry-dim uppercase font-mono">[{idCode}]</span>}
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={cn('text-lg font-bold tracking-tight', statusColor[status])}>
          {value}
        </span>
        {unit && <span className="text-xs text-offwhite/60 font-medium">{unit}</span>}

        {trend && (
          <span className="ml-auto text-[10px] font-mono text-offwhite/40">
            {trend === 'up' && '▲'}
            {trend === 'down' && '▼'}
            {trend === 'steady' && '―'}
          </span>
        )}
      </div>
    </div>
  );
};
