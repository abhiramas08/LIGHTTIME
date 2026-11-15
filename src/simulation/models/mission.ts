export type MissionPhase =
  | 'SURFACE_INGRESS_SETUP'
  | 'INITIAL_SCIENCE_SURVEY'
  | 'DRILLING_AND_ICE_PROSPECTING'
  | 'EXTENDED_ROVER_SORTIE'
  | 'DEEP_LUNAR_NIGHT_POWER_OPS'
  | 'SAMPLE_RETURN_PREPARATION'
  | 'ASCENT_STAGING';

export interface LegacyMissionState {
  id: string;
  name: string;
  commanderCallsign: string;
  currentDay: number; // 1 - 30
  totalDays: number; // 30
  metSeconds: number; // Mission Elapsed Time in seconds
  isRunning: boolean;
  timeWarpFactor: 1 | 5 | 60 | 3600; // 1x, 5x, 1 min/sec, 1 hr/sec
  phase: MissionPhase;
  lightTimeDelaySec: number; // Base ~1.28s
  scienceYieldScore: number;
  crewHealthScore: number;
  systemsReliabilityScore: number;
}
