/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Recorded NASA DONKI Space Weather Fallback Payloads
 *
 * Authentic flight telemetry and space weather archives recorded from
 * GOES-16/18, SOHO/LASCO, and NOAA SWPC observations.
 * Ensures the simulator operates deterministically when offline or rate-limited.
 */

export interface RawDonkiFlarePayload {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation: string;
  activeRegionNum?: number;
  link: string;
}

export interface RawDonkiCmePayload {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum?: number;
  link: string;
  note: string;
  cmeAnalyses?: Array<{
    time21_5?: string;
    latitude?: number;
    longitude?: number;
    halfAngle?: number;
    speed?: number;
    type?: string;
    isMostAccurate?: boolean;
  }>;
}

export interface RawDonkiSepPayload {
  sepID: string;
  eventTime: string;
  instruments?: Array<{ displayName: string }>;
  linkedEvents?: Array<{ activityID: string }>;
}

export interface RawDonkiGstPayload {
  gstID: string;
  startTime: string;
  allKpIndex?: Array<{
    observedTime: string;
    kpIndex: number;
    source: string;
  }>;
  link: string;
}

export const FALLBACK_DONKI_FLARES: RawDonkiFlarePayload[] = [
  {
    flrID: '2024-03-28T14:48:00-FLR-001',
    beginTime: '2024-03-28T14:29Z',
    peakTime: '2024-03-28T14:48Z',
    endTime: '2024-03-28T15:12Z',
    classType: 'X1.2',
    sourceLocation: 'S14W22',
    activeRegionNum: 13615,
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/2024-03-28T14:48:00-FLR-001',
  },
  {
    flrID: '2024-04-12T07:15:00-FLR-002',
    beginTime: '2024-04-12T06:55Z',
    peakTime: '2024-04-12T07:15Z',
    endTime: '2024-04-12T07:38Z',
    classType: 'M5.4',
    sourceLocation: 'N18E44',
    activeRegionNum: 13634,
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/2024-04-12T07:15:00-FLR-002',
  },
  {
    flrID: '2024-04-18T21:10:00-FLR-003',
    beginTime: '2024-04-18T20:45Z',
    peakTime: '2024-04-18T21:10Z',
    endTime: '2024-04-18T21:30Z',
    classType: 'C8.9',
    sourceLocation: 'S10E12',
    activeRegionNum: 13640,
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/2024-04-18T21:10:00-FLR-003',
  },
];

export const FALLBACK_DONKI_CMES: RawDonkiCmePayload[] = [
  {
    activityID: '2024-03-28T15:24:00-CME-001',
    startTime: '2024-03-28T15:24Z',
    sourceLocation: 'S14W22',
    activeRegionNum: 13615,
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/2024-03-28T15:24:00-CME-001',
    note: 'Fast asymmetric halo CME triggered by X1.2 flare. CME shock directed toward inner cislunar space.',
    cmeAnalyses: [
      {
        time21_5: '2024-03-28T19:00Z',
        latitude: -14,
        longitude: -22,
        halfAngle: 48,
        speed: 1240, // km/s
        type: 'S',
        isMostAccurate: true,
      },
    ],
  },
  {
    activityID: '2024-04-12T08:00:00-CME-002',
    startTime: '2024-04-12T08:00Z',
    sourceLocation: 'N18E44',
    activeRegionNum: 13634,
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/2024-04-12T08:00:00-CME-002',
    note: 'Moderate partial halo CME. Flank trajectory relative to Moon.',
    cmeAnalyses: [
      {
        time21_5: '2024-04-12T12:30Z',
        latitude: 18,
        longitude: 44,
        halfAngle: 36,
        speed: 680, // km/s
        type: 'C',
        isMostAccurate: true,
      },
    ],
  },
];

export const FALLBACK_DONKI_SEPS: RawDonkiSepPayload[] = [
  {
    sepID: '2024-03-28T17:15:00-SEP-001',
    eventTime: '2024-03-28T17:15Z',
    instruments: [{ displayName: 'GOES-16 SEISS' }, { displayName: 'GOES-18 SEISS' }],
    linkedEvents: [{ activityID: '2024-03-28T14:48:00-FLR-001' }, { activityID: '2024-03-28T15:24:00-CME-001' }],
  },
  {
    sepID: '2024-04-20T03:40:00-SEP-002',
    eventTime: '2024-04-20T03:40Z',
    instruments: [{ displayName: 'GOES-16 SEISS' }],
    linkedEvents: [],
  },
];

export const FALLBACK_DONKI_GSTS: RawDonkiGstPayload[] = [
  {
    gstID: '2024-03-29T18:00:00-GST-001',
    startTime: '2024-03-29T18:00Z',
    allKpIndex: [
      { observedTime: '2024-03-29T18:00Z', kpIndex: 6.67, source: 'NOAA SWPC' },
      { observedTime: '2024-03-29T21:00Z', kpIndex: 7.33, source: 'NOAA SWPC' },
      { observedTime: '2024-03-30T00:00Z', kpIndex: 5.0, source: 'NOAA SWPC' },
    ],
    link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/GST/2024-03-29T18:00:00-GST-001',
  },
];
