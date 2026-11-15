/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Canonical Mission State Model
 *
 * This file contains the single canonical MissionState interface and sub-models.
 * Every numeric field specifies its unit and valid physical/educational range.
 * Scientific measurements are strictly separated from educational indices.
 */

// ============================================================================
// 1. Mission Information
// ============================================================================

export type MissionOperationalStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ABORTED'
  | 'COMPLETED';

export interface MissionInformation {
  /** Unique mission identifier string (e.g., "LT-EXP30-SHACKLETON") */
  missionId: string;
  /** Human-readable mission name */
  missionName: string;
  /**
   * Current mission sol/day on lunar surface.
   * Unit: Days (Earth 24-hour equivalent calendar days)
   * Valid Range: [1, 30]
   */
  missionDay: number;
  /**
   * Cumulative elapsed mission time.
   * Unit: Hours
   * Valid Range: [0.0, 720.0] (30 days * 24 hours)
   */
  elapsedHours: number;
  /**
   * Planned total expedition duration.
   * Unit: Days
   * Valid Range: [1, 60] (Nominal baseline: 30)
   */
  missionDuration: number;
  /** Operational phase state of the simulation */
  missionStatus: MissionOperationalStatus;
  /** Semantic version string of flight rules and solvers (e.g., "1.0.0-artemis") */
  simulationRulesVersion: string;
}

// ============================================================================
// 2. Astronaut Crew & Human Factors
// ============================================================================

export type AstronautRole =
  | 'Commander'
  | 'Lunar Module Pilot'
  | 'Science Specialist'
  | 'Medical Specialist';

export type AstronautAvailability =
  | 'AVAILABLE'
  | 'ON_EVA'
  | 'RESTING'
  | 'MEDICAL_RESTRICTED'
  | 'SLEEPING';

/**
 * Objective physiological measurements directly derived from biomedical telemetry.
 * All fields represent physical SI/medical measurements.
 */
export interface AstronautBiometrics {
  /** Unit: Beats per Minute (BPM), Valid Range: [30, 220], Nominal: [60, 90] */
  heartRateBpm: number;
  /** Unit: Breaths per Minute, Valid Range: [6, 50], Nominal: [12, 18] */
  respirationRateBpm: number;
  /** Unit: Percent SpO₂ (%), Valid Range: [50.0, 100.0], Nominal: [95.0, 100.0] */
  bloodOxygenPercent: number;
  /** Unit: Degrees Celsius (°C), Valid Range: [32.0, 42.0], Nominal: [36.5, 37.5] */
  coreTemperatureCelsius: number;
  /** Unit: Millimeters of Mercury (mmHg), Valid Range: [70, 220], Nominal: [110, 125] */
  bloodPressureSystolicMmHg: number;
  /** Unit: Millimeters of Mercury (mmHg), Valid Range: [40, 140], Nominal: [70, 85] */
  bloodPressureDiastolicMmHg: number;
  /** Unit: Millisieverts (mSv), Valid Range: [0.0, 500.0], Max 30-Day Limit: 250.0 mSv */
  cumulativeRadiationDoseMsv: number;
}

/**
 * Educational indices computed by the human-factors solver to translate complex
 * physiological stressors into pedagogical scores for students.
 */
export interface AstronautEducationalIndices {
  /**
   * Nutritional and caloric intake balance index.
   * Unit: Educational Score [0-100], Valid Range: [0.0, 100.0], 100 = Optimal
   */
  nutritionScore: number;
  /**
   * Cumulative sleep debt, continuous wakefulness, and circadian rhythm fatigue index.
   * Unit: Educational Index [0-100], Valid Range: [0.0, 100.0], 0 = Rested, 100 = Exhausted
   */
  fatigueIndex: number;
  /**
   * Psychological and situational stress index.
   * Unit: Educational Index [0-100], Valid Range: [0.0, 100.0], 0 = Calm, 100 = Severe Panic
   */
  stressIndex: number;
  /**
   * Current scheduled task intensity and physical strain.
   * Unit: Educational Index [0-100], Valid Range: [0.0, 100.0], 0 = Idle, 100 = Max Strain
   */
  workloadIndex: number;
}

