/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Data Models & Types
 *
 * Defines the configuration, run states, outcome metrics, and comparison
 * models for the comparative mission consequence experiment.
 */

import { MissionState, AstronautAvailability } from './missionState';
import { MissionActionRecord, MissionEventRecord } from './missionState';
import { PlayableEmergencyScenario } from '@/data/emergencies/emergencyScenarios';

// ============================================================================
// 1. Configuration & Presets
// ============================================================================

export type CrewConditionPresetId =
  | 'NOMINAL_RESTED'
  | 'FATIGUED'
  | 'HIGH_STRESS'
  | 'EXHAUSTED_DEPLETED';

export interface CrewConditionPreset {
  id: CrewConditionPresetId;
  label: string;
  description: string;
  sleepHours: number;
  exerciseMinutes: number;
  nutritionScore: number;
  fatigueIndex: number;
  stressIndex: number;
  workloadIndex: number;
  availability: AstronautAvailability;
}

export type HabitatResourcesPresetId =
  | 'NOMINAL_100'
  | 'STRAINED_75'
  | 'CRITICAL_50';

export interface HabitatResourcesPreset {
  id: HabitatResourcesPresetId;
  label: string;
  description: string;
  oxygenInventoryKg: number;
  waterInventoryLiters: number;
  foodInventoryKcal: number;
  batteryStorageKwh: number;
  batteryStateOfChargePercent: number;
  resourceSecurityIndex: number;
}

export type CommunicationConditionPresetId =
  | 'REALTIME_EARTH_LINK'
  | 'SPEED_OF_LIGHT_DELAY'
  | 'HIGH_LATENCY_RELAY'
  | 'OCCULTATION_BLACKOUT'
  | 'DSN_SEVERED';

export interface CommunicationConditionPreset {
  id: CommunicationConditionPresetId;
  label: string;
  shortLabel: string;
  description: string;
  status: 'CONNECTED' | 'DEGRADED' | 'INTERMITTENT' | 'LOSS_OF_SIGNAL_OCCULTATION' | 'DISCONNECTED';
  delaySeconds: number;
  availabilityPercent: number;
  bandwidthDisplay: string;
  groundAuthorityLevel: 'FULL' | 'ADVISORY' | 'RESTRICTED' | 'BLOCKED';
}

export interface ConsequenceLabConfig {
  scenarioId: string;
  startingDay: number;
  crewConditionId: CrewConditionPresetId;
  initialResourcesId: HabitatResourcesPresetId;
  commConditionAId: CommunicationConditionPresetId;
  commConditionBId: CommunicationConditionPresetId;
}

// ============================================================================
// 2. Outcome Metrics & Run State
// ============================================================================

export interface RunOutcomeMetrics {
  crewSafetyScore: number; // [0 - 100], higher is safer
  averageCrewFatigue: number;
  averageCrewStress: number;
  averageCrewWorkload: number;
  missionCompletionStatus: 'ACTIVE' | 'RESOLVED' | 'ABORTED' | 'FAILED';
  oxygenUsedKg: number;
  waterUsedLiters: number;
  powerConsumedKwh: number;
  timeToResolveHours: number;
  timeToResolveMinutes: number;
  averageEquipmentCondition: number;
  finalReserves: {
    oxygenKg: number;
    waterLiters: number;
    batteryKwh: number;
    foodKcal: number;
  };
  totalActionsAttempted: number;
  actionsCompleted: number;
  actionsRejected: number;
}

export interface LaboratoryRunState {
  runId: 'RUN_A' | 'RUN_B';
  name: string;
  commPreset: CommunicationConditionPreset;
  initialState: MissionState; // Exact immutable snapshot at experiment start
  currentState: MissionState;
  isEmergencyActive: boolean;
  isResolved: boolean;
  scenarioStartTimeHours: number;
  actionsHistory: MissionActionRecord[];
  eventsHistory: MissionEventRecord[];
  outcomeMetrics: RunOutcomeMetrics;
  statusMessage?: string;
}

// ============================================================================
// 3. Comparative Synthesis & Educational Analysis
// ============================================================================

export interface ComparativeAnalysisReport {
  scenario: PlayableEmergencyScenario;
  runA: LaboratoryRunState;
  runB: LaboratoryRunState;
  deltas: {
    crewSafetyDelta: number; // Run A - Run B (positive means A is safer)
    fatigueDelta: number;
    stressDelta: number;
    oxygenUsedDelta: number; // Run A - Run B (positive means A used more)
    waterUsedDelta: number;
    powerConsumedDelta: number;
    timeToResolveDeltaHours: number;
    equipmentConditionDelta: number;
  };
  educationalTakeaways: {
    headline: string;
    speedOfLightImpact: string;
    autonomyTradeoff: string;
    flightRulesApplied: string[];
    pedagogicalSummary: string[];
  };
}
