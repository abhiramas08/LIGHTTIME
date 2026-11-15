/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission History & Deterministic Replay Test Suite
 *
 * Verifies:
 * 1. Saved run canonical data model (8 required fields).
 * 2. Pure deterministic replay matching original saved results.
 * 3. Strict immutability guarantee (original run is never mutated).
 * 4. Cross-mission comparative analytics engine.
 * 5. Zustand store actions and replay stepping.
 * 6. UI views and interaction workflows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DEFAULT_SAVED_RUNS } from '@/data/mission/defaultSavedRuns';
import {
  generateReplayTimeline,
  initReplaySession,
  stepReplaySession,
  compareMissionRuns,
  verifyReplayMatching,
} from '@/simulation/engine/replayEngine';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';
import { MissionHistoryView } from '@/features/mission-history/MissionHistoryView';
import { cloneMissionState, createInitialMissionState } from '@/simulation/engine/core';

describe('Mission History & Deterministic Replay System', () => {
  beforeEach(() => {
    useMissionHistoryStore.getState().resetToDefaultArchive();
  });

  // ==========================================================================
  // 1. Saved Mission Canonical Data Model
  // ==========================================================================
  describe('Canonical Saved Mission Run Schema', () => {
    it('contains all 8 required fields specified by mission architecture', () => {
      expect(DEFAULT_SAVED_RUNS.length).toBeGreaterThanOrEqual(2);

      DEFAULT_SAVED_RUNS.forEach((run) => {
        // Field 1: Mission ID
        expect(run.missionId).toBeDefined();
        expect(typeof run.missionId).toBe('string');
        expect(run.missionId.length).toBeGreaterThan(0);

        // Field 2: Scenario ID & Version
        expect(run.scenarioId).toBeDefined();
        expect(run.scenarioVersion).toBeDefined();

        // Field 3: Flight Rules Version
        expect(run.rulesVersion).toBeDefined();
        expect(typeof run.rulesVersion).toBe('string');

        // Field 4: Initial State Snapshot
        expect(run.initialState).toBeDefined();
        expect(run.initialState.mission.elapsedHours).toBe(0);
        expect(run.initialState.crew.length).toBe(4);
        expect(run.initialState.habitatResources.oxygenInventoryKg).toBeGreaterThan(0);

        // Field 5: Dispatched User Actions
        expect(Array.isArray(run.userActions)).toBe(true);
        run.userActions.forEach((act) => {
          expect(act.actionId).toBeDefined();
          expect(act.command).toBeDefined();
          expect(act.subsystem).toBeDefined();
          expect(act.timestampHours).toBeGreaterThanOrEqual(0);
        });

        // Field 6: Simulation Events
        expect(Array.isArray(run.simulationEvents)).toBe(true);
        expect(run.simulationEvents.length).toBeGreaterThan(0);

        // Field 7: Final State Snapshot
        expect(run.finalState).toBeDefined();
        expect(run.finalState.mission.elapsedHours).toBe(run.completionTimeHours);
        expect(run.finalState.crew.length).toBe(4);

        // Field 8: Completion Time
        expect(run.completionTime).toBeDefined();
        expect(typeof run.completionTime).toBe('string');
        expect(run.completionTimeHours).toBeGreaterThan(0);
      });
    });

    it('accurately distinguishes completed missions from active saved checkpoints', () => {
      const completedRuns = DEFAULT_SAVED_RUNS.filter((r) => r.status === 'COMPLETED');
      const activeRuns = DEFAULT_SAVED_RUNS.filter((r) => r.status === 'ACTIVE');

      expect(completedRuns.length).toBeGreaterThanOrEqual(2);
      expect(activeRuns.length).toBeGreaterThanOrEqual(1);

      expect(completedRuns[0]!.finalState.mission.missionStatus).toBe('COMPLETED');
      expect(activeRuns[0]!.finalState.mission.missionStatus).toBe('ACTIVE');
    });
  });

  // ==========================================================================
  // 2. Deterministic Replay Engine
  // ==========================================================================
  describe('Deterministic Replay & Reproducibility Guarantee', () => {
    it('regenerates flight timeline from initial snapshot and matches saved final state', () => {
      const targetRun = DEFAULT_SAVED_RUNS[0]!;
      const result = generateReplayTimeline(targetRun);

      expect(result.timeline.length).toBeGreaterThan(1);
      expect(result.timeline[0]!.type).toBe('INITIAL_STATE');
      expect(result.timeline[result.timeline.length - 1]!.type).toBe('MISSION_COMPLETION');

      // Replay verification match flag
      expect(result.isMatchWithOriginal).toBe(true);

      // Verify final elapsed hours
      expect(result.finalReplayState.mission.elapsedHours).toBe(targetRun.finalState.mission.elapsedHours);

      // Verify life support reserves match original within scientific tolerance
      expect(
        Math.abs(
          result.finalReplayState.habitatResources.oxygenInventoryKg -
            targetRun.finalState.habitatResources.oxygenInventoryKg
        )
      ).toBeLessThanOrEqual(2.0);

      expect(
        Math.abs(
          result.finalReplayState.habitatResources.waterInventoryLiters -
            targetRun.finalState.habitatResources.waterInventoryLiters
        )
      ).toBeLessThanOrEqual(5.0);
    });

    it('reproduces identical results across multiple separate replay executions', () => {
      const targetRun = DEFAULT_SAVED_RUNS[1]!; // Contingency triage run

      const run1 = generateReplayTimeline(targetRun);
      const run2 = generateReplayTimeline(targetRun);

      expect(run1.timeline.length).toBe(run2.timeline.length);
      expect(run1.isMatchWithOriginal).toBe(true);
      expect(run2.isMatchWithOriginal).toBe(true);

      expect(run1.finalReplayState.habitatResources.oxygenInventoryKg).toBe(
        run2.finalReplayState.habitatResources.oxygenInventoryKg
      );
      expect(run1.finalReplayState.habitatResources.batteryStorageKwh).toBe(
        run2.finalReplayState.habitatResources.batteryStorageKwh
      );
    });

    it('accurately detects divergence if an artificial mismatch is introduced', () => {
      const original = DEFAULT_SAVED_RUNS[0]!.finalState;
      const modified = cloneMissionState(original);
      modified.habitatResources.oxygenInventoryKg -= 50; // Artificial severe loss

      const report = verifyReplayMatching(modified, original);
      const o2Check = report.find((r) => r.field.includes('Oxygen Mass'));

      expect(o2Check).toBeDefined();
      expect(o2Check!.status).toBe('DIVERGENCE');
    });
  });

  // ==========================================================================
  // 3. Immutability Guarantee
  // ==========================================================================
  describe('Strict Immutability Guarantee', () => {
    it('never mutates original saved mission data during replay generation and stepping', () => {
      const targetRun = DEFAULT_SAVED_RUNS[0]!;

      // Deep snapshot clone of original before replay
      const originalInitialSnapshotJson = JSON.stringify(targetRun.initialState);
      const originalFinalSnapshotJson = JSON.stringify(targetRun.finalState);
      const originalActionsJson = JSON.stringify(targetRun.userActions);

      const session = initReplaySession(targetRun);

      // Step forward and backward through timeline
      stepReplaySession(session, 2);
      stepReplaySession(session, 0);
      stepReplaySession(session, session.timeline.length - 1);

      // Assert original object was not mutated by even a single byte
      expect(JSON.stringify(targetRun.initialState)).toBe(originalInitialSnapshotJson);
      expect(JSON.stringify(targetRun.finalState)).toBe(originalFinalSnapshotJson);
      expect(JSON.stringify(targetRun.userActions)).toBe(originalActionsJson);
    });
  });

  // ==========================================================================
  // 4. Cross-Mission Comparative Analysis
  // ==========================================================================
  describe('Comparative Analysis Solver', () => {
    it('compares two completed runs side-by-side with genuine calculated metrics', () => {
      const runA = DEFAULT_SAVED_RUNS[0]!; // 30 sols
      const runB = DEFAULT_SAVED_RUNS[1]!; // 14 sols

      const report = compareMissionRuns(runA, runB);

      expect(report.runA.missionId).toBe(runA.missionId);
      expect(report.runB.missionId).toBe(runB.missionId);
      expect(report.metrics.length).toBeGreaterThanOrEqual(6);

      // Duration metric
      const durationMetric = report.metrics.find((m) => m.metricName === 'Mission Duration');
      expect(durationMetric).toBeDefined();
      expect(durationMetric!.advantage).toBe('A');

      // Oxygen consumed metric
      const o2Metric = report.metrics.find((m) => m.metricName === 'Oxygen Consumed');
      expect(o2Metric).toBeDefined();
      expect(o2Metric!.valA).toBeDefined();
      expect(o2Metric!.valB).toBeDefined();

      // Educational takeaways
      expect(report.educationalExplanations.length).toBeGreaterThanOrEqual(2);
      expect(report.executiveTakeaway.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 5. Zustand Mission History Store Actions
  // ==========================================================================
  describe('Zustand Mission History Store', () => {
    it('initializes with pre-seeded historical catalog', () => {
      const { savedRuns, selectedRunId, activeTab } = useMissionHistoryStore.getState();

      expect(savedRuns.length).toBeGreaterThanOrEqual(3);
      expect(selectedRunId).toBe(savedRuns[0]!.missionId);
      expect(activeTab).toBeDefined();
    });

    it('initiates and steps through a deterministic replay session', () => {
      const store = useMissionHistoryStore.getState();
      const targetId = store.savedRuns[0]!.missionId;

      store.startReplay(targetId);
      const afterStart = useMissionHistoryStore.getState();

      expect(afterStart.activeReplay).not.toBeNull();
      expect(afterStart.activeTab).toBe('replay');
      expect(afterStart.activeReplay!.currentStepIndex).toBe(0);

      // Step forward
      store.nextReplayStep();
      expect(useMissionHistoryStore.getState().activeReplay!.currentStepIndex).toBe(1);

      // Step backward
      store.prevReplayStep();
      expect(useMissionHistoryStore.getState().activeReplay!.currentStepIndex).toBe(0);

      // Reset
      store.nextReplayStep();
      store.resetReplay();
      expect(useMissionHistoryStore.getState().activeReplay!.currentStepIndex).toBe(0);
    });

    it('snapshots and saves the live mission state into the archive', () => {
      const liveState = createInitialMissionState({
        mission: {
          missionId: 'LT-EXP99-LIVE-TEST',
          missionName: 'Live Simulation Test Sortie',
          missionDay: 5,
          elapsedHours: 120,
          missionDuration: 30,
          missionStatus: 'ACTIVE',
          simulationRulesVersion: '1.0.0-artemis',
        },
      });

      const initialSnapshot = createInitialMissionState();
      const store = useMissionHistoryStore.getState();
      const initialCount = store.savedRuns.length;

      const saved = store.saveCurrentMission(liveState, initialSnapshot, 'User test checkpoint');

      expect(saved.missionName).toBe('Live Simulation Test Sortie');
      expect(saved.completionTimeHours).toBe(120);

      const afterSave = useMissionHistoryStore.getState();
      expect(afterSave.savedRuns.length).toBe(initialCount + 1);
      expect(afterSave.savedRuns[0]!.missionId).toBe(saved.missionId);
    });

    it('deletes a saved mission run and preserves remaining archive', () => {
      const store = useMissionHistoryStore.getState();
      const initialCount = store.savedRuns.length;
      const idToDelete = store.savedRuns[0]!.missionId;

      store.deleteRun(idToDelete);

      const afterDelete = useMissionHistoryStore.getState();
      expect(afterDelete.savedRuns.length).toBe(initialCount - 1);
      expect(afterDelete.savedRuns.some((r) => r.missionId === idToDelete)).toBe(false);
    });
  });

  // ==========================================================================
  // 6. UI Rendering and Workflows
  // ==========================================================================
  describe('Mission History View Components', () => {
    it('renders main navigation tabs and mission library', () => {
      useMissionHistoryStore.getState().setActiveTab('library');
      render(<MissionHistoryView />);

      expect(screen.getByRole('button', { name: /SAVED EXPEDITIONS ARCHIVE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EXPEDITION SUMMARY & AUDIT/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /RUN COMPARISON DECK/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /DETERMINISTIC REPLAY/i })).toBeInTheDocument();

      // Check pre-seeded run title rendered in library
      expect(
        screen.getAllByText(/Artemis Base Camp Expedition 30/i).length
      ).toBeGreaterThanOrEqual(1);
    });

    it('navigates to Run Comparison Deck and shows side-by-side matrix', () => {
      render(<MissionHistoryView />);

      const compareTabBtn = screen.getByRole('button', { name: /RUN COMPARISON DECK/i });
      fireEvent.click(compareTabBtn);

      expect(screen.getByText(/SIDE-BY-SIDE TELEMETRY & FLIGHT PERFORMANCE MATRIX/i)).toBeInTheDocument();
      expect(screen.getByText(/MISSION EXPEDITION ALPHA/i)).toBeInTheDocument();
      expect(screen.getByText(/MISSION EXPEDITION BRAVO/i)).toBeInTheDocument();
      expect(screen.getByText(/COMPARATIVE PERFORMANCE EVALUATION/i)).toBeInTheDocument();
    });

    it('navigates to Deterministic Replay and displays verified matching banner and scrubber', () => {
      render(<MissionHistoryView />);

      const replayTabBtn = screen.getByRole('button', { name: /DETERMINISTIC REPLAY/i });
      fireEvent.click(replayTabBtn);

      expect(screen.getByText(/DETERMINISTIC FLIGHT REPLAY CONSOLE/i)).toBeInTheDocument();
      expect(screen.getByText(/100% BITWISE MATCH/i)).toBeInTheDocument();
      expect(screen.getByText(/IMMUTABLE ARCHIVE GUARANTEE/i)).toBeInTheDocument();
      expect(screen.getByText(/TIMELINE SCRUBBER/i)).toBeInTheDocument();
      expect(screen.getByText(/PLAY REPLAY/i)).toBeInTheDocument();
    });

    it('opens Mission Summary and allows inspecting crew biometrics and resource balances', () => {
      render(<MissionHistoryView />);

      const summaryTabBtn = screen.getByRole('button', { name: /EXPEDITION SUMMARY & AUDIT/i });
      fireEvent.click(summaryTabBtn);

      expect(screen.getByText(/COMMANDER DEBRIEF & MISSION SUMMARY NOTES/i)).toBeInTheDocument();

      // Click Crew Biometrics sub-tab
      const crewBtn = screen.getByRole('button', { name: /CREW BIOMETRICS/i });
      fireEvent.click(crewBtn);
      expect(screen.getAllByText(/EDUCATIONAL WELLBEING INDICES/i).length).toBeGreaterThanOrEqual(1);

      // Click Resource Inventory sub-tab
      const resBtn = screen.getByRole('button', { name: /RESOURCE INVENTORY/i });
      fireEvent.click(resBtn);
      expect(screen.getByText(/FINAL EXPEDITION RESOURCE BALANCES/i)).toBeInTheDocument();
      expect(screen.getByText(/OXYGEN RESERVE/i)).toBeInTheDocument();
    });
  });
});
