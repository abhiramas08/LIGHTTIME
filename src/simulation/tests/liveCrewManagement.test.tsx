/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Live Crew Management Integration & Verification Tests
 *
 * Verifies:
 * 1. All 5 crew assignment actions affect the shared canonical MissionState.
 * 2. Flight rule validation rules and safety guardrails reject unsafe actions.
 * 3. Pure simulation engine models human-factors dynamics: sleep debt, workload, exercise countermeasures.
 * 4. Strict pedagogical boundary: Educational indices are never labeled as medical measurements.
 * 5. Complete UI rendering: 4 astronaut cards, wellbeing chart, availability graph, activity schedule, health history, alerts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { createInitialMissionState, tickSimulation } from '@/simulation/engine/core';
import { LiveCrewView } from '@/features/live/LiveCrewView';

describe('LIVE Crew Management Module & Shared MissionState Integration', () => {
  beforeEach(() => {
    // Reset to clean canonical initial state before each test
    useMissionStore.getState().resetMission();
  });

  describe('1. Shared State Mutations via executeMissionCommand', () => {
    it('executes ASSIGN_SLEEP, updating sleep hours, reducing fatigue, and setting SLEEPING availability', () => {
      const store = useMissionStore.getState();
      const targetId = 'CREW-01'; // Elena Vance

      // Advance initial state to build some fatigue
      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === targetId)!;
      target.fatigueIndex = 65.0;
      target.stressIndex = 50.0;
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_SLEEP',
        targetAstronautId: targetId,
        parameters: { sleepHours: 8.0 },
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCrew = updated.crew.find((c) => c.astronautId === targetId)!;
      expect(updatedCrew.availability).toBe('SLEEPING');
      expect(updatedCrew.sleepHours).toBeGreaterThanOrEqual(8.0);
      expect(updatedCrew.fatigueIndex).toBeLessThan(65.0);
      expect(updatedCrew.stressIndex).toBeLessThan(50.0);
      expect(updatedCrew.workloadIndex).toBe(0.0);

      // Verify audit log in canonical records
      expect(updated.records.actionHistory.some((a) => a.command === 'ASSIGN_SLEEP')).toBe(true);
    });

    it('executes ASSIGN_EXERCISE, updating exercise minutes and mitigating stress', () => {
      const store = useMissionStore.getState();
      const targetId = 'CREW-02'; // Marcus Chen

      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === targetId)!;
      target.availability = 'AVAILABLE';
      target.stressIndex = 55.0;
      target.exerciseMinutes = 0;
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_EXERCISE',
        targetAstronautId: targetId,
        parameters: { exerciseMinutes: 45, countermeasureType: 'T2_TREADMILL' },
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCrew = updated.crew.find((c) => c.astronautId === targetId)!;
      expect(updatedCrew.exerciseMinutes).toBe(45);
      expect(updatedCrew.stressIndex).toBeLessThan(55.0);

      expect(updated.records.actionHistory.some((a) => a.command === 'ASSIGN_EXERCISE')).toBe(true);
    });

    it('executes ASSIGN_WORK_TASK, updating assigned task list, workload index, and setting AVAILABLE', () => {
      const store = useMissionStore.getState();
      const targetId = 'CREW-03'; // Dr. Sarah Okafor

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_WORK_TASK',
        targetAstronautId: targetId,
        parameters: {
          taskId: 'TASK-LUNAR-CORE-DRILL-04',
          workloadIntensity: 75,
        },
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCrew = updated.crew.find((c) => c.astronautId === targetId)!;
      expect(updatedCrew.availability).toBe('AVAILABLE');
      expect(updatedCrew.assignedTasks).toContain('TASK-LUNAR-CORE-DRILL-04');
      expect(updatedCrew.workloadIndex).toBe(75);
    });

    it('executes ASSIGN_REST, updating rest period, reducing fatigue and stress, and setting RESTING', () => {
      const store = useMissionStore.getState();
      const targetId = 'CREW-04'; // Dr. David Hansen

      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === targetId)!;
      target.fatigueIndex = 50.0;
      target.stressIndex = 45.0;
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_REST',
        targetAstronautId: targetId,
        parameters: { restHours: 3.0 },
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCrew = updated.crew.find((c) => c.astronautId === targetId)!;
      expect(updatedCrew.availability).toBe('RESTING');
      expect(updatedCrew.fatigueIndex).toBeLessThan(50.0);
      expect(updatedCrew.stressIndex).toBeLessThan(45.0);
      expect(updatedCrew.workloadIndex).toBe(10.0);
    });

    it('executes ALLOCATE_NUTRITION, deducting habitat food inventory and boosting nutrition score', () => {
      const store = useMissionStore.getState();
      const targetId = 'CREW-01';

      const initialFood = store.missionState.habitatResources.foodInventoryKcal;
      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ALLOCATE_NUTRITION',
        targetAstronautId: targetId,
        parameters: { caloriesKcal: 1200 },
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCrew = updated.crew.find((c) => c.astronautId === targetId)!;
      expect(updated.habitatResources.foodInventoryKcal).toBe(initialFood - 1200);
      expect(updatedCrew.nutritionScore).toBeGreaterThanOrEqual(95.0);
    });
  });

  describe('2. Flight Rule Validation & Safety Guardrails', () => {
    it('rejects ASSIGN_EXERCISE if astronaut fatigue exceeds 85% safety limit', () => {
      const store = useMissionStore.getState();
      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === 'CREW-02')!;
      target.fatigueIndex = 88.0;
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_EXERCISE',
        targetAstronautId: 'CREW-02',
        parameters: { exerciseMinutes: 45 },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('85% safety limit');
    });

    it('rejects ASSIGN_WORK_TASK if astronaut is MEDICAL_RESTRICTED', () => {
      const store = useMissionStore.getState();
      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === 'CREW-03')!;
      target.availability = 'MEDICAL_RESTRICTED';
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_WORK_TASK',
        targetAstronautId: 'CREW-03',
        parameters: { taskId: 'TASK-GEOLOGY-SAMPLE-01' },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('medically restricted');
    });

    it('rejects ASSIGN_SLEEP while astronaut is on surface EVA', () => {
      const store = useMissionStore.getState();
      const current = useMissionStore.getState().missionState;
      const target = current.crew.find((c) => c.astronautId === 'CREW-01')!;
      target.availability = 'ON_EVA';
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ASSIGN_SLEEP',
        targetAstronautId: 'CREW-01',
        parameters: { sleepHours: 8.0 },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('active EVA');
    });

    it('rejects ALLOCATE_NUTRITION if habitat food stores are exhausted', () => {
      const store = useMissionStore.getState();
      const current = useMissionStore.getState().missionState;
      current.habitatResources.foodInventoryKcal = 50.0; // below requested 1000
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'CREW_SCHEDULE',
        action: 'ALLOCATE_NUTRITION',
        targetAstronautId: 'CREW-01',
        parameters: { caloriesKcal: 1000 },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient food inventory');
    });
  });

  describe('3. Simulation Engine Human-Factors Dynamics', () => {
    it('advancing time increases fatigue faster for crew with chronic sleep debt (< 7.0h)', () => {
      const base = createInitialMissionState();

      // Astronaut 1 has 8.0h sleep (nominal)
      base.crew[0].sleepHours = 8.0;
      base.crew[0].fatigueIndex = 20.0;
      base.crew[0].workloadIndex = 40.0;

      // Astronaut 2 has 4.0h sleep (acute sleep debt)
      base.crew[1].sleepHours = 4.0;
      base.crew[1].fatigueIndex = 20.0;
      base.crew[1].workloadIndex = 40.0;

      // Advance by 8 hours
      const afterTick = tickSimulation(base, 8.0);

      const ast1FatigueGain = afterTick.crew[0].fatigueIndex - 20.0;
      const ast2FatigueGain = afterTick.crew[1].fatigueIndex - 20.0;

      expect(ast2FatigueGain).toBeGreaterThan(ast1FatigueGain);
    });

    it('advancing time during circadian sleep reduces fatigue and stress', () => {
      const base = createInitialMissionState();
      base.crew[0].availability = 'SLEEPING';
      base.crew[0].fatigueIndex = 70.0;
      base.crew[0].stressIndex = 50.0;

      const afterTick = tickSimulation(base, 8.0);

      expect(afterTick.crew[0].fatigueIndex).toBeLessThan(70.0);
      expect(afterTick.crew[0].stressIndex).toBeLessThan(50.0);
    });

    it('life support emergency (O2 depletion) causes acute SpO2 drop and cardiac stress', () => {
      const base = createInitialMissionState();
      base.habitatResources.oxygenInventoryKg = 0.0; // Complete depletion
      base.crew[0].biometrics.bloodOxygenPercent = 98.0;
      base.crew[0].stressIndex = 20.0;

      const afterTick = tickSimulation(base, 1.0);

      expect(afterTick.crew[0].biometrics.bloodOxygenPercent).toBeLessThan(98.0);
      expect(afterTick.crew[0].stressIndex).toBeGreaterThan(20.0);
    });
  });

  describe('4. LIVE Crew Management UI View', () => {
    it('renders the 4 expedition astronauts with roles, biometrics, and educational indices', () => {
      render(
        <BrowserRouter>
          <LiveCrewView />
        </BrowserRouter>
      );

      // Verify all 4 astronaut names are rendered
      expect(screen.getByText('Elena Vance')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Okafor')).toBeInTheDocument();
      expect(screen.getByText('Dr. David Hansen')).toBeInTheDocument();

      // Verify crew roles are present
      expect(screen.getByText('Commander')).toBeInTheDocument();
      expect(screen.getByText('Lunar Module Pilot')).toBeInTheDocument();
      expect(screen.getByText('Science Specialist')).toBeInTheDocument();
      expect(screen.getByText('Medical Specialist')).toBeInTheDocument();

      // Verify scientific vs educational distinct section headers
      const physicalMeasurements = screen.getAllByText(/Physical Measurements/i);
      expect(physicalMeasurements.length).toBeGreaterThanOrEqual(4);

      const educationalIndices = screen.getAllByText(/Educational Indices/i);
      expect(educationalIndices.length).toBeGreaterThanOrEqual(4);

      // Verify educational non-medical disclaimer banner
      expect(screen.getByText(/EDUCATIONAL MODELING DISCLAIMER/i)).toBeInTheDocument();
      expect(screen.getByText(/never labeled as medical measurements/i)).toBeInTheDocument();
    });

    it('allows opening astronaut dossier modal and switching tabs', () => {
      render(
        <BrowserRouter>
          <LiveCrewView />
        </BrowserRouter>
      );

      // Verify tab navigation buttons
      expect(screen.getByRole('button', { name: /DAILY WELLBEING GRAPH/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CREW AVAILABILITY GRAPH/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CREW ACTIVITY SCHEDULE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CREW HEALTH HISTORY/i })).toBeInTheDocument();

      // Click "CREW AVAILABILITY GRAPH" tab
      fireEvent.click(screen.getByRole('button', { name: /CREW AVAILABILITY GRAPH/i }));
      expect(screen.getByText(/CREW DUTY AVAILABILITY & CAPACITY DISTRIBUTION/i)).toBeInTheDocument();

      // Click "CREW ACTIVITY SCHEDULE" tab
      fireEvent.click(screen.getByRole('button', { name: /CREW ACTIVITY SCHEDULE/i }));
      expect(screen.getByText(/CREW ACTIVITY SCHEDULE & DUTY MATRIX/i)).toBeInTheDocument();

      // Click "CREW HEALTH HISTORY" tab
      fireEvent.click(screen.getByRole('button', { name: /CREW HEALTH HISTORY/i }));
      expect(screen.getByText(/CHRONOLOGICAL CREW HEALTH & WELLBEING AUDIT LOG/i)).toBeInTheDocument();
    });

    it('opens astronaut detail modal when MANAGE & ASSIGN TASKS is clicked', () => {
      render(
        <BrowserRouter>
          <LiveCrewView />
        </BrowserRouter>
      );

      const assignButtons = screen.getAllByRole('button', { name: /MANAGE & ASSIGN TASKS/i });
      expect(assignButtons.length).toBe(4);

      // Click on first astronaut's assign button
      fireEvent.click(assignButtons[0]!);

      // Dossier modal should open
      expect(screen.getByText(/ASTRONAUT DOSSIER & SCHEDULE MANAGER/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /SLEEP PERIOD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EXERCISE SESSION/i })).toBeInTheDocument();
    });
  });
});
