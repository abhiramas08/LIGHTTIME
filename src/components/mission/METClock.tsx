import React from 'react';
import { cn } from '@/utils/cn';
import { Clock } from 'lucide-react';

export interface METClockProps {
  metSeconds: number;
  missionDay: number;
  isRunning?: boolean;
  timeWarpFactor?: number;
  className?: string;
}

export const METClock: React.FC<METClockProps> = ({
  metSeconds,
  missionDay,
  isRunning = true,
  timeWarpFactor = 1,
  className,
}) => {
  const days = Math.floor(metSeconds / 86400);
  const hours = Math.floor((metSeconds % 86400) / 3600);
  const minutes = Math.floor((metSeconds % 3600) / 60);
  const seconds = Math.floor(metSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 bg-control-navy px-3 py-1.5 tech-border font-mono text-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-telemetry-cyan">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-widest text-offwhite/60">MET</span>
      </div>

      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-telemetry-cyan font-bold">
          D{pad(missionDay || days + 1)}
        </span>
        <span className="text-offwhite/40">·</span>
        <span className="text-offwhite font-bold text-sm tracking-widest glow-cyan-sm">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-panel-blue/60 pl-2">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            isRunning ? 'bg-nominal-green animate-pulse' : 'bg-warning-amber'
          )}
        />
        <span className="text-[10px] uppercase text-offwhite/50 tracking-tighter">
          {timeWarpFactor}x WARP
        </span>
      </div>
    </div>
  );
};
