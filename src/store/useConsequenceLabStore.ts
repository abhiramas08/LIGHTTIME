/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Store (Zustand)
 *
 * Manages the dual-run comparative experiment lifecycle, keeping both
 * Run A and Run B isolated, deterministic, and synchronized.
 */

import { create } from 'zustand';
import {
  ConsequenceLabConfig,
  LaboratoryRunState,
  ComparativeAnalysisReport,
} from '@/simulation/models/consequenceLab';
import {
  EMERGENCY_SCENARIOS,
  PlayableEmergencyScenario,
  EmergencyActionDefinition,
} from '@/data/emergencies/emergencyScenarios';
import {
  createDualLabRuns,
  executeLabRunAction,
  advanceLabRunTime,
  synthesizeComparativeReport,
} from '@/simulation/engine/consequenceEngine';
import { MissionState } from '@/simulation/models/missionState';

export type LabStage = 'CONFIG' | 'EXPERIMENT' | 'REPORT';
export type LabActiveTab = 'SIDE_BY_SIDE' | 'RUN_A' | 'RUN_B';

export interface ConsequenceLabStoreState {
  // Configuration
  config: ConsequenceLabConfig;
  scenario: PlayableEmergencyScenario;
  stage: LabStage;
  activeTab: LabActiveTab;

  // Dual runs
  initialSnapshot: MissionState | null;
  runA: LaboratoryRunState | null;
  runB: LaboratoryRunState | null;

  // Operational feedback
  actionFeedbackA: string | null;
  actionFeedbackB: string | null;

  // Analysis Report
  report: ComparativeAnalysisReport | null;

  // Actions
  updateConfig: (partial: Partial<ConsequenceLabConfig>) => void;
  initializeRuns: () => void;
  executeRunAction: (runId: 'RUN_A' | 'RUN_B', actionDef: EmergencyActionDefinition) => void;
  advanceRunTime: (runId: 'RUN_A' | 'RUN_B', deltaHours: number) => void;
  advanceBothRunsTime: (deltaHours: number) => void;
  resolveRun: (runId: 'RUN_A' | 'RUN_B') => void;
  resolveBothRuns: () => void;
  setStage: (stage: LabStage) => void;
  setActiveTab: (tab: LabActiveTab) => void;
  generateReport: () => void;
  resetLab: () => void;
}

const DEFAULT_CONFIG: ConsequenceLabConfig = {
  scenarioId: 'SCENARIO-EMG-01-O2-LEAK',
  startingDay: 7,
  crewConditionId: 'NOMINAL_RESTED',
  initialResourcesId: 'NOMINAL_100',
  commConditionAId: 'REALTIME_EARTH_LINK',
  commConditionBId: 'OCCULTATION_BLACKOUT',
};