export interface AstronautRecord {
  /** Unique astronaut identifier (e.g., "CREW-01") */
  astronautId: string;
  /** Full name of the astronaut */
  name: string;
  /** Operational radio callsign */
  callsign: string;
  /** Assigned flight role */
  role: AstronautRole;
  /**
   * Total sleep acquired in the current 24-hour cycle.
   * Scientific Measurement | Unit: Hours, Valid Range: [0.0, 24.0]
   */
  sleepHours: number;
  /**
   * Total cardiovascular/resistive countermeasure exercise performed today.
   * Scientific Measurement | Unit: Minutes, Valid Range: [0, 360]
   */
  exerciseMinutes: number;
  /** Educational nutritional adequacy score [0-100] */
  nutritionScore: number;
  /** Educational cognitive and physiological fatigue index [0-100] */
  fatigueIndex: number;
  /** Educational psychological stress index [0-100] */
  stressIndex: number;
  /** Educational physical/cognitive workload index [0-100] */
  workloadIndex: number;
  /** Duty and operational availability state */
  availability: AstronautAvailability;
  /** Array of active task/experiment identifiers assigned to this astronaut */
  assignedTasks: string[];
  /** Objective biometrics telemetry */
  biometrics: AstronautBiometrics;
}

/** Exactly four astronauts constitute a LIGHTTIME lunar surface expedition complement */
export type CrewComplement = [
  AstronautRecord,
  AstronautRecord,
  AstronautRecord,
  AstronautRecord
];

// ============================================================================
// 3. Habitat Resources & Closed-Loop ECLSS
// ============================================================================

export interface HabitatResources {
  // --- Scientific Measurements ---
  /**
   * Usable cryogenic and gaseous oxygen reserves.
   * Unit: Kilograms (kg)
   * Valid Range: [0.0, 1000.0] (Nominal initial: ~300 kg)
   */
  oxygenInventoryKg: number;
  /**
   * Total instantaneous oxygen consumption across all 4 crew members.
   * Unit: Kilograms per Hour (kg/hr)
   * Valid Range: [0.0, 5.0] (Nominal baseline: ~0.14 kg/hr total for 4 crew)
   */
  oxygenConsumptionRateKgPerHour: number;
  /**
   * Active carbon dioxide scrubbing capacity (amine beds + CDRA).
   * Unit: Kilograms of CO₂ per Hour (kg/hr)
   * Valid Range: [0.0, 10.0] (Nominal baseline: ~0.25 kg/hr)
   */
  co2RemovalCapacityKgPerHour: number;
  /**
   * Total potable and hygiene water in habitat tanks.
   * Unit: Liters (L) (or kg)
   * Valid Range: [0.0, 5000.0] (Nominal initial: ~1200 L)
   */
  waterInventoryLiters: number;
  /**
   * Efficiency of catalytic urine processor and atmospheric condensate recovery.
   * Unit: Percent (%)
   * Valid Range: [0.0, 100.0] (Nominal target: 90% - 98%)
   */
  waterRecoveryRatePercent: number;
  /**
   * Shelf-stable metabolic food rations remaining.
   * Unit: Kilocalories (kcal)
   * Valid Range: [0.0, 500000.0] (Nominal initial: ~360,000 kcal for 4 crew * 30 days)
   */
  foodInventoryKcal: number;
  /**
   * Rate of metabolic food intake across habitat.
   * Unit: Kilocalories per Hour (kcal/hr)
   * Valid Range: [0.0, 2000.0] (Nominal: ~500 kcal/hr aggregate)
   */
  foodConsumptionKcalPerHour: number;
  /**
   * Total instantaneous electrical power generated by solar arrays + surface reactor.
   * Unit: Kilowatts (kW)
   * Valid Range: [0.0, 250.0] (Nominal daylight: 45-60 kW; night: 15 kW reactor)
   */
  powerGenerationKw: number;
  /**
   * Total usable energy stored in lithium-ion/regenerative fuel cell banks.
   * Unit: Kilowatt-Hours (kWh)
   * Valid Range: [0.0, 500.0] (Nominal capacity: 200 kWh)
   */
  batteryStorageKwh: number;
  /**
   * Battery state of charge.
   * Unit: Percent (%)
   * Valid Range: [0.0, 100.0]
   */
  batteryStateOfChargePercent: number;
  /**
   * Total habitat electrical load (ECLSS pumps, thermal loop, avionics, lighting).
   * Unit: Kilowatts (kW)
   * Valid Range: [0.0, 150.0] (Nominal baseline: 25-35 kW)
   */
  powerDemandKw: number;

