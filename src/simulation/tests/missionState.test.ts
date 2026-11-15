import { describe, it, expect } from 'vitest';
import { missionStateSchema } from '@/simulation/validation/missionStateSchema';
import { DEFAULT_MISSION_STATE } from '@/data/mission/defaultMissionState';
import { MissionState, AstronautRecord } from '@/simulation/models/missionState';

describe('LIGHTTIME Canonical Mission State Model & Schema Validation', () => {
  it('validates the canonical DEFAULT_MISSION_STATE successfully against Zod schema', () => {
    const parseResult = missionStateSchema.safeParse(DEFAULT_MISSION_STATE);
    expect(parseResult.success).toBe(true);
  });

  it('contains all eight mandatory domains in canonical MissionState', () => {
    expect(DEFAULT_MISSION_STATE).toHaveProperty('mission');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('crew');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('habitatResources');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('equipment');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('environment');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('communications');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('emergency');
    expect(DEFAULT_MISSION_STATE).toHaveProperty('records');
  });

  describe('Domain 1: Mission Information', () => {
    it('enforces valid range for missionDay [1, 30] and elapsedHours [0, 720]', () => {
      const invalidDayState: MissionState = {
        ...DEFAULT_MISSION_STATE,
        mission: {
          ...DEFAULT_MISSION_STATE.mission,
          missionDay: 35, // Beyond 30 days
        },
      };
      const result = missionStateSchema.safeParse(invalidDayState);
      expect(result.success).toBe(false);
    });

    it('enforces missionStatus enum values', () => {
      const invalidStatusState = {
        ...DEFAULT_MISSION_STATE,
        mission: {
          ...DEFAULT_MISSION_STATE.mission,
          missionStatus: 'UNKNOWN_STATUS',
        },
      };
      const result = missionStateSchema.safeParse(invalidStatusState);
      expect(result.success).toBe(false);
    });
  });

  describe('Domain 2: Crew Complement & Human Factors', () => {
    it('requires exactly four astronaut records in crew complement', () => {
      expect(DEFAULT_MISSION_STATE.crew).toHaveLength(4);

      // Attempting 3 crew members must fail
      const threeCrewState = {
        ...DEFAULT_MISSION_STATE,
        crew: DEFAULT_MISSION_STATE.crew.slice(0, 3),
      };
      const resultThree = missionStateSchema.safeParse(threeCrewState);
      expect(resultThree.success).toBe(false);

      // Attempting 5 crew members must fail
      const fiveCrewState = {
        ...DEFAULT_MISSION_STATE,
        crew: [...DEFAULT_MISSION_STATE.crew, DEFAULT_MISSION_STATE.crew[0]],
      };
      const resultFive = missionStateSchema.safeParse(fiveCrewState);
      expect(resultFive.success).toBe(false);
    });

    it('strictly separates scientific biometrics from educational indices', () => {
      const commander = DEFAULT_MISSION_STATE.crew[0];

      // Educational indices: bounded [0, 100]
      expect(commander.nutritionScore).toBeGreaterThanOrEqual(0);
      expect(commander.nutritionScore).toBeLessThanOrEqual(100);
      expect(commander.fatigueIndex).toBeGreaterThanOrEqual(0);
      expect(commander.fatigueIndex).toBeLessThanOrEqual(100);
      expect(commander.stressIndex).toBeGreaterThanOrEqual(0);
      expect(commander.stressIndex).toBeLessThanOrEqual(100);
      expect(commander.workloadIndex).toBeGreaterThanOrEqual(0);
      expect(commander.workloadIndex).toBeLessThanOrEqual(100);

      // Scientific measurements: real-world physiological units
      expect(commander.biometrics.heartRateBpm).toBe(68); // BPM
      expect(commander.biometrics.bloodOxygenPercent).toBe(98.5); // %
      expect(commander.biometrics.coreTemperatureCelsius).toBe(36.8); // °C
      expect(commander.biometrics.bloodPressureSystolicMmHg).toBe(118); // mmHg
      expect(commander.biometrics.cumulativeRadiationDoseMsv).toBe(1.25); // mSv
    });

    it('rejects out-of-bounds biometrics or fatigue values', () => {
      const invalidCrew: [AstronautRecord, AstronautRecord, AstronautRecord, AstronautRecord] = [
        {
          ...DEFAULT_MISSION_STATE.crew[0],
          fatigueIndex: 150, // Invalid: max 100
        },
        DEFAULT_MISSION_STATE.crew[1],
        DEFAULT_MISSION_STATE.crew[2],
        DEFAULT_MISSION_STATE.crew[3],
      ];

      const invalidState: MissionState = {
        ...DEFAULT_MISSION_STATE,
        crew: invalidCrew,
      };

      const result = missionStateSchema.safeParse(invalidState);
      expect(result.success).toBe(false);
    });
  });

  describe('Domain 3: Habitat Resources & ECLSS', () => {
    it('verifies oxygen, water, and power units and non-negative constraints', () => {
      const res = DEFAULT_MISSION_STATE.habitatResources;
      expect(res.oxygenInventoryKg).toBeGreaterThan(0);
      expect(res.waterInventoryLiters).toBeGreaterThan(0);
      expect(res.powerGenerationKw).toBeGreaterThan(0);
      expect(res.batteryStorageKwh).toBeGreaterThan(0);
      expect(res.waterRecoveryRatePercent).toBeGreaterThanOrEqual(90);

      // Negative resource values must fail
      const negativeOxygenState: MissionState = {
        ...DEFAULT_MISSION_STATE,
        habitatResources: {
          ...res,
          oxygenInventoryKg: -10,
        },
      };
      expect(missionStateSchema.safeParse(negativeOxygenState).success).toBe(false);
    });
  });

  describe('Domain 4: Equipment Records', () => {
    it('validates equipment condition and status enum', () => {
      expect(DEFAULT_MISSION_STATE.equipment.length).toBeGreaterThanOrEqual(4);
      for (const eq of DEFAULT_MISSION_STATE.equipment) {
        expect(eq.condition).toBeGreaterThanOrEqual(0);
        expect(eq.condition).toBeLessThanOrEqual(100);
        expect(eq.powerRequirementKw).toBeGreaterThanOrEqual(0);
        expect(['OPERATIONAL', 'DEGRADED', 'STANDBY', 'MAINTENANCE_REQUIRED', 'FAILED']).toContain(
          eq.status
        );
      }
    });
  });

  describe('Domain 5: Environment & Terrain', () => {
    it('verifies lunar illumination and polar temperature bounds', () => {
      const env = DEFAULT_MISSION_STATE.environment;
      expect(env.lunarIlluminationPercent).toBeGreaterThanOrEqual(0);
      expect(env.lunarIlluminationPercent).toBeLessThanOrEqual(100);
      expect(env.environmentalTemperatureCelsius).toBeGreaterThanOrEqual(-250);
      expect(env.environmentalTemperatureCelsius).toBeLessThanOrEqual(150);

      // Shackleton rim coordinates
      expect(env.terrainInformation.latitudeDeg).toBeCloseTo(-89.9, 1);
      expect(env.terrainInformation.dustRisk).toBe('MODERATE');
    });
  });

  describe('Domain 6: Communications & Speed-of-Light Delay', () => {
    it('enforces physical one-way light delay between 1.21s and 1.36s', () => {
      const comms = DEFAULT_MISSION_STATE.communications;
      expect(comms.delaySeconds).toBeCloseTo(1.282, 3);
      expect(comms.delaySeconds).toBeGreaterThanOrEqual(1.21);
      expect(comms.delaySeconds).toBeLessThanOrEqual(1.36);

      // Fictional zero-latency comms must fail schema validation
      const zeroLatencyState: MissionState = {
        ...DEFAULT_MISSION_STATE,
        communications: {
          ...comms,
          delaySeconds: 0.05,
        },
      };
      expect(missionStateSchema.safeParse(zeroLatencyState).success).toBe(false);
    });
  });

  describe('Domain 7: Emergency & Contingency', () => {
    it('validates nominal baseline emergency state and non-nominal alerts', () => {
      const emerg = DEFAULT_MISSION_STATE.emergency;
      expect(emerg.activeScenario).toBeNull();
      expect(emerg.severity).toBe('NONE');
      expect(emerg.remainingResponseTimeSeconds).toBeNull();
      expect(emerg.responseActions).toHaveLength(0);

      // Valid active contingency
      const activeContingencyState: MissionState = {
        ...DEFAULT_MISSION_STATE,
        emergency: {
          activeScenario: 'CONTINGENCY-CO2-SPIKE',
          severity: 'WARNING',
          remainingResponseTimeSeconds: 1800,
          responseActions: [
            {
              actionId: 'ACT-01',
              description: 'Cycle CDRA amine bed desorber',
              status: 'IN_PROGRESS',
              authorizedBy: 'GROUND',
            },
          ],
        },
      };
      expect(missionStateSchema.safeParse(activeContingencyState).success).toBe(true);
    });
  });

  describe('Domain 8: Mission Records & Audit Trail', () => {
    it('stores event history, action history, and time-series telemetry', () => {
      const recs = DEFAULT_MISSION_STATE.records;
      expect(recs.eventHistory.length).toBeGreaterThan(0);
      expect(recs.actionHistory.length).toBeGreaterThan(0);
      expect(recs.resourceHistory.length).toBeGreaterThan(0);
      expect(recs.crewWellbeingHistory.length).toBeGreaterThan(0);

      for (const event of recs.eventHistory) {
        expect(event.timestampHours).toBeGreaterThanOrEqual(0);
        expect(['INFO', 'CAUTION', 'WARNING', 'CRITICAL']).toContain(event.severity);
      }
    });
  });
});
