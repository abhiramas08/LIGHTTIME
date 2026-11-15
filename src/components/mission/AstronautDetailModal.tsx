/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Individual Astronaut Detail Page & Assignment Console
 *
 * Provides a comprehensive dossier view and flight assignment controls for:
 * - Sleep periods
 * - Exercise sessions
 * - Work tasks
 * - Rest periods
 * - Nutrition allocations
 *
 * Implements strict validation rules and delegates all calculations
 * to the pure simulation engine via executeMissionCommand.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { AstronautRecord } from '@/simulation/models/missionState';
import { AstronautAvatar } from './AstronautAvatar';
import { Dialog } from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import {
  Heart,
  Brain,
  Activity,
  Bed,
  Dumbbell,
  Briefcase,
  Coffee,
  Utensils,
  Info,
  Send,
} from 'lucide-react';

export interface AstronautDetailModalProps {
  astronautId: string | null;
  onClose: () => void;
}

export const AstronautDetailModal: React.FC<AstronautDetailModalProps> = ({
  astronautId,
  onClose,
}) => {
  const { missionState, executeMissionCommand } = useMissionStore();

  const astronaut: AstronautRecord | undefined = missionState.crew.find(
    (c) => c.astronautId === astronautId
  );

  // Active assignment tab
  const [assignmentTab, setAssignmentTab] = useState<'sleep' | 'exercise' | 'work' | 'rest' | 'nutrition'>('sleep');

  // Form states for assignments
  const [sleepHours, setSleepHours] = useState<number>(8.0);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(45);
  const [countermeasureType, setCountermeasureType] = useState<string>('T2_TREADMILL');
  const [workTask, setWorkTask] = useState<string>('TASK-HAB-SYSTEMS-CHECK');
  const [workloadIntensity, setWorkloadIntensity] = useState<number>(55);
  const [restHours, setRestHours] = useState<number>(2.0);
  const [nutritionCalories, setNutritionCalories] = useState<number>(1000);
  const [mealType, setMealType] = useState<string>('STANDARD_RATION');

  // Feedback states
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!astronaut) return null;

  // Real-time Flight Rule Validation
  const validateAssignment = (type: typeof assignmentTab): { valid: boolean; reason?: string } => {
    if (astronaut.availability === 'MEDICAL_RESTRICTED' && type === 'work') {
      return { valid: false, reason: 'Astronaut is under medical duty restriction. Heavy work tasks prohibited.' };
    }
    if (astronaut.availability === 'ON_EVA' && (type === 'sleep' || type === 'rest')) {
      return { valid: false, reason: 'Cannot assign sleep or rest while on surface EVA. Must ingress airlock first.' };
    }
    if (astronaut.availability === 'SLEEPING' && type === 'work') {
      return { valid: false, reason: 'Astronaut is currently sleeping. Wake astronaut or assign rest before assigning tasks.' };
    }
    if (astronaut.fatigueIndex > 85.0 && type === 'exercise') {
      return { valid: false, reason: 'Elevated fatigue (> 85%). Cardiovascular exercise poses physiological strain risk.' };
    }
    if (type === 'nutrition' && missionState.habitatResources.foodInventoryKcal < nutritionCalories) {
      return { valid: false, reason: `Insufficient habitat caloric reserves (${missionState.habitatResources.foodInventoryKcal.toFixed(0)} kcal remaining).` };
    }
    return { valid: true };
  };

  const handleDispatchAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAssignment(assignmentTab);
    if (!validation.valid) {
      setFeedback({ success: false, message: validation.reason ?? 'Flight rule constraint violated.' });
      return;
    }

    let actionName = 'MANDATE_REST';
    let params: Record<string, unknown> = {};

    switch (assignmentTab) {
      case 'sleep':
        actionName = 'ASSIGN_SLEEP';
        params = { sleepHours };
        break;
      case 'exercise':
        actionName = 'ASSIGN_EXERCISE';
        params = { exerciseMinutes, countermeasureType };
        break;
      case 'work':
        actionName = 'ASSIGN_WORK_TASK';
        params = { taskId: workTask, workloadIntensity };
        break;
      case 'rest':
        actionName = 'ASSIGN_REST';
        params = { restHours };
        break;
      case 'nutrition':
        actionName = 'ALLOCATE_NUTRITION';
        params = { caloriesKcal: nutritionCalories, mealType };
        break;
    }

    const result = executeMissionCommand({
      subsystem: 'CREW_SCHEDULE',
      action: actionName,
      parameters: params,
      targetAstronautId: astronaut.astronautId,
      initiatedBy: 'GROUND',
    });

    setFeedback({ success: result.success, message: result.message });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <Dialog
      open={!!astronautId}
      onOpenChange={(open) => !open && onClose()}
      title={`ASTRONAUT DOSSIER & SCHEDULE MANAGER · ${astronaut.callsign}`}
      description={`${astronaut.name} · ${astronaut.role} · ID: ${astronaut.astronautId}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] font-mono text-offwhite/50">
            NASA HUMAN RESEARCH PROGRAM (HRP) BIO-ANALYTIC TELEMETRY
          </span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            CLOSE DOSSIER
          </Button>
        </div>
      }
    >
      <div className="space-y-5 font-mono text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Card with Avatar & Status */}
        <div className="p-4 bg-control-navy border border-panel-blue/70 flex flex-col sm:flex-row items-center gap-4">
          <AstronautAvatar
            role={astronaut.role}
            callsign={astronaut.callsign}
            availability={astronaut.availability}
            size="xl"
          />

          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-base font-bold text-offwhite">{astronaut.name}</span>
              <Badge variant="telemetry">{astronaut.callsign}</Badge>
              <Badge
                variant={
                  astronaut.availability === 'AVAILABLE'
                    ? 'nominal'
                    : astronaut.availability === 'ON_EVA'
                    ? 'telemetry'
                    : astronaut.availability === 'RESTING' || astronaut.availability === 'SLEEPING'
                    ? 'neutral'
                    : 'critical'
                }
                pulse={astronaut.availability === 'ON_EVA'}
              >
                STATUS: {astronaut.availability}
              </Badge>
            </div>
            <div className="text-xs text-offwhite/70">{astronaut.role} · Expedition 30 Surface Complement</div>
            <div className="text-[10px] text-telemetry-cyan flex flex-wrap gap-2 justify-center sm:justify-start">
              <span>Sleep/Sol: <strong>{astronaut.sleepHours.toFixed(1)} hrs</strong></span>
              <span>•</span>
              <span>Exercise: <strong>{astronaut.exerciseMinutes} mins</strong></span>
              <span>•</span>
              <span>Cum. Rad: <strong>{astronaut.biometrics.cumulativeRadiationDoseMsv.toFixed(2)} mSv</strong></span>
            </div>
          </div>
        </div>

        {/* Scientific Measurements vs. Educational Indices Notice */}
        <div className="p-2.5 bg-space-surface border-l-2 border-telemetry-cyan text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-telemetry-cyan">
            <Info className="h-3.5 w-3.5" />
            <span>MEASUREMENT SPECIFICATION DISCLAIMER</span>
          </div>
          <p className="text-offwhite/70 leading-relaxed text-[10px]">
            Biometric readouts (Heart Rate, Blood Pressure, SpO₂, Radiation) represent calibrated physical
            measurements. Cognitive Fatigue, Stress, and Workload are synthetic educational indices computed
            by the human-factors simulation solver to pedagogical standards, and must never be interpreted
            as clinical diagnostic measurements.
          </p>
        </div>

        {/* Two-Column Grid: Scientific Measurements vs Educational Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Scientific Medical Measurements */}
          <div className="p-3 bg-control-navy/80 border border-panel-blue/60 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/40 pb-1.5">
              <span className="font-bold text-offwhite text-xs flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-critical-red" />
                SCIENTIFIC BIOMETRIC TELEMETRY
              </span>
              <span className="text-[9px] text-offwhite/50 uppercase">PHYSICAL MEASUREMENTS</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Heart Rate:</span>
                <span className="font-bold text-offwhite">{astronaut.biometrics.heartRateBpm} BPM (Nominal: 60-90)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Blood Pressure:</span>
                <span className="font-bold text-offwhite">
                  {astronaut.biometrics.bloodPressureSystolicMmHg} / {astronaut.biometrics.bloodPressureDiastolicMmHg} mmHg
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Blood Oxygen (SpO₂):</span>
                <span className={`font-bold ${astronaut.biometrics.bloodOxygenPercent >= 95 ? 'text-nominal-green' : 'text-critical-red'}`}>
                  {astronaut.biometrics.bloodOxygenPercent}% (Target: &gt; 95%)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Respiration Rate:</span>
                <span className="font-bold text-offwhite">{astronaut.biometrics.respirationRateBpm} breaths/min</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Core Temperature:</span>
                <span className="font-bold text-offwhite">{astronaut.biometrics.coreTemperatureCelsius.toFixed(1)} °C</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-offwhite/60">Cumulative Radiation Dose:</span>
                <span className="font-bold text-warning-amber">
                  {astronaut.biometrics.cumulativeRadiationDoseMsv.toFixed(2)} mSv (Max: 250 mSv)
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Educational Human-Factors Indices */}
          <div className="p-3 bg-control-navy/80 border border-panel-blue/60 space-y-2">
            <div className="flex items-center justify-between border-b border-panel-blue/40 pb-1.5">
              <span className="font-bold text-offwhite text-xs flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-telemetry-cyan" />
                EDUCATIONAL HUMAN-FACTORS INDICES
              </span>
              <span className="text-[9px] text-telemetry-cyan uppercase">SIMULATED SCORES [0-100]</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Cognitive Fatigue Index:</span>
                <span className={`font-bold ${astronaut.fatigueIndex > 70 ? 'text-critical-red' : astronaut.fatigueIndex > 40 ? 'text-warning-amber' : 'text-nominal-green'}`}>
                  {astronaut.fatigueIndex.toFixed(1)} / 100 {astronaut.fatigueIndex > 70 ? '(EXHAUSTED)' : '(RESTED)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Psychological Stress Index:</span>
                <span className={`font-bold ${astronaut.stressIndex > 70 ? 'text-critical-red' : 'text-offwhite'}`}>
                  {astronaut.stressIndex.toFixed(1)} / 100
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Workload Index:</span>
                <span className="font-bold text-telemetry-cyan">
                  {astronaut.workloadIndex.toFixed(1)} / 100
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Nutrition Adequacy Score:</span>
                <span className="font-bold text-offwhite">{astronaut.nutritionScore.toFixed(1)} / 100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/20">
                <span className="text-offwhite/60">Sleep Acquired Today:</span>
                <span className="font-bold text-offwhite">{astronaut.sleepHours.toFixed(1)} hours (Req: 7-8h)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-offwhite/60">Countermeasure Exercise:</span>
                <span className="font-bold text-nominal-green">{astronaut.exerciseMinutes} min (Req: 45m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Task Queue */}
        <div className="p-3 bg-space-surface border border-panel-blue/50 space-y-2">
          <span className="font-bold text-offwhite text-xs flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-telemetry-cyan" />
            ASSIGNED FLIGHT TASKS ({astronaut.assignedTasks.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {astronaut.assignedTasks.map((t, idx) => (
              <span key={idx} className="px-2 py-1 bg-control-navy border border-panel-blue/60 text-[10px] text-telemetry-cyan">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Flight Controller Assignment Console */}
        <div className="p-4 bg-control-navy border border-telemetry-cyan/60 space-y-4">
          <div className="flex items-center justify-between border-b border-panel-blue/60 pb-2">
            <span className="font-heading font-bold text-xs text-offwhite uppercase flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-telemetry-cyan" />
              FLIGHT CONTROLLER PROTOCOL ASSIGNMENT CONSOLE
            </span>
            <span className="text-[10px] text-offwhite/50">DIRECTIVE AUTHORITY: GROUND / CDR</span>
          </div>

          {/* Assignment Protocol Tabs */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setAssignmentTab('sleep')}
              className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 ${
                assignmentTab === 'sleep'
                  ? 'bg-telemetry-cyan text-space-deep font-bold border-telemetry-cyan'
                  : 'bg-space-surface text-offwhite/70 border-panel-blue hover:text-offwhite'
              }`}
            >
              <Bed className="h-3.5 w-3.5" />
              <span>SLEEP PERIOD</span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentTab('exercise')}
              className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 ${
                assignmentTab === 'exercise'
                  ? 'bg-telemetry-cyan text-space-deep font-bold border-telemetry-cyan'
                  : 'bg-space-surface text-offwhite/70 border-panel-blue hover:text-offwhite'
              }`}
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span>EXERCISE SESSION</span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentTab('work')}
              className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 ${
                assignmentTab === 'work'
                  ? 'bg-telemetry-cyan text-space-deep font-bold border-telemetry-cyan'
                  : 'bg-space-surface text-offwhite/70 border-panel-blue hover:text-offwhite'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>WORK TASK</span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentTab('rest')}
              className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 ${
                assignmentTab === 'rest'
                  ? 'bg-telemetry-cyan text-space-deep font-bold border-telemetry-cyan'
                  : 'bg-space-surface text-offwhite/70 border-panel-blue hover:text-offwhite'
              }`}
            >
              <Coffee className="h-3.5 w-3.5" />
              <span>REST PERIOD</span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentTab('nutrition')}
              className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 ${
                assignmentTab === 'nutrition'
                  ? 'bg-telemetry-cyan text-space-deep font-bold border-telemetry-cyan'
                  : 'bg-space-surface text-offwhite/70 border-panel-blue hover:text-offwhite'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>NUTRITION ALLOCATION</span>
            </button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <Alert variant={feedback.success ? 'nominal' : 'warning'} title={feedback.success ? 'DIRECTIVE CONFIRMED' : 'FLIGHT RULE RESTRICTION'}>
              {feedback.message}
            </Alert>
          )}

          {/* Assignment Tab Panels */}
          <form onSubmit={handleDispatchAssignment} className="space-y-4 pt-1">
            {/* Panel 1: Sleep Assignment */}
            {assignmentTab === 'sleep' && (
              <div className="space-y-3 p-3 bg-space-surface border border-panel-blue/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">MANDATE CIRCADIAN SLEEP PROTOCOL</span>
                  <span className="text-[10px] text-offwhite/50">NASA Target: 8.0 hrs/sol</span>
                </div>
                <div>
                  <label className="block text-offwhite/60 mb-1">Assigned Sleep Duration (Hours):</label>
                  <select
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                  >
                    <option value={6.0}>6.0 Hours (Restricted Night)</option>
                    <option value={7.5}>7.5 Hours (Nominal Circadian Block)</option>
                    <option value={8.0}>8.0 Hours (Optimal Sleep Period)</option>
                    <option value={10.0}>10.0 Hours (Extended Restorative Recovery)</option>
                  </select>
                </div>
                <p className="text-[11px] text-offwhite/60">
                  During sleep, cognitive fatigue recovers by ~3.5 pts/hr and heart rate drops to nocturnal baselines. Workload is set to 0.
                </p>
              </div>
            )}

            {/* Panel 2: Exercise Session */}
            {assignmentTab === 'exercise' && (
              <div className="space-y-3 p-3 bg-space-surface border border-panel-blue/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">SCHEDULE COUNTERMEASURE EXERCISE</span>
                  <span className="text-[10px] text-offwhite/50">Mitigate Microgravity Deconditioning</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-offwhite/60 mb-1">Countermeasure Protocol:</label>
                    <select
                      value={countermeasureType}
                      onChange={(e) => setCountermeasureType(e.target.value)}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value="T2_TREADMILL">T2 Treadmill (Cardiovascular + Vibration Isolation)</option>
                      <option value="ARED_RESISTIVE">ARED Advanced Resistive Exercise (Bone/Muscle)</option>
                      <option value="CYCLE_ERGOMETER">Cycle Ergometer (Aerobic Capacity)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-offwhite/60 mb-1">Duration (Minutes):</label>
                    <select
                      value={exerciseMinutes}
                      onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value={30}>30 Minutes (Maintenance Session)</option>
                      <option value={45}>45 Minutes (Nominal Daily Prescription)</option>
                      <option value={60}>60 Minutes (Intensive Resistive Block)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-offwhite/60">
                  Exercise sessions reduce stress index by 8-15 points and maintain cardiovascular conditioning. Cannot assign if fatigue &gt; 85%.
                </p>
              </div>
            )}

            {/* Panel 3: Work Tasks */}
            {assignmentTab === 'work' && (
              <div className="space-y-3 p-3 bg-space-surface border border-panel-blue/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">DISPATCH EXPEDITION WORK TASK</span>
                  <span className="text-[10px] text-offwhite/50">Surface Operations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-offwhite/60 mb-1">Assigned Mission Task:</label>
                    <select
                      value={workTask}
                      onChange={(e) => setWorkTask(e.target.value)}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value="TASK-HAB-SYSTEMS-CHECK">TASK-HAB-SYSTEMS-CHECK (ECLSS & Power Inspection)</option>
                      <option value="TASK-CDRA-DESICCANT-MAINT">TASK-CDRA-DESICCANT-MAINT (CO₂ Scrubber Service)</option>
                      <option value="TASK-PSR-VOLATILE-DRILL">TASK-PSR-VOLATILE-DRILL (Ice Core Extraction)</option>
                      <option value="TASK-SURFACE-ROVER-SORTIE">TASK-SURFACE-ROVER-SORTIE (Geological Rover EVA)</option>
                      <option value="TASK-LAB-SCIENCE-ASSAY">TASK-LAB-SCIENCE-ASSAY (Spectrometer Gas Assay)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-offwhite/60 mb-1">Workload Intensity (%):</label>
                    <select
                      value={workloadIntensity}
                      onChange={(e) => setWorkloadIntensity(Number(e.target.value))}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value={35}>35% (Light Supervisory Task)</option>
                      <option value={55}>55% (Nominal Operational Load)</option>
                      <option value={80}>80% (High Physical/Cognitive Strain)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-offwhite/60">
                  Assigning a task updates the astronaut's active workload index. Workload &gt; 60% accelerates fatigue accumulation.
                </p>
              </div>
            )}

            {/* Panel 4: Rest Period */}
            {assignmentTab === 'rest' && (
              <div className="space-y-3 p-3 bg-space-surface border border-panel-blue/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">MANDATE DOWNTIME / COGNITIVE REST</span>
                  <span className="text-[10px] text-offwhite/50">Stress Mitigation</span>
                </div>
                <div>
                  <label className="block text-offwhite/60 mb-1">Rest Period Duration (Hours):</label>
                  <select
                    value={restHours}
                    onChange={(e) => setRestHours(Number(e.target.value))}
                    className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                  >
                    <option value={1.0}>1.0 Hour (Cognitive Decompression)</option>
                    <option value={2.0}>2.0 Hours (Scheduled Mid-Sol Rest)</option>
                    <option value={4.0}>4.0 Hours (Extended Downtime)</option>
                  </select>
                </div>
                <p className="text-[11px] text-offwhite/60">
                  Scheduled rest reduces workload to 10%, drops stress index by ~3 pts/hr, and stabilizes heart rate.
                </p>
              </div>
            )}

            {/* Panel 5: Nutrition Allocation */}
            {assignmentTab === 'nutrition' && (
              <div className="space-y-3 p-3 bg-space-surface border border-panel-blue/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">ALLOCATE METABOLIC RATIONS</span>
                  <span className="text-[10px] text-offwhite/50">
                    Remaining Store: {missionState.habitatResources.foodInventoryKcal.toFixed(0)} kcal
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-offwhite/60 mb-1">Meal / Ration Type:</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value="STANDARD_RATION">Standard Expedition Ration (Balanced Macro)</option>
                      <option value="HIGH_ENERGY_SORTIE">High-Energy EVA Sortie Pack (Calorie Dense)</option>
                      <option value="ELECTROLYTE_HYDRATION">Electrolyte Hydration Boost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-offwhite/60 mb-1">Caloric Value (kcal):</label>
                    <select
                      value={nutritionCalories}
                      onChange={(e) => setNutritionCalories(Number(e.target.value))}
                      className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value={750}>750 kcal (Light Supplemental Snack)</option>
                      <option value={1000}>1,000 kcal (Nominal Meal Ration)</option>
                      <option value={1500}>1,500 kcal (High-Metabolic Recovery Meal)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-offwhite/60">
                  Allocating calories from habitat food stores maintains nutrition adequacy score above 90% and mitigates physiological fatigue.
                </p>
              </div>
            )}

            {/* Transmit Command Button */}
            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                TRANSMIT PROTOCOL DIRECTIVE
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
