/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Resource Usage Summary
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Wind, Droplets, Zap, Apple, Battery } from 'lucide-react';
import { ResourceUsageSummary } from '@/simulation/models/missionDebrief';

interface ResourceUsageDebriefProps {
  resourceSummary: ResourceUsageSummary;
}

export const ResourceUsageDebrief: React.FC<ResourceUsageDebriefProps> = ({ resourceSummary }) => {
  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-nominal-green" />
            <CardTitle>CLOSED-LOOP HABITAT RESOURCE CONSUMPTION SUMMARY</CardTitle>
          </div>
          <Badge variant="nominal">
            RESOURCE SECURITY SCORE: {resourceSummary.resourceEfficiencyScore} / 100
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* 1. Oxygen */}
          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-1.5">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Wind className="h-4 w-4 text-telemetry-cyan" />
                OXYGEN (ECLSS)
              </span>
              <Badge variant={resourceSummary.finalOxygenKg < 40 ? 'critical' : resourceSummary.finalOxygenKg < 60 ? 'warning' : 'nominal'}>
                {resourceSummary.finalOxygenKg.toFixed(1)} kg
              </Badge>
            </div>
            <div className="space-y-1 text-[11px] text-offwhite/70">
              <div className="flex justify-between">
                <span>Initial Inventory:</span>
                <span className="text-offwhite">{resourceSummary.initialOxygenKg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Total Consumed / Lost:</span>
                <span className="text-warning-amber font-bold">{resourceSummary.consumedOxygenKg.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Burn Rate:</span>
                <span className="text-telemetry-cyan">{resourceSummary.averageOxygenConsumptionKgPerHour} kg/h</span>
              </div>
              <div className="flex justify-between border-t border-panel-blue/20 pt-1">
                <span>Safe Runway:</span>
                <span className="text-nominal-green">{resourceSummary.oxygenReserveMarginDays} Days</span>
              </div>
            </div>
          </div>

          {/* 2. Water */}
          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-1.5">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-telemetry-cyan" />
                WATER (WRS LOOP)
              </span>
              <Badge variant="nominal">
                {resourceSummary.finalWaterLiters.toFixed(1)} L
              </Badge>
            </div>
            <div className="space-y-1 text-[11px] text-offwhite/70">
              <div className="flex justify-between">
                <span>Initial Storage:</span>
                <span className="text-offwhite">{resourceSummary.initialWaterLiters.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span>Total Consumed:</span>
                <span className="text-warning-amber font-bold">{resourceSummary.consumedWaterLiters.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span>Recycling Efficiency:</span>
                <span className="text-nominal-green">{resourceSummary.waterRecoveryEfficiencyPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-t border-panel-blue/20 pt-1">
                <span>Final Potable Reserve:</span>
                <span className="text-telemetry-cyan">{resourceSummary.finalWaterLiters.toFixed(1)} L</span>
              </div>
            </div>
          </div>

          {/* 3. Electrical Power */}
          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-1.5">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-warning-amber" />
                POWER (MAIN BUS)
              </span>
              <Badge variant={resourceSummary.finalBatteryStateOfChargePercent < 30 ? 'warning' : 'nominal'}>
                {resourceSummary.finalBatteryStateOfChargePercent.toFixed(0)}% SoC
              </Badge>
            </div>
            <div className="space-y-1 text-[11px] text-offwhite/70">
              <div className="flex justify-between">
                <span>Battery Capacity:</span>
                <span className="text-offwhite">{resourceSummary.batteryCapacityKwh.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Final Storage:</span>
                <span className="text-telemetry-cyan font-bold">{resourceSummary.finalBatteryStorageKwh.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Active Generation:</span>
                <span className="text-offwhite">{resourceSummary.powerGenerationKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between border-t border-panel-blue/20 pt-1">
                <span>Total Energy Used:</span>
                <span className="text-warning-amber">{resourceSummary.totalPowerConsumedKwh} kWh</span>
              </div>
            </div>
          </div>

          {/* 4. Food Rations */}
          <div className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/30 pb-1.5">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Apple className="h-4 w-4 text-nominal-green" />
                FOOD RATIONS
              </span>
              <Badge variant="nominal">
                {(resourceSummary.finalFoodKcal / 1000).toFixed(0)}k kcal
              </Badge>
            </div>
            <div className="space-y-1 text-[11px] text-offwhite/70">
              <div className="flex justify-between">
                <span>Initial Rations:</span>
                <span className="text-offwhite">{(resourceSummary.initialFoodKcal / 1000).toFixed(0)}k kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Metabolic Draw:</span>
                <span className="text-warning-amber font-bold">{(resourceSummary.consumedFoodKcal / 1000).toFixed(0)}k kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Rations:</span>
                <span className="text-nominal-green">{(resourceSummary.finalFoodKcal / 1000).toFixed(0)}k kcal</span>
              </div>
              <div className="flex justify-between border-t border-panel-blue/20 pt-1">
                <span>Nutritional Buffer:</span>
                <span className="text-telemetry-cyan">Nominal</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
