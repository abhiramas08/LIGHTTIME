/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Setup & Pre-Launch Briefing Test Suite
 *
 * Verifies:
 * 1. Zod validation of setup form inputs (mission name, callsign, DSN station, scenario, safety rules)
 * 2. Pure simulation engine initialization starting strictly at Day 01, Hour 00
 * 3. 30-Day mission duration configuration
 * 4. Initial resource manifest & 4-member crew certification
 * 5. Contingency scenario injection (Standard vs CO2 Scrubber vs SPE alert)
 * 6. Browser storage persistence on launch
 * 7. Reset and confirmation flows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { missionSetupSchema, DEFAULT_SETUP_FORM } from '@/features/setup/setupValidation';
import { MISSION_SCENARIOS } from '@/data/scenarios/missionScenarios';
import { useMissionStore } from '@/store/useMissionStore';
import { loadMissionFromStorage } from '@/store/persistence';

// Mock localStorage
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

  useMissionStore.getState().resetMission();
});

describe('Mission Setup Form Validation', () => {
  it('validates nominal pre-launch setup configuration', () => {
    const parse = missionSetupSchema.safeParse(DEFAULT_SETUP_FORM);
    expect(parse.success).toBe(true);
  });

  it('rejects mission name shorter than 3 characters', () => {
    const invalid = { ...DEFAULT_SETUP_FORM, missionName: 'LT' };
    const parse = missionSetupSchema.safeParse(invalid);
    expect(parse.success).toBe(false);
    if (!parse.success) {
      expect(parse.error.issues[0]?.message).toMatch(/at least 3 characters/i);
    }
  });

  it('rejects mission name longer than 80 characters', () => {
    const invalid = { ...DEFAULT_SETUP_FORM, missionName: 'A'.repeat(85) };
    const parse = missionSetupSchema.safeParse(invalid);
    expect(parse.success).toBe(false);
    if (!parse.success) {
      expect(parse.error.issues[0]?.message).toMatch(/must not exceed 80 characters/i);
    }
  });

  it('rejects empty commander callsign', () => {
    const invalid = { ...DEFAULT_SETUP_FORM, commanderCallsign: ' ' };
    const parse = missionSetupSchema.safeParse(invalid);
    expect(parse.success).toBe(false);
  });

  it('requires mandatory safety flight rules acknowledgment', () => {
    const invalid = { ...DEFAULT_SETUP_FORM, agreedToSafetyRules: false };
    const parse = missionSetupSchema.safeParse(invalid);
    expect(parse.success).toBe(false);
    if (!parse.success) {
      expect(parse.error.issues[0]?.message).toMatch(/acknowledge the lunar flight safety rules/i);
    }
  });

  it('verifies all 4 defined scenarios in the catalog', () => {
    expect(MISSION_SCENARIOS).toHaveLength(4);
    const ids = MISSION_SCENARIOS.map((s) => s.id);
    expect(ids).toContain('STANDARD_MISSION');
    expect(ids).toContain('SOLAR_PARTICLE_EVENT');
    expect(ids).toContain('CO2_SCRUBBER_ANOMALY');
    expect(ids).toContain('EXTENDED_PSR_SORTIE');
  });
});

describe('Mission Setup: Pure Engine Launch & Day 01 Hour 00 Initialization', () => {
  it('creates canonical MissionState starting strictly at Day 01, Hour 00', () => {
    const store = useMissionStore.getState();

    const newMission = store.initializeNewMission({
      missionName: 'Artemis Surface Sol-30',
      commanderCallsign: 'CDR. VALENTINA',
      groundStation: 'Goldstone',
      scenarioId: 'STANDARD_MISSION',
      difficulty: 'DIRECTOR',
      agreedToSafetyRules: true,
    });

    // 1. Must begin at Day 01, Hour 00
    expect(newMission.mission.missionDay).toBe(1);
    expect(newMission.mission.elapsedHours).toBe(0.0);
    expect(newMission.mission.missionDuration).toBe(30);
    expect(newMission.mission.missionStatus).toBe('ACTIVE');

    // 2. Central store state must be updated consistently
    const current = useMissionStore.getState();
    expect(current.mission.currentDay).toBe(1);
    expect(current.mission.elapsedHours).toBe(0.0);
    expect(current.mission.metSeconds).toBe(0);
    expect(current.mission.totalDays).toBe(30);
    expect(current.mission.name).toBe('Artemis Surface Sol-30');
    expect(current.mission.commanderCallsign).toBe('CDR. VALENTINA');

    // 3. Exactly 4 astronauts with nominal initial biometrics
    expect(current.crew).toHaveLength(4);
    for (const astronaut of current.crew) {
      expect(astronaut.cognitive.readinessScore).toBeGreaterThanOrEqual(60);
      expect(astronaut.vitals.bloodOxygenPercent).toBeGreaterThanOrEqual(95.0);
    }

    // 4. Initial consumables initialized at Day 01 baseline
    expect(current.missionState.habitatResources.oxygenInventoryKg).toBeGreaterThanOrEqual(250.0);
    expect(current.missionState.habitatResources.waterInventoryLiters).toBeGreaterThanOrEqual(1000.0);
    expect(current.missionState.habitatResources.batteryStorageKwh).toBeGreaterThanOrEqual(150.0);

    // 5. Initial audit log contains launch event
    expect(current.missionEventLog[0]?.title).toBe('EXPEDITION LAUNCH & SURFACE INITIALIZATION');
    expect(current.missionEventLog[0]?.timestampHours).toBe(0.0);
  });

  it('initializes CO2 Scrubber contingency scenario with active emergency state', () => {
    const store = useMissionStore.getState();

    const anomalyMission = store.initializeNewMission({
      missionName: 'Emergency Anomaly Drill',
      commanderCallsign: 'CDR. CHEN',
      groundStation: 'Madrid',
      scenarioId: 'CO2_SCRUBBER_ANOMALY',
      difficulty: 'COMMANDER',
      agreedToSafetyRules: true,
    });

    expect(anomalyMission.mission.elapsedHours).toBe(0.0);
    expect(anomalyMission.emergency.activeScenario).toBe('SCEN-ECLSS-CO2-01');
    expect(anomalyMission.emergency.severity).toBe('CAUTION');
    expect(anomalyMission.emergency.remainingResponseTimeSeconds).toBe(7200);

    const current = useMissionStore.getState();
    expect(current.activeScenario).toBe('SCEN-ECLSS-CO2-01');
  });

  it('persists newly launched mission to versioned browser storage', () => {
    const store = useMissionStore.getState();

    store.initializeNewMission({
      missionName: 'Storage Validation Sol-30',
      commanderCallsign: 'CDR. HANSEN',
      groundStation: 'Canberra',
      scenarioId: 'STANDARD_MISSION',
      difficulty: 'DIRECTOR',
      agreedToSafetyRules: true,
    });

    const restored = loadMissionFromStorage();
    expect(restored).not.toBeNull();
    expect(restored?.mission.missionName).toBe('Storage Validation Sol-30');
    expect(restored?.mission.missionDay).toBe(1);
    expect(restored?.mission.elapsedHours).toBe(0.0);
    expect(restored?.communications.dsnStation).toBe('Canberra');
  });
});
