/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief & Learning Report Data Models
 */

import {
  MissionEventRecord,
  MissionActionRecord,
  MissionResourceDataPoint,
  CrewWellbeingDataPoint,
} from './missionState';
import { MissionOutcome } from '@/simulation/engine/core';

export type MissionGrade = 'EXEMPLARY' | 'PROFICIENT' | 'MARGINAL' | 'FAILED';

export type ObjectiveCategory =
  | 'SURVIVABILITY'
  | 'DURATION'
  | 'LIFE_SUPPORT'
  | 'POWER'
  | 'HUMAN_FACTORS'
  | 'CONTINGENCY';

export interface MissionObjectiveEvaluation {
  id: string;
  title: string;
  category: ObjectiveCategory;
  targetCriteria: string;
  actualResult: string;
  achieved: boolean;
  impactAssessment: string;
}

export interface CrewDebriefRecord {
  astronautId: string;
  name: string;
  callsign: string;
  role: string;
  finalFatigueIndex: number;
  finalStressIndex: number;
  finalWorkloadIndex: number;
  sleepHoursPerSol: number;
  exerciseMinutesPerSol: number;
  nutritionScore: number;
  cumulativeRadiationDoseMsv: number;
  readinessRating: 'OPTIMAL' | 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
  medicalFlightNotes: string;
}

export interface ResourceUsageSummary {
  // Oxygen
  initialOxygenKg: number;
  finalOxygenKg: number;
  consumedOxygenKg: number;
  averageOxygenConsumptionKgPerHour: number;
  oxygenReserveMarginDays: number;

  // Water
  initialWaterLiters: number;
  finalWaterLiters: number;
  consumedWaterLiters: number;
  waterRecoveryEfficiencyPercent: number;

  // Electrical Power
  batteryCapacityKwh: number;
  finalBatteryStorageKwh: number;
  finalBatteryStateOfChargePercent: number;
  powerGenerationKw: number;
  totalPowerConsumedKwh: number;

  // Food
  initialFoodKcal: number;
  finalFoodKcal: number;
  consumedFoodKcal: number;

  // Composite Rating
  resourceEfficiencyScore: number;
}

export interface EquipmentDebriefRecord {
  equipmentId: string;
  name: string;
  initialCondition: number;
  finalCondition: number;
  wearDeltaPercent: number;
  status: string;
  maintenanceRequired: boolean;
  maintenanceActionsCompleted: number;
}

export interface EmergencyDecisionRecord {
  scenarioId: string;
  scenarioTitle: string;
  severity: string;
  resolved: boolean;
  timeToResolveHours: number;
  actionsExecuted: {
    actionId: string;
    command: string;
    timestampHours: number;
    initiatedBy: 'GROUND' | 'CREW';
    outcome: 'SUCCESS' | 'REJECTED' | 'FAILED';
  }[];
  actionsInterlockedCount: number;
  consequenceSummary: string;
}

export interface DecisionAnalysis {
  whatWentWell: string[];
  whatCreatedRisk: string[];
  decisionsImprovingOutcome: string[];
  decisionsReducingResources: string[];
  whatCouldBeDoneDifferently: string[];
}

export interface MissionDebriefReport {
  // 1. Mission Overview
  missionId: string;
  missionName: string;
  commanderCallsign: string;
  missionDurationDays: number;
  solsCompleted: number;
  elapsedHours: number;
  missionStatus: string;
  simulationRulesVersion: string;
  generatedAtTimestamp: string;

  // 2. Success Determination & Scores
  outcome: MissionOutcome;

  // 3. Objectives
  objectivesAchieved: MissionObjectiveEvaluation[];
  objectivesMissed: MissionObjectiveEvaluation[];

  // 4. Summaries
  crewWellbeingSummary: CrewDebriefRecord[];
  aggregateCrewHealthScore: number;

  resourceUsageSummary: ResourceUsageSummary;
  equipmentSummary: EquipmentDebriefRecord[];

  // 5. Contingencies & Critical Events
  emergencyDecisions: EmergencyDecisionRecord[];
  criticalEvents: MissionEventRecord[];
  totalDirectivesExecuted: number;

  // 6. Qualitative Decision Analysis
  decisionAnalysis: DecisionAnalysis;

  // 7. Important Educational Lessons
  importantLessons: string[];

  // 8. Historical Time-Series Snapshots for Charts
  resourceHistory: MissionResourceDataPoint[];
  crewWellbeingHistory: CrewWellbeingDataPoint[];
  actionHistory: MissionActionRecord[];
  eventHistory: MissionEventRecord[];
}
