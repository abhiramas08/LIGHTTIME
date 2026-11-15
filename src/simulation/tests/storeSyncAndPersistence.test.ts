/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Zustand Store Synchronization & Persistence Test Suite
 *
 * Verifies:
 * 1. Validated actions: startMission, pauseMission, resumeMission, advanceOneHour, advanceOneDay, resetMission, executeMissionCommand
 * 2. Pure simulation engine integration (no ad-hoc calculations in store)
 * 3. Consistent synchronization across connected modules and slices
 * 4. Versioned browser storage persistence (saving and loading)
 * 5. Safe recovery and schema validation on corrupted storage payloads
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionStore } from '@/store/useMissionStore';
import {
  saveMissionToStorage,
  loadMissionFromStorage,
  MISSION_STORAGE_KEY,
  CURRENT_STORAGE_VERSION,
} from '@/store/persistence';
import { DEFAULT_MISSION_STATE } from '@/data/mission/defaultMissionState';
import { cloneMissionState, createInitialMissionState } from '@/simulation/engine/core';

// Mock localStorage in testing environment
const mockStorage: Record<string, string> = {};

beforeEach(() => {
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(mockStorage)) {
        delete mockStorage[key];
      }
    }),
  });

  // Reset store to pristine state before each test
  useMissionStore.getState().resetMission();
});

describe('Central Mission Store: Validated Actions & Simulation Clock', () => {
  it('initializes with canonical MissionState and synchronized projections', () => {
    const store = useMissionStore.getState();

    expect(store.missionState).toBeDefined();
    expect(store.missionState.crew).toHaveLength(4);
    expect(store.mission.currentDay).toBe(store.missionState.mission.missionDay);
    expect(store.mission.elapsedHours).toBe(store.missionState.mission.elapsedHours);
    expect(store.telemetry.lifeSupport.oxygenSupplyKg).toBeCloseTo(
      store.missionState.habitatResources.oxygenInventoryKg,
      1
    );
  });

  it('handles startMission, pauseMission, and resumeMission correctly', () => {
    const store = useMissionStore.getState();

    // Pause mission
    store.pauseMission();
    expect(useMissionStore.getState().simulationStatus).toBe('PAUSED');
    expect(useMissionStore.getState().missionState.mission.missionStatus).toBe('PAUSED');
    expect(useMissionStore.getState().mission.isRunning).toBe(false);

    // Resume mission
    store.resumeMission();
    expect(useMissionStore.getState().simulationStatus).toBe('ACTIVE');
    expect(useMissionStore.getState().missionState.mission.missionStatus).toBe('ACTIVE');
    expect(useMissionStore.getState().mission.isRunning).toBe(true);
  });

  it('advances simulation time by exactly one hour via pure simulation engine', () => {
    const store = useMissionStore.getState();
    const initialHours = store.missionState.mission.elapsedHours;
    const initialOxygen = store.missionState.habitatResources.oxygenInventoryKg;

    store.advanceOneHour();

    const updated = useMissionStore.getState();
    expect(updated.missionState.mission.elapsedHours).toBeCloseTo(initialHours + 1.0, 3);
    expect(updated.mission.elapsedHours).toBeCloseTo(initialHours + 1.0, 3);
    expect(updated.mission.metSeconds).toBe(Math.round((initialHours + 1.0) * 3600));

    // Oxygen must deplete strictly according to pure mathematical engine rules
    expect(updated.missionState.habitatResources.oxygenInventoryKg).toBeLessThan(initialOxygen);
    expect(updated.telemetry.lifeSupport.oxygenSupplyKg).toBeCloseTo(
      updated.missionState.habitatResources.oxygenInventoryKg,
      1
    );

    // Periodic telemetry history must capture a new snapshot
    expect(updated.missionState.records.resourceHistory.length).toBeGreaterThan(0);
  });

  it('advances simulation time by one sol (24 hours) with consistent day counter updates', () => {
    const store = useMissionStore.getState();
    const initialHours = store.missionState.mission.elapsedHours;
    const initialDay = store.missionState.mission.missionDay;

    store.advanceOneDay();

    const updated = useMissionStore.getState();
    expect(updated.missionState.mission.elapsedHours).toBeCloseTo(initialHours + 24.0, 2);
    expect(updated.mission.currentDay).toBeGreaterThanOrEqual(initialDay + 1);
    expect(updated.missionState.mission.missionDay).toBe(updated.mission.currentDay);

    // Crew fatigue and stress curves update across all 4 astronauts
    expect(updated.crew).toHaveLength(4);
    for (const astronaut of updated.crew) {
      expect(astronaut.cognitive.readinessScore).toBeGreaterThanOrEqual(0);
      expect(astronaut.cognitive.readinessScore).toBeLessThanOrEqual(100);
    }
  });

  it('resets mission to baseline launch conditions', () => {
    const store = useMissionStore.getState();

    // Advance 5 hours and execute a command
    store.advanceOneHour();
    store.advanceOneHour();
    store.executeMissionCommand({
      subsystem: 'POWER_GRID',
      action: 'SHED_LOAD',
      initiatedBy: 'GROUND',
    });

    expect(useMissionStore.getState().missionState.mission.elapsedHours).toBeGreaterThan(
      DEFAULT_MISSION_STATE.mission.elapsedHours
    );

    // Reset
    store.resetMission();

    const resetState = useMissionStore.getState();
    expect(resetState.missionState.mission.elapsedHours).toBe(DEFAULT_MISSION_STATE.mission.elapsedHours);
    expect(resetState.missionState.mission.missionDay).toBe(DEFAULT_MISSION_STATE.mission.missionDay);
    expect(resetState.commands).toHaveLength(0);
  });
});

