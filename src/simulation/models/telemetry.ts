export interface AtmosphericTelemetry {
  totalPressureKpa: number; // Nominal: 56.5 kPa (Exploration standard) or 101.3 kPa
  ppO2Kpa: number; // Nominal: 19.3 - 22.7 kPa (Target: 20.0 kPa)
  ppCO2Kpa: number; // Nominal: < 0.4 kPa, Caution: 0.53 kPa, Critical: > 1.0 kPa
  cabinTempCelsius: number; // Nominal: 21 +/- 2 C
  relativeHumidityPercent: number; // Nominal: 40 - 50%
  airCirculationFlowRateM3PerMin: number;
}

export interface LifeSupportTelemetry {
  potableWaterReserveLiters: number;
  grayWaterRecycledPercent: number;
  oxygenSupplyKg: number;
  nitrogenSupplyKg: number;
  carbonScrubberBedSaturationPercent: number;
  wasteManagementStatus: 'NOMINAL' | 'FILTER_REPLACE_REQ' | 'OVERLOAD';
}

export interface PowerTelemetry {
  solarArrayOutputKw: number;
  surfaceReactorOutputKw: number;
  fuelCellReservePercent: number;
  totalHabitatLoadKw: number;
  batteryStateOfChargePercent: number;
  gridStatus: 'NOMINAL' | 'PEAK_LOAD_SHEDDING' | 'BATTERY_BACKUP_ACTIVE';
}

export interface CommunicationsTelemetry {
  earthDistanceKm: number; // ~363,300 to 405,500 km
  oneWayLightTimeSeconds: number; // d / c = ~1.282 s
  roundTripDelaySeconds: number; // ~2.564 s
  dsnGroundStation: 'Goldstone' | 'Madrid' | 'Canberra';
  downlinkDataRateMbps: number;
  uplinkSignalToNoiseDb: number;
  linkStatus: 'LOCKED' | 'DEGRADED' | 'LOSS_OF_SIGNAL_OCCULTATION';
}

export interface EnvironmentTelemetry {
  surfaceTempCelsius: number; // -130C (night) to +120C (day)
  solarIrradianceWPerM2: number;
  ambientRadiationMicroSvPerHour: number;
  lunarDiurnalPhase: 'LUNAR_DAY' | 'LUNAR_DUSK' | 'LUNAR_NIGHT' | 'LUNAR_DAWN';
  dustStormParticulateIndex: number;
}

export interface HabitatTelemetry {
  timestampUtc: string;
  missionDay: number; // Day 1 to 30
  metSeconds: number;
  atmosphere: AtmosphericTelemetry;
  lifeSupport: LifeSupportTelemetry;
  power: PowerTelemetry;
  comms: CommunicationsTelemetry;
  environment: EnvironmentTelemetry;
  masterAlarm: boolean;
  activeAlarmsCount: number;
}
