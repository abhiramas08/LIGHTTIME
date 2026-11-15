/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Simulation Engine Configuration & Educational Assumptions
 *
 * Defines all configurable rates, biological consumption metrics, life support
 * efficiencies, power parameters, and psychological stress weights.
 */

export interface SimulationConfig {
  // --- Metabolic & Biological Assumptions ---
  /** Oxygen consumed per active crew member. Unit: kg/hour (Nominal: 0.035 kg/hr = 0.84 kg/day) */
  oxygenConsumptionRatePerCrewKgPerHour: number;
  /** Carbon dioxide produced per active crew member. Unit: kg/hour (Nominal: 0.0417 kg/hr = 1.00 kg/day) */
  co2ExhalationRatePerCrewKgPerHour: number;
  /** Drinking & hygiene water required per crew member. Unit: L/hour (Nominal: 0.125 L/hr = 3.0 L/day) */
  waterConsumptionRatePerCrewLitersPerHour: number;
  /** Caloric intake demanded per crew member. Unit: kcal/hour (Nominal: 125 kcal/hr = 3,000 kcal/day) */
  foodConsumptionRatePerCrewKcalPerHour: number;

  // --- ECLSS & Closed-Loop Recovery ---
  /** Baseline catalytic water loop recycling efficiency (0.0 to 1.0, Nominal: 0.934 = 93.4%) */
  baseWaterRecoveryRate: number;
  /** Nominal CO₂ scrubbing rate of CDRA amine beds. Unit: kg/hour (Nominal: 0.28 kg/hr) */
  nominalCo2RemovalCapacityKgPerHour: number;
  /** Usable oxygen storage tank upper limit. Unit: kg */
  maxOxygenInventoryKg: number;
  /** Usable potable water tank upper limit. Unit: L */
  maxWaterInventoryLiters: number;
  /** Food ration storage upper limit. Unit: kcal */
  maxFoodInventoryKcal: number;

  // --- Electrical Power Subsystem (EPS) ---
  /** Peak generation of tracking photovoltaic arrays during full lunar daylight. Unit: kW */
  baseSolarGenerationPeakKw: number;
  /** Constant electrical output from surface fission Stirling micro-reactor. Unit: kW */
  baseNuclearGenerationKw: number;
  /** Baseline continuous habitat electrical demand (pumps, avionics, lighting). Unit: kW */
  baseHabitatPowerDemandKw: number;
  /** Maximum usable electrical battery storage. Unit: kWh */
  batteryCapacityKwh: number;
  /** Threshold below which low-power shedding degrades non-essential systems (0.0 to 1.0) */
  powerShortageThreshold: number;

  // --- Human Factors, Fatigue & Cognitive Models ---
  /** Fatigue points accumulated per hour of wakefulness. (Range: 0.5 to 3.0) */
  fatigueAccumulationRatePerHour: number;
  /** Fatigue points shed per hour of circadian sleep rest. (Range: 4.0 to 12.0) */
  fatigueRecoveryRatePerSleepHour: number;
  /** Extra fatigue penalty multiplier when an astronaut is on active lunar surface EVA */
  evaWorkloadFatigueMultiplier: number;
  /** Stress points accumulated under nominal steady-state operations per hour */
  baseStressAccumulationRatePerHour: number;
  /** Stress recovery rate during scheduled rest or leisure per hour */
  stressRecoveryRatePerHour: number;
  /** Stress penalty multiplier when life support is in caution or warning status */
  lifeSupportDistressMultiplier: number;

  // --- Environmental & Radiation Physics ---
  /** Solar constant at 1 AU lunar distance. Unit: W/m² */
  solarIrradiance1AuWPerM2: number;
  /** Speed of light in vacuum. Unit: m/s */
  speedOfLightMPerS: number;
  /** Baseline Earth-Moon mean distance. Unit: km */
  meanEarthMoonDistanceKm: number;

  // --- Safety & Anomaly Trigger Thresholds ---
  /** Oxygen reserve level triggering CAUTION advisory. Unit: kg */
  oxygenWarningThresholdKg: number;
  /** Oxygen reserve level triggering CRITICAL abort alarm. Unit: kg */
  oxygenCriticalThresholdKg: number;
  /** Cabin ppCO₂ level triggering CAUTION advisory. Unit: kPa (4.0 mmHg) */
  co2WarningThresholdKpa: number;
  /** Cabin ppCO₂ level triggering CRITICAL hypercapnia emergency. Unit: kPa (7.5 mmHg) */
  co2CriticalThresholdKpa: number;
  /** Battery state of charge triggering battery emergency warning. Unit: % */
  batteryWarningThresholdPercent: number;
  /** Radiation hazard index triggering solar storm shelter ingress */
  radiationShelterThresholdIndex: number;
}

/**
 * Standard default educational simulation configuration calibrated
 * against NASA-STD-3001 and NASA Human Integration Design Handbook (HIDH).
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  // Metabolic baselines (per crew member)
  oxygenConsumptionRatePerCrewKgPerHour: 0.035, // 0.84 kg/day
  co2ExhalationRatePerCrewKgPerHour: 0.0417,    // 1.00 kg/day
  waterConsumptionRatePerCrewLitersPerHour: 0.125, // 3.00 L/day
  foodConsumptionRatePerCrewKcalPerHour: 125.0,    // 3,000 kcal/day

  // Life support loops
  baseWaterRecoveryRate: 0.934,
  nominalCo2RemovalCapacityKgPerHour: 0.28,
  maxOxygenInventoryKg: 1000.0,
  maxWaterInventoryLiters: 5000.0,
  maxFoodInventoryKcal: 500000.0,

  // Power grid
  baseSolarGenerationPeakKw: 45.0,
  baseNuclearGenerationKw: 15.0,
  baseHabitatPowerDemandKw: 28.0,
  batteryCapacityKwh: 200.0,
  powerShortageThreshold: 0.65,

  // Human factors
  fatigueAccumulationRatePerHour: 1.25,
  fatigueRecoveryRatePerSleepHour: 8.0,
  evaWorkloadFatigueMultiplier: 2.2,
  baseStressAccumulationRatePerHour: 0.2,
  stressRecoveryRatePerHour: 5.0,
  lifeSupportDistressMultiplier: 4.5,

  // Physics constants
  solarIrradiance1AuWPerM2: 1361.0,
  speedOfLightMPerS: 299792458,
  meanEarthMoonDistanceKm: 384400,

  // Anomaly thresholds
  oxygenWarningThresholdKg: 60.0,
  oxygenCriticalThresholdKg: 18.0,
  co2WarningThresholdKpa: 0.40,
  co2CriticalThresholdKpa: 0.53,
  batteryWarningThresholdPercent: 20.0,
  radiationShelterThresholdIndex: 50.0,
};
