import { z } from 'zod';

export const vitalsSchema = z.object({
  heartRateBpm: z.number().min(30).max(220),
  respirationRate: z.number().min(5).max(50),
  systolicBp: z.number().min(60).max(240),
  diastolicBp: z.number().min(40).max(150),
  coreTempCelsius: z.number().min(30).max(45),
  bloodOxygenPercent: z.number().min(50).max(100),
});

export const cognitiveStateSchema = z.object({
  readinessScore: z.number().min(0).max(100),
  sleepDebtHours: z.number().min(0).max(40),
  consecutiveAwakeHours: z.number().min(0).max(100),
  stressIndex: z.number().min(0).max(100),
  circadianPhaseHour: z.number().min(0).max(30),
});

export const radiationDoseSchema = z.object({
  accumulatedTotalMsv: z.number().min(0),
  currentRateMsvPerHour: z.number().min(0),
  lastDosimeterCalibrationDay: z.number().min(1).max(30),
});

export const astronautSchema = z.object({
  id: z.string(),
  callsign: z.string(),
  fullName: z.string(),
  role: z.enum([
    'Commander',
    'Lunar Module Pilot',
    'Mission Specialist / Science',
    'Flight Surgeon / Medical Specialist',
  ]),
  currentActivity: z.enum([
    'EVA_SURFACE_SORTIE',
    'HABITAT_SYSTEMS_MAINTENANCE',
    'LAB_SCIENCE_ANALYSIS',
    'SCHEDULED_EXERCISE',
    'MEAL_HYDRATION',
    'CIRCADIAN_SLEEP_PERIOD',
    'EMERGENCY_CONTINGENCY_PROTOCOL',
  ]),
  location: z.enum(['HABITAT_CORE', 'AIRLOCK_MODULE', 'SURFACE_ROVER', 'STORM_SHELTER']),
  vitals: vitalsSchema,
  cognitive: cognitiveStateSchema,
  radiation: radiationDoseSchema,
  evaHoursCompleted: z.number().min(0),
  hydrationPercent: z.number().min(0).max(100),
  caloricIntakeTodayKcal: z.number().min(0),
  isFitForDuty: z.boolean(),
});
