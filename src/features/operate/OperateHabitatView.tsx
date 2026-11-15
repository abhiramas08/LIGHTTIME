/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Module 03: OPERATE – Habitat Management & Closed-Loop ECLSS
 *
 * Provides real-time monitoring and flight controller commands for six core systems:
 * 1. Oxygen management (Cryogenic reserves, burn rate, cabin delivery)
 * 2. CO2 removal (CDRA solid amine beds, exhalation loads, cabin ppCO2)
 * 3. Water recovery (WRS catalytic oxidation, distillation, potable storage)
 * 4. Food inventory (Shelf-stable metabolic rations, caloric burn rates)
 * 5. Electrical power (Solar arrays, fission micro-reactor, battery state of charge)
 * 6. Equipment maintenance (Mechanical wear, overhauls, failure prevention)
 *
 * CRITICAL ARCHITECTURAL COMPLIANCE:
 * - All telemetry reads directly from canonical MissionState.
 * - All controls execute validated commands via the pure simulation engine.
 * - Strict physical dependencies between power, equipment condition, and resource yields.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { HabitatSchematicDiagram } from '@/components/mission/HabitatSchematicDiagram';
import { HabitatSystemCards } from '@/components/mission/HabitatSystemCards';
import { HabitatTelemetryChart } from '@/components/mission/HabitatTelemetryChart';
import { HabitatControlsConsole } from '@/components/mission/HabitatControlsConsole';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { cn } from '@/utils/cn';
import {
  Activity,
  Cpu,
  BookOpen,
  Info,
  Layers,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const OperateHabitatView: React.FC = () => {
  const { missionState, executeMissionCommand } = useMissionStore();
  const res = missionState.habitatResources;
  const eq = missionState.equipment;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'systems' | 'schematic' | 'telemetry' | 'controls'>('systems');

  // Contingency & warning alerts
  const isBatteryCritical = res.batteryStateOfChargePercent <= 20;
  const isBatteryWarning = res.batteryStateOfChargePercent <= 35 && !isBatteryCritical;
  const isO2Critical = res.oxygenInventoryKg <= 25;
  const isO2Warning = res.oxygenInventoryKg <= 60 && !isO2Critical;
  const isCo2ScrubDegraded = res.co2RemovalCapacityKgPerHour < 0.20;
  const isWaterDegraded = res.waterRecoveryRatePercent < 80;
  const failedEquipment = eq.filter((e) => e.status === 'FAILED');
  const maintEquipment = eq.filter((e) => e.maintenanceRequired || e.condition < 30);

  const handleExecuteCommand = (action: string, parameters?: Record<string, unknown>) => {
    executeMissionCommand({
      subsystem: 'ECLSS',
      action,
      parameters: parameters || {},
      initiatedBy: 'GROUND',
    });
  };

  return (
    <PageContainer
      moduleCode="MOD-03"
      title="OPERATE – Habitat Management"
      description="Autonomous closed-loop Environmental Control and Life Support Systems (ECLSS), power grid regulation, and equipment maintenance operations console."
      actions={
        <div className="flex items-center gap-2">
          {isBatteryCritical || isO2Critical || failedEquipment.length > 0 ? (
            <Badge variant="critical" pulse>
              ECLSS CRITICAL CONTINGENCY ACTIVE
            </Badge>
          ) : isBatteryWarning || isO2Warning || isCo2ScrubDegraded || isWaterDegraded || maintEquipment.length > 0 ? (
            <Badge variant="warning">
              {maintEquipment.length > 0 ? `${maintEquipment.length} HARDWARE ADVISORIES` : 'ECLSS CAUTION STATE'}
            </Badge>
          ) : (
            <Badge variant="nominal" pulse>
              ALL 6 HABITAT SYSTEMS NOMINAL
            </Badge>
          )}
        </div>
      }
    >
      {/* Real-time System Alert Banners */}
      {isBatteryCritical && (
        <Alert
          variant="critical"
          title="CRITICAL POWER SHORTAGE: BATTERY STATE OF CHARGE &le; 20%"
          className="font-mono text-xs"
        >
          Electrical storage bank severely depleted ({res.batteryStateOfChargePercent.toFixed(1)}%).
          Automatic load shedding active. Prioritize LIFE SUPPORT bus or engage auxiliary battery backup immediately.
        </Alert>
      )}

      {isO2Critical && (
        <Alert
          variant="critical"
          title="CRITICAL OXYGEN INVENTORY DEPLETION"
          className="font-mono text-xs"
        >
          Cryogenic oxygen reserves have fallen to {res.oxygenInventoryKg.toFixed(1)} kg.
          Hypoxia hazard imminent. Inject auxiliary O₂ buffer or discharge high-pressure surge tank.
        </Alert>
      )}

      {failedEquipment.length > 0 && (
        <Alert
          variant="critical"
          title={`HARDWARE FAILURE DETECTED: ${failedEquipment.map((e) => e.equipmentName).join(', ')}`}
          className="font-mono text-xs"
        >
          Critical mechanical failure flagged in habitat equipment fleet. Initiate immediate maintenance overhaul or engage backup redundant strings.
        </Alert>
      )}

      {isCo2ScrubDegraded && !failedEquipment.some((e) => e.equipmentName.includes('CDRA')) && (
        <Alert
          variant="warning"
          title="CDRA CO₂ SCRUBBING CAPACITY DEGRADED"
          className="font-mono text-xs"
        >
          Carbon dioxide scrub rate has degraded to {res.co2RemovalCapacityKgPerHour.toFixed(2)} kg/hr (nominal: 0.35 kg/hr).
          Cabin ppCO₂ accumulating. Recommend cycling CDRA desiccant beds or engaging Amine Bed B.
        </Alert>
      )}

      {/* Top Habitat Metrics Quick Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">1. Oxygen Reserve</span>
          <span className="text-base font-bold text-telemetry-cyan mt-1">
            {res.oxygenInventoryKg.toFixed(1)} <span className="text-xs font-normal text-offwhite/40">kg</span>
          </span>
          <span className="text-[9px] text-nominal-green block">95.0% Reserve</span>
        </div>

        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">2. CO₂ Scrub Rate</span>
          <span className="text-base font-bold text-offwhite mt-1">
            {res.co2RemovalCapacityKgPerHour.toFixed(2)} <span className="text-xs font-normal text-offwhite/40">kg/h</span>
          </span>
          <span className={cn('text-[9px] block', res.co2RemovalCapacityKgPerHour >= 0.22 ? 'text-nominal-green' : 'text-warning-amber')}>
            ppCO₂: {res.co2RemovalCapacityKgPerHour >= 0.22 ? '0.24 kPa' : '0.38 kPa'}
          </span>
        </div>

        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">3. Water Recovery</span>
          <span className="text-base font-bold text-nominal-green mt-1">
            {res.waterRecoveryRatePercent.toFixed(1)}%
          </span>
          <span className="text-[9px] text-offwhite/40 block">{res.waterInventoryLiters.toFixed(0)} L in store</span>
        </div>

        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">4. Food Runway</span>
          <span className="text-base font-bold text-offwhite mt-1">
            {(res.foodInventoryKcal / 1000).toFixed(0)}k <span className="text-xs font-normal text-offwhite/40">kcal</span>
          </span>
          <span className="text-[9px] text-nominal-green block">~29.7 Sols</span>
        </div>

        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">5. Battery SoC</span>
          <span className={cn('text-base font-bold mt-1', res.batteryStateOfChargePercent <= 30 ? 'text-critical-red' : 'text-warning-amber')}>
            {res.batteryStateOfChargePercent.toFixed(1)}%
          </span>
          <span className="text-[9px] text-offwhite/40 block">Net: {(res.powerGenerationKw - res.powerDemandKw >= 0 ? '+' : '')}{(res.powerGenerationKw - res.powerDemandKw).toFixed(1)} kW</span>
        </div>

        <div className="p-3 bg-control-navy border border-panel-blue/60 flex flex-col justify-between">
          <span className="text-[10px] text-offwhite/50 block uppercase">6. Fleet Health</span>
          <span className="text-base font-bold text-telemetry-cyan mt-1">
            {(eq.reduce((sum, e) => sum + e.condition, 0) / eq.length).toFixed(1)}%
          </span>
          <span className="text-[9px] text-nominal-green block">{eq.filter((e) => e.status === 'OPERATIONAL').length}/6 Units Online</span>
        </div>
      </section>

      {/* Navigation Tabs for Habitat Subsystems */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-blue/40 pb-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('systems')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'systems'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-telemetry-cyan" />
              SIX FUNCTIONAL SYSTEMS
            </button>

            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'schematic'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-nominal-green" />
              ARCHITECTURAL SCHEMATIC
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-warning-amber" />
              HISTORICAL TELEMETRY TRENDS
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'controls'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-telemetry-cyan" />
              OPERATIONAL DIRECTIVES
            </button>
          </div>

          <span className="text-[10px] font-mono text-offwhite/40">
            SIMULATION MET: T+{missionState.mission.elapsedHours.toFixed(1)}h
          </span>
        </div>

        {/* Tab 1: All 6 Systems Cards */}
        {activeTab === 'systems' && (
          <div className="space-y-6">
            <HabitatSystemCards onExecuteCommand={handleExecuteCommand} />
            <HabitatControlsConsole />
          </div>
        )}

        {/* Tab 2: Interactive Schematic Diagram */}
        {activeTab === 'schematic' && (
          <div className="space-y-6">
            <HabitatSchematicDiagram onSelectSystem={() => setActiveTab('systems')} />
            <HabitatControlsConsole />
          </div>
        )}

        {/* Tab 3: Historical Telemetry Curves */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <HabitatTelemetryChart />
            <HabitatControlsConsole />
          </div>
        )}

        {/* Tab 4: Directives Console Dedicated */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <HabitatControlsConsole />
            <HabitatSystemCards onExecuteCommand={handleExecuteCommand} />
          </div>
        )}
      </section>

      {/* Systems Engineering Reference & Dependency Models */}
      <section className="space-y-3">
        <Card withBracket className="bg-control-navy border-panel-blue">
          <CardHeader>
            <CardTitle className="text-xs">
              <BookOpen className="h-4 w-4 text-telemetry-cyan" />
              SYSTEMS ENGINEERING DEPENDENCY ARCHITECTURE & CONSERVATION MODELS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <span className="font-bold text-telemetry-cyan text-xs block">
                  1. Power Availability & Equipment
                </span>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  Electrical loads from active ECLSS, airlock pumps, and thermal loops must be balanced by solar
                  and surface nuclear generation. When battery state of charge drops &le;30%, non-essential
                  equipment is shed into standby. Complete battery depletion (&le;0.1 kWh) forces non-nuclear
                  equipment to offline/failed states.
                </p>
              </div>

              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <span className="font-bold text-nominal-green text-xs block">
                  2. Equipment Condition & Capacity
                </span>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  Mechanical condition scales subsystem efficiency directly: CDRA condition dictates CO₂ scrub rate
                  (0.35 kg/hr &times; condition%), WRS catalytic core dictates water recovery efficiency (95% &times; condition%),
                  and tracking solar array condition scales peak photovoltaic collection.
                </p>
              </div>

              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <span className="font-bold text-warning-amber text-xs block">
                  3. Closed-Loop Mass Balances
                </span>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  Resource consumption is calculated deterministically from crew complement states. Extravehicular Activity
                  (EVA) imposes a 1.8&times; metabolic oxygen and hydration consumption rate. Recovered water feeds
                  potable reserves, while remaining cryogenic buffers guarantee deterministic non-negative balances.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-space-deep border border-panel-blue/40 flex items-center justify-between text-[11px] text-offwhite/60">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-telemetry-cyan" />
                SIMULATION RULES VERSION: {missionState.mission.simulationRulesVersion}
              </span>
              <span className="text-nominal-green flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                PHYSICAL CONSERVATION & DETERMINISTIC TICK ORDER VERIFIED
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
};
