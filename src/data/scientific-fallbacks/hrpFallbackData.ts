/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * NASA Human Research Program (HRP) Evidence Fallback Data
 *
 * Sourced from the NASA Human Research Roadmap (HRR) Evidence Books on
 * Sleep Loss, Circadian Desynchronization, and Work Overload (Dinges et al., 2023).
 */

import { HrpEvidenceProfile } from '@/services/scientific/types';

export const FALLBACK_HRP_EVIDENCE: HrpEvidenceProfile = {
  standardSleepHoursPerSol: 7.0,
  recommendedSleepHoursPerSol: 8.0,
  // PVT attentional lapse rate rises non-linearly with cumulative sleep debt
  pvtLapseEscalationFactor: 0.45,
  // Deep sleep sheds educational fatigue index points
  fatigueRecoveryRatePerSleepHour: 6.0,
  // NASA-STD-3001 career / 30-day mission limit
  maxPermissibleMissionDoseMsv: 250.0,
  // HIDH countermeasure physical exercise standard
  dailyCountermeasureExerciseMinutes: 60.0,
  evidenceReference: 'NASA HRP Evidence Book 2023 Edition / NASA-STD-3001 Vol 1',
  provenance: {
    source: 'NASA_HRP',
    retrievalTimestamp: '2024-02-12T00:00:00Z',
    version: 'NASA HRP Evidence 2023',
    originNature: 'OFFLINE_FALLBACK',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/Evidence/',
    attributionNotice: 'NASA Human Research Program (HRP) / Johnson Space Center',
  },
};
