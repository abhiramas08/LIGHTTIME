/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Scientific Data Integration Hub (Central Scientific Adapter Coordinator)
 *
 * Coordinates NASA DONKI, LOLA, Illumination, HRP, and OSDR adapters.
 *
 * ARCHITECTURAL SAFEGUARDS:
 * 1. External observations strictly enter through this adapter layer.
 * 2. Raw external data NEVER mutates or overwrites canonical MissionState.
 * 3. Solar flare classifications are NEVER converted into astronaut radiation dose.
 * 4. Derived indices (EducationalSpaceWeatherIndex, TraverseDifficultyIndex) are
 *    prominently marked as educational models.
 * 5. Full offline fallback resilience ensures uninterrupted mission operations.
 */

import {
  ScientificEnvironmentSnapshot,
} from './types';
import { donkiAdapter, DonkiQueryOptions } from './donkiAdapter';
import { lolaAdapter } from './lolaAdapter';
import { illuminationAdapter } from './illuminationAdapter';
import { hrpAdapter } from './hrpAdapter';
import { osdrAdapter } from './osdrAdapter';
import { MissionState } from '@/simulation/models/missionState';

export class ScientificDataHub {
  private currentSnapshot: ScientificEnvironmentSnapshot | null = null;

  /**
   * Synchronize all scientific feeds with multi-tier fallback resilience
   */
  public async syncScientificData(options?: DonkiQueryOptions): Promise<ScientificEnvironmentSnapshot> {
    const [spaceWeather, topography, illumination, humanFactorsEvidence, spaceBiologyStudies] =
      await Promise.all([
        donkiAdapter.getSpaceWeatherAdvisory(options),
        lolaAdapter.getSiteProfile('SHACKLETON_RIDGE_B'),
        illuminationAdapter.getIlluminationProfile('SHACKLETON_RIDGE_B'),
        hrpAdapter.getEvidenceProfile(),
        osdrAdapter.getStudies('spaceflight', options?.forceFallback),
      ]);

    // Determine overall sync status
    let syncStatus: 'ONLINE_SYNC' | 'CACHED' | 'OFFLINE_FALLBACK' = 'OFFLINE_FALLBACK';
    const natures = [
      spaceWeather.provenance.originNature,
      topography.provenance.originNature,
      illumination.provenance.originNature,
      spaceBiologyStudies[0]?.provenance.originNature || 'OFFLINE_FALLBACK',
    ];

    if (natures.includes('LIVE_OBSERVATION')) {
      syncStatus = 'ONLINE_SYNC';
    } else if (natures.includes('CACHED_OBSERVATION')) {
      syncStatus = 'CACHED';
    }

    const snapshot: ScientificEnvironmentSnapshot = {
      timestamp: new Date().toISOString(),
      syncStatus,
      spaceWeather,
      topography,
      illumination,
      humanFactorsEvidence,
      spaceBiologyStudies,
    };

    this.currentSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Retrieve active or cached snapshot, creating fallback snapshot if none exists
   */
  public async getSnapshot(forceFallback = false): Promise<ScientificEnvironmentSnapshot> {
    if (this.currentSnapshot && !forceFallback) {
      return this.currentSnapshot;
    }
    return this.syncScientificData({ forceFallback });
  }

  /**
   * SAFEGUARDED ADAPTER INTEGRATION:
   * Translates scientific observations into habitat environmental stimuli
   * WITHOUT allowing raw external payloads to overwrite or corrupt canonical MissionState.
   *
   * Rules:
   * - Never directly mutates the passed state (pure immutable return).
   * - Never directly converts solar flare class (e.g. X1.2) into astronaut radiation dose.
   * - Only updates designated environmental context indicators:
   *   - lunarIlluminationPercent
   *   - solarPowerAvailabilityPercent
   *   - educationalRadiationHazardIndex
   *   - site elevation and slope
   */
  public mapEnvironmentToMissionState(
    currentState: MissionState,
    snapshot: ScientificEnvironmentSnapshot
  ): { updatedState: MissionState; notifications: string[] } {
    // Perform deep clone to protect original canonical MissionState
    const updatedState: MissionState = JSON.parse(JSON.stringify(currentState));
    const notifications: string[] = [];

    // 1. Map Illumination from LOLA/LROC model
    const illum = snapshot.illumination.currentIlluminationPercent;
    updatedState.environment.lunarIlluminationPercent = illum;
    updatedState.environment.solarPowerAvailabilityPercent = illum;

    // 2. Map Topography from LOLA elevation model
    updatedState.environment.terrainInformation.elevationMeters = snapshot.topography.meanElevationMeters;
    updatedState.environment.terrainInformation.slopeDeg = snapshot.topography.meanSlopeDeg;
    updatedState.environment.terrainInformation.siteName = snapshot.topography.siteName;

    // 3. Map Educational Space Weather Hazard Index
    // Explicitly derived educational index; NOT a medical dose
    const hazardIndex = snapshot.spaceWeather.educationalSpaceWeatherIndex;
    updatedState.environment.educationalRadiationHazardIndex = hazardIndex;

    // 4. Generate operational notifications without touching biometrics or consumables directly
    if (snapshot.spaceWeather.educationalHazardClassification === 'CRITICAL') {
      notifications.push('SPACE WEATHER ALERT: Solar Energetic Particle event active. Habitat storm shelter protocol advised.');
    } else if (snapshot.spaceWeather.dsnInterruptionRiskPercent > 30.0) {
      notifications.push('COMMUNICATION ADVISORY: Elevated solar X-ray flux may induce DSN carrier degradation.');
    }

    if (snapshot.illumination.currentIlluminationPercent < 30.0) {
      notifications.push('ILLUMINATION ADVISORY: Grazing solar shadow detected along ridge. Fission reactor base-load prioritized.');
    }

    return {
      updatedState,
      notifications,
    };
  }
}

export const scientificDataHub = new ScientificDataHub();