export const useConsequenceLabStore = create<ConsequenceLabStoreState>((set, get) => ({
  config: DEFAULT_CONFIG,
  scenario: EMERGENCY_SCENARIOS[0]!,
  stage: 'CONFIG',
  activeTab: 'SIDE_BY_SIDE',

  initialSnapshot: null,
  runA: null,
  runB: null,

  actionFeedbackA: null,
  actionFeedbackB: null,
  report: null,

  updateConfig: (partial) => {
    set((state) => {
      const nextConfig = { ...state.config, ...partial };
      const nextScenario =
        EMERGENCY_SCENARIOS.find((s) => s.id === nextConfig.scenarioId) ?? state.scenario;
      return { config: nextConfig, scenario: nextScenario };
    });
  },

  initializeRuns: () => {
    const { config } = get();
    const { runA, runB, initialSnapshot, scenario } = createDualLabRuns(config);

    set({
      runA,
      runB,
      initialSnapshot,
      scenario,
      stage: 'EXPERIMENT',
      actionFeedbackA: `Run A primed with ${runA.commPreset.label}.`,
      actionFeedbackB: `Run B primed with ${runB.commPreset.label}.`,
      report: null,
    });
  },

  executeRunAction: (runId, actionDef) => {
    const { runA, runB, scenario } = get();
    const targetRun = runId === 'RUN_A' ? runA : runB;
    if (!targetRun) return;

    const { updatedRun, result } = executeLabRunAction(targetRun, {
      subsystem: actionDef.subsystem,
      action: actionDef.action,
      parameters: {
        ...actionDef.parameters,
        requiresEarthComms: actionDef.requiresEarthComms,
      },
      initiatedBy: actionDef.authorizedBy === 'CREW_AUTONOMY' ? 'CREW' : 'GROUND',
    });

    if (runId === 'RUN_A') {
      const newRunA = updatedRun;
      set({
        runA: newRunA,
        actionFeedbackA: result.message,
        report: runB ? synthesizeComparativeReport(newRunA, runB, scenario) : null,
      });
    } else {
      const newRunB = updatedRun;
      set({
        runB: newRunB,
        actionFeedbackB: result.message,
        report: runA ? synthesizeComparativeReport(runA, newRunB, scenario) : null,
      });
    }
  },

  advanceRunTime: (runId, deltaHours) => {
    const { runA, runB, scenario } = get();
    const targetRun = runId === 'RUN_A' ? runA : runB;
    if (!targetRun) return;

    const updatedRun = advanceLabRunTime(targetRun, deltaHours);

    if (runId === 'RUN_A') {
      set({
        runA: updatedRun,
        actionFeedbackA: updatedRun.statusMessage || null,
        report: runB ? synthesizeComparativeReport(updatedRun, runB, scenario) : null,
      });
    } else {
      set({
        runB: updatedRun,
        actionFeedbackB: updatedRun.statusMessage || null,
        report: runA ? synthesizeComparativeReport(runA, updatedRun, scenario) : null,
      });
    }
  },

  advanceBothRunsTime: (deltaHours) => {
    const { runA, runB, scenario } = get();
    if (!runA || !runB) return;

    const updatedA = advanceLabRunTime(runA, deltaHours);
    const updatedB = advanceLabRunTime(runB, deltaHours);

    set({
      runA: updatedA,
      runB: updatedB,
      actionFeedbackA: updatedA.statusMessage || null,
      actionFeedbackB: updatedB.statusMessage || null,
      report: synthesizeComparativeReport(updatedA, updatedB, scenario),
    });
  },

  resolveRun: (runId) => {
    const { runA, runB, scenario } = get();
    const targetRun = runId === 'RUN_A' ? runA : runB;
    if (!targetRun) return;

    const { updatedRun, result } = executeLabRunAction(targetRun, {
      subsystem: 'EMERGENCY',
      action: 'RESOLVE_EMERGENCY',
      initiatedBy: 'CREW',
    });

    if (runId === 'RUN_A') {
      set({
        runA: updatedRun,
        actionFeedbackA: result.message,
        report: runB ? synthesizeComparativeReport(updatedRun, runB, scenario) : null,
      });
    } else {
      set({
        runB: updatedRun,
        actionFeedbackB: result.message,
        report: runA ? synthesizeComparativeReport(runA, updatedRun, scenario) : null,
      });
    }
  },

  resolveBothRuns: () => {
    const { runA, runB, scenario } = get();
    if (!runA || !runB) return;

    const resA = executeLabRunAction(runA, {
      subsystem: 'EMERGENCY',
      action: 'RESOLVE_EMERGENCY',
      initiatedBy: 'CREW',
    });

    const resB = executeLabRunAction(runB, {
      subsystem: 'EMERGENCY',
      action: 'RESOLVE_EMERGENCY',
      initiatedBy: 'CREW',
    });

    const report = synthesizeComparativeReport(resA.updatedRun, resB.updatedRun, scenario);

    set({
      runA: resA.updatedRun,
      runB: resB.updatedRun,
      actionFeedbackA: resA.result.message,
      actionFeedbackB: resB.result.message,
      report,
      stage: 'REPORT',
    });
  },

  setStage: (stage) => set({ stage }),
  setActiveTab: (activeTab) => set({ activeTab }),

  generateReport: () => {
    const { runA, runB, scenario } = get();
    if (!runA || !runB) return;
    const report = synthesizeComparativeReport(runA, runB, scenario);
    set({ report, stage: 'REPORT' });
  },

  resetLab: () => {
    set({
      stage: 'CONFIG',
      runA: null,
      runB: null,
      initialSnapshot: null,
      actionFeedbackA: null,
      actionFeedbackB: null,
      report: null,
    });
  },
}));
