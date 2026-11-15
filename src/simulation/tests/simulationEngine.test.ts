import { describe, it, expect } from 'vitest';
import {
  createInitialMissionState,
  advanceMissionTime,
  simulateOxygen,
  simulateCO2Removal,
  simulateWater,
  simulateFood,
  simulatePower,
  simulateEquipment,
  simulateCrew,
  processEmergencies,
  evaluateMissionStatus,
  calculateMissionOutcome,
  tickSimulation,
  cloneMissionState,
} from '../engine/core';
import { SimulationClock } from '../engine/clock';
import { DEFAULT_SIMULATION_CONFIG } from '../engine/config';
import { MissionState } from '../models/missionState';

describe('LIGHTTIME Simulation Engine Core Tests', () => {
  // ==========================================================================
  // Test 1: Identical inputs produce identical outputs (Pure Determinism)
  // ==========================================================================
  it('guarantees identical inputs produce bit-for-bit identical outputs without random drift', () => {
    const initialState1 = createInitialMissionState();
    const initialState2 = createInitialMissionState();

    expect(JSON.stringify(initialState1)).toBe(JSON.stringify(initialState2));

    // Simulate 24 hours in 1-hour ticks
    let stateA = cloneMissionState(initialState1);
    let stateB = cloneMissionState(initialState2);

    for (let i = 0; i < 24; i++) {
      stateA = tickSimulation(stateA, 1.0, DEFAULT_SIMULATION_CONFIG);
      stateB = tickSimulation(stateB, 1.0, DEFAULT_SIMULATION_CONFIG);
    }

    expect(stateA.mission.elapsedHours).toBe(stateB.mission.elapsedHours);
    expect(stateA.habitatResources.oxygenInventoryKg).toBe(stateB.habitatResources.oxygenInventoryKg);
    expect(stateA.habitatResources.waterInventoryLiters).toBe(stateB.habitatResources.waterInventoryLiters);
    expect(stateA.habitatResources.batteryStorageKwh).toBe(stateB.habitatResources.batteryStorageKwh);
    expect(stateA.crew[0].fatigueIndex).toBe(stateB.crew[0].fatigueIndex);
    expect(JSON.stringify(stateA)).toBe(JSON.stringify(stateB));
  });

  // ==========================================================================
  // Test 2: Resource inventories respect physical limits (No negative numbers)
  // ==========================================================================
  it('strictly enforces non-negative lower bounds and maximum capacity limits on resources', () => {
    const depletedState = createInitialMissionState({
      habitatResources: {
        ...createInitialMissionState().habitatResources,
        oxygenInventoryKg: 0.05, // Almost empty
        waterInventoryLiters: 0.10, // Almost empty
        foodInventoryKcal: 50.0, // Almost empty
        batteryStorageKwh: 5.0, // Low battery
        powerGenerationKw: 0.0, // Zero generation (deep night blackout)
      },
      equipment: [
        {
          equipmentId: 'EQ-EPS-SOLAR-01',
          equipmentName: 'Solar Array',
          condition: 0,
          status: 'FAILED',
          maintenanceRequired: true,
          powerRequirementKw: 0,
        },
        {
          equipmentId: 'EQ-EPS-REACTOR-01',
          equipmentName: 'Nuclear Reactor',
          condition: 0,
          status: 'FAILED',
          maintenanceRequired: true,
          powerRequirementKw: 0,
        },
      ],
    });

    // Simulate 10 hours of heavy demand with zero supply
    const result = tickSimulation(depletedState, 10.0, DEFAULT_SIMULATION_CONFIG);

    // Inventories must floor at 0.0, never negative
    expect(result.habitatResources.oxygenInventoryKg).toBe(0.0);
    expect(result.habitatResources.waterInventoryLiters).toBe(0.0);
    expect(result.habitatResources.foodInventoryKcal).toBe(0.0);
    expect(result.habitatResources.batteryStorageKwh).toBe(0.0);

    // Battery must not exceed maximum capacity under continuous surplus
    const surplusState = createInitialMissionState({
      habitatResources: {
        ...createInitialMissionState().habitatResources,
        batteryStorageKwh: 195.0,
      },
      equipment: [
        {
          equipmentId: 'EQ-EPS-SOLAR-01',
          equipmentName: 'Super Solar Array',
          condition: 100,
          status: 'OPERATIONAL',
          maintenanceRequired: false,
          powerRequirementKw: 0,
        },
      ],
    });

    const chargedState = simulatePower(surplusState, 20.0, DEFAULT_SIMULATION_CONFIG);
    expect(chargedState.habitatResources.batteryStorageKwh).toBeLessThanOrEqual(
      DEFAULT_SIMULATION_CONFIG.batteryCapacityKwh
    );
  });

  // ==========================================================================
  // Test 3: Time advances correctly
  // ==========================================================================
  it('accurately advances elapsed hours and calculates lunar sol day number', () => {
    const clock = new SimulationClock();
    expect(clock.getState().mission.elapsedHours).toBe(14.5);
    expect(clock.getState().mission.missionDay).toBe(1);

    // Advance 1 hour
    clock.advanceOneHour();
    expect(clock.getState().mission.elapsedHours).toBe(15.5);
    expect(clock.getState().mission.missionDay).toBe(1);

    // Advance 24 hours -> crosses into Day 2
    clock.advanceOneDay();
    expect(clock.getState().mission.elapsedHours).toBe(39.5);
    expect(clock.getState().mission.missionDay).toBe(2);

    // Time advancement does not exceed 30 days (720 hours)
    clock.step(1000.0);
    expect(clock.getState().mission.elapsedHours).toBe(720.0);
    expect(clock.getState().mission.missionDay).toBe(30);
  });

  // ==========================================================================
  // Test 4: System dependencies work (Power -> Equipment -> ECLSS -> Crew)
  // ==========================================================================
  it('cascades system dependencies: power failure degrades CDRA, increasing CO2 and crew stress', () => {
    const state = createInitialMissionState();

    // 1. Manually disable CDRA equipment
    const brokenEquipmentState: MissionState = {
      ...state,
      equipment: state.equipment.map((eq) =>
        eq.equipmentId === 'EQ-ECLSS-CDRA-01'
          ? { ...eq, status: 'FAILED' as const, condition: 0 }
          : eq
      ),
    };

    // 2. Simulate CO2 removal with broken equipment
    const co2State = simulateCO2Removal(brokenEquipmentState, 5.0, DEFAULT_SIMULATION_CONFIG);

    // Scrubbing capacity drops to 0
    expect(co2State.habitatResources.co2RemovalCapacityKgPerHour).toBe(0.0);
    expect(co2State.habitatResources.eclssEfficiencyScore).toBe(0.0);

    // 3. Crew simulation under compromised life support increases stress and fatigue
    const baselineCrewState = simulateCrew(state, 5.0, DEFAULT_SIMULATION_CONFIG);
    const distressedCrewState = simulateCrew(co2State, 5.0, DEFAULT_SIMULATION_CONFIG);

    expect(distressedCrewState.crew[0].stressIndex).toBeGreaterThan(
      baselineCrewState.crew[0].stressIndex
    );
    expect(distressedCrewState.crew[0].fatigueIndex).toBeGreaterThan(
      baselineCrewState.crew[0].fatigueIndex
    );
  });

  it('triggers hypoxia biometrics and medical restriction when oxygen reaches zero', () => {
    const zeroO2State = createInitialMissionState({
      habitatResources: {
        ...createInitialMissionState().habitatResources,
        oxygenInventoryKg: 0.0,
      },
    });

    const result = simulateCrew(zeroO2State, 3.0, DEFAULT_SIMULATION_CONFIG);

    // SpO2 drops sharply and heart rate surges
    expect(result.crew[0].biometrics.bloodOxygenPercent).toBeLessThan(90.0);
    expect(result.crew[0].biometrics.heartRateBpm).toBeGreaterThan(100);
    expect(result.crew[0].stressIndex).toBeGreaterThan(50.0);

    // Extreme hypoxia shifts availability to MEDICAL_RESTRICTED
    const heavyHypoxia = simulateCrew(zeroO2State, 10.0, DEFAULT_SIMULATION_CONFIG);
    expect(heavyHypoxia.crew[0].availability).toBe('MEDICAL_RESTRICTED');
  });

  // ==========================================================================
  // Test 5: Reset restores the original state
  // ==========================================================================
  it('restores pristine initial state when clock.reset() is invoked', () => {
    const clock = new SimulationClock();
    const pristineSnapshot = clock.getState();

    // Run clock for 5 days with arbitrary steps
    clock.advanceOneDay();
    clock.advanceOneDay();
    clock.advanceOneDay();
    clock.advanceOneDay();
    clock.advanceOneDay();

    expect(clock.getState().mission.elapsedHours).not.toBe(pristineSnapshot.mission.elapsedHours);
    expect(clock.getState().habitatResources.oxygenInventoryKg).not.toBe(
      pristineSnapshot.habitatResources.oxygenInventoryKg
    );

    // Reset clock
    clock.reset();

    expect(clock.getState().mission.elapsedHours).toBe(pristineSnapshot.mission.elapsedHours);
    expect(clock.getState().mission.missionDay).toBe(pristineSnapshot.mission.missionDay);
    expect(clock.getState().habitatResources.oxygenInventoryKg).toBe(
      pristineSnapshot.habitatResources.oxygenInventoryKg
    );
    expect(JSON.stringify(clock.getState())).toBe(JSON.stringify(pristineSnapshot));
  });

  // ==========================================================================
  // Test 6: Emergency events are reproducible
  // ==========================================================================
  it('reproducibly triggers emergency scenarios, decrements timer, and escalates to critical', () => {
    // Oxygen drops below critical threshold (18 kg)
    const criticalO2State = createInitialMissionState({
      habitatResources: {
        ...createInitialMissionState().habitatResources,
        oxygenInventoryKg: 15.0,
      },
    });

    const emergencyState1 = processEmergencies(criticalO2State, 0.1, DEFAULT_SIMULATION_CONFIG);
    const emergencyState2 = processEmergencies(criticalO2State, 0.1, DEFAULT_SIMULATION_CONFIG);

    // Both instances must produce identical emergency states
    expect(emergencyState1.emergency.activeScenario).toBe('CONTINGENCY-O2-SYSTEM-FAILURE');
    expect(emergencyState1.emergency.severity).toBe('CRITICAL');
    expect(emergencyState1.emergency.responseActions.length).toBeGreaterThan(0);
    expect(JSON.stringify(emergencyState1.emergency)).toBe(JSON.stringify(emergencyState2.emergency));

    // When response time elapses without action, severity escalates
    const expiredTimerState = processEmergencies(emergencyState1, 2.0, DEFAULT_SIMULATION_CONFIG);
    expect(expiredTimerState.emergency.remainingResponseTimeSeconds).toBe(0);
    expect(expiredTimerState.emergency.severity).toBe('CRITICAL');
  });

  // ==========================================================================
  // Test 7: Controlled simulation clock operations (Pause / Resume / Observer)
  // ==========================================================================
  it('controls clock execution state and notifies subscribers on tick', () => {
    const clock = new SimulationClock();
    let notificationCount = 0;

    const unsubscribe = clock.subscribe(() => {
      notificationCount++;
    });

    clock.pause();
    expect(clock.getState().mission.missionStatus).toBe('PAUSED');
    expect(notificationCount).toBe(1);

    clock.resume();
    expect(clock.getState().mission.missionStatus).toBe('ACTIVE');
    expect(notificationCount).toBe(2);

    clock.advanceOneHour();
    expect(notificationCount).toBe(3);

    unsubscribe();
    clock.advanceOneHour();
    expect(notificationCount).toBe(3); // No more notifications after unsubscribe
  });

  // ==========================================================================
  // Test 8: calculateMissionOutcome evaluates pedagogical scores
  // ==========================================================================
  it('computes mission outcome grades and debrief metrics upon completion', () => {
    const completedState = createInitialMissionState({
      mission: {
        ...createInitialMissionState().mission,
        missionDay: 30,
        elapsedHours: 720.0,
        missionStatus: 'COMPLETED',
      },
    });

    const outcome = calculateMissionOutcome(completedState, DEFAULT_SIMULATION_CONFIG);

    expect(outcome.missionSuccess).toBe(true);
    expect(outcome.overallScore).toBeGreaterThanOrEqual(70);
    expect(['EXEMPLARY', 'PROFICIENT', 'MARGINAL']).toContain(outcome.grade);
    expect(outcome.debriefSummary.length).toBeGreaterThanOrEqual(4);
  });

  // ==========================================================================
  // Test 9: Individual Modular Subsystem Function Unit Tests
  // ==========================================================================
  it('correctly executes standalone modular subsystem simulation functions', () => {
    const base = createInitialMissionState();

    // 1. advanceMissionTime
    const timeAdvanced = advanceMissionTime(base, 2.5);
    expect(timeAdvanced.mission.elapsedHours).toBe(17.0);

    // 2. simulateOxygen
    const o2State = simulateOxygen(base, 1.0, DEFAULT_SIMULATION_CONFIG);
    const expectedO2Consumed = 4 * DEFAULT_SIMULATION_CONFIG.oxygenConsumptionRatePerCrewKgPerHour;
    expect(o2State.habitatResources.oxygenInventoryKg).toBeCloseTo(
      base.habitatResources.oxygenInventoryKg - expectedO2Consumed,
      3
    );

    // 3. simulateWater
    const waterState = simulateWater(base, 1.0, DEFAULT_SIMULATION_CONFIG);
    expect(waterState.habitatResources.waterInventoryLiters).toBeLessThan(
      base.habitatResources.waterInventoryLiters
    );

    // 4. simulateFood
    const foodState = simulateFood(base, 2.0, DEFAULT_SIMULATION_CONFIG);
    const expectedFoodConsumed = 4 * DEFAULT_SIMULATION_CONFIG.foodConsumptionRatePerCrewKcalPerHour * 2.0;
    expect(foodState.habitatResources.foodInventoryKcal).toBe(
      base.habitatResources.foodInventoryKcal - expectedFoodConsumed
    );

    // 5. simulateEquipment
    const eqState = simulateEquipment(base, 10.0, DEFAULT_SIMULATION_CONFIG);
    const initialCondition = base.equipment[0]?.condition ?? 100;
    const degradedCondition = eqState.equipment[0]?.condition ?? 0;
    expect(degradedCondition).toBeLessThan(initialCondition);

    // 6. evaluateMissionStatus
    const completedProbe = createInitialMissionState({
      mission: {
        ...base.mission,
        elapsedHours: 720.0,
        missionStatus: 'ACTIVE',
      },
    });
    const evalResult = evaluateMissionStatus(completedProbe, DEFAULT_SIMULATION_CONFIG);
    expect(evalResult.mission.missionStatus).toBe('COMPLETED');
  });
});
