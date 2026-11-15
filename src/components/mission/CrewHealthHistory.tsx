/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Crew Health & Wellbeing Historical Log
 *
 * Displays historical records of crew human-factors indices and telemetry
 * across mission elapsed time from canonical MissionState records.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { History, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';

export const CrewHealthHistory: React.FC = () => {
  const { missionState } = useMissionStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const history = missionState.records.crewWellbeingHistory;

  const filteredHistory = React.useMemo(() => {
    let list = history;
    if (selectedFilter !== 'ALL') {
      list = history.filter((h) => h.astronautId === selectedFilter);
    }
    // Return latest 25 entries in reverse chronological order
    return [...list].reverse().slice(0, 25);
  }, [history, selectedFilter]);

  const getAstronautMeta = (id: string) => {
    const ast = missionState.crew.find((c) => c.astronautId === id);
    return ast ? { name: ast.name, callsign: ast.callsign, role: ast.role } : { name: id, callsign: id, role: 'Crew' };
  };

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <History className="h-4 w-4 text-telemetry-cyan" />
            CHRONOLOGICAL CREW HEALTH & WELLBEING AUDIT LOG
          </CardTitle>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="text-offwhite/50 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              FILTER:
            </span>
            <Button
              variant={selectedFilter === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedFilter('ALL')}
              className="h-6 px-2 text-[10px]"
            >
              ALL CREW
            </Button>
            {missionState.crew.map((c) => (
              <Button
                key={c.astronautId}
                variant={selectedFilter === c.astronautId ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedFilter(c.astronautId)}
                className="h-6 px-2 text-[10px]"
              >
                {c.callsign}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-offwhite/50 font-mono text-xs">
            No historical health snapshots logged yet. Advance mission time to generate longitudinal records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">MET TIME</TableHead>
                  <TableHead>ASTRONAUT</TableHead>
                  <TableHead>ROLE</TableHead>
                  <TableHead>FATIGUE INDEX</TableHead>
                  <TableHead>STRESS INDEX</TableHead>
                  <TableHead>WORKLOAD INDEX</TableHead>
                  <TableHead>READINESS</TableHead>
                  <TableHead>EVALUATION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item, idx) => {
                  const meta = getAstronautMeta(item.astronautId);
                  const isCritical = item.fatigueIndex >= 70 || item.stressIndex >= 70;
                  const isWarning = item.fatigueIndex >= 45 || item.stressIndex >= 45;

                  return (
                    <TableRow key={`${item.astronautId}-${item.timestampHours}-${idx}`}>
                      <TableCell className="font-mono text-telemetry-cyan text-xs">
                        T+{item.timestampHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="font-bold text-offwhite text-xs">
                        {meta.callsign} ({meta.name.split(' ')[0]})
                      </TableCell>
                      <TableCell className="text-offwhite/60 text-xs">
                        {meta.role}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-bold text-xs',
                            item.fatigueIndex >= 70
                              ? 'text-critical-red'
                              : item.fatigueIndex >= 45
                              ? 'text-warning-amber'
                              : 'text-nominal-green'
                          )}
                        >
                          {item.fatigueIndex.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-bold text-xs',
                            item.stressIndex >= 70
                              ? 'text-critical-red'
                              : item.stressIndex >= 45
                              ? 'text-warning-amber'
                              : 'text-nominal-green'
                          )}
                        >
                          {item.stressIndex.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-offwhite font-mono text-xs">
                        {item.workloadIndex.toFixed(0)}%
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="text-offwhite font-bold">
                          {Math.max(0, Math.round(100 - (item.fatigueIndex * 0.6 + item.stressIndex * 0.4)))}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isCritical ? 'critical' : isWarning ? 'warning' : 'nominal'}
                        >
                          {isCritical ? 'ELEVATED STRAIN' : isWarning ? 'MODERATE LOAD' : 'OPTIMAL'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="p-3 bg-space-surface/60 border-t border-panel-blue/40 flex items-center justify-between text-[10px] font-mono text-offwhite/50">
          <span>
            SHOWING {filteredHistory.length} OF {history.length} HISTORICAL DATA POINTS
          </span>
          <span className="text-warning-amber">
            DISCLAIMER: Educational human-factors indices are pedagogical models, not medical diagnostic data.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
