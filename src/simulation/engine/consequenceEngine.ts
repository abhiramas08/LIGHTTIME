/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Pure Simulation Engine
 *
 * Provides pure functions to:
 * 1. Initialize identical base states from configuration presets.
 * 2. Fork two independent runs (Run A & Run B) from identical deep copies.
 * 3. Enforce communication condition differential constraints.
 * 4. Execute validated emergency directives independently per run.
 * 5. Advance simulation ticks independently per run.
 * 6. Calculate objective, non-fabricated outcome metrics directly from simulation state.
 * 7. Synthesize educational consequence comparisons and NASA Flight Rules debriefs.
 */

import {
  MissionState,
  CrewComplement,
  AstronautRecord,
  MissionActionRecord,
} from '@/simulation/models/missionState';
import {
  createInitialMissionState,
  cloneMissionState,
  tickSimulation,
} from '@/simulation/engine/core';
import {
  applyMissionCommand,
  MissionCommandInput,
  CommandExecutionResult,
} from '@/simulation/commands/commandDispatcher';
import {
  EMERGENCY_SCENARIOS,
  PlayableEmergencyScenario,
} from '@/data/emergencies/emergencyScenarios';
import {
  ConsequenceLabConfig,
  CrewConditionPreset,
  CrewConditionPresetId,
  HabitatResourcesPreset,
  HabitatResourcesPresetId,
  CommunicationConditionPreset,
  CommunicationConditionPresetId,
  LaboratoryRunState,
  RunOutcomeMetrics,
  ComparativeAnalysisReport,
} from '@/simulation/models/consequenceLab';

// ============================================================================
// 1. Catalogs & Presets
// ============================================================================

export const CREW_CONDITION_PRESETS: Record<CrewConditionPresetId, CrewConditionPreset> = {
  NOMINAL_RESTED: {
    id: 'NOMINAL_RESTED',
    label: 'Nominal & Well-Rested',
    description: 'Circadian rhythm synchronized. 8.0h sleep, regular countermeasure exercise, low baseline stress.',
    sleepHours: 8.0,
    exerciseMinutes: 120,
    nutritionScore: 96,
    fatigueIndex: 12,
    stressIndex: 15,
    workloadIndex: 22,
    availability: 'AVAILABLE',
  },
  FATIGUED: {
    id: 'FATIGUED',
    label: 'Sleep-Deprived & Fatigued',
    description: 'Circadian desynchronization. Only 4.5h fragmented sleep, accumulated fatigue debt.',
    sleepHours: 4.5,
    exerciseMinutes: 45,
    nutritionScore: 80,
    fatigueIndex: 62,
    stressIndex: 48,
    workloadIndex: 55,
    availability: 'AVAILABLE',
  },
  HIGH_STRESS: {
    id: 'HIGH_STRESS',
    label: 'High Stress & Workload Overload',
    description: 'Heavy science EVA schedule and contingency alerts. Elevated cortisol and cognitive strain.',
    sleepHours: 6.0,
    exerciseMinutes: 60,
    nutritionScore: 84,
    fatigueIndex: 45,
    stressIndex: 74,
    workloadIndex: 82,
    availability: 'AVAILABLE',
  },
  EXHAUSTED_DEPLETED: {
    id: 'EXHAUSTED_DEPLETED',
    label: 'Critical Exhaustion & Depletion',
    description: 'Severe multi-sol sleep deficit, high physical strain, cognitive degradation.',
    sleepHours: 3.0,
    exerciseMinutes: 15,
    nutritionScore: 68,
    fatigueIndex: 84,
    stressIndex: 86,
    workloadIndex: 90,
    availability: 'MEDICAL_RESTRICTED',
  },
};

