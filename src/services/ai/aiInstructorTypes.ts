/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * AI Mission Instructor – Type Definitions & Contracts
 *
 * Strict Architectural Safeguard:
 * The AI Mission Instructor is strictly READ-ONLY. It never mutates or dispatches
 * commands to MissionState, resources, simulation time, crew conditions, or emergency outcomes.
 */

import { MissionEventRecord } from '@/simulation/models/missionState';

export type InstructorFeatureMode =
  | 'ASK_INSTRUCTOR'
  | 'EXPLAIN_EVENT'
  | 'EXPLAIN_WARNING'
  | 'POST_MISSION_FEEDBACK';

export type InstructorQueryIntent =
  | 'EXPLAIN_RESOURCES'
  | 'EXPLAIN_SYSTEM_FAILURE'
  | 'EXPLAIN_CREW_FATIGUE'
  | 'EXPLAIN_EMERGENCY_OUTCOME'
  | 'EXPLAIN_COMMS_DELAY'
  | 'EXPLAIN_EVENT'
  | 'EXPLAIN_WARNING'
  | 'DEBRIEF_FEEDBACK'
  | 'DECISION_ANALYSIS'
  | 'GENERAL_QNA';

export interface ScientificReferenceSnippet {
  id: string;
  name: string;
  organization: string;
  sourceUrl: string;
  nature: 'LIVE_OBSERVATION' | 'PUBLISHED_RESEARCH' | 'EDUCATIONAL_ASSUMPTION';
  citation: string;
}

export interface EducationalAssumptionSnippet {
  id: string;
  name: string;
  subsystem: string;
  valueOrFormula: string;
  unit: string;
  explanation: string;
  limitations: string;
  classification: string;
  educationalNote?: string;
}

export interface TargetWarningInfo {
  warningId: string;
  subsystem: string;
  severity: 'WARNING' | 'CRITICAL' | 'CAUTION';
  headline: string;
  currentValue?: string | number;
  thresholdValue?: string | number;
  details: string;
}

/**
 * Structured Information Payload passed to the AI Mission Instructor:
 * 1. Current mission state
 * 2. Crew condition
 * 3. Habitat resources
 * 4. Active emergency
 * 5. Recent mission events
 * 6. Relevant scientific references
 * 7. Documented educational assumptions
 */
export interface InstructorContextPayload {
  mode: InstructorFeatureMode;
  userQuestion?: string;
  targetEvent?: MissionEventRecord;
  targetWarning?: TargetWarningInfo;

  missionState: {
    missionId: string;
    missionDay: number;
    elapsedHours: number;
    missionStatus: string;
    missionPhase: string;
    missionCompletionPercent: number;
    speedMultiplier: number;
  };

  crewCondition: Array<{
    astronautId: string;
    name: string;
    role: string;
    availability: string;
    heartRateBpm: number;
    bloodOxygenPercent: number;
    bloodPressureSystolicMmHg: number;
    bloodPressureDiastolicMmHg: number;
    cumulativeRadiationDoseMsv: number;
    sleepHours: number;
    fatigueIndex: number;
    stressIndex: number;
    workloadIndex: number;
    nutritionScore: number;
  }>;

  habitatResources: {
    oxygenInventoryKg: number;
    oxygenConsumptionRateKgPerHour: number;
    oxygenHoursRemaining: number;
    cabinPressureKpa: number;
    co2PartialPressureKpa: number;
    co2RemovalCapacityKgPerHour: number;
    co2Status: string;
    waterInventoryLiters: number;
    waterRecoveryRatePercent: number;
    waterHoursRemaining: number;
    powerGenerationKw: number;
    powerDemandKw: number;
    batteryStorageKwh: number;
    batteryStateOfChargePercent: number;
    batteryHoursRemaining: number;
    resourceSecurityIndex: number;
    eclssEfficiencyScore: number;
    equipmentConditionSummary: Array<{
      id: string;
      name: string;
      condition: number;
      status: string;
      maintenanceRequired: boolean;
    }>;
  };

  activeEmergency: {
    activeScenario: string | null;
    severity: string;
    remainingResponseTimeSeconds: number | null;
    responseActions: Array<{
      actionId: string;
      description: string;
      status: string;
      authorizedBy: 'GROUND' | 'CREW_AUTONOMY';
    }>;
  } | null;

  recentEvents: Array<{
    eventId: string;
    timestampHours: number;
    timeFormatted: string;
    category: string;
    eventType?: string;
    severity: string;
    title: string;
    details: string;
    trigger?: string;
    relatedUserAction?: string;
    educationalExplanation?: string;
  }>;

  relevantScientificReferences: ScientificReferenceSnippet[];

  documentedEducationalAssumptions: EducationalAssumptionSnippet[];
}

export interface InstructorTelemetrySnapshot {
  missionDay: number;
  elapsedHours: number;
  missionStatus: string;
  oxygenKg: number;
  oxygenHoursRemaining: number;
  co2ScrubbingCapacityKgPerHour: number;
  co2Status: string;
  waterLiters: number;
  waterClosurePercent: number;
  powerGenKw: number;
  powerDemandKw: number;
  batterySocPercent: number;
  batteryHoursRemaining: number;
  crewSummary: Array<{
    name: string;
    role: string;
    fatigue: number;
    stress: number;
    status: string;
    sleepHours: number;
  }>;
  activeEmergencies: Array<{
    id: string;
    title: string;
    severity: string;
  }>;
  recentEvents: Array<{
    time: string;
    type: string;
    description: string;
  }>;
  commsStatus: string;
  oneWayLightTimeSec: number;
  lunarSunlightPercent: number;
}

export interface InstructorEngineStatus {
  mode: 'LOCAL_KNOWLEDGE_ENGINE' | 'SERVER_AI_PROXY' | 'UNAVAILABLE';
  isConfigured: boolean;
  rateLimitRemaining: number;
  maxQueriesPerHour: number;
  statusMessage: string;
  endpointUrl: string;
}

export interface InstructorAnalysisResponse {
  answer: string;
  educationalTakeaways: string[];
  relatedFlightRules: string[];
  suggestedFollowUps: string[];
  scientificReferencesUsed?: ScientificReferenceSnippet[];
  educationalAssumptionsUsed?: EducationalAssumptionSnippet[];
  epistemologicalLimitations?: string;
  sourceMode: 'LOCAL_KNOWLEDGE_ENGINE' | 'SERVER_AI_PROXY';
}

export interface InstructorMessage {
  id: string;
  sender: 'USER' | 'INSTRUCTOR';
  timestamp: string;
  content: string;
  intent?: InstructorQueryIntent;
  mode?: InstructorFeatureMode;
  educationalTakeaways?: string[];
  relatedFlightRules?: string[];
  suggestedFollowUps?: string[];
  scientificReferencesUsed?: ScientificReferenceSnippet[];
  educationalAssumptionsUsed?: EducationalAssumptionSnippet[];
  epistemologicalLimitations?: string;
}
