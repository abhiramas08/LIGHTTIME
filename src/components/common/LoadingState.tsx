import React from 'react';
import { cn } from '@/utils/cn';
import { Radio } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'ACQUIRING LUNAR TELEMETRY LINK...',
  submessage = 'Deep Space Network downlink synchronization in progress [2.2 GHz S-Band]',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 tech-border bg-control-navy/50 text-center font-mono',
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <span className="absolute h-12 w-12 rounded-full border border-telemetry-cyan/20 animate-ping" />
        <span className="absolute h-8 w-8 rounded-full border border-telemetry-cyan/40 animate-pulse" />
        <Radio className="h-6 w-6 text-telemetry-cyan animate-bounce" />
      </div>

      <div className="text-xs font-semibold uppercase tracking-wider text-telemetry-cyan glow-cyan-sm">
        {message}
      </div>
      <div className="mt-1 text-[11px] text-offwhite/50 max-w-sm">{submessage}</div>

      <div className="mt-4 flex items-center gap-1">
        <span className="h-1 w-6 bg-telemetry-cyan/80 animate-pulse" />
        <span className="h-1 w-6 bg-telemetry-cyan/40 animate-pulse delay-75" />
        <span className="h-1 w-6 bg-telemetry-cyan/20 animate-pulse delay-150" />
      </div>
    </div>
  );
};
