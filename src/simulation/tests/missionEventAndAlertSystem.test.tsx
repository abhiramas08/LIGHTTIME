/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Event & Alert System Test Suite
 *
 * Comprehensive tests verifying:
 * 1. Chronological mission event logging with all 9 canonical telemetry fields.
 * 2. Four notification categories: Informational, Nominal, Warning, Critical.
 * 3. Alerts generated directly from actual simulation engine state transitions.
 * 4. Deduplication: no duplicate events on repeated component renders.
 * 5. Multi-faceted filtering for Crew, Habitat, Emergency, Comms, and Mission events.
 * 6. Global alert indicator in the header with active counts and slide-out drawer.
 * 7. Event details panel displaying state transitions, triggers, and NASA flight rules.
 * 8. Strict read-only guarantee: reviewing black-box archives never mutates mission state.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import {
  createInitialMissionState,
  cloneMissionState,
  tickSimulation,
} from '@/simulation/engine/core';
import { applyMissionCommand } from '@/simulation/commands/commandDispatcher';
import {
  normalizeSeverity,
  formatSimulationTime,
  mapCategoryToAffectedSystem,
} from '@/simulation/models/eventTypes';
import { MissionHistoryView } from '@/features/mission-history/MissionHistoryView';
import { GlobalAlertIndicator } from '@/components/alerts/GlobalAlertIndicator';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import { MissionEventRecord } from '@/simulation/models/missionState';

