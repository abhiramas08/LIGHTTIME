/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Pure Deterministic Replay & Flight Comparison Engine
 *
 * Implements deterministic black-box replay by executing recorded user actions
 * from the immutable initial state snapshot using the pure simulation engine.
 * Never mutates original saved mission data.
 */

import {
  MissionState,
} from '../models/missionState';
import {
  SavedMissionRun,
  ReplayTimelineStep,
  ReplaySession,
  ReplayDivergenceItem,
  MissionComparisonReport,
  MissionComparisonMetricRow,
} from '../models/missionHistory';
import { cloneMissionState, advanceWithCircadianCycle } from './core';
import { applyMissionCommand, MissionCommandInput } from '../commands/commandDispatcher';
import { formatSimulationTime } from '../models/eventTypes';

// ============================================================================
// Deterministic Replay Generator
// ============================================================================

/**
 * Builds an interactive replay timeline from a saved run.
 * Re-runs the pure simulation deterministically from initialState,
 * applying all user commands at their exact historical timestamps.
 * Verifies final replay state against the original saved final state.
 */
export function generateReplayTimeline(savedRun: SavedMissionRun): {
  timeline: ReplayTimelineStep[];
  finalReplayState: MissionState;
  isMatchWithOriginal: boolean;
  divergenceReport: ReplayDivergenceItem[];
} {
  // 1. Deep clone initial state to guarantee immutability
  let currentState = cloneMissionState(savedRun.initialState);
  const initialHours = currentState.mission.elapsedHours;
  const targetEndHours = Math.max(savedRun.completionTimeHours, currentState.mission.elapsedHours);

  // 2. Sort user actions chronologically
  const actions = [...savedRun.userActions].sort(
    (a, b) => a.timestampHours - b.timestampHours
  );

  const timeline: ReplayTimelineStep[] = [];
  let stepIndex = 0;

  // Helper to construct telemetry snapshot
  const makeTelemetrySnapshot = (st: MissionState) => {
    const fatigueSum = st.crew.reduce(
      (acc, c) => acc + c.fatigueIndex,
      0
    );
    return {
      oxygenKg: Number(st.habitatResources.oxygenInventoryKg.toFixed(2)),
      waterLiters: Number(st.habitatResources.waterInventoryLiters.toFixed(2)),
      batteryKwh: Number(st.habitatResources.batteryStorageKwh.toFixed(2)),
      foodKcal: Number(st.habitatResources.foodInventoryKcal.toFixed(0)),
      meanCrewFatigue: Number((fatigueSum / st.crew.length).toFixed(1)),
      activeEmergenciesCount: st.emergency.activeScenario ? 1 : 0,
    };
  };

  // Record Step 0: Initial State Snapshot
  timeline.push({
    stepIndex: stepIndex++,
    timestampHours: initialHours,
    simulationTime: formatSimulationTime(initialHours, currentState.mission.missionDay),
    type: 'INITIAL_STATE',
    title: 'EXPEDITION START – INITIAL SNAPSHOT',
    description: `Baseline mission initialized with 4 crew members and 100% nominal habitat systems. Scenario: ${savedRun.scenarioId ?? 'Standard Expedition'}.`,
    stateSnapshot: cloneMissionState(currentState),
    telemetrySnapshot: makeTelemetrySnapshot(currentState),
  });

  // Collect all discrete timestamp milestones (each action's hour, plus key intervals)
  const milestoneHoursSet = new Set<number>();
  actions.forEach((act) => {
    if (act.timestampHours > initialHours && act.timestampHours <= targetEndHours) {
      milestoneHoursSet.add(act.timestampHours);
    }
  });

  // Add hourly or periodic checkpoints to ensure a smooth timeline
  const totalDuration = targetEndHours - initialHours;
  const tickStep = totalDuration > 100 ? 12 : totalDuration > 24 ? 4 : 1;
  for (let h = initialHours + tickStep; h < targetEndHours; h += tickStep) {
    milestoneHoursSet.add(h);
  }
  milestoneHoursSet.add(targetEndHours);

  const sortedMilestones = Array.from(milestoneHoursSet).sort((a, b) => a - b);

  let simulatedHour = initialHours;
  let actionPointer = 0;

  for (const nextMilestone of sortedMilestones) {
    // 1. Advance simulation up to this milestone
    const deltaHours = nextMilestone - simulatedHour;
    if (deltaHours > 0) {
      currentState = advanceWithCircadianCycle(currentState, deltaHours);
      simulatedHour = nextMilestone;
    }

    // 2. Check if any user actions occurred at or prior to this timestamp
    while (
      actionPointer < actions.length &&
      actions[actionPointer]!.timestampHours <= simulatedHour
    ) {
      const act = actions[actionPointer]!;
      actionPointer++;

      // Apply the command deterministically
      const cmdInput: MissionCommandInput = {
        subsystem: (act.subsystem as any) || 'HABITAT_SYSTEMS',
        action: act.command,
        parameters: act.parameters || {},
        targetAstronautId: act.targetAstronautId,
        initiatedBy: act.initiatedBy || 'GROUND',
      };

      const result = applyMissionCommand(currentState, cmdInput);
      currentState = result.updatedState;

      timeline.push({
        stepIndex: stepIndex++,
        timestampHours: act.timestampHours,
        simulationTime: formatSimulationTime(act.timestampHours, currentState.mission.missionDay),
        type: 'USER_ACTION',
        title: `COMMAND DIRECTIVE: ${act.command}`,
        description: `Subsystem [${act.subsystem}] dispatched by ${act.initiatedBy}. Outcome: ${act.outcome}. ${result.message}`,
        action: act,
        stateSnapshot: cloneMissionState(currentState),
        telemetrySnapshot: makeTelemetrySnapshot(currentState),
      });
    }

    // If milestone isn't purely an action timestamp, record periodic progress step
    const lastStep = timeline[timeline.length - 1];
    const isActionStep = lastStep && lastStep.timestampHours === simulatedHour && lastStep.type === 'USER_ACTION';
    if (!isActionStep && simulatedHour < targetEndHours) {
      timeline.push({
        stepIndex: stepIndex++,
        timestampHours: simulatedHour,
        simulationTime: formatSimulationTime(simulatedHour, currentState.mission.missionDay),
        type: 'SIMULATION_TICK',
        title: `TELEMETRY CHECKPOINT – T+${simulatedHour}h`,
        description: `Autonomous flight system continuous telemetry logging. Habitability loop running nominally.`,
        stateSnapshot: cloneMissionState(currentState),
        telemetrySnapshot: makeTelemetrySnapshot(currentState),
      });
    }
  }

  // Record Final Mission Completion Step
  timeline.push({
    stepIndex: stepIndex++,
    timestampHours: targetEndHours,
    simulationTime: formatSimulationTime(targetEndHours, currentState.mission.missionDay),
    type: 'MISSION_COMPLETION',
    title: `MISSION SAVED CHECKPOINT / COMPLETION`,
    description: `Expedition archived with status ${savedRun.status}. Grade: ${savedRun.grade ?? 'N/A'}. Final life support reserves verified.`,
    stateSnapshot: cloneMissionState(currentState),
    telemetrySnapshot: makeTelemetrySnapshot(currentState),
  });

  // Verify Replay Results against Saved Final State
  const divergenceReport = verifyReplayMatching(currentState, savedRun.finalState);
  const isMatchWithOriginal = divergenceReport.every((d) => d.status === 'MATCH');

  return {
    timeline,
    finalReplayState: currentState,
    isMatchWithOriginal,
    divergenceReport,
  };
}

