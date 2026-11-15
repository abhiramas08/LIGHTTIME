/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Comparative Visualizations & Charts
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Shield, Battery, Droplets, Wind, Clock } from 'lucide-react';
import { ComparativeAnalysisReport } from '@/simulation/models/consequenceLab';

interface ComparativeChartsProps {
  report: ComparativeAnalysisReport;
}

export const ComparativeCharts: React.FC<ComparativeChartsProps> = ({ report }) => {
  const { runA, runB, deltas } = report;
  const metA = runA.outcomeMetrics;
  const metB = runB.outcomeMetrics;

  // Chart 1: Consumables Expended Data
  const consumablesData = [
    {
      metric: 'Oxygen Used (kg)',
      [runA.name]: metA.oxygenUsedKg,
      [runB.name]: metB.oxygenUsedKg,
    },
    {
      metric: 'Water Used (L)',
      [runA.name]: metA.waterUsedLiters,
      [runB.name]: metB.waterUsedLiters,
    },
    {
      metric: 'Power Consumed (kWh)',
      [runA.name]: metA.powerConsumedKwh,
      [runB.name]: metB.powerConsumedKwh,
    },
  ];

  // Chart 2: Human Factors & Resolution Time
  const performanceData = [
    {
      metric: 'Crew Safety (0-100)',
      [runA.name]: metA.crewSafetyScore,
      [runB.name]: metB.crewSafetyScore,
    },
    {
      metric: 'Average Stress (%)',
      [runA.name]: metA.averageCrewStress,
      [runB.name]: metB.averageCrewStress,
    },
    {
      metric: 'Average Fatigue (%)',
      [runA.name]: metA.averageCrewFatigue,
      [runB.name]: metB.averageCrewFatigue,
    },
    {
      metric: 'Time to Resolve (min)',
      [runA.name]: metA.timeToResolveMinutes,
      [runB.name]: metB.timeToResolveMinutes,
    },
  ];

  return (
    <div className="space-y-6">
      {/* High-Level Delta Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded border border-panel-blue/40 bg-space-surface/90">
          <div className="flex items-center justify-between text-xs text-offwhite/60 mb-1">
            <span>CREW SAFETY Δ</span>
            <Shield className="h-3.5 w-3.5 text-telemetry-cyan" />
          </div>
          <div className="text-xl font-bold">
            <span className={deltas.crewSafetyDelta >= 0 ? 'text-nominal-green' : 'text-critical-red'}>
              {deltas.crewSafetyDelta > 0 ? '+' : ''}{deltas.crewSafetyDelta} PTS
            </span>
          </div>
          <span className="text-[10px] text-offwhite/50 block mt-0.5">
            Run A vs Run B Composite
          </span>
        </div>

        <div className="p-3 rounded border border-panel-blue/40 bg-space-surface/90">
          <div className="flex items-center justify-between text-xs text-offwhite/60 mb-1">
            <span>O2 CONSERVED Δ</span>
            <Wind className="h-3.5 w-3.5 text-telemetry-cyan" />
          </div>
          <div className="text-xl font-bold">
            <span className={deltas.oxygenUsedDelta <= 0 ? 'text-nominal-green' : 'text-warning-amber'}>
              {deltas.oxygenUsedDelta > 0 ? '+' : ''}{deltas.oxygenUsedDelta} kg
            </span>
          </div>
          <span className="text-[10px] text-offwhite/50 block mt-0.5">
            {deltas.oxygenUsedDelta <= 0 ? 'Run A saved oxygen' : 'Run B saved oxygen'}
          </span>
        </div>

        <div className="p-3 rounded border border-panel-blue/40 bg-space-surface/90">
          <div className="flex items-center justify-between text-xs text-offwhite/60 mb-1">
            <span>RESOLUTION TIME Δ</span>
            <Clock className="h-3.5 w-3.5 text-telemetry-cyan" />
          </div>
          <div className="text-xl font-bold text-offwhite">
            {metA.timeToResolveMinutes}m vs {metB.timeToResolveMinutes}m
          </div>
          <span className="text-[10px] text-offwhite/50 block mt-0.5">
            Difference: {Math.abs(metA.timeToResolveMinutes - metB.timeToResolveMinutes)} minutes
          </span>
        </div>

        <div className="p-3 rounded border border-panel-blue/40 bg-space-surface/90">
          <div className="flex items-center justify-between text-xs text-offwhite/60 mb-1">
            <span>COMMS REJECTIONS</span>
            <Badge variant={metB.actionsRejected > 0 ? 'critical' : 'nominal'}>
              FR-11.5
            </Badge>
          </div>
          <div className="text-xl font-bold">
            <span className="text-telemetry-cyan">{metA.actionsRejected}</span>
            <span className="text-offwhite/40 mx-1.5">/</span>
            <span className="text-critical-red">{metB.actionsRejected} Blocked</span>
          </div>
          <span className="text-[10px] text-offwhite/50 block mt-0.5">
            Ground-assisted interlocks
          </span>
        </div>
      </div>

      {/* Side-by-Side Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Consumables Expended */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Droplets className="h-4 w-4 text-telemetry-cyan" />
              CONSUMABLES EXPENDED (RUN A vs RUN B)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumablesData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis
                    dataKey="metric"
                    stroke="#94a3b8"
                    fontSize={11}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0e17',
                      borderColor: '#1f293d',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                  />
                  <Bar dataKey={runA.name} fill="#00e5ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={runB.name} fill="#ff3366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Human Factors & Resolution Time */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <TrendingUp className="h-4 w-4 text-telemetry-cyan" />
              HUMAN FACTORS & TIMELINE COMPARISON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis
                    dataKey="metric"
                    stroke="#94a3b8"
                    fontSize={11}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0e17',
                      borderColor: '#1f293d',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                  />
                  <Bar dataKey={runA.name} fill="#00e5ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={runB.name} fill="#ffb020" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Resource Reserves Comparison Table */}
      <Card withBracket>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Battery className="h-4 w-4 text-nominal-green" />
              FINAL MISSION RESERVES COMPARISON TABLE
            </CardTitle>
            <Badge variant="telemetry">DETERMINISTIC SIMULATION ENGINE SNAPSHOT</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-panel-blue/40 text-[11px] text-offwhite/50 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Subsystem Telemetry Metric</th>
                  <th className="py-2.5 px-3 text-telemetry-cyan">{runA.name}</th>
                  <th className="py-2.5 px-3 text-critical-red">{runB.name}</th>
                  <th className="py-2.5 px-3">Comparative Variance (Δ)</th>
                  <th className="py-2.5 px-3">Flight Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-blue/20">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Final Oxygen Inventory</td>
                  <td className="py-2.5 px-3 text-telemetry-cyan font-bold">
                    {metA.finalReserves.oxygenKg.toFixed(2)} kg
                  </td>
                  <td className="py-2.5 px-3 text-critical-red font-bold">
                    {metB.finalReserves.oxygenKg.toFixed(2)} kg
                  </td>
                  <td className="py-2.5 px-3">
                    {(metA.finalReserves.oxygenKg - metB.finalReserves.oxygenKg).toFixed(2)} kg
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    {metA.finalReserves.oxygenKg >= metB.finalReserves.oxygenKg
                      ? 'Run A preserved greater breathing buffer'
                      : 'Run B preserved greater breathing buffer'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Final Battery Storage</td>
                  <td className="py-2.5 px-3 text-telemetry-cyan font-bold">
                    {metA.finalReserves.batteryKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2.5 px-3 text-critical-red font-bold">
                    {metB.finalReserves.batteryKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2.5 px-3">
                    {(metA.finalReserves.batteryKwh - metB.finalReserves.batteryKwh).toFixed(1)} kWh
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    {metA.finalReserves.batteryKwh >= metB.finalReserves.batteryKwh
                      ? 'Run A maintained higher electrical margin'
                      : 'Run B maintained higher electrical margin'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Final Water Storage</td>
                  <td className="py-2.5 px-3 text-telemetry-cyan font-bold">
                    {metA.finalReserves.waterLiters.toFixed(1)} L
                  </td>
                  <td className="py-2.5 px-3 text-critical-red font-bold">
                    {metB.finalReserves.waterLiters.toFixed(1)} L
                  </td>
                  <td className="py-2.5 px-3">
                    {(metA.finalReserves.waterLiters - metB.finalReserves.waterLiters).toFixed(1)} L
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    Hydration and loop closure reserves
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Crew Safety Composite Score</td>
                  <td className="py-2.5 px-3 text-telemetry-cyan font-bold">
                    {metA.crewSafetyScore} / 100
                  </td>
                  <td className="py-2.5 px-3 text-critical-red font-bold">
                    {metB.crewSafetyScore} / 100
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {deltas.crewSafetyDelta > 0 ? '+' : ''}{deltas.crewSafetyDelta} pts
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    {deltas.crewSafetyDelta > 0
                      ? 'Run A experienced less physiological and cognitive strain'
                      : 'Crew conditions remained comparable'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Average Equipment Condition</td>
                  <td className="py-2.5 px-3 text-telemetry-cyan font-bold">
                    {metA.averageEquipmentCondition}%
                  </td>
                  <td className="py-2.5 px-3 text-critical-red font-bold">
                    {metB.averageEquipmentCondition}%
                  </td>
                  <td className="py-2.5 px-3">
                    {deltas.equipmentConditionDelta > 0 ? '+' : ''}{deltas.equipmentConditionDelta}%
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    Subsystem mechanical wear across 6 habitat units
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-offwhite">Contingency Resolution State</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={metA.missionCompletionStatus === 'RESOLVED' ? 'nominal' : 'warning'}>
                      {metA.missionCompletionStatus}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={metB.missionCompletionStatus === 'RESOLVED' ? 'nominal' : 'warning'}>
                      {metB.missionCompletionStatus}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-offwhite/70">
                    Time: {metA.timeToResolveMinutes}m vs {metB.timeToResolveMinutes}m
                  </td>
                  <td className="py-2.5 px-3 text-offwhite/70">
                    Verified through pure simulation clock ticks
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
