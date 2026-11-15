import { z } from 'zod';

export const atmosphericTelemetrySchema = z.object({
  totalPressureKpa: z.number().min(0).max(150),
  ppO2Kpa: z.number().min(0).max(100),
  ppCO2Kpa: z.number().min(0).max(10),
  cabinTempCelsius: z.number().min(-50).max(80),
  relativeHumidityPercent: z.number().min(0).max(100),
  airCirculationFlowRateM3PerMin: z.number().min(0),
});

export const lifeSupportTelemetrySchema = z.object({
  potableWaterReserveLiters: z.number().min(0),
  grayWaterRecycledPercent: z.number().min(0).max(100),
  oxygenSupplyKg: z.number().min(0),
  nitrogenSupplyKg: z.number().min(0),
  carbonScrubberBedSaturationPercent: z.number().min(0).max(100),
  wasteManagementStatus: z.enum(['NOMINAL', 'FILTER_REPLACE_REQ', 'OVERLOAD']),
});

export const powerTelemetrySchema = z.object({
  solarArrayOutputKw: z.number().min(0),
  surfaceReactorOutputKw: z.number().min(0),
  fuelCellReservePercent: z.number().min(0).max(100),
  totalHabitatLoadKw: z.number().min(0),
  batteryStateOfChargePercent: z.number().min(0).max(100),
  gridStatus: z.enum(['NOMINAL', 'PEAK_LOAD_SHEDDING', 'BATTERY_BACKUP_ACTIVE']),
});

export const communicationsTelemetrySchema = z.object({
  earthDistanceKm: z.number().min(300000).max(500000),
  oneWayLightTimeSeconds: z.number().min(1.0).max(2.0),
  roundTripDelaySeconds: z.number().min(2.0).max(4.0),
  dsnGroundStation: z.enum(['Goldstone', 'Madrid', 'Canberra']),
  downlinkDataRateMbps: z.number().min(0),
  uplinkSignalToNoiseDb: z.number(),
  linkStatus: z.enum(['LOCKED', 'DEGRADED', 'LOSS_OF_SIGNAL_OCCULTATION']),
});

export const environmentTelemetrySchema = z.object({
  surfaceTempCelsius: z.number(),
  solarIrradianceWPerM2: z.number().min(0),
  ambientRadiationMicroSvPerHour: z.number().min(0),
  lunarDiurnalPhase: z.enum(['LUNAR_DAY', 'LUNAR_DUSK', 'LUNAR_NIGHT', 'LUNAR_DAWN']),
  dustStormParticulateIndex: z.number().min(0).max(100),
});

export const habitatTelemetrySchema = z.object({
  timestampUtc: z.string(),
  missionDay: z.number().min(1).max(30),
  metSeconds: z.number().min(0),
  atmosphere: atmosphericTelemetrySchema,
  lifeSupport: lifeSupportTelemetrySchema,
  power: powerTelemetrySchema,
  comms: communicationsTelemetrySchema,
  environment: environmentTelemetrySchema,
  masterAlarm: z.boolean(),
  activeAlarmsCount: z.number().min(0),
});
