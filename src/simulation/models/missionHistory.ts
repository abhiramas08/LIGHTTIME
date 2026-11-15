/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission History & Replay Data Models
 *
 * Types and schemas for saved mission runs, deterministic replay steps,
 * and comparative analytics across expeditions.
 */

import {
  MissionState,
  MissionActionRecord,
  MissionEventRecord,
} from './missionState';

export type MissionRunStatus = 'COMPLETED' | 'ACTIVE' | 'ABORTED';
export type MissionGrade = 'EXEMPLARY' | 'PROFICIENT' | 'MARGINAL' | 'FAILED';

/**
 * Full immutable record of a saved mission expedition.
 * Contains initial conditions, action timeline, simulation events,
 * and final state snapshot for deterministic replay.
 */
export interface SavedMissionRun {
  /** Canonical Mission ID (e.g. "LT-EXP30-ARCHIVE-01") */
  missionId: string;
  /** Human-readable expedition name */
  missionName: string;
  /** Active Scenario ID if applicable (e.g. "SCEN-NOMINAL-30", "SCEN-O2-LEAK-01") */
  scenarioId?: string;
  /** Semantic version of scenario definition */
  scenarioVersion?: string;
  /** Semantic version of flight rules & solvers (e.g. "1.0.0-artemis") */
  rulesVersion: string;
  /** Full immutable initial state snapshot at Day 01 Hour 00 */
  initialState: MissionState;
  /** Ordered list of user directives dispatched during the mission */
  userActions: MissionActionRecord[];
  /** Chronological event stream logged by flight computers */
  simulationEvents: MissionEventRecord[];
  /** Full immutable final state snapshot at completion or save */
  finalState: MissionState;
  /** Completion timestamp string (ISO date or MET format) */
  completionTime: string;
  /** Total elapsed hours at completion/save */
  completionTimeHours: number;
  /** Operational status of the saved run */
  status: MissionRunStatus;
  /** Performance evaluation grade */
  grade?: MissionGrade;
  /** 0-100 overall mission success score */
  overallScore?: number;
  /** Commander summary / flight log notes */
  summaryNotes?: string;
  /** Timestamp when this run was archived in ISO format */
  savedAt: string;
}

/**
 * Step inside an interactive replay session.
 */
export interface ReplayTimelineStep {
  stepIndex: number;
  timestampHours: number;
  simulationTime: string;
  type:
    | 'INITIAL_STATE'
    | 'SIMULATION_TICK'
    | 'USER_ACTION'
    | 'EMERGENCY_TRIGGER'
    | 'MISSION_COMPLETION';
  title: string;
  description: string;
  action?: MissionActionRecord;
  event?: MissionEventRecord;
  stateSnapshot: MissionState;
  telemetrySnapshot: {
    oxygenKg: number;
    waterLiters: number;
    batteryKwh: number;
    foodKcal: number;
    meanCrewFatigue: number;
    activeEmergenciesCount: number;
  };
}

/**
 * State of an active replay session.
 * Replay runs strictly on isolated cloned working state; the original saved run is never mutated.
 */
export interface ReplaySession {
  targetRun: SavedMissionRun;
  timeline: ReplayTimelineStep[];
  currentStepIndex: number;
  currentState: MissionState;
  isPlaying: boolean;
  playbackSpeed: number; // 1, 2, 5
  isMatchWithOriginal: boolean;
  divergenceReport: ReplayDivergenceItem[];
}

export interface ReplayDivergenceItem {
  field: string;
  expected: string | number;
  actual: string | number;
  tolerance?: number;
  status: 'MATCH' | 'DIVERGENCE';
}

/**
 * Comparison entry between two completed mission runs.
 */
export interface MissionComparisonMetricRow {
  category: 'MISSION' | 'RESOURCES' | 'CREW' | 'SAFETY' | 'DECISIONS';
  metricName: string;
  unit?: string;
  valA: number | string;
  valB: number | string;
  advantage: 'A' | 'B' | 'TIED' | 'NEUTRAL';
  delta?: string;
  notes?: string;
}

export interface MissionComparisonReport {
  runA: SavedMissionRun;
  runB: SavedMissionRun;
  metrics: MissionComparisonMetricRow[];
  executiveTakeaway: string;
  educationalExplanations: string[];
}
