import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import {
  Clock,
  Radio,
  Lock,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Activity,
  UserCheck,
  RefreshCw,
  Flame,
} from 'lucide-react';
import {
  PlayableEmergencyScenario,
  EmergencyActionDefinition,
} from '@/data/emergencies/emergencyScenarios';
import { MissionState } from '@/simulation/models/missionState';

interface EmergencyActiveConsoleProps {
  scenario: PlayableEmergencyScenario;
  missionState: MissionState;
  onExecuteAction: (actionDef: EmergencyActionDefinition) => void;
  onResolveEmergency: () => void;
  onResetEmergency: () => void;
  actionFeedback: string | null;
}

export const EmergencyActiveConsole: React.FC<EmergencyActiveConsoleProps> = ({
  scenario,
  missionState,
  onExecuteAction,
  onResolveEmergency,
  onResetEmergency,
  actionFeedback,
}) => {
  const emergency = missionState.emergency;
  const comms = missionState.communications;
  const isCommsOffline =
    comms.status === 'DISCONNECTED' || comms.status === 'LOSS_OF_SIGNAL_OCCULTATION';

  const remainingSeconds = emergency.remainingResponseTimeSeconds ?? 0;
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecsFormatted = String(remainingSeconds % 60).padStart(2, '0');
  const deadlineExpired = remainingSeconds <= 0;

  const totalDeadlineSeconds = scenario.responseDeadlineSeconds;
  const percentRemaining = Math.max(
    0,
    Math.min(100, Math.round((remainingSeconds / totalDeadlineSeconds) * 100))
  );

  const completedActionIds = new Set(emergency.responseActions.map((a) => a.actionId));
  const completedCount = emergency.responseActions.length;
  const canResolve = completedCount >= 1 || deadlineExpired;

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Master Emergency Alarm Header */}
      <div className="p-4 bg-critical-red/10 border-2 border-critical-red flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-critical-red text-white animate-pulse rounded-none">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="critical" className="font-mono text-xs font-bold tracking-widest uppercase">
                MASTER ALARM: {emergency.severity}
              </Badge>
              <span className="text-[11px] text-offwhite/60">ID: {scenario.id}</span>
            </div>
            <h2 className="text-base font-bold font-heading text-offwhite tracking-wide uppercase mt-0.5">
              {scenario.title}
            </h2>
          </div>
        </div>

        {/* Live Response Countdown Clock */}
        <div className="flex items-center gap-4 bg-space-dark px-4 py-2 border border-critical-red/50 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-offwhite/50 tracking-wider uppercase flex items-center justify-end gap-1">
              <Clock className="h-3 w-3 text-warning-amber" />
              RESPONSE WINDOW
            </div>
            <div
              className={`text-xl font-bold font-mono tracking-wider ${
                deadlineExpired
                  ? 'text-critical-red animate-pulse'
                  : percentRemaining < 25
                  ? 'text-critical-red animate-pulse'
                  : 'text-warning-amber'
              }`}
            >
              {deadlineExpired ? 'EXPIRED' : `${remainingMinutes}:${remainingSecsFormatted}`}
            </div>
          </div>

          <div className="w-24 bg-space-surface h-3 border border-panel-blue/40 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                percentRemaining < 25
                  ? 'bg-critical-red'
                  : percentRemaining < 50
                  ? 'bg-warning-amber'
                  : 'bg-nominal-green'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Action Feedback Notification */}
      {actionFeedback && (
        <Alert variant="nominal" title="DIRECTIVE EXECUTION TELEMETRY" className="animate-in fade-in">
          {actionFeedback}
        </Alert>
      )}

      {/* 3. Communication Link Constraint Banner */}
      {isCommsOffline ? (
        <div className="p-3.5 bg-warning-amber/10 border-2 border-warning-amber/70 flex items-start gap-3">
          <Radio className="h-5 w-5 text-warning-amber shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-warning-amber uppercase tracking-wider flex items-center gap-2">
              COMMUNICATIONS LINK SEVERED (LOS) – EARTH ASSISTANCE UNAVAILABLE
              <Badge variant="warning" className="text-[9px]">FLIGHT RULE 11.5</Badge>
            </div>
            <p className="text-offwhite/80 leading-relaxed text-[11px]">
              Deep Space Network carrier lock lost ({comms.status}). Assistance requiring Earth contact is
              strictly blocked. You must exercise on-board <strong>Crew Autonomy</strong> protocols or first
              re-acquire DSN lock via high-gain gimbal search or Gateway relay.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-nominal-green/10 border border-nominal-green/40 flex items-center justify-between text-xs text-nominal-green px-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-nominal-green" />
            <span className="font-bold uppercase tracking-wider">
              DSN CARRIER LOCKED ({comms.dsnStation})
            </span>
            <span className="text-[11px] text-offwhite/60">
              • Latency: {comms.delaySeconds.toFixed(3)}s • Availability: {comms.availabilityPercent}%
            </span>
          </div>
          <Badge variant="nominal" className="text-[9px]">EARTH UPLINK READY</Badge>
        </div>
      )}

      {/* 4. Interactive Response Decision Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-offwhite uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-signal-cyan" />
            INTERACTIVE CONTINGENCY DIRECTIVES ({scenario.availableActions.length})
          </div>
          <div className="text-[11px] text-offwhite/50">
            Completed: {completedCount} / {scenario.availableActions.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenario.availableActions.map((actionDef) => {
            const isCompleted = completedActionIds.has(actionDef.actionId);
            const isBlockedByComms = actionDef.requiresEarthComms && isCommsOffline;

            return (
              <Card
                key={actionDef.actionId}
                withBracket
                className={`transition-all duration-200 ${
                  isCompleted
                    ? 'border-nominal-green/50 bg-nominal-green/5'
                    : isBlockedByComms
                    ? 'border-warning-amber/40 bg-space-dark/60 opacity-80'
                    : 'border-panel-blue/70 bg-space-surface/90 hover:border-signal-cyan'
                }`}
              >
                <CardHeader className="pb-2.5 border-b border-panel-blue/30">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xs font-bold text-offwhite leading-tight">
                      {actionDef.label}
                    </CardTitle>
                    {isCompleted ? (
                      <Badge variant="nominal" className="text-[9px] shrink-0">
                        COMPLETED
                      </Badge>
                    ) : isBlockedByComms ? (
                      <Badge variant="warning" className="text-[9px] shrink-0 gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        LOCKED (LOS)
                      </Badge>
                    ) : (
                      <Badge
                        variant="neutral"
                        className={`text-[9px] shrink-0 ${
                          actionDef.authorizedBy === 'CREW_AUTONOMY'
                            ? 'border-signal-cyan/60 text-signal-cyan'
                            : 'border-warning-amber/60 text-warning-amber'
                        }`}
                      >
                        {actionDef.authorizedBy}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-3 text-xs">
                  <p className="text-[11px] text-offwhite/80 leading-relaxed min-h-[40px]">
                    {actionDef.description}
                  </p>

                  {/* Resource & Operational Costs */}
                  <div className="p-2 bg-space-dark/80 border border-panel-blue/30 space-y-1 text-[10px]">
                    <div className="text-offwhite/50 font-bold uppercase tracking-wider">
                      Operational Costs:
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-offwhite/80">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-warning-amber" />
                        +{actionDef.cost.timeMinutes} min
                      </span>
                      {actionDef.cost.o2Kg !== undefined && (
                        <span>O2: -{actionDef.cost.o2Kg} kg</span>
                      )}
                      {actionDef.cost.batteryKwh !== undefined && (
                        <span>Batt: -{actionDef.cost.batteryKwh} kWh</span>
                      )}
                      {actionDef.cost.powerKw !== undefined && (
                        <span>Load: {actionDef.cost.powerKw > 0 ? `+${actionDef.cost.powerKw}` : actionDef.cost.powerKw} kW</span>
                      )}
                      {actionDef.cost.crewStressDelta !== undefined && (
                        <span>
                          Stress: {actionDef.cost.crewStressDelta > 0 ? `+${actionDef.cost.crewStressDelta}` : actionDef.cost.crewStressDelta}%
                        </span>
                      )}
                      {actionDef.cost.crewWorkloadDelta !== undefined && (
                        <span>Workload: +{actionDef.cost.crewWorkloadDelta}%</span>
                      )}
                    </div>
                  </div>

                  {/* Consequence Summary */}
                  <div className="p-2 bg-panel-blue/10 border-l-2 border-signal-cyan text-[10px] text-offwhite/80">
                    <span className="text-signal-cyan font-bold block mb-0.5">Physical Consequence:</span>
                    {actionDef.consequenceSummary}
                  </div>

                  {/* Action Execution Button */}
                  <div className="pt-2">
                    {isCompleted ? (
                      <div className="flex items-center justify-center gap-1.5 p-2 bg-nominal-green/20 text-nominal-green font-bold text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        DIRECTIVE EXECUTED
                      </div>
                    ) : isBlockedByComms ? (
                      <div className="space-y-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled
                          className="w-full gap-1.5 text-offwhite/40 cursor-not-allowed bg-space-dark border-warning-amber/40"
                        >
                          <Lock className="h-3.5 w-3.5 text-warning-amber" />
                          LOCKED: REQUIRES EARTH CONTACT
                        </Button>
                        <div className="text-[9px] text-warning-amber text-center">
                          DSN carrier is offline. Must restore comms first or use local crew autonomy.
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant={actionDef.authorizedBy === 'CREW_AUTONOMY' ? 'primary' : 'secondary'}
                        size="sm"
                        className="w-full gap-1.5 font-bold tracking-wider"
                        onClick={() => onExecuteAction(actionDef)}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        EXECUTE DIRECTIVE
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Active Response Operations Bar */}
      <div className="p-4 bg-space-surface border border-panel-blue/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-offwhite/70">
          <Activity className="h-4 w-4 text-signal-cyan" />
          <span>
            Actions Applied: <strong className="text-offwhite">{completedCount}</strong> • Subsystem: <strong className="text-offwhite">{scenario.category}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-offwhite/60 hover:text-offwhite"
            onClick={onResetEmergency}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            RESET EMERGENCY
          </Button>

          <Button
            variant="nominal"
            size="md"
            className="gap-2 font-bold tracking-wider bg-nominal-green hover:bg-nominal-green/90 text-space-dark"
            onClick={onResolveEmergency}
            disabled={!canResolve}
          >
            <UserCheck className="h-4 w-4" />
            RESOLVE & OPEN DEBRIEFING
          </Button>
        </div>
      </div>
    </div>
  );
};
