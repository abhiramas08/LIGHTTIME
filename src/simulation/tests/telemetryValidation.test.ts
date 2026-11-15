import { describe, it, expect } from 'vitest';
import { habitatTelemetrySchema } from '@/simulation/validation/telemetrySchema';
import { astronautSchema } from '@/simulation/validation/crewSchema';
import { INITIAL_HABITAT_TELEMETRY } from '@/data/scenarios/initialScenario';
import { INITIAL_CREW_MEMBERS } from '@/data/crew/crewBaseline';
import { SCIENCE_CONSTANTS } from '@/data/assumptions/constants';

describe('Scientific Telemetry & Validation Solvers', () => {
  it('validates initial nominal habitat telemetry against strict Zod schema', () => {
    const parseResult = habitatTelemetrySchema.safeParse(INITIAL_HABITAT_TELEMETRY);
    expect(parseResult.success).toBe(true);
  });

  it('validates 4-member astronaut crew against physiological bounds schema', () => {
    expect(INITIAL_CREW_MEMBERS).toHaveLength(4);
    for (const astronaut of INITIAL_CREW_MEMBERS) {
      const result = astronautSchema.safeParse(astronaut);
      expect(result.success).toBe(true);
    }
  });

  it('calculates light-time latency matching speed of light physics', () => {
    const distanceMeters = SCIENCE_CONSTANTS.EARTH_MOON_DISTANCE_MEAN_KM * 1000;
    const computedDelaySeconds = distanceMeters / SCIENCE_CONSTANTS.SPEED_OF_LIGHT_M_PER_S;
    
    // Mean delay is approx 1.282 seconds
    expect(computedDelaySeconds).toBeGreaterThan(1.28);
    expect(computedDelaySeconds).toBeLessThan(1.29);
  });
});
