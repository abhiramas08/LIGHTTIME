/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Setup Form Validation & Schema
 */

import { z } from 'zod';

export const missionSetupSchema = z.object({
  missionName: z
    .string()
    .trim()
    .min(3, 'Mission name must be at least 3 characters')
    .max(80, 'Mission name must not exceed 80 characters')
    .regex(/^[a-zA-Z0-9\s\-_–—.:/]+$/, 'Mission name contains invalid characters'),
  commanderCallsign: z
    .string()
    .trim()
    .min(2, 'Callsign must be at least 2 characters')
    .max(40, 'Callsign must not exceed 40 characters'),
  groundStation: z.enum(['Goldstone', 'Madrid', 'Canberra'], {
    errorMap: () => ({ message: 'Please select a valid Deep Space Network station' }),
  }),
  scenarioId: z.enum([
    'STANDARD_MISSION',
    'SOLAR_PARTICLE_EVENT',
    'CO2_SCRUBBER_ANOMALY',
    'EXTENDED_PSR_SORTIE',
  ]),
  difficulty: z.enum(['CADET', 'DIRECTOR', 'COMMANDER']),
  agreedToSafetyRules: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the lunar flight safety rules before launch',
  }),
});

export type MissionSetupFormData = z.infer<typeof missionSetupSchema>;

export const DEFAULT_SETUP_FORM: MissionSetupFormData = {
  missionName: 'LIGHTTIME Expedition 30 – Shackleton Outpost',
  commanderCallsign: 'CDR. E. VANCE',
  groundStation: 'Goldstone',
  scenarioId: 'STANDARD_MISSION',
  difficulty: 'DIRECTOR',
  agreedToSafetyRules: true,
};
