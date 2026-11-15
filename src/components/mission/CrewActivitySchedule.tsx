/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Crew Activity Schedule & Availability Matrix
 *
 * Displays active flight duty schedules, circadian windows, countermeasure
 * exercise completion, and surface sortie status across all 4 astronauts.
 */

import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Calendar, Clock, Activity, Dumbbell, Bed } from 'lucide-react';

export const CrewActivitySchedule: React.FC = () => {
  const { missionState } = useMissionStore();

  const availabilityCounts = {
    AVAILABLE: missionState.crew.filter((c) => c.availability === 'AVAILABLE').length,
    ON_EVA: missionState.crew.filter((c) => c.availability === 'ON_EVA').length,
    RESTING: missionState.crew.filter((c) => c.availability === 'RESTING').length,
    SLEEPING: missionState.crew.filter((c) => c.availability === 'SLEEPING').length,
    MEDICAL_RESTRICTED: missionState.crew.filter((c) => c.availability === 'MEDICAL_RESTRICTED').length,
  };

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <Calendar className="h-4 w-4 text-telemetry-cyan" />
            EXPEDITION 30 · CREW ACTIVITY SCHEDULE & DUTY MATRIX
          </CardTitle>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <Badge variant="nominal">{availabilityCounts.AVAILABLE} AVAILABLE</Badge>
            {availabilityCounts.ON_EVA > 0 && <Badge variant="telemetry">{availabilityCounts.ON_EVA} ON EVA</Badge>}
            {availabilityCounts.RESTING > 0 && <Badge variant="neutral">{availabilityCounts.RESTING} RESTING</Badge>}
            {availabilityCounts.SLEEPING > 0 && <Badge variant="neutral">{availabilityCounts.SLEEPING} SLEEPING</Badge>}
            {availabilityCounts.MEDICAL_RESTRICTED > 0 && (
              <Badge variant="critical">{availabilityCounts.MEDICAL_RESTRICTED} RESTRICTED</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 font-mono text-xs">
        {/* Schedule Grid */}
        <div className="space-y-3">
          {missionState.crew.map((astronaut) => (
            <div
              key={astronaut.astronautId}
              className="p-3 bg-control-navy border border-panel-blue/60 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-blue/40 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-telemetry-cyan text-xs">{astronaut.callsign}</span>
                  <span className="text-offwhite font-bold">{astronaut.name}</span>
                  <span className="text-[10px] text-offwhite/50">({astronaut.role})</span>
                </div>
                <Badge
                  variant={
                    astronaut.availability === 'AVAILABLE'
                      ? 'nominal'
                      : astronaut.availability === 'ON_EVA'
                      ? 'telemetry'
                      : astronaut.availability === 'RESTING' || astronaut.availability === 'SLEEPING'
                      ? 'neutral'
                      : 'critical'
                  }
                >
                  {astronaut.availability}
                </Badge>
              </div>

              {/* Activity Timeline Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-space-surface border border-panel-blue/30 flex items-center justify-between">
                  <span className="text-offwhite/60 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-telemetry-cyan" />
                    Current Task:
                  </span>
                  <span className="font-bold text-offwhite truncate max-w-[120px]" title={astronaut.assignedTasks[0] || 'Nominal Duty'}>
                    {astronaut.assignedTasks[0] || 'Nominal Duty'}
                  </span>
                </div>

                <div className="p-2 bg-space-surface border border-panel-blue/30 flex items-center justify-between">
                  <span className="text-offwhite/60 flex items-center gap-1">
                    <Dumbbell className="h-3 w-3 text-nominal-green" />
                    Exercise:
                  </span>
                  <span className="font-bold text-nominal-green">{astronaut.exerciseMinutes} / 45 min</span>
                </div>

                <div className="p-2 bg-space-surface border border-panel-blue/30 flex items-center justify-between">
                  <span className="text-offwhite/60 flex items-center gap-1">
                    <Bed className="h-3 w-3 text-warning-amber" />
                    Sleep Log:
                  </span>
                  <span className={`font-bold ${astronaut.sleepHours < 7.0 ? 'text-warning-amber' : 'text-offwhite'}`}>
                    {astronaut.sleepHours.toFixed(1)} / 8.0 hrs
                  </span>
                </div>

                <div className="p-2 bg-space-surface border border-panel-blue/30 flex items-center justify-between">
                  <span className="text-offwhite/60 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-telemetry-cyan" />
                    Workload:
                  </span>
                  <span className="font-bold text-telemetry-cyan">{astronaut.workloadIndex.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
