/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Pure TypeScript Simulation Engine Core
 *
 * ZERO dependencies on React, Zustand, DOM, window, or external network APIs.
 * Pure deterministic mathematical solvers and discrete-event simulation functions.
 */

import {
  MissionState,
  CrewComplement,
  MissionEventRecord,
} from '../models/missionState';
import {
  formatSimulationTime,
  mapCategoryToAffectedSystem,
  getEducationalExplanation,
} from '../models/eventTypes';
import { DEFAULT_MISSION_STATE } from '../../data/mission/defaultMissionState';
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from './config';

export interface MissionOutcome {
  missionSuccess: boolean;
  overallScore: number; // 0 - 100
  crewHealthScore: number; // 0 - 100
  resourceEfficiencyScore: number; // 0 - 100
  systemsReliabilityScore: number; // 0 - 100
  scienceAchievementScore: number; // 0 - 100
  grade: 'EXEMPLARY' | 'PROFICIENT' | 'MARGINAL' | 'FAILED';
  debriefSummary: string[];
}

// ============================================================================
// Helper: Deterministic Deep Clone
// ============================================================================

export function cloneMissionState(state: MissionState): MissionState {
  return JSON.parse(JSON.stringify(state));
}

// ============================================================================
// 1. createInitialMissionState()
// ============================================================================

/**
 * Initializes a pristine canonical MissionState with optional overrides.
 * Guarantees a fully valid, reproducible starting state.
 */
export function createInitialMissionState(
  overrides?: Partial<MissionState>
): MissionState {
  const base = cloneMissionState(DEFAULT_MISSION_STATE);
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    mission: { ...base.mission, ...(overrides.mission || {}) },
    crew: overrides.crew ? overrides.crew : base.crew,
    habitatResources: { ...base.habitatResources, ...(overrides.habitatResources || {}) },
    equipment: overrides.equipment ? overrides.equipment : base.equipment,
    environment: { ...base.environment, ...(overrides.environment || {}) },
    communications: { ...base.communications, ...(overrides.communications || {}) },
    emergency: { ...base.emergency, ...(overrides.emergency || {}) },
    records: { ...base.records, ...(overrides.records || {}) },
  };
}

// ============================================================================
// 2. advanceMissionTime()
// ============================================================================

/**
 * Advances simulation clock by deltaHours, updating elapsedHours and missionDay.
 */
export function advanceMissionTime(
  state: MissionState,
  deltaHours: number
): MissionState {
  const next = cloneMissionState(state);
  const totalMaxHours = next.mission.missionDuration * 24.0;
  const newElapsed = Math.min(totalMaxHours, Number((next.mission.elapsedHours + deltaHours).toFixed(4)));
  const newDay = Math.min(
    next.mission.missionDuration,
    Math.floor(newElapsed / 24.0) + 1
  );

  next.mission.elapsedHours = newElapsed;
  next.mission.missionDay = newDay;

  return next;
}

// ============================================================================
// 3. simulateEnvironment()
// ============================================================================

/**
 * Simulates lunar diurnal cycle, polar illumination, surface temperature,
 * and background vs. acute solar cosmic radiation.
 */
export function simulateEnvironment(
  state: MissionState,
  _deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);
  const elapsed = next.mission.elapsedHours;

  // Polar rim diurnal illumination model (Shackleton South Rim grazing sunlight)
  // Period: ~708.73h synodic cycle; polar peaks maintain 70-95% illumination
  const illuminationPhase = (elapsed % 708.73) / 708.73;
  const rawIllumination = 75.0 + 20.0 * Math.sin(illuminationPhase * 2 * Math.PI);
  const illumination = Math.min(100.0, Math.max(0.0, Number(rawIllumination.toFixed(2))));

  // Surface temperature model (-50°C polar sunlight to -130°C shadowing)
  const rawTemp = -50.0 + 20.0 * Math.sin(illuminationPhase * 2 * Math.PI);
  const surfaceTemp = Number(rawTemp.toFixed(1));

  // Solar power availability tracks surface illumination directly
  next.environment.lunarIlluminationPercent = illumination;
  next.environment.environmentalTemperatureCelsius = surfaceTemp;
  next.environment.solarPowerAvailabilityPercent = illumination;

  // Radiation hazard baseline (15 - 20 index background GCR)
  if (next.emergency.activeScenario === 'CONTINGENCY-SOLAR-PARTICLE-EVENT') {
    next.environment.educationalRadiationHazardIndex = 85.0;
  } else {
    next.environment.educationalRadiationHazardIndex = 18.0;
  }

  // Communications propagation delay (tau = d / c)
  const distanceMeters = config.meanEarthMoonDistanceKm * 1000.0;
  const exactDelay = Number((distanceMeters / config.speedOfLightMPerS).toFixed(4));
  next.communications.delaySeconds = exactDelay;

  return next;
}

// ============================================================================
// 4. simulatePower()
// ============================================================================

/**
 * Calculates power generation (solar + surface reactor) against electrical demand,
 * updates battery charge/discharge balance, and computes the power satisfaction ratio.
 */
