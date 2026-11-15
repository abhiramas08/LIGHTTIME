/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Individual Astronaut Management Card
 *
 * Displays a single expedition astronaut record from canonical MissionState:
 * - Full Name and flight role
 * - Avatar / aerospace helmet portrait with role insignia
 * - Sleep hours (scientific measurement)
 * - Exercise minutes (scientific measurement)
 * - Nutrition score (educational index)
 * - Fatigue index (educational index)
 * - Stress index (educational index)
 * - Workload index (educational index)
 * - Availability status badge
 * - Clear separation of scientific measurements vs educational indices
 */

import React from 'react';
import { AstronautRecord } from '@/simulation/models/missionState';
import { AstronautAvatar } from './AstronautAvatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Bed,
  Dumbbell,
  Utensils,
  Brain,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AstronautCardProps {
  astronaut: AstronautRecord;
  onOpenDossier: (astronautId: string) => void;
  className?: string;
}

export const AstronautCard: React.FC<AstronautCardProps> = ({
  astronaut,
  onOpenDossier,
  className,
}) => {
  const isAvailable = astronaut.availability === 'AVAILABLE';
  const isEva = astronaut.availability === 'ON_EVA';
  const isRestricted = astronaut.availability === 'MEDICAL_RESTRICTED';

  const statusBadgeVariant = isAvailable
    ? 'nominal'
    : isEva
    ? 'telemetry'
    : isRestricted
    ? 'critical'
    : 'neutral';

  const fatigueColor =
    astronaut.fatigueIndex >= 70
      ? 'text-critical-red'
      : astronaut.fatigueIndex >= 45
      ? 'text-warning-amber'
      : 'text-nominal-green';

  const stressColor =
    astronaut.stressIndex >= 70
      ? 'text-critical-red'
      : astronaut.stressIndex >= 45
      ? 'text-warning-amber'
      : 'text-nominal-green';

  const workloadColor =
    astronaut.workloadIndex >= 75
      ? 'text-critical-red'
      : astronaut.workloadIndex >= 50
      ? 'text-warning-amber'
      : 'text-telemetry-cyan';

  return (
    <Card
      withBracket
      className={cn(
        'transition-all duration-200 hover:border-telemetry-cyan/70 bg-control-navy flex flex-col justify-between',
        isRestricted && 'border-critical-red/50',
        className
      )}
    >
      <div>
        {/* Header with Avatar and Role */}
        <CardHeader className="p-4 border-b border-panel-blue/50 pb-3">
          <div className="flex items-center gap-3">
            <AstronautAvatar
              role={astronaut.role}
              callsign={astronaut.callsign}
              availability={astronaut.availability}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono tracking-wider text-telemetry-cyan font-bold uppercase">
                  {astronaut.callsign}
                </span>
                <Badge variant={statusBadgeVariant} pulse={isEva || isRestricted}>
                  {astronaut.availability}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-offwhite truncate">
                {astronaut.name}
              </CardTitle>
              <p className="text-[11px] text-offwhite/60 font-mono truncate">
                {astronaut.role}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs font-mono">
          {/* Active Assigned Tasks Banner */}
          <div className="p-2 bg-space-surface/80 border border-panel-blue/40 text-[11px]">
            <span className="text-offwhite/50 block text-[9px] uppercase tracking-wider mb-0.5">
              Assigned Flight Duty
            </span>
            <span className="font-bold text-offwhite truncate block" title={astronaut.assignedTasks[0] || 'Nominal Station Keeping'}>
              {astronaut.assignedTasks[0] || 'Nominal Station Keeping'}
            </span>
          </div>

          {/* SECTION A: Scientific Measurements */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-offwhite/50 uppercase tracking-wider border-b border-panel-blue/30 pb-0.5">
              <span className="flex items-center gap-1 font-bold text-telemetry-cyan">
                <Activity className="h-3 w-3" />
                Physical Measurements
              </span>
              <span className="text-[9px] text-offwhite/40">Objective Sensors</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Sleep Hours */}
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <div className="flex items-center justify-between text-offwhite/60 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3 text-telemetry-cyan" />
                    Sleep
                  </span>
                  <span className="text-[9px] text-offwhite/40">24h Sol</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className={cn('text-sm font-bold', astronaut.sleepHours < 7.0 ? 'text-warning-amber' : 'text-offwhite')}>
                    {astronaut.sleepHours.toFixed(1)} <span className="text-[10px] font-normal text-offwhite/50">hrs</span>
                  </span>
                  <span className="text-[9px] text-offwhite/40">Target: 8.0h</span>
                </div>
              </div>

              {/* Exercise Minutes */}
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <div className="flex items-center justify-between text-offwhite/60 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3 text-nominal-green" />
                    Exercise
                  </span>
                  <span className="text-[9px] text-offwhite/40">Counterm.</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className={cn('text-sm font-bold', astronaut.exerciseMinutes < 45 ? 'text-warning-amber' : 'text-nominal-green')}>
                    {astronaut.exerciseMinutes} <span className="text-[10px] font-normal text-offwhite/50">min</span>
                  </span>
                  <span className="text-[9px] text-offwhite/40">Req: 45m</span>
                </div>
              </div>
            </div>

            {/* Vitals Quick Summary */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-offwhite/70">
              <div className="p-1 bg-space-surface/50 border border-panel-blue/20 text-center">
                <span className="text-[9px] text-offwhite/40 block">HEART RATE</span>
                <span className="font-bold text-offwhite">{astronaut.biometrics.heartRateBpm} BPM</span>
              </div>
              <div className="p-1 bg-space-surface/50 border border-panel-blue/20 text-center">
                <span className="text-[9px] text-offwhite/40 block">BLOOD O₂</span>
                <span className="font-bold text-nominal-green">{astronaut.biometrics.bloodOxygenPercent}%</span>
              </div>
              <div className="p-1 bg-space-surface/50 border border-panel-blue/20 text-center">
                <span className="text-[9px] text-offwhite/40 block">RAD DOSE</span>
                <span className="font-bold text-warning-amber">{astronaut.biometrics.cumulativeRadiationDoseMsv.toFixed(1)} mSv</span>
              </div>
            </div>
          </div>

          {/* SECTION B: Educational Indices (Explicitly Non-Medical) */}
          <div className="space-y-2 pt-1 border-t border-panel-blue/40">
            <div className="flex items-center justify-between text-[10px] text-offwhite/50 uppercase tracking-wider">
              <span className="flex items-center gap-1 font-bold text-warning-amber">
                <Brain className="h-3 w-3" />
                Educational Indices
              </span>
              <span className="text-[8px] text-warning-amber/80 border border-warning-amber/30 px-1">
                Pedagogical Model
              </span>
            </div>

            {/* Fatigue Index Progress */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-offwhite/70">Fatigue Index</span>
                <span className={cn('font-bold', fatigueColor)}>
                  {astronaut.fatigueIndex.toFixed(1)} / 100
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface rounded-none overflow-hidden border border-panel-blue/40">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    astronaut.fatigueIndex >= 70
                      ? 'bg-critical-red'
                      : astronaut.fatigueIndex >= 45
                      ? 'bg-warning-amber'
                      : 'bg-nominal-green'
                  )}
                  style={{ width: `${Math.min(100, astronaut.fatigueIndex)}%` }}
                />
              </div>
            </div>

            {/* Stress Index Progress */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-offwhite/70">Stress Index</span>
                <span className={cn('font-bold', stressColor)}>
                  {astronaut.stressIndex.toFixed(1)} / 100
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface rounded-none overflow-hidden border border-panel-blue/40">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    astronaut.stressIndex >= 70
                      ? 'bg-critical-red'
                      : astronaut.stressIndex >= 45
                      ? 'bg-warning-amber'
                      : 'bg-nominal-green'
                  )}
                  style={{ width: `${Math.min(100, astronaut.stressIndex)}%` }}
                />
              </div>
            </div>

            {/* Workload Index Progress */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-offwhite/70">Workload Index</span>
                <span className={cn('font-bold', workloadColor)}>
                  {astronaut.workloadIndex.toFixed(0)} / 100
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface rounded-none overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-telemetry-cyan transition-all duration-300"
                  style={{ width: `${Math.min(100, astronaut.workloadIndex)}%` }}
                />
              </div>
            </div>

            {/* Nutrition Score */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-offwhite/70 flex items-center gap-1">
                  <Utensils className="h-2.5 w-2.5 text-offwhite/50" />
                  Nutrition Score
                </span>
                <span className="font-bold text-nominal-green">
                  {astronaut.nutritionScore.toFixed(0)} / 100
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface rounded-none overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-nominal-green transition-all duration-300"
                  style={{ width: `${Math.min(100, astronaut.nutritionScore)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-space-surface/60 border-t border-panel-blue/40">
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs font-mono justify-center gap-1.5 hover:border-telemetry-cyan hover:text-telemetry-cyan"
          onClick={() => onOpenDossier(astronaut.astronautId)}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          MANAGE & ASSIGN TASKS
        </Button>
      </div>
    </Card>
  );
};
