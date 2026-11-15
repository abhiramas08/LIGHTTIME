/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Crew Availability & Duty Distribution Graph
 *
 * Visualizes real-time and longitudinal availability distribution across all 4 astronauts:
 * - AVAILABLE
 * - ON_EVA
 * - RESTING
 * - SLEEPING
 * - MEDICAL_RESTRICTED
 */

import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { AstronautAvailability } from '@/simulation/models/missionState';
import { Activity, ShieldCheck, Moon, Coffee, AlertOctagon, UserCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

export const CrewAvailabilityGraph: React.FC = () => {
  const { missionState } = useMissionStore();
  const crew = missionState.crew;

  const counts: Record<AstronautAvailability, number> = {
    AVAILABLE: 0,
    ON_EVA: 0,
    RESTING: 0,
    SLEEPING: 0,
    MEDICAL_RESTRICTED: 0,
  };

  crew.forEach((c) => {
    counts[c.availability] = (counts[c.availability] || 0) + 1;
  });

  const totalCrew = 4;
  const availablePct = (counts.AVAILABLE / totalCrew) * 100;
  const evaPct = (counts.ON_EVA / totalCrew) * 100;
  const restingPct = (counts.RESTING / totalCrew) * 100;
  const sleepingPct = (counts.SLEEPING / totalCrew) * 100;
  const restrictedPct = (counts.MEDICAL_RESTRICTED / totalCrew) * 100;

  const statusConfigs: Array<{
    status: AstronautAvailability;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgClass: string;
    count: number;
    description: string;
  }> = [
    {
      status: 'AVAILABLE',
      label: 'Fit For Duty',
      icon: <UserCheck className="h-4 w-4 text-nominal-green" />,
      color: '#45B77A',
      bgClass: 'bg-nominal-green',
      count: counts.AVAILABLE,
      description: 'Nominal operational status for IV/EV tasks',
    },
    {
      status: 'ON_EVA',
      label: 'Lunar Surface EVA',
      icon: <Activity className="h-4 w-4 text-telemetry-cyan" />,
      color: '#43C6E8',
      bgClass: 'bg-telemetry-cyan',
      count: counts.ON_EVA,
      description: 'Airlock egressed, surface mobility active',
    },
    {
      status: 'RESTING',
      label: 'Scheduled Rest',
      icon: <Coffee className="h-4 w-4 text-warning-amber" />,
      color: '#F5A623',
      bgClass: 'bg-warning-amber',
      count: counts.RESTING,
      description: 'Passive recovery and relaxation window',
    },
    {
      status: 'SLEEPING',
      label: 'Circadian Sleep',
      icon: <Moon className="h-4 w-4 text-panel-blue" />,
      color: '#193B59',
      bgClass: 'bg-panel-blue',
      count: counts.SLEEPING,
      description: 'Active restorative sleep in crew quarters',
    },
    {
      status: 'MEDICAL_RESTRICTED',
      label: 'Medical Hold',
      icon: <AlertOctagon className="h-4 w-4 text-critical-red" />,
      color: '#E05252',
      bgClass: 'bg-critical-red',
      count: counts.MEDICAL_RESTRICTED,
      description: 'Duty restricted due to exhaustion or hypoxia',
    },
  ];

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <ShieldCheck className="h-4 w-4 text-telemetry-cyan" />
            CREW DUTY AVAILABILITY & CAPACITY DISTRIBUTION
          </CardTitle>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-offwhite/50">OPERATIONAL FORCE:</span>
            <Badge variant={counts.MEDICAL_RESTRICTED > 0 ? 'warning' : 'nominal'}>
              {counts.AVAILABLE + counts.ON_EVA} / {totalCrew} ACTIVE
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 font-mono text-xs">
        {/* Proportional Segmented Capacity Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-offwhite/60">
            <span>AGGREGATE DUTY ALLOCATION BAR</span>
            <span>100% (4 EXPEDITION ASTRONAUTS)</span>
          </div>

          <div className="h-4 w-full bg-space-surface flex border border-panel-blue/60 overflow-hidden">
            {availablePct > 0 && (
              <div
                className="h-full bg-nominal-green transition-all duration-300"
                style={{ width: `${availablePct}%` }}
                title={`Available: ${counts.AVAILABLE} (${availablePct}%)`}
              />
            )}
            {evaPct > 0 && (
              <div
                className="h-full bg-telemetry-cyan transition-all duration-300"
                style={{ width: `${evaPct}%` }}
                title={`On EVA: ${counts.ON_EVA} (${evaPct}%)`}
              />
            )}
            {restingPct > 0 && (
              <div
                className="h-full bg-warning-amber transition-all duration-300"
                style={{ width: `${restingPct}%` }}
                title={`Resting: ${counts.RESTING} (${restingPct}%)`}
              />
            )}
            {sleepingPct > 0 && (
              <div
                className="h-full bg-panel-blue transition-all duration-300"
                style={{ width: `${sleepingPct}%` }}
                title={`Sleeping: ${counts.SLEEPING} (${sleepingPct}%)`}
              />
            )}
            {restrictedPct > 0 && (
              <div
                className="h-full bg-critical-red transition-all duration-300 animate-pulse"
                style={{ width: `${restrictedPct}%` }}
                title={`Medical Restricted: ${counts.MEDICAL_RESTRICTED} (${restrictedPct}%)`}
              />
            )}
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-nominal-green" />
              <span className="text-offwhite/80">Available ({counts.AVAILABLE})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-telemetry-cyan" />
              <span className="text-offwhite/80">On EVA ({counts.ON_EVA})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-warning-amber" />
              <span className="text-offwhite/80">Resting ({counts.RESTING})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-panel-blue" />
              <span className="text-offwhite/80">Sleeping ({counts.SLEEPING})</span>
            </div>
            {counts.MEDICAL_RESTRICTED > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-critical-red" />
                <span className="text-critical-red font-bold">Restricted ({counts.MEDICAL_RESTRICTED})</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Status Breakdown Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-panel-blue/40">
          {statusConfigs.map((cfg) => {
            const pct = (cfg.count / totalCrew) * 100;
            return (
              <div
                key={cfg.status}
                className={cn(
                  'p-2.5 bg-space-surface border transition-all duration-200',
                  cfg.count > 0 ? 'border-panel-blue/70' : 'border-panel-blue/20 opacity-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {cfg.icon}
                    <span className="font-bold text-offwhite text-[11px]">{cfg.label}</span>
                  </div>
                  <span className="font-bold text-sm text-offwhite">{cfg.count}</span>
                </div>
                <div className="h-1 w-full bg-control-navy rounded-none overflow-hidden my-1">
                  <div className={cn('h-full', cfg.bgClass)} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[9px] text-offwhite/50 leading-tight truncate">
                  {cfg.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