  // --- Educational Resource Indices ---
  /**
   * Synthetic resource security score assessing consumable buffer margins against mission sol.
   * Unit: Educational Score [0-100], Valid Range: [0.0, 100.0], 100 = Fully Secure
   */
  resourceSecurityIndex: number;
  /**
   * Synthetic life support operating efficiency score.
   * Unit: Educational Score [0-100], Valid Range: [0.0, 100.0], 100 = Optimal Loop Closure
   */
  eclssEfficiencyScore: number;
}

// ============================================================================
// 4. Habitat Equipment & Systems
// ============================================================================

export type EquipmentOperationalStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'STANDBY'
  | 'MAINTENANCE_REQUIRED'
  | 'FAILED';

export interface EquipmentRecord {
  /** Unique equipment tag (e.g., "EQ-CDRA-01", "EQ-O2-GEN-02") */
  equipmentId: string;
  /** Descriptive subsystem name */
  equipmentName: string;
  /**
   * Physical wear and mechanical integrity condition.
   * Unit: Educational Index [%], Valid Range: [0.0, 100.0], 100 = Factory New
   */
  condition: number;
  /** Current operating state */
  status: EquipmentOperationalStatus;
  /** Flag indicating immediate maintenance or filter replacement is mandatory */
  maintenanceRequired: boolean;
  /**
   * Electrical load demanded during active operation.
   * Scientific Measurement | Unit: Kilowatts (kW), Valid Range: [0.0, 50.0]
   */
  powerRequirementKw: number;
}

// ============================================================================
// 5. Environment & Lunar Geology
// ============================================================================

export type TerrainDustRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface TerrainInformation {
  /** Site name or geological landmark (e.g., "Shackleton Crater Rim - Ridge B") */
  siteName: string;
  /**
   * Planetographic latitude.
   * Unit: Degrees (°), Valid Range: [-90.0, 90.0] (South Pole: -89.9°)
   */
  latitudeDeg: number;
  /**
   * Planetographic longitude.
   * Unit: Degrees (°), Valid Range: [-180.0, 180.0]
   */
  longitudeDeg: number;
  /**
   * Elevation relative to lunar mean radius (1,737.4 km).
   * Unit: Meters (m), Valid Range: [-10000.0, 10000.0]
   */
  elevationMeters: number;
  /**
   * Local terrain inclination.
   * Unit: Degrees (°), Valid Range: [0.0, 90.0]
   */
  slopeDeg: number;
  /** Electrostatic regolith dust abrasion hazard level */
  dustRisk: TerrainDustRisk;
}

