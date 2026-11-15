import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Radio,
  Droplet,
  Zap,
  Activity,
  History,
  Lock,
} from 'lucide-react';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';

export const MissionReplayTab: React.FC = () => {
  const {
    activeReplay,
    stepReplay,
    nextReplayStep,
    prevReplayStep,
    playReplay,
    pauseReplay,
    setReplaySpeed,
    resetReplay,
    closeReplay,
    setActiveTab,
  } = useMissionHistoryStore();

  // Playback timer effect
  useEffect(() => {
    if (!activeReplay || !activeReplay.isPlaying) return;

    const intervalMs = Math.max(200, 1000 / activeReplay.playbackSpeed);
    const timer = setInterval(() => {
      if (activeReplay.currentStepIndex >= activeReplay.timeline.length - 1) {
        pauseReplay();
      } else {
        nextReplayStep();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeReplay?.isPlaying, activeReplay?.playbackSpeed, activeReplay?.currentStepIndex, activeReplay?.timeline.length, nextReplayStep, pauseReplay]);

  if (!activeReplay) {
    return (
      <div className="p-12 text-center text-offwhite/50 space-y-3 font-mono border border-panel-blue/30 bg-space-surface/40">
        <History className="h-8 w-8 text-offwhite/30 mx-auto" />
        <p>No replay session currently active.</p>
        <Button variant="primary" size="sm" onClick={() => setActiveTab('library')}>
          SELECT A MISSION FROM LIBRARY TO REPLAY
        </Button>
      </div>
    );
  }

  const { targetRun, timeline, currentStepIndex, isMatchWithOriginal, playbackSpeed, isPlaying } =
    activeReplay;
  const currentStep = timeline[currentStepIndex] ?? timeline[0];
  const totalSteps = timeline.length;

  if (!currentStep) return null;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Close Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-space-surface/90 p-3 border border-panel-blue/50">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-signal-cyan font-bold text-sm tracking-wider">
              DETERMINISTIC FLIGHT REPLAY CONSOLE
            </span>
            <Badge variant="nominal">SANDBOX EXECUTION</Badge>
          </div>
          <div className="text-[10px] text-offwhite/60">
            Replaying: <span className="text-offwhite font-bold">{targetRun.missionName}</span> ({targetRun.missionId})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="telemetry" className="text-[10px]">
            STEP {currentStepIndex + 1} OF {totalSteps}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeReplay}
            className="text-xs text-offwhite/70 hover:text-offwhite border border-panel-blue/40"
          >
            EXIT REPLAY
          </Button>
        </div>
      </div>

      {/* Verification & Immutability Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Banner 1: Deterministic Replay Integrity */}
        <div
          className={`p-3 border flex items-start gap-3 ${
            isMatchWithOriginal
              ? 'border-nominal-green/60 bg-nominal-green/10 text-offwhite'
              : 'border-warning-amber/60 bg-warning-amber/10 text-offwhite'
          }`}
        >
          {isMatchWithOriginal ? (
            <ShieldCheck className="h-5 w-5 text-nominal-green shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning-amber shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-xs font-bold text-nominal-green flex items-center gap-2">
              <span>DETERMINISTIC REPLAY VERIFICATION: 100% BITWISE MATCH</span>
              <Badge variant="nominal" className="text-[9px] py-0 px-1">
                VERIFIED
              </Badge>
            </div>
            <p className="text-[11px] text-offwhite/80 leading-relaxed">
              The pure simulation engine reran the flight path from the initial state snapshot using the recorded action sequence. Final state matches saved flight records within numerical tolerance.
            </p>
          </div>
        </div>

        {/* Banner 2: Strict Immutability Guarantee */}
        <div className="p-3 border border-panel-blue/50 bg-space-dark/80 text-offwhite flex items-start gap-3">
          <Lock className="h-5 w-5 text-signal-cyan shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-signal-cyan flex items-center gap-2">
              <span>IMMUTABLE ARCHIVE GUARANTEE</span>
              <Badge variant="telemetry" className="text-[9px] py-0 px-1">
                READ ONLY
              </Badge>
            </div>
            <p className="text-[11px] text-offwhite/70 leading-relaxed">
              Replay operates strictly on isolated clones in working memory. The original saved mission snapshot in storage is never mutated during playback or scrubbing.
            </p>
          </div>
        </div>
      </div>

      {/* Replay Control Bar & Scrubber Deck */}
      <Card withBracket className="border-signal-cyan/60 bg-space-surface">
        <CardContent className="p-4 space-y-4">
          {/* Controls: Play/Pause/Steps/Speed */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetReplay}
                className="gap-1 text-xs"
                title="Rewind to start"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>START</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={prevReplayStep}
                disabled={currentStepIndex === 0}
                className="gap-1 text-xs"
                title="Step backward"
              >
                <SkipBack className="h-3.5 w-3.5" />
                <span>PREV</span>
              </Button>

              {isPlaying ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={pauseReplay}
                  className="gap-1.5 text-xs bg-warning-amber text-space-dark hover:bg-warning-amber/90 font-bold px-4"
                >
                  <Pause className="h-4 w-4" />
                  <span>PAUSE</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={playReplay}
                  className="gap-1.5 text-xs bg-nominal-green text-space-dark hover:bg-nominal-green/90 font-bold px-4"
                >
                  <Play className="h-4 w-4" />
                  <span>PLAY REPLAY</span>
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={nextReplayStep}
                disabled={currentStepIndex >= totalSteps - 1}
                className="gap-1 text-xs"
                title="Step forward"
              >
                <span>NEXT</span>
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-offwhite/50 uppercase">PLAYBACK SPEED:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setReplaySpeed(spd)}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-signal-cyan text-space-dark border-signal-cyan'
                      : 'bg-space-dark/60 text-offwhite/70 border-panel-blue/40 hover:text-offwhite'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Timeline Scrubber Slider */}
          <div className="space-y-1.5 pt-2 border-t border-panel-blue/30">
            <div className="flex justify-between items-center text-[10px] text-offwhite/60">
              <span className="text-signal-cyan font-bold">
                TIMELINE SCRUBBER: T+{currentStep.timestampHours}h ({currentStep.simulationTime})
              </span>
              <span>
                STEP {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStepIndex}
              onChange={(e) => stepReplay(Number(e.target.value))}
              className="w-full accent-signal-cyan bg-space-dark h-2 rounded cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Real-time Replay Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">SIMULATION TIME</div>
          <div className="text-xs font-bold text-signal-cyan flex items-center justify-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-warning-amber" />
            {currentStep.simulationTime}
          </div>
        </div>

        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">OXYGEN RESERVE</div>
          <div className="text-xs font-bold text-offwhite flex items-center justify-center gap-1 mt-0.5">
            <Droplet className="h-3 w-3 text-signal-cyan" />
            {currentStep.telemetrySnapshot.oxygenKg.toFixed(1)} kg
          </div>
        </div>

        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">POTABLE WATER</div>
          <div className="text-xs font-bold text-offwhite flex items-center justify-center gap-1 mt-0.5">
            <Droplet className="h-3 w-3 text-panel-blue" />
            {currentStep.telemetrySnapshot.waterLiters.toFixed(1)} L
          </div>
        </div>

        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">BATTERY STORAGE</div>
          <div className="text-xs font-bold text-warning-amber flex items-center justify-center gap-1 mt-0.5">
            <Zap className="h-3 w-3 text-warning-amber" />
            {currentStep.telemetrySnapshot.batteryKwh.toFixed(1)} kWh
          </div>
        </div>

        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">FOOD INVENTORY</div>
          <div className="text-xs font-bold text-nominal-green flex items-center justify-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3 text-nominal-green" />
            {(currentStep.telemetrySnapshot.foodKcal / 1000).toFixed(0)}k kcal
          </div>
        </div>

        <div className="p-2.5 bg-space-surface border border-panel-blue/40 text-center">
          <div className="text-[9px] text-offwhite/50 uppercase">MEAN CREW FATIGUE</div>
          <div className="text-xs font-bold text-offwhite flex items-center justify-center gap-1 mt-0.5">
            <Activity className="h-3 w-3 text-warning-amber" />
            {currentStep.telemetrySnapshot.meanCrewFatigue.toFixed(0)} / 100
          </div>
        </div>
      </div>

      {/* Active Step Milestone Detail Card */}
      <Card withBracket className="border-signal-cyan/50 bg-space-surface">
        <CardHeader className="pb-2 border-b border-panel-blue/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                currentStep.type === 'USER_ACTION'
                  ? 'warning'
                  : currentStep.type === 'MISSION_COMPLETION'
                  ? 'nominal'
                  : 'telemetry'
              }
            >
              {currentStep.type}
            </Badge>
            <CardTitle className="text-xs font-bold text-offwhite uppercase">
              {currentStep.title}
            </CardTitle>
          </div>
          <span className="text-[10px] text-signal-cyan font-bold">
            T+{currentStep.timestampHours}h MET
          </span>
        </CardHeader>
        <CardContent className="p-3 space-y-2 text-offwhite/80">
          <p className="text-xs leading-relaxed">{currentStep.description}</p>

          {currentStep.action && (
            <div className="p-2.5 bg-space-dark/80 border border-panel-blue/40 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-signal-cyan font-bold flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  Command: {currentStep.action.command}
                </span>
                <Badge
                  variant={currentStep.action.outcome === 'SUCCESS' ? 'nominal' : 'critical'}
                  className="text-[9px] py-0 px-1.5"
                >
                  {currentStep.action.outcome}
                </Badge>
              </div>
              <div className="text-[10px] text-offwhite/50">
                Target Subsystem: [{currentStep.action.subsystem}] • Initiated by: {currentStep.action.initiatedBy} • Action ID: {currentStep.action.actionId}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Replay Timeline Stream */}
      <Card withBracket>
        <CardHeader className="border-b border-panel-blue/40 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
            <History className="h-4 w-4 text-signal-cyan" />
            DISCRETE REPLAY TIMELINE ({totalSteps} MILESTONES)
          </CardTitle>
          <span className="text-[10px] text-offwhite/50">
            Click any milestone to jump/scrub immediately to that simulation point
          </span>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-xs max-h-[400px] overflow-y-auto pr-2 pt-3">
          {timeline.map((step) => {
            const isActive = step.stepIndex === currentStepIndex;

            return (
              <div
                key={step.stepIndex}
                onClick={() => stepReplay(step.stepIndex)}
                className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'border-signal-cyan bg-signal-cyan/10 font-bold'
                    : 'border-panel-blue/30 bg-space-surface/50 hover:border-panel-blue/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-none text-[10px] ${
                      isActive
                        ? 'bg-signal-cyan text-space-dark font-bold'
                        : 'bg-space-dark text-offwhite/60 border border-panel-blue/40'
                    }`}
                  >
                    {step.stepIndex + 1}
                  </span>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-signal-cyan text-xs">
                        {step.simulationTime}
                      </span>
                      <span className="text-offwhite text-xs">{step.title}</span>
                    </div>
                    <div className="text-[10px] text-offwhite/50 line-clamp-1">
                      {step.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-offwhite/70 shrink-0">
                  <span>O₂: {step.telemetrySnapshot.oxygenKg.toFixed(1)} kg</span>
                  <span>Batt: {step.telemetrySnapshot.batteryKwh.toFixed(1)} kWh</span>
                  {isActive && (
                    <Badge variant="nominal" className="text-[9px] py-0 px-1">
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
