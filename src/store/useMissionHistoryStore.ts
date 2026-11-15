/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission History & Replay Zustand Store
 *
 * Manages the archive of saved and completed missions, deterministic replays,
 * and comparative analytics across mission runs.
 */

import { create } from 'zustand';
import {
  SavedMissionRun,
  ReplaySession,
} from '@/simulation/models/missionHistory';
import { MissionState } from '@/simulation/models/missionState';
import { DEFAULT_SAVED_RUNS } from '@/data/mission/defaultSavedRuns';
import {
  initReplaySession,
  stepReplaySession,
} from '@/simulation/engine/replayEngine';
import { cloneMissionState } from '@/simulation/engine/core';

export type MissionHistoryTab =
  | 'library'
  | 'summary'
  | 'crew'
  | 'emergencies'
  | 'resources'
  | 'comparison'
  | 'replay'
  | 'events';

const STORAGE_KEY = 'lighttime_saved_missions_v1';

// Helper to safely load saved runs from localStorage
function loadSavedRunsFromStorage(): SavedMissionRun[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_SAVED_RUNS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_RUNS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0].missionId && parsed[0].initialState && parsed[0].finalState) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[LIGHTTIME History] Failed to parse stored runs, resetting to defaults.', err);
  }
  return DEFAULT_SAVED_RUNS;
}

// Helper to persist runs to localStorage
function persistRunsToStorage(runs: SavedMissionRun[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  } catch (err) {
    console.warn('[LIGHTTIME History] Failed to persist runs to storage.', err);
  }
}

interface MissionHistoryState {
  savedRuns: SavedMissionRun[];
  activeTab: MissionHistoryTab;
  selectedRunId: string | null;
  comparisonRunIds: [string, string];
  activeReplay: ReplaySession | null;

  // View Actions
  setActiveTab: (tab: MissionHistoryTab) => void;
  selectRun: (missionId: string) => void;
  setComparisonRuns: (runIdA: string, runIdB: string) => void;

  // Archive Actions
  saveCurrentMission: (
    currentState: MissionState,
    initialSnapshot: MissionState,
    notes?: string
  ) => SavedMissionRun;
  deleteRun: (missionId: string) => void;
  resetToDefaultArchive: () => void;

  // Replay Actions
  startReplay: (missionId: string) => void;
  stepReplay: (stepIndex: number) => void;
  nextReplayStep: () => void;
  prevReplayStep: () => void;
  playReplay: () => void;
  pauseReplay: () => void;
  setReplaySpeed: (speed: number) => void;
  resetReplay: () => void;
  closeReplay: () => void;
}

