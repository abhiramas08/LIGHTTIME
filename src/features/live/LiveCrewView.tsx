/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Module 02: LIVE – Crew Management & Physiological Telemetry
 *
 * Provides real-time human-in-the-loop physiological telemetry, cognitive workload
 * tracking, activity scheduling, and flight assignment controls for all four
 * expedition astronauts.
 *
 * CRITICAL EDUCATIONAL COMPLIANCE:
 * - Scientific biometric measurements are strictly demarcated from educational human-factors indices.
 * - Educational indices (Fatigue, Stress, Workload, Nutrition) are heuristic pedagogical models
 *   and NEVER labeled as medical diagnostic measurements.
 * - All calculations are executed by the pure simulation engine, never in the UI.
 * - Ground flight assignments (Sleep, Exercise, Work, Rest, Nutrition) are validated and
 *   dispatched via the central Zustand mission store.
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { AstronautCard } from '@/components/mission/AstronautCard';
import { AstronautDetailModal } from '@/components/mission/AstronautDetailModal';
import { CrewWellbeingChart } from '@/components/mission/CrewWellbeingChart';
import { CrewAvailabilityGraph } from '@/components/mission/CrewAvailabilityGraph';
import { CrewActivitySchedule } from '@/components/mission/CrewActivitySchedule';
import { CrewHealthHistory } from '@/components/mission/CrewHealthHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import {
  Users,
  Brain,
  BookOpen,
  Calendar,
  Activity,
  Bed,
  Dumbbell,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const LiveCrewView: React.FC = () => {
  const { missionState } = useMissionStore();
  const crew = missionState.crew;

  // Selected astronaut for detail modal
  const [activeAstronautId, setActiveAstronautId] = useState<string | null>(null);

  // Active view tab for detailed telemetry
  const [activeTab, setActiveTab] = useState<'wellbeing' | 'schedule' | 'history' | 'availability'>('wellbeing');

  // Compute live physiological & cognitive alerts
  const criticalCrew = crew.filter(
    (c) =>
      c.availability === 'MEDICAL_RESTRICTED' ||
      c.fatigueIndex >= 70.0 ||
      c.stressIndex >= 70.0 ||
      c.biometrics.bloodOxygenPercent < 90.0
  );

  const warningCrew = crew.filter(
    (c) =>
      c.availability !== 'MEDICAL_RESTRICTED' &&
      (c.fatigueIndex >= 45.0 ||
        c.stressIndex >= 45.0 ||
        c.sleepHours < 6.0 ||
        c.exerciseMinutes < 20)
  );

  return (
    <PageContainer
      moduleCode="MOD-02"
      title="LIVE – Crew Management"
      description="Real-time human-in-the-loop physiological telemetry, cognitive workload modeling, and flight assignment console for all four expedition astronauts."
      actions={
        <div className="flex items-center gap-2">
          {criticalCrew.length > 0 ? (
            <Badge variant="critical" pulse>
              {criticalCrew.length} CREW UNDER ELEVATED STRAIN
            </Badge>
          ) : warningCrew.length > 0 ? (
            <Badge variant="warning">
              {warningCrew.length} CREW ADVISORIES ACTIVE
            </Badge>
          ) : (
            <Badge variant="nominal" pulse>
              4/4 CREW FIT FOR FLIGHT DUTY
            </Badge>
          )}
        </div>
      }
    >
      {/* Real-time Health Alerts */}
      {criticalCrew.length > 0 && (
        <Alert
          variant="critical"
          title="PHYSIOLOGICAL & COGNITIVE CONTINGENCY ADVISORY"
          className="font-mono text-xs"
        >
          <div className="space-y-1">
            <p>
              Critical human-factors strain detected on{' '}
              {criticalCrew.map((c) => `${c.callsign} (${c.name})`).join(', ')}.
              Immediate flight surgeon protocol recommended: mandate circadian sleep or schedule rest period.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              {criticalCrew.map((c) => (
                <span key={c.astronautId} className="px-2 py-0.5 bg-critical-red/20 border border-critical-red/50">
                  {c.callsign}: Fatigue {c.fatigueIndex}% · Stress {c.stressIndex}% · Status: {c.availability}
                </span>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {warningCrew.length > 0 && criticalCrew.length === 0 && (
        <Alert
          variant="warning"
          title="HUMAN RESEARCH PROGRAM (HRP) FATIGUE & EXERCISE ADVISORY"
          className="font-mono text-xs"
        >
          <p>
            Sub-optimal recovery metrics observed on {warningCrew.map((c) => c.callsign).join(', ')}.
            Review sleep quotas (target: 8.0h) and countermeasure exercise sessions (target: 45 min) to prevent compounding fatigue debt.
          </p>
        </Alert>
      )}

      {/* SECTION 1: Four Individual Astronaut Cards */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/40 pb-2">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
              <Users className="h-4 w-4 text-telemetry-cyan" />
              EXPEDITION COMPLEMENT · CREW DOSSIERS & ASSIGNMENT CONSOLES
            </h2>
            <p className="text-[11px] font-mono text-offwhite/50">
              Select an astronaut to review full biometric telemetry and assign flight duties, sleep, exercise, or rations.
            </p>
          </div>
          <span className="text-[11px] font-mono text-telemetry-cyan font-bold">
            4 OF 4 CREW MONITORED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {crew.map((astronaut) => (
            <AstronautCard
              key={astronaut.astronautId}
              astronaut={astronaut}
              onOpenDossier={(id) => setActiveAstronautId(id)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Analytics & Telemetry Deep-Dive Tabs */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-blue/40 pb-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('wellbeing')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'wellbeing'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Brain className="h-3.5 w-3.5 text-telemetry-cyan" />
              DAILY WELLBEING GRAPH
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'availability'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-nominal-green" />
              CREW AVAILABILITY GRAPH
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-warning-amber" />
              CREW ACTIVITY SCHEDULE
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-telemetry-cyan bg-panel-blue text-offwhite font-bold'
                  : 'border-panel-blue/40 bg-control-navy text-offwhite/60 hover:text-offwhite'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-offwhite" />
              CREW HEALTH HISTORY
            </button>
          </div>

          <span className="text-[10px] font-mono text-offwhite/40">
            SIMULATION MET: T+{missionState.mission.elapsedHours.toFixed(1)}h
          </span>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'wellbeing' && <CrewWellbeingChart />}
        {activeTab === 'availability' && <CrewAvailabilityGraph />}
        {activeTab === 'schedule' && <CrewActivitySchedule />}
        {activeTab === 'history' && <CrewHealthHistory />}
      </section>

      {/* SECTION 3: NASA Human Research Program (HRP) Evidence Reference */}
      <section className="space-y-3">
        <Card withBracket>
          <CardHeader>
            <CardTitle className="text-xs">
              <BookOpen className="h-4 w-4 text-telemetry-cyan" />
              SCIENTIFIC BACKGROUND: NASA HUMAN RESEARCH PROGRAM (HRP) EVIDENCE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Evidence 1: Sleep Loss & Circadian Desynchrony */}
              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-warning-amber font-bold text-xs">
                  <Bed className="h-3.5 w-3.5" />
                  Circadian Entrainment & Sleep Debt
                </div>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  NASA HRP Evidence Books cite sleep deprivation as a primary risk for cognitive impairment.
                  Astronauts require 8.0 hours of restorative sleep per sol. Chronic sleep debt (&lt;7.0h/sol)
                  causes compounding degradation in vigilance, working memory, and situational awareness.
                </p>
                <span className="text-[9px] text-offwhite/40 block">
                  Reference: NASA/TP-2016-218603 (Behavioral Health & Performance)
                </span>
              </div>

              {/* Evidence 2: Countermeasure Exercise */}
              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-nominal-green font-bold text-xs">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Countermeasure Exercise Protocol
                </div>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  Daily resistive and aerobic countermeasure exercise (minimum 45 minutes) on the T2 treadmill
                  and ARED prevents cardiovascular deconditioning and musculoskeletal mass loss in micro/partial
                  gravity, while serving as a primary stress-mitigation neurobiological countermeasure.
                </p>
                <span className="text-[9px] text-offwhite/40 block">
                  Reference: NASA Human Research Roadmap (Risk of Impaired Performance)
                </span>
              </div>

              {/* Evidence 3: Workload Management & Stress */}
              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-telemetry-cyan font-bold text-xs">
                  <Brain className="h-3.5 w-3.5" />
                  Workload Thresholds & Fatigue
                </div>
                <p className="text-[11px] text-offwhite/70 leading-relaxed">
                  Sustained task workload exceeding 60% of baseline cognitive capacity leads to exponential
                  cognitive exhaustion. Extravehicular Activity (EVA) imposes a 2.2× physiological workload
                  multiplier due to spacesuit pressurized joint torque and metabolic oxygen consumption.
                </p>
                <span className="text-[9px] text-offwhite/40 block">
                  Reference: NASA-STD-3001 Vol 1 & 2 (Crew Health & Human Factors)
                </span>
              </div>
            </div>

            {/* Crucial Pedagogical Disclaimer Banner */}
            <div className="p-2.5 bg-control-navy border border-warning-amber/40 flex items-start gap-2.5 text-[11px]">
              <Info className="h-4 w-4 text-warning-amber shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-warning-amber block uppercase tracking-wider text-[10px]">
                  EDUCATIONAL MODELING DISCLAIMER · NON-MEDICAL SPECIFICATION
                </span>
                <p className="text-offwhite/70 mt-0.5">
                  Educational human-factors indices (Fatigue Index, Stress Index, Workload Index, and Nutrition Score)
                  are heuristic pedagogical simulation models designed to illustrate aerospace human factors.
                  They are <strong className="text-offwhite">never labeled as medical measurements</strong>.
                  Objective biomedical sensors (Heart rate, Blood pressure, SpO₂, and Cumulative radiation dose)
                  are modeled and reported as distinct physical measurements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Individual Astronaut Dossier & Flight Assignment Modal */}
      {activeAstronautId && (
        <AstronautDetailModal
          astronautId={activeAstronautId}
          onClose={() => setActiveAstronautId(null)}
        />
      )}
    </PageContainer>
  );
};