export const HABITAT_RESOURCES_PRESETS: Record<HabitatResourcesPresetId, HabitatResourcesPreset> = {
  NOMINAL_100: {
    id: 'NOMINAL_100',
    label: 'Full Nominals (100% Reserves)',
    description: 'Complete consumable margins. 120.0 kg O2, 100.0 kWh battery, 450.0 L water.',
    oxygenInventoryKg: 120.0,
    waterInventoryLiters: 450.0,
    foodInventoryKcal: 360000.0,
    batteryStorageKwh: 100.0,
    batteryStateOfChargePercent: 100.0,
    resourceSecurityIndex: 98.0,
  },
  STRAINED_75: {
    id: 'STRAINED_75',
    label: 'Strained Reserves (75% Margins)',
    description: 'Intermediate mission sol drawdown. 90.0 kg O2, 75.0 kWh battery, 337.5 L water.',
    oxygenInventoryKg: 90.0,
    waterInventoryLiters: 337.5,
    foodInventoryKcal: 270000.0,
    batteryStorageKwh: 75.0,
    batteryStateOfChargePercent: 75.0,
    resourceSecurityIndex: 74.0,
  },
  CRITICAL_50: {
    id: 'CRITICAL_50',
    label: 'Critical Reserves (50% Margins)',
    description: 'Late-mission or degraded state. 60.0 kg O2, 50.0 kWh battery, 225.0 L water.',
    oxygenInventoryKg: 60.0,
    waterInventoryLiters: 225.0,
    foodInventoryKcal: 180000.0,
    batteryStorageKwh: 50.0,
    batteryStateOfChargePercent: 50.0,
    resourceSecurityIndex: 48.0,
  },
};

export const COMMUNICATION_PRESETS: Record<CommunicationConditionPresetId, CommunicationConditionPreset> = {
  REALTIME_EARTH_LINK: {
    id: 'REALTIME_EARTH_LINK',
    label: 'Real-Time Earth Uplink (0.0s Delay)',
    shortLabel: 'Real-Time Link',
    description: 'Ideal high-bandwidth optical carrier. Zero operational delay, full POIC telemetry and Flight Director ground authorization.',
    status: 'CONNECTED',
    delaySeconds: 0.0,
    availabilityPercent: 100.0,
    bandwidthDisplay: '100 Mbps (Ka-Band Optical)',
    groundAuthorityLevel: 'FULL',
  },
  SPEED_OF_LIGHT_DELAY: {
    id: 'SPEED_OF_LIGHT_DELAY',
    label: 'Artemis Speed-of-Light Latency (1.3s One-Way / 2.6s RTT)',
    shortLabel: '1.3s Light-Time',
    description: 'Physical radio transmission time across 384,400 km. Minor telemetry buffering with full ground advisory capability.',
    status: 'CONNECTED',
    delaySeconds: 1.282,
    availabilityPercent: 95.0,
    bandwidthDisplay: '25 Mbps (S-Band Direct)',
    groundAuthorityLevel: 'ADVISORY',
  },
  HIGH_LATENCY_RELAY: {
    id: 'HIGH_LATENCY_RELAY',
    label: 'Orbital Gateway Relay (45s Delay, 70% Bandwidth)',
    shortLabel: '45s Relay Delay',
    description: 'Indirect multi-hop store-and-forward relay via Lunar Gateway. Significant command queue latency hampers urgent intervention.',
    status: 'DEGRADED',
    delaySeconds: 45.0,
    availabilityPercent: 70.0,
    bandwidthDisplay: '2.5 Mbps (Relay Constellation)',
    groundAuthorityLevel: 'RESTRICTED',
  },
  OCCULTATION_BLACKOUT: {
    id: 'OCCULTATION_BLACKOUT',
    label: 'Far-Side Lunar Occultation Blackout (0% Availability)',
    shortLabel: 'Occultation Blackout',
    description: 'Lunar mass completely blocks Earth line-of-sight. Total communications blackout. On-board crew autonomy mandatory (Flight Rule 11.5).',
    status: 'LOSS_OF_SIGNAL_OCCULTATION',
    delaySeconds: 0.0,
    availabilityPercent: 0.0,
    bandwidthDisplay: '0 kbps (Total LOS)',
    groundAuthorityLevel: 'BLOCKED',
  },
  DSN_SEVERED: {
    id: 'DSN_SEVERED',
    label: 'DSN Ground Hardware Outage / Carrier Severed (0% Availability)',
    shortLabel: 'DSN Severed',
    description: 'Earth Deep Space Network antenna transmitter failure. Uplink and downlink severed. All ground-assisted commands interlocked.',
    status: 'DISCONNECTED',
    delaySeconds: 0.0,
    availabilityPercent: 0.0,
    bandwidthDisplay: '0 kbps (No Carrier)',
    groundAuthorityLevel: 'BLOCKED',
  },
};

// ============================================================================
// 2. Base State Initialization & Deep Copying
// ============================================================================

/**
 * Creates the exact baseline MissionState for the Consequence Laboratory
 * incorporating chosen starting day, crew condition, and resources.
 */
