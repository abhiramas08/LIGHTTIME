/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Executive Summary Card
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Award, CheckCircle2, AlertOctagon } from 'lucide-react';
import { MissionDebriefReport } from '@/simulation/models/missionDebrief';

interface ExecutiveSummaryCardProps {
  report: MissionDebriefReport;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ report }) => {
  const { outcome, missionName, commanderCallsign, solsCompleted, missionDurationDays, elapsedHours, missionStatus, simulationRulesVersion } = report;

  const isSuccess = outcome.missionSuccess;
  const grade = outcome.grade;

  return (
    <Card withBracket className="border-panel-blue/70 bg-space-surface/95 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center bg-control-navy border border-telemetry-cyan/60 text-telemetry-cyan font-mono font-bold text-sm hud-bracket">
              LT
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">
                {missionName} – EXECUTIVE MISSION DEBRIEF
              </CardTitle>
              <p className="text-[11px] font-mono text-offwhite/60">
                Artemis Base Camp Expedition · Commander: {commanderCallsign} · Rules: {simulationRulesVersion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isSuccess ? 'nominal' : 'critical'}>
              {isSuccess ? 'MISSION SUCCESS' : 'MISSION ABORT / CRITICAL'}
            </Badge>
            <Badge variant={grade === 'EXEMPLARY' ? 'nominal' : grade === 'PROFICIENT' ? 'telemetry' : grade === 'MARGINAL' ? 'warning' : 'critical'}>
              GRADE: {grade} ({outcome.overallScore}/100)
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 font-mono text-xs">
        {/* Core Metric Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded border border-panel-blue/40 bg-space-black/50 space-y-1">
            <span className="text-[10px] text-offwhite/50 block">OVERALL FLIGHT GRADE</span>
            <div className="text-xl font-bold flex items-center gap-1.5">
              {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-nominal-green" />
              ) : (
                <AlertOctagon className="h-5 w-5 text-critical-red" />
              )}
              <span className={isSuccess ? 'text-nominal-green' : 'text-critical-red'}>
                {grade}
              </span>
            </div>
            <span className="text-[10px] text-offwhite/40 block">
              Score: {outcome.overallScore} / 100
            </span>
          </div>

          <div className="p-3 rounded border border-panel-blue/40 bg-space-black/50 space-y-1">
            <span className="text-[10px] text-offwhite/50 block">SURFACE DURATION</span>
            <div className="text-xl font-bold text-telemetry-cyan">
              Sol {solsCompleted} / {missionDurationDays}
            </div>
            <span className="text-[10px] text-offwhite/40 block">
              MET: {elapsedHours.toFixed(1)}h ({missionStatus})
            </span>
          </div>

          <div className="p-3 rounded border border-panel-blue/40 bg-space-black/50 space-y-1">
            <span className="text-[10px] text-offwhite/50 block">CREW HEALTH INDEX</span>
            <div className="text-xl font-bold text-warning-amber">
              {outcome.crewHealthScore} / 100
            </div>
            <span className="text-[10px] text-offwhite/40 block">
              Aggregate 4-Astronaut Composite
            </span>
          </div>

          <div className="p-3 rounded border border-panel-blue/40 bg-space-black/50 space-y-1">
            <span className="text-[10px] text-offwhite/50 block">RESOURCE EFFICIENCY</span>
            <div className="text-xl font-bold text-nominal-green">
              {outcome.resourceEfficiencyScore} / 100
            </div>
            <span className="text-[10px] text-offwhite/40 block">
              ECLSS closed-loop rating
            </span>
          </div>
        </div>

        {/* Debrief Bullet Points */}
        <div className="p-3.5 rounded border border-telemetry-cyan/30 bg-panel-blue/20 space-y-2">
          <div className="flex items-center gap-2 text-telemetry-cyan font-bold text-xs uppercase">
            <Award className="h-4 w-4" />
            <span>FLIGHT DIRECTOR DEBRIEF SUMMARY</span>
          </div>
          <div className="space-y-1 text-[11px] text-offwhite/80">
            {outcome.debriefSummary.map((summaryLine: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-telemetry-cyan font-bold shrink-0">·</span>
                <span>{summaryLine}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
