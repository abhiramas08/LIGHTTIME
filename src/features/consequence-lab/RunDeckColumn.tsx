/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Single Run Deck Column
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Radio,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LaboratoryRunState } from '@/simulation/models/consequenceLab';
import { PlayableEmergencyScenario, EmergencyActionDefinition } from '@/data/emergencies/emergencyScenarios';

interface RunDeckColumnProps {
  run: LaboratoryRunState;
  scenario: PlayableEmergencyScenario;
  onExecuteAction: (actionDef: EmergencyActionDefinition) => void;
  onAdvanceTime: (deltaHours: number) => void;
  onResolve: () => void;
  actionFeedback?: string | null;
  borderColor?: string;
  badgeVariant?: 'telemetry' | 'critical' | 'warning' | 'nominal';
}

export const RunDeckColumn: React.FC<RunDeckColumnProps> = ({
  run,
  scenario,
  onExecuteAction,
  onAdvanceTime,
  onResolve,
  actionFeedback,
  borderColor = 'border-telemetry-cyan/50',
  badgeVariant = 'telemetry',
}) => {
  const { currentState, commPreset, outcomeMetrics } = run;
  const isCommsOffline =
    currentState.communications.status === 'LOSS_OF_SIGNAL_OCCULTATION' ||
    currentState.communications.status === 'DISCONNECTED';

  return (
    <div className={`space-y-4 rounded-lg border ${borderColor} bg-space-surface/90 p-4 shadow-sm`}>
      {/* Run Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-panel-blue/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold text-offwhite tracking-wide">
              {run.name}
            </h3>
            <Badge variant={badgeVariant}>{commPreset.shortLabel}</Badge>
          </div>
          <p className="text-[11px] font-mono text-offwhite/60 mt-0.5">
            {commPreset.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isCommsOffline ? 'critical' : 'nominal'}>
            <Radio className="h-3 w-3 mr-1 inline" />
            {currentState.communications.status}
          </Badge>
          <span className="text-[11px] font-mono text-telemetry-cyan">
            τ: {commPreset.delaySeconds}s | {commPreset.availabilityPercent}%
          </span>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="p-2 rounded bg-space-black/50 border border-panel-blue/30">
          <span className="text-[10px] text-offwhite/50 block">O2 RESERVES</span>
          <span className={`text-sm font-bold ${currentState.habitatResources.oxygenInventoryKg < 60 ? 'text-critical-red' : 'text-telemetry-cyan'}`}>
            {currentState.habitatResources.oxygenInventoryKg.toFixed(2)} kg
          </span>
          <span className="text-[9px] text-offwhite/40 block">
            Burn: {currentState.habitatResources.oxygenConsumptionRateKgPerHour.toFixed(2)} kg/h
          </span>
        </div>

        <div className="p-2 rounded bg-space-black/50 border border-panel-blue/30">
          <span className="text-[10px] text-offwhite/50 block">BATTERY STORAGE</span>
          <span className={`text-sm font-bold ${currentState.habitatResources.batteryStorageKwh < 30 ? 'text-warning-amber' : 'text-telemetry-cyan'}`}>
            {currentState.habitatResources.batteryStorageKwh.toFixed(1)} kWh
          </span>
          <span className="text-[9px] text-offwhite/40 block">
            SoC: {currentState.habitatResources.batteryStateOfChargePercent.toFixed(0)}%
          </span>
        </div>

        <div className="p-2 rounded bg-space-black/50 border border-panel-blue/30">
          <span className="text-[10px] text-offwhite/50 block">CREW STRESS / FATIGUE</span>
          <span className="text-sm font-bold text-warning-amber">
            {outcomeMetrics.averageCrewStress}% / {outcomeMetrics.averageCrewFatigue}%
          </span>
          <span className="text-[9px] text-offwhite/40 block">
            4-Crew Composite
          </span>
        </div>

        <div className="p-2 rounded bg-space-black/50 border border-panel-blue/30">
          <span className="text-[10px] text-offwhite/50 block">SAFETY SCORE</span>
          <span className={`text-sm font-bold ${outcomeMetrics.crewSafetyScore >= 70 ? 'text-nominal-green' : outcomeMetrics.crewSafetyScore >= 45 ? 'text-warning-amber' : 'text-critical-red'}`}>
            {outcomeMetrics.crewSafetyScore} / 100
          </span>
          <span className="text-[9px] text-offwhite/40 block">
            Status: {outcomeMetrics.missionCompletionStatus}
          </span>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-2.5 rounded bg-panel-blue/20 border border-telemetry-cyan/30 text-[11px] font-mono text-offwhite flex items-center justify-between">
          <span className="truncate mr-2">{actionFeedback}</span>
        </div>
      )}

      {/* Interactive Emergency Actions Console */}
      <Card withBracket>
        <CardHeader className="py-2.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">
              <Shield className="h-3.5 w-3.5 text-telemetry-cyan" />
              AVAILABLE EMERGENCY DIRECTIVES
            </CardTitle>
            <span className="text-[10px] font-mono text-offwhite/50">
              {scenario.availableActions.length} Procedural Options
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-1">
          {scenario.availableActions.map((actionDef) => {
            const isEarthRequired = actionDef.requiresEarthComms || actionDef.authorizedBy === 'GROUND';
            const isBlockedByComms = isCommsOffline && isEarthRequired;

            return (
              <div
                key={actionDef.actionId}
                className={`p-3 rounded border font-mono transition-all ${
                  isBlockedByComms
                    ? 'border-critical-red/30 bg-critical-red/5 opacity-80'
                    : 'border-panel-blue/40 bg-space-black/40 hover:border-telemetry-cyan/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-offwhite">
                      {actionDef.label}
                    </span>
                    <Badge variant={actionDef.authorizedBy === 'GROUND' ? 'telemetry' : 'warning'}>
                      {actionDef.authorizedBy}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isBlockedByComms ? 'outline' : 'primary'}
                    disabled={isBlockedByComms}
                    onClick={() => onExecuteAction(actionDef)}
                    className="text-xs h-7 px-3 shrink-0"
                  >
                    {isBlockedByComms ? 'BLOCKED: NO COMMS' : 'EXECUTE DIRECTIVE'}
                  </Button>
                </div>

                <p className="text-[11px] text-offwhite/70 mb-2">
                  {actionDef.description}
                </p>

                {isBlockedByComms && (
                  <div className="p-1.5 rounded bg-critical-red/10 border border-critical-red/30 text-[10px] text-critical-red mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>Flight Rule 11.5 Interlock: Earth ground assistance unavailable during signal loss.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-offwhite/50 border-t border-panel-blue/20 pt-1.5">
                  <span>Time Cost: ~{actionDef.cost.timeMinutes}m</span>
                  {actionDef.cost.o2Kg && <span>O2 Cost: {actionDef.cost.o2Kg} kg</span>}
                  {actionDef.cost.batteryKwh && <span>Battery Cost: {actionDef.cost.batteryKwh} kWh</span>}
                  {actionDef.cost.crewStressDelta && (
                    <span className={actionDef.cost.crewStressDelta > 0 ? 'text-warning-amber' : 'text-nominal-green'}>
                      Stress Δ: {actionDef.cost.crewStressDelta > 0 ? '+' : ''}{actionDef.cost.crewStressDelta}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Time Advance & Resolution Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-space-black/40 border border-panel-blue/30 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-offwhite/50">STEP SIMULATION:</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-[10px] h-7 px-2"
            onClick={() => onAdvanceTime(0.25)}
          >
            +15m
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-[10px] h-7 px-2"
            onClick={() => onAdvanceTime(0.5)}
          >
            +30m
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-[10px] h-7 px-2"
            onClick={() => onAdvanceTime(1.0)}
          >
            +1.0h
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs h-7 gap-1 border-nominal-green/60 text-nominal-green hover:bg-nominal-green/10"
          onClick={onResolve}
        >
          <CheckCircle2 className="h-3 w-3" />
          RESOLVE CONTINGENCY
        </Button>
      </div>

      {/* Action History Log */}
      <div className="p-2.5 rounded bg-space-black/50 border border-panel-blue/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-offwhite">
          <span>RUN ACTION LOG ({run.actionsHistory.length})</span>
          <span className="text-[10px] text-offwhite/50">
            MET: {currentState.mission.elapsedHours.toFixed(1)}h
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono pr-1">
          {run.actionsHistory.length === 0 ? (
            <p className="text-offwhite/40 italic">No actions recorded yet.</p>
          ) : (
            run.actionsHistory.map((act) => (
              <div
                key={act.actionId}
                className="flex items-center justify-between p-1.5 rounded bg-space-surface/50 border border-panel-blue/20"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {act.outcome === 'SUCCESS' ? (
                    <CheckCircle2 className="h-3 w-3 text-nominal-green shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-critical-red shrink-0" />
                  )}
                  <span className="truncate text-offwhite font-bold">{act.command}</span>
                  <span className="text-[10px] text-offwhite/40">({act.initiatedBy})</span>
                </div>
                <Badge variant={act.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                  {act.outcome}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
