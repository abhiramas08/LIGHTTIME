import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { METClock } from '@/components/mission/METClock';
import { LatencyVisualizer } from '@/components/mission/LatencyVisualizer';
import { Button } from '@/components/common/Button';
import { Play, Pause, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

export const MissionHeader: React.FC = () => {
  const {
    mission,
    telemetry,
    commands,
    toggleSimulationRunning,
    setTimeWarpFactor,
  } = useMissionStore();

  const activeInTransitCommands = commands.filter(
    (c) => c.status === 'TRANSMITTING_UPLINK' || c.status === 'DOWNLINKING_ACK'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-panel-blue/70 bg-space-darker/95 backdrop-blur px-4 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand / Title & Station */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-control-navy border border-telemetry-cyan/40 text-telemetry-cyan font-mono font-bold text-sm select-none hud-bracket">
            LT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-sm font-bold tracking-wider text-offwhite uppercase">
                LIGHTTIME
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30">
                SIM v0.1
              </span>
            </div>
            <p className="text-[11px] font-mono text-offwhite/50 tracking-tight">
              HUMAN-CENTRED AUTONOMOUS LUNAR MISSION COMMAND
            </p>
          </div>
        </div>

        {/* Telemetry Status Gauges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* MET Clock */}
          <METClock
            metSeconds={mission.metSeconds}
            missionDay={mission.currentDay}
            isRunning={mission.isRunning}
            timeWarpFactor={mission.timeWarpFactor}
          />

          {/* Light Time Indicator */}
          <LatencyVisualizer
            oneWayDelaySec={mission.lightTimeDelaySec}
            earthDistanceKm={telemetry.comms.earthDistanceKm}
            linkStatus={telemetry.comms.linkStatus}
            activeUplinkCount={activeInTransitCommands}
          />

          {/* Simulation Time Warp Controls */}
          <div className="flex items-center gap-1 bg-control-navy p-1 tech-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSimulationRunning}
              className="h-7 w-7 p-0"
              title={mission.isRunning ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {mission.isRunning ? (
                <Pause className="h-3.5 w-3.5 text-warning-amber" />
              ) : (
                <Play className="h-3.5 w-3.5 text-nominal-green" />
              )}
            </Button>

            <div className="flex items-center gap-0.5 border-l border-panel-blue/60 pl-1">
              {([1, 5, 60, 3600] as const).map((warp) => (
                <button
                  key={warp}
                  type="button"
                  onClick={() => setTimeWarpFactor(warp)}
                  className={cn(
                    'px-1.5 py-0.5 font-mono text-[10px] transition-colors',
                    mission.timeWarpFactor === warp
                      ? 'bg-telemetry-cyan text-space-deep font-bold'
                      : 'text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/30'
                  )}
                >
                  {warp === 3600 ? '1H' : `${warp}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Master Alarm Status */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold border select-none',
              telemetry.masterAlarm
                ? 'bg-critical-red/20 text-critical-red border-critical-red animate-pulse'
                : 'bg-nominal-green/10 text-nominal-green border-nominal-green/40'
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {telemetry.masterAlarm ? 'MASTER ALARM' : 'SYSTEMS GO'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
