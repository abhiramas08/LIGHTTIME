/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Configuration & Setup Panel
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Flame,
  Radio,
  Clock,
  Battery,
  AlertTriangle,
  Play,
  Sparkles,
} from 'lucide-react';
import { EMERGENCY_SCENARIOS } from '@/data/emergencies/emergencyScenarios';
import {
  CREW_CONDITION_PRESETS,
  HABITAT_RESOURCES_PRESETS,
  COMMUNICATION_PRESETS,
} from '@/simulation/engine/consequenceEngine';
import {
  CrewConditionPresetId,
  HabitatResourcesPresetId,
  CommunicationConditionPresetId,
} from '@/simulation/models/consequenceLab';
import { useConsequenceLabStore } from '@/store/useConsequenceLabStore';

export const LabConfigPanel: React.FC = () => {
  const { config, updateConfig, initializeRuns } = useConsequenceLabStore();

  const handleApplyPreset = (presetA: CommunicationConditionPresetId, presetB: CommunicationConditionPresetId) => {
    updateConfig({
      commConditionAId: presetA,
      commConditionBId: presetB,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card withBracket>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Sparkles className="h-4 w-4 text-telemetry-cyan" />
              CONSEQUENCE LABORATORY SETUP PROTOCOL
            </CardTitle>
            <Badge variant="telemetry">EXPERIMENT DESIGN MODE</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-xs font-mono text-offwhite/80 space-y-2">
          <p>
            Configure two parallel mission timelines that fork from an identical initial MissionState snapshot.
            All physical variables—crew biometrics, consumable inventories, equipment degradation, and simulation rules—remain strictly identical.
          </p>
          <p className="text-telemetry-cyan">
            Change only communication conditions between Run A and Run B to observe how speed-of-light delays and signal blackouts force divergent command pathways and mission outcomes.
          </p>
        </CardContent>
      </Card>

      {/* 1. Emergency Scenario Selection */}
      <Card withBracket>
        <CardHeader>
          <CardTitle>
            <Flame className="h-4 w-4 text-warning-amber" />
            1. SELECT EMERGENCY CONTINGENCY SCENARIO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMERGENCY_SCENARIOS.map((scen) => {
              const isSelected = config.scenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => updateConfig({ scenarioId: scen.id })}
                  className={`p-3.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-telemetry-cyan bg-panel-blue/30 shadow-sm shadow-telemetry-cyan/20'
                      : 'border-panel-blue/40 bg-space-surface/60 hover:border-panel-blue hover:bg-space-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-offwhite">
                      {scen.shortTitle}
                    </span>
                    <Badge variant={scen.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                      {scen.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-offwhite/70 line-clamp-2 mb-2">
                    {scen.triggerConditions.description}
                  </p>
                  <div className="text-[10px] font-mono text-offwhite/50 flex justify-between border-t border-panel-blue/30 pt-1.5">
                    <span>Deadline: {Math.round(scen.responseDeadlineSeconds / 60)}m</span>
                    <span className="text-telemetry-cyan">{scen.difficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Mission Starting Day & Crew Condition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Starting Day */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Clock className="h-4 w-4 text-telemetry-cyan" />
              2. MISSION STARTING DAY (SOL)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-offwhite/70">Selected Mission Sol:</span>
              <span className="text-telemetry-cyan font-bold text-sm">
                Day {config.startingDay.toString().padStart(2, '0')} (MET: {((config.startingDay - 1) * 24).toFixed(0)}h)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 7, 14, 21, 28].map((day) => (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={config.startingDay === day ? 'primary' : 'outline'}
                  onClick={() => updateConfig({ startingDay: day })}
                  className="font-mono text-xs"
                >
                  Day {day}
                </Button>
              ))}
            </div>
            <p className="text-[11px] font-mono text-offwhite/60">
              Late-mission emergencies (Sol 21+) compound risks due to accumulated equipment wear and reduced consumable safety reserves.
            </p>
          </CardContent>
        </Card>

        {/* Crew Condition */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning-amber" />
              3. CREW PHYSIOLOGICAL CONDITION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(CREW_CONDITION_PRESETS).map((preset) => {
                const isSelected = config.crewConditionId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => updateConfig({ crewConditionId: preset.id as CrewConditionPresetId })}
                    className={`p-2.5 rounded border cursor-pointer font-mono text-xs transition-all ${
                      isSelected
                        ? 'border-telemetry-cyan bg-panel-blue/30'
                        : 'border-panel-blue/40 bg-space-surface/50 hover:border-panel-blue'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-offwhite">{preset.label}</span>
                      <span className={`text-[10px] ${preset.fatigueIndex > 60 ? 'text-critical-red' : 'text-nominal-green'}`}>
                        Fatigue: {preset.fatigueIndex}%
                      </span>
                    </div>
                    <p className="text-[10px] text-offwhite/60 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Habitat Initial Resources */}
      <Card withBracket>
        <CardHeader>
          <CardTitle>
            <Battery className="h-4 w-4 text-nominal-green" />
            4. INITIAL HABITAT RESOURCE RESERVES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.values(HABITAT_RESOURCES_PRESETS).map((preset) => {
              const isSelected = config.initialResourcesId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => updateConfig({ initialResourcesId: preset.id as HabitatResourcesPresetId })}
                  className={`p-3 rounded border cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'border-telemetry-cyan bg-panel-blue/30'
                      : 'border-panel-blue/40 bg-space-surface/50 hover:border-panel-blue'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-offwhite">{preset.label}</span>
                    <Badge variant={preset.id === 'CRITICAL_50' ? 'critical' : preset.id === 'STRAINED_75' ? 'warning' : 'nominal'}>
                      {preset.resourceSecurityIndex}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-[11px] text-offwhite/70 border-t border-panel-blue/30 pt-1.5">
                    <div className="flex justify-between">
                      <span>Oxygen Inventory:</span>
                      <span className="text-telemetry-cyan">{preset.oxygenInventoryKg.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery Storage:</span>
                      <span className="text-telemetry-cyan">{preset.batteryStorageKwh.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water Storage:</span>
                      <span className="text-telemetry-cyan">{preset.waterInventoryLiters.toFixed(1)} L</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Comparative Communication Conditions */}
      <Card withBracket>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Radio className="h-4 w-4 text-telemetry-cyan" />
              5. COMPARATIVE COMMUNICATION CONDITIONS (RUN A vs RUN B)
            </CardTitle>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-[10px] h-7 px-2"
                onClick={() => handleApplyPreset('REALTIME_EARTH_LINK', 'OCCULTATION_BLACKOUT')}
              >
                Preset: Uplink vs Blackout
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-[10px] h-7 px-2"
                onClick={() => handleApplyPreset('SPEED_OF_LIGHT_DELAY', 'HIGH_LATENCY_RELAY')}
              >
                Preset: 1.3s vs 45s Delay
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condition A */}
            <div className="space-y-3 p-3.5 rounded border border-telemetry-cyan/40 bg-space-surface/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-telemetry-cyan">
                  RUN A: COMMUNICATION CONDITION
                </span>
                <Badge variant="telemetry">TIMELINE A</Badge>
              </div>
              <div className="space-y-2">
                {Object.values(COMMUNICATION_PRESETS).map((preset) => {
                  const isSelected = config.commConditionAId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => updateConfig({ commConditionAId: preset.id as CommunicationConditionPresetId })}
                      className={`p-2.5 rounded border cursor-pointer font-mono text-xs transition-all ${
                        isSelected
                          ? 'border-telemetry-cyan bg-panel-blue/40 text-offwhite'
                          : 'border-panel-blue/30 bg-space-surface/40 hover:border-panel-blue/60 text-offwhite/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{preset.shortLabel}</span>
                        <span className="text-[10px] text-telemetry-cyan">
                          Delay: {preset.delaySeconds}s | {preset.availabilityPercent}%
                        </span>
                      </div>
                      <p className="text-[10px] text-offwhite/60">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Condition B */}
            <div className="space-y-3 p-3.5 rounded border border-critical-red/40 bg-space-surface/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-critical-red">
                  RUN B: COMMUNICATION CONDITION
                </span>
                <Badge variant="critical">TIMELINE B</Badge>
              </div>
              <div className="space-y-2">
                {Object.values(COMMUNICATION_PRESETS).map((preset) => {
                  const isSelected = config.commConditionBId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => updateConfig({ commConditionBId: preset.id as CommunicationConditionPresetId })}
                      className={`p-2.5 rounded border cursor-pointer font-mono text-xs transition-all ${
                        isSelected
                          ? 'border-critical-red bg-critical-red/10 text-offwhite'
                          : 'border-panel-blue/30 bg-space-surface/40 hover:border-panel-blue/60 text-offwhite/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{preset.shortLabel}</span>
                        <span className="text-[10px] text-critical-red">
                          Delay: {preset.delaySeconds}s | {preset.availabilityPercent}%
                        </span>
                      </div>
                      <p className="text-[10px] text-offwhite/60">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Experiment Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          variant="primary"
          onClick={initializeRuns}
          className="gap-2 font-mono text-sm shadow-md shadow-telemetry-cyan/20"
        >
          <Play className="h-4 w-4" />
          INITIALIZE DUAL EXPERIMENTAL RUNS
        </Button>
      </div>
    </div>
  );
};
