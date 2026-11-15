/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * NASA Scientific Data Integration Layer Test Suite
 *
 * Verifies:
 * 1. NASA DONKI Space Weather Event Retrieval (FLR, CME, SEP, GST) using recorded sample payloads.
 * 2. Request validation, caching, rate-limit handling, retry policies, and unit validation.
 * 3. Offline fallback resilience when NASA APIs are throttled or unavailable.
 * 4. Integration of NASA LOLA elevation, lunar illumination, NASA HRP evidence, and NASA OSDR space biology.
 * 5. Architectural Safeguards:
 *    - External observations enter through scientific adapters.
 *    - Raw external data NEVER overwrites canonical MissionState.
 *    - Solar flare classifications are NEVER converted into astronaut radiation dose.
 *    - Derived hazard scores are explicitly labeled as educational indices.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  donkiAdapter,
  lolaAdapter,
  illuminationAdapter,
  hrpAdapter,
  osdrAdapter,
  scientificDataHub,
  resilientApiClient,
  ScientificApiError,
  UnitValidationError,
} from '@/services/scientific';
import { createInitialMissionState } from '@/simulation/engine/core';

describe('LIGHTTIME NASA Scientific Data Integration Layer', () => {
  beforeEach(() => {
    resilientApiClient.clearCache();
    resilientApiClient.resetRateLimits();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // 1. NASA DONKI Space Weather Event Retrieval & Normalization
  // ==========================================================================
  describe('NASA DONKI Space Weather Event Retrieval (Recorded Sample Payloads)', () => {
    it('retrieves and normalizes Solar Flares (/DONKI/FLR) with correct X-ray flux and NOAA R-scale', async () => {
      const flares = await donkiAdapter.getSolarFlares({ forceFallback: true });

      expect(flares.length).toBeGreaterThanOrEqual(3);

      const xFlare = flares.find((f) => f.classType === 'X1.2');
      expect(xFlare).toBeDefined();
      expect(xFlare!.flrId).toBe('2024-03-28T14:48:00-FLR-001');
      // Peak flux for X1.2: 1.2 * 10^-4 W/m^2
      expect(xFlare!.peakXRayFluxWattsPerM2).toBeCloseTo(1.2e-4, 6);
      expect(xFlare!.radioBlackoutScale).toBe('R3_STRONG');
      expect(xFlare!.provenance.source).toBe('NASA_DONKI');

      const mFlare = flares.find((f) => f.classType === 'M5.4');
      expect(mFlare).toBeDefined();
      // Peak flux for M5.4: 5.4 * 10^-5 W/m^2
      expect(mFlare!.peakXRayFluxWattsPerM2).toBeCloseTo(5.4e-5, 6);
      expect(mFlare!.radioBlackoutScale).toBe('R2_MODERATE');
    });

    it('retrieves and normalizes Coronal Mass Ejections (/DONKI/CME) with velocity and transit time', async () => {
      const cmes = await donkiAdapter.getCoronalMassEjections({ forceFallback: true });

      expect(cmes.length).toBeGreaterThanOrEqual(2);

      const fastCme = cmes.find((c) => c.activityId === '2024-03-28T15:24:00-CME-001');
      expect(fastCme).toBeDefined();
      expect(fastCme!.speedKmPerS).toBe(1240); // km/s
      expect(fastCme!.halfAngleDeg).toBe(48);
      expect(fastCme!.isEarthDirected).toBe(true);
      // Transit time across 1 AU at 1240 km/s should be ~33-34 hours
      expect(fastCme!.transitTimeHours).toBeGreaterThan(20);
      expect(fastCme!.transitTimeHours).toBeLessThan(45);
    });

    it('retrieves and normalizes Solar Energetic Particle events (/DONKI/SEP) with integral proton fluxes', async () => {
      const seps = await donkiAdapter.getSolarEnergeticParticles({ forceFallback: true });

      expect(seps.length).toBeGreaterThanOrEqual(2);

      const highSep = seps[0];
      expect(highSep).toBeDefined();
      expect(highSep!.protonFlux10MevPfu).toBe(180.0);
      expect(highSep!.protonFlux100MevPfu).toBe(12.0);
      expect(highSep!.radiationStormScale).toBe('S2_MODERATE');
      expect(highSep!.biologicalHazardAlert).toMatch(/Habitat storm shelter mandatory/i);
    });

    it('retrieves and normalizes Geomagnetic Storms (/DONKI/GST) with Kp index and G-scale', async () => {
      const gsts = await donkiAdapter.getGeomagneticStorms({ forceFallback: true });

      expect(gsts.length).toBeGreaterThanOrEqual(1);

      const storm = gsts[0];
      expect(storm).toBeDefined();
      expect(storm!.maxKpIndex).toBeCloseTo(7.33, 2);
      expect(storm!.geomagneticStormScale).toBe('G3_STRONG');
    });
  });

  // ==========================================================================
  // 2. Request Validation, Caching, Rate-Limiting & Retries
  // ==========================================================================
  describe('Resilience, Request Validation, Caching & Retry Policies', () => {
    it('validates request date format and enforces maximum query window', () => {
      // Valid range within 30 days
      expect(() => {
        resilientApiClient.validateDateRange('2024-01-01', '2024-01-20', 30);
      }).not.toThrow();

      // Invalid format
      expect(() => {
        resilientApiClient.validateDateRange('01-01-2024', '2024-01-20', 30);
      }).toThrow(ScientificApiError);

      // Start after end
      expect(() => {
        resilientApiClient.validateDateRange('2024-02-01', '2024-01-01', 30);
      }).toThrow(/cannot be after/i);

      // Range exceeding 30 days
      expect(() => {
        resilientApiClient.validateDateRange('2024-01-01', '2024-03-01', 30);
      }).toThrow(/exceeds maximum allowed query window/i);
    });

    it('caches responses in memory and sets CACHED_OBSERVATION provenance', async () => {
      const mockPayload = [{ flrID: 'TEST-FLR', beginTime: '2024-01-01', peakTime: '2024-01-01', classType: 'C1.0', sourceLocation: 'N01E01' }];

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '29',
        }),
        json: async () => mockPayload,
      } as any);

      // First fetch: LIVE_OBSERVATION
      const res1 = await resilientApiClient.fetchWithResilience({
        url: 'https://api.nasa.gov/DONKI/FLR?test=1',
        source: 'NASA_DONKI',
        version: '1.0',
        sourceUrl: 'https://api.nasa.gov',
        attributionNotice: 'NASA',
      });

      expect(res1.provenance.originNature).toBe('LIVE_OBSERVATION');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Second fetch with same URL: should hit cache without invoking fetch again
      const res2 = await resilientApiClient.fetchWithResilience({
        url: 'https://api.nasa.gov/DONKI/FLR?test=1',
        source: 'NASA_DONKI',
        version: '1.0',
        sourceUrl: 'https://api.nasa.gov',
        attributionNotice: 'NASA',
      });

      expect(res2.provenance.originNature).toBe('CACHED_OBSERVATION');
      expect(fetchSpy).toHaveBeenCalledTimes(1); // No additional network call
    });

    it('gracefully degrades to offline fallback data on HTTP 429 rate-limiting', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({
          'Retry-After': '30',
        }),
      } as any);

      const fallbackFlares = [{ flrId: 'FALLBACK-01', classType: 'M1.0' }];

      const res = await resilientApiClient.fetchWithResilience({
        url: 'https://api.nasa.gov/DONKI/FLR?throttled=true',
        source: 'NASA_DONKI',
        version: '1.0',
        sourceUrl: 'https://api.nasa.gov',
        attributionNotice: 'NASA',
        fallbackData: fallbackFlares,
      });

      expect(res.data).toEqual(fallbackFlares);
      expect(res.provenance.originNature).toBe('OFFLINE_FALLBACK');

      const rateLimitStatus = resilientApiClient.getRateLimitStatus('NASA_DONKI');
      expect(rateLimitStatus.isThrottled).toBe(true);
    });

    it('retries on network failures with exponential backoff before fallback', async () => {
      let callCount = 0;
      vi.spyOn(global, 'fetch').mockImplementation(async () => {
        callCount++;
        throw new Error('Network Connection Error');
      });

      const fallback = [{ id: 'FB-01' }];
      const res = await resilientApiClient.fetchWithResilience({
        url: 'https://api.nasa.gov/DONKI/test-retries',
        source: 'NASA_DONKI',
        version: '1.0',
        sourceUrl: 'https://api.nasa.gov',
        attributionNotice: 'NASA',
        maxRetries: 2,
        fallbackData: fallback,
      });

      // Attempt 0 + retry 1 + retry 2 = 3 calls
      expect(callCount).toBe(3);
      expect(res.data).toEqual(fallback);
      expect(res.provenance.originNature).toBe('OFFLINE_FALLBACK');
    });

    it('performs unit validation and throws UnitValidationError on invalid dimensions', () => {
      expect(() => {
        lolaAdapter.validateTopographicUnits({
          siteId: 'TEST',
          siteName: 'Test',
          centerCoordinates: { latitudeDeg: 0, longitudeDeg: 0 },
          meanElevationMeters: NaN, // Invalid unit/number
          minElevationMeters: 0,
          maxElevationMeters: 0,
          meanSlopeDeg: 10,
          maxSlopeDeg: 15,
          surfaceRoughnessRmsMeters: 1.0,
          educationalTraverseDifficultyIndex: 20,
          elevationTransect: [],
          provenance: {} as any,
        });
      }).toThrow(UnitValidationError);
    });
  });

  // ==========================================================================
  // 3. NASA LOLA Topographical Elevation Dataset
  // ==========================================================================
  describe('NASA LOLA Elevation Dataset & Topographical Analysis', () => {
    it('retrieves high-resolution South Pole site profiles with PDS Geosciences provenance', async () => {
      const site = await lolaAdapter.getSiteProfile('SHACKLETON_RIDGE_B');

      expect(site.siteId).toBe('SITE-SHACKLETON-RIDGE-B');
      expect(site.meanElevationMeters).toBe(1240.0);
      expect(site.meanSlopeDeg).toBe(9.8);
      expect(site.elevationTransect.length).toBe(10);
      expect(site.provenance.source).toBe('NASA_LOLA');
    });

    it('calculates slope accurately from elevation differential and baseline distance', () => {
      // 100 m elevation rise over 1000 m horizontal distance = arctan(0.1) = 5.71 deg
      const slope = lolaAdapter.calculateSlope(1000, 1100, 1000);
      expect(slope).toBeCloseTo(5.71, 1);

      // Vertical cliff: 500m over 0m
      expect(lolaAdapter.calculateSlope(1000, 1500, 0)).toBe(0.0);
    });

    it('evaluates surface traverse safety along elevation transect', async () => {
      const site = await lolaAdapter.getSiteProfile('SHACKLETON_RIDGE_B');
      const assessment = lolaAdapter.evaluateTraverseSafety(site.elevationTransect);

      expect(assessment.maxSlopeDeg).toBe(28.4);
      expect(assessment.hazardZonesCount).toBe(1); // Pt 9 slope is 28.4 deg (>=20)
      expect(assessment.operationalAdvice).toMatch(/TRAVERSE RESTRICTED|Autonomous path re-routing/i);
    });
  });

  // ==========================================================================
  // 4. Lunar Illumination Dataset
  // ==========================================================================
  describe('LRO Lunar Illumination Dataset & Permanently Shadowed Regions', () => {
    it('models polar grazing sunlight and correctly identifies Shackleton Ridge B vs Interior PSR', async () => {
      const ridgeProfile = await illuminationAdapter.getIlluminationProfile('SHACKLETON_RIDGE_B');
      expect(ridgeProfile.meanIlluminationPercent).toBe(76.5);
      expect(ridgeProfile.isPermanentlyShadowedRegion).toBe(false);

      const psrProfile = await illuminationAdapter.getIlluminationProfile('SHACKLETON_FLOOR_PSR');
      expect(psrProfile.meanIlluminationPercent).toBe(0.0);
      expect(psrProfile.isPermanentlyShadowedRegion).toBe(true);
      expect(psrProfile.cryogenicTemperatureKelvin).toBe(38.0); // 38 K volatile trap
    });

    it('simulates 708.73-hour synodic cycle illumination oscillation', () => {
      const stepHour0 = illuminationAdapter.calculateIlluminationAtHour(0, 'SHACKLETON_RIDGE_B');
      const stepHour177 = illuminationAdapter.calculateIlluminationAtHour(177.18, 'SHACKLETON_RIDGE_B'); // 1/4 synodic cycle

      expect(stepHour0.illuminationPercent).toBeGreaterThan(50.0);
      expect(stepHour177.solarElevationDeg).toBeCloseTo(1.54, 1);
    });
  });

  // ==========================================================================
  // 5. NASA Human Research Program Evidence
  // ==========================================================================
  describe('NASA Human Research Program (HRP) Evidence Models', () => {
    it('calculates fatigue compounding penalty when sleep falls below NASA 7.0h standard', () => {
      // 8.0 hours sleep (recommended)
      const rested = hrpAdapter.calculateFatigueAccumulationRate(8.0);
      expect(rested.ratePerHour).toBe(1.2); // Base wakefulness rate

      // 4.0 hours sleep (3.0 hours deficit)
      const sleepDeprived = hrpAdapter.calculateFatigueAccumulationRate(4.0);
      // 1.2 + 3.0 * 0.45 = 2.55 pts/hr
      expect(sleepDeprived.ratePerHour).toBe(2.55);
      expect(sleepDeprived.educationalNotice).toMatch(/SEVERE SLEEP DEBT/i);
    });

    it('estimates PVT attentional lapses non-linearly with cumulative sleep debt', () => {
      const noDebt = hrpAdapter.estimatePvtLapses(0);
      expect(noDebt.projectedLapsesPer10MinTest).toBe(1);
      expect(noDebt.cognitiveReadinessClassification).toBe('OPTIMAL');

      const heavyDebt = hrpAdapter.estimatePvtLapses(10);
      expect(heavyDebt.projectedLapsesPer10MinTest).toBeGreaterThanOrEqual(8);
      expect(heavyDebt.cognitiveReadinessClassification).toBe('IMPAIRED');
    });
  });

  // ==========================================================================
  // 6. NASA OSDR Space Biology Studies
  // ==========================================================================
  describe('NASA Open Science Data Repository (OSDR) Space Biology', () => {
    it('retrieves peer-reviewed space biology studies with biological stressors and takeaways', async () => {
      const studies = await osdrAdapter.getStudies('spaceflight', true);

      expect(studies.length).toBeGreaterThanOrEqual(3);

      const rrlStudy = studies.find((s) => s.studyId === 'OSD-379');
      expect(rrlStudy).toBeDefined();
      expect(rrlStudy!.organism).toContain('Mus musculus');
      expect(rrlStudy!.biologicalStressors).toContain('Galactic Cosmic Ray (GCR) 33-beam simulation');

      const heraStudy = studies.find((s) => s.studyId === 'OSD-137');
      expect(heraStudy).toBeDefined();
      expect(heraStudy!.organism).toContain('Homo sapiens');
      expect(heraStudy!.educationalTakeaways.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 7. Architectural Safeguards
  // ==========================================================================
  describe('Architectural Safeguards & Non-Mutation Boundaries', () => {
    it('SAFEGUARD 1: Never allows raw external data to overwrite MissionState directly', async () => {
      const initialMissionState = createInitialMissionState();
      const initialSnapshot = await scientificDataHub.getSnapshot(true);

      // Capture deep baseline before mapping
      const baselineJson = JSON.stringify(initialMissionState);

      const result = scientificDataHub.mapEnvironmentToMissionState(initialMissionState, initialSnapshot);

      // Verify the original state object was NOT mutated
      expect(JSON.stringify(initialMissionState)).toBe(baselineJson);

      // Verify the returned state is a clean new instance
      expect(result.updatedState).not.toBe(initialMissionState);

      // Verify astronaut biometrics remain governed strictly by physiological solvers, NOT external feeds
      expect(result.updatedState.crew[0].biometrics.heartRateBpm).toBe(initialMissionState.crew[0].biometrics.heartRateBpm);
      expect(result.updatedState.crew[0].biometrics.bloodOxygenPercent).toBe(initialMissionState.crew[0].biometrics.bloodOxygenPercent);
    });

    it('SAFEGUARD 2: Solar flare classifications are NEVER converted into astronaut radiation dose', async () => {
      const initialMissionState = createInitialMissionState();

      const snapshot = await scientificDataHub.getSnapshot(true);

      // Verify snapshot has an X1.2 solar flare
      const xFlare = snapshot.spaceWeather.solarFlares.find((f) => f.classType === 'X1.2');
      expect(xFlare).toBeDefined();

      const result = scientificDataHub.mapEnvironmentToMissionState(initialMissionState, snapshot);

      // The astronaut's physical cumulative radiation dose MUST NOT change simply because an X-class flare exists!
      // (Flare X-rays are photons; acute particulate radiation dose is only driven by proton flux in SPEs)
      result.updatedState.crew.forEach((astronaut, idx) => {
        const baselineDose = initialMissionState.crew[idx]!.biometrics.cumulativeRadiationDoseMsv;
        expect(astronaut.biometrics.cumulativeRadiationDoseMsv).toBe(baselineDose);
      });
    });

    it('SAFEGUARD 3: Any derived space weather hazard index is clearly labeled as an educational model', async () => {
      const snapshot = await scientificDataHub.getSnapshot(true);
      const advisory = snapshot.spaceWeather;

      // The property is explicitly named educationalSpaceWeatherIndex
      expect(advisory.educationalSpaceWeatherIndex).toBeDefined();
      expect(advisory.educationalSpaceWeatherIndex).toBeGreaterThanOrEqual(0);
      expect(advisory.educationalSpaceWeatherIndex).toBeLessThanOrEqual(100);

      // The flares explicitly carry scientific safeguard notes
      advisory.solarFlares.forEach((flare) => {
        expect(flare.scientificNote).toMatch(/SAFEGUARD.*do NOT directly contribute particulate ionizing radiation dose/i);
      });
    });

    it('SAFEGUARD 4: Simulator continues functioning with 100% fidelity when NASA services are offline', async () => {
      // Mock fetch to reject completely (simulating offline disconnected client)
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('DNS Resolution Failed / Offline'));

      const snapshot = await scientificDataHub.syncScientificData({ forceFallback: false });

      // Even with complete internet failure, the system falls back gracefully
      expect(snapshot).toBeDefined();
      expect(snapshot.syncStatus).toBe('OFFLINE_FALLBACK');
      expect(snapshot.spaceWeather.solarFlares.length).toBeGreaterThan(0);
      expect(snapshot.topography.elevationTransect.length).toBeGreaterThan(0);
      expect(snapshot.spaceBiologyStudies.length).toBeGreaterThan(0);
    });
  });
});
