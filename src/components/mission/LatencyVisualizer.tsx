import React from 'react';
import { cn } from '@/utils/cn';
import { ArrowLeftRight, Signal } from 'lucide-react';

export interface LatencyVisualizerProps {
  oneWayDelaySec?: number;
  earthDistanceKm?: number;
  linkStatus?: 'LOCKED' | 'DEGRADED' | 'LOSS_OF_SIGNAL_OCCULTATION';
  activeUplinkCount?: number;
  className?: string;
}

export const LatencyVisualizer: React.FC<LatencyVisualizerProps> = ({
  oneWayDelaySec = 1.282,
  earthDistanceKm = 384400,
  linkStatus = 'LOCKED',
  activeUplinkCount = 0,
  className,
}) => {
  const roundTripSec = (oneWayDelaySec * 2).toFixed(3);

  const statusColor = {
    LOCKED: 'text-nominal-green',
    DEGRADED: 'text-warning-amber',
    LOSS_OF_SIGNAL_OCCULTATION: 'text-critical-red animate-pulse',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 bg-control-navy px-3 py-1.5 tech-border font-mono text-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-telemetry-cyan">
        <ArrowLeftRight className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider text-offwhite/60">LIGHT-TIME</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-offwhite font-bold tracking-tight">
          {oneWayDelaySec.toFixed(3)}s
        </span>
        <span className="text-[10px] text-offwhite/50 tracking-tighter">
          1-WAY ({roundTripSec}s RTT)
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-2 border-l border-panel-blue/60 pl-2 text-[10px] text-offwhite/60">
        <span>{earthDistanceKm.toLocaleString()} KM</span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-panel-blue/60 pl-2">
        <Signal className={cn('h-3.5 w-3.5', statusColor[linkStatus])} />
        <span className={cn('text-[10px] font-semibold uppercase', statusColor[linkStatus])}>
          {linkStatus === 'LOCKED' ? 'LINK LOCK' : linkStatus}
        </span>
        {activeUplinkCount > 0 && (
          <span className="bg-telemetry-cyan/20 text-telemetry-cyan px-1 text-[9px]">
            {activeUplinkCount} IN TRANSIT
          </span>
        )}
      </div>
    </div>
  );
};