export const useMissionHistoryStore = create<MissionHistoryState>((set, get) => {
  const initialRuns = loadSavedRunsFromStorage();
  const defaultSelectedId = initialRuns[0]?.missionId || null;
  const defaultComparisonIds: [string, string] = [
    initialRuns[0]?.missionId || 'LT-EXP30-NOMINAL-RUN',
    initialRuns[1]?.missionId || initialRuns[0]?.missionId || 'LT-EXP28-CRYO-TRIAGE',
  ];

  return {
    savedRuns: initialRuns,
    activeTab: 'events',
    selectedRunId: defaultSelectedId,
    comparisonRunIds: defaultComparisonIds,
    activeReplay: null,

    setActiveTab: (tab) => set({ activeTab: tab }),

    selectRun: (missionId: string) => {
      set({ selectedRunId: missionId });
    },

    setComparisonRuns: (runIdA: string, runIdB: string) => {
      set({ comparisonRunIds: [runIdA, runIdB] });
    },

    saveCurrentMission: (currentState, initialSnapshot, notes) => {
      const { savedRuns } = get();
      const missionId = currentState.mission.missionId;
      const isCompleted = currentState.mission.missionStatus === 'COMPLETED';

      const newRun: SavedMissionRun = {
        missionId: `${missionId}-SAVED-${Date.now().toString(36).toUpperCase()}`,
        missionName: currentState.mission.missionName,
        scenarioId: 'SCEN-CUSTOM-RUN',
        scenarioVersion: '1.0.0',
        rulesVersion: currentState.mission.simulationRulesVersion,
        initialState: cloneMissionState(initialSnapshot),
        userActions: [...currentState.records.actionHistory],
        simulationEvents: [...currentState.records.eventHistory],
        finalState: cloneMissionState(currentState),
        completionTime: isCompleted
          ? `T+${currentState.mission.elapsedHours}h (Completed)`
          : `T+${currentState.mission.elapsedHours}h (Active Checkpoint)`,
        completionTimeHours: currentState.mission.elapsedHours,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        grade: isCompleted ? 'EXEMPLARY' : undefined,
        overallScore: Math.round(currentState.habitatResources.resourceSecurityIndex),
        summaryNotes:
          notes ||
          `Mission snapshot captured at Sol ${currentState.mission.missionDay}, T+${currentState.mission.elapsedHours}h.`,
        savedAt: new Date().toISOString(),
      };

      const updatedRuns = [newRun, ...savedRuns];
      persistRunsToStorage(updatedRuns);

      set({
        savedRuns: updatedRuns,
        selectedRunId: newRun.missionId,
      });

      return newRun;
    },

    deleteRun: (missionId: string) => {
      const { savedRuns, selectedRunId } = get();
      const updated = savedRuns.filter((r) => r.missionId !== missionId);
      persistRunsToStorage(updated);

      set({
        savedRuns: updated,
        selectedRunId: selectedRunId === missionId ? updated[0]?.missionId || null : selectedRunId,
      });
    },

    resetToDefaultArchive: () => {
      persistRunsToStorage(DEFAULT_SAVED_RUNS);
      set({
        savedRuns: DEFAULT_SAVED_RUNS,
        activeTab: 'events',
        selectedRunId: DEFAULT_SAVED_RUNS[0]?.missionId || null,
        comparisonRunIds: [DEFAULT_SAVED_RUNS[0]!.missionId, DEFAULT_SAVED_RUNS[1]!.missionId],
        activeReplay: null,
      });
    },

    // ------------------------------------------------------------------------
    // Deterministic Replay Controls
    // ------------------------------------------------------------------------

    startReplay: (missionId: string) => {
      const { savedRuns } = get();
      const target = savedRuns.find((r) => r.missionId === missionId);
      if (!target) return;

      const session = initReplaySession(target);
      set({
        activeReplay: session,
        activeTab: 'replay',
      });
    },

    stepReplay: (stepIndex: number) => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      const updated = stepReplaySession(activeReplay, stepIndex);
      set({ activeReplay: updated });
    },

    nextReplayStep: () => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      const nextIndex = Math.min(
        activeReplay.currentStepIndex + 1,
        activeReplay.timeline.length - 1
      );
      const updated = stepReplaySession(activeReplay, nextIndex);
      set({ activeReplay: updated });
    },

    prevReplayStep: () => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      const prevIndex = Math.max(0, activeReplay.currentStepIndex - 1);
      const updated = stepReplaySession(activeReplay, prevIndex);
      set({ activeReplay: updated });
    },

    playReplay: () => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      set({
        activeReplay: { ...activeReplay, isPlaying: true },
      });
    },

    pauseReplay: () => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      set({
        activeReplay: { ...activeReplay, isPlaying: false },
      });
    },

    setReplaySpeed: (speed: number) => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      set({
        activeReplay: { ...activeReplay, playbackSpeed: speed },
      });
    },

    resetReplay: () => {
      const { activeReplay } = get();
      if (!activeReplay) return;
      const updated = stepReplaySession(activeReplay, 0);
      set({
        activeReplay: { ...updated, isPlaying: false },
      });
    },

    closeReplay: () => {
      set({
        activeReplay: null,
        activeTab: 'library',
      });
    },
  };
});
