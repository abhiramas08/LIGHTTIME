/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Crew Daily Wellbeing & Performance Graph
 *
 * Visualizes longitudinal trends in Cognitive Fatigue Index, Stress Index,
 * and Workload Index across mission elapsed hours using Recharts.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Brain } from 'lucide-react';

export const CrewWellbeingChart: React.FC = () => {
  const { missionState } = useMissionStore();
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('ALL');

  const history = missionState.records.crewWellbeingHistory;

  // Transform raw history into chart data
  const chartData = React.useMemo(() => {
    if (history.length === 0) {
      // Provide default baseline datapoint at current elapsed time
      return [
        {
          timeHour: Number(missionState.mission.elapsedHours.toFixed(1)),
          timeLabel: `Hour ${missionState.mission.elapsedHours.toFixed(1)}`,
          fatigue: 22.0,
          stress: 20.0,
          workload: 45.0,
        },
      ];
    }

    if (selectedAstronautId === 'ALL') {
      // Group by timestamp and average
      const byHour = new Map<number, { fatigueSum: number; stressSum: number; workloadSum: number; count: number }>();
      history.forEach((pt) => {
        const roundedHour = Number(pt.timestampHours.toFixed(1));
        const entry = byHour.get(roundedHour) ?? { fatigueSum: 0, stressSum: 0, workloadSum: 0, count: 0 };
        entry.fatigueSum += pt.fatigueIndex;
        entry.stressSum += pt.stressIndex;
        entry.workloadSum += pt.workloadIndex;
        entry.count += 1;
        byHour.set(roundedHour, entry);
      });

      return Array.from(byHour.entries()).map(([hour, entry]) => ({
        timeHour: hour,
        timeLabel: `MET ${hour}h`,
        fatigue: Number((entry.fatigueSum / entry.count).toFixed(1)),
        stress: Number((entry.stressSum / entry.count).toFixed(1)),
        workload: Number((entry.workloadSum / entry.count).toFixed(1)),
      }));
    } else {
      // Filter by specific astronaut
      return history
        .filter((pt) => pt.astronautId === selectedAstronautId)
        .map((pt) => ({
          timeHour: Number(pt.timestampHours.toFixed(1)),
          timeLabel: `MET ${pt.timestampHours.toFixed(1)}h`,
          fatigue: pt.fatigueIndex,
          stress: pt.stressIndex,
          workload: pt.workloadIndex,
        }));
    }
  }, [history, selectedAstronautId, missionState.mission.elapsedHours]);

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <Brain className="h-4 w-4 text-telemetry-cyan" />
            LONGITUDINAL CREW WELLBEING & COGNITIVE CURVES
          </CardTitle>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
            <Button
              variant={selectedAstronautId === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedAstronautId('ALL')}
              className="h-6 px-2 text-[10px]"
            >
              ALL CREW (AVG)
            </Button>
            {missionState.crew.map((c) => (
              <Button
                key={c.astronautId}
                variant={selectedAstronautId === c.astronautId ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedAstronautId(c.astronautId)}
                className="h-6 px-2 text-[10px]"
              >
                {c.callsign}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#193B59" opacity={0.4} />
              <XAxis
                dataKey="timeLabel"
                stroke="#F2F4F5"
                opacity={0.5}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#F2F4F5"
                opacity={0.5}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#07111F',
                  borderColor: '#193B59',
                  color: '#F2F4F5',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="fatigue"
                name="Fatigue Index (0-100)"
                stroke="#E05252"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="stress"
                name="Stress Index (0-100)"
                stroke="#F5A623"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="workload"
                name="Workload Index (0-100)"
                stroke="#43C6E8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-offwhite/50 pt-1 border-t border-panel-blue/30">
          <span>NASA HRP Reference: Cognitive degradation accelerates when Fatigue &gt; 70.</span>
          <span className="text-telemetry-cyan">Telemetry Snapshots: {chartData.length}</span>
        </div>
      </CardContent>
    </Card>
  );
};