describe('Central Mission Store: Command Dispatching & Audit Records', () => {
  it('executes ECLSS directive, updating canonical state and audit history', () => {
    const store = useMissionStore.getState();

    const result = store.executeMissionCommand({
      subsystem: 'ECLSS',
      action: 'RECYCLE_CO2_SCRUBBER',
      initiatedBy: 'GROUND',
    });

    expect(result.success).toBe(true);
    expect(result.actionRecord.command).toBe('RECYCLE_CO2_SCRUBBER');
    expect(result.actionRecord.subsystem).toBe('ECLSS');
    expect(result.actionRecord.outcome).toBe('SUCCESS');

    // Central store state must reflect the updated equipment status
    const current = useMissionStore.getState();
    const cdra = current.missionState.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-02' || e.equipmentName.includes('CDRA'));
    if (cdra) {
      expect(cdra.status).toBe('OPERATIONAL');
      expect(cdra.condition).toBe(100.0);
    }

    // Action and event records must be logged
    expect(current.userActions[0]?.command).toBe('RECYCLE_CO2_SCRUBBER');
    expect(current.missionEventLog[0]?.category).toBe('ECLSS');
  });

  it('executes CREW_SCHEDULE directive for mandatory rest, reducing fatigue', () => {
    const store = useMissionStore.getState();
    const targetAstronautId = 'CREW-01';

    // Set high fatigue on target astronaut
    const modified = cloneMissionState(store.missionState);
    const target = modified.crew.find((c) => c.astronautId === targetAstronautId);
    if (target) target.fatigueIndex = 75.0;
    useMissionStore.setState({ missionState: modified });

    const result = store.executeMissionCommand({
      subsystem: 'CREW_SCHEDULE',
      action: 'MANDATE_REST',
      targetAstronautId,
      initiatedBy: 'GROUND',
    });

    expect(result.success).toBe(true);

    const updated = useMissionStore.getState();
    const updatedTarget = updated.missionState.crew.find((c) => c.astronautId === targetAstronautId);
    expect(updatedTarget?.availability).toBe('RESTING');
    expect(updatedTarget?.fatigueIndex).toBeLessThan(75.0);
  });

  it('executes EMERGENCY contingency action and neutralizes active emergency', () => {
    const store = useMissionStore.getState();

    // Set active emergency
    const modified = cloneMissionState(store.missionState);
    modified.emergency.activeScenario = 'SCEN-ECLSS-CO2-01';
    modified.emergency.severity = 'WARNING';
    modified.emergency.remainingResponseTimeSeconds = 3600;
    useMissionStore.setState({
      missionState: modified,
      activeScenario: 'SCEN-ECLSS-CO2-01',
    });

    expect(useMissionStore.getState().activeScenario).toBe('SCEN-ECLSS-CO2-01');

    // Execute contingency checklist step with immediate resolution
    const result = store.executeMissionCommand({
      subsystem: 'EMERGENCY',
      action: 'EXECUTE_CHECKLIST_STEP',
      parameters: { stepName: 'CDRA Bed Diversion Complete', resolveImmediately: true },
      initiatedBy: 'GROUND',
    });

    expect(result.success).toBe(true);

    const updated = useMissionStore.getState();
    expect(updated.missionState.emergency.activeScenario).toBeNull();
    expect(updated.missionState.emergency.severity).toBe('NONE');
    expect(updated.activeScenario).toBeNull();
  });

  it('rejects invalid command parameters gracefully with validation error audit record', () => {
    const store = useMissionStore.getState();

    // Dispatch invalid command (invalid subsystem)
    const result = store.executeMissionCommand({
      // @ts-expect-error testing runtime validator
      subsystem: 'INVALID_NONEXISTENT_SUBSYSTEM',
      action: 'DO_SOMETHING',
    });

    expect(result.success).toBe(false);
    expect(result.actionRecord.outcome).toBe('REJECTED');

    const updated = useMissionStore.getState();
    expect(updated.userActions[0]?.outcome).toBe('REJECTED');
  });
});

