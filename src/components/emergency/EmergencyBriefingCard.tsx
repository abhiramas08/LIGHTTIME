import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  AlertTriangle,
  Clock,
  Radio,
  BookOpen,
  ArrowRight,
  Gauge,
  Zap,
  Activity,
} from 'lucide-react';
import { PlayableEmergencyScenario } from '@/data/emergencies/emergencyScenarios';

interface EmergencyBriefingCardProps {
  scenario: PlayableEmergencyScenario;
  onInitiateScenario: (scenarioId: string) => void;
  isAnyEmergencyActive: boolean;
}

export const EmergencyBriefingCard: React.FC<EmergencyBriefingCardProps> = ({
  scenario,
  onInitiateScenario,
  isAnyEmergencyActive,
}) => {
  const deadlineMinutes = Math.round(scenario.responseDeadlineSeconds / 60);
  const durationMinutes = Math.round(scenario.eventDurationSeconds / 60);

  return (
    <Card withBracket className="border-panel-blue/60 bg-space-surface/95">
      <CardHeader className="border-b border-panel-blue/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={scenario.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                {scenario.severity} CONTINGENCY
              </Badge>
              <Badge variant="neutral" className="border-panel-blue/60 text-offwhite/80 font-mono text-[10px]">
                {scenario.id} (v{scenario.version})
              </Badge>
              <Badge variant="telemetry" className="border-signal-cyan/40 text-signal-cyan font-mono text-[10px]">
                DIFFICULTY: {scenario.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-lg text-offwhite flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${scenario.severity === 'CRITICAL' ? 'text-critical-red animate-pulse' : 'text-warning-amber'}`} />
              {scenario.title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-offwhite/70 shrink-0">
            <div className="flex items-center gap-1.5 bg-space-dark/80 px-2.5 py-1.5 border border-panel-blue/40">
              <Clock className="h-4 w-4 text-warning-amber" />
              <span>DEADLINE: <strong className="text-offwhite font-bold">{deadlineMinutes} min</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-space-dark/80 px-2.5 py-1.5 border border-panel-blue/40">
              <Activity className="h-4 w-4 text-signal-cyan" />
              <span>DURATION: <strong className="text-offwhite font-bold">{durationMinutes} min</strong></span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5 text-xs font-mono">
        {/* Threat Summary Narrative */}
        <div className="p-3.5 bg-panel-blue/10 border-l-2 border-signal-cyan/80 text-offwhite/90 leading-relaxed">
          <div className="text-[11px] font-bold tracking-wider uppercase text-signal-cyan mb-1 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            SITUATIONAL THREAT BRIEFING
          </div>
          <p className="text-xs leading-relaxed">{scenario.initialConditions.narrative}</p>
        </div>

        {/* Trigger Conditions & Telemetry Metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-space-dark/60 border border-panel-blue/30 space-y-1.5">
            <div className="text-[11px] font-bold text-warning-amber flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              TRIGGER THRESHOLD & TELEMETRY
            </div>
            <div className="text-[11px] text-offwhite/70">
              <span className="text-offwhite/50 block">Condition:</span>
              {scenario.triggerConditions.description}
            </div>
            <div className="text-[11px] font-bold text-critical-red mt-1 p-1.5 bg-critical-red/10 border border-critical-red/30">
              METRIC: {scenario.triggerConditions.thresholdDisplay}
            </div>
          </div>

          <div className="p-3 bg-space-dark/60 border border-panel-blue/30 space-y-1.5">
            <div className="text-[11px] font-bold text-signal-cyan flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              INITIAL SYSTEM ANOMALIES
            </div>
            <div className="space-y-1 text-[11px]">
              {Object.entries(scenario.initialConditions.telemetryDeltas).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-panel-blue/20 pb-0.5">
                  <span className="text-offwhite/60">{key}:</span>
                  <span className="text-offwhite font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consequences: Failure vs Mitigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-critical-red/10 border border-critical-red/30 space-y-1">
            <div className="text-[11px] font-bold text-critical-red flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              UNRESOLVED CONSEQUENCE (FAILURE)
            </div>
            <p className="text-[11px] text-offwhite/80 leading-relaxed">
              {scenario.consequences.unresolvedFailure}
            </p>
          </div>

          <div className="p-3 bg-nominal-green/10 border border-nominal-green/30 space-y-1">
            <div className="text-[11px] font-bold text-nominal-green flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              SUCCESSFUL MITIGATION OUTCOME
            </div>
            <p className="text-[11px] text-offwhite/80 leading-relaxed">
              {scenario.consequences.successfulMitigation}
            </p>
          </div>
        </div>

        {/* Learning Objectives & Flight Rules */}
        <div className="p-3.5 bg-space-dark/80 border border-panel-blue/40 space-y-2">
          <div className="text-[11px] font-bold text-offwhite flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-signal-cyan" />
            PEDAGOGICAL LEARNING OBJECTIVES & NASA FLIGHT RULES
          </div>
          <ul className="space-y-1 text-[11px] text-offwhite/75 list-disc list-inside">
            {scenario.learningObjectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-panel-blue/20 space-y-1 text-[10px] text-offwhite/60">
            {scenario.flightRuleReferences.map((rule, i) => (
              <div key={i} className="text-signal-cyan/80">• {rule}</div>
            ))}
          </div>
        </div>

        {/* Action Controls Preview */}
        <div>
          <div className="text-[11px] font-bold text-offwhite/60 uppercase mb-2">
            Available Response Actions ({scenario.availableActions.length} Interactive Directives):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {scenario.availableActions.map((act) => (
              <div key={act.actionId} className="p-2 bg-space-dark/50 border border-panel-blue/30 text-[10px]">
                <div className="font-bold text-offwhite mb-0.5">{act.label}</div>
                <div className="text-offwhite/50 text-[9px]">
                  Auth: <span className={act.authorizedBy === 'CREW_AUTONOMY' ? 'text-signal-cyan' : 'text-warning-amber'}>{act.authorizedBy}</span>
                  {act.requiresEarthComms && ' • Requires DSN'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Scenario Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-panel-blue/40">
          <div className="text-[11px] text-offwhite/50">
            Every emergency is fully deterministic and replayable. Simulation engine processes all decisions.
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto gap-2 bg-critical-red hover:bg-critical-red/80 text-white font-bold tracking-wider"
            onClick={() => onInitiateScenario(scenario.id)}
            disabled={isAnyEmergencyActive}
          >
            {isAnyEmergencyActive ? 'ANOTHER EMERGENCY IS CURRENTLY ACTIVE' : 'INITIATE CONTINGENCY SIMULATION'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