export function simulatePower(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);

  // Solar array health factor
  const solarEq = next.equipment.find((e) => e.equipmentId === 'EQ-EPS-SOLAR-01');
  const solarHealthFactor = solarEq ? solarEq.condition / 100.0 : 0.8;
  const solarGeneration =
    config.baseSolarGenerationPeakKw *
    (next.environment.solarPowerAvailabilityPercent / 100.0) *
    solarHealthFactor;

  // Surface fission reactor baseline health factor
  const reactorEq = next.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
  const reactorHealthFactor = reactorEq ? reactorEq.condition / 100.0 : 1.0;
  const reactorGeneration = config.baseNuclearGenerationKw * reactorHealthFactor;

  const totalGenerationKw = Number((solarGeneration + reactorGeneration).toFixed(2));

  // Calculate electrical load from active equipment
  let equipmentLoadKw = 0.0;
  for (const eq of next.equipment) {
    if (eq.status === 'OPERATIONAL' || eq.status === 'DEGRADED') {
      equipmentLoadKw += eq.powerRequirementKw;
    }
  }

  const totalDemandKw = Number((config.baseHabitatPowerDemandKw + equipmentLoadKw).toFixed(2));
  const netPowerKw = totalGenerationKw - totalDemandKw;

  // Update battery storage
  let currentBattery = next.habitatResources.batteryStorageKwh;
  if (netPowerKw >= 0) {
    // Charging (95% round-trip coulombic efficiency)
    currentBattery += netPowerKw * deltaHours * 0.95;
  } else {
    // Discharging
    currentBattery += netPowerKw * deltaHours; // netPowerKw is negative
  }

  // Enforce physical limits [0, batteryCapacityKwh]
  currentBattery = Math.max(0.0, Math.min(config.batteryCapacityKwh, Number(currentBattery.toFixed(3))));
  const socPercent = Number(((currentBattery / config.batteryCapacityKwh) * 100.0).toFixed(1));

  next.habitatResources.powerGenerationKw = totalGenerationKw;
  next.habitatResources.powerDemandKw = totalDemandKw;
  next.habitatResources.batteryStorageKwh = currentBattery;
  next.habitatResources.batteryStateOfChargePercent = socPercent;

  return next;
}

// ============================================================================
// 5. simulateEquipment()
// ============================================================================

/**
 * Degrades equipment condition with operating strain and alters operational status
 * when power deficits or mechanical failures occur.
 */
export function simulateEquipment(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);
  const soc = next.habitatResources.batteryStateOfChargePercent;
  const powerShortage = soc <= config.batteryWarningThresholdPercent;
  const blackedOut = next.habitatResources.batteryStorageKwh <= 0.1 && next.habitatResources.powerGenerationKw < next.habitatResources.powerDemandKw;

  next.equipment = next.equipment.map((eq) => {
    // Normal mechanical wear (0.01% degradation per hour of runtime)
    const wear = 0.01 * deltaHours;
    const newCondition = Math.max(0.0, Math.min(100.0, Number((eq.condition - wear).toFixed(2))));

    let newStatus = eq.status;
    let maint = eq.maintenanceRequired;

    if (newCondition < 30.0) {
      maint = true;
      if (newStatus !== 'FAILED') newStatus = 'MAINTENANCE_REQUIRED';
    }

    if (blackedOut) {
      // Complete blackout
      if (eq.equipmentId !== 'EQ-EPS-REACTOR-01') {
        newStatus = 'FAILED';
      }
    } else if (powerShortage && eq.equipmentId === 'EQ-HAB-AIRLOCK-01') {
      // Non-essential load shedding during low-battery
      newStatus = 'STANDBY';
    } else if (!powerShortage && newStatus === 'STANDBY') {
      newStatus = 'OPERATIONAL';
    }

    return {
      ...eq,
      condition: newCondition,
      status: newStatus,
      maintenanceRequired: maint,
    };
  });

  return next;
}

// ============================================================================
// 6. simulateOxygen()
// ============================================================================

/**
 * Models 4-crew metabolic oxygen consumption, habitat replenishment, and hypoxia triggers.
 * Prevents negative inventories.
 */