export function initializeLabBaseState(config: ConsequenceLabConfig): MissionState {
  const base = createInitialMissionState();
  base.mission.missionName = 'LIGHTTIME Consequence Lab Experiment';

  // Set mission elapsed time and day
  base.mission.missionDay = config.startingDay;
  base.mission.elapsedHours = (config.startingDay - 1) * 24.0;
  base.mission.missionStatus = 'ACTIVE';

  // Apply crew condition preset across all 4 astronauts
  const crewPreset = CREW_CONDITION_PRESETS[config.crewConditionId] || CREW_CONDITION_PRESETS.NOMINAL_RESTED;
  base.crew = base.crew.map((astronaut: AstronautRecord) => ({
    ...astronaut,
    sleepHours: crewPreset.sleepHours,
    exerciseMinutes: crewPreset.exerciseMinutes,
    nutritionScore: crewPreset.nutritionScore,
    fatigueIndex: crewPreset.fatigueIndex,
    stressIndex: crewPreset.stressIndex,
    workloadIndex: crewPreset.workloadIndex,
    availability: crewPreset.availability,
  })) as CrewComplement;

  // Apply habitat resources preset
  const resPreset = HABITAT_RESOURCES_PRESETS[config.initialResourcesId] || HABITAT_RESOURCES_PRESETS.NOMINAL_100;
  base.habitatResources.oxygenInventoryKg = resPreset.oxygenInventoryKg;
  base.habitatResources.waterInventoryLiters = resPreset.waterInventoryLiters;
  base.habitatResources.foodInventoryKcal = resPreset.foodInventoryKcal;
  base.habitatResources.batteryStorageKwh = resPreset.batteryStorageKwh;
  base.habitatResources.batteryStateOfChargePercent = resPreset.batteryStateOfChargePercent;
  base.habitatResources.resourceSecurityIndex = resPreset.resourceSecurityIndex;

  return base;
}

/**
 * Initializes two completely independent experimental runs (Run A and Run B).
 * Both start from an identical deep clone of the base MissionState.
 * The ONLY initial difference is the communication condition.
 * Both runs are immediately primed with the selected emergency scenario.
 */
export function createDualLabRuns(config: ConsequenceLabConfig): {
  runA: LaboratoryRunState;
  runB: LaboratoryRunState;
  initialSnapshot: MissionState;
  scenario: PlayableEmergencyScenario;
} {
  const scenario =
    EMERGENCY_SCENARIOS.find((s) => s.id === config.scenarioId) ??
    EMERGENCY_SCENARIOS[0]!;

  const baseState = initializeLabBaseState(config);

  // Deep clone an immutable starting snapshot for baseline comparisons
  const initialSnapshot = cloneMissionState(baseState);

  // Build Run A from deep clone
  const stateA = cloneMissionState(baseState);
  const commPresetA = COMMUNICATION_PRESETS[config.commConditionAId] || COMMUNICATION_PRESETS.REALTIME_EARTH_LINK;
  stateA.communications.status = commPresetA.status;
  stateA.communications.delaySeconds = commPresetA.delaySeconds;
  stateA.communications.availabilityPercent = commPresetA.availabilityPercent;

  // Build Run B from deep clone
  const stateB = cloneMissionState(baseState);
  const commPresetB = COMMUNICATION_PRESETS[config.commConditionBId] || COMMUNICATION_PRESETS.OCCULTATION_BLACKOUT;
  stateB.communications.status = commPresetB.status;
  stateB.communications.delaySeconds = commPresetB.delaySeconds;
  stateB.communications.availabilityPercent = commPresetB.availabilityPercent;

  // Trigger emergency scenario identically on both runs
  const triggerA = applyMissionCommand(stateA, {
    subsystem: 'EMERGENCY',
    action: 'TRIGGER_EMERGENCY_SCENARIO',
    parameters: { scenarioId: scenario.id },
    initiatedBy: 'CREW',
  });

  const triggerB = applyMissionCommand(stateB, {
    subsystem: 'EMERGENCY',
    action: 'TRIGGER_EMERGENCY_SCENARIO',
    parameters: { scenarioId: scenario.id },
    initiatedBy: 'CREW',
  });

  const startTimeHours = baseState.mission.elapsedHours;

  const runA: LaboratoryRunState = {
    runId: 'RUN_A',
    name: `Run A: ${commPresetA.shortLabel}`,
    commPreset: commPresetA,
    initialState: cloneMissionState(triggerA.updatedState),
    currentState: triggerA.updatedState,
    isEmergencyActive: true,
    isResolved: false,
    scenarioStartTimeHours: startTimeHours,
    actionsHistory: [...triggerA.updatedState.records.actionHistory],
    eventsHistory: [...triggerA.updatedState.records.eventHistory],
    outcomeMetrics: calculateRunOutcome(
      initialSnapshot,
      triggerA.updatedState,
      startTimeHours,
      triggerA.updatedState.records.actionHistory
    ),
    statusMessage: `Emergency ${scenario.shortTitle} initiated under ${commPresetA.label}.`,
  };

  const runB: LaboratoryRunState = {
    runId: 'RUN_B',
    name: `Run B: ${commPresetB.shortLabel}`,
    commPreset: commPresetB,
    initialState: cloneMissionState(triggerB.updatedState),
    currentState: triggerB.updatedState,
    isEmergencyActive: true,
    isResolved: false,
    scenarioStartTimeHours: startTimeHours,
    actionsHistory: [...triggerB.updatedState.records.actionHistory],
    eventsHistory: [...triggerB.updatedState.records.eventHistory],
    outcomeMetrics: calculateRunOutcome(
      initialSnapshot,
      triggerB.updatedState,
      startTimeHours,
      triggerB.updatedState.records.actionHistory
    ),
    statusMessage: `Emergency ${scenario.shortTitle} initiated under ${commPresetB.label}.`,
  };

  return {
    runA,
    runB,
    initialSnapshot,
    scenario,
  };
}

