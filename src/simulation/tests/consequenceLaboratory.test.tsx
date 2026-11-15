/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory Test Suite
 *
 * Verifies:
 * 1. Both runs begin from an identical deep copy of the same initial MissionState.
 * 2. Only communication conditions differ initially.
 * 3. Identical inputs produce strictly reproducible, deterministic outcomes.
 * 4. Communication constraints and Flight Rule 11.5 interlocks function properly.
 * 5. Outcome metrics (safety, consumables, resolution time) are calculated directly from simulation state with zero fabrication.
 * 6. UI interaction: configuration, independent action execution, timeline synchronization, and debriefing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  initializeLabBaseState,
  createDualLabRuns,
  executeLabRunAction,
  advanceLabRunTime,
  calculateRunOutcome,
  synthesizeComparativeReport,
} from '@/simulation/engine/consequenceEngine';
import {
  ConsequenceLabConfig,
} from '@/simulation/models/consequenceLab';
import { EMERGENCY_SCENARIOS } from '@/data/emergencies/emergencyScenarios';
import { ConsequenceLabView } from '@/features/consequence-lab/ConsequenceLabView';
import { useConsequenceLabStore } from '@/store/useConsequenceLabStore';

describe('LIGHTTIME Mission Consequence Laboratory', () => {
  const baseConfig: ConsequenceLabConfig = {
    scenarioId: 'SCENARIO-EMG-01-O2-LEAK',
    startingDay: 7,
    crewConditionId: 'NOMINAL_RESTED',
    initialResourcesId: 'NOMINAL_100',
    commConditionAId: 'REALTIME_EARTH_LINK',
    commConditionBId: 'OCCULTATION_BLACKOUT',
  };

  beforeEach(() => {
    useConsequenceLabStore.getState().resetLab();
    useConsequenceLabStore.getState().updateConfig(baseConfig);
  });

  // ==========================================================================
  // 1. Identical Starting Conditions & Deep Copy Verification
  // ==========================================================================
  describe('1. Identical Initial Conditions & Deep Copy Verification', () => {
    it('initializes base state matching selected day, crew condition, and resources', () => {
      const state = initializeLabBaseState(baseConfig);

      expect(state.mission.missionDay).toBe(7);
      expect(state.mission.elapsedHours).toBe(144.0);
      expect(state.mission.missionStatus).toBe('ACTIVE');

      // Verify all 4 astronauts received the preset values
      expect(state.crew).toHaveLength(4);
      for (const astronaut of state.crew) {
        expect(astronaut.fatigueIndex).toBe(12);
        expect(astronaut.stressIndex).toBe(15);
        expect(astronaut.sleepHours).toBe(8.0);
        expect(astronaut.availability).toBe('AVAILABLE');
      }

      // Verify habitat resources
      expect(state.habitatResources.oxygenInventoryKg).toBe(120.0);
      expect(state.habitatResources.batteryStorageKwh).toBe(100.0);
      expect(state.habitatResources.waterInventoryLiters).toBe(450.0);
    });

    it('creates two independent runs from an identical deep copy snapshot', () => {
      const { runA, runB, initialSnapshot } = createDualLabRuns(baseConfig);

      // Verify snapshot is preserved
      expect(initialSnapshot.mission.missionDay).toBe(7);

      // Verify Run A and Run B have identical simulation rules and scenario versions
      expect(runA.initialState.mission.simulationRulesVersion).toBe(
        runB.initialState.mission.simulationRulesVersion
      );
      expect(runA.initialState.mission.missionDay).toBe(runB.initialState.mission.missionDay);
      expect(runA.initialState.mission.elapsedHours).toBe(runB.initialState.mission.elapsedHours);

      // Verify identical crew biometrics and educational indices
      for (let i = 0; i < 4; i++) {
        expect(runA.initialState.crew[i]!.fatigueIndex).toBe(runB.initialState.crew[i]!.fatigueIndex);
        expect(runA.initialState.crew[i]!.stressIndex).toBe(runB.initialState.crew[i]!.stressIndex);
        expect(runA.initialState.crew[i]!.workloadIndex).toBe(runB.initialState.crew[i]!.workloadIndex);
        expect(runA.initialState.crew[i]!.sleepHours).toBe(runB.initialState.crew[i]!.sleepHours);
      }

      // Verify identical initial resource inventories
      expect(runA.initialState.habitatResources.oxygenInventoryKg).toBe(
        runB.initialState.habitatResources.oxygenInventoryKg
      );
      expect(runA.initialState.habitatResources.batteryStorageKwh).toBe(
        runB.initialState.habitatResources.batteryStorageKwh
      );
      expect(runA.initialState.habitatResources.waterInventoryLiters).toBe(
        runB.initialState.habitatResources.waterInventoryLiters
      );

      // Verify identical equipment condition across all units
      expect(runA.initialState.equipment).toHaveLength(runB.initialState.equipment.length);
      for (let i = 0; i < runA.initialState.equipment.length; i++) {
        expect(runA.initialState.equipment[i]!.condition).toBe(
          runB.initialState.equipment[i]!.condition
        );
        expect(runA.initialState.equipment[i]!.status).toBe(
          runB.initialState.equipment[i]!.status
        );
      }

      // Verify identical environment snapshot
      expect(runA.initialState.environment.lunarIlluminationPercent).toBe(
        runB.initialState.environment.lunarIlluminationPercent
      );
      expect(runA.initialState.environment.educationalRadiationHazardIndex).toBe(
        runB.initialState.environment.educationalRadiationHazardIndex
      );

      // PROVE THAT ONLY COMMUNICATION CONDITIONS DIFFER
      expect(runA.currentState.communications.status).toBe('CONNECTED');
      expect(runA.currentState.communications.delaySeconds).toBe(0.0);
      expect(runA.currentState.communications.availabilityPercent).toBe(100.0);

      expect(runB.currentState.communications.status).toBe('LOSS_OF_SIGNAL_OCCULTATION');
      expect(runB.currentState.communications.availabilityPercent).toBe(0.0);
    });

    it('mutations in Run A do not affect Run B (strict isolation)', () => {
      const { runA, runB } = createDualLabRuns(baseConfig);

      // Mutate Run A
      runA.currentState.habitatResources.oxygenInventoryKg = 42.0;

      // Run B must remain unaffected
      expect(runB.currentState.habitatResources.oxygenInventoryKg).not.toBe(42.0);
      expect(runB.currentState.habitatResources.oxygenInventoryKg).toBe(110.0); // 120 - 10 from trigger
    });
  });

  // ==========================================================================
  // 2. Deterministic Reproducibility
  // ==========================================================================
  describe('2. Deterministic Reproducibility', () => {
    it('produces identical state and outcomes when given identical inputs', () => {
      const res1 = createDualLabRuns(baseConfig);
      const res2 = createDualLabRuns(baseConfig);

      // Both initial states must match exactly
      expect(res1.runA.currentState.habitatResources.oxygenInventoryKg).toBe(
        res2.runA.currentState.habitatResources.oxygenInventoryKg
      );
      expect(res1.runB.currentState.habitatResources.oxygenInventoryKg).toBe(
        res2.runB.currentState.habitatResources.oxygenInventoryKg
      );

      // Advance both by 2.0 hours
      const advanced1 = advanceLabRunTime(res1.runA, 2.0);
      const advanced2 = advanceLabRunTime(res2.runA, 2.0);

      expect(advanced1.currentState.habitatResources.oxygenInventoryKg).toBe(
        advanced2.currentState.habitatResources.oxygenInventoryKg
      );
      expect(advanced1.outcomeMetrics.oxygenUsedKg).toBe(
        advanced2.outcomeMetrics.oxygenUsedKg
      );
      expect(advanced1.outcomeMetrics.crewSafetyScore).toBe(
        advanced2.outcomeMetrics.crewSafetyScore
      );
    });
  });

  // ==========================================================================
  // 3. Communication Constraints & Flight Rule 11.5 Interlocks
  // ==========================================================================
  describe('3. Communication Constraints & Flight Rule 11.5 Interlocks', () => {
    it('allows ground-assisted actions under Real-Time link but rejects under Occultation Blackout', () => {
      const { runA, runB } = createDualLabRuns(baseConfig);
      const groundAction = EMERGENCY_SCENARIOS[0]!.availableActions.find(
        (a) => a.authorizedBy === 'GROUND'
      )!;

      expect(groundAction).toBeDefined();
      expect(groundAction.requiresEarthComms).toBe(true);

      // Execute on Run A (CONNECTED)
      const resA = executeLabRunAction(runA, {
        subsystem: groundAction.subsystem,
        action: groundAction.action,
        parameters: { ...groundAction.parameters, requiresEarthComms: true },
        initiatedBy: 'GROUND',
      });

      expect(resA.result.success).toBe(true);
      expect(resA.result.actionRecord.outcome).toBe('SUCCESS');
      expect(resA.updatedRun.actionsHistory[resA.updatedRun.actionsHistory.length - 1]!.outcome).toBe(
        'SUCCESS'
      );

      // Execute on Run B (LOSS_OF_SIGNAL_OCCULTATION)
      const resB = executeLabRunAction(runB, {
        subsystem: groundAction.subsystem,
        action: groundAction.action,
        parameters: { ...groundAction.parameters, requiresEarthComms: true },
        initiatedBy: 'GROUND',
      });

      expect(resB.result.success).toBe(false);
      expect(resB.result.actionRecord.outcome).toBe('REJECTED');
      expect(resB.result.message).toContain('Earth Deep Space Network carrier lock is unavailable');
      expect(resB.updatedRun.outcomeMetrics.actionsRejected).toBe(1);
    });

    it('allows autonomous crew actions under both communication conditions', () => {
      const { runA, runB } = createDualLabRuns(baseConfig);
      const crewAction = EMERGENCY_SCENARIOS[0]!.availableActions.find(
        (a) => a.authorizedBy === 'CREW_AUTONOMY'
      )!;

      expect(crewAction).toBeDefined();

      const resA = executeLabRunAction(runA, {
        subsystem: crewAction.subsystem,
        action: crewAction.action,
        parameters: crewAction.parameters,
        initiatedBy: 'CREW',
      });
      expect(resA.result.success).toBe(true);

      const resB = executeLabRunAction(runB, {
        subsystem: crewAction.subsystem,
        action: crewAction.action,
        parameters: crewAction.parameters,
        initiatedBy: 'CREW',
      });
      expect(resB.result.success).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Actual Calculated Outcome Metrics (Zero Fabrication)
  // ==========================================================================
  describe('4. Calculated Outcome Metrics (Zero Fabrication)', () => {
    it('calculates oxygen used directly from physical state delta', () => {
      const { runA } = createDualLabRuns(baseConfig);
      const initialO2 = runA.currentState.habitatResources.oxygenInventoryKg; // 110.0 kg

      // Advance by 1.0 hour at 1.20 kg/hr leak + crew metabolic rate (0.14 kg/hr) = 1.34 kg/hr
      const advanced = advanceLabRunTime(runA, 1.0);
      const finalO2 = advanced.currentState.habitatResources.oxygenInventoryKg;

      const expectedDelta = Number((initialO2 - finalO2).toFixed(2));
      expect(advanced.outcomeMetrics.oxygenUsedKg).toBe(expectedDelta);
      expect(advanced.outcomeMetrics.oxygenUsedKg).toBeGreaterThan(0);
    });

    it('calculates time to resolve directly from simulation clock delta', () => {
      const { runA } = createDualLabRuns(baseConfig);

      // Advance 2.5 hours
      const advanced = advanceLabRunTime(runA, 2.5);

      expect(advanced.outcomeMetrics.timeToResolveHours).toBe(2.5);
      expect(advanced.outcomeMetrics.timeToResolveMinutes).toBe(150);
    });

    it('calculates crew safety score objectively from biometrics and indices', () => {
      const { runA } = createDualLabRuns(baseConfig);

      // Baseline rested crew
      const initialMetrics = runA.outcomeMetrics;
      expect(initialMetrics.crewSafetyScore).toBeGreaterThanOrEqual(80);

      // Cause high stress and fatigue
      runA.currentState.crew.forEach((c) => {
        c.stressIndex = 90;
        c.fatigueIndex = 85;
      });

      const degradedMetrics = calculateRunOutcome(
        runA.initialState,
        runA.currentState,
        runA.scenarioStartTimeHours,
        runA.actionsHistory
      );

      expect(degradedMetrics.crewSafetyScore).toBeLessThan(initialMetrics.crewSafetyScore);
    });

    it('synthesizes non-fabricated comparative report with verified mathematical deltas', () => {
      const { runA, runB, scenario } = createDualLabRuns(baseConfig);

      // Advance run A by 1 hour, advance run B by 2 hours
      const updatedA = advanceLabRunTime(runA, 1.0);
      const updatedB = advanceLabRunTime(runB, 2.0);

      const report = synthesizeComparativeReport(updatedA, updatedB, scenario);

      expect(report.deltas.timeToResolveDeltaHours).toBe(-1.0);
      expect(report.deltas.oxygenUsedDelta).toBeLessThan(0); // Run B leaked more oxygen
      expect(report.educationalTakeaways.speedOfLightImpact).toContain('Run A');
      expect(report.educationalTakeaways.flightRulesApplied).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. User Interface Integration & Workflow
  // ==========================================================================
  describe('5. UI Integration & Interactive Consequence Workflow', () => {
    it('renders scenario selection controls and configuration presets', () => {
      render(
        <BrowserRouter>
          <ConsequenceLabView />
        </BrowserRouter>
      );

      expect(screen.getByText(/CONSEQUENCE LABORATORY SETUP PROTOCOL/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Oxygen Leakage/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Power Shortage/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Nominals \(100% Reserves\)/i)).toBeInTheDocument();
      expect(screen.getByText(/INITIALIZE DUAL EXPERIMENTAL RUNS/i)).toBeInTheDocument();
    });

    it('initializes dual runs and transitions to dual run decks on confirmation', async () => {
      render(
        <BrowserRouter>
          <ConsequenceLabView />
        </BrowserRouter>
      );

      const initButton = screen.getByRole('button', { name: /INITIALIZE DUAL EXPERIMENTAL RUNS/i });
      fireEvent.click(initButton);

      // Verify transition to STAGE 2: EXPERIMENT
      await waitFor(() => {
        expect(screen.getByText(/ACTIVE CONTINGENCY:/i)).toBeInTheDocument();
        expect(screen.getAllByText(/AVAILABLE EMERGENCY DIRECTIVES/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Side-by-Side Dual Deck/i)).toBeInTheDocument();
      });
    });

    it('allows executing actions independently in Run A and Run B', async () => {
      render(
        <BrowserRouter>
          <ConsequenceLabView />
        </BrowserRouter>
      );

      // Initialize runs
      fireEvent.click(screen.getByRole('button', { name: /INITIALIZE DUAL EXPERIMENTAL RUNS/i }));

      // Wait for decks to mount and find action buttons
      const isolateButtons = await screen.findAllByRole('button', { name: /EXECUTE DIRECTIVE/i });
      expect(isolateButtons.length).toBeGreaterThanOrEqual(2);

      // Click first action in Run A
      fireEvent.click(isolateButtons[0]!);

      // Verify Run A log and feedback updated
      await waitFor(() => {
        const store = useConsequenceLabStore.getState();
        expect(store.runA?.actionsHistory.some((a) => a.command === 'ISOLATE_O2_LEAK')).toBe(true);
        expect(screen.getAllByText(/ISOLATE_O2_LEAK/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('generates comparative report and displays charts and educational analysis', async () => {
      render(
        <BrowserRouter>
          <ConsequenceLabView />
        </BrowserRouter>
      );

      // Initialize runs
      fireEvent.click(screen.getByRole('button', { name: /INITIALIZE DUAL EXPERIMENTAL RUNS/i }));

      // Click Generate Report
      const reportButton = screen.getByRole('button', { name: /GENERATE REPORT/i });
      fireEvent.click(reportButton);

      // Verify report stage rendered
      await waitFor(() => {
        expect(screen.getByText(/CONSUMABLES EXPENDED \(RUN A vs RUN B\)/i)).toBeInTheDocument();
        expect(screen.getByText(/FINAL MISSION RESERVES COMPARISON TABLE/i)).toBeInTheDocument();
        expect(screen.getByText(/EDUCATIONAL SYNTHESIS & MISSION LESSONS LEARNED/i)).toBeInTheDocument();
        expect(screen.getByText(/THE SPEED-OF-LIGHT DELAY HORIZON/i)).toBeInTheDocument();
      });
    });
  });
});
