import React from 'react';
import { Link } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { METClock } from '@/components/mission/METClock';
import { LatencyVisualizer } from '@/components/mission/LatencyVisualizer';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { GlobalAlertIndicator } from '@/components/alerts/GlobalAlertIndicator';
import { Button } from '@/components/common/Button';
import {
  Menu,
  User,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { useInstructorStore } from '@/store/useInstructorStore';
import { cn } from '@/utils/cn';

export interface TopNavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleMobileMenu,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}) => {
  const { mission, telemetry, toggleSimulationRunning, setTimeWarpFactor } = useMissionStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-panel-blue/70 bg-space-darker/95 backdrop-blur-md px-3 lg:px-4 py-2 select-none">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        {/* Left: Mobile Toggle + Sidebar Collapse Button + Wordmark & Mission ID */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            aria-label="Toggle mobile menu"
            onClick={onToggleMobileMenu}
            className="md:hidden flex h-8 w-8 items-center justify-center border border-panel-blue text-offwhite hover:border-telemetry-cyan hover:text-telemetry-cyan transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Tablet/Desktop Sidebar Collapse Toggle */}
          <button
            type="button"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleSidebarCollapse}
            className="hidden md:flex h-8 w-8 items-center justify-center border border-panel-blue text-offwhite/70 hover:border-telemetry-cyan hover:text-telemetry-cyan transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* LIGHTTIME Wordmark */}
          <Link to="/" className="flex items-center gap-2 group" title="Return to Landing Page">
            <div className="flex h-8 w-8 items-center justify-center bg-control-navy border border-telemetry-cyan/50 text-telemetry-cyan font-mono font-bold text-xs select-none hud-bracket shadow-telemetry-sm group-hover:border-telemetry-cyan transition-colors">
              LT
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm lg:text-base font-bold tracking-wider text-offwhite uppercase group-hover:text-telemetry-cyan transition-colors">
                  LIGHTTIME
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/40">
                  SIM v0.1
                </span>
              </div>
              {/* Mission Identifier */}
              <span className="text-[10px] font-mono text-offwhite/50 tracking-tight truncate max-w-[130px] sm:max-w-none">
                EXP-30 · SHACKLETON
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Mission Elapsed Time, Mission Day & Comms Status */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Mission Day */}
          <div className="flex items-center gap-1.5 bg-control-navy px-2.5 py-1.5 tech-border text-xs font-mono">
            <span className="text-[10px] text-offwhite/50 uppercase">MISSION DAY:</span>
            <span className="text-telemetry-cyan font-bold">
              {mission.currentDay.toString().padStart(2, '0')} / {mission.totalDays}
            </span>
          </div>

          {/* MET Clock */}
          <METClock
            metSeconds={mission.metSeconds}
            missionDay={mission.currentDay}
            isRunning={mission.isRunning}
            timeWarpFactor={mission.timeWarpFactor}
          />

          {/* Communication Status */}
          <LatencyVisualizer
            oneWayDelaySec={mission.lightTimeDelaySec}
            earthDistanceKm={telemetry.comms.earthDistanceKm}
            linkStatus={telemetry.comms.linkStatus}
          />
        </div>

        {/* Right: Simulation Controls, System Status, User Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Simulation Time Warp Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-control-navy p-1 tech-border">
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

          {/* Global Mission Alerts Indicator */}
          <GlobalAlertIndicator />

          {/* Overall System Status */}
          <div className="flex items-center px-2 py-1.5 bg-control-navy border border-panel-blue/60">
            <StatusIndicator
              status={telemetry.masterAlarm ? 'critical' : 'nominal'}
              label={telemetry.masterAlarm ? 'MASTER ALARM' : 'SYSTEMS GO'}
              size="sm"
            />
          </div>

          {/* AI Mission Instructor Trigger */}
          <button
            type="button"
            onClick={() => useInstructorStore.getState().toggleOpen()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-control-navy border border-telemetry-cyan/60 hover:border-telemetry-cyan text-offwhite hover:text-telemetry-cyan transition-colors"
            title="Open AI Mission Instructor"
          >
            <Sparkles className="h-3.5 w-3.5 text-telemetry-cyan animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline">
              AI Instructor
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-panel-blue/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-panel-blue/40 border border-panel-blue text-offwhite hover:border-telemetry-cyan/60 transition-colors cursor-pointer">
              <User className="h-4 w-4 text-telemetry-cyan" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-mono text-xs font-semibold text-offwhite leading-tight">
                FLIGHT DIR
              </span>
              <span className="font-mono text-[9px] text-offwhite/50 tracking-tighter">
                CDR. E. VANCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-bar on smaller screens for MET and Comms */}
      <div className="xl:hidden mt-2 pt-2 border-t border-panel-blue/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-offwhite/50 uppercase">DAY {mission.currentDay}/{mission.totalDays}</span>
          <METClock
            metSeconds={mission.metSeconds}
            missionDay={mission.currentDay}
            isRunning={mission.isRunning}
            timeWarpFactor={mission.timeWarpFactor}
          />
        </div>
        <div className="flex items-center gap-2">
          <LatencyVisualizer
            oneWayDelaySec={mission.lightTimeDelaySec}
            earthDistanceKm={telemetry.comms.earthDistanceKm}
            linkStatus={telemetry.comms.linkStatus}
          />
        </div>
      </div>
    </header>
  );
};