// ============================================================================
// 3. Execution & Simulation Stepping
// ============================================================================

/**
 * Executes a mission directive in the context of an isolated LaboratoryRunState.
 * Evaluates communication barriers: commands requiring Earth assistance will be
 * rejected if communications are offline.
 */
export function executeLabRunAction(
  run: LaboratoryRunState,
  commandInput: MissionCommandInput
): {
  updatedRun: LaboratoryRunState;
  result: CommandExecutionResult;
} {
  const result = applyMissionCommand(run.currentState, commandInput);

  const updatedActions = [...result.updatedState.records.actionHistory];
  const updatedEvents = [...result.updatedState.records.eventHistory];

  const isResolved =
    result.updatedState.emergency.activeScenario === null ||
    commandInput.action === 'RESOLVE_EMERGENCY';

  const metrics = calculateRunOutcome(
    run.initialState,
    result.updatedState,
    run.scenarioStartTimeHours,
    updatedActions
  );

  const updatedRun: LaboratoryRunState = {
    ...run,
    currentState: result.updatedState,
    isEmergencyActive: !isResolved,
    isResolved,
    actionsHistory: updatedActions,
    eventsHistory: updatedEvents,
    outcomeMetrics: metrics,
    statusMessage: result.message,
  };

  return { updatedRun, result };
}

/**
 * Advances simulation time within an isolated LaboratoryRunState.
 * Purely calls tickSimulation() and collects resulting events/telemetry updates.
 */
export function advanceLabRunTime(
  run: LaboratoryRunState,
  deltaHours: number
): LaboratoryRunState {
  const updatedState = tickSimulation(run.currentState, deltaHours);

  const metrics = calculateRunOutcome(
    run.initialState,
    updatedState,
    run.scenarioStartTimeHours,
    updatedState.records.actionHistory
  );

  return {
    ...run,
    currentState: updatedState,
    isEmergencyActive: updatedState.emergency.activeScenario !== null,
    isResolved: updatedState.emergency.activeScenario === null,
    actionsHistory: [...updatedState.records.actionHistory],
    eventsHistory: [...updatedState.records.eventHistory],
    outcomeMetrics: metrics,
    statusMessage: `Advanced simulation time by ${deltaHours}h (MET: ${updatedState.mission.elapsedHours.toFixed(1)}h).`,
  };
}

// ============================================================================
// 4. Objective Outcome Calculations (NEVER Fabricated)
// ============================================================================

/**
 * Pure mathematical calculation of operational outcomes strictly comparing
 * actual initial and current state measurements.
 */
