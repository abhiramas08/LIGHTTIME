import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Flame,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  EMERGENCY_SCENARIOS,
  EmergencyActionDefinition,
} from '@/data/emergencies/emergencyScenarios';
import { EmergencyBriefingCard } from '@/components/emergency/EmergencyBriefingCard';
import { EmergencyActiveConsole } from '@/components/emergency/EmergencyActiveConsole';
import { EmergencyTimeline } from '@/components/emergency/EmergencyTimeline';
import { EmergencyImpactAudit } from '@/components/emergency/EmergencyImpactAudit';
import { EmergencyDebriefingModal } from '@/components/emergency/EmergencyDebriefingModal';

export const RespondEmergenciesView: React.FC = () => {
  const { missionState, executeMissionCommand } = useMissionStore();
  const emergency = missionState.emergency;
  const isEmergencyActive = emergency.activeScenario !== null;

  // Track selected scenario tab (default to active scenario or Scenario 1)
  const initialScenario =
    EMERGENCY_SCENARIOS.find((s) => s.id === emergency.activeScenario) ??
    EMERGENCY_SCENARIOS[0]!;

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenario.id);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showDebriefing, setShowDebriefing] = useState<boolean>(false);

  const selectedScenario =
    EMERGENCY_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? EMERGENCY_SCENARIOS[0]!;

  // If an emergency is currently running, find its full scenario definition
  const activeScenarioDef =
    EMERGENCY_SCENARIOS.find((s) => s.id === emergency.activeScenario) || null;

  // Handle triggering a new scenario
  const handleInitiateScenario = (scenarioId: string) => {
    const res = executeMissionCommand({
      subsystem: 'EMERGENCY',
      action: 'TRIGGER_EMERGENCY_SCENARIO',
      parameters: { scenarioId },
      initiatedBy: 'CREW',
    });
    setSelectedScenarioId(scenarioId);
    setActionFeedback(res.message);
    setShowDebriefing(false);
  };

  // Handle executing an interactive action
  const handleExecuteAction = (actionDef: EmergencyActionDefinition) => {
    const res = executeMissionCommand({
      subsystem: actionDef.subsystem,
      action: actionDef.action,
      parameters: {
        ...actionDef.parameters,
        requiresEarthComms: actionDef.requiresEarthComms,
      },
      initiatedBy: actionDef.authorizedBy === 'CREW_AUTONOMY' ? 'CREW' : 'GROUND',
    });
    setActionFeedback(res.message);
  };

  // Handle resolving emergency & opening debriefing
  const handleResolveEmergency = () => {
    executeMissionCommand({
      subsystem: 'EMERGENCY',
      action: 'RESOLVE_EMERGENCY',
      initiatedBy: 'CREW',
    });
    setShowDebriefing(true);
  };

  // Handle resetting emergency
  const handleResetEmergency = () => {
    executeMissionCommand({
      subsystem: 'EMERGENCY',
      action: 'RESET_EMERGENCY',
      initiatedBy: 'CREW',
    });
    setActionFeedback('Emergency simulation state reset to baseline.');
    setShowDebriefing(false);
  };

  // Handle replaying scenario from debriefing
  const handleReplayFromDebriefing = () => {
    handleResetEmergency();
    if (activeScenarioDef) {
      handleInitiateScenario(activeScenarioDef.id);
    } else {
      handleInitiateScenario(selectedScenario.id);
    }
  };

  return (
    <PageContainer
      moduleCode="MOD-04"
      title="RESPOND – Emergencies"
      description="Interactive contingency operations and flight safety rules console. Triage anomalies, execute time-critical checklists under speed-of-light delays, and evaluate mission consequences."
      actions={
        <div className="flex items-center gap-2">
          {isEmergencyActive ? (
            <Badge variant="critical" className="gap-1.5 animate-pulse font-mono font-bold">
              <Flame className="h-3 w-3" />
              ALARM ACTIVE: {emergency.severity}
            </Badge>
          ) : (
            <Badge variant="nominal" className="gap-1.5 font-mono">
              <ShieldCheck className="h-3 w-3" />
              FLIGHT SAFETY NOMINAL
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-mono text-offwhite/60 hover:text-offwhite gap-1"
            onClick={handleResetEmergency}
          >
            <RefreshCw className="h-3 w-3" />
            RESET SIMULATOR
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Five Playable Scenarios Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-offwhite/60 px-1">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-offwhite/80">
              <FileText className="h-3.5 w-3.5 text-signal-cyan" />
              FIVE PLAYABLE EMERGENCY SCENARIOS
            </span>
            <span>
              {isEmergencyActive ? 'Simulation In Progress' : 'Select a scenario to inspect briefing'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {EMERGENCY_SCENARIOS.map((scen) => {
              const isSelected = selectedScenarioId === scen.id;
              const isCurrentlyActive = emergency.activeScenario === scen.id;

              return (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => setSelectedScenarioId(scen.id)}
                  className={`p-3 text-left font-mono transition-all duration-150 border relative ${
                    isCurrentlyActive
                      ? 'border-critical-red bg-critical-red/15 text-white ring-1 ring-critical-red'
                      : isSelected
                      ? 'border-signal-cyan bg-panel-blue/30 text-white'
                      : 'border-panel-blue/40 bg-space-surface/70 text-offwhite/70 hover:border-panel-blue hover:text-offwhite'
                  }`}
                >
                  {isCurrentlyActive && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-critical-red animate-ping" />
                      <span className="text-[9px] text-critical-red font-bold">ACTIVE</span>
                    </div>
                  )}

                  <div className="text-[10px] text-offwhite/50 mb-1 flex items-center justify-between">
                    <span>{scen.category}</span>
                    <Badge
                      variant={scen.severity === 'CRITICAL' ? 'critical' : 'warning'}
                      className="text-[8px] px-1 py-0"
                    >
                      {scen.severity}
                    </Badge>
                  </div>
                  <div className="text-xs font-bold leading-snug truncate text-offwhite">
                    {scen.shortTitle}
                  </div>
                  <div className="text-[10px] text-offwhite/50 mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-warning-amber" />
                    {Math.round(scen.responseDeadlineSeconds / 60)}m deadline
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Main Work Area: Active Emergency HUD or Scenario Briefing Card */}
        {isEmergencyActive && activeScenarioDef ? (
          <EmergencyActiveConsole
            scenario={activeScenarioDef}
            missionState={missionState}
            onExecuteAction={handleExecuteAction}
            onResolveEmergency={handleResolveEmergency}
            onResetEmergency={handleResetEmergency}
            actionFeedback={actionFeedback}
          />
        ) : (
          <EmergencyBriefingCard
            scenario={selectedScenario}
            onInitiateScenario={handleInitiateScenario}
            isAnyEmergencyActive={isEmergencyActive}
          />
        )}

        {/* 3. Live Consumables & Crew Physiological Impact Audit */}
        <EmergencyImpactAudit missionState={missionState} />

        {/* 4. Event Chronology Timeline & Audit Stream */}
        <EmergencyTimeline
          missionState={missionState}
          scenario={activeScenarioDef || selectedScenario}
        />

        {/* 5. NASA Flight Safety Rules Reference Panel */}
        <Card withBracket className="border-panel-blue/40 bg-space-surface/70 font-mono text-xs">
          <CardHeader className="pb-2 border-b border-panel-blue/20">
            <CardTitle className="text-xs text-offwhite flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-signal-cyan" />
              NASA ARTEMIS LUNAR SURFACE FLIGHT SAFETY RULES MATRIX
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-offwhite/75">
            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/20 space-y-1">
              <span className="font-bold text-signal-cyan block">RULE 4.1 – ECLSS Pressure Containment</span>
              <p>
                If cabin pressure differential exceeds -15 kPa/min or oxygen inventory falls below 25 kg,
                all ongoing surface EVA sorties are immediately terminated.
              </p>
            </div>
            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/20 space-y-1">
              <span className="font-bold text-warning-amber block">RULE 6.3 – Local Crew Autonomy Override</span>
              <p>
                Crew autonomy has sole authority to execute emergency actions when Earth round-trip light-time
                latency exceeds available response time.
              </p>
            </div>
            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/20 space-y-1">
              <span className="font-bold text-critical-red block">RULE 9.2 – Solar Particle Event Ingress</span>
              <p>
                Upon Space Weather Prediction Center SPE alarm (proton flux &gt; 10 pfu), all crew members must
                ingress into the Core Storm Shelter within 20 minutes.
              </p>
            </div>
            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/20 space-y-1">
              <span className="font-bold text-signal-cyan block">RULE 11.5 – Loss-of-Signal Operations</span>
              <p>
                During loss of carrier or DSN communication blackout, ground-authorized directives are blocked.
                Crew must execute on-board autonomous contingency matrices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 6. Post-Scenario Debriefing Modal */}
        {showDebriefing && (
          <EmergencyDebriefingModal
            scenario={activeScenarioDef || selectedScenario}
            missionState={missionState}
            onReplay={handleReplayFromDebriefing}
            onClose={() => setShowDebriefing(false)}
          />
        )}
      </div>
    </PageContainer>
  );
};
