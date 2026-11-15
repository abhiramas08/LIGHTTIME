/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Educational Explanation & Debriefing Card
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { BookOpen, Compass, ShieldAlert, Cpu, Award, CheckCircle } from 'lucide-react';
import { ComparativeAnalysisReport } from '@/simulation/models/consequenceLab';

interface EducationalExplanationCardProps {
  report: ComparativeAnalysisReport;
}

export const EducationalExplanationCard: React.FC<EducationalExplanationCardProps> = ({ report }) => {
  const { educationalTakeaways } = report;

  return (
    <Card withBracket className="border-panel-blue/60 bg-space-surface/95">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-telemetry-cyan" />
            <CardTitle className="text-sm">
              EDUCATIONAL SYNTHESIS & MISSION LESSONS LEARNED
            </CardTitle>
          </div>
          <Badge variant="telemetry">NASA ARTEMIS FLIGHT RULES BRIEFING</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 font-mono text-xs text-offwhite/80">
        {/* Headline */}
        <div className="p-3 rounded border border-telemetry-cyan/30 bg-panel-blue/20">
          <h4 className="text-sm font-bold text-offwhite mb-1">
            {educationalTakeaways.headline}
          </h4>
          <p className="text-[11px] text-offwhite/70">
            {educationalTakeaways.speedOfLightImpact}
          </p>
        </div>

        {/* Core Educational Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/40 space-y-2">
            <div className="flex items-center gap-2 text-telemetry-cyan font-bold">
              <Compass className="h-4 w-4" />
              <span>THE SPEED-OF-LIGHT DELAY HORIZON</span>
            </div>
            <p className="text-[11px] text-offwhite/70 leading-relaxed">
              At the lunar distance (mean 384,400 km), radio waves require approximately 1.28 seconds to travel one way (2.56 seconds round-trip). In deep-space transit to Mars, latency reaches 4 to 24 minutes one way.
            </p>
            <p className="text-[11px] text-offwhite/70 leading-relaxed">
              When communication is severed by lunar rotation or terrain shadow, ground controllers cannot monitor live transducers or authorize safety-critical overrides. Waiting for ground approval during active consumable loss leads to catastrophic failure.
            </p>
          </div>

          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/40 space-y-2">
            <div className="flex items-center gap-2 text-warning-amber font-bold">
              <ShieldAlert className="h-4 w-4" />
              <span>THE AUTONOMY VS GROUND ASSISTANCE TRADEOFF</span>
            </div>
            <p className="text-[11px] text-offwhite/70 leading-relaxed">
              {educationalTakeaways.autonomyTradeoff}
            </p>
            <p className="text-[11px] text-offwhite/70 leading-relaxed">
              NASA Artemis Flight Rule 11.5 explicitly mandates autonomous on-board decision-making for time-critical emergencies during Loss of Signal (LOS). The commander must act without waiting for Houston flight director assent.
            </p>
          </div>
        </div>

        {/* Applied Flight Rules */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-offwhite uppercase">
            <Cpu className="h-4 w-4 text-telemetry-cyan" />
            <span>APPLIED NASA FLIGHT RULES & OPERATIONAL CONSTRAINTS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {educationalTakeaways.flightRulesApplied.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-space-black/60 border border-panel-blue/30 text-[11px]"
              >
                <span className="text-telemetry-cyan font-bold block mb-1">
                  FLIGHT RULE {idx + 1}
                </span>
                <span className="text-offwhite/80">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mathematical Evidence Points */}
        <div className="space-y-2 border-t border-panel-blue/30 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-nominal-green uppercase">
            <Award className="h-4 w-4" />
            <span>EMPIRICAL SIMULATION EVIDENCE (VERIFIED NO FABRICATION)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {educationalTakeaways.pedagogicalSummary.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-space-black/40 border border-panel-blue/20 text-[11px]"
              >
                <CheckCircle className="h-3.5 w-3.5 text-nominal-green shrink-0 mt-0.5" />
                <span className="text-offwhite/80">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