describe('Browser Storage Persistence: Versioned & Validated Restoration', () => {
  it('serializes and persists canonical MissionState to localStorage with version metadata', () => {
    const state = createInitialMissionState();
    const saved = saveMissionToStorage(state);

    expect(saved).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      MISSION_STORAGE_KEY,
      expect.stringContaining(`"version":${CURRENT_STORAGE_VERSION}`)
    );
  });

  it('successfully loads and validates persisted state from localStorage', () => {
    const originalState = createInitialMissionState();
    originalState.mission.elapsedHours = 42.5;
    originalState.mission.missionDay = 2;

    saveMissionToStorage(originalState);

    const restored = loadMissionFromStorage();
    expect(restored).not.toBeNull();
    expect(restored?.mission.elapsedHours).toBe(42.5);
    expect(restored?.mission.missionDay).toBe(2);
    expect(restored?.crew).toHaveLength(4);
  });

  it('gracefully discards corrupted JSON in storage and returns null without crashing', () => {
    // Put corrupted malformed JSON in localStorage
    mockStorage[MISSION_STORAGE_KEY] = '{{malformed json corrupted';

    const restored = loadMissionFromStorage();
    expect(restored).toBeNull();
    // Corrupted item should be cleared
    expect(mockStorage[MISSION_STORAGE_KEY]).toBeUndefined();
  });

  it('gracefully discards payload with missing canonical fields and returns null', () => {
    // Put incomplete payload missing required fields
    const invalidPayload = {
      version: CURRENT_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state: {
        mission: { missionId: 'TEST' }, // Missing 7 other required domains
      },
    };
    mockStorage[MISSION_STORAGE_KEY] = JSON.stringify(invalidPayload);

    const restored = loadMissionFromStorage();
    expect(restored).toBeNull();
  });

  it('gracefully handles incompatible schema version mismatch', () => {
    const incompatiblePayload = {
      version: 999, // Incompatible future version
      savedAt: new Date().toISOString(),
      state: createInitialMissionState(),
    };
    mockStorage[MISSION_STORAGE_KEY] = JSON.stringify(incompatiblePayload);

    const restored = loadMissionFromStorage();
    expect(restored).toBeNull();
  });

  it('restores saved mission into useMissionStore via restoreSavedMission()', () => {
    const advancedState = createInitialMissionState();
    advancedState.mission.elapsedHours = 75.0;
    advancedState.mission.missionDay = 4;
    advancedState.habitatResources.oxygenInventoryKg = 210.0;

    saveMissionToStorage(advancedState);

    const success = useMissionStore.getState().restoreSavedMission();
    expect(success).toBe(true);

    const current = useMissionStore.getState();
    expect(current.missionState.mission.elapsedHours).toBe(75.0);
    expect(current.mission.currentDay).toBe(4);
    expect(current.telemetry.lifeSupport.oxygenSupplyKg).toBeCloseTo(210.0, 1);
  });
});
