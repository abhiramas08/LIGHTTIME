import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PlayableEmergencyScenario } from '@/data/emergencies/emergencyScenarios';
import { MissionState } from '@/simulation/models/missionState';

interface EmergencyDebriefingModalProps {
  scenario: PlayableEmergencyScenario;
  missionState: MissionState;
  onReplay: () => void;
  onClose: () => void;
}

export const EmergencyDebriefingModal: React.FC<EmergencyDebriefingModalProps> = ({
  scenario,
  missionState,
  onReplay,
  onClose,
}) => {
  const emergency = missionState.emergency;
  const actions = emergency.responseActions;
  const remainingSeconds = emergency.remainingResponseTimeSeconds ?? 0;
  const isExpired = remainingSeconds <= 0;

  // Calculate pedagogical scores
  const actionCount = actions.length;
  const speedScore = isExpired
    ? 25
    : Math.min(100, Math.round(50 + (remainingSeconds / scenario.responseDeadlineSeconds) * 50));

  const resourceScore =
    scenario.category === 'OXYGEN'
      ? missionState.habitatResources.oxygenInventoryKg > 40
        ? 95
        : 65
      : scenario.category === 'POWER'
      ? missionState.habitatResources.batteryStateOfChargePercent > 20
        ? 90
        : 60
      : 88;

  const complianceScore =
    actionCount >= 1 && (!isExpired || actions.some((a) => a.authorizedBy === 'CREW_AUTONOMY'))
      ? 94
      : isExpired
      ? 45
      : 75;

  const compositeScore = Math.round((speedScore + resourceScore + complianceScore) / 3);
  const isSuccess = compositeScore >= 70 && !isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-dark/85 backdrop-blur-sm animate-in fade-in">
      <Card
        withBracket
        className="max-w-2xl w-full border-2 border-panel-blue bg-space-surface/98 shadow-2xl overflow-hidden font-mono text-xs"
      >
        <CardHeader className="border-b border-panel-blue/40 pb-4 bg-space-dark/80">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isSuccess ? 'nominal' : 'critical'} className="text-xs font-bold tracking-wider">
                  {isSuccess ? 'CONTINGENCY MITIGATED (SUCCESS)' : 'DEADLINE BREACHED (SUB-OPTIMAL)'}
                </Badge>
                <span className="text-offwhite/50 text-[10px]">{scenario.id}</span>
              </div>
              <CardTitle className="text-base text-offwhite flex items-center gap-2 font-heading">
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5 text-nominal-green" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-critical-red" />
                )}
                MISSION DEBRIEFING: {scenario.title}
              </CardTitle>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-offwhite/50">COMPOSITE GRADE</div>
              <div
                className={`text-2xl font-bold font-heading ${
                  compositeScore >= 85
                    ? 'text-nominal-green'
                    : compositeScore >= 70
                    ? 'text-signal-cyan'
                    : 'text-critical-red'
                }`}
              >
                {compositeScore}%
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5 max-h-[75vh] overflow-y-auto pr-2">
          {/* 1. Score Breakdown Gauges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-space-dark/70 border border-panel-blue/30 text-center space-y-1">
              <Clock className="h-4 w-4 text-warning-amber mx-auto" />
              <div className="text-[10px] text-offwhite/60">REACTION SPEED</div>
              <div className="text-lg font-bold text-offwhite">{speedScore}%</div>
              <div className="text-[9px] text-offwhite/50">
                {isExpired ? 'Time expired' : `${Math.round(remainingSeconds / 60)} min buffer`}
              </div>
            </div>

            <div className="p-3 bg-space-dark/70 border border-panel-blue/30 text-center space-y-1">
              <Zap className="h-4 w-4 text-signal-cyan mx-auto" />
              <div className="text-[10px] text-offwhite/60">RESOURCE EFFICIENCY</div>
              <div className="text-lg font-bold text-offwhite">{resourceScore}%</div>
              <div className="text-[9px] text-offwhite/50">Consumable margins intact</div>
            </div>

            <div className="p-3 bg-space-dark/70 border border-panel-blue/30 text-center space-y-1">
              <ShieldCheck className="h-4 w-4 text-nominal-green mx-auto" />
              <div className="text-[10px] text-offwhite/60">FLIGHT RULE ADHERENCE</div>
              <div className="text-lg font-bold text-offwhite">{complianceScore}%</div>
              <div className="text-[9px] text-offwhite/50">Autonomy & protocol checks</div>
            </div>
          </div>

          {/* 2. Educational Flight Rules Review */}
          <div className="p-3.5 bg-panel-blue/15 border-l-2 border-signal-cyan space-y-1.5">
            <div className="text-[11px] font-bold text-signal-cyan flex items-center gap-1.5 uppercase">
              <BookOpen className="h-3.5 w-3.5" />
              NASA FLIGHT CONTROLLER DEBRIEFING NOTES
            </div>
            <p className="text-[11px] text-offwhite/85 leading-relaxed">
              {isSuccess
                ? scenario.consequences.successfulMitigation
                : scenario.consequences.unresolvedFailure}
            </p>
            <div className="pt-2 text-[10px] text-offwhite/60 space-y-0.5 border-t border-panel-blue/20">
              {scenario.flightRuleReferences.map((rule, idx) => (
                <div key={idx} className="text-signal-cyan/80">• {rule}</div>
              ))}
            </div>
          </div>

          {/* 3. Action Sequence Log */}
          <div>
            <div className="text-[10px] font-bold text-offwhite/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-warning-amber" />
              DIRECTIVE EXECUTION RECORD ({actions.length} Actions Recorded)
            </div>
            {actions.length === 0 ? (
              <div className="p-2 bg-space-dark/60 text-offwhite/50 text-[11px] italic border border-panel-blue/20">
                No mitigation actions were executed prior to debriefing.
              </div>
            ) : (
              <div className="space-y-1.5">
                {actions.map((act, i) => (
                  <div
                    key={act.actionId}
                    className="p-2 bg-space-dark/70 border border-panel-blue/30 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-bold text-offwhite flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-nominal-green" />
                      Step {i + 1}: {act.description}
                    </span>
                    <Badge variant="neutral" className="text-[9px]">
                      {act.authorizedBy}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Modal Action Controls */}
          <div className="pt-3 border-t border-panel-blue/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto gap-2 text-offwhite border-panel-blue/70"
              onClick={onReplay}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              REPLAY SCENARIO (TEST ALTERNATE STRATEGY)
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto gap-2 font-bold tracking-wider"
              onClick={onClose}
            >
              RETURN TO FLIGHT DECK
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