export interface EnvironmentalState {
  /**
   * Visible solar surface illumination.
   * Scientific Measurement | Unit: Percent (%), Valid Range: [0.0, 100.0]
   */
  lunarIlluminationPercent: number;
  /**
   * Ambient exterior lunar surface temperature.
   * Scientific Measurement | Unit: Degrees Celsius (°C), Valid Range: [-250.0, 150.0]
   */
  environmentalTemperatureCelsius: number;
  /**
   * Educational composite radiation hazard index (combining GCR and solar proton flux).
   * Unit: Educational Index [0-100], Valid Range: [0.0, 100.0], 0 = Baseline, 100 = Severe SPE
   */
  educationalRadiationHazardIndex: number;
  /** Geographic and topographical site telemetry */
  terrainInformation: TerrainInformation;
  /**
   * Fractional sunlight unoccluded by crater walls or shadows, available for solar arrays.
   * Scientific Measurement | Unit: Percent (%), Valid Range: [0.0, 100.0]
   */
  solarPowerAvailabilityPercent: number;
}

// ============================================================================
// 6. Communications & DSN Telemetry
// ============================================================================

export type CommunicationLinkStatus =
  | 'CONNECTED'
  | 'DEGRADED'
  | 'INTERMITTENT'
  | 'LOSS_OF_SIGNAL_OCCULTATION'
  | 'DISCONNECTED';

export type DsnGroundStation = 'Goldstone' | 'Madrid' | 'Canberra';

export interface CommunicationsState {
  /** Real-time carrier lock status with Earth Deep Space Network */
  status: CommunicationLinkStatus;
  /**
   * One-way speed-of-light propagation latency (tau = d / c).
   * Scientific Measurement | Unit: Seconds, Valid Range: [1.21, 1.36] (Mean: 1.282s)
   */
  delaySeconds: number;
  /**
   * Communication channel availability / duty cycle.
   * Unit: Percent (%), Valid Range: [0.0, 100.0]
   */
  availabilityPercent: number;
  /** Active Earth tracking station */
  dsnStation: DsnGroundStation;
}

// ============================================================================
// 7. Emergency & Contingency Protocol
// ============================================================================

export type EmergencySeverity =
  | 'NONE'
  | 'ADVISORY'
  | 'CAUTION'
  | 'WARNING'
  | 'CRITICAL';

export type ContingencyActionStatus =
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED';

export interface ContingencyAction {
  /** Unique action identifier (e.g., "ACT-PURGE-CO2-01") */
  actionId: string;
  /** Operational description of the action */
  description: string;
  /** Execution status */
  status: ContingencyActionStatus;
  /** Authority responsible for authorization */
  authorizedBy: 'GROUND' | 'CREW_AUTONOMY';
}

export interface EmergencyState {
  /** Identifier of currently active contingency scenario (null if nominal) */
  activeScenario: string | null;
  /** Alarm classification level */
  severity: EmergencySeverity;
  /**
   * Time remaining before irrevocable system or physiological failure occurs.
   * Scientific Measurement | Unit: Seconds, Valid Range: [0, 86400] (null if nominal)
   */
  remainingResponseTimeSeconds: number | null;
  /** Pre-configured checklist actions available to mitigate this anomaly */
  responseActions: ContingencyAction[];
}

// ============================================================================
// 8. Mission Records & Black-Box Audit Trail
// ============================================================================

export type EventSeverity =
  | 'INFO'
  | 'CAUTION'
  | 'WARNING'
  | 'CRITICAL'
  | 'INFORMATIONAL'
  | 'NOMINAL';

export type EventAffectedSystem =
  | 'CREW'
  | 'HABITAT'
  | 'EMERGENCY'
  | 'COMMUNICATIONS'
  | 'MISSION';

export interface MissionEventRecord {
  /** Unique log ID */
  eventId: string;
  /** Unit: Elapsed Hours, Valid Range: [0.0, 720.0] */
  timestampHours: number;
  /** Human-readable simulation time string (e.g. "Day 01, 14:30 MET") */
  simulationTime?: string;
  /** High-level affected system category for filtering */
  affectedSystem?: EventAffectedSystem;
  /** Subsystem category (e.g., "ECLSS", "EVA", "COMMS", "POWER_GRID") */
  category: string;
  /** Event classification type */
  eventType?: string;
  /** Concise event headline */
  title: string;
  /** Detailed telemetry or situational note */
  details: string;
  /** Severity level */
  severity: EventSeverity;
  /** Previous value before the transition */
  previousValue?: string | null;
  /** New value resulting from the transition */
  newValue?: string | null;
  /** What triggered the event */
  trigger?: string;
  /** Related user action if initiated by user */
  relatedUserAction?: string | null;
  /** NASA Artemis flight rule, human physiology or systems engineering educational note */
  educationalExplanation?: string;
  /** Whether the notification has been acknowledged by the user */
  acknowledged?: boolean;
}

