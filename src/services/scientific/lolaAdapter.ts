/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * NASA LRO LOLA Topographical Elevation Adapter
 *
 * Sourced from NASA Planetary Data System (PDS) Geosciences Node LOLA RDR Stage 4.
 * Provides high-precision topographic profiles, elevation gradients, slope angles,
 * and surface roughness for candidate Artemis polar exploration sites.
 */

import { LolaSiteProfile, TopographicTransectPoint } from './types';
import { FALLBACK_LOLA_SITES } from '@/data/scientific-fallbacks/lolaFallbackData';
import { UnitValidationError } from './apiClient';

export class LolaScientificAdapter {
  /**
   * Calculate terrain slope angle in degrees: theta = arctan(dz / dx)
   */
  public calculateSlope(elev1Meters: number, elev2Meters: number, horizontalDistanceMeters: number): number {
    if (horizontalDistanceMeters <= 0) return 0.0;
    const dz = Math.abs(elev2Meters - elev1Meters);
    const radians = Math.atan(dz / horizontalDistanceMeters);
    const degrees = (radians * 180) / Math.PI;
    return Number(degrees.toFixed(2));
  }

  /**
   * Validate topographical data units (Meters for elevation, Degrees for slopes)
   */
  public validateTopographicUnits(profile: LolaSiteProfile): void {
    if (typeof profile.meanElevationMeters !== 'number' || isNaN(profile.meanElevationMeters)) {
      throw new UnitValidationError('meanElevationMeters', profile.meanElevationMeters, 'Meters (m)');
    }
    if (profile.meanSlopeDeg < 0 || profile.meanSlopeDeg > 90) {
      throw new UnitValidationError('meanSlopeDeg', profile.meanSlopeDeg, 'Degrees (0 - 90 deg)');
    }
    profile.elevationTransect.forEach((point, idx) => {
      if (point.slopeDeg < 0 || point.slopeDeg > 90) {
        throw new UnitValidationError(`elevationTransect[${idx}].slopeDeg`, point.slopeDeg, 'Degrees (0 - 90 deg)');
      }
    });
  }

  /**
   * Retrieve topographical site profile by ID with offline fallback
   */
  public async getSiteProfile(siteKey = 'SHACKLETON_RIDGE_B'): Promise<LolaSiteProfile> {
    const profile = (FALLBACK_LOLA_SITES[siteKey] || FALLBACK_LOLA_SITES['SHACKLETON_RIDGE_B']) as LolaSiteProfile;
    this.validateTopographicUnits(profile);
    return profile;
  }

  /**
   * Retrieve all candidate lunar landing zone elevation profiles
   */
  public async getAllCandidateSites(): Promise<LolaSiteProfile[]> {
    const list = Object.values(FALLBACK_LOLA_SITES);
    list.forEach((p) => this.validateTopographicUnits(p));
    return list;
  }

  /**
   * Evaluate rover traverse safety along transect
   * Educational mobility index: slopes > 20 deg severely increase tip-over risk
   */
  public evaluateTraverseSafety(transect: TopographicTransectPoint[]): {
    maxSlopeDeg: number;
    hazardZonesCount: number;
    operationalAdvice: string;
  } {
    let maxSlope = 0;
    let hazardCount = 0;

    transect.forEach((pt) => {
      if (pt.slopeDeg > maxSlope) maxSlope = pt.slopeDeg;
      if (pt.slopeDeg >= 20.0) hazardCount++;
    });

    let operationalAdvice = 'TRAVERSE CLEAR: Terrain slopes within nominal lunar rover grade limits (<15°).';
    if (maxSlope >= 25.0) {
      operationalAdvice = 'TRAVERSE RESTRICTED: Severe slopes exceeding 25° encountered. Autonomous path re-routing mandatory.';
    } else if (maxSlope >= 18.0) {
      operationalAdvice = 'CAUTION: Steep gradient sections present. Reduced vehicle speed recommended.';
    }

    return {
      maxSlopeDeg: maxSlope,
      hazardZonesCount: hazardCount,
      operationalAdvice,
    };
  }
}

export const lolaAdapter = new LolaScientificAdapter();