/**
 * Pure verification comparison between replayed final state and original saved state.
 * Evaluates core telemetry fields using defined scientific and educational tolerances.
 */
export function verifyReplayMatching(
  replayState: MissionState,
  originalSavedState: MissionState
): ReplayDivergenceItem[] {
  const items: ReplayDivergenceItem[] = [];

  // Helper for numeric tolerance check
  const checkNumeric = (
    field: string,
    replayVal: number,
    savedVal: number,
    tolerance = 0.5
  ) => {
    const diff = Math.abs(replayVal - savedVal);
    const match = diff <= tolerance;
    items.push({
      field,
      expected: Number(savedVal.toFixed(2)),
      actual: Number(replayVal.toFixed(2)),
      tolerance,
      status: match ? 'MATCH' : 'DIVERGENCE',
    });
  };

  // Helper for strict match
  const checkStrict = (
    field: string,
    replayVal: string | number | boolean,
    savedVal: string | number | boolean
  ) => {
    const match = replayVal === savedVal;
    items.push({
      field,
      expected: String(savedVal),
      actual: String(replayVal),
      status: match ? 'MATCH' : 'DIVERGENCE',
    });
  };

  // 1. Mission Duration & Time
  checkNumeric(
    'Elapsed Hours (hrs)',
    replayState.mission.elapsedHours,
    originalSavedState.mission.elapsedHours,
    0.1
  );

  // 2. Operational Status
  checkStrict(
    'Operational Status',
    replayState.mission.missionStatus,
    originalSavedState.mission.missionStatus
  );

  // 3. Oxygen Reserves
  checkNumeric(
    'Oxygen Mass (kg)',
    replayState.habitatResources.oxygenInventoryKg,
    originalSavedState.habitatResources.oxygenInventoryKg,
    2.0
  );

  // 4. Water Reserves
  checkNumeric(
    'Water Volume (L)',
    replayState.habitatResources.waterInventoryLiters,
    originalSavedState.habitatResources.waterInventoryLiters,
    5.0
  );

  // 5. Battery Storage
  checkNumeric(
    'Battery Storage (kWh)',
    replayState.habitatResources.batteryStorageKwh,
    originalSavedState.habitatResources.batteryStorageKwh,
    5.0
  );

  // 6. Food Storage
  checkNumeric(
    'Food Caloric Inventory (kcal)',
    replayState.habitatResources.foodInventoryKcal,
    originalSavedState.habitatResources.foodInventoryKcal,
    500.0
  );

  // 7. Emergency Scenario
  checkStrict(
    'Active Emergency Scenario',
    String(replayState.emergency.activeScenario ?? 'NOMINAL'),
    String(originalSavedState.emergency.activeScenario ?? 'NOMINAL')
  );

  return items;
}

