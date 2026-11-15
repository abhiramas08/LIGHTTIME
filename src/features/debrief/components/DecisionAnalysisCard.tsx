/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Decision Analysis Card
 *
 * Explains the 5 canonical decision analysis areas:
 * 1. What went well
 * 2. What created additional risk
 * 3. Which decisions improved the outcome
 * 4. Which decisions reduced available resources
 * 5. What could have been done differently
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Droplet,
  Compass,
  Cpu,
} from 'lucide-react';
import { DecisionAnalysis } from '@/simulation/models/missionDebrief';

interface DecisionAnalysisCardProps {
  decisionAnalysis: DecisionAnalysis;
  totalDirectivesExecuted: number;
}

export const DecisionAnalysisCard: React.FC<DecisionAnalysisCardProps> = ({
  decisionAnalysis,
  totalDirectivesExecuted,
}) => {
  return (
    <Card withBracket className="border-panel-blue/70 bg-space-surface/95">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/30 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-telemetry-cyan" />
            <CardTitle>OPERATIONAL DECISION ANALYSIS & POST-FLIGHT CRITIQUE</CardTitle>
          </div>
          <Badge variant="telemetry">{totalDirectivesExecuted} Total Directives Evaluated</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 font-mono text-xs">
        {/* Row 1: What Went Well & What Created Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What Went Well */}
          <div className="p-4 rounded border border-nominal-green/40 bg-space-black/50 space-y-2.5">
            <div className="flex items-center gap-2 text-nominal-green font-bold text-xs uppercase">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>1. WHAT WENT WELL</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-offwhite/80">
              {decisionAnalysis.whatWentWell.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-nominal-green font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Created Additional Risk */}
          <div className="p-4 rounded border border-warning-amber/40 bg-space-black/50 space-y-2.5">
            <div className="flex items-center gap-2 text-warning-amber font-bold text-xs uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>2. WHAT CREATED ADDITIONAL RISK</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-offwhite/80">
              {decisionAnalysis.whatCreatedRisk.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-warning-amber font-bold shrink-0">▲</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: Decisions Improving Outcome & Decisions Reducing Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Which Decisions Improved the Outcome */}
          <div className="p-4 rounded border border-telemetry-cyan/40 bg-space-black/50 space-y-2.5">
            <div className="flex items-center gap-2 text-telemetry-cyan font-bold text-xs uppercase">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>3. DECISIONS THAT IMPROVED THE OUTCOME</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-offwhite/80">
              {decisionAnalysis.decisionsImprovingOutcome.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-telemetry-cyan font-bold shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Which Decisions Reduced Available Resources */}
          <div className="p-4 rounded border border-panel-blue/40 bg-space-black/50 space-y-2.5">
            <div className="flex items-center gap-2 text-offwhite/70 font-bold text-xs uppercase">
              <Droplet className="h-4 w-4 shrink-0 text-telemetry-cyan" />
              <span>4. DECISIONS REDUCING AVAILABLE RESOURCES</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-offwhite/80">
              {decisionAnalysis.decisionsReducingResources.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-offwhite/50 font-bold shrink-0">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 3: What Could Be Done Differently */}
        <div className="p-4 rounded border border-telemetry-cyan/30 bg-panel-blue/15 space-y-2.5">
          <div className="flex items-center gap-2 text-telemetry-cyan font-bold text-xs uppercase">
            <Compass className="h-4 w-4 shrink-0" />
            <span>5. WHAT COULD HAVE BEEN DONE DIFFERENTLY (RECOMMENDED FLIGHT DOCTRINE)</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-offwhite/90">
            {decisionAnalysis.whatCouldBeDoneDifferently.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-telemetry-cyan font-bold shrink-0">★</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
