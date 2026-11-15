/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Default Canonical Historical Missions Catalog
 *
 * Pre-seeds completed and active saved runs for student inspection,
 * comparison, and deterministic replay.
 */

import { SavedMissionRun } from '@/simulation/models/missionHistory';
import { createInitialMissionState, cloneMissionState, tickSimulation } from '@/simulation/engine/core';
import { applyMissionCommand } from '@/simulation/commands/commandDispatcher';

// ============================================================================
// Factory Helpers to generate authentic runs via the pure simulation engine
// ============================================================================

function buildExpedition30Run(): SavedMissionRun {
  const initial = createInitialMissionState({
    mission: {
      missionId: 'LT-EXP30-NOMINAL-RUN',
      missionName: 'Artemis Base Camp Expedition 30 (Nominal Sols 1-30)',
      missionDay: 1,
      elapsedHours: 0,
      missionDuration: 30,
      missionStatus: 'ACTIVE',
      simulationRulesVersion: '1.0.0-artemis',
    },
  });

  let state = cloneMissionState(initial);

  // Advance to Hour 12 and perform maintenance
  state = tickSimulation(state, 12);
  const act1 = applyMissionCommand(state, {
    subsystem: 'EQUIPMENT',
    action: 'START_MAINTENANCE',
    parameters: { equipmentId: 'EQ-CDRA-01' },
    initiatedBy: 'GROUND',
  });
  state = act1.updatedState;

  // Advance to Hour 72 and schedule sleep
  state = tickSimulation(state, 60);
  const act2 = applyMissionCommand(state, {
    subsystem: 'CREW',
    action: 'SCHEDULE_SLEEP_PERIOD',
    parameters: { sleepHours: 8 },
    targetAstronautId: 'ASTRO-1',
    initiatedBy: 'GROUND',
  });
  state = act2.updatedState;

  // Advance to Hour 168 (Sol 7) and reduce non-essential power during lunar night
  state = tickSimulation(state, 96);
  const act3 = applyMissionCommand(state, {
    subsystem: 'POWER_GRID',
    action: 'REDUCE_NON_ESSENTIAL_POWER',
    parameters: { targetReductionKw: 5 },
    initiatedBy: 'GROUND',
  });
  state = act3.updatedState;

  // Advance remaining time to 720 hours (Sol 30)
  state = tickSimulation(state, 720 - 168);
  state.mission.missionStatus = 'COMPLETED';

  return {
    missionId: 'LT-EXP30-NOMINAL-RUN',
    missionName: 'Artemis Base Camp Expedition 30 (Nominal Sols 1-30)',
    scenarioId: 'SCEN-NOMINAL-30',
    scenarioVersion: '1.0.0',
    rulesVersion: '1.0.0-artemis',
    initialState: cloneMissionState(initial),
    userActions: [act1.actionRecord, act2.actionRecord, act3.actionRecord],
    simulationEvents: [
      ...state.records.eventHistory.slice(0, 15),
      act1.eventRecord,
      act2.eventRecord,
      act3.eventRecord,
    ],
    finalState: cloneMissionState(state),
    completionTime: '2026-10-30T18:00:00Z',
    completionTimeHours: 720,
    status: 'COMPLETED',
    grade: 'EXEMPLARY',
    overallScore: 96,
    summaryNotes:
      'Exemplary 30-sol long-duration expedition at Shackleton Crater. High ECLSS efficiency and consistent circadian schedules preserved optimal cognitive performance throughout all 4 crew members.',
    savedAt: '2026-10-30T18:05:00Z',
  };
}