export interface MissionActionRecord {
  /** Unique action audit ID */
  actionId: string;
  /** Unit: Elapsed Hours, Valid Range: [0.0, 720.0] */
  timestampHours: number;
  /** The command dispatched */
  command: string;
  /** Target subsystem (e.g., "POWER_GRID") */
  subsystem: string;
  /** Initiator node */
  initiatedBy: 'GROUND' | 'CREW';
  /** Outcome */
  outcome: 'SUCCESS' | 'REJECTED' | 'FAILED';
  /** Optional parameters / payload for deterministic replay */
  parameters?: Record<string, unknown>;
  /** Optional target astronaut */
  targetAstronautId?: string;
}

export interface MissionResourceDataPoint {
  /** Unit: Elapsed Hours, Valid Range: [0.0, 720.0] */
  timestampHours: number;
  /** Unit: Kilograms, Valid Range: [0.0, 1000.0] */
  oxygenKg: number;
  /** Unit: Liters, Valid Range: [0.0, 5000.0] */
  waterLiters: number;
  /** Unit: Kilowatt-Hours, Valid Range: [0.0, 500.0] */
  batteryKwh: number;
  /** Unit: Kilowatts, Valid Range: [0.0, 250.0] */
  powerKw: number;
  /** Unit: Kilocalories, Valid Range: [0.0, 500000.0] */
  foodKcal?: number;
}

export interface CrewWellbeingDataPoint {
  /** Unit: Elapsed Hours, Valid Range: [0.0, 720.0] */
  timestampHours: number;
  /** ID of astronaut */
  astronautId: string;
  /** Unit: Educational Index [0-100], Valid Range: [0.0, 100.0] */
  fatigueIndex: number;
  /** Unit: Educational Index [0-100], Valid Range: [0.0, 100.0] */
  stressIndex: number;
  /** Unit: Educational Index [0-100], Valid Range: [0.0, 100.0] */
  workloadIndex: number;
}

export interface MissionRecords {
  /** Chronological audit log of automated and manual mission events */
  eventHistory: MissionEventRecord[];
  /** Log of commands dispatched by ground commanders or crew */
  actionHistory: MissionActionRecord[];
  /** Historical telemetry snapshots for resource trend analysis */
  resourceHistory: MissionResourceDataPoint[];
  /** Historical telemetry snapshots of crew cognitive/fatigue curves */
  crewWellbeingHistory: CrewWellbeingDataPoint[];
}

// ============================================================================
// CANONICAL MISSION STATE
// ============================================================================

/**
 * The single, complete, canonical data model representing the entire
 * LIGHTTIME simulation state. All feature modules consume this canonical state.
 */
export interface MissionState {
  /** 1. Mission parameters and time synchronization */
  mission: MissionInformation;
  /** 2. Exactly four astronaut records constituting the expedition complement */
  crew: CrewComplement;
  /** 3. Closed-loop life support and habitat consumables */
  habitatResources: HabitatResources;
  /** 4. Installed machinery, airlocks, scrubbers, and avionic equipment */
  equipment: EquipmentRecord[];
  /** 5. Lunar exterior physical environment, solar angle, and terrain */
  environment: EnvironmentalState;
  /** 6. Earth Deep Space Network communications link and propagation latency */
  communications: CommunicationsState;
  /** 7. Active emergencies, master alarms, and remaining time to failure */
  emergency: EmergencyState;
  /** 8. Audit trail, black-box flight logs, and historical time-series data */
  records: MissionRecords;
}
