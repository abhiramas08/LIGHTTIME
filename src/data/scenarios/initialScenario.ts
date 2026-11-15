import { HabitatTelemetry } from '@/simulation/models/telemetry';

export const INITIAL_HABITAT_TELEMETRY: HabitatTelemetry = {
  timestampUtc: new Date().toISOString(),
  missionDay: 1,
  metSeconds: 3600 * 14 + 1800 + 45, // Day 1, 14h 30m 45s
  atmosphere: {
    totalPressureKpa: 56.5,
    ppO2Kpa: 20.2,
    ppCO2Kpa: 0.28, // Nominal (<0.40)
    cabinTempCelsius: 21.4,
    relativeHumidityPercent: 44.2,
    airCirculationFlowRateM3PerMin: 12.8,
  },
  lifeSupport: {
    potableWaterReserveLiters: 1140,
    grayWaterRecycledPercent: 93.4,
    oxygenSupplyKg: 285,
    nitrogenSupplyKg: 420,
    carbonScrubberBedSaturationPercent: 24.5,
    wasteManagementStatus: 'NOMINAL',
  },
  power: {
    solarArrayOutputKw: 42.6,
    surfaceReactorOutputKw: 15.0,
    fuelCellReservePercent: 98.2,
    totalHabitatLoadKw: 28.4,
    batteryStateOfChargePercent: 96.5,
    gridStatus: 'NOMINAL',
  },
  comms: {
    earthDistanceKm: 384400,
    oneWayLightTimeSeconds: 1.282,
    roundTripDelaySeconds: 2.564,
    dsnGroundStation: 'Goldstone',
    downlinkDataRateMbps: 150.0,
    uplinkSignalToNoiseDb: 28.4,
    linkStatus: 'LOCKED',
  },
  environment: {
    surfaceTempCelsius: 84.2,
    solarIrradianceWPerM2: 1358,
    ambientRadiationMicroSvPerHour: 18.2,
    lunarDiurnalPhase: 'LUNAR_DAY',
    dustStormParticulateIndex: 4.1,
  },
  masterAlarm: false,
  activeAlarmsCount: 0,
};
