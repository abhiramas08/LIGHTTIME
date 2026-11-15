/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * LRO LOLA / LROC Lunar Illumination Scientific Adapter
 *
 * Models grazing polar solar illumination, synodic solar cycles (708.73 hours),
 * and permanently shadowed region (PSR) volatile cold traps.
 */

import { LunarIlluminationProfile } from './types';
import { FALLBACK_ILLUMINATION_PROFILES } from '@/data/scientific-fallbacks/illuminationFallbackData';
import { UnitValidationError } from './apiClient';

export class IlluminationScientificAdapter {
  /**
   * Validate illumination units (% range 0-100, solar elevation degrees)
   */
  public validateIlluminationUnits(profile: LunarIlluminationProfile): void {
    if (profile.currentIlluminationPercent < 0 || profile.currentIlluminationPercent > 100) {
      throw new UnitValidationError('currentIlluminationPercent', profile.currentIlluminationPercent, 'Percent (0 - 100%)');
    }
    if (profile.meanIlluminationPercent < 0 || profile.meanIlluminationPercent > 100) {
      throw new UnitValidationError('meanIlluminationPercent', profile.meanIlluminationPercent, 'Percent (0 - 100%)');
    }
  }

  /**
   * Retrieve illumination profile for a site
   */
  public async getIlluminationProfile(siteKey = 'SHACKLETON_RIDGE_B'): Promise<LunarIlluminationProfile> {
    const profile = (FALLBACK_ILLUMINATION_PROFILES[siteKey] || FALLBACK_ILLUMINATION_PROFILES['SHACKLETON_RIDGE_B']) as LunarIlluminationProfile;
    this.validateIlluminationUnits(profile);
    return profile;
  }

  /**
   * Calculate simulated solar illumination at a specific elapsed mission hour
   */
  public calculateIlluminationAtHour(elapsedHours: number, siteKey = 'SHACKLETON_RIDGE_B'): {
    illuminationPercent: number;
    solarElevationDeg: number;
    isShadowed: boolean;
  } {
    if (siteKey === 'SHACKLETON_FLOOR_PSR') {
      return {
        illuminationPercent: 0.0,
        solarElevationDeg: -8.2,
        isShadowed: true,
      };
    }

    const synodicHours = 708.73;
    const phase = (2 * Math.PI * (elapsedHours % synodicHours)) / synodicHours;
    const solarElevationDeg = Number((1.54 * Math.sin(phase)).toFixed(2));

    // Ridge B maintains elevated sunlight (55% to 95%)
    const rawIllum = 75.0 + 20.0 * Math.sin(phase);
    const illuminationPercent = Number(Math.min(100.0, Math.max(0.0, rawIllum)).toFixed(1));

    return {
      illuminationPercent,
      solarElevationDeg,
      isShadowed: illuminationPercent < 10.0,
    };
  }
}

export const illuminationAdapter = new IlluminationScientificAdapter();
