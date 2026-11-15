/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Habitat Systems Technical Schematic Diagram
 *
 * Interactive aerospace engineering architectural flow diagram illustrating the
 * closed-loop ECLSS, Electrical Power System (EPS), and consumables bus.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HabitatSchematicDiagramProps {
  onSelectSystem?: (systemId: string) => void;
  className?: string;
}

export const HabitatSchematicDiagram: React.FC<HabitatSchematicDiagramProps> = ({
  onSelectSystem,
  className,
}) => {
  const { missionState } = useMissionStore();
  const res = missionState.habitatResources;
  const eq = missionState.equipment;

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Equipment lookups
  const cdra = eq.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('CDRA'));
  const wrs = eq.find((e) => e.equipmentId.includes('WRS') || e.equipmentName.includes('Water'));
  const solar = eq.find((e) => e.equipmentId.includes('SOLAR') || e.equipmentName.includes('Solar'));
  const reactor = eq.find((e) => e.equipmentId.includes('REACTOR') || e.equipmentName.includes('Reactor'));

  const isPowerLow = res.batteryStateOfChargePercent <= 30;
  const isO2Low = res.oxygenInventoryKg <= 50;
  const isCo2ScrubDegraded = res.co2RemovalCapacityKgPerHour < 0.20;
  const isWaterLow = res.waterRecoveryRatePercent < 80;

  return (
    <Card withBracket className={cn('bg-control-navy border-panel-blue', className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <Cpu className="h-4 w-4 text-telemetry-cyan" />
            CLOSED-LOOP ECLSS & POWER ARCHITECTURE SCHEMATIC
          </CardTitle>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <Badge variant="nominal" pulse>
              LOOP EFFICIENCY: {res.eclssEfficiencyScore.toFixed(1)}%
            </Badge>
            <Badge variant={res.resourceSecurityIndex > 80 ? 'nominal' : 'warning'}>
              SECURITY: {res.resourceSecurityIndex.toFixed(0)}/100
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 font-mono text-xs">
        {/* Interactive SVG Schematic Diagram */}
        <div className="w-full overflow-x-auto bg-space-deep p-3 border border-panel-blue/50 relative">
          <svg
            viewBox="0 0 920 320"
            className="w-full min-w-[760px] h-auto select-none font-mono"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#43C6E8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10243A" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5A623" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10243A" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#45B77A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10243A" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Background Technical Grid lines */}
            <line x1="40" y1="60" x2="880" y2="60" stroke="#193B59" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="40" y1="160" x2="880" y2="160" stroke="#193B59" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="40" y1="260" x2="880" y2="260" stroke="#193B59" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

            {/* FLOW PIPES & BUS CONNECTIONS */}
            {/* O2 Bus to Cabin */}
            <path
              d="M 170 80 L 320 80 L 320 140 L 400 140"
              fill="none"
              stroke="#43C6E8"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              className="animate-pulse"
            />
            {/* Cabin to CDRA */}
            <path
              d="M 520 140 L 600 140 L 600 80 L 730 80"
              fill="none"
              stroke="#F5A623"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            {/* WRS Water Loop to Cabin */}
            <path
              d="M 170 240 L 320 240 L 320 180 L 400 180"
              fill="none"
              stroke="#45B77A"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            {/* Power Bus from Solar & Reactor to Battery & Cabin */}
            <path
              d="M 730 240 L 600 240 L 600 180 L 520 180"
              fill="none"
              stroke="#F5A623"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />

            {/* NODE 1: Oxygen Cryo-Storage */}
            <g
              transform="translate(40, 40)"
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSystem?.('oxygen')}
              onMouseEnter={() => setHoveredNode('OXYGEN')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                width="130"
                height="80"
                fill="#10243A"
                stroke={isO2Low ? '#E05252' : '#43C6E8'}
                strokeWidth="1.5"
              />
              <text x="12" y="24" fill="#43C6E8" fontSize="11" fontWeight="bold">01. OXYGEN</text>
              <text x="12" y="44" fill="#F2F4F5" fontSize="13" fontWeight="bold">{res.oxygenInventoryKg.toFixed(1)} kg</text>
              <text x="12" y="62" fill="#8899A6" fontSize="9">Burn: {res.oxygenConsumptionRateKgPerHour.toFixed(2)} kg/h</text>
              <circle cx="115" cy="20" r="4" fill={isO2Low ? '#E05252' : '#45B77A'} />
            </g>

            {/* NODE 2: Water Reclamation (WRS) */}
            <g
              transform="translate(40, 200)"
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSystem?.('water')}
              onMouseEnter={() => setHoveredNode('WATER')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                width="130"
                height="80"
                fill="#10243A"
                stroke={isWaterLow ? '#F5A623' : '#45B77A'}
                strokeWidth="1.5"
              />
              <text x="12" y="24" fill="#45B77A" fontSize="11" fontWeight="bold">03. WATER WRS</text>
              <text x="12" y="44" fill="#F2F4F5" fontSize="13" fontWeight="bold">{res.waterInventoryLiters.toFixed(0)} L</text>
              <text x="12" y="62" fill="#8899A6" fontSize="9">Recov: {res.waterRecoveryRatePercent.toFixed(1)}%</text>
              <circle cx="115" cy="20" r="4" fill={wrs?.status === 'OPERATIONAL' ? '#45B77A' : '#F5A623'} />
            </g>

            {/* NODE 3: CENTRAL HABITAT CABIN CORE */}
            <g transform="translate(400, 100)" className="select-none">
              <rect
                width="120"
                height="120"
                fill="#07111F"
                stroke="#43C6E8"
                strokeWidth="2"
              />
              <text x="18" y="28" fill="#43C6E8" fontSize="11" fontWeight="bold">HABITAT CORE</text>
              <text x="18" y="48" fill="#F2F4F5" fontSize="10">4 EXPEDITION</text>
              <text x="18" y="66" fill="#8899A6" fontSize="9">Pres: 56.5 kPa</text>
              <text x="18" y="82" fill="#8899A6" fontSize="9">ppO₂: 20.0 kPa</text>
              <text x="18" y="98" fill={isCo2ScrubDegraded ? '#F5A623' : '#45B77A'} fontSize="9">
                ppCO₂: {isCo2ScrubDegraded ? '0.38 kPa' : '0.24 kPa'}
              </text>
            </g>

            {/* NODE 4: CO2 Removal Assembly (CDRA) */}
            <g
              transform="translate(730, 40)"
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSystem?.('co2')}
              onMouseEnter={() => setHoveredNode('CO2')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                width="150"
                height="80"
                fill="#10243A"
                stroke={isCo2ScrubDegraded ? '#F5A623' : '#43C6E8'}
                strokeWidth="1.5"
              />
              <text x="12" y="24" fill="#43C6E8" fontSize="11" fontWeight="bold">02. CO₂ CDRA BED</text>
              <text x="12" y="44" fill="#F2F4F5" fontSize="13" fontWeight="bold">{res.co2RemovalCapacityKgPerHour.toFixed(2)} kg/h</text>
              <text x="12" y="62" fill="#8899A6" fontSize="9">CDRA Health: {cdra ? cdra.condition.toFixed(0) : 92}%</text>
              <circle cx="135" cy="20" r="4" fill={isCo2ScrubDegraded ? '#F5A623' : '#45B77A'} />
            </g>

            {/* NODE 5: Electrical Power & Micro-Reactor (EPS) */}
            <g
              transform="translate(730, 200)"
              className="cursor-pointer transition-all hover:opacity-90"
              onClick={() => onSelectSystem?.('power')}
              onMouseEnter={() => setHoveredNode('POWER')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                width="150"
                height="80"
                fill="#10243A"
                stroke={isPowerLow ? '#E05252' : '#F5A623'}
                strokeWidth="1.5"
              />
              <text x="12" y="24" fill="#F5A623" fontSize="11" fontWeight="bold">05. POWER EPS</text>
              <text x="12" y="44" fill="#F2F4F5" fontSize="13" fontWeight="bold">{res.powerGenerationKw.toFixed(1)} kW</text>
              <text x="12" y="60" fill="#8899A6" fontSize="9">Battery: {res.batteryStateOfChargePercent.toFixed(0)}% ({res.batteryStorageKwh.toFixed(0)} kWh)</text>
              <text x="12" y="73" fill="#8899A6" fontSize="8">Solar: {solar ? solar.condition.toFixed(0) : 98}% · React: {reactor ? reactor.condition.toFixed(0) : 99}%</text>
              <circle cx="135" cy="20" r="4" fill={isPowerLow ? '#E05252' : '#45B77A'} />
            </g>

            {/* Status Tooltip in SVG footer */}
            <text x="40" y="308" fill="#8899A6" fontSize="10">
              {hoveredNode
                ? `INTERACTIVE SCHEMATIC NODE: ${hoveredNode} SYSTEM · CLICK TO INSPECT TELEMETRY`
                : 'INTERACTIVE ECLSS/EPS SCHEMATIC · CLICK ANY NODE TO EXPAND SYSTEM DETAILS'}
            </text>
          </svg>
        </div>

        {/* Quick Schematic Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-offwhite/60">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-telemetry-cyan" />
              Oxygen Cryo-Supply Loop
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-nominal-green" />
              Closed Water Reclamation Loop
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning-amber" />
              CO₂ Removal & Electrical Bus
            </span>
          </div>

          <span className="text-telemetry-cyan flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            CLOSED-LOOP AUTONOMOUS REGULATION NOMINAL
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
