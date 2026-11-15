import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CalendarDays } from 'lucide-react';

export const OperateCrewView: React.FC = () => {
  const { crew, queueCommand } = useMissionStore();

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-panel-blue/50 pb-3">
        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-telemetry-cyan" />
            CREW OPERATIONS & CIRCADIAN TIMELINE SCHEDULER
          </h2>
          <p className="text-xs text-offwhite/50">
            Allocate 24-hour mission task blocks. Balance exploration EVA sorties against mandatory sleep debt recovery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crew.map((astronaut) => (
          <Card key={astronaut.id} withBracket>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-telemetry-cyan" />
                <CardTitle className="text-xs">
                  {astronaut.callsign} · {astronaut.fullName}
                </CardTitle>
              </div>
              <Badge variant="telemetry">{astronaut.role}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-space-surface p-2 border border-panel-blue/40">
                <span className="text-offwhite/60">Current Assigned Duty:</span>
                <span className="text-telemetry-cyan font-bold">{astronaut.currentActivity}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-control-navy border border-panel-blue/30">
                  <span className="text-offwhite/50 block">CONSECUTIVE AWAKE:</span>
                  <span className="text-sm font-bold text-offwhite">{astronaut.cognitive.consecutiveAwakeHours.toFixed(1)} hrs</span>
                </div>
                <div className="p-2 bg-control-navy border border-panel-blue/30">
                  <span className="text-offwhite/50 block">CUMULATIVE SLEEP DEBT:</span>
                  <span className="text-sm font-bold text-warning-amber">{astronaut.cognitive.sleepDebtHours.toFixed(1)} hrs</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-panel-blue/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    queueCommand(
                      'CREW_SCHEDULE',
                      'ASSIGN_SCHEDULED_EXERCISE',
                      {},
                      astronaut.id
                    )
                  }
                >
                  Schedule Exercise
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    queueCommand(
                      'CREW_SCHEDULE',
                      'ASSIGN_CIRCADIAN_SLEEP',
                      {},
                      astronaut.id
                    )
                  }
                >
                  Enforce Sleep Rest
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    queueCommand(
                      'EVA_CONTROL',
                      'PREPARE_EVA_SORTIE',
                      {},
                      astronaut.id
                    )
                  }
                >
                  Authorize EVA Sortie
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