describe('LIGHTTIME Mission Event and Alert System', () => {
  beforeEach(() => {
    useMissionStore.getState().resetMission();
  });

  // ==========================================================================
  // 1. Event Log Data Model & Structured Fields
  // ==========================================================================
  describe('1. Chronological Event Log Canonical Fields', () => {
    it('records all nine canonical fields when a flight directive is executed', () => {
      const state = createInitialMissionState();
      const res = applyMissionCommand(state, {
        subsystem: 'ECLSS',
        action: 'START_MAINTENANCE',
        parameters: { equipmentId: 'EQ-ECLSS-CDRA-01' },
        initiatedBy: 'CREW',
      });

      const event = res.eventRecord;
      expect(event.eventId).toBeDefined();
      expect(event.timestampHours).toBe(state.mission.elapsedHours);
      expect(event.simulationTime).toBeDefined(); // 1. Simulation time
      expect(event.eventType).toBe('USER_DIRECTIVE'); // 2. Event type
      expect(event.severity).toBeDefined(); // 3. Severity
      expect(event.affectedSystem).toBe('HABITAT'); // 4. Affected system
      expect(event.previousValue).toBeDefined(); // 5. Previous value
      expect(event.newValue).toBeDefined(); // 6. New value
      expect(event.trigger).toContain('START_MAINTENANCE'); // 7. Trigger
      expect(event.relatedUserAction).toBe('START_MAINTENANCE'); // 8. Related user action
      expect(event.educationalExplanation).toBeDefined(); // 9. Educational explanation
    });

    it('formats simulation time accurately into Sol and MET format', () => {
      expect(formatSimulationTime(0.0, 1)).toBe('Day 01, 00:00:00 MET');
      expect(formatSimulationTime(26.5)).toBe('Day 02, 02:30:00 MET');
      expect(formatSimulationTime(48.25)).toBe('Day 03, 00:15:00 MET');
    });

    it('maps subsystem categories to one of the 5 canonical affected systems', () => {
      expect(mapCategoryToAffectedSystem('CREW')).toBe('CREW');
      expect(mapCategoryToAffectedSystem('EVA_CONTROL')).toBe('CREW');
      expect(mapCategoryToAffectedSystem('ECLSS')).toBe('HABITAT');
      expect(mapCategoryToAffectedSystem('POWER_GRID')).toBe('HABITAT');
      expect(mapCategoryToAffectedSystem('EMERGENCY')).toBe('EMERGENCY');
      expect(mapCategoryToAffectedSystem('COMMUNICATIONS')).toBe('COMMUNICATIONS');
      expect(mapCategoryToAffectedSystem('MISSION_CONTROL')).toBe('MISSION');
    });
  });

  // ==========================================================================
  // 2. Notification Categories (Informational, Nominal, Warning, Critical)
  // ==========================================================================
  describe('2. Four Notification Categories', () => {
    it('normalizes legacy and standard severities into the 4 canonical categories', () => {
      expect(normalizeSeverity('INFO')).toBe('INFORMATIONAL');
      expect(normalizeSeverity('INFORMATIONAL')).toBe('INFORMATIONAL');
      expect(normalizeSeverity('NOMINAL')).toBe('NOMINAL');
      expect(normalizeSeverity('SUCCESS')).toBe('NOMINAL');
      expect(normalizeSeverity('WARNING')).toBe('WARNING');
      expect(normalizeSeverity('CAUTION')).toBe('WARNING');
      expect(normalizeSeverity('CRITICAL')).toBe('CRITICAL');
    });

    it('generates CRITICAL notification when oxygen breaches survival threshold', () => {
      let state = createInitialMissionState();
      state = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      }).updatedState;

      const criticalEvent = state.records.eventHistory.find(
        (e) => normalizeSeverity(e.severity) === 'CRITICAL'
      );
      expect(criticalEvent).toBeDefined();
      expect(criticalEvent?.affectedSystem).toBe('EMERGENCY');
    });

    it('generates WARNING notification when communication is interlocked or caution threshold breached', () => {
      let state = createInitialMissionState();
      state.communications.status = 'DISCONNECTED';

      // Ground attempt during LOS creates warning event
      const res = applyMissionCommand(state, {
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_DIAGNOSTICS',
        parameters: { requiresEarthComms: true },
        initiatedBy: 'GROUND',
      });

      expect(normalizeSeverity(res.eventRecord.severity)).toBe('WARNING');
      expect(res.eventRecord.affectedSystem).toBe('COMMUNICATIONS');
      expect(res.eventRecord.trigger).toContain('Flight Rule 11.5');
    });

    it('generates INFORMATIONAL notification on simulation lifecycle transitions', () => {
      useMissionStore.getState().startMission();
      const events = useMissionStore.getState().missionEventLog;
      const startEvt = events.find((e) => e.title === 'SIMULATION CLOCK STARTED');
      expect(startEvt).toBeDefined();
      expect(normalizeSeverity(startEvt!.severity)).toBe('INFORMATIONAL');
      expect(startEvt!.affectedSystem).toBe('MISSION');
    });
  });

  // ==========================================================================
  // 3. Alerts Generated from Actual Simulation Events
  // ==========================================================================
  describe('3. Engine-Generated Events from Physical State Transitions', () => {
    it('generates events directly from tickSimulation when oxygen inventory declines below thresholds', () => {
      let state = createInitialMissionState();
      state.mission.missionStatus = 'ACTIVE';

      // Set oxygen right at the 60.1 kg boundary and tick to cross warning threshold (60.0 kg)
      state.habitatResources.oxygenInventoryKg = 60.05;
      const initialCount = state.records.eventHistory.length;

      // Tick 1 hour: 4 crew consume 0.14 kg O2 -> inventory drops to ~59.91 kg
      state = tickSimulation(state, 1.0);

      expect(state.habitatResources.oxygenInventoryKg).toBeLessThan(60.0);
      expect(state.records.eventHistory.length).toBeGreaterThan(initialCount);
      const cautionEvent = state.records.eventHistory[0];
      expect(cautionEvent).toBeDefined();
      expect(cautionEvent!.title).toContain('CAUTION: Oxygen Reserves Low');
      expect(cautionEvent!.affectedSystem).toBe('HABITAT');
      expect(cautionEvent!.previousValue).toContain('60.05');
      expect(cautionEvent!.newValue).toBeDefined();
    });
  });

  // ==========================================================================
  // 4. Deduplication on Repeated Renders
  // ==========================================================================
  describe('4. Event Deduplication', () => {
    it('does not create duplicate event entries or notifications on repeated renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      const countBefore = useMissionStore.getState().missionEventLog.length;

      // Re-render the view 3 times
      rerender(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );
      rerender(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );
      rerender(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      const countAfter = useMissionStore.getState().missionEventLog.length;
      expect(countAfter).toBe(countBefore);
    });
  });

  // ==========================================================================
  // 5. Multi-Faceted Event Filtering (Crew, Habitat, Emergency, Comms, Mission)
  // ==========================================================================
  describe('5. Event Filtering and Search', () => {
    beforeEach(() => {
      // Seed store with events across all 5 systems
      useMissionStore.getState().startMission(); // MISSION event
      useMissionStore.getState().executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_SLEEP_PERIOD',
        parameters: { hours: 8 },
        initiatedBy: 'CREW',
      }); // CREW event
      useMissionStore.getState().executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'START_MAINTENANCE',
        parameters: { equipmentId: 'EQ-ECLSS-CDRA-01' },
        initiatedBy: 'CREW',
      }); // HABITAT event
      useMissionStore.getState().executeMissionCommand({
        subsystem: 'COMMUNICATIONS',
        action: 'REALIGN_HIGH_GAIN_ANTENNA',
        initiatedBy: 'CREW',
      }); // COMMUNICATIONS event
      useMissionStore.getState().executeMissionCommand({
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
        initiatedBy: 'CREW',
      }); // EMERGENCY event
    });

    it('renders filter buttons for CREW, HABITAT, EMERGENCY, COMMUNICATIONS, and MISSION', () => {
      render(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      expect(screen.getByRole('button', { name: /CREW/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /HABITAT/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EMERGENCY/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /COMMUNICATIONS/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /MISSION/i })).toBeInTheDocument();
    });

    it('filters events when system filter is clicked', () => {
      render(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      // Click HABITAT filter button
      const habitatBtn = screen.getByRole('button', { name: /HABITAT/i });
      fireEvent.click(habitatBtn);

      // Verify HABITAT directives visible and CREW directives filtered out
      expect(screen.getAllByText(/START_MAINTENANCE/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/ASSIGN_SLEEP_PERIOD/i)).not.toBeInTheDocument();
    });

    it('filters events by search query in real time', () => {
      render(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/Search events by title/i);
      fireEvent.change(searchInput, { target: { value: 'REALIGN_HIGH_GAIN_ANTENNA' } });

      expect(screen.getAllByText(/REALIGN_HIGH_GAIN_ANTENNA/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/START_MAINTENANCE/i)).not.toBeInTheDocument();
    });

    it('toggles sort order between newest first and oldest first', () => {
      render(
        <BrowserRouter>
          <MissionHistoryView />
        </BrowserRouter>
      );

      const sortBtn = screen.getByRole('button', { name: /SORT:/i });
      expect(sortBtn).toHaveTextContent(/NEWEST FIRST/i);

      fireEvent.click(sortBtn);
      expect(sortBtn).toHaveTextContent(/OLDEST FIRST/i);
    });
  });

  // ==========================================================================
  // 6. Global Alert Indicator in Header & Slide-Out Drawer
  // ==========================================================================
  describe('6. Global Alert Indicator in Header', () => {
    it('renders global alert indicator with active alarm badge', () => {
      // Trigger critical scenario
      useMissionStore.getState().executeMissionCommand({
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      });

      render(
        <BrowserRouter>
          <GlobalAlertIndicator />
        </BrowserRouter>
      );

      // Verify indicator shows critical alarm
      const indicator = screen.getByRole('button', { name: /Mission alerts indicator/i });
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveTextContent(/CRITICAL/i);
    });

    it('opens alerts drawer when global indicator is clicked', () => {
      render(
        <BrowserRouter>
          <GlobalAlertIndicator />
        </BrowserRouter>
      );

      const indicator = screen.getByRole('button', { name: /Mission alerts indicator/i });
      fireEvent.click(indicator);

      // Verify drawer header and controls render
      expect(screen.getByText(/GLOBAL MISSION ALERTS/i)).toBeInTheDocument();
      expect(screen.getByText(/OPEN FULL EVENT ARCHIVE/i)).toBeInTheDocument();
    });

    it('acknowledges alerts without mutating physical simulation state', () => {
      const stateBefore = cloneMissionState(useMissionStore.getState().missionState);

      useMissionStore.getState().executeMissionCommand({
        subsystem: 'EMERGENCY',
        action: 'TRIGGER_EMERGENCY_SCENARIO',
        parameters: { scenarioId: 'SCENARIO-EMG-01-O2-LEAK' },
      });

      render(
        <BrowserRouter>
          <GlobalAlertIndicator />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /Mission alerts indicator/i }));

      // Click ACK ALL
      const ackAllBtn = screen.getByText(/ACK ALL/i);
      fireEvent.click(ackAllBtn);

      const stateAfter = useMissionStore.getState().missionState;
      // Physical state (elapsed hours, oxygen, etc.) must remain strictly unchanged
      expect(stateAfter.mission.elapsedHours).toBe(stateBefore.mission.elapsedHours);
      expect(stateAfter.habitatResources.waterInventoryLiters).toBe(
        stateBefore.habitatResources.waterInventoryLiters
      );
    });
  });

  // ==========================================================================
  // 7. Event Details Panel & Read-Only Inspection
  // ==========================================================================
  describe('7. Event Details Panel & Read-Only Black-Box Review', () => {
    const sampleEvent: MissionEventRecord = {
      eventId: 'EVT-TEST-001',
      timestampHours: 14.5,
      simulationTime: 'Day 01, 14:30:00 MET',
      affectedSystem: 'HABITAT',
      category: 'ECLSS',
      eventType: 'RESOURCE_DEPLETION',
      title: 'CRITICAL: Cabin Oxygen Reserves Depleted',
      details: 'O2 inventory dropped below 40.0 kg safety limit.',
      severity: 'CRITICAL',
      previousValue: '50.0 kg',
      newValue: '39.8 kg',
      trigger: 'Micrometeoroid line rupture',
      relatedUserAction: 'ISOLATE_O2_LEAK',
      educationalExplanation:
        'NASA Flight Rule 4.1: Cryogenic line breaches must be isolated within 20 minutes to prevent hypoxia.',
      acknowledged: false,
    };

    it('renders all nine canonical fields and state transition comparison', () => {
      render(
        <EventDetailsModal
          event={sampleEvent}
          onClose={() => {}}
          onAcknowledge={() => {}}
        />
      );

      expect(screen.getByText('CRITICAL: Cabin Oxygen Reserves Depleted')).toBeInTheDocument();
      expect(screen.getByText('Day 01, 14:30:00 MET')).toBeInTheDocument();
      expect(screen.getByText(/SYSTEM: HABITAT/i)).toBeInTheDocument();
      expect(screen.getByText(/TYPE: RESOURCE_DEPLETION/i)).toBeInTheDocument();
      expect(screen.getByText('50.0 kg')).toBeInTheDocument();
      expect(screen.getByText('39.8 kg')).toBeInTheDocument();
      expect(screen.getByText(/Micrometeoroid line rupture/i)).toBeInTheDocument();
      expect(screen.getByText('ISOLATE_O2_LEAK')).toBeInTheDocument();
      expect(screen.getByText(/NASA Flight Rule 4\.1/i)).toBeInTheDocument();
      expect(screen.getByText(/READ-ONLY BLACK-BOX INSPECTION/i)).toBeInTheDocument();
    });

    it('inspecting event details does not alter mission state', () => {
      const stateBefore = cloneMissionState(useMissionStore.getState().missionState);

      const { unmount } = render(
        <EventDetailsModal
          event={sampleEvent}
          onClose={() => {}}
          onAcknowledge={() => {}}
        />
      );

      // Verify state was not mutated by opening details
      const stateAfter = useMissionStore.getState().missionState;
      expect(stateAfter.mission.elapsedHours).toBe(stateBefore.mission.elapsedHours);
      expect(stateAfter.habitatResources.oxygenInventoryKg).toBe(
        stateBefore.habitatResources.oxygenInventoryKg
      );
      unmount();
    });
  });
});