// ============================================================================
// Replay Session Management
// ============================================================================

/**
 * Initializes a new ReplaySession from a SavedMissionRun.
 * Original savedRun remains untouched and strictly read-only.
 */
export function initReplaySession(savedRun: SavedMissionRun): ReplaySession {
  const { timeline, isMatchWithOriginal, divergenceReport } =
    generateReplayTimeline(savedRun);

  return {
    targetRun: savedRun,
    timeline,
    currentStepIndex: 0,
    currentState: cloneMissionState(timeline[0]!.stateSnapshot),
    isPlaying: false,
    playbackSpeed: 1,
    isMatchWithOriginal,
    divergenceReport,
  };
}

/**
 * Steps a replay session forward or backward to target step index.
 * Returns a new immutable ReplaySession object.
 */
export function stepReplaySession(
  session: ReplaySession,
  targetIndex: number
): ReplaySession {
  const boundedIndex = Math.max(0, Math.min(targetIndex, session.timeline.length - 1));
  const step = session.timeline[boundedIndex]!;

  return {
    ...session,
    currentStepIndex: boundedIndex,
    currentState: cloneMissionState(step.stateSnapshot),
  };
}

// ============================================================================
// Comparative Analysis Solver
// ============================================================================

/**
 * Pure comparative solver between two completed mission runs.
 * Evaluates duration, resources, crew wellbeing, and emergency resolution.
 */
