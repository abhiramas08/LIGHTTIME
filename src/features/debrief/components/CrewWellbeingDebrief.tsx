/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Crew Wellbeing Summary
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Users, Moon, Dumbbell, HeartPulse } from 'lucide-react';
import { CrewDebriefRecord } from '@/simulation/models/missionDebrief';

interface CrewWellbeingDebriefProps {
  crewRecords: CrewDebriefRecord[];
  aggregateCrewHealthScore: number;
}

export const CrewWellbeingDebrief: React.FC<CrewWellbeingDebriefProps> = ({
  crewRecords,
  aggregateCrewHealthScore,
}) => {
  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-warning-amber" />
            <CardTitle>CREW PHYSIOLOGICAL & HUMAN FACTORS DEBRIEF</CardTitle>
          </div>
          <Badge variant={aggregateCrewHealthScore >= 75 ? 'nominal' : aggregateCrewHealthScore >= 50 ? 'warning' : 'critical'}>
            AGGREGATE CREW HEALTH: {aggregateCrewHealthScore} / 100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crewRecords.map((crew) => (
            <div
              key={crew.astronautId}
              className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 font-mono text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-panel-blue/30 pb-2">
                <div>
                  <span className="font-bold text-offwhite text-sm">
                    {crew.name} ({crew.callsign})
                  </span>
                  <span className="text-[11px] text-telemetry-cyan block">{crew.role}</span>
                </div>
                <Badge
                  variant={
                    crew.readinessRating === 'OPTIMAL'
                      ? 'nominal'
                      : crew.readinessRating === 'NOMINAL'
                      ? 'telemetry'
                      : crew.readinessRating === 'DEGRADED'
                      ? 'warning'
                      : 'critical'
                  }
                >
                  {crew.readinessRating}
                </Badge>
              </div>

              {/* Vital Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-space-surface/50 border border-panel-blue/20">
                  <span className="text-[10px] text-offwhite/50 block">FATIGUE INDEX</span>
                  <span className={`font-bold ${crew.finalFatigueIndex > 60 ? 'text-critical-red' : 'text-offwhite'}`}>
                    {crew.finalFatigueIndex}%
                  </span>
                </div>

                <div className="p-1.5 rounded bg-space-surface/50 border border-panel-blue/20">
                  <span className="text-[10px] text-offwhite/50 block">STRESS INDEX</span>
                  <span className={`font-bold ${crew.finalStressIndex > 60 ? 'text-warning-amber' : 'text-offwhite'}`}>
                    {crew.finalStressIndex}%
                  </span>
                </div>

                <div className="p-1.5 rounded bg-space-surface/50 border border-panel-blue/20">
                  <span className="text-[10px] text-offwhite/50 block">RADIATION DOSE</span>
                  <span className="font-bold text-telemetry-cyan">
                    {crew.cumulativeRadiationDoseMsv.toFixed(2)} mSv
                  </span>
                </div>
              </div>

              {/* Behavior & Lifestyle Averages */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-offwhite/60">
                <span className="flex items-center gap-1">
                  <Moon className="h-3 w-3 text-telemetry-cyan" />
                  Sleep: {crew.sleepHoursPerSol.toFixed(1)}h/sol
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3 text-nominal-green" />
                  Exercise: {crew.exerciseMinutesPerSol}m/sol
                </span>
                <span className="flex items-center gap-1">
                  <HeartPulse className="h-3 w-3 text-warning-amber" />
                  Nutrition: {crew.nutritionScore}%
                </span>
              </div>

              {/* Medical Flight Notes */}
              <div className="p-2 rounded bg-space-surface/40 border border-panel-blue/20 text-[10px] text-offwhite/70">
                <span className="text-telemetry-cyan font-bold block mb-0.5">Flight Surgeon Assessment:</span>
                {crew.medicalFlightNotes}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