export function simulateOxygen(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);
  const activeCrewCount = next.crew.length; // 4 crew members

  // Total metabolic demand
  const hourlyRate = activeCrewCount * config.oxygenConsumptionRatePerCrewKgPerHour;
  const totalDemandKg = hourlyRate * deltaHours;

  const currentO2 = next.habitatResources.oxygenInventoryKg;
  const consumedKg = Math.min(currentO2, totalDemandKg);
  const remainingO2 = Math.max(0.0, Number((currentO2 - consumedKg).toFixed(4)));

  next.habitatResources.oxygenInventoryKg = remainingO2;
  next.habitatResources.oxygenConsumptionRateKgPerHour = Number(hourlyRate.toFixed(4));

  // Check safety event trigger
  if (remainingO2 <= config.oxygenCriticalThresholdKg && currentO2 > config.oxygenCriticalThresholdKg) {
    recordEvent(
      next,
      'ECLSS',
      'CRITICAL: Cabin Oxygen Reserves Depleted',
      `O2 inventory has dropped to ${remainingO2} kg. Hypoxia imminent without emergency repressurization.`,
      'CRITICAL',
      {
        eventType: 'RESOURCE_DEPLETION',
        affectedSystem: 'HABITAT',
        previousValue: `${currentO2.toFixed(2)} kg`,
        newValue: `${remainingO2.toFixed(2)} kg`,
        trigger: `Oxygen inventory dropped below critical threshold (${config.oxygenCriticalThresholdKg} kg)`,
        educationalExplanation:
          'NASA Flight Rule 4.1: Cryogenic oxygen depletion below 40 kg threatens atmospheric hypoxia. Immediate repressurization or metabolic rationing required.',
      }
    );
  } else if (remainingO2 <= config.oxygenWarningThresholdKg && currentO2 > config.oxygenWarningThresholdKg) {
    recordEvent(
      next,
      'ECLSS',
      'CAUTION: Oxygen Reserves Low',
      `O2 inventory at ${remainingO2} kg. Check cryogenic tank manifolds.`,
      'WARNING',
      {
        eventType: 'THRESHOLD_BREACH',
        affectedSystem: 'HABITAT',
        previousValue: `${currentO2.toFixed(2)} kg`,
        newValue: `${remainingO2.toFixed(2)} kg`,
        trigger: `Oxygen inventory breached warning threshold (${config.oxygenWarningThresholdKg} kg)`,
        educationalExplanation:
          'Flight Rule Advisory: Cryogenic reserve has dropped below 60 kg. Flight controllers must verify feedline manifold pressures.',
      }
    );
  }

  return next;
}

// ============================================================================
// 7. simulateCO2Removal()
// ============================================================================

/**
 * Models 4-crew metabolic CO₂ exhalation against active CDRA amine bed scrubbing.
 * System dependency: CDRA condition and electrical power dictate scrubbing capacity.
 */
export function simulateCO2Removal(
  state: MissionState,
  _deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);

  // Equipment dependency: CDRA amine bed status
  const cdraEq = next.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-CDRA-01');
  let efficiencyMultiplier = cdraEq ? cdraEq.condition / 100.0 : 0.8;

  if (cdraEq?.status === 'FAILED') {
    efficiencyMultiplier = 0.0;
  } else if (cdraEq?.status === 'DEGRADED') {
    efficiencyMultiplier *= 0.5;
  }

  // Power dependency
  const soc = next.habitatResources.batteryStateOfChargePercent;
  if (soc < 5.0 && next.habitatResources.powerGenerationKw < next.habitatResources.powerDemandKw) {
    efficiencyMultiplier *= 0.2; // Severely unpowered
  }

  const actualScrubbingCapacityKgPerHour = Number(
    (config.nominalCo2RemovalCapacityKgPerHour * efficiencyMultiplier).toFixed(4)
  );

  next.habitatResources.co2RemovalCapacityKgPerHour = actualScrubbingCapacityKgPerHour;
  next.habitatResources.eclssEfficiencyScore = Math.max(
    0.0,
    Math.min(100.0, Number((efficiencyMultiplier * 100.0).toFixed(1)))
  );

  return next;
}

// ============================================================================
// 8. simulateWater()
// ============================================================================

/**
 * Simulates drinking/hygiene water demand and catalytic loop recovery.
 * System dependency: WRS equipment condition determines recycling efficiency.
 * Prevents negative inventories.
 */
export function simulateWater(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);
  const activeCrewCount = next.crew.length;

  const totalDemandLiters =
    activeCrewCount * config.waterConsumptionRatePerCrewLitersPerHour * deltaHours;

  // WRS loop equipment dependency
  const wrsEq = next.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-WRS-01');
  let recoveryFactor = config.baseWaterRecoveryRate;

  if (wrsEq) {
    recoveryFactor *= wrsEq.condition / 100.0;
    if (wrsEq.status === 'DEGRADED') recoveryFactor *= 0.6;
    if (wrsEq.status === 'FAILED') recoveryFactor = 0.0;
  }

  const recoveryRatePercent = Number((recoveryFactor * 100.0).toFixed(1));
  const recycledLiters = totalDemandLiters * recoveryFactor;
  const netLossLiters = totalDemandLiters - recycledLiters;

  const currentWater = next.habitatResources.waterInventoryLiters;
  const remainingWater = Math.max(0.0, Number((currentWater - netLossLiters).toFixed(3)));

  next.habitatResources.waterInventoryLiters = remainingWater;
  next.habitatResources.waterRecoveryRatePercent = recoveryRatePercent;

  return next;
}

// ============================================================================
// 9. simulateFood()
// ============================================================================

/**
 * Depletes shelf-stable metabolic rations per crew member.
 * Prevents negative inventories.
 */
export function simulateFood(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);
  const activeCrewCount = next.crew.length;

  const hourlyKcal = activeCrewCount * config.foodConsumptionRatePerCrewKcalPerHour;
  const totalKcalDemand = hourlyKcal * deltaHours;

  const currentFood = next.habitatResources.foodInventoryKcal;
  const consumedKcal = Math.min(currentFood, totalKcalDemand);
  const remainingFood = Math.max(0.0, Number((currentFood - consumedKcal).toFixed(1)));

  next.habitatResources.foodInventoryKcal = remainingFood;
  next.habitatResources.foodConsumptionKcalPerHour = hourlyKcal;

  return next;
}

