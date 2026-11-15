/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Synchronized Event Timeline
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Clock, XCircle } from 'lucide-react';
import { LaboratoryRunState } from '@/simulation/models/consequenceLab';

interface SynchronizedTimelineProps {
  runA: LaboratoryRunState;
  runB: LaboratoryRunState;
}

export const SynchronizedTimeline: React.FC<SynchronizedTimelineProps> = ({ runA, runB }) => {
  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Clock className="h-4 w-4 text-telemetry-cyan" />
            SYNCHRONIZED COMPARATIVE EVENT TIMELINES
          </CardTitle>
          <Badge variant="telemetry">MISSION ELAPSED TIME CHRONOLOGY</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs font-mono text-offwhite/70">
          Compare the chronological event sequences and state transitions between Run A and Run B.
          Notice where command pathways diverged due to communication latency or carrier loss.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline A */}
          <div className="space-y-3 p-3 rounded border border-telemetry-cyan/30 bg-space-surface/60">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-2">
              <span className="font-mono text-xs font-bold text-telemetry-cyan">
                {runA.name} ({runA.eventsHistory.length} Events)
              </span>
              <Badge variant="telemetry">{runA.commPreset.shortLabel}</Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
              {runA.eventsHistory.length === 0 ? (
                <p className="text-offwhite/40 italic text-center py-4">No events logged yet.</p>
              ) : (
                runA.eventsHistory.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-2.5 rounded bg-space-black/50 border border-panel-blue/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-telemetry-cyan font-bold">
                        {evt.simulationTime || `MET: ${evt.timestampHours.toFixed(1)}h`}
                      </span>
                      <Badge variant={evt.severity === 'CRITICAL' ? 'critical' : evt.severity === 'WARNING' ? 'warning' : 'nominal'}>
                        {evt.severity}
                      </Badge>
                    </div>

                    <div className="font-bold text-offwhite text-[11px]">{evt.title}</div>
                    <p className="text-[10px] text-offwhite/70">{evt.details}</p>

                    {evt.trigger && (
                      <div className="text-[9px] text-offwhite/50 border-t border-panel-blue/20 pt-1">
                        <span className="text-telemetry-cyan">Trigger: </span>
                        {evt.trigger}
                      </div>
                    )}

                    {evt.relatedUserAction && (
                      <div className="text-[9px] text-nominal-green">
                        Directive: {evt.relatedUserAction}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline B */}
          <div className="space-y-3 p-3 rounded border border-critical-red/30 bg-space-surface/60">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-2">
              <span className="font-mono text-xs font-bold text-critical-red">
                {runB.name} ({runB.eventsHistory.length} Events)
              </span>
              <Badge variant="critical">{runB.commPreset.shortLabel}</Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
              {runB.eventsHistory.length === 0 ? (
                <p className="text-offwhite/40 italic text-center py-4">No events logged yet.</p>
              ) : (
                runB.eventsHistory.map((evt) => {
                  const isRejection = evt.eventType?.includes('SAFETY_INTERLOCK') || evt.title.includes('REJECTED') || evt.title.includes('BLOCKED');
                  return (
                    <div
                      key={evt.eventId}
                      className={`p-2.5 rounded bg-space-black/50 border space-y-1.5 ${
                        isRejection ? 'border-critical-red/50 bg-critical-red/5' : 'border-panel-blue/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-critical-red font-bold">
                          {evt.simulationTime || `MET: ${evt.timestampHours.toFixed(1)}h`}
                        </span>
                        <Badge variant={evt.severity === 'CRITICAL' ? 'critical' : evt.severity === 'WARNING' ? 'warning' : 'nominal'}>
                          {evt.severity}
                        </Badge>
                      </div>

                      <div className="font-bold text-offwhite text-[11px] flex items-center gap-1.5">
                        {isRejection && <XCircle className="h-3 w-3 text-critical-red shrink-0" />}
                        <span>{evt.title}</span>
                      </div>
                      <p className="text-[10px] text-offwhite/70">{evt.details}</p>

                      {evt.trigger && (
                        <div className="text-[9px] text-offwhite/50 border-t border-panel-blue/20 pt-1">
                          <span className="text-critical-red">Trigger: </span>
                          {evt.trigger}
                        </div>
                      )}

                      {evt.relatedUserAction && (
                        <div className={`text-[9px] ${isRejection ? 'text-critical-red' : 'text-nominal-green'}`}>
                          Directive: {evt.relatedUserAction}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