export function calculateRunOutcome(
  initialState: MissionState,
  currentState: MissionState,
  scenarioStartTimeHours: number,
  actionsHistory: MissionActionRecord[] = []
): RunOutcomeMetrics {
  // Consumables used
  const initialO2 = initialState.habitatResources.oxygenInventoryKg;
  const currentO2 = currentState.habitatResources.oxygenInventoryKg;
  const oxygenUsedKg = Number(Math.max(0, initialO2 - currentO2).toFixed(2));

  const initialWater = initialState.habitatResources.waterInventoryLiters;
  const currentWater = currentState.habitatResources.waterInventoryLiters;
  const waterUsedLiters = Number(Math.max(0, initialWater - currentWater).toFixed(2));

  // Power consumed (incorporating battery draw and power generation over elapsed delta)
  const elapsedHours = Math.max(0, currentState.mission.elapsedHours - scenarioStartTimeHours);
  const batteryDelta = initialState.habitatResources.batteryStorageKwh - currentState.habitatResources.batteryStorageKwh;
  const generationDuringEvent = currentState.habitatResources.powerGenerationKw * elapsedHours;
  const powerConsumedKwh = Number(Math.max(0, batteryDelta + generationDuringEvent).toFixed(2));

  // Time to resolve
  const timeToResolveHours = Number(elapsedHours.toFixed(2));
  const timeToResolveMinutes = Math.round(timeToResolveHours * 60);

  // Crew biometrics and educational indices
  const crew = currentState.crew;
  const totalFatigue = crew.reduce((acc, c) => acc + c.fatigueIndex, 0);
  const totalStress = crew.reduce((acc, c) => acc + c.stressIndex, 0);
  const totalWorkload = crew.reduce((acc, c) => acc + c.workloadIndex, 0);

  const averageCrewFatigue = Number((totalFatigue / crew.length).toFixed(1));
  const averageCrewStress = Number((totalStress / crew.length).toFixed(1));
  const averageCrewWorkload = Number((totalWorkload / crew.length).toFixed(1));

  // Crew Safety Score (0 - 100): Weighted formula penalizing high fatigue, panic/stress, and workload
  // Safety = 100 - (0.40 * fatigue + 0.40 * stress + 0.20 * workload)
  const safetyPenalty = (0.40 * averageCrewFatigue) + (0.40 * averageCrewStress) + (0.20 * averageCrewWorkload);
  const rawSafetyScore = Math.max(0, Math.min(100, 100 - safetyPenalty));
  const crewSafetyScore = Number(rawSafetyScore.toFixed(1));

  // Equipment condition
  const totalCondition = currentState.equipment.reduce((acc, eq) => acc + eq.condition, 0);
  const averageEquipmentCondition = Number((totalCondition / currentState.equipment.length).toFixed(1));

  // Mission completion status
  let missionCompletionStatus: RunOutcomeMetrics['missionCompletionStatus'] = 'ACTIVE';
  if (currentState.emergency.activeScenario === null) {
    missionCompletionStatus = 'RESOLVED';
  } else if (currentState.habitatResources.oxygenInventoryKg <= 20.0 || currentState.habitatResources.batteryStorageKwh <= 5.0) {
    missionCompletionStatus = 'FAILED';
  } else if (currentState.mission.missionStatus === 'ABORTED') {
    missionCompletionStatus = 'ABORTED';
  }

  // Action tallies
  const totalActionsAttempted = actionsHistory.length;
  const actionsCompleted = actionsHistory.filter((a) => a.outcome === 'SUCCESS').length;
  const actionsRejected = actionsHistory.filter((a) => a.outcome === 'REJECTED').length;

  return {
    crewSafetyScore,
    averageCrewFatigue,
    averageCrewStress,
    averageCrewWorkload,
    missionCompletionStatus,
    oxygenUsedKg,
    waterUsedLiters,
    powerConsumedKwh,
    timeToResolveHours,
    timeToResolveMinutes,
    averageEquipmentCondition,
    finalReserves: {
      oxygenKg: currentState.habitatResources.oxygenInventoryKg,
      waterLiters: currentState.habitatResources.waterInventoryLiters,
      batteryKwh: currentState.habitatResources.batteryStorageKwh,
      foodKcal: currentState.habitatResources.foodInventoryKcal,
    },
    totalActionsAttempted,
    actionsCompleted,
    actionsRejected,
  };
}

// ============================================================================
// 5. Comparative Synthesis & Educational Analysis
// ============================================================================

/**
 * Compares Run A and Run B mathematically and provides educational analysis
 * derived from real NASA human factors, Artemis Flight Rules, and communications delays.
 */
