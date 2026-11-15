/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Telemetry Charts
 *
 * Renders the 6 canonical debrief time-series graphs:
 * 1. Crew Wellbeing Over Time (Fatigue, Stress, Workload curves)
 * 2. Oxygen Reserves Over Time (with caution/critical threshold limits)
 * 3. Water Reserves Over Time (storage and recycling balances)
 * 4. Electrical Power Over Time (battery storage and generation)
 * 5. Food Inventory Over Time (caloric drawdown curve)
 * 6. Emergency Decision Timeline (graphical contingency sequence)
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity, Wind, Droplets, Zap, Apple, AlertTriangle, Clock } from 'lucide-react';
import { MissionDebriefReport } from '@/simulation/models/missionDebrief';

interface DebriefTelemetryChartsProps {
  report: MissionDebriefReport;
}

export const DebriefTelemetryCharts: React.FC<DebriefTelemetryChartsProps> = ({ report }) => {
  const { resourceHistory, crewWellbeingHistory, emergencyDecisions } = report;

  // Process Crew Wellbeing Time-Series Data (average per timestamp)
  const crewTimeSeriesMap = new Map<number, { fatigue: number; stress: number; workload: number; count: number }>();
  for (const pt of crewWellbeingHistory) {
    const time = Number(pt.timestampHours.toFixed(1));
    const existing = crewTimeSeriesMap.get(time) || { fatigue: 0, stress: 0, workload: 0, count: 0 };
    existing.fatigue += pt.fatigueIndex;
    existing.stress += pt.stressIndex;
    existing.workload += pt.workloadIndex;
    existing.count += 1;
    crewTimeSeriesMap.set(time, existing);
  }

  const crewChartData = Array.from(crewTimeSeriesMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, data]) => ({
      hour: `MET ${time}h`,
      rawHour: time,
      'Avg Fatigue Index': Number((data.fatigue / data.count).toFixed(1)),
      'Avg Stress Index': Number((data.stress / data.count).toFixed(1)),
      'Avg Workload Index': Number((data.workload / data.count).toFixed(1)),
    }));

  // Process Resource Time-Series Data
  const resourceChartData = resourceHistory
    .map((pt) => ({
      hour: `MET ${pt.timestampHours.toFixed(1)}h`,
      rawHour: pt.timestampHours,
      oxygenKg: Number(pt.oxygenKg.toFixed(2)),
      waterLiters: Number(pt.waterLiters.toFixed(1)),
      batteryKwh: Number(pt.batteryKwh.toFixed(1)),
      powerKw: Number(pt.powerKw.toFixed(1)),
      foodKcal: Number((pt.foodKcal ?? 360000).toFixed(0)),
    }))
    .sort((a, b) => a.rawHour - b.rawHour);

  return (
    <div className="space-y-6">
      {/* 1. Crew Wellbeing Over Time */}
      <Card withBracket>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Activity className="h-4 w-4 text-warning-amber" />
              1. CREW WELLBEING OVER TIME (FATIGUE, STRESS & WORKLOAD)
            </CardTitle>
            <Badge variant="warning">NASA HRP COGNITIVE DYNAMICS</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crewChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0e17', borderColor: '#1f293d', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <ReferenceLine y={70} stroke="#ff3366" strokeDasharray="4 4" label={{ value: 'Elevated Risk Floor', fill: '#ff3366', fontSize: 10 }} />
                <Line type="monotone" dataKey="Avg Fatigue Index" stroke="#ffb020" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Avg Stress Index" stroke="#ff3366" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Avg Workload Index" stroke="#00e5ff" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid: 2. Oxygen & 3. Water */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Oxygen Reserves Over Time */}
        <Card withBracket>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Wind className="h-4 w-4 text-telemetry-cyan" />
                2. OXYGEN RESERVES OVER TIME (KG)
              </CardTitle>
              <Badge variant="telemetry">ECLSS CABIN AIR</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resourceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0e17', borderColor: '#1f293d', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={60} stroke="#ffb020" strokeDasharray="3 3" label={{ value: 'Caution (60 kg)', fill: '#ffb020', fontSize: 10 }} />
                  <ReferenceLine y={40} stroke="#ff3366" strokeDasharray="3 3" label={{ value: 'Critical Hypoxia (40 kg)', fill: '#ff3366', fontSize: 10 }} />
                  <Area type="monotone" dataKey="oxygenKg" name="Oxygen (kg)" stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Water Reserves Over Time */}
        <Card withBracket>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Droplets className="h-4 w-4 text-telemetry-cyan" />
                3. WATER RESERVES OVER TIME (LITERS)
              </CardTitle>
              <Badge variant="telemetry">WRS LOOP BALANCE</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resourceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0e17', borderColor: '#1f293d', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="waterLiters" name="Potable Water (L)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: 4. Electrical Power & 5. Food Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Electrical Power & Battery Storage */}
        <Card withBracket>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Zap className="h-4 w-4 text-warning-amber" />
                4. POWER GRID GENERATION & STORAGE
              </CardTitle>
              <Badge variant="warning">BATTERY SOC & SOLAR/REACTOR</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resourceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0e17', borderColor: '#1f293d', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="batteryKwh" name="Battery Storage (kWh)" stroke="#ffb020" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="powerKw" name="Generation Bus (kW)" stroke="#00e5ff" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 5. Food Inventory Over Time */}
        <Card withBracket>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Apple className="h-4 w-4 text-nominal-green" />
                5. FOOD RATIONS INVENTORY (KCAL)
              </CardTitle>
              <Badge variant="nominal">METABOLIC NUTRITION</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resourceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0e17', borderColor: '#1f293d', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="foodKcal" name="Food Inventory (kcal)" stroke="#00f076" fill="#00f076" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Emergency Decision Timeline */}
      <Card withBracket>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <AlertTriangle className="h-4 w-4 text-critical-red" />
              6. EMERGENCY DECISION & CONTINGENCY TIMELINE
            </CardTitle>
            <Badge variant="critical">CRITICAL PATHWAY AUDIT</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyDecisions.length === 0 ? (
            <p className="text-xs font-mono text-offwhite/50 italic py-4 text-center">
              No emergency master alarms triggered during this mission timeline. All systems operated within nominal envelope.
            </p>
          ) : (
            <div className="space-y-4">
              {emergencyDecisions.map((scen) => (
                <div
                  key={scen.scenarioId}
                  className="p-3.5 rounded border border-panel-blue/40 bg-space-black/60 font-mono text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-panel-blue/30 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-offwhite">{scen.scenarioTitle}</span>
                      <Badge variant={scen.resolved ? 'nominal' : 'critical'}>
                        {scen.resolved ? 'MITIGATED' : 'UNRESOLVED'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-offwhite/50">
                      Triage Time: {scen.timeToResolveHours.toFixed(1)}h MET
                    </span>
                  </div>

                  <p className="text-[11px] text-offwhite/70">
                    {scen.consequenceSummary}
                  </p>

                  <div className="space-y-1.5 border-t border-panel-blue/20 pt-2">
                    <span className="text-[10px] text-telemetry-cyan font-bold block">
                      EXECUTED DIRECTIVE SEQUENCE ({scen.actionsExecuted.length}):
                    </span>
                    {scen.actionsExecuted.length === 0 ? (
                      <span className="text-[10px] text-offwhite/40 italic">
                        No mitigation directives logged before scenario conclusion.
                      </span>
                    ) : (
                      scen.actionsExecuted.map((act, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center justify-between p-1.5 rounded bg-space-surface/40 border border-panel-blue/20 text-[11px]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Clock className="h-3 w-3 text-telemetry-cyan shrink-0" />
                            <span className="font-bold text-offwhite">{act.command}</span>
                            <span className="text-[10px] text-offwhite/40">({act.initiatedBy})</span>
                          </div>
                          <Badge variant={act.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                            {act.outcome}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
