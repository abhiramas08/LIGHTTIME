import React from 'react';
import { cn } from '@/utils/cn';
import { Astronaut } from '@/simulation/models/crew';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Activity, Heart, Radiation, Brain, ShieldAlert } from 'lucide-react';

export interface CrewStatusCardProps {
  astronaut: Astronaut;
  onSelect?: (id: string) => void;
  className?: string;
}

export const CrewStatusCard: React.FC<CrewStatusCardProps> = ({
  astronaut,
  onSelect,
  className,
}) => {
  const isHealthy = astronaut.vitals.bloodOxygenPercent >= 95 && astronaut.cognitive.readinessScore > 75;
  const isWarning = astronaut.cognitive.readinessScore <= 75 || astronaut.radiation.accumulatedTotalMsv > 200;

  const activityBadgeVariant = {
    EVA_SURFACE_SORTIE: 'warning',
    HABITAT_SYSTEMS_MAINTENANCE: 'telemetry',
    LAB_SCIENCE_ANALYSIS: 'nominal',
    SCHEDULED_EXERCISE: 'telemetry',
    MEAL_HYDRATION: 'neutral',
    CIRCADIAN_SLEEP_PERIOD: 'neutral',
    EMERGENCY_CONTINGENCY_PROTOCOL: 'critical',
  } as const;

  const activityLabels: Record<string, string> = {
    EVA_SURFACE_SORTIE: 'EVA SORTIE',
    HABITAT_SYSTEMS_MAINTENANCE: 'HAB SYSTEMS',
    LAB_SCIENCE_ANALYSIS: 'LAB SCIENCE',
    SCHEDULED_EXERCISE: 'EXERCISE',
    MEAL_HYDRATION: 'MEAL/REST',
    CIRCADIAN_SLEEP_PERIOD: 'SLEEP (REST)',
    EMERGENCY_CONTINGENCY_PROTOCOL: 'CONTINGENCY',
  };

  return (
    <Card
      withBracket
      className={cn(
        'cursor-pointer transition-all hover:border-telemetry-cyan/60 hover:bg-control-navy',
        className
      )}
      onClick={() => onSelect?.(astronaut.id)}
    >
      <CardHeader className="py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-telemetry-cyan" />
          <CardTitle className="text-xs">
            {astronaut.callsign} · {astronaut.fullName}
          </CardTitle>
        </div>
        <Badge
          variant={activityBadgeVariant[astronaut.currentActivity] || 'neutral'}
          pulse={astronaut.currentActivity === 'EVA_SURFACE_SORTIE'}
        >
          {activityLabels[astronaut.currentActivity] || astronaut.currentActivity}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 text-xs font-mono space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-offwhite/60">
          <span>{astronaut.role}</span>
          <span className="text-telemetry-cyan uppercase">{astronaut.location}</span>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-panel-blue/40">
          {/* Heart Rate */}
          <div className="flex flex-col bg-space-surface/60 p-1.5 border border-panel-blue/30">
            <span className="flex items-center gap-1 text-[10px] text-offwhite/50">
              <Heart className="h-3 w-3 text-critical-red" />
              HR
            </span>
            <span className="text-sm font-bold text-offwhite mt-0.5">
              {astronaut.vitals.heartRateBpm}{' '}
              <span className="text-[9px] font-normal text-offwhite/40">BPM</span>
            </span>
          </div>

          {/* Cognitive Readiness */}
          <div className="flex flex-col bg-space-surface/60 p-1.5 border border-panel-blue/30">
            <span className="flex items-center gap-1 text-[10px] text-offwhite/50">
              <Brain className="h-3 w-3 text-telemetry-cyan" />
              READINESS
            </span>
            <span
              className={cn(
                'text-sm font-bold mt-0.5',
                astronaut.cognitive.readinessScore > 80
                  ? 'text-nominal-green'
                  : 'text-warning-amber'
              )}
            >
              {astronaut.cognitive.readinessScore}%
            </span>
          </div>

          {/* Radiation Accumulated */}
          <div className="flex flex-col bg-space-surface/60 p-1.5 border border-panel-blue/30">
            <span className="flex items-center gap-1 text-[10px] text-offwhite/50">
              <Radiation className="h-3 w-3 text-warning-amber" />
              DOSE
            </span>
            <span className="text-sm font-bold text-offwhite mt-0.5">
              {astronaut.radiation.accumulatedTotalMsv.toFixed(1)}{' '}
              <span className="text-[9px] font-normal text-offwhite/40">mSv</span>
            </span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-offwhite/50">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-nominal-green" />
            SpO₂: {astronaut.vitals.bloodOxygenPercent}%
          </span>
          <span className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-telemetry-cyan" />
            EVA: {astronaut.evaHoursCompleted.toFixed(1)}h
          </span>
          <span
            className={cn(
              'font-semibold',
              isHealthy
                ? 'text-nominal-green'
                : isWarning
                ? 'text-warning-amber'
                : 'text-critical-red'
            )}
          >
            {isHealthy ? 'GO' : isWarning ? 'CAUTION' : 'UNFIT'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