function buildCryoTriageRun(): SavedMissionRun {
  const initial = createInitialMissionState({
    mission: {
      missionId: 'LT-EXP28-CRYO-TRIAGE',
      missionName: 'Contingency Triage: Cryo Line Micrometeoroid Breach',
      missionDay: 1,
      elapsedHours: 0,
      missionDuration: 14,
      missionStatus: 'ACTIVE',
      simulationRulesVersion: '1.0.0-artemis',
    },
  });

  let state = cloneMissionState(initial);

  // Advance to Hour 24
  state = tickSimulation(state, 24);

  // Discard leak isolation command
  const act1 = applyMissionCommand(state, {
    subsystem: 'ECLSS_O2',
    action: 'EMERGENCY_ISOLATE_LEAK',
    parameters: { valveId: 'VALVE-O2-FEED-ALPHA' },
    initiatedBy: 'CREW',
  });
  state = act1.updatedState;

  // Advance to Hour 26 and activate backup O2
  state = tickSimulation(state, 2);
  const act2 = applyMissionCommand(state, {
    subsystem: 'ECLSS_O2',
    action: 'EMERGENCY_ACTIVATE_BACKUP_O2',
    parameters: {},
    initiatedBy: 'CREW',
  });
  state = act2.updatedState;

  // Advance to Hour 48 and reduce non-essential power
  state = tickSimulation(state, 22);
  const act3 = applyMissionCommand(state, {
    subsystem: 'POWER_GRID',
    action: 'REDUCE_NON_ESSENTIAL_POWER',
    parameters: { targetReductionKw: 8 },
    initiatedBy: 'GROUND',
  });
  state = act3.updatedState;

  // Advance to 336 hours (14 Sols)
  state = tickSimulation(state, 336 - 48);
  state.mission.missionStatus = 'COMPLETED';

  return {
    missionId: 'LT-EXP28-CRYO-TRIAGE',
    missionName: 'Contingency Triage: Cryo Line Micrometeoroid Breach',
    scenarioId: 'SCEN-O2-LEAK-01',
    scenarioVersion: '1.2.0',
    rulesVersion: '1.0.0-artemis',
    initialState: cloneMissionState(initial),
    userActions: [act1.actionRecord, act2.actionRecord, act3.actionRecord],
    simulationEvents: [
      ...state.records.eventHistory.slice(0, 15),
      act1.eventRecord,
      act2.eventRecord,
      act3.eventRecord,
    ],
    finalState: cloneMissionState(state),
    completionTime: '2026-11-05T12:00:00Z',
    completionTimeHours: 336,
    status: 'COMPLETED',
    grade: 'PROFICIENT',
    overallScore: 88,
    summaryNotes:
      'Successful emergency containment following micrometeoroid perforation of O2 primary feed line. Rapid isolation within 12 minutes prevented severe hypoxia and stabilized cabin atmospheric pressure.',
    savedAt: '2026-11-05T12:10:00Z',
  };
}

function buildActiveSortieRun(): SavedMissionRun {
  const initial = createInitialMissionState({
    mission: {
      missionId: 'LT-EXP31-ACTIVE-SORTIE',
      missionName: 'Expedition 31 Shackleton Rim Active Sortie',
      missionDay: 1,
      elapsedHours: 0,
      missionDuration: 30,
      missionStatus: 'ACTIVE',
      simulationRulesVersion: '1.0.0-artemis',
    },
  });

  let state = cloneMissionState(initial);

  // Advance to Hour 48
  state = tickSimulation(state, 48);
  const act1 = applyMissionCommand(state, {
    subsystem: 'CREW',
    action: 'SCHEDULE_EXERCISE_SESSION',
    parameters: { exerciseMinutes: 60 },
    targetAstronautId: 'ASTRO-2',
    initiatedBy: 'GROUND',
  });
  state = act1.updatedState;

  // Advance to Hour 120
  state = tickSimulation(state, 72);
  const act2 = applyMissionCommand(state, {
    subsystem: 'EQUIPMENT',
    action: 'START_MAINTENANCE',
    parameters: { equipmentId: 'EQ-H2O-REC-01' },
    initiatedBy: 'GROUND',
  });
  state = act2.updatedState;

  // Advance to Hour 290 (Day 13)
  state = tickSimulation(state, 290 - 120);

  return {
    missionId: 'LT-EXP31-ACTIVE-SORTIE',
    missionName: 'Expedition 31 Shackleton Rim Active Sortie',
    scenarioId: 'SCEN-NOMINAL-30',
    scenarioVersion: '1.0.0',
    rulesVersion: '1.0.0-artemis',
    initialState: cloneMissionState(initial),
    userActions: [act1.actionRecord, act2.actionRecord],
    simulationEvents: [
      ...state.records.eventHistory.slice(0, 10),
      act1.eventRecord,
      act2.eventRecord,
    ],
    finalState: cloneMissionState(state),
    completionTime: 'In Progress (T+290h)',
    completionTimeHours: 290,
    status: 'ACTIVE',
    grade: undefined,
    overallScore: 92,
    summaryNotes:
      'Active mid-mission state at Sol 13. Water recycling maintenance completed nominally. High science throughput reported on Ridge B traverses.',
    savedAt: '2026-11-12T09:30:00Z',
  };
}

export const DEFAULT_SAVED_RUNS: SavedMissionRun[] = [
  buildExpedition30Run(),
  buildCryoTriageRun(),
  buildActiveSortieRun(),
];
