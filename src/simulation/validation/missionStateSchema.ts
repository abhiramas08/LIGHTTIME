import { z } from 'zod';

// ============================================================================
// 1. Mission Information Schema
// ============================================================================

export const missionOperationalStatusSchema = z.enum([
  'PLANNING',
  'ACTIVE',
  'PAUSED',
  'ABORTED',
  'COMPLETED',
]);

export const missionInformationSchema = z.object({
  missionId: z.string().min(1, 'Mission ID required'),
  missionName: z.string().min(1, 'Mission Name required'),
  missionDay: z.number().int().min(1).max(30),
  elapsedHours: z.number().min(0).max(720),
  missionDuration: z.number().int().min(1).max(60),
  missionStatus: missionOperationalStatusSchema,
  simulationRulesVersion: z.string().min(1),
});

// ============================================================================
// 2. Astronaut Crew Schema
// ============================================================================

export const astronautRoleSchema = z.enum([
  'Commander',
  'Lunar Module Pilot',
  'Science Specialist',
  'Medical Specialist',
]);

export const astronautAvailabilitySchema = z.enum([
  'AVAILABLE',
  'ON_EVA',
  'RESTING',
  'MEDICAL_RESTRICTED',
  'SLEEPING',
]);

export const astronautBiometricsSchema = z.object({
  heartRateBpm: z.number().min(30).max(220),
  respirationRateBpm: z.number().min(6).max(50),
  bloodOxygenPercent: z.number().min(50).max(100),
  coreTemperatureCelsius: z.number().min(32.0).max(42.0),
  bloodPressureSystolicMmHg: z.number().min(70).max(220),
  bloodPressureDiastolicMmHg: z.number().min(40).max(140),
  cumulativeRadiationDoseMsv: z.number().min(0.0).max(500.0),
});

export const astronautRecordSchema = z.object({
  astronautId: z.string().min(1),
  name: z.string().min(1),
  callsign: z.string().min(1),
  role: astronautRoleSchema,
  sleepHours: z.number().min(0).max(24),
  exerciseMinutes: z.number().min(0).max(360),
  nutritionScore: z.number().min(0).max(100),
  fatigueIndex: z.number().min(0).max(100),
  stressIndex: z.number().min(0).max(100),
  workloadIndex: z.number().min(0).max(100),
  availability: astronautAvailabilitySchema,
  assignedTasks: z.array(z.string()),
  biometrics: astronautBiometricsSchema,
});

/** Exactly four astronaut records must be present in a valid mission state */
export const crewComplementSchema = z
  .array(astronautRecordSchema)
  .length(4, 'Expedition crew complement must contain exactly four astronauts');

// ============================================================================
// 3. Habitat Resources Schema
// ============================================================================

export const habitatResourcesSchema = z.object({
  oxygenInventoryKg: z.number().min(0).max(1000),
  oxygenConsumptionRateKgPerHour: z.number().min(0).max(5.0),
  co2RemovalCapacityKgPerHour: z.number().min(0).max(10.0),
  waterInventoryLiters: z.number().min(0).max(5000),
  waterRecoveryRatePercent: z.number().min(0).max(100),
  foodInventoryKcal: z.number().min(0).max(500000),
  foodConsumptionKcalPerHour: z.number().min(0).max(2000),
  powerGenerationKw: z.number().min(0).max(250),
  batteryStorageKwh: z.number().min(0).max(500),
  batteryStateOfChargePercent: z.number().min(0).max(100),
  powerDemandKw: z.number().min(0).max(150),
  resourceSecurityIndex: z.number().min(0).max(100),
  eclssEfficiencyScore: z.number().min(0).max(100),
});

// ============================================================================
// 4. Equipment Schema
// ============================================================================

export const equipmentOperationalStatusSchema = z.enum([
  'OPERATIONAL',
  'DEGRADED',
  'STANDBY',
  'MAINTENANCE_REQUIRED',
  'FAILED',
]);

export const equipmentRecordSchema = z.object({
  equipmentId: z.string().min(1),
  equipmentName: z.string().min(1),
  condition: z.number().min(0).max(100),
  status: equipmentOperationalStatusSchema,
  maintenanceRequired: z.boolean(),
  powerRequirementKw: z.number().min(0).max(50.0),
});

// ============================================================================
// 5. Environmental State Schema
// ============================================================================

export const terrainDustRiskSchema = z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);

export const terrainInformationSchema = z.object({
  siteName: z.string().min(1),
  latitudeDeg: z.number().min(-90.0).max(90.0),
  longitudeDeg: z.number().min(-180.0).max(180.0),
  elevationMeters: z.number().min(-10000.0).max(10000.0),
  slopeDeg: z.number().min(0.0).max(90.0),
  dustRisk: terrainDustRiskSchema,
});

