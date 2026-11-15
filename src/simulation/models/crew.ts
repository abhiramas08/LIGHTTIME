export type CrewRole =
  | 'Commander'
  | 'Lunar Module Pilot'
  | 'Mission Specialist / Science'
  | 'Flight Surgeon / Medical Specialist';

export type ActivityStatus =
  | 'EVA_SURFACE_SORTIE'
  | 'HABITAT_SYSTEMS_MAINTENANCE'
  | 'LAB_SCIENCE_ANALYSIS'
  | 'SCHEDULED_EXERCISE'
  | 'MEAL_HYDRATION'
  | 'CIRCADIAN_SLEEP_PERIOD'
  | 'EMERGENCY_CONTINGENCY_PROTOCOL';

export interface Vitals {
  heartRateBpm: number;
  respirationRate: number;
  systolicBp: number;
  diastolicBp: number;
  coreTempCelsius: number;
  bloodOxygenPercent: number;
}

export interface CognitiveState {
  readinessScore: number; // 0 - 100
  sleepDebtHours: number;
  consecutiveAwakeHours: number;
  stressIndex: number; // 0 - 100
  circadianPhaseHour: number; // 0 - 24.8 lunar/earth adjusted
}

export interface RadiationDose {
  accumulatedTotalMsv: number; // Max 30-day NASA guideline: 250 mSv
  currentRateMsvPerHour: number;
  lastDosimeterCalibrationDay: number;
}

export interface Astronaut {
  id: string;
  callsign: string;
  fullName: string;
  role: CrewRole;
  currentActivity: ActivityStatus;
  location: 'HABITAT_CORE' | 'AIRLOCK_MODULE' | 'SURFACE_ROVER' | 'STORM_SHELTER';
  vitals: Vitals;
  cognitive: CognitiveState;
  radiation: RadiationDose;
  evaHoursCompleted: number;
  hydrationPercent: number;
  caloricIntakeTodayKcal: number;
  isFitForDuty: boolean;
}
