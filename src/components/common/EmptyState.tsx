import React from 'react';
import { cn } from '@/utils/cn';
import { SatelliteDish } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO ACTIVE TRANSMISSIONS',
  description = 'Telemetry buffer empty. All lunar systems report quiescent operational baseline.',
  action,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 tech-border bg-control-navy/30 text-center font-mono',
        className
      )}
    >
      <div className="mb-3 p-3 bg-panel-blue/30 border border-panel-blue/60 text-telemetry-cyan">
        {icon || <SatelliteDish className="h-6 w-6 opacity-80" />}
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-wider text-offwhite/90">
        {title}
      </h4>
      <p className="mt-1 max-w-sm text-[11px] text-offwhite/50">{description}</p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