// ============================================================================
// 10. simulateCrew()
// ============================================================================

/**
 * Simulates astronaut cognitive readiness, fatigue, stress, radiation dosage,
 * and biometrics. Integrates cascading effects from life support hazards.
 */
export function simulateCrew(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);

  // System-level stressors cascading onto crew
  const o2Depleted = next.habitatResources.oxygenInventoryKg <= 0.0;
  const o2Critical = next.habitatResources.oxygenInventoryKg <= config.oxygenCriticalThresholdKg;
  const co2ScrubberOffline = next.habitatResources.co2RemovalCapacityKgPerHour < 0.1;
  const waterDepleted = next.habitatResources.waterInventoryLiters <= 0.0;
  const radiationActive = next.environment.educationalRadiationHazardIndex > config.radiationShelterThresholdIndex;

  const updatedCrew = next.crew.map((ast) => {
    let fatigue = ast.fatigueIndex;
    let stress = ast.stressIndex;
    let spo2 = ast.biometrics.bloodOxygenPercent;
    let heartRate = ast.biometrics.heartRateBpm;
    let radiationDose = ast.biometrics.cumulativeRadiationDoseMsv;

    // Fatigue & Stress Dynamics based on availability and NASA HRP evidence
    if (ast.availability === 'SLEEPING') {
      const recovered = config.fatigueRecoveryRatePerSleepHour * deltaHours;
      fatigue = Math.max(0.0, fatigue - recovered);
      stress = Math.max(0.0, stress - config.stressRecoveryRatePerHour * deltaHours);
      heartRate = Math.max(54, Math.round(heartRate - 4 * deltaHours));
    } else if (ast.availability === 'RESTING') {
      const recovered = config.fatigueRecoveryRatePerSleepHour * 0.5 * deltaHours;
      fatigue = Math.max(0.0, fatigue - recovered);
      stress = Math.max(0.0, stress - config.stressRecoveryRatePerHour * 0.8 * deltaHours);
      heartRate = Math.max(62, Math.round(heartRate - 2 * deltaHours));
    } else {
      let fatigueRate = config.fatigueAccumulationRatePerHour;

      // NASA HRP Evidence: Chronic Sleep Debt Effect (< 7.0 hours/sol increases fatigue accumulation)
      if (ast.sleepHours < 7.0) {
        const sleepDebt = 7.0 - ast.sleepHours;
        fatigueRate += sleepDebt * 0.45;
      }

      // Workload Effect: High workload adds compounding cognitive fatigue & stress
      if (ast.workloadIndex > 60.0) {
        const excessWorkload = (ast.workloadIndex - 60.0) / 40.0;
        fatigueRate += excessWorkload * 0.6;
        stress = Math.min(100.0, stress + excessWorkload * 1.5 * deltaHours);
      }

      // Nutrition Score Effect: Sub-optimal nutrition increases physiological exhaustion
      if (ast.nutritionScore < 75.0) {
        fatigueRate += ((75.0 - ast.nutritionScore) / 25.0) * 0.5;
      }

      // Exercise Countermeasure Benefit: Daily exercise mitigates deconditioning and stress
      if (ast.exerciseMinutes >= 45) {
        stress = Math.max(0.0, stress - 0.5 * deltaHours);
      } else if (ast.exerciseMinutes < 20) {
        stress = Math.min(100.0, stress + 0.3 * deltaHours);
      }

      if (ast.availability === 'ON_EVA') {
        fatigueRate *= config.evaWorkloadFatigueMultiplier;
        heartRate = Math.min(145, Math.round(heartRate + 6 * deltaHours));
      }

      fatigue = Math.min(100.0, fatigue + fatigueRate * deltaHours);
      stress = Math.min(100.0, stress + config.baseStressAccumulationRatePerHour * deltaHours);
    }

    // Life support emergency penalties
    if (o2Depleted) {
      spo2 = Math.max(50.0, spo2 - 15.0 * deltaHours);
      heartRate = Math.min(190, heartRate + 25 * deltaHours);
      stress = Math.min(100.0, stress + 30.0 * deltaHours);
      fatigue = Math.min(100.0, fatigue + 20.0 * deltaHours);
    } else if (o2Critical) {
      spo2 = Math.max(88.0, spo2 - 2.0 * deltaHours);
      stress = Math.min(100.0, stress + 5.0 * deltaHours);
    }

    if (co2ScrubberOffline) {
      stress = Math.min(100.0, stress + 6.0 * deltaHours);
      fatigue = Math.min(100.0, fatigue + 4.0 * deltaHours);
      heartRate = Math.min(130, heartRate + 5 * deltaHours);
    }

    if (waterDepleted) {
      stress = Math.min(100.0, stress + 10.0 * deltaHours);
      fatigue = Math.min(100.0, fatigue + 8.0 * deltaHours);
    }

    // Radiation dose accumulation
    let hourlyDoseRateMsv = 0.015; // 0.36 mSv/day inside shielded habitat
    if (ast.availability === 'ON_EVA') {
      hourlyDoseRateMsv = 0.055; // Elevated unshielded on lunar surface
    }
    if (radiationActive) {
      hourlyDoseRateMsv += 0.85; // Solar particle storm
    }
    radiationDose = Number((radiationDose + hourlyDoseRateMsv * deltaHours).toFixed(4));

    // Availability & Medical fitness check
    let avail = ast.availability;
    if (fatigue > 90.0 || spo2 < 85.0 || radiationDose > 250.0) {
      avail = 'MEDICAL_RESTRICTED';
    }

    return {
      ...ast,
      fatigueIndex: Number(fatigue.toFixed(2)),
      stressIndex: Number(stress.toFixed(2)),
      availability: avail,
      biometrics: {
        ...ast.biometrics,
        bloodOxygenPercent: Number(spo2.toFixed(1)),
        heartRateBpm: Math.round(heartRate),
        cumulativeRadiationDoseMsv: radiationDose,
      },
    };
  });

  next.crew = updatedCrew as CrewComplement;

  // Update resource security index
  const o2Ratio = next.habitatResources.oxygenInventoryKg / 300.0;
  const h2oRatio = next.habitatResources.waterInventoryLiters / 1200.0;
  const pwrRatio = next.habitatResources.batteryStateOfChargePercent / 100.0;
  next.habitatResources.resourceSecurityIndex = Math.max(
    0.0,
    Math.min(100.0, Number(((o2Ratio * 0.4 + h2oRatio * 0.3 + pwrRatio * 0.3) * 100.0).toFixed(1)))
  );

  return next;
}