export const environmentalStateSchema = z.object({
  lunarIlluminationPercent: z.number().min(0.0).max(100.0),
  environmentalTemperatureCelsius: z.number().min(-250.0).max(150.0),
  educationalRadiationHazardIndex: z.number().min(0.0).max(100.0),
  terrainInformation: terrainInformationSchema,
  solarPowerAvailabilityPercent: z.number().min(0.0).max(100.0),
});

// ============================================================================
// 6. Communications Schema
// ============================================================================

export const communicationLinkStatusSchema = z.enum([
  'CONNECTED',
  'DEGRADED',
  'INTERMITTENT',
  'LOSS_OF_SIGNAL_OCCULTATION',
  'DISCONNECTED',
]);

export const dsnGroundStationSchema = z.enum(['Goldstone', 'Madrid', 'Canberra']);

export const communicationsStateSchema = z.object({
  status: communicationLinkStatusSchema,
  delaySeconds: z.number().min(1.21).max(1.36),
  availabilityPercent: z.number().min(0.0).max(100.0),
  dsnStation: dsnGroundStationSchema,
});

// ============================================================================
// 7. Emergency Schema
// ============================================================================

export const emergencySeveritySchema = z.enum([
  'NONE',
  'ADVISORY',
  'CAUTION',
  'WARNING',
  'CRITICAL',
]);

export const contingencyActionStatusSchema = z.enum([
  'AVAILABLE',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
]);

export const contingencyActionSchema = z.object({
  actionId: z.string().min(1),
  description: z.string().min(1),
  status: contingencyActionStatusSchema,
  authorizedBy: z.enum(['GROUND', 'CREW_AUTONOMY']),
});

export const emergencyStateSchema = z.object({
  activeScenario: z.string().nullable(),
  severity: emergencySeveritySchema,
  remainingResponseTimeSeconds: z.number().min(0).max(86400).nullable(),
  responseActions: z.array(contingencyActionSchema),
});

// ============================================================================
// 8. Mission Records Schema
// ============================================================================

export const missionEventRecordSchema = z.object({
  eventId: z.string().min(1),
  timestampHours: z.number().min(0.0).max(720.0),
  category: z.string().min(1),
  title: z.string().min(1),
  details: z.string(),
  severity: z.enum(['INFO', 'CAUTION', 'WARNING', 'CRITICAL', 'INFORMATIONAL', 'NOMINAL']),
  simulationTime: z.string().optional(),
  affectedSystem: z.enum(['CREW', 'HABITAT', 'EMERGENCY', 'COMMUNICATIONS', 'MISSION']).optional(),
  eventType: z.string().optional(),
  previousValue: z.string().nullable().optional(),
  newValue: z.string().nullable().optional(),
  trigger: z.string().optional(),
  relatedUserAction: z.string().nullable().optional(),
  educationalExplanation: z.string().optional(),
  acknowledged: z.boolean().optional(),
});

export const missionActionRecordSchema = z.object({
  actionId: z.string().min(1),
  timestampHours: z.number().min(0.0).max(720.0),
  command: z.string().min(1),
  subsystem: z.string().min(1),
  initiatedBy: z.enum(['GROUND', 'CREW']),
  outcome: z.enum(['SUCCESS', 'REJECTED', 'FAILED']),
});

export const missionResourceDataPointSchema = z.object({
  timestampHours: z.number().min(0.0).max(720.0),
  oxygenKg: z.number().min(0.0).max(1000.0),
  waterLiters: z.number().min(0.0).max(5000.0),
  batteryKwh: z.number().min(0.0).max(500.0),
  powerKw: z.number().min(0.0).max(250.0),
  foodKcal: z.number().min(0.0).max(500000.0).optional(),
});

export const crewWellbeingDataPointSchema = z.object({
  timestampHours: z.number().min(0.0).max(720.0),
  astronautId: z.string().min(1),
  fatigueIndex: z.number().min(0.0).max(100.0),
  stressIndex: z.number().min(0.0).max(100.0),
  workloadIndex: z.number().min(0.0).max(100.0),
});

export const missionRecordsSchema = z.object({
  eventHistory: z.array(missionEventRecordSchema),
  actionHistory: z.array(missionActionRecordSchema),
  resourceHistory: z.array(missionResourceDataPointSchema),
  crewWellbeingHistory: z.array(crewWellbeingDataPointSchema),
});

// ============================================================================
// CANONICAL MISSION STATE SCHEMA
// ============================================================================

export const missionStateSchema = z.object({
  mission: missionInformationSchema,
  crew: crewComplementSchema,
  habitatResources: habitatResourcesSchema,
  equipment: z.array(equipmentRecordSchema),
  environment: environmentalStateSchema,
  communications: communicationsStateSchema,
  emergency: emergencyStateSchema,
  records: missionRecordsSchema,
});

export type ValidatedMissionState = z.infer<typeof missionStateSchema>;
