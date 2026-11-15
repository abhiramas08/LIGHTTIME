/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Scientific Data Integration Layer – Type Definitions & Contracts
 *
 * Defines contracts for NASA DONKI, LOLA elevation, lunar illumination,
 * Human Research Program (HRP), and Open Science Data Repository (OSDR).
 *
 * Strict Rules:
 * 1. External observations never overwrite MissionState directly.
 * 2. Solar flare classifications are NEVER directly converted into astronaut radiation dose.
 * 3. Any derived hazard index is clearly labeled as an educational model.
 * 4. Provenance and SI unit validation are mandatory on all ingested structures.
 */

export type ScientificSourceId =
  | 'NASA_DONKI'
  | 'NASA_LOLA'
  | 'NASA_ILLUMINATION'
  | 'NASA_HRP'
  | 'NASA_OSDR';

export type DataOriginNature =
  | 'LIVE_OBSERVATION'
  | 'CACHED_OBSERVATION'
  | 'OFFLINE_FALLBACK';

export interface DataProvenance {
  /** Source identifier (e.g., NASA_DONKI, NASA_LOLA) */
  source: ScientificSourceId;
  /** ISO timestamp of data retrieval */
  retrievalTimestamp: string;
  /** Authoritative upstream version string */
  version: string;
  /** Provenance nature of data */
  originNature: DataOriginNature;
  /** Canonical upstream URL */
  sourceUrl: string;
  /** Attribution & public domain / license acknowledgment */
  attributionNotice: string;
  /** Optional integrity checksum / hash */
  checksum?: string;
}

export interface RateLimitStatus {
  /** Configured limit per time window */
  limit: number;
  /** Remaining queries in window */
  remaining: number;
  /** Timestamp when rate limit resets */
  resetTimeMs: number;
  /** Whether the client is currently throttled */
  isThrottled: boolean;
}

// ============================================================================
// 1. NASA DONKI Space Weather Models
// ============================================================================

/** NOAA Radio Blackout Scale based on GOES 0.1-0.8 nm peak X-ray flux */
export type NoaaRadioBlackoutScale =
  | 'R0_NONE'
  | 'R1_MINOR'     // M1 flare (10^-5 W/m^2)
  | 'R2_MODERATE'  // M5 flare (5*10^-5 W/m^2)
  | 'R3_STRONG'    // X1 flare (10^-4 W/m^2)
  | 'R4_SEVERE'    // X10 flare (10^-3 W/m^2)
  | 'R5_EXTREME';  // X20+ flare (2*10^-3 W/m^2)

/** NOAA Solar Radiation Storm Scale based on >10 MeV proton flux (PFU) */
export type NoaaRadiationStormScale =
  | 'S0_NONE'
  | 'S1_MINOR'     // >= 10 PFU
  | 'S2_MODERATE'  // >= 100 PFU
  | 'S3_STRONG'    // >= 1,000 PFU
  | 'S4_SEVERE'    // >= 10,000 PFU
  | 'S5_EXTREME';  // >= 100,000 PFU

/** NOAA Geomagnetic Storm Scale based on Kp index */
export type NoaaGeomagneticStormScale =
  | 'G0_NONE'
  | 'G1_MINOR'     // Kp = 5
  | 'G2_MODERATE'  // Kp = 6
  | 'G3_STRONG'    // Kp = 7
  | 'G4_SEVERE'    // Kp = 8
  | 'G5_EXTREME';  // Kp = 9

export interface NormalizedSolarFlare {
  flrId: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  /** GOES flare classification string (e.g., "X1.2", "M5.4") */
  classType: string;
  /** Peak X-ray flux in Watts per square meter (W/m^2) */
  peakXRayFluxWattsPerM2: number;
  sourceLocation: string;
  activeRegionNum?: number;
  /** NOAA Radio Blackout designation (HF radio propagation interference) */
  radioBlackoutScale: NoaaRadioBlackoutScale;
  /**
   * Scientific note: Flare X-rays travel at light speed and cause radio propagation
   * blackouts on the sunlit lunar hemisphere, but do NOT directly contribute particulate
   * ionizing radiation dose to shielded astronauts.
   */
  scientificNote: string;
  provenance: DataProvenance;
}

export interface NormalizedCme {
  activityId: string;
  startTime: string;
  /** Plane-of-sky or 3D speed in km/s (SI velocity) */
  speedKmPerS: number;
  /** Angular width / half-angle in degrees */
  halfAngleDeg: number;
  latitudeDeg: number;
  longitudeDeg: number;
  catalogType: string;
  isEarthDirected: boolean;
  /** Estimated shock transit time to Earth-Moon system in hours */
  transitTimeHours: number;
  provenance: DataProvenance;
}

export interface NormalizedSep {
  sepId: string;
  eventTime: string;
  /** Integral proton flux > 10 MeV in Proton Flux Units: protons / (cm^2 * s * sr) */
  protonFlux10MevPfu: number;
  /** Integral proton flux > 100 MeV in Proton Flux Units: protons / (cm^2 * s * sr) */
  protonFlux100MevPfu: number;
  /** NOAA Solar Radiation Storm level */
  radiationStormScale: NoaaRadiationStormScale;
  /**
   * Scientific note: High-energy protons (>100 MeV) penetrate habitat shielding
   * and represent the primary acute biological radiation threat during EVAs.
   */
  biologicalHazardAlert: string;
  provenance: DataProvenance;
}

