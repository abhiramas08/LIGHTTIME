/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Simulation Control Bar
 *
 * Persistent, aerospace-inspired simulation toolbar accessible throughout
 * all mission views. Provides discrete time advancement (+1 Hour, +1 Day),
 * continuous clock control (Start, Pause, Resume), speed warping (1x, 5x, 60x, 3600x),
 * mission reset with safety confirmation, and active emergency alert status.
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Dialog } from '@/components/common/Dialog';
import { cn } from '@/utils/cn';
import {
  Play,
  Pause,
  Clock,
  Calendar,
  RotateCcw,
  FastForward,
  Radio,
  AlertTriangle,
  Award,
  Send,
  Zap,
} from 'lucide-react';

export const SimulationControlBar: React.FC = () => {
  const {
    missionState,
    simulationStatus,
    startMission,
    pauseMission,
    resumeMission,
    advanceOneHour,
    advanceOneDay,
    resetMission,
    setTimeWarpFactor,
    executeMissionCommand,
    mission,
  } = useMissionStore();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  // Command modal state
  const [selectedSubsystem, setSelectedSubsystem] = useState<
    'ECLSS' | 'POWER_GRID' | 'CREW_SCHEDULE' | 'EMERGENCY'
  >('ECLSS');
  const [selectedAction, setSelectedAction] = useState<string>('RECYCLE_CO2_SCRUBBER');
  const [commandSuccessNote, setCommandSuccessNote] = useState<string | null>(null);

  const isRunning = simulationStatus === 'ACTIVE';

  const formatMET = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `T+ ${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const result = executeMissionCommand({
      subsystem: selectedSubsystem,
      action: selectedAction,
      initiatedBy: 'GROUND',
    });

    if (result.success) {
      setCommandSuccessNote(result.message);
      setTimeout(() => setCommandSuccessNote(null), 4000);
    }
  };

  return (
    <div className="w-full bg-space-darker/95 border-b border-panel-blue/70 px-3 lg:px-6 py-2 backdrop-blur-md z-30 transition-all select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Simulation Status & MET Telemetry */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-offwhite/50 uppercase hidden sm:inline">
              SIM ENGINE:
            </span>
            <Badge
              variant={
                simulationStatus === 'ACTIVE'
                  ? 'nominal'
                  : simulationStatus === 'PAUSED'
                  ? 'warning'
                  : simulationStatus === 'COMPLETED'
                  ? 'telemetry'
                  : 'critical'
              }
              pulse={simulationStatus === 'ACTIVE'}
            >
              {simulationStatus}
            </Badge>
          </div>

          {/* Mission Elapsed Time */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-control-navy border border-panel-blue/60 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span className="text-telemetry-cyan font-bold tracking-wider">
              {formatMET(mission.metSeconds)}
            </span>
          </div>

          {/* Mission Day */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-control-navy border border-panel-blue/60 text-xs font-mono">
            <Calendar className="h-3.5 w-3.5 text-offwhite/60" />
            <span className="text-offwhite/50 uppercase text-[10px]">DAY:</span>
            <span className="text-offwhite font-bold">
              {missionState.mission.missionDay} / {missionState.mission.missionDuration}
            </span>
          </div>
        </div>

        {/* Center: Stepping & Continuous Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Play / Pause / Resume */}
          {isRunning ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={pauseMission}
              className="gap-1.5 h-8 text-xs font-mono text-warning-amber border-warning-amber/50 hover:bg-warning-amber/10"
              title="Pause Simulation Clock"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>PAUSE</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={simulationStatus === 'PAUSED' ? resumeMission : startMission}
              className="gap-1.5 h-8 text-xs font-mono"
              title="Start or Resume Simulation Clock"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{simulationStatus === 'PAUSED' ? 'RESUME' : 'START'}</span>
            </Button>
          )}

          {/* +1 HOUR Step Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={advanceOneHour}
            className="gap-1 h-8 text-xs font-mono border-panel-blue hover:border-telemetry-cyan text-offwhite"
            title="Advance Simulation by Exactly 1 Hour (Pure Math Solver)"
          >
            <FastForward className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>+1 HOUR</span>
          </Button>

          {/* +1 DAY Step Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={advanceOneDay}
            className="gap-1 h-8 text-xs font-mono border-panel-blue hover:border-telemetry-cyan text-offwhite"
            title="Advance Simulation by Exactly 1 Sol / Earth Day (24 Hours)"
          >
            <Calendar className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>+1 DAY</span>
          </Button>

          {/* Time Warp Factor */}
          <div className="hidden lg:flex items-center bg-control-navy border border-panel-blue/60 p-0.5">
            {([1, 5, 60, 3600] as const).map((warp) => (
              <button
                key={warp}
                type="button"
                onClick={() => setTimeWarpFactor(warp)}
                className={cn(
                  'px-2 py-1 font-mono text-[10px] transition-colors',
                  mission.timeWarpFactor === warp
                    ? 'bg-telemetry-cyan text-space-deep font-bold'
                    : 'text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/30'
                )}
                title={`Set Simulation Warp Speed to ${warp}x`}
              >
                {warp === 3600 ? '1 HR/S' : `${warp}x`}
              </button>
            ))}
          </div>

          {/* Reset Mission Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="h-8 text-xs font-mono text-offwhite/60 hover:text-critical-red hover:bg-critical-red/10"
            title="Reset Simulation to Initial Artemis Baseline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">RESET</span>
          </Button>
        </div>

        {/* Right: Quick Command Dispatcher & Emergency Badge */}
        <div className="flex items-center gap-2">
          {missionState.emergency.activeScenario && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-warning-amber/15 border border-warning-amber/40 text-warning-amber text-xs font-mono animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-bold">CONTINGENCY ACTIVE</span>
            </div>
          )}

          <NavLink to="/mission-debrief">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs font-mono border-panel-blue/60 text-offwhite/80 hover:text-telemetry-cyan hover:border-telemetry-cyan"
              title="Open Post-Flight Debrief & Learning Report"
            >
              <Award className="h-3.5 w-3.5 text-telemetry-cyan" />
              <span className="hidden lg:inline">DEBRIEF REPORT</span>
            </Button>
          </NavLink>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCommandModalOpen(true)}
            className="gap-1.5 h-8 text-xs font-mono border-telemetry-cyan/40 text-telemetry-cyan hover:bg-telemetry-cyan/10"
          >
            <Radio className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DISPATCH COMMAND</span>
            <span className="sm:hidden">CMD</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Mission */}
      <Dialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title="CONFIRM MISSION SIMULATION RESET"
        description="Are you sure you want to reset the expedition to Day 1, 14:30 MET baseline?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetDialogOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetMission();
                setIsResetDialogOpen(false);
              }}
            >
              CONFIRM RESET TO BASELINE
            </Button>
          </div>
        }
      >
        <div className="text-xs font-mono text-offwhite/70 space-y-3">
          <p>
            This action will restore all ECLSS consumables (oxygen, water, food), electrical battery
            levels, and astronaut biometrics back to pristine expedition launch conditions.
          </p>
          <p className="text-warning-amber">
            All stored telemetry logs and active commands in browser storage will be reset to baseline.
          </p>
        </div>
      </Dialog>

      {/* Dispatch Mission Command Modal */}
      <Dialog
        open={isCommandModalOpen}
        onOpenChange={setIsCommandModalOpen}
        title="GROUND MISSION CONTROL · COMMAND DISPATCHER"
        description="Validate and dispatch flight rule directives to the lunar habitat."
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-mono text-offwhite/50">
              LIGHT-TIME LATENCY: {missionState.communications.delaySeconds}s
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsCommandModalOpen(false)}>
                DISMISS
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteCommand} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                TRANSMIT DIRECTIVE
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleExecuteCommand} className="space-y-4 text-xs font-mono">
          {commandSuccessNote && (
            <div className="p-2.5 bg-nominal-green/15 border border-nominal-green/40 text-nominal-green text-xs font-mono">
              ✓ {commandSuccessNote}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] text-offwhite/60 uppercase">TARGET SUBSYSTEM:</label>
            <select
              value={selectedSubsystem}
              onChange={(e) => {
                const sub = e.target.value as typeof selectedSubsystem;
                setSelectedSubsystem(sub);
                if (sub === 'ECLSS') setSelectedAction('RECYCLE_CO2_SCRUBBER');
                else if (sub === 'POWER_GRID') setSelectedAction('SHED_LOAD');
                else if (sub === 'CREW_SCHEDULE') setSelectedAction('MANDATE_REST');
                else if (sub === 'EMERGENCY') setSelectedAction('EXECUTE_CHECKLIST_STEP');
              }}
              className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite focus:border-telemetry-cyan focus:outline-none"
            >
              <option value="ECLSS">ECLSS (Environmental & Life Support)</option>
              <option value="POWER_GRID">POWER GRID (Electrical Bus & Batteries)</option>
              <option value="CREW_SCHEDULE">CREW SCHEDULE (Fatigue & Countermeasures)</option>
              <option value="EMERGENCY">EMERGENCY (Contingency Procedures)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-offwhite/60 uppercase">FLIGHT DIRECTIVE / ACTION:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite focus:border-telemetry-cyan focus:outline-none"
            >
              {selectedSubsystem === 'ECLSS' && (
                <>
                  <option value="RECYCLE_CO2_SCRUBBER">RECYCLE_CO2_SCRUBBER (Regenerate CDRA Beds)</option>
                  <option value="BOOST_OXYGEN_INJECTION">BOOST_OXYGEN_INJECTION (+5.0 kg O2 Pulse)</option>
                  <option value="FLUSH_WATER_CATALYST">FLUSH_WATER_CATALYST (Restore WRS Efficiency)</option>
                </>
              )}
              {selectedSubsystem === 'POWER_GRID' && (
                <>
                  <option value="SHED_LOAD">SHED_LOAD (Reduce Non-Critical Demand by 3.5 kW)</option>
                  <option value="RESTORE_FULL_POWER">RESTORE_FULL_POWER (Restore 28.5 kW Full Bus)</option>
                  <option value="ACTIVATE_AUX_BATTERY">ACTIVATE_AUX_BATTERY (+30.0 kWh Auxiliary Storage)</option>
                </>
              )}
              {selectedSubsystem === 'CREW_SCHEDULE' && (
                <>
                  <option value="MANDATE_REST">MANDATE_REST (Initiate Mandatory Rest Period)</option>
                  <option value="MANDATE_EXERCISE">MANDATE_EXERCISE (+45m Exercise Countermeasure)</option>
                </>
              )}
              {selectedSubsystem === 'EMERGENCY' && (
                <>
                  <option value="EXECUTE_CHECKLIST_STEP">EXECUTE_CHECKLIST_STEP (Advance Contingency Action)</option>
                  <option value="SEAL_AIRLOCK">SEAL_AIRLOCK (Verify Hatch Pressure Integrity)</option>
                  <option value="TRIGGER_FIRE_SUPPRESSION">TRIGGER_FIRE_SUPPRESSION (Discharge Inerting Gas)</option>
                </>
              )}
            </select>
          </div>

          <div className="p-2.5 bg-control-navy border border-panel-blue/50 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-offwhite/70">
              <Zap className="h-3.5 w-3.5 text-telemetry-cyan" />
              <span>Target Simulation Engine: Pure Mathematical Discrete Solver</span>
            </div>
            <div className="text-[10px] text-offwhite/50">
              Executed directly through the central store without ad-hoc component calculation.
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
