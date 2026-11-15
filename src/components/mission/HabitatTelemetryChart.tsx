/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Habitat Multi-Parameter Telemetry & Historical Trends Chart
 *
 * Visualizes longitudinal telemetry trends across all six habitat systems:
 * 1. Oxygen reserves & consumption
 * 2. CO2 removal capacity & scrubbing margin
 * 3. Water storage & catalytic recovery percentage
 * 4. Food calorie inventories
 * 5. Electrical power generation, demand & battery storage
 * 6. Equipment condition & mechanical wear
 */

import React, { useState, useMemo } from 'react';
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
import { Activity, Zap, Wind, Droplets, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';

export type TelemetryViewMode = 'resources' | 'power' | 'atmosphere' | 'equipment';

export const HabitatTelemetryChart: React.FC = () => {
  const { missionState } = useMissionStore();
  const [viewMode, setViewMode] = useState<TelemetryViewMode>('resources');

  const history = missionState.records.resourceHistory;
  const currentElapsed = missionState.mission.elapsedHours;
  const res = missionState.habitatResources;
  const eq = missionState.equipment;

  // Transform raw history into structured chart data
  const chartData = useMemo(() => {
    if (history.length === 0) {
      // Baseline point if mission just started
      return [
        {
          timeHour: Number(currentElapsed.toFixed(1)),
          timeLabel: `MET ${currentElapsed.toFixed(1)}h`,
          oxygenKg: res.oxygenInventoryKg,
          waterLiters: res.waterInventoryLiters,
          batteryKwh: res.batteryStorageKwh,
          batterySoc: res.batteryStateOfChargePercent,
          powerGenKw: res.powerGenerationKw,
          powerDemandKw: res.powerDemandKw,
          co2ScrubKgH: res.co2RemovalCapacityKgPerHour,
          cdraCondition: eq.find((e) => e.equipmentName.includes('CDRA'))?.condition ?? 92.0,
          wrsCondition: eq.find((e) => e.equipmentName.includes('Water'))?.condition ?? 95.5,
          solarCondition: eq.find((e) => e.equipmentName.includes('Solar'))?.condition ?? 98.0,
          foodKcal: res.foodInventoryKcal / 1000, // in thousands of kcal
        },
      ];
    }

    return history.map((pt, idx) => {
      const cdra = eq.find((e) => e.equipmentName.includes('CDRA'))?.condition ?? 92.0;
      const wrs = eq.find((e) => e.equipmentName.includes('Water'))?.condition ?? 95.5;
      const solar = eq.find((e) => e.equipmentName.includes('Solar'))?.condition ?? 98.0;

      // Simulated wear over time points
      const wearDelta = (history.length - 1 - idx) * 0.05;

      return {
        timeHour: Number(pt.timestampHours.toFixed(1)),
        timeLabel: `MET ${pt.timestampHours.toFixed(1)}h`,
        oxygenKg: Number(pt.oxygenKg.toFixed(1)),
        waterLiters: Number(pt.waterLiters.toFixed(0)),
        batteryKwh: Number(pt.batteryKwh.toFixed(1)),
        batterySoc: Number(((pt.batteryKwh / 200.0) * 100.0).toFixed(1)),
        powerGenKw: Number(pt.powerKw.toFixed(1)),
        powerDemandKw: res.powerDemandKw,
        co2ScrubKgH: res.co2RemovalCapacityKgPerHour,
        cdraCondition: Math.min(100, Math.max(0, Number((cdra + wearDelta).toFixed(1)))),
        wrsCondition: Math.min(100, Math.max(0, Number((wrs + wearDelta).toFixed(1)))),
        solarCondition: Math.min(100, Math.max(0, Number((solar + wearDelta).toFixed(1)))),
        foodKcal: Number((res.foodInventoryKcal / 1000).toFixed(0)),
      };
    });
  }, [history, currentElapsed, res, eq]);

  return (
    <Card withBracket className="bg-control-navy border-panel-blue">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <Activity className="h-4 w-4 text-telemetry-cyan" />
            HABITAT TELEMETRY TRENDS & HISTORICAL LOGIC CURVES
          </CardTitle>

          {/* Mode Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <Button
              variant={viewMode === 'resources' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('resources')}
              className="h-6 px-2 text-[10px]"
            >
              <Droplets className="h-3 w-3 mr-1" />
              CONSUMABLES INVENTORIES
            </Button>
            <Button
              variant={viewMode === 'power' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('power')}
              className="h-6 px-2 text-[10px]"
            >
              <Zap className="h-3 w-3 mr-1" />
              POWER & BATTERY GRID
            </Button>
            <Button
              variant={viewMode === 'atmosphere' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('atmosphere')}
              className="h-6 px-2 text-[10px]"
            >
              <Wind className="h-3 w-3 mr-1" />
              ECLSS & ATMOSPHERE
            </Button>
            <Button
              variant={viewMode === 'equipment' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('equipment')}
              className="h-6 px-2 text-[10px]"
            >
              <Cpu className="h-3 w-3 mr-1" />
              EQUIPMENT WEAR
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 font-mono text-xs">
        <div className="h-64 w-full bg-space-surface/50 border border-panel-blue/40 p-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {viewMode === 'resources' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#193B59" opacity={0.5} />
                <XAxis dataKey="timeLabel" stroke="#8899A6" fontSize={10} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#43C6E8"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                  label={{ value: 'Oxygen (kg)', angle: -90, position: 'insideLeft', fill: '#43C6E8', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#45B77A"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                  label={{ value: 'Water (L)', angle: 90, position: 'insideRight', fill: '#45B77A', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111F',
                    border: '1px solid #193B59',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="oxygenKg"
                  name="Oxygen Inventory (kg)"
                  stroke="#43C6E8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterLiters"
                  name="Water Inventory (L)"
                  stroke="#45B77A"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : viewMode === 'power' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#193B59" opacity={0.5} />
                <XAxis dataKey="timeLabel" stroke="#8899A6" fontSize={10} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#F5A623"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#F5A623', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#43C6E8"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 100]}
                  label={{ value: 'SoC (%)', angle: 90, position: 'insideRight', fill: '#43C6E8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111F',
                    border: '1px solid #193B59',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="powerGenKw"
                  name="Generation (kW)"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="powerDemandKw"
                  name="Demand (kW)"
                  stroke="#E05252"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="batterySoc"
                  name="Battery SoC (%)"
                  stroke="#43C6E8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : viewMode === 'atmosphere' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#193B59" opacity={0.5} />
                <XAxis dataKey="timeLabel" stroke="#8899A6" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#43C6E8"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                  label={{ value: 'Scrub Rate (kg/h)', angle: -90, position: 'insideLeft', fill: '#43C6E8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111F',
                    border: '1px solid #193B59',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="co2ScrubKgH"
                  name="CDRA CO₂ Removal (kg/hr)"
                  stroke="#43C6E8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#193B59" opacity={0.5} />
                <XAxis dataKey="timeLabel" stroke="#8899A6" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#45B77A"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 100]}
                  label={{ value: 'Condition (%)', angle: -90, position: 'insideLeft', fill: '#45B77A', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111F',
                    border: '1px solid #193B59',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="cdraCondition"
                  name="CDRA Scrubber Cond. (%)"
                  stroke="#43C6E8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="wrsCondition"
                  name="Water Recovery Cond. (%)"
                  stroke="#45B77A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="solarCondition"
                  name="Solar Array Cond. (%)"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Telemetry Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="p-2 bg-space-surface border border-panel-blue/30">
            <span className="text-offwhite/50 block text-[10px]">O₂ INVENTORY:</span>
            <span className="font-bold text-telemetry-cyan text-sm">{res.oxygenInventoryKg.toFixed(1)} kg</span>
            <span className="text-[9px] text-offwhite/40 block">Max: 300.0 kg</span>
          </div>
          <div className="p-2 bg-space-surface border border-panel-blue/30">
            <span className="text-offwhite/50 block text-[10px]">WATER POTABLE:</span>
            <span className="font-bold text-nominal-green text-sm">{res.waterInventoryLiters.toFixed(0)} L</span>
            <span className="text-[9px] text-offwhite/40 block">Max: 1200.0 L</span>
          </div>
          <div className="p-2 bg-space-surface border border-panel-blue/30">
            <span className="text-offwhite/50 block text-[10px]">BATTERY SOC:</span>
            <span className={cn('font-bold text-sm', res.batteryStateOfChargePercent <= 30 ? 'text-critical-red' : 'text-warning-amber')}>
              {res.batteryStateOfChargePercent.toFixed(1)}%
            </span>
            <span className="text-[9px] text-offwhite/40 block">{res.batteryStorageKwh.toFixed(1)} / 200 kWh</span>
          </div>
          <div className="p-2 bg-space-surface border border-panel-blue/30">
            <span className="text-offwhite/50 block text-[10px]">NET POWER:</span>
            <span className={cn('font-bold text-sm', res.powerGenerationKw >= res.powerDemandKw ? 'text-nominal-green' : 'text-critical-red')}>
              {(res.powerGenerationKw - res.powerDemandKw >= 0 ? '+' : '')}
              {(res.powerGenerationKw - res.powerDemandKw).toFixed(1)} kW
            </span>
            <span className="text-[9px] text-offwhite/40 block">Gen: {res.powerGenerationKw.toFixed(1)} | Dem: {res.powerDemandKw.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
