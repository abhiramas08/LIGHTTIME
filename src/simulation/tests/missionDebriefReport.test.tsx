/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief and Learning Report Test Suite
 *
 * Verifies:
 * 1. Report is generated strictly from actual canonical MissionState.
 * 2. Evaluates mission success / failure and overall flight grade.
 * 3. Evaluates primary mission objectives (achieved vs missed).
 * 4. Summarizes crew wellbeing, sleep debt, exercise compliance, and readiness.
 * 5. Calculates accurate resource usage (O2, water, power, food) without fabrication.
 * 6. Audits equipment degradation and maintenance actions.
 * 7. Generates qualitative 5-pillar decision analysis from recorded action history.
 * 8. Visual telemetry chart data extraction.
 * 9. UI rendering, presentation mode navigation, and PDF export trigger.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { createInitialMissionState, tickSimulation } from '@/simulation/engine/core';
import { applyMissionCommand } from '@/simulation/commands/commandDispatcher';
import { generateMissionDebriefReport } from '@/simulation/engine/debriefEngine';
import { MissionState } from '@/simulation/models/missionState';
import { MissionDebriefView } from '@/features/debrief/MissionDebriefView';
import { useMissionStore } from '@/store/useMissionStore';

describe('LIGHTTIME Mission Debrief and Learning Report', () => {
  let sampleState: MissionState;

  beforeEach(() => {
    sampleState = createInitialMissionState();
    useMissionStore.setState({ missionState: sampleState });
  });

  // ==========================================================================
  // 1. Report Generation & Success Determination
  // ==========================================================================
  describe('1. Mission Overview & Success Determination', () => {
    it('generates a complete debrief report from canonical state with verified metadata', () => {
      const report = generateMissionDebriefReport(sampleState);

      expect(report.missionId).toBe(sampleState.mission.missionId);
      expect(report.missionName).toBe(sampleState.mission.missionName);
      expect(report.missionDurationDays).toBe(30);
      expect(report.outcome).toBeDefined();
      expect(report.outcome.overallScore).toBeGreaterThan(0);
      expect(report.outcome.grade).toMatch(/EXEMPLARY|PROFICIENT|MARGINAL|FAILED/);
      expect(report.outcome.debriefSummary.length).toBeGreaterThanOrEqual(4);
    });

    it('determines mission failure if mission was aborted or life-support collapsed', () => {
      // Induce critical abort condition
      sampleState.mission.missionStatus = 'ABORTED';
      sampleState.habitatResources.oxygenInventoryKg = 15.0; // lethal hypoxia

      const report = generateMissionDebriefReport(sampleState);

      expect(report.outcome.missionSuccess).toBe(false);
      expect(report.outcome.grade).toBe('FAILED');
    });

    it('awards EXEMPLARY or PROFICIENT grade for high-performing mission completions', () => {
      sampleState.mission.missionDay = 30;
      sampleState.mission.elapsedHours = 720.0;
      sampleState.mission.missionStatus = 'COMPLETED';
      sampleState.habitatResources.oxygenInventoryKg = 110.0;
      sampleState.habitatResources.batteryStorageKwh = 95.0;

      const report = generateMissionDebriefReport(sampleState);

      expect(report.outcome.missionSuccess).toBe(true);
      expect(['EXEMPLARY', 'PROFICIENT']).toContain(report.outcome.grade);
    });
  });

  // ==========================================================================
  // 2. Mission Objectives Evaluation (Achieved vs Missed)
  // ==========================================================================
  describe('2. Mission Objectives Evaluation', () => {
    it('evaluates primary objectives and separates achieved from missed', () => {
      const report = generateMissionDebriefReport(sampleState);

      expect(report.objectivesAchieved.length + report.objectivesMissed.length).toBeGreaterThanOrEqual(5);

      // Verify each objective has required canonical fields
      for (const obj of [...report.objectivesAchieved, ...report.objectivesMissed]) {
        expect(obj.id).toMatch(/^OBJ-\d+$/);
        expect(obj.title).toBeDefined();
        expect(obj.category).toBeDefined();
        expect(obj.targetCriteria).toBeDefined();
        expect(obj.actualResult).toBeDefined();
        expect(typeof obj.achieved).toBe('boolean');
        expect(obj.impactAssessment).toBeDefined();
      }
    });

    it('marks oxygen objective as missed when inventory drops below 40 kg survival limit', () => {
      sampleState.habitatResources.oxygenInventoryKg = 38.5; // Breached limit

      const report = generateMissionDebriefReport(sampleState);
      const o2Obj = report.objectivesMissed.find((o) => o.id === 'OBJ-02');

      expect(o2Obj).toBeDefined();
      expect(o2Obj?.achieved).toBe(false);
      expect(o2Obj?.actualResult).toContain('38.5 kg');
      expect(o2Obj?.impactAssessment).toContain('below 40.0 kg');
    });

    it('marks 30-day surface expedition objective as achieved when 30 Sols reached', () => {
      sampleState.mission.missionDay = 30;
      sampleState.mission.elapsedHours = 720.0;

      const report = generateMissionDebriefReport(sampleState);
      const solObj = report.objectivesAchieved.find((o) => o.id === 'OBJ-01');

      expect(solObj).toBeDefined();
      expect(solObj?.achieved).toBe(true);
      expect(solObj?.actualResult).toContain('30 of 30 Sols');
    });
  });

  // ==========================================================================
  // 3. Crew Wellbeing & Human Factors Summary
  // ==========================================================================
  describe('3. Crew Wellbeing Summary', () => {
    it('audits all 4 astronauts with individual sleep, exercise, and flight readiness ratings', () => {
      const report = generateMissionDebriefReport(sampleState);

      expect(report.crewWellbeingSummary).toHaveLength(4);

      for (const crew of report.crewWellbeingSummary) {
        expect(crew.astronautId).toBeDefined();
        expect(crew.name).toBeDefined();
        expect(crew.callsign).toBeDefined();
        expect(crew.role).toBeDefined();
        expect(crew.finalFatigueIndex).toBeGreaterThanOrEqual(0);
        expect(crew.finalStressIndex).toBeGreaterThanOrEqual(0);
        expect(crew.sleepHoursPerSol).toBeGreaterThanOrEqual(0);
        expect(crew.exerciseMinutesPerSol).toBeGreaterThanOrEqual(0);
        expect(['OPTIMAL', 'NOMINAL', 'DEGRADED', 'CRITICAL']).toContain(crew.readinessRating);
        expect(crew.medicalFlightNotes.length).toBeGreaterThan(10);
      }
    });

    it('rates astronaut readiness as CRITICAL when fatigue or stress exceeds 75%', () => {
      sampleState.crew[1]!.fatigueIndex = 82.0;
      sampleState.crew[1]!.stressIndex = 78.0;

      const report = generateMissionDebriefReport(sampleState);
      const degradedCrew = report.crewWellbeingSummary.find((c) => c.astronautId === sampleState.crew[1]!.astronautId);

      expect(degradedCrew?.readinessRating).toBe('CRITICAL');
      expect(degradedCrew?.finalFatigueIndex).toBe(82.0);
    });
  });

  // ==========================================================================
  // 4. Resource Usage Summary (Zero Fabrication)
  // ==========================================================================
  describe('4. Resource Usage Summary', () => {
    it('calculates consumable consumption strictly from state and historical snapshots', () => {
      // Simulate 5 hours of ticking
      sampleState = tickSimulation(sampleState, 5.0);

      const report = generateMissionDebriefReport(sampleState);
      const res = report.resourceUsageSummary;

      expect(res.consumedOxygenKg).toBeGreaterThanOrEqual(0);
      expect(res.finalOxygenKg).toBe(sampleState.habitatResources.oxygenInventoryKg);
      expect(res.finalWaterLiters).toBe(sampleState.habitatResources.waterInventoryLiters);
      expect(res.finalBatteryStorageKwh).toBe(sampleState.habitatResources.batteryStorageKwh);
      expect(res.finalFoodKcal).toBe(sampleState.habitatResources.foodInventoryKcal);
      expect(res.waterRecoveryEfficiencyPercent).toBe(sampleState.habitatResources.waterRecoveryRatePercent);
      expect(res.averageOxygenConsumptionKgPerHour).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // 5. Equipment Condition Audit
  // ==========================================================================
  describe('5. Equipment Machinery Integrity Audit', () => {
    it('audits wear delta and operating status across all installed habitat machinery', () => {
      const report = generateMissionDebriefReport(sampleState);

      expect(report.equipmentSummary.length).toBe(sampleState.equipment.length);

      for (const eq of report.equipmentSummary) {
        expect(eq.equipmentId).toBeDefined();
        expect(eq.name).toBeDefined();
        expect(eq.finalCondition).toBeGreaterThanOrEqual(0);
        expect(eq.wearDeltaPercent).toBeGreaterThanOrEqual(0);
        expect(typeof eq.maintenanceRequired).toBe('boolean');
      }
    });
  });

  // ==========================================================================
  // 6. Qualitative Decision Analysis (5 Pillars)
  // ==========================================================================
  describe('6. Qualitative Decision Analysis (5 Pillars)', () => {
    it('generates all 5 decision critique pillars derived from recorded mission events', () => {
      // Dispatch an emergency command
      const res = applyMissionCommand(sampleState, {
        subsystem: 'EMERGENCY',
        action: 'ISOLATE_O2_LEAK',
        initiatedBy: 'CREW',
      });
      sampleState = res.updatedState;

      const report = generateMissionDebriefReport(sampleState);
      const da = report.decisionAnalysis;

      expect(da.whatWentWell.length).toBeGreaterThanOrEqual(1);
      expect(da.whatCreatedRisk.length).toBeGreaterThanOrEqual(1);
      expect(da.decisionsImprovingOutcome.length).toBeGreaterThanOrEqual(1);
      expect(da.decisionsReducingResources.length).toBeGreaterThanOrEqual(1);
      expect(da.whatCouldBeDoneDifferently.length).toBeGreaterThanOrEqual(1);

      // Verify actual line isolation action was recognized in improving decisions
      expect(da.decisionsImprovingOutcome.some((d) => d.includes('MV-02') || d.includes('isolation'))).toBe(true);
      expect(da.decisionsReducingResources.some((d) => d.includes('purge') || d.includes('oxygen'))).toBe(true);
    });
  });

  // ==========================================================================
  // 7. Important Educational Lessons
  // ==========================================================================
  describe('7. Important Educational Lessons', () => {
    it('provides core educational principles on latency, ECLSS loops, and human factors', () => {
      const report = generateMissionDebriefReport(sampleState);

      expect(report.importantLessons.length).toBeGreaterThanOrEqual(4);
      expect(report.importantLessons.some((l) => l.includes('Speed-of-Light Latency'))).toBe(true);
      expect(report.importantLessons.some((l) => l.includes('Closed-Loop Systems'))).toBe(true);
      expect(report.importantLessons.some((l) => l.includes('Human Factors'))).toBe(true);
    });
  });

  // ==========================================================================
  // 8. User Interface Integration, Presentation Mode & PDF Export
  // ==========================================================================
  describe('8. UI Integration, Presentation Mode & PDF Export', () => {
    it('renders the complete debrief view with all sections', () => {
      render(
        <BrowserRouter>
          <MissionDebriefView />
        </BrowserRouter>
      );

      expect(screen.getByText(/EXECUTIVE MISSION DEBRIEF/i)).toBeInTheDocument();
      expect(screen.getByText(/MISSION OBJECTIVES EVALUATION/i)).toBeInTheDocument();
      expect(screen.getByText(/CREW PHYSIOLOGICAL & HUMAN FACTORS DEBRIEF/i)).toBeInTheDocument();
      expect(screen.getByText(/CLOSED-LOOP HABITAT RESOURCE CONSUMPTION SUMMARY/i)).toBeInTheDocument();
      expect(screen.getByText(/HABITAT SYSTEMS & MACHINERY INTEGRITY AUDIT/i)).toBeInTheDocument();
      expect(screen.getByText(/OPERATIONAL DECISION ANALYSIS & POST-FLIGHT CRITIQUE/i)).toBeInTheDocument();
      expect(screen.getByText(/EDUCATIONAL LESSONS & CLASSROOM TAKEAWAYS/i)).toBeInTheDocument();
    });

    it('toggles presentation mode and navigates slides', () => {
      render(
        <BrowserRouter>
          <MissionDebriefView />
        </BrowserRouter>
      );

      const presentationButton = screen.getByRole('button', { name: /PRESENTATION MODE/i });
      fireEvent.click(presentationButton);

      // Verify Presentation mode active
      expect(screen.getByText(/SLIDE 1 OF 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Executive Overview/i)).toBeInTheDocument();

      // Click Next Slide
      const nextButton = screen.getByRole('button', { name: /Next Slide/i });
      fireEvent.click(nextButton);

      expect(screen.getByText(/SLIDE 2 OF 8/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Mission Objectives/i).length).toBeGreaterThanOrEqual(1);
    });

    it('triggers window.print when Export PDF / Print button is clicked', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(
        <BrowserRouter>
          <MissionDebriefView />
        </BrowserRouter>
      );

      const printButton = screen.getByRole('button', { name: /EXPORT PDF \/ PRINT/i });
      fireEvent.click(printButton);

      expect(printSpy).toHaveBeenCalledTimes(1);
      printSpy.mockRestore();
    });
  });
});