export function synthesizeComparativeReport(
  runA: LaboratoryRunState,
  runB: LaboratoryRunState,
  scenario: PlayableEmergencyScenario
): ComparativeAnalysisReport {
  const metA = runA.outcomeMetrics;
  const metB = runB.outcomeMetrics;

  const crewSafetyDelta = Number((metA.crewSafetyScore - metB.crewSafetyScore).toFixed(1));
  const fatigueDelta = Number((metA.averageCrewFatigue - metB.averageCrewFatigue).toFixed(1));
  const stressDelta = Number((metA.averageCrewStress - metB.averageCrewStress).toFixed(1));
  const oxygenUsedDelta = Number((metA.oxygenUsedKg - metB.oxygenUsedKg).toFixed(2));
  const waterUsedDelta = Number((metA.waterUsedLiters - metB.waterUsedLiters).toFixed(2));
  const powerConsumedDelta = Number((metA.powerConsumedKwh - metB.powerConsumedKwh).toFixed(2));
  const timeToResolveDeltaHours = Number((metA.timeToResolveHours - metB.timeToResolveHours).toFixed(2));
  const equipmentConditionDelta = Number((metA.averageEquipmentCondition - metB.averageEquipmentCondition).toFixed(1));

  // Determine educational headline and key narrative
  const commA = runA.commPreset;
  const commB = runB.commPreset;

  const headline = `Communication Latency & Autonomy Impact: ${scenario.shortTitle}`;
  let speedOfLightImpact = '';
  let autonomyTradeoff = '';

  if (commA.status === 'CONNECTED' && commB.status === 'LOSS_OF_SIGNAL_OCCULTATION') {
    speedOfLightImpact =
      `In Run A (${commA.label}), immediate telemetry uplink enabled ground flight controllers to analyze anomalies and transmit verified corrective procedures. In Run B (${commB.label}), complete lunar occultation severed Earth contact, rendering ground-assisted diagnosis impossible and requiring immediate autonomous on-board action.`;
    autonomyTradeoff =
      `Without ground verification, Run B required the crew to execute manual isolation immediately. While autonomy prevented catastrophic consumable bleed, it placed elevated cognitive workload and stress on the crew (${metB.averageCrewStress}% vs ${metA.averageCrewStress}%).`;
  } else if (commA.delaySeconds < commB.delaySeconds) {
    speedOfLightImpact =
      `Run B suffered a transmission latency penalty (${commB.label} vs ${commA.label}). Every round-trip communication required waiting for speed-of-light propagation, consuming critical response runway during active emergency escalation.`;
    autonomyTradeoff =
      `Students observe that relying on ground advisory during high-latency communication drains time and consumables. Autonomous crew authority under Flight Rule 11.5 is essential for time-critical emergencies.`;
  } else {
    speedOfLightImpact =
      `Both runs demonstrated how differing command pathways alter ECLSS balances, equipment wear, and physiological recovery rates.`;
    autonomyTradeoff =
      `Autonomous action eliminates communication delay but depends heavily on crew training, pre-delegated flight rules, and automated safety interlocks.`;
  }

  const pedagogicalSummary: string[] = [
    `Consumables Delta: Run A consumed ${metA.oxygenUsedKg} kg O2 vs Run B's ${metB.oxygenUsedKg} kg O2 (Δ: ${Math.abs(oxygenUsedDelta)} kg).`,
    `Crew Safety: Run A safety score is ${metA.crewSafetyScore}/100 vs Run B's ${metB.crewSafetyScore}/100 (Δ: ${crewSafetyDelta > 0 ? '+' : ''}${crewSafetyDelta} pts).`,
    `Operational Interlocks: Run B encountered ${metB.actionsRejected} rejected command(s) due to unavailable Earth communication link.`,
    `Time to Resolution: Run A resolved in ${metA.timeToResolveMinutes}m vs Run B's ${metB.timeToResolveMinutes}m.`,
  ];

  return {
    scenario,
    runA,
    runB,
    deltas: {
      crewSafetyDelta,
      fatigueDelta,
      stressDelta,
      oxygenUsedDelta,
      waterUsedDelta,
      powerConsumedDelta,
      timeToResolveDeltaHours,
      equipmentConditionDelta,
    },
    educationalTakeaways: {
      headline,
      speedOfLightImpact,
      autonomyTradeoff,
      flightRulesApplied: scenario.flightRuleReferences,
      pedagogicalSummary,
    },
  };
}
