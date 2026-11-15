/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * NASA Human Research Program (HRP) Evidence Scientific Adapter
 *
 * Translates NASA HRP epidemiological and cognitive performance evidence
 * (Dinges et al., 2023) into educational human factors parameters.
 *
 * STRICT SAFEGUARD:
 * All indices generated here are educational simulation models designed for student
 * decision-training. They do NOT constitute medical diagnoses or clinical telemetry.
 */

import { HrpEvidenceProfile } from './types';
import { FALLBACK_HRP_EVIDENCE } from '@/data/scientific-fallbacks/hrpFallbackData';

export class HrpScientificAdapter {
  /**
   * Retrieve baseline HRP empirical parameters
   */
  public async getEvidenceProfile(): Promise<HrpEvidenceProfile> {
    return FALLBACK_HRP_EVIDENCE;
  }

  /**
   * Calculate educational fatigue compounding rate based on daily sleep hours
   * Model: Deficit below 7.0 hr/sol accelerates fatigue accumulation by 0.45 pts/hr.
   */
  public calculateFatigueAccumulationRate(sleepHoursInSol: number): {
    ratePerHour: number;
    educationalNotice: string;
  } {
    const minStandard = FALLBACK_HRP_EVIDENCE.standardSleepHoursPerSol; // 7.0
    const sleepDeficit = Math.max(0.0, minStandard - sleepHoursInSol);

    // Baseline wakefulness fatigue gain: 1.2 pts/hr
    // Sleep debt penalty: 0.45 * sleepDeficit pts/hr
    const ratePerHour = Number((1.2 + sleepDeficit * 0.45).toFixed(2));

    let educationalNotice = 'NOMINAL REST: Sleep allocation meets NASA 7.0h operational threshold.';
    if (sleepDeficit >= 3.0) {
      educationalNotice = 'SEVERE SLEEP DEBT: Chronic sleep restriction (<4h). High probability of PVT attentional lapses.';
    } else if (sleepDeficit > 0) {
      educationalNotice = 'MILD SLEEP DEBT: Sleep below standard. Elevated fatigue compounding rate active.';
    }

    return {
      ratePerHour,
      educationalNotice,
    };
  }

  /**
   * Estimate Psychomotor Vigilance Task (PVT) attentional lapses (>500ms reaction latency)
   * Non-linear cognitive lapse projection based on cumulative sleep debt hours.
   */
  public estimatePvtLapses(cumulativeSleepDebtHours: number): {
    projectedLapsesPer10MinTest: number;
    cognitiveReadinessClassification: 'OPTIMAL' | 'DEGRADED' | 'IMPAIRED';
  } {
    // Empirical HRP model: Lapses = base + 0.5 * debt^1.3
    const lapses = Math.min(25, Math.round(1.0 + 0.5 * Math.pow(cumulativeSleepDebtHours, 1.3)));

    let classification: 'OPTIMAL' | 'DEGRADED' | 'IMPAIRED' = 'OPTIMAL';
    if (lapses >= 8) classification = 'IMPAIRED';
    else if (lapses >= 4) classification = 'DEGRADED';

    return {
      projectedLapsesPer10MinTest: lapses,
      cognitiveReadinessClassification: classification,
    };
  }
}

export const hrpAdapter = new HrpScientificAdapter();