// ============================================================================
// 11. processEmergencies()
// ============================================================================

/**
 * Evaluates contingency thresholds, manages remaining response clocks,
 * and escalates or clears emergency states.
 */
export function processEmergencies(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);

  const o2Critical = next.habitatResources.oxygenInventoryKg <= config.oxygenCriticalThresholdKg;
  const o2Low = next.habitatResources.oxygenInventoryKg <= config.oxygenWarningThresholdKg;
  const cdraFailed = next.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-CDRA-01')?.status === 'FAILED';
  const batteryEmpty = next.habitatResources.batteryStorageKwh <= 1.0;
  const radiationStorm = next.environment.educationalRadiationHazardIndex > config.radiationShelterThresholdIndex;

  // Active emergency countdown
  if (next.emergency.activeScenario && next.emergency.remainingResponseTimeSeconds !== null) {
    const newRemaining = Math.max(
      0.0,
      next.emergency.remainingResponseTimeSeconds - deltaHours * 3600.0
    );
    next.emergency.remainingResponseTimeSeconds = Math.round(newRemaining);

    if (newRemaining <= 0) {
      next.emergency.severity = 'CRITICAL';
      recordEvent(
        next,
        'EMERGENCY',
        'RESPONSE WINDOW EXPIRED',
        `Checklist response window for ${next.emergency.activeScenario} has elapsed. Critical damage incurring.`,
        'CRITICAL'
      );

      // Penalties for expired response deadline
      if (next.emergency.activeScenario === 'SCENARIO-EMG-01-O2-LEAK') {
        next.crew = next.crew.map((c) => ({
          ...c,
          stressIndex: Math.min(100.0, c.stressIndex + 30.0),
          biometrics: { ...c.biometrics, bloodOxygenPercent: Math.max(65.0, c.biometrics.bloodOxygenPercent - 15.0) },
        })) as CrewComplement;
      } else if (next.emergency.activeScenario === 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT') {
        next.crew = next.crew.map((c) => ({
          ...c,
          stressIndex: Math.min(100.0, c.stressIndex + 40.0),
          biometrics: { ...c.biometrics, cumulativeRadiationDoseMsv: c.biometrics.cumulativeRadiationDoseMsv + 50.0 },
        })) as CrewComplement;
      } else if (next.emergency.activeScenario === 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT') {
        next.crew = next.crew.map((c) => ({
          ...c,
          stressIndex: Math.min(100.0, c.stressIndex + 25.0),
          fatigueIndex: Math.min(100.0, c.fatigueIndex + 35.0),
        })) as CrewComplement;
      }
    }
  }

  // Auto-resolve scenarios when physical root conditions have been corrected
  if (next.emergency.activeScenario === 'SCENARIO-EMG-04-COMMS-BLACKOUT' && next.communications.status === 'CONNECTED') {
    next.emergency.activeScenario = null;
    next.emergency.severity = 'NONE';
    next.emergency.remainingResponseTimeSeconds = null;
    recordEvent(next, 'EMERGENCY', 'RECOVERY: Communication Restored', 'DSN carrier lock established. Direct Earth telemetry confirmed.', 'INFO');
  } else if (
    next.emergency.activeScenario === 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT' &&
    next.habitatResources.co2RemovalCapacityKgPerHour >= 0.25
  ) {
    next.emergency.activeScenario = null;
    next.emergency.severity = 'NONE';
    next.emergency.remainingResponseTimeSeconds = null;
    recordEvent(next, 'EMERGENCY', 'RECOVERY: CO2 Scrubbing Restored', 'Atmospheric scrubbing capacity restored to nominal rate.', 'INFO');
  } else if (
    next.emergency.activeScenario === 'SCENARIO-EMG-01-O2-LEAK' &&
    next.habitatResources.oxygenConsumptionRateKgPerHour <= 0.15 &&
    next.emergency.responseActions.some((a) => a.actionId === 'ACT-O2-ISOLATE-LINE')
  ) {
    next.emergency.activeScenario = null;
    next.emergency.severity = 'NONE';
    next.emergency.remainingResponseTimeSeconds = null;
    recordEvent(next, 'EMERGENCY', 'RECOVERY: Cryo Leak Isolated', 'Oxygen feedline isolation confirmed. Consumption nominal.', 'INFO');
  }

  // Triggering new emergencies deterministically
  if (!next.emergency.activeScenario) {
    if (o2Critical) {
      next.emergency.activeScenario = 'CONTINGENCY-O2-SYSTEM-FAILURE';
      next.emergency.severity = 'CRITICAL';
      next.emergency.remainingResponseTimeSeconds = 1800; // 30 minutes
      next.emergency.responseActions = [
        { actionId: 'ACT-O2-01', description: 'Inject auxiliary reserve O2 manifold', status: 'AVAILABLE', authorizedBy: 'CREW_AUTONOMY' },
        { actionId: 'ACT-O2-02', description: 'Recall surface EVA astronauts immediately', status: 'AVAILABLE', authorizedBy: 'GROUND' },
      ];
      recordEvent(next, 'EMERGENCY', 'EMERGENCY: Cabin Oxygen Failure', 'Oxygen levels collapsed below survivable margin.', 'CRITICAL');
    } else if (cdraFailed) {
      next.emergency.activeScenario = 'CONTINGENCY-CDRA-SCRUBBER-FAULT';
      next.emergency.severity = 'WARNING';
      next.emergency.remainingResponseTimeSeconds = 7200; // 2 hours
      next.emergency.responseActions = [
        { actionId: 'ACT-CDRA-01', description: 'Switch to secondary amine bed manual heater', status: 'AVAILABLE', authorizedBy: 'CREW_AUTONOMY' },
      ];
      recordEvent(next, 'EMERGENCY', 'WARNING: Carbon Scrubber Offline', 'CDRA amine bed fault detected. CO2 accumulation underway.', 'WARNING');
    } else if (batteryEmpty) {
      next.emergency.activeScenario = 'CONTINGENCY-EPS-BATTERY-DEPLETION';
      next.emergency.severity = 'WARNING';
      next.emergency.remainingResponseTimeSeconds = 3600; // 1 hour
      next.emergency.responseActions = [
        { actionId: 'ACT-EPS-01', description: 'Shed all non-essential scientific loads', status: 'AVAILABLE', authorizedBy: 'GROUND' },
      ];
      recordEvent(next, 'EMERGENCY', 'WARNING: Power Grid Brownout', 'Battery reserves fully depleted. Habitat on emergency Stirling power only.', 'WARNING');
    } else if (radiationStorm) {
      next.emergency.activeScenario = 'CONTINGENCY-SOLAR-PARTICLE-EVENT';
      next.emergency.severity = 'WARNING';
      next.emergency.remainingResponseTimeSeconds = 1200; // 20 minutes to shelter
      next.emergency.responseActions = [
        { actionId: 'ACT-RAD-01', description: 'Mandate core storm shelter ingress for all crew', status: 'AVAILABLE', authorizedBy: 'GROUND' },
      ];
      recordEvent(next, 'EMERGENCY', 'WARNING: Solar Flare Particle Storm', 'High-energy proton flux crossing danger threshold.', 'WARNING');
    }
  }

  // Clear emergency if physical root cause has been rectified
  if (
    next.emergency.activeScenario === 'CONTINGENCY-O2-SYSTEM-FAILURE' &&
    !o2Low &&
    !o2Critical
  ) {
    next.emergency.activeScenario = null;
    next.emergency.severity = 'NONE';
    next.emergency.remainingResponseTimeSeconds = null;
    next.emergency.responseActions = [];
    recordEvent(next, 'EMERGENCY', 'RECOVERY: Oxygen Reserves Restored', 'Atmospheric oxygen returned to nominal buffer.', 'INFO');
  }

  return next;
}

