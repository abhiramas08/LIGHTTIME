import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { MissionState } from '@/simulation/models/missionState';
import { PlayableEmergencyScenario } from '@/data/emergencies/emergencyScenarios';

interface EmergencyTimelineProps {
  missionState: MissionState;
  scenario?: PlayableEmergencyScenario | null;
}

export const EmergencyTimeline: React.FC<EmergencyTimelineProps> = ({
  missionState,
  scenario,
}) => {
  const emergency = missionState.emergency;
  const actions = emergency.responseActions;
  const remainingSeconds = emergency.remainingResponseTimeSeconds ?? 0;
  const isExpired = remainingSeconds <= 0 && emergency.activeScenario !== null;

  // Filter mission events relevant to emergency & ECLSS
  const emergencyEvents = missionState.records.eventHistory
    .filter(
      (e) =>
        e.category === 'EMERGENCY' ||
        e.category === 'COMMAND_PIPELINE' ||
        e.title.includes('DIRECTIVE') ||
        e.title.includes('EMERGENCY')
    )
    .slice(0, 8);

  return (
    <Card withBracket className="border-panel-blue/50 bg-space-surface/90 font-mono">
      <CardHeader className="border-b border-panel-blue/30 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
            <Clock className="h-4 w-4 text-signal-cyan" />
            CONTINGENCY EVENT TIMELINE & RESPONSE LOG
          </CardTitle>
          <Badge variant={emergency.activeScenario ? 'warning' : 'nominal'} className="text-[10px]">
            {emergency.activeScenario ? 'TIMELINE ACTIVE' : 'NOMINAL TIMELINE'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 text-xs space-y-4">
        {/* Step-by-Step Chronology */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-panel-blue/40">
          {/* 1. Initial Trigger Event */}
          <div className="relative flex items-start gap-3">
            <div className="absolute -left-6 mt-1 w-3.5 h-3.5 bg-critical-red border-2 border-space-dark rounded-full shrink-0 animate-ping" />
            <div className="absolute -left-6 mt-1 w-3.5 h-3.5 bg-critical-red border-2 border-space-dark rounded-full shrink-0" />
            <div className="p-2.5 bg-critical-red/10 border border-critical-red/40 w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-critical-red text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  T+00:00 • CONTINGENCY TRIGGER DECLARED
                </span>
                <span className="text-[10px] text-offwhite/50">MET {missionState.mission.elapsedHours.toFixed(1)}h</span>
              </div>
              <p className="text-[11px] text-offwhite/80 mt-1">
                {scenario?.triggerConditions.description || 'Abnormal telemetry excursion breached safe flight envelope.'}
              </p>
            </div>
          </div>

          {/* 2. Executed Actions Stream */}
          {actions.length === 0 ? (
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-6 mt-1.5 w-3.5 h-3.5 bg-warning-amber/50 border-2 border-space-dark rounded-full shrink-0" />
              <div className="p-2.5 bg-space-dark/60 border border-panel-blue/30 w-full text-offwhite/60 text-[11px] italic">
                Awaiting crew or ground intervention directives... Time-to-criticality clock is running.
              </div>
            </div>
          ) : (
            actions.map((act, idx) => (
              <div key={act.actionId} className="relative flex items-start gap-3">
                <div className="absolute -left-6 mt-1.5 w-3.5 h-3.5 bg-nominal-green border-2 border-space-dark rounded-full shrink-0" />
                <div className="p-2.5 bg-nominal-green/10 border border-nominal-green/30 w-full space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-nominal-green text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      STEP {idx + 1}: {act.description}
                    </span>
                    <Badge variant="neutral" className="text-[9px] border-panel-blue/50">
                      {act.authorizedBy}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-offwhite/60">
                    Status: <strong className="text-nominal-green">{act.status}</strong> • Directive verified by simulation telemetry.
                  </div>
                </div>
              </div>
            ))
          )}

          {/* 3. Response Deadline Threshold */}
          <div className="relative flex items-start gap-3">
            <div
              className={`absolute -left-6 mt-1.5 w-3.5 h-3.5 border-2 border-space-dark rounded-full shrink-0 ${
                isExpired ? 'bg-critical-red animate-pulse' : 'bg-warning-amber'
              }`}
            />
            <div
              className={`p-2.5 w-full text-[11px] ${
                isExpired
                  ? 'bg-critical-red/20 border border-critical-red text-critical-red font-bold'
                  : 'bg-space-dark/80 border border-panel-blue/40 text-offwhite/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  RESPONSE DEADLINE WINDOW: {scenario ? `${Math.round(scenario.responseDeadlineSeconds / 60)} min` : 'TBD'}
                </span>
                <span className="font-mono font-bold">
                  {isExpired ? 'DEADLINE EXPIRED' : `${Math.round(remainingSeconds / 60)} min remaining`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Flight Control Audit Trail */}
        <div className="pt-3 border-t border-panel-blue/30 space-y-2">
          <div className="text-[10px] uppercase font-bold text-offwhite/50 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-signal-cyan" />
            FLIGHT DIRECTIVE EVENT LOG STREAM
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {emergencyEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="p-1.5 bg-space-dark/60 border border-panel-blue/20 flex items-start justify-between text-[10px] gap-2"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-offwhite/90 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-signal-cyan" />
                    {evt.title}
                  </div>
                  <div className="text-offwhite/60">{evt.details}</div>
                </div>
                <Badge
                  variant={
                    evt.severity === 'CRITICAL'
                      ? 'critical'
                      : evt.severity === 'WARNING'
                      ? 'warning'
                      : 'nominal'
                  }
                  className="text-[8px] shrink-0"
                >
                  {evt.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
