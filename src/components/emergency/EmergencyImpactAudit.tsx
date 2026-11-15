import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Wind, Zap, Shield, HeartPulse, Droplets, MapPin, Gauge } from 'lucide-react';
import { MissionState } from '@/simulation/models/missionState';

interface EmergencyImpactAuditProps {
  missionState: MissionState;
}

export const EmergencyImpactAudit: React.FC<EmergencyImpactAuditProps> = ({
  missionState,
}) => {
  const resources = missionState.habitatResources;
  const env = missionState.environment;
  const crew = missionState.crew;

  const isSheltered = crew.some((c) => c.assignedTasks.includes('STORM_SHELTER_CONFINEMENT'));
  const isHighRadiation = env.educationalRadiationHazardIndex > 40.0;
  const isO2Leaking = resources.oxygenConsumptionRateKgPerHour > 0.30;
  const isPowerDeficit = resources.powerGenerationKw < resources.powerDemandKw;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
      {/* 1. Habitat Resource Impact Audit */}
      <Card withBracket className="border-panel-blue/50 bg-space-surface/90">
        <CardHeader className="border-b border-panel-blue/30 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
              <Gauge className="h-4 w-4 text-warning-amber" />
              RESOURCE IMPACT & CONSUMABLES AUDIT
            </CardTitle>
            <Badge variant={isO2Leaking || isPowerDeficit ? 'warning' : 'nominal'} className="text-[10px]">
              {isO2Leaking || isPowerDeficit ? 'CONSUMPTION ANOMALY' : 'RESOURCES BALANCED'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Oxygen Reserve */}
          <div className="p-2.5 bg-space-dark/80 border border-panel-blue/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-signal-cyan" />
                Cryogenic Oxygen Reserve:
              </span>
              <span className={`font-bold ${resources.oxygenInventoryKg < 50 ? 'text-critical-red' : 'text-offwhite'}`}>
                {resources.oxygenInventoryKg.toFixed(2)} kg
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-offwhite/60">
              <span>Depletion Rate:</span>
              <span className={isO2Leaking ? 'text-critical-red font-bold animate-pulse' : 'text-nominal-green'}>
                {resources.oxygenConsumptionRateKgPerHour.toFixed(2)} kg/hr {isO2Leaking && '(LEAK ACTIVE)'}
              </span>
            </div>
          </div>

          {/* Power Grid Balance */}
          <div className="p-2.5 bg-space-dark/80 border border-panel-blue/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-offwhite flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-warning-amber" />
                Electrical Power Balance:
              </span>
              <span className="text-offwhite font-bold">
                Gen: {resources.powerGenerationKw.toFixed(1)} kW vs Load: {resources.powerDemandKw.toFixed(1)} kW
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-offwhite/60">
              <span>Battery Storage:</span>
              <span className={resources.batteryStateOfChargePercent < 20 ? 'text-critical-red font-bold' : 'text-nominal-green'}>
                {resources.batteryStorageKwh.toFixed(1)} kWh ({resources.batteryStateOfChargePercent.toFixed(1)}% SoC)
              </span>
            </div>
          </div>

          {/* Atmosphere Scrubbing & Water */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-space-dark/60 border border-panel-blue/20">
              <div className="text-offwhite/50 text-[10px] mb-0.5">CO2 SCRUB CAPACITY</div>
              <div className={`font-bold ${resources.co2RemovalCapacityKgPerHour < 0.1 ? 'text-critical-red' : 'text-offwhite'}`}>
                {resources.co2RemovalCapacityKgPerHour.toFixed(2)} kg/hr
              </div>
            </div>

            <div className="p-2 bg-space-dark/60 border border-panel-blue/20">
              <div className="text-offwhite/50 text-[10px] mb-0.5 flex items-center gap-1">
                <Droplets className="h-3 w-3 text-signal-cyan" />
                POTABLE WATER
              </div>
              <div className="font-bold text-offwhite">
                {resources.waterInventoryLiters.toFixed(1)} L
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Crew Physiological Impact Audit */}
      <Card withBracket className="border-panel-blue/50 bg-space-surface/90">
        <CardHeader className="border-b border-panel-blue/30 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-critical-red" />
              CREW PHYSIOLOGICAL IMPACT AUDIT
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant={isSheltered ? 'nominal' : isHighRadiation ? 'critical' : 'neutral'} className="text-[10px]">
                {isSheltered ? 'STORM SHELTER INGRESS' : isHighRadiation ? 'UNSHIELDED HAZARD' : 'CORE HABITAT'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {/* Habitat Radiation telemetry */}
          <div className="p-2.5 bg-space-dark/80 border border-panel-blue/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${isHighRadiation ? 'text-critical-red' : 'text-signal-cyan'}`} />
              <div>
                <div className="font-bold text-offwhite text-[11px]">Ambient Radiation Hazard Index:</div>
                <div className="text-[10px] text-offwhite/60">
                  {isSheltered ? 'Shielding Attenuation: 92% (Core Storm Shelter)' : 'Direct Habitat Exposure'}
                </div>
              </div>
            </div>
            <div className={`text-sm font-bold ${isHighRadiation ? 'text-critical-red' : 'text-offwhite'}`}>
              {env.educationalRadiationHazardIndex.toFixed(1)} / 100
            </div>
          </div>

          {/* 4 Astronaut Status Rows */}
          <div className="space-y-2">
            {crew.map((astronaut) => {
              const inShelter = astronaut.assignedTasks.includes('STORM_SHELTER_CONFINEMENT');

              return (
                <div
                  key={astronaut.astronautId}
                  className="p-2 bg-space-dark/60 border border-panel-blue/20 flex items-center justify-between text-[11px]"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-offwhite flex items-center gap-1.5">
                      <span>{astronaut.name}</span>
                      <span className="text-[10px] text-signal-cyan font-normal">({astronaut.callsign})</span>
                    </div>
                    <div className="text-[10px] text-offwhite/60 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-warning-amber" />
                      {inShelter ? 'Core Storm Shelter' : 'Peripheral Habitat'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-[9px] text-offwhite/50">STRESS / FATIGUE</div>
                      <div className="font-bold text-offwhite">
                        <span className={astronaut.stressIndex > 60 ? 'text-warning-amber' : ''}>
                          {Math.round(astronaut.stressIndex)}
                        </span>
                        {' / '}
                        <span className={astronaut.fatigueIndex > 60 ? 'text-warning-amber' : ''}>
                          {Math.round(astronaut.fatigueIndex)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-offwhite/50">SPO2 / DOSE</div>
                      <div className="font-bold text-offwhite">
                        <span className={astronaut.biometrics.bloodOxygenPercent < 90 ? 'text-critical-red' : 'text-nominal-green'}>
                          {astronaut.biometrics.bloodOxygenPercent.toFixed(0)}%
                        </span>
                        {' / '}
                        <span>{astronaut.biometrics.cumulativeRadiationDoseMsv.toFixed(1)} mSv</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