export interface NormalizedGst {
  gstId: string;
  startTime: string;
  /** Peak observed planetary Kp index [0 - 9] */
  maxKpIndex: number;
  geomagneticStormScale: NoaaGeomagneticStormScale;
  provenance: DataProvenance;
}

export interface SpaceWeatherAdvisory {
  timestamp: string;
  solarFlares: NormalizedSolarFlare[];
  coronalMassEjections: NormalizedCme[];
  solarParticleEvents: NormalizedSep[];
  geomagneticStorms: NormalizedGst[];

  /**
   * Educational Space Weather Hazard Index [0 - 100].
   * NOTE: This is a synthetic pedagogical index synthesizing RF blackout risk and
   * SPE proton threat. It is NOT a clinical radiation dose or direct physical measurement.
   */
  educationalSpaceWeatherIndex: number;
  educationalHazardClassification: 'NOMINAL' | 'ELEVATED' | 'HAZARDOUS' | 'SEVERE' | 'CRITICAL';

  /** Estimated probability of lunar-Earth DSN carrier degradation [%] */
  dsnInterruptionRiskPercent: number;
  /** Operational EVA safety directive based on active particle storms */
  evaOperationalRecommendation: string;
  provenance: DataProvenance;
}

// ============================================================================
// 2. NASA LOLA Topographical Elevation Models
// ============================================================================

export interface TopographicTransectPoint {
  distanceKm: number;
  elevationMeters: number;
  slopeDeg: number;
}

export interface LolaSiteProfile {
  siteId: string;
  siteName: string;
  centerCoordinates: {
    latitudeDeg: number;
    longitudeDeg: number;
  };
  /** Elevation relative to 1,737.4 km lunar sphere in meters (m) */
  meanElevationMeters: number;
  minElevationMeters: number;
  maxElevationMeters: number;
  /** Terrain inclination in degrees (0 - 90 deg) */
  meanSlopeDeg: number;
  maxSlopeDeg: number;
  /** RMS surface roughness at 10 m baseline */
  surfaceRoughnessRmsMeters: number;
  /** Educational traverse mobility difficulty index [0 - 100] */
  educationalTraverseDifficultyIndex: number;
  /** 1D topography elevation transect across candidate traverse path */
  elevationTransect: TopographicTransectPoint[];
  provenance: DataProvenance;
}

// ============================================================================
// 3. Lunar Illumination & Permanently Shadowed Regions
// ============================================================================

export interface IlluminationTimelineStep {
  elapsedHours: number;
  solarElevationDeg: number;
  illuminationPercent: number;
}

export interface LunarIlluminationProfile {
  siteId: string;
  siteName: string;
  /** Synodic month duration in hours (708.73 hr = 29.53 Earth days) */
  synodicPeriodHours: number;
  /** Long-term average solar disk visibility on elevated ridge */
  meanIlluminationPercent: number;
  /** Current solar elevation angle above local horizon [-1.54 deg to +1.54 deg] */
  currentSolarElevationDeg: number;
  /** Instantaneous unoccluded solar disk visible [%] */
  currentIlluminationPercent: number;
  /** Longest continuous shadow duration during polar winter [hours] */
  maxConsecutiveShadowHours: number;
  /** Flag identifying permanently shadowed region (PSR) volatile cold trap */
  isPermanentlyShadowedRegion: boolean;
  /** Baseline temperature of PSR cold trap [Kelvin / Celsius] */
  cryogenicTemperatureKelvin: number;
  /** 720-hour (30-sol) simulated illumination timeline */
  monthlyIlluminationTimeline: IlluminationTimelineStep[];
  provenance: DataProvenance;
}

// ============================================================================
// 4. NASA Human Research Program (HRP) Evidence Models
// ============================================================================

export interface HrpEvidenceProfile {
  standardSleepHoursPerSol: number;
  recommendedSleepHoursPerSol: number;
  /** PVT attentional lapse escalation factor per hour of sleep deficit */
  pvtLapseEscalationFactor: number;
  /** Educational fatigue points recovered per hour of restorative sleep */
  fatigueRecoveryRatePerSleepHour: number;
  /** Maximum allowable cumulative career/mission radiation dose (NASA-STD-3001) [mSv] */
  maxPermissibleMissionDoseMsv: number;
  /** Daily exercise countermeasure time standard [minutes/sol] */
  dailyCountermeasureExerciseMinutes: number;
  evidenceReference: string;
  provenance: DataProvenance;
}

// ============================================================================
// 5. NASA Open Science Data Repository (OSDR) Space Biology
// ============================================================================

export interface OsdrStudyRecord {
  studyId: string;
  title: string;
  organism: string;
  missionPayload: string;
  assayType: string;
  biologicalStressors: string[];
  findingsSummary: string;
  /** Educational health takeaways for deep-space mission planners */
  educationalTakeaways: string[];
  provenance: DataProvenance;
}

// ============================================================================
// 6. Aggregated Scientific Environment Snapshot
// ============================================================================

export interface ScientificEnvironmentSnapshot {
  timestamp: string;
  syncStatus: 'ONLINE_SYNC' | 'CACHED' | 'OFFLINE_FALLBACK';
  spaceWeather: SpaceWeatherAdvisory;
  topography: LolaSiteProfile;
  illumination: LunarIlluminationProfile;
  humanFactorsEvidence: HrpEvidenceProfile;
  spaceBiologyStudies: OsdrStudyRecord[];
}
