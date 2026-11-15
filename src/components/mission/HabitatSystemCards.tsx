/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Six Habitat Systems Detailed Operation Cards
 *
 * Each system displays:
 * 1. Current inventory or capacity
 * 2. Consumption rate
 * 3. Recovery rate
 * 4. Reserve level (Runway / safety margin)
 * 5. Equipment health
 * 6. System status (NOMINAL / WARNING / CRITICAL)
 * 7. Historical trends summary
 */

import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Wind,
  Droplets,
  Zap,
  Cpu,
  Utensils,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HabitatSystemCardsProps {
  onExecuteCommand: (action: string, parameters?: Record<string, unknown>) => void;
}

export const HabitatSystemCards: React.FC<HabitatSystemCardsProps> = ({
  onExecuteCommand,
}) => {
  const { missionState } = useMissionStore();
  const res = missionState.habitatResources;
  const eq = missionState.equipment;

  // Equipment instances
  const cdra = eq.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('CDRA'));
  const wrs = eq.find((e) => e.equipmentId.includes('WRS') || e.equipmentName.includes('Water'));
  const solar = eq.find((e) => e.equipmentId.includes('SOLAR') || e.equipmentName.includes('Solar'));
  const reactor = eq.find((e) => e.equipmentId.includes('REACTOR') || e.equipmentName.includes('Reactor'));
  const airlock = eq.find((e) => e.equipmentId.includes('AIRLOCK'));
  const comms = eq.find((e) => e.equipmentId.includes('HGA') || e.equipmentName.includes('Antenna'));

  // Health and status calculations
  const o2DaysRunway = res.oxygenConsumptionRateKgPerHour > 0
    ? (res.oxygenInventoryKg / (res.oxygenConsumptionRateKgPerHour * 24)).toFixed(1)
    : '84.8';

  const waterDaysRunway = (
    res.waterInventoryLiters /
    Math.max(0.1, (4 * 2.5) * (1 - res.waterRecoveryRatePercent / 100))
  ).toFixed(0);

  const foodDaysRunway = res.foodConsumptionKcalPerHour > 0
    ? (res.foodInventoryKcal / (res.foodConsumptionKcalPerHour * 24)).toFixed(1)
    : '29.7';

  // System 1: Oxygen Status
  const o2Status: 'nominal' | 'warning' | 'critical' =
    res.oxygenInventoryKg <= 25 ? 'critical' : res.oxygenInventoryKg <= 60 ? 'warning' : 'nominal';

  // System 2: CO2 Removal Status
  const co2Status: 'nominal' | 'warning' | 'critical' =
    res.co2RemovalCapacityKgPerHour < 0.15 || (cdra && cdra.status === 'FAILED')
      ? 'critical'
      : res.co2RemovalCapacityKgPerHour < 0.22 || (cdra && cdra.status === 'DEGRADED')
      ? 'warning'
      : 'nominal';

  // System 3: Water Recovery Status
  const waterStatus: 'nominal' | 'warning' | 'critical' =
    res.waterRecoveryRatePercent < 50 || res.waterInventoryLiters < 200 || (wrs && wrs.status === 'FAILED')
      ? 'critical'
      : res.waterRecoveryRatePercent < 80 || (wrs && wrs.status === 'DEGRADED')
      ? 'warning'
      : 'nominal';

  // System 4: Food Inventory Status
  const foodStatus: 'nominal' | 'warning' | 'critical' =
    res.foodInventoryKcal < 30000 ? 'critical' : res.foodInventoryKcal < 80000 ? 'warning' : 'nominal';

  // System 5: Electrical Power Status
  const powerStatus: 'nominal' | 'warning' | 'critical' =
    res.batteryStateOfChargePercent <= 15 || res.batteryStorageKwh <= 10
      ? 'critical'
      : res.batteryStateOfChargePercent <= 35 || res.powerGenerationKw < res.powerDemandKw
      ? 'warning'
      : 'nominal';

  // System 6: Equipment Fleet Status
  const failedEqCount = eq.filter((e) => e.status === 'FAILED').length;
  const maintReqCount = eq.filter((e) => e.maintenanceRequired || e.condition < 30).length;
  const eqStatus: 'nominal' | 'warning' | 'critical' =
    failedEqCount > 0 ? 'critical' : maintReqCount > 0 ? 'warning' : 'nominal';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
      {/* =========================================================================
          SYSTEM 1: OXYGEN MANAGEMENT
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wind className="h-4 w-4 text-telemetry-cyan" />
                <CardTitle className="text-xs">1. OXYGEN MANAGEMENT</CardTitle>
              </div>
              <Badge variant={o2Status}>{o2Status.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">CRYOGENIC O₂ HIGH-PRESSURE MANIFOLD</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Current Inventory & Progress */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Current Inventory:</span>
                <span className="text-base font-bold text-telemetry-cyan">
                  {res.oxygenInventoryKg.toFixed(1)} <span className="text-xs font-normal text-offwhite/50">/ 300.0 kg</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-telemetry-cyan transition-all duration-300"
                  style={{ width: `${Math.min(100, (res.oxygenInventoryKg / 300.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">CONSUMPTION RATE:</span>
                <span className="font-bold text-offwhite">{res.oxygenConsumptionRateKgPerHour.toFixed(2)} kg/hr</span>
                <span className="text-[9px] text-offwhite/40 block">~{(res.oxygenConsumptionRateKgPerHour * 24).toFixed(2)} kg/day</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RECOVERY RATE:</span>
                <span className="font-bold text-nominal-green">0.00 kg/hr</span>
                <span className="text-[9px] text-offwhite/40 block">Open Loop / Cryo Buffer</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RESERVE LEVEL:</span>
                <span className="font-bold text-nominal-green">{o2DaysRunway} Sols</span>
                <span className="text-[9px] text-offwhite/40 block">+{(Number(o2DaysRunway) - 30).toFixed(0)}d vs Mission Sol</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">EQUIPMENT HEALTH:</span>
                <span className="font-bold text-offwhite">98.5%</span>
                <span className="text-[9px] text-nominal-green block">Regulators Nominal</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-telemetry-cyan font-bold">Trend:</span> Nominal cryogenic boil-off &lt;0.01 kg/day. Consumption stable at 0.14 kg/hr.
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('BOOST_OXYGEN_INJECTION')}
          >
            PULSE +5.0 kg O₂
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('ACTIVATE_BACKUP_EQUIPMENT', { backupSystem: 'O2_SURGE_TANK' })}
          >
            DISCHARGE SURGE TANK
          </Button>
        </div>
      </Card>

      {/* =========================================================================
          SYSTEM 2: CO2 REMOVAL (CDRA)
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <RotateCw className="h-4 w-4 text-warning-amber" />
                <CardTitle className="text-xs">2. CO₂ REMOVAL (CDRA)</CardTitle>
              </div>
              <Badge variant={co2Status}>{co2Status.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">ZEOLITE & SOLID AMINE ADSORPTION BED A/B</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Current Scrubbing Capacity */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Scrubbing Capacity:</span>
                <span className="text-base font-bold text-telemetry-cyan">
                  {res.co2RemovalCapacityKgPerHour.toFixed(2)} <span className="text-xs font-normal text-offwhite/50">kg CO₂/hr</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-telemetry-cyan transition-all duration-300"
                  style={{ width: `${Math.min(100, (res.co2RemovalCapacityKgPerHour / 0.35) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">CREW EXHALATION:</span>
                <span className="font-bold text-offwhite">0.16 kg/hr</span>
                <span className="text-[9px] text-offwhite/40 block">4 Crew Exhalation Load</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">SCRUBBING EFFICIENCY:</span>
                <span className="font-bold text-nominal-green">{res.eclssEfficiencyScore.toFixed(0)}%</span>
                <span className="text-[9px] text-offwhite/40 block">Thermal Desorption Active</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">SCRUBBING MARGIN:</span>
                <span className={cn('font-bold', res.co2RemovalCapacityKgPerHour >= 0.16 ? 'text-nominal-green' : 'text-critical-red')}>
                  {(res.co2RemovalCapacityKgPerHour - 0.16 >= 0 ? '+' : '')}
                  {(res.co2RemovalCapacityKgPerHour - 0.16).toFixed(2)} kg/hr
                </span>
                <span className="text-[9px] text-offwhite/40 block">Excess Scrub Buffer</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">EQUIPMENT HEALTH:</span>
                <span className="font-bold text-offwhite">{cdra ? cdra.condition.toFixed(1) : 92.0}%</span>
                <span className="text-[9px] text-offwhite/50 block">{cdra ? cdra.status : 'OPERATIONAL'}</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-warning-amber font-bold">Cabin ppCO₂:</span> {res.co2RemovalCapacityKgPerHour >= 0.25 ? '0.24 kPa' : '0.38 kPa'} (Flight Rule Limit: &lt; 0.40 kPa)
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('RECYCLE_CO2_SCRUBBER')}
          >
            CYCLE CDRA BED
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('ACTIVATE_BACKUP_EQUIPMENT', { backupSystem: 'CDRA_BED_B' })}
          >
            ENGAGE AMINE BED B
          </Button>
        </div>
      </Card>

      {/* =========================================================================
          SYSTEM 3: WATER RECOVERY (WRS)
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-nominal-green" />
                <CardTitle className="text-xs">3. WATER RECOVERY (WRS)</CardTitle>
              </div>
              <Badge variant={waterStatus}>{waterStatus.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">VAPOR COMPRESSION DISTILLATION & CATALYTIC LOOP</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Current Water Reserve */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Potable Storage:</span>
                <span className="text-base font-bold text-nominal-green">
                  {res.waterInventoryLiters.toFixed(0)} <span className="text-xs font-normal text-offwhite/50">/ 1200.0 L</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-nominal-green transition-all duration-300"
                  style={{ width: `${Math.min(100, (res.waterInventoryLiters / 1200.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">CONSUMPTION RATE:</span>
                <span className="font-bold text-offwhite">0.42 L/hr</span>
                <span className="text-[9px] text-offwhite/40 block">10.0 L/sol aggregate</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RECOVERY RATE:</span>
                <span className="font-bold text-nominal-green">{res.waterRecoveryRatePercent.toFixed(1)}%</span>
                <span className="text-[9px] text-offwhite/40 block">Recycles 9.34 L/sol</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RESERVE RUNWAY:</span>
                <span className="font-bold text-nominal-green">{waterDaysRunway} Sols</span>
                <span className="text-[9px] text-offwhite/40 block">Net loss: ~0.66 L/sol</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">EQUIPMENT HEALTH:</span>
                <span className="font-bold text-offwhite">{wrs ? wrs.condition.toFixed(1) : 95.5}%</span>
                <span className="text-[9px] text-offwhite/50 block">{wrs ? wrs.status : 'OPERATIONAL'}</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-nominal-green font-bold">Purity:</span> Microbial solids &lt; 0.05 mg/L. Closed distillation loop operating nominally.
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('FLUSH_WATER_CATALYST')}
          >
            FLUSH CATALYST
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('ACTIVATE_BACKUP_EQUIPMENT', { backupSystem: 'WRS_AUX_CORE' })}
          >
            ACTIVATE AUX CORE
          </Button>
        </div>
      </Card>

      {/* =========================================================================
          SYSTEM 4: FOOD INVENTORY
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-warning-amber" />
                <CardTitle className="text-xs">4. FOOD INVENTORY</CardTitle>
              </div>
              <Badge variant={foodStatus}>{foodStatus.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">SHELF-STABLE METABOLIC RATION PACKS</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Current Food Reserve */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Remaining Calories:</span>
                <span className="text-base font-bold text-offwhite">
                  {(res.foodInventoryKcal / 1000).toFixed(0)}k <span className="text-xs font-normal text-offwhite/50">/ 360k kcal</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-warning-amber transition-all duration-300"
                  style={{ width: `${Math.min(100, (res.foodInventoryKcal / 360000.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">CONSUMPTION RATE:</span>
                <span className="font-bold text-offwhite">{res.foodConsumptionKcalPerHour.toFixed(0)} kcal/hr</span>
                <span className="text-[9px] text-offwhite/40 block">~11,520 kcal/sol crew</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RECOVERY RATE:</span>
                <span className="font-bold text-offwhite/50">0.0 kcal/hr</span>
                <span className="text-[9px] text-offwhite/40 block">Non-Renewable Sortie</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">RESERVE RUNWAY:</span>
                <span className="font-bold text-nominal-green">{foodDaysRunway} Sols</span>
                <span className="text-[9px] text-offwhite/40 block">30-Sol Mission Safe</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">EQUIPMENT HEALTH:</span>
                <span className="font-bold text-offwhite">96.0%</span>
                <span className="text-[9px] text-nominal-green block">Galley Warmer Ready</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-warning-amber font-bold">Nutrition:</span> Macro balance optimal. 2,880 kcal/astronaut/sol baseline.
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('CHANGE_RESOURCE_ALLOCATION', { resourceType: 'FOOD', allocationTier: 'CONSERVATIVE' })}
          >
            RATION FOOD (-20%)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('CHANGE_RESOURCE_ALLOCATION', { resourceType: 'FOOD', allocationTier: 'NOMINAL' })}
          >
            RESTORE NOMINAL
          </Button>
        </div>
      </Card>

      {/* =========================================================================
          SYSTEM 5: ELECTRICAL POWER (EPS)
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-warning-amber" />
                <CardTitle className="text-xs">5. ELECTRICAL POWER (EPS)</CardTitle>
              </div>
              <Badge variant={powerStatus}>{powerStatus.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">SOLAR ARRAY + FISSION REACTOR + LITHIUM BANK</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Current Power Generation & Battery SoC */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Battery State of Charge:</span>
                <span className="text-base font-bold text-warning-amber">
                  {res.batteryStateOfChargePercent.toFixed(1)}% <span className="text-xs font-normal text-offwhite/50">({res.batteryStorageKwh.toFixed(0)} / 200 kWh)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    res.batteryStateOfChargePercent <= 30 ? 'bg-critical-red' : 'bg-warning-amber'
                  )}
                  style={{ width: `${Math.min(100, res.batteryStateOfChargePercent)}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">POWER DEMAND:</span>
                <span className="font-bold text-critical-red">{res.powerDemandKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-offwhite/40 block">Base + ECLSS + Avionics</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">POWER GENERATION:</span>
                <span className="font-bold text-nominal-green">{res.powerGenerationKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-offwhite/40 block">Solar + Nuclear Reactor</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">NET POWER MARGIN:</span>
                <span className={cn('font-bold', res.powerGenerationKw >= res.powerDemandKw ? 'text-nominal-green' : 'text-critical-red')}>
                  {(res.powerGenerationKw - res.powerDemandKw >= 0 ? '+' : '')}
                  {(res.powerGenerationKw - res.powerDemandKw).toFixed(1)} kW
                </span>
                <span className="text-[9px] text-offwhite/40 block">{res.powerGenerationKw >= res.powerDemandKw ? 'Battery Charging' : 'Discharging'}</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">GENERATOR HEALTH:</span>
                <span className="font-bold text-offwhite">
                  Solar: {solar ? solar.condition.toFixed(0) : 98}%
                </span>
                <span className="text-[9px] text-nominal-green block">Reactor: {reactor ? reactor.condition.toFixed(0) : 99}%</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-warning-amber font-bold">Grid:</span> Automatic load-shedding armed at &le;30% SoC. Round-trip efficiency 95%.
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="danger"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('REDUCE_NON_ESSENTIAL_POWER')}
          >
            SHED LOAD (-4.5 kW)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('ACTIVATE_BACKUP_EQUIPMENT', { backupSystem: 'AUX_BATTERY_BANK' })}
          >
            ADD AUX BATTERY
          </Button>
        </div>
      </Card>

      {/* =========================================================================
          SYSTEM 6: EQUIPMENT MAINTENANCE
      ========================================================================= */}
      <Card withBracket className="bg-control-navy border-panel-blue flex flex-col justify-between">
        <div>
          <CardHeader className="p-3 border-b border-panel-blue/40 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-telemetry-cyan" />
                <CardTitle className="text-xs">6. EQUIPMENT MAINTENANCE</CardTitle>
              </div>
              <Badge variant={eqStatus}>{eqStatus.toUpperCase()}</Badge>
            </div>
            <span className="text-[10px] text-offwhite/50">HABITAT HARDWARE FLEET INTEGRITY MONITOR</span>
          </CardHeader>

          <CardContent className="p-3 space-y-3">
            {/* Average Fleet Condition */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[11px] text-offwhite/70">Fleet Average Condition:</span>
                <span className="text-base font-bold text-telemetry-cyan">
                  {(eq.reduce((sum, e) => sum + e.condition, 0) / eq.length).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-space-surface overflow-hidden border border-panel-blue/40">
                <div
                  className="h-full bg-telemetry-cyan transition-all duration-300"
                  style={{
                    width: `${eq.reduce((sum, e) => sum + e.condition, 0) / eq.length}%`,
                  }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">ACTIVE HARDWARE:</span>
                <span className="font-bold text-offwhite">{eq.filter((e) => e.status === 'OPERATIONAL').length} / {eq.length}</span>
                <span className="text-[9px] text-nominal-green block">Units Online</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">WEAR RATE:</span>
                <span className="font-bold text-offwhite">0.01% / hr</span>
                <span className="text-[9px] text-offwhite/40 block">Operational Wear</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">MAINTENANCE ALERTS:</span>
                <span className={cn('font-bold', maintReqCount > 0 ? 'text-critical-red' : 'text-nominal-green')}>
                  {maintReqCount} Pending
                </span>
                <span className="text-[9px] text-offwhite/40 block">Filter & Pump Overhauls</span>
              </div>
              <div className="p-2 bg-space-surface border border-panel-blue/30">
                <span className="text-[9px] text-offwhite/40 block">CRITICAL AIRLOCK:</span>
                <span className="font-bold text-offwhite">{airlock ? airlock.condition.toFixed(0) : 91}%</span>
                <span className="text-[9px] text-offwhite/50 block">{airlock ? airlock.status : 'OPERATIONAL'}</span>
              </div>
            </div>

            <div className="p-1.5 bg-space-surface/60 border border-panel-blue/30 text-[10px] text-offwhite/60">
              <span className="text-telemetry-cyan font-bold">Reliability:</span> High-Gain antenna {comms ? comms.condition.toFixed(0) : 97}%. Zero catastrophic structural failures.
            </div>
          </CardContent>
        </div>

        <div className="p-2.5 bg-space-surface/80 border-t border-panel-blue/40 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('START_MAINTENANCE', { equipmentId: 'EQ-ECLSS-CDRA-01' })}
          >
            OVERHAUL CDRA
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-1/2 text-[10px] h-7"
            onClick={() => onExecuteCommand('START_MAINTENANCE', { equipmentId: 'EQ-ECLSS-WRS-01' })}
          >
            OVERHAUL WRS
          </Button>
        </div>
      </Card>
    </div>
  );
};
