/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * NASA LRO LOLA Topographical Elevation Fallback Data
 *
 * Sourced from NASA PDS Geosciences Node LOLA RDR Stage 4 gridded elevation rasters.
 * Polar sites at 85°S - 90°S referenced to 1,737.4 km lunar sphere.
 */

import { LolaSiteProfile } from '@/services/scientific/types';

export const FALLBACK_LOLA_SITES: Record<string, LolaSiteProfile> = {
  'SHACKLETON_RIDGE_B': {
    siteId: 'SITE-SHACKLETON-RIDGE-B',
    siteName: 'Shackleton Crater Connecting Ridge B',
    centerCoordinates: {
      latitudeDeg: -89.87,
      longitudeDeg: 120.45,
    },
    meanElevationMeters: 1240.0,
    minElevationMeters: 850.0,
    maxElevationMeters: 1420.0,
    meanSlopeDeg: 9.8,
    maxSlopeDeg: 28.4,
    surfaceRoughnessRmsMeters: 1.45,
    educationalTraverseDifficultyIndex: 42.0, // Educational [0-100]
    elevationTransect: [
      { distanceKm: 0.0, elevationMeters: 1100.0, slopeDeg: 6.2 },
      { distanceKm: 0.5, elevationMeters: 1180.0, slopeDeg: 9.1 },
      { distanceKm: 1.0, elevationMeters: 1240.0, slopeDeg: 7.0 },
      { distanceKm: 1.5, elevationMeters: 1350.0, slopeDeg: 12.5 },
      { distanceKm: 2.0, elevationMeters: 1420.0, slopeDeg: 8.3 },
      { distanceKm: 2.5, elevationMeters: 1390.0, slopeDeg: 5.4 },
      { distanceKm: 3.0, elevationMeters: 1310.0, slopeDeg: 9.2 },
      { distanceKm: 3.5, elevationMeters: 1220.0, slopeDeg: 11.0 },
      { distanceKm: 4.0, elevationMeters: 1050.0, slopeDeg: 19.4 },
      { distanceKm: 4.5, elevationMeters: 850.0, slopeDeg: 28.4 },
    ],
    provenance: {
      source: 'NASA_LOLA',
      retrievalTimestamp: '2024-03-15T00:00:00Z',
      version: 'LOLA RDR Stage 4 v1.0',
      originNature: 'OFFLINE_FALLBACK',
      sourceUrl: 'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/',
      attributionNotice: 'NASA Goddard Space Flight Center / LOLA Science Team / PDS Geosciences',
    },
  },
  'MALAPERT_MOUNTAIN': {
    siteId: 'SITE-MALAPERT-MASSIF-M',
    siteName: 'Malapert Mountain (Massif M)',
    centerCoordinates: {
      latitudeDeg: -85.92,
      longitudeDeg: 2.91,
    },
    meanElevationMeters: 5020.0,
    minElevationMeters: 4100.0,
    maxElevationMeters: 5120.0,
    meanSlopeDeg: 14.5,
    maxSlopeDeg: 34.0,
    surfaceRoughnessRmsMeters: 2.1,
    educationalTraverseDifficultyIndex: 68.0,
    elevationTransect: [
      { distanceKm: 0.0, elevationMeters: 4200.0, slopeDeg: 14.0 },
      { distanceKm: 1.0, elevationMeters: 4500.0, slopeDeg: 17.2 },
      { distanceKm: 2.0, elevationMeters: 4850.0, slopeDeg: 20.1 },
      { distanceKm: 3.0, elevationMeters: 5080.0, slopeDeg: 13.2 },
      { distanceKm: 4.0, elevationMeters: 5120.0, slopeDeg: 4.5 },
    ],
    provenance: {
      source: 'NASA_LOLA',
      retrievalTimestamp: '2024-03-15T00:00:00Z',
      version: 'LOLA RDR Stage 4 v1.0',
      originNature: 'OFFLINE_FALLBACK',
      sourceUrl: 'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/',
      attributionNotice: 'NASA GSFC / LRO LOLA Science Team',
    },
  },
};