// ============================================================================
// 12. evaluateMissionStatus()
// ============================================================================

/**
 * Checks overall operational condition and declares MISSION COMPLETE or ABORTED.
 */
export function evaluateMissionStatus(
  state: MissionState,
  _config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  const next = cloneMissionState(state);

  // Check abort conditions
  const o2Depleted = next.habitatResources.oxygenInventoryKg <= 0.0;
  const allCrewIncapacitated = next.crew.every(
    (c) => c.availability === 'MEDICAL_RESTRICTED' || c.biometrics.bloodOxygenPercent < 60.0
  );

  if ((o2Depleted || allCrewIncapacitated) && next.mission.missionStatus !== 'ABORTED') {
    next.mission.missionStatus = 'ABORTED';
    recordEvent(
      next,
      'MISSION',
      'MISSION ABORT TRIGGERED',
      'Critical life support loss or crew medical incapacitation forced emergency ascent abort.',
      'CRITICAL'
    );
    return next;
  }

  // Check completion conditions (30 days completed)
  const totalHours = next.mission.missionDuration * 24.0;
  if (next.mission.elapsedHours >= totalHours && next.mission.missionStatus === 'ACTIVE') {
    next.mission.missionStatus = 'COMPLETED';
    recordEvent(
      next,
      'MISSION',
      'EXPEDITION 30 COMPLETED',
      '30-day lunar surface mission successfully completed. Ready for Earth return staging.',
      'INFO'
    );
  }

  return next;
}