export function compareMissionRuns(
  runA: SavedMissionRun,
  runB: SavedMissionRun
): MissionComparisonReport {
  const metrics: MissionComparisonMetricRow[] = [];

  // Duration
  const daysA = Number((runA.completionTimeHours / 24).toFixed(1));
  const daysB = Number((runB.completionTimeHours / 24).toFixed(1));
  metrics.push({
    category: 'MISSION',
    metricName: 'Mission Duration',
    unit: 'Sols',
    valA: `${daysA} Sols`,
    valB: `${daysB} Sols`,
    advantage: daysA > daysB ? 'A' : daysA < daysB ? 'B' : 'TIED',
    delta: `${(daysA - daysB).toFixed(1)} Sols`,
    notes: 'Total expedition duration achieved on lunar surface.',
  });

  // Overall Score
  const scoreA = runA.overallScore ?? 85;
  const scoreB = runB.overallScore ?? 85;
  metrics.push({
    category: 'MISSION',
    metricName: 'Flight Performance Score',
    unit: 'pts',
    valA: `${scoreA} / 100`,
    valB: `${scoreB} / 100`,
    advantage: scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'TIED',
    delta: `${scoreA >= scoreB ? '+' : ''}${scoreA - scoreB} pts`,
    notes: 'Composite score integrating safety, efficiency, and ECLSS stability.',
  });

  // Oxygen Consumed
  const initO2A = runA.initialState.habitatResources.oxygenInventoryKg;
  const finalO2A = runA.finalState.habitatResources.oxygenInventoryKg;
  const o2UsedA = Number(Math.max(0, initO2A - finalO2A).toFixed(1));

  const initO2B = runB.initialState.habitatResources.oxygenInventoryKg;
  const finalO2B = runB.finalState.habitatResources.oxygenInventoryKg;
  const o2UsedB = Number(Math.max(0, initO2B - finalO2B).toFixed(1));

  metrics.push({
    category: 'RESOURCES',
    metricName: 'Oxygen Consumed',
    unit: 'kg',
    valA: `${o2UsedA} kg`,
    valB: `${o2UsedB} kg`,
    advantage: o2UsedA < o2UsedB ? 'A' : o2UsedA > o2UsedB ? 'B' : 'TIED',
    delta: `${(o2UsedA - o2UsedB).toFixed(1)} kg`,
    notes: 'Lower consumption indicates tighter loop closure and fewer leaks.',
  });

  // Water Consumed
  const initH2OA = runA.initialState.habitatResources.waterInventoryLiters;
  const finalH2OA = runA.finalState.habitatResources.waterInventoryLiters;
  const waterUsedA = Number(Math.max(0, initH2OA - finalH2OA).toFixed(1));

  const initH2OB = runB.initialState.habitatResources.waterInventoryLiters;
  const finalH2OB = runB.finalState.habitatResources.waterInventoryLiters;
  const waterUsedB = Number(Math.max(0, initH2OB - finalH2OB).toFixed(1));

  metrics.push({
    category: 'RESOURCES',
    metricName: 'Potable Water Consumed',
    unit: 'L',
    valA: `${waterUsedA} L`,
    valB: `${waterUsedB} L`,
    advantage: waterUsedA < waterUsedB ? 'A' : waterUsedA > waterUsedB ? 'B' : 'TIED',
    delta: `${(waterUsedA - waterUsedB).toFixed(1)} L`,
    notes: 'Reflects water recycling efficiency and crew hygiene discipline.',
  });

  // Final Battery Reserve
  const battA = Number(runA.finalState.habitatResources.batteryStorageKwh.toFixed(1));
  const battB = Number(runB.finalState.habitatResources.batteryStorageKwh.toFixed(1));
  metrics.push({
    category: 'RESOURCES',
    metricName: 'Final Battery Storage Reserve',
    unit: 'kWh',
    valA: `${battA} kWh`,
    valB: `${battB} kWh`,
    advantage: battA > battB ? 'A' : battA < battB ? 'B' : 'TIED',
    delta: `${(battA - battB).toFixed(1)} kWh`,
    notes: 'Emergency electrical margin available at mission conclusion.',
  });

  // Crew Fatigue Index
  const meanFatigueA = Number(
    (
      runA.finalState.crew.reduce(
        (sum, c) => sum + c.fatigueIndex,
        0
      ) / runA.finalState.crew.length
    ).toFixed(1)
  );
  const meanFatigueB = Number(
    (
      runB.finalState.crew.reduce(
        (sum, c) => sum + c.fatigueIndex,
        0
      ) / runB.finalState.crew.length
    ).toFixed(1)
  );
  metrics.push({
    category: 'CREW',
    metricName: 'Final Mean Crew Fatigue',
    unit: 'Index [0-100]',
    valA: `${meanFatigueA} / 100`,
    valB: `${meanFatigueB} / 100`,
    advantage: meanFatigueA < meanFatigueB ? 'A' : meanFatigueA > meanFatigueB ? 'B' : 'TIED',
    delta: `${(meanFatigueA - meanFatigueB).toFixed(1)} pts`,
    notes: 'NASA Human Research Program cumulative workload and circadian strain indicator.',
  });

  // Directives Executed
  const actionsA = runA.userActions.length;
  const actionsB = runB.userActions.length;
  metrics.push({
    category: 'DECISIONS',
    metricName: 'Directives Dispatched',
    unit: 'cmds',
    valA: `${actionsA} directives`,
    valB: `${actionsB} directives`,
    advantage: 'NEUTRAL',
    delta: `${actionsA - actionsB} cmds`,
    notes: 'Total intervention frequency by student flight commander.',
  });

  // Critical Alerts Logged
  const critEventsA = runA.simulationEvents.filter(
    (e) => e.severity === 'CRITICAL'
  ).length;
  const critEventsB = runB.simulationEvents.filter(
    (e) => e.severity === 'CRITICAL'
  ).length;
  metrics.push({
    category: 'SAFETY',
    metricName: 'Critical Alarms Logged',
    unit: 'events',
    valA: `${critEventsA} alarms`,
    valB: `${critEventsB} alarms`,
    advantage: critEventsA < critEventsB ? 'A' : critEventsA > critEventsB ? 'B' : 'TIED',
    delta: `${critEventsA - critEventsB} alarms`,
    notes: 'Number of severe off-nominal warnings triggered during expedition.',
  });

  // Executive Takeaway
  let executiveTakeaway = '';
  if (scoreA > scoreB) {
    executiveTakeaway = `Mission ${runA.missionName} achieved superior overall flight performance (+${scoreA - scoreB} pts) through disciplined resource management and lower crew fatigue.`;
  } else if (scoreB > scoreA) {
    executiveTakeaway = `Mission ${runB.missionName} outperformed ${runA.missionName} (+${scoreB - scoreA} pts) with higher final energy reserves and lower critical alarm frequency.`;
  } else {
    executiveTakeaway = `Both missions exhibited comparable overall flight outcomes with identical performance scores (${scoreA} pts).`;
  }

  const educationalExplanations = [
    `Comparing ${runA.missionName} with ${runB.missionName} demonstrates the direct correlation between crew sleep/work cycles and long-term expedition safety.`,
    `Resource consumption curves show that proactive maintenance significantly preserves ECLSS loop closure and delays consumable depletion.`,
    `Rapid emergency command execution during off-nominal contingencies prevented irreversible resource loss.`,
  ];

  return {
    runA,
    runB,
    metrics,
    executiveTakeaway,
    educationalExplanations,
  };
}
