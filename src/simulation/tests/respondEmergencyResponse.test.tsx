/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * RESPOND Emergency Response Module Test Suite
 *
 * Comprehensive tests verifying:
 * 1. Five playable emergency scenarios and canonical metadata.
 * 2. Simulation engine deterministic triggers and physical state mutations.
 * 3. Interactive decision commands and physical consequences.
 * 4. Communication constraints: blocking ground assistance during Loss-of-Signal (Flight Rule 11.5).
 * 5. Replayability and deterministic reset.
 * 6. UI rendering: briefings, countdown clock, timeline, telemetry impact, and debriefing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import {
  createInitialMissionState,
  cloneMissionState,
} from '@/simulation/engine/core';
import { applyMissionCommand } from '@/simulation/commands/commandDispatcher';
import { EMERGENCY_SCENARIOS } from '@/data/emergencies/emergencyScenarios';
import { RespondEmergenciesView } from '@/features/respond/RespondEmergenciesView';

describe('RESPOND Emergency Response Module', () => {
  beforeEach(() => {
    useMissionStore.getState().resetMission();
  });

  // ==========================================================================
  // 1. Scenario Catalog & Metadata Validation
  // ==========================================================================
  describe('1. Five Playable Scenarios Metadata & Structure', () => {
    it('defines exactly five playable emergency scenarios', () => {
      expect(EMERGENCY_SCENARIOS).toHaveLength(5);
      const categories = EMERGENCY_SCENARIOS.map((s) => s.category);
      expect(categories).toContain('OXYGEN');
      expect(categories).toContain('POWER');
      expect(categories).toContain('RADIATION');
      expect(categories).toContain('COMMUNICATIONS');
      expect(categories).toContain('CO2');
    });

    it('each scenario defines all required canonical fields', () => {
      for (const scenario of EMERGENCY_SCENARIOS) {
        expect(scenario.id).toBeDefined();
        expect(scenario.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(scenario.title).toBeDefined();
        expect(scenario.severity).toMatch(/^(WARNING|CRITICAL)$/);
        expect(scenario.eventDurationSeconds).toBeGreaterThan(0);
        expect(scenario.responseDeadlineSeconds).toBeGreaterThan(0);
        expect(scenario.triggerConditions.description).toBeDefined();
        expect(scenario.triggerConditions.thresholdDisplay).toBeDefined();
        expect(scenario.initialConditions.narrative).toBeDefined();
        expect(Object.keys(scenario.initialConditions.telemetryDeltas).length).toBeGreaterThan(0);
        expect(scenario.consequences.unresolvedFailure).toBeDefined();
        expect(scenario.consequences.successfulMitigation).toBeDefined();
        expect(scenario.learningObjectives.length).toBeGreaterThan(0);
        expect(scenario.flightRuleReferences.length).toBeGreaterThan(0);
        expect(scenario.availableActions.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('every action specifies operational costs, authority, and consequence summary', () => {
      for (const scenario of EMERGENCY_SCENARIOS) {
        for (const action of scenario.availableActions) {
          expect(action.actionId).toBeDefined();
          expect(action.label).toBeDefined();
          expect(action.subsystem).toBeDefined();
          expect(action.action).toBeDefined();
          expect(action.authorizedBy).toMatch(/^(GROUND|CREW_AUTONOMY)$/);
          expect(typeof action.requiresEarthComms).toBe('boolean');
          expect(action.cost.timeMinutes).toBeGreaterThan(0);
          expect(action.consequenceSummary).toBeDefined();
        }
      }
    });
  });

  // ==========================================================================
  // 2. Simulation Engine Deterministic Triggers & Subsystem Mutations
  // ==========================================================================
  describe('2. Deterministic Emergency Triggers in Simulation Engine', () => {
    it('triggers Oxygen Leakage: accelerates bleed to 1.20 kg/hr and deducts reserve', () => {
      const state = createInitialMissionState();
      const initialO2 = state.habitatResources.oxygenInventoryKg;

      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.emergency.activeScenario).toBe('SCENARIO-EMG-01-O2-LEAK');
      expect(res.updatedState.emergency.severity).toBe('CRITICAL');
      expect(res.updatedState.emergency.remainingResponseTimeSeconds).toBe(1200);
      expect(res.updatedState.habitatResources.oxygenConsumptionRateKgPerHour).toBe(1.20);
      expect(res.updatedState.habitatResources.oxygenInventoryKg).toBeCloseTo(initialO2 - 10.0, 1);
    });

    it('triggers Power Shortage: trips reactor and drops battery to 10% SoC', () => {
      const state = createInitialMissionState();
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-02-POWER-COLLAPSE' },
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.emergency.activeScenario).toBe('SCENARIO-EMG-02-POWER-COLLAPSE');
      const reactor = res.updatedState.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
      expect(reactor?.status).toBe('FAILED');
      expect(res.updatedState.habitatResources.batteryStorageKwh).toBe(20.0);
      expect(res.updatedState.habitatResources.batteryStateOfChargePercent).toBe(10.0);
      expect(res.updatedState.habitatResources.powerGenerationKw).toBe(8.2);
    });

    it('triggers Radiation Event: spikes hazard index to 92.0 and elevates crew stress', () => {
      const state = createInitialMissionState();
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT' },
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.emergency.activeScenario).toBe('SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT');
      expect(res.updatedState.environment.educationalRadiationHazardIndex).toBe(92.0);
      expect(res.updatedState.crew[0].stressIndex).toBeGreaterThan(state.crew[0].stressIndex);
    });

    it('triggers Communication Interruption: severs DSN carrier to DISCONNECTED', () => {
      const state = createInitialMissionState();
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-04-COMMS-BLACKOUT' },
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.emergency.activeScenario).toBe('SCENARIO-EMG-04-COMMS-BLACKOUT');
      expect(res.updatedState.communications.status).toBe('DISCONNECTED');
      expect(res.updatedState.communications.availabilityPercent).toBe(0.0);
    });

    it('triggers CO2 Scrubber Fault: trips CDRA amine bed and halts scrubbing', () => {
      const state = createInitialMissionState();
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT' },
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.emergency.activeScenario).toBe('SCENARIO-EMG-05-CO2-SCRUBBER-FAULT');
      const cdra = res.updatedState.equipment.find((e) => e.equipmentId.includes('CDRA'));
      expect(cdra?.status).toBe('FAILED');
      expect(res.updatedState.habitatResources.co2RemovalCapacityKgPerHour).toBe(0.00);
    });
  });

  // ==========================================================================
  // 3. Interactive Response Directives & Consequences
  // ==========================================================================
  describe('3. Interactive Decisions & Physical Consequences', () => {
    it('executes ISOLATE_O2_LEAK: stops rapid leak rate and expends 2 kg purge gas', () => {
      let state = createInitialMissionState();
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      }).updatedState;

      const preIsolateO2 = state.habitatResources.oxygenInventoryKg;
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'ISOLATE_O2_LEAK',
        initiatedBy: 'CREW',
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.habitatResources.oxygenConsumptionRateKgPerHour).toBe(0.14);
      expect(res.updatedState.habitatResources.oxygenInventoryKg).toBeCloseTo(preIsolateO2 - 2.0, 1);
      expect(res.updatedState.emergency.responseActions.some((a) => a.actionId === 'ACT-O2-ISOLATE-LINE')).toBe(true);
    });

    it('executes MOVE_CREW_TO_SHELTER: shields crew and attenuates radiation by 92%', () => {
      let state = createInitialMissionState();
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT' },
      }).updatedState;

      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'MOVE_CREW_TO_SHELTER',
        initiatedBy: 'CREW',
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.environment.educationalRadiationHazardIndex).toBe(15.0); // Shielded
      for (const astronaut of res.updatedState.crew) {
        expect(astronaut.assignedTasks).toContain('STORM_SHELTER_CONFINEMENT');
      }
      expect(res.updatedState.emergency.responseActions.some((a) => a.actionId === 'ACT-RAD-MOVE-SHELTER')).toBe(true);
    });

    it('executes ACTIVATE_BACKUP_EQUIPMENT for CDRA Bed B: restores 0.35 kg/hr scrub', () => {
      let state = createInitialMissionState();
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT' },
      }).updatedState;

      const res = applyMissionCommand(state, {
        subsystem: 'HABITAT_SYSTEMS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { unitType: 'CDRA_BED_B' },
        initiatedBy: 'CREW',
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.habitatResources.co2RemovalCapacityKgPerHour).toBe(0.35);
    });

    it('executes REALIGN_HIGH_GAIN_ANTENNA: restores DSN carrier to 100% CONNECTED', () => {
      let state = createInitialMissionState();
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-04-COMMS-BLACKOUT' },
      }).updatedState;

      const res = applyMissionCommand(state, {
        subsystem: 'COMMUNICATIONS',
        action: 'REALIGN_HIGH_GAIN_ANTENNA',
        initiatedBy: 'CREW',
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.communications.status).toBe('CONNECTED');
      expect(res.updatedState.communications.availabilityPercent).toBe(100.0);
    });
  });

  // ==========================================================================
  // 4. Communication Constraints (Flight Rule 11.5)
  // ==========================================================================
  describe('4. Communication Constraints & Ground Assistance Interlocks', () => {
    it('blocks ground-assisted action when communications are DISCONNECTED', () => {
      const state = createInitialMissionState();
      state.communications.status = 'DISCONNECTED';
      state.communications.availabilityPercent = 0.0;

      // Attempting to request ground diagnostic assistance while comms is offline
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_DIAGNOSTICS',
        parameters: { requiresEarthComms: true },
        initiatedBy: 'GROUND',
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/COMMAND BLOCKED/i);
      expect(res.message).toMatch(/Flight Rule 11\.5/i);
      expect(res.actionRecord.outcome).toBe('REJECTED');
    });

    it('allows on-board crew autonomy actions when communications are DISCONNECTED', () => {
      const state = createInitialMissionState();
      state.communications.status = 'DISCONNECTED';

      // Crew autonomy action: Realign dish locally
      const res = applyMissionCommand(state, {
        subsystem: 'COMMUNICATIONS',
        action: 'REALIGN_HIGH_GAIN_ANTENNA',
        parameters: { requiresEarthComms: false },
        initiatedBy: 'CREW',
      });

      expect(res.success).toBe(true);
      expect(res.updatedState.communications.status).toBe('CONNECTED');
    });

    it('allows ground assistance after communications link has been re-established', () => {
      let state = createInitialMissionState();
      state.communications.status = 'DISCONNECTED';

      // 1. Crew re-establishes antenna lock
      state = applyMissionCommand(state, {
        subsystem: 'COMMUNICATIONS',
        action: 'REALIGN_HIGH_GAIN_ANTENNA',
        initiatedBy: 'CREW',
      }).updatedState;

      expect(state.communications.status).toBe('CONNECTED');

      // 2. Now ground-directed analysis is permitted
      const groundRes = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_DIAGNOSTICS',
        parameters: { requiresEarthComms: true },
        initiatedBy: 'GROUND',
      });

      expect(groundRes.success).toBe(true);
      expect(groundRes.actionRecord.outcome).toBe('SUCCESS');
    });
  });

  // ==========================================================================
  // 5. Replayability & Deterministic Reset
  // ==========================================================================
  describe('5. Replayability & State Reset', () => {
    it('resets emergency to nominal state without corrupting mission progress', () => {
      let state = createInitialMissionState();
      state.mission.elapsedHours = 48.0;

      // Trigger radiation emergency
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT' },
      }).updatedState;
      expect(state.emergency.activeScenario).toBe('SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT');

      // Reset emergency
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'RESET_EMERGENCY',
        initiatedBy: 'CREW',
      }).updatedState;

      expect(state.emergency.activeScenario).toBeNull();
      expect(state.emergency.severity).toBe('NONE');
      expect(state.environment.educationalRadiationHazardIndex).toBe(18.0);
      expect(state.mission.elapsedHours).toBe(48.0); // Preserved mission clock
    });

    it('proves deterministic execution: identical action sequences produce identical states', () => {
      const state1 = createInitialMissionState();
      const state2 = cloneMissionState(state1);

      // Sequence on state1
      let s1 = applyMissionCommand(state1, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      }).updatedState;
      s1 = applyMissionCommand(s1, {
        subsystem: 'EMERGENCY',
        action: 'ISOLATE_O2_LEAK',
        initiatedBy: 'CREW',
      }).updatedState;

      // Sequence on state2
      let s2 = applyMissionCommand(state2, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      }).updatedState;
      s2 = applyMissionCommand(s2, {
        subsystem: 'EMERGENCY',
        action: 'ISOLATE_O2_LEAK',
        initiatedBy: 'CREW',
      }).updatedState;

      expect(s1.habitatResources.oxygenInventoryKg).toBe(s2.habitatResources.oxygenInventoryKg);
      expect(s1.habitatResources.oxygenConsumptionRateKgPerHour).toBe(s2.habitatResources.oxygenConsumptionRateKgPerHour);
      expect(s1.emergency.responseActions).toHaveLength(s2.emergency.responseActions.length);
    });
  });

  // ==========================================================================
  // 6. UI Rendering & Interactive Controls
  // ==========================================================================
  describe('6. RESPOND Emergencies View UI Rendering', () => {
    it('renders scenario selector tabs and pre-scenario briefing', () => {
      render(
        <BrowserRouter>
          <RespondEmergenciesView />
        </BrowserRouter>
      );

      // Verify all 5 scenarios are available in selector
      expect(screen.getByText(/1\. Oxygen Leakage/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Power Shortage/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Radiation Event/i)).toBeInTheDocument();
      expect(screen.getByText(/4\. Communication Interruption/i)).toBeInTheDocument();
      expect(screen.getByText(/5\. CO2 Removal Malfunction/i)).toBeInTheDocument();

      // Briefing header and initiate button visible
      expect(screen.getByText(/INITIATE CONTINGENCY SIMULATION/i)).toBeInTheDocument();
      expect(screen.getByText(/SITUATIONAL THREAT BRIEFING/i)).toBeInTheDocument();
      expect(screen.getByText(/PEDAGOGICAL LEARNING OBJECTIVES & NASA FLIGHT RULES/i)).toBeInTheDocument();
    });

    it('switches to active emergency HUD when scenario is initiated', () => {
      render(
        <BrowserRouter>
          <RespondEmergenciesView />
        </BrowserRouter>
      );

      // Click Initiate Contingency Simulation
      const initiateBtn = screen.getByText(/INITIATE CONTINGENCY SIMULATION/i);
      fireEvent.click(initiateBtn);

      // Verify Active HUD elements appear
      expect(screen.getByText(/MASTER ALARM:/i)).toBeInTheDocument();
      expect(screen.getByText(/RESPONSE WINDOW/i)).toBeInTheDocument();
      expect(screen.getByText(/INTERACTIVE CONTINGENCY DIRECTIVES/i)).toBeInTheDocument();
      expect(screen.getByText(/RESOLVE & OPEN DEBRIEFING/i)).toBeInTheDocument();
    });

    it('executes directive from the UI and updates telemetry', () => {
      render(
        <BrowserRouter>
          <RespondEmergenciesView />
        </BrowserRouter>
      );

      // 1. Launch Oxygen Leakage scenario
      fireEvent.click(screen.getByText(/INITIATE CONTINGENCY SIMULATION/i));

      // 2. Click EXECUTE DIRECTIVE on Isolate Damaged Oxygen Line
      const executeButtons = screen.getAllByText(/EXECUTE DIRECTIVE/i);
      expect(executeButtons.length).toBeGreaterThan(0);
      fireEvent.click(executeButtons[0]!);

      // 3. Confirm directive execution feedback appears
      expect(screen.getByText(/DIRECTIVE EXECUTED/i)).toBeInTheDocument();
      expect(screen.getByText(/DIRECTIVE EXECUTION TELEMETRY/i)).toBeInTheDocument();
    });

    it('opens debriefing modal upon emergency resolution and calculates scores', () => {
      render(
        <BrowserRouter>
          <RespondEmergenciesView />
        </BrowserRouter>
      );

      // 1. Launch scenario
      fireEvent.click(screen.getByText(/INITIATE CONTINGENCY SIMULATION/i));

      // 2. Execute a mitigation directive to satisfy operational resolution requirement
      const executeButtons = screen.getAllByText(/EXECUTE DIRECTIVE/i);
      fireEvent.click(executeButtons[0]!);

      // 3. Resolve contingency
      const resolveBtn = screen.getByText(/RESOLVE & OPEN DEBRIEFING/i);
      expect(resolveBtn).not.toBeDisabled();
      fireEvent.click(resolveBtn);

      // 4. Verify Debriefing Modal appears with scores and flight rules
      expect(screen.getByText(/MISSION DEBRIEFING:/i)).toBeInTheDocument();
      expect(screen.getByText(/REACTION SPEED/i)).toBeInTheDocument();
      expect(screen.getByText(/RESOURCE EFFICIENCY/i)).toBeInTheDocument();
      expect(screen.getByText(/FLIGHT RULE ADHERENCE/i)).toBeInTheDocument();
      expect(screen.getByText(/NASA FLIGHT CONTROLLER DEBRIEFING NOTES/i)).toBeInTheDocument();
      expect(screen.getByText(/REPLAY SCENARIO \(TEST ALTERNATE STRATEGY\)/i)).toBeInTheDocument();
    });
  });
});
