/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Equipment Condition Summary
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EquipmentDebriefRecord } from '@/simulation/models/missionDebrief';

interface EquipmentDebriefProps {
  equipmentSummary: EquipmentDebriefRecord[];
}

export const EquipmentDebrief: React.FC<EquipmentDebriefProps> = ({ equipmentSummary }) => {
  const avgCondition =
    equipmentSummary.length > 0
      ? Math.round(equipmentSummary.reduce((sum, e) => sum + e.finalCondition, 0) / equipmentSummary.length)
      : 100;

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-telemetry-cyan" />
            <CardTitle>HABITAT SYSTEMS & MACHINERY INTEGRITY AUDIT</CardTitle>
          </div>
          <Badge variant={avgCondition >= 75 ? 'nominal' : avgCondition >= 50 ? 'warning' : 'critical'}>
            MEAN SYSTEMS HEALTH: {avgCondition}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-panel-blue/40 text-[11px] text-offwhite/50 uppercase">
              <tr>
                <th className="py-2.5 px-3">Subsystem Unit</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Operating Status</th>
                <th className="py-2.5 px-3">Mechanical Wear (Δ)</th>
                <th className="py-2.5 px-3">Maintenance Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-blue/20">
              {equipmentSummary.map((eq) => {
                const isFailed = eq.status === 'FAILED';
                const isDegraded = eq.status === 'DEGRADED' || eq.finalCondition < 60;

                return (
                  <tr key={eq.equipmentId} className="hover:bg-panel-blue/10 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-offwhite block">{eq.name}</span>
                      <span className="text-[10px] text-telemetry-cyan">{eq.equipmentId}</span>
                    </td>

                    <td className="py-2.5 px-3 font-bold">
                      <span className={isFailed ? 'text-critical-red' : isDegraded ? 'text-warning-amber' : 'text-nominal-green'}>
                        {eq.finalCondition.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <Badge variant={isFailed ? 'critical' : isDegraded ? 'warning' : 'nominal'}>
                        {eq.status}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3 text-offwhite/70">
                      -{eq.wearDeltaPercent.toFixed(1)}%
                    </td>

                    <td className="py-2.5 px-3">
                      {eq.maintenanceActionsCompleted > 0 ? (
                        <span className="text-nominal-green flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {eq.maintenanceActionsCompleted} Servicing Cycle(s)
                        </span>
                      ) : eq.maintenanceRequired ? (
                        <span className="text-critical-red flex items-center gap-1 font-bold">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Maintenance Overdue
                        </span>
                      ) : (
                        <span className="text-offwhite/50">Nominal wear</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
