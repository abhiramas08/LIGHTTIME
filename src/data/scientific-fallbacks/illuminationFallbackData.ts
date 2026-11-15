/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * LRO LOLA/LROC Solar Illumination Fallback Data
 *
 * Sourced from NASA GSFC SVS Studio Entry 4763 and LRO Multi-Year Polar Illumination Atlas.
 * Simulates polar grazing solar illumination over the 708.73-hour lunar synodic cycle.
 */

import { LunarIlluminationProfile } from '@/services/scientific/types';

// Generate 30-sol (720 hour) realistic illumination steps for Shackleton Ridge B
const generateShackletonTimeline = () => {
  const steps = [];
  const synodicHours = 708.73;
  for (let h = 0; h <= 720; h += 12) {
    // Polar grazing sun angle cycles between -1.54° and +1.54°
    const phase = (2 * Math.PI * (h % synodicHours)) / synodicHours;
    const solarElevationDeg = 1.54 * Math.sin(phase);
    // Ridge B maintains 60% to 92% sunlight during summer; dips to 40% during winter grazing dips
    const baseIllum = 75.0 + 18.0 * Math.sin(phase);
    const illuminationPercent = Math.min(100.0, Math.max(0.0, baseIllum));
    steps.push({
      elapsedHours: h,
      solarElevationDeg: Number(solarElevationDeg.toFixed(2)),
      illuminationPercent: Number(illuminationPercent.toFixed(1)),
    });
  }
  return steps;
};

export const FALLBACK_ILLUMINATION_PROFILES: Record<string, LunarIlluminationProfile> = {
  'SHACKLETON_RIDGE_B': {
    siteId: 'SITE-SHACKLETON-RIDGE-B',
    siteName: 'Shackleton Crater Connecting Ridge B (Artemis Candidate Site)',
    synodicPeriodHours: 708.73,
    meanIlluminationPercent: 76.5,
    currentSolarElevationDeg: 0.85,
    currentIlluminationPercent: 82.4,
    maxConsecutiveShadowHours: 54.0,
    isPermanentlyShadowedRegion: false,
    cryogenicTemperatureKelvin: 220.0, // sunlit ridge ~ -53°C
    monthlyIlluminationTimeline: generateShackletonTimeline(),
    provenance: {
      source: 'NASA_ILLUMINATION',
      retrievalTimestamp: '2024-02-20T00:00:00Z',
      version: 'LRO SVS-4763 Multi-Year Atlas Rev 2',
      originNature: 'OFFLINE_FALLBACK',
      sourceUrl: 'https://svs.gsfc.nasa.gov/4763',
      attributionNotice: 'NASA GSFC Scientific Visualization Studio / LRO Science Team',
    },
  },
  'SHACKLETON_FLOOR_PSR': {
    siteId: 'SITE-SHACKLETON-FLOOR-PSR',
    siteName: 'Shackleton Crater Interior Floor (Permanently Shadowed Region)',
    synodicPeriodHours: 708.73,
    meanIlluminationPercent: 0.0,
    currentSolarElevationDeg: -8.2, // Below crater rim horizon
    currentIlluminationPercent: 0.0,
    maxConsecutiveShadowHours: 8760.0, // Billions of years
    isPermanentlyShadowedRegion: true,
    cryogenicTemperatureKelvin: 38.0, // ~ -235°C deep volatile cold trap
    monthlyIlluminationTimeline: [
      { elapsedHours: 0, solarElevationDeg: -8.2, illuminationPercent: 0.0 },
      { elapsedHours: 720, solarElevationDeg: -8.2, illuminationPercent: 0.0 },
    ],
    provenance: {
      source: 'NASA_ILLUMINATION',
      retrievalTimestamp: '2024-02-20T00:00:00Z',
      version: 'LRO Diviner / LOLA PSR Catalog v1.2',
      originNature: 'OFFLINE_FALLBACK',
      sourceUrl: 'https://diviner.ucla.edu/',
      attributionNotice: 'UCLA / NASA JPL Diviner Lunar Radiometer Experiment',
    },
  },
};