// ============================================================================
// 13. calculateMissionOutcome()
// ============================================================================

/**
 * Computes pedagogical scoring breakdown across crew health, resource margins,
 * system reliability, and overall mission grade.
 */
export function calculateMissionOutcome(
  state: MissionState,
  _config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionOutcome {
  // Crew Health: average readiness and low radiation
  const avgFatigue = state.crew.reduce((sum, c) => sum + c.fatigueIndex, 0) / 4.0;
  const avgStress = state.crew.reduce((sum, c) => sum + c.stressIndex, 0) / 4.0;
  const maxRad = Math.max(...state.crew.map((c) => c.biometrics.cumulativeRadiationDoseMsv));
  const radPenalty = Math.max(0, (maxRad / 250.0) * 40.0);

  const crewHealthScore = Math.max(
    0,
    Math.min(100, Math.round(100.0 - (avgFatigue * 0.35 + avgStress * 0.35 + radPenalty)))
  );

  // Resource Efficiency Score
  const resourceEfficiencyScore = Math.round(state.habitatResources.resourceSecurityIndex);

  // Systems Reliability Score: average condition of all equipment
  const avgCondition =
    state.equipment.reduce((sum, e) => sum + e.condition, 0) / Math.max(1, state.equipment.length);
  const systemsReliabilityScore = Math.round(avgCondition);

  // Science Yield: baseline 85, modified by completed days
  const scienceAchievementScore = Math.min(
    100,
    Math.round((state.mission.missionDay / state.mission.missionDuration) * 90.0)
  );

  // Overall Score
  const overallScore = Math.round(
    crewHealthScore * 0.35 +
    resourceEfficiencyScore * 0.25 +
    systemsReliabilityScore * 0.20 +
    scienceAchievementScore * 0.20
  );

  const success = state.mission.missionStatus !== 'ABORTED' && overallScore >= 60;

  let grade: MissionOutcome['grade'] = 'FAILED';
  if (success) {
    if (overallScore >= 90) grade = 'EXEMPLARY';
    else if (overallScore >= 75) grade = 'PROFICIENT';
    else grade = 'MARGINAL';
  }

  const debriefSummary: string[] = [
    `Mission completed ${state.mission.missionDay} of ${state.mission.missionDuration} sols (${state.mission.elapsedHours.toFixed(1)} hours).`,
    `Crew Health Rating: ${crewHealthScore}/100 (Max cumulative radiation: ${maxRad.toFixed(2)} mSv).`,
    `Resource Security Rating: ${resourceEfficiencyScore}/100 (Oxygen remaining: ${state.habitatResources.oxygenInventoryKg.toFixed(1)} kg).`,
    `Equipment Reliability Rating: ${systemsReliabilityScore}/100.`,
    `Overall Commander Performance: ${grade} (${overallScore}/100).`,
  ];

  return {
    missionSuccess: success,
    overallScore,
    crewHealthScore,
    resourceEfficiencyScore,
    systemsReliabilityScore,
    scienceAchievementScore,
    grade,
    debriefSummary,
  };
}

// ============================================================================
// Single Documented Simulation Tick Order (tickSimulation)
// ============================================================================

/**
 * Executes a single atomic simulation step advancing all coupled domains in strict order:
 *
 * 1. advanceMissionTime()      - Advance elapsed time and mission day
 * 2. simulateEnvironment()     - Update solar position, illumination, and radiation hazard
 * 3. simulatePower()           - Solar/reactor generation vs electrical loads, update battery
 * 4. simulateEquipment()       - Apply power constraints, update machinery wear & status
 * 5. simulateOxygen()          - Metabolic consumption and reserves
 * 6. simulateCO2Removal()      - Scrubbing based on CDRA condition and electrical power
 * 7. simulateWater()           - Water demand, catalytic loop recovery from WRS health
 * 8. simulateFood()            - Deplete caloric rations
 * 9. simulateCrew()            - Fatigue, stress, radiation dose, biometrics & fitness
 * 10. processEmergencies()     - Evaluate safety thresholds, decrement response clocks
 * 11. evaluateMissionStatus()  - Update ACTIVE / COMPLETED / ABORTED flags
 * 12. Record periodic time-series telemetry
 */
export function tickSimulation(
  state: MissionState,
  deltaHours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  if (state.mission.missionStatus !== 'ACTIVE') {
    return state; // Frozen when paused, completed, or aborted
  }

  // 1. Advance Time
  let current = advanceMissionTime(state, deltaHours);

  // 2. Environment
  current = simulateEnvironment(current, deltaHours, config);

  // 3. Power Generation & Storage
  current = simulatePower(current, deltaHours, config);

  // 4. Equipment Status & Mechanical Wear
  current = simulateEquipment(current, deltaHours, config);

  // 5. Oxygen Life Support
  current = simulateOxygen(current, deltaHours, config);

  // 6. Carbon Dioxide Removal
  current = simulateCO2Removal(current, deltaHours, config);

  // 7. Water Loop & Catalytic Recovery
  current = simulateWater(current, deltaHours, config);

  // 8. Food Inventory & Caloric Intake
  current = simulateFood(current, deltaHours, config);

  // 9. Astronaut Biometrics & Human Factors
  current = simulateCrew(current, deltaHours, config);

  // 10. Emergency Processing & Contingency Checklist Clocks
  current = processEmergencies(current, deltaHours, config);

  // 11. Evaluate Operational Status
  current = evaluateMissionStatus(current, config);

  // 12. Periodic Telemetry Logging (every tick)
  recordPeriodicTelemetry(current);

  return current;
}

// ============================================================================
// Internal Helpers: Event & Telemetry Logging
// ============================================================================

function recordEvent(
  state: MissionState,
  category: string,
  title: string,
  details: string,
  severity: MissionEventRecord['severity'],
  metadata?: {
    eventType?: string;
    affectedSystem?: MissionEventRecord['affectedSystem'];
    previousValue?: string | null;
    newValue?: string | null;
    trigger?: string;
    relatedUserAction?: string | null;
    educationalExplanation?: string;
  }
): void {
  const metFormatted = formatSimulationTime(state.mission.elapsedHours, state.mission.missionDay);
  const sys = metadata?.affectedSystem ?? mapCategoryToAffectedSystem(category);

  const event: MissionEventRecord = {
    eventId: `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(state.mission.elapsedHours * 10)}-${Math.floor(Math.random() * 1000)}`,
    timestampHours: state.mission.elapsedHours,
    simulationTime: metFormatted,
    affectedSystem: sys,
    category,
    eventType:
      metadata?.eventType ??
      (severity === 'CRITICAL'
        ? 'CONTINGENCY_ALARM'
        : severity === 'WARNING'
        ? 'THRESHOLD_BREACH'
        : 'EQUIPMENT_STATUS_CHANGE'),
    title,
    details,
    severity,
    previousValue: metadata?.previousValue ?? null,
    newValue: metadata?.newValue ?? null,
    trigger: metadata?.trigger ?? 'Automated simulation engine state transition',
    relatedUserAction: metadata?.relatedUserAction ?? null,
    educationalExplanation: metadata?.educationalExplanation ?? getEducationalExplanation(category, title, severity),
    acknowledged: false,
  };
  state.records.eventHistory.unshift(event);
}

function recordPeriodicTelemetry(state: MissionState): void {
  const hours = state.mission.elapsedHours;

  // Snapshot resources
  state.records.resourceHistory.push({
    timestampHours: hours,
    oxygenKg: state.habitatResources.oxygenInventoryKg,
    waterLiters: state.habitatResources.waterInventoryLiters,
    batteryKwh: state.habitatResources.batteryStorageKwh,
    powerKw: state.habitatResources.powerGenerationKw,
    foodKcal: state.habitatResources.foodInventoryKcal,
  });

  // Limit in-memory history to last 100 snapshots
  if (state.records.resourceHistory.length > 100) {
    state.records.resourceHistory.shift();
  }

  // Snapshot crew wellbeing
  for (const ast of state.crew) {
    state.records.crewWellbeingHistory.push({
      timestampHours: hours,
      astronautId: ast.astronautId,
      fatigueIndex: ast.fatigueIndex,
      stressIndex: ast.stressIndex,
      workloadIndex: ast.workloadIndex,
    });
  }

  if (state.records.crewWellbeingHistory.length > 400) {
    state.records.crewWellbeingHistory.splice(0, 4);
  }
}

// ============================================================================
// Circadian-Aware Multi-Hour Simulation Stepper
// ============================================================================

/**
 * Advances simulation time across multiple hours with realistic circadian sleep cycles.
 * Each 24-hour sol dedicates hours 0-7 to restorative crew sleep unless in active emergency/EVA.
 */
export function advanceWithCircadianCycle(
  state: MissionState,
  hours: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): MissionState {
  let curr = cloneMissionState(state);
  let remaining = hours;
  while (remaining > 0 && curr.mission.missionStatus === 'ACTIVE') {
    const step = Math.min(remaining, 1);
    const hourOfDay = curr.mission.elapsedHours % 24;
    const isSleep = hourOfDay < 8; // 8 hours restorative sleep per 24h sol
    curr.crew = curr.crew.map((c) => {
      if (c.availability === 'ON_EVA' || c.availability === 'MEDICAL_RESTRICTED') return c;
      return {
        ...c,
        availability: isSleep ? 'SLEEPING' : 'AVAILABLE',
        sleepHours: 8.0,
      };
    }) as any;

    curr = tickSimulation(curr, step, config);
    remaining -= step;
  }
  return curr;
}
