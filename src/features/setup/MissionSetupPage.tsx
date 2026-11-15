/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Setup and Pre-Launch Briefing
 *
 * Provides a comprehensive pre-flight briefing interface where student commanders:
 * 1. Choose a validated mission name & flight director callsign
 * 2. Select initial mission scenario (Standard vs Contingency injection)
 * 3. Review 4 certified astronauts and their operational roles
 * 4. Review initial ECLSS consumable resource levels & habitat machinery
 * 5. Review the lunar polar environment (Shackleton Rim, diurnal cycle, dust)
 * 6. Review 30-day mission objectives & mathematical simulation assumptions
 * 7. Review mission safety flight rules and crew autonomy boundaries
 * 8. Execute validated Launch Mission confirmation at Day 01, Hour 00 with duplicate protection
 * 9. Reset configuration with confirmation flow
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { hasStoredMission } from '@/store/persistence';
import { MISSION_SCENARIOS, MissionScenarioDefinition } from '@/data/scenarios/missionScenarios';
import {
  missionSetupSchema,
  MissionSetupFormData,
  DEFAULT_SETUP_FORM,
} from './setupValidation';
import { MissionInsignia } from '@/components/common/MissionInsignia';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Dialog } from '@/components/common/Dialog';
import { Alert } from '@/components/common/Alert';
import {
  ArrowLeft,
  Rocket,
  Users,
  Box,
  Compass,
  ShieldCheck,
  RotateCcw,
  Heart,
  Brain,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const MissionSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { initializeNewMission, missionState } = useMissionStore();

  // Form State
  const [formData, setFormData] = useState<MissionSetupFormData>(DEFAULT_SETUP_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | 'CREW' | 'RESOURCES' | 'ENVIRONMENT' | 'RULES'>('ALL');

  // Dialog States
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLaunchConfirmOpen, setIsLaunchConfirmOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Selected astronaut modal for detailed dossier review
  const [selectedAstronautForReview, setSelectedAstronautForReview] = useState<string | null>(null);

  const activeMissionExists = hasStoredMission() || missionState.mission.elapsedHours > 0;

  // Real-time Field Updater with Validation
  const updateField = <K extends keyof MissionSetupFormData>(
    field: K,
    value: MissionSetupFormData[K]
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const parse = missionSetupSchema.safeParse(updated);
    if (!parse.success) {
      const issue = parse.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        setFormErrors((prev) => ({ ...prev, [field]: issue.message }));
      } else {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    } else {
      setFormErrors({});
    }
  };

  // Open Launch Confirmation Modal after full validation
  const handleInitiateLaunch = (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = missionSetupSchema.safeParse(formData);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[String(issue.path[0])] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLaunchConfirmOpen(true);
  };

  // Execute Launch: Initialize Day 01, Hour 00 via Pure Engine and navigate
  const handleConfirmLaunch = () => {
    if (isLaunching) return; // Prevent accidental duplicate submission
    setIsLaunching(true);

    try {
      // Create canonical Day 01 Hour 00 state using simulation engine
      initializeNewMission(formData);

      // Close modal and navigate directly to Mission Overview
      setIsLaunchConfirmOpen(false);
      navigate('/overview');
    } catch (err) {
      console.error('[LIGHTTIME Launch Error]', err);
      setIsLaunching(false);
    }
  };

  // Reset Flow
  const handleResetToDefaults = () => {
    setFormData(DEFAULT_SETUP_FORM);
    setFormErrors({});
    setIsResetConfirmOpen(false);
  };

  const selectedScenarioDef: MissionScenarioDefinition =
    MISSION_SCENARIOS.find((s) => s.id === formData.scenarioId) ?? MISSION_SCENARIOS[0]!;

  return (
    <div className="min-h-screen bg-space-deep text-offwhite bg-technical-grid bg-grid-pattern selection:bg-telemetry-cyan/20 selection:text-telemetry-cyan py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 font-mono">
        {/* Top Breadcrumb & Status Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-panel-blue/60 pb-3 gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-offwhite/60 hover:text-telemetry-cyan transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>RETURN TO EXPEDITION BRIEFING</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-offwhite/50 uppercase">TARGET DESTINATION:</span>
            <Badge variant="telemetry">SHACKLETON CRATER RIM · 89.9°S</Badge>
            <Badge variant="nominal">EXPEDITION DURATION: 30 DAYS</Badge>
          </div>
        </div>

        {/* Insignia & Title Hero Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-control-navy/70 tech-border hud-bracket">
          <MissionInsignia size="lg" />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] text-telemetry-cyan uppercase tracking-widest font-bold">
                STAGE 01 · PRE-LAUNCH BRIEFING CONSOLE
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/40">
                START SOL: DAY 01 · 00:00:00 MET
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-offwhite">
              CONFIGURE 30-DAY LUNAR EXPEDITION
            </h1>
            <p className="text-xs text-offwhite/70 max-w-2xl leading-relaxed">
              Verify mission objectives, inspect the 4 certified astronauts, review initial ECLSS
              consumables, and choose your initial scenario before initiating descent stage ignition.
            </p>
          </div>
        </div>

        {/* Quick Filter Bar for Briefing Sections */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-blue/70 pb-2">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={activeSectionFilter === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSectionFilter('ALL')}
              className="gap-1 text-xs font-mono"
            >
              <Sliders className="h-3 w-3" />
              <span>FULL BRIEFING</span>
            </Button>
            <Button
              variant={activeSectionFilter === 'CREW' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSectionFilter('CREW')}
              className="gap-1 text-xs font-mono"
            >
              <Users className="h-3 w-3" />
              <span>CREW MANIFEST</span>
            </Button>
            <Button
              variant={activeSectionFilter === 'RESOURCES' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSectionFilter('RESOURCES')}
              className="gap-1 text-xs font-mono"
            >
              <Box className="h-3 w-3" />
              <span>RESOURCES & ECLSS</span>
            </Button>
            <Button
              variant={activeSectionFilter === 'ENVIRONMENT' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSectionFilter('ENVIRONMENT')}
              className="gap-1 text-xs font-mono"
            >
              <Compass className="h-3 w-3" />
              <span>ENVIRONMENT</span>
            </Button>
            <Button
              variant={activeSectionFilter === 'RULES' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSectionFilter('RULES')}
              className="gap-1 text-xs font-mono"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>SAFETY RULES</span>
            </Button>
          </div>

          <span className="text-[10px] text-offwhite/50 uppercase hidden md:inline">
            EXPEDITION CLOCK: DAY 01 · HOUR 00
          </span>
        </div>

        {/* Configuration & Briefing Form */}
        <form onSubmit={handleInitiateLaunch} className="space-y-6">
          {/* SECTION 01: FLIGHT DIRECTOR & TELEMETRY UPLINK NODE */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RULES') && (
            <Card withBracket>
              <CardHeader>
                <CardTitle className="text-xs">
                  01. FLIGHT DIRECTOR & TELEMETRY UPLINK NODE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-offwhite/60 uppercase mb-1 text-[10px]">
                      Mission Designation / Name *
                    </label>
                    <input
                      type="text"
                      value={formData.missionName}
                      onChange={(e) => updateField('missionName', e.target.value)}
                      placeholder="e.g. LIGHTTIME Expedition 30 – Shackleton Outpost"
                      required
                      className="w-full bg-space-surface border border-panel-blue/70 p-2.5 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    />
                    {formErrors.missionName && (
                      <p className="text-[10px] text-critical-red mt-1 font-bold">
                        {formErrors.missionName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-offwhite/60 uppercase mb-1 text-[10px]">
                      Commander Call Sign *
                    </label>
                    <input
                      type="text"
                      value={formData.commanderCallsign}
                      onChange={(e) => updateField('commanderCallsign', e.target.value)}
                      required
                      className="w-full bg-space-surface border border-panel-blue/70 p-2.5 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    />
                    {formErrors.commanderCallsign && (
                      <p className="text-[10px] text-critical-red mt-1 font-bold">
                        {formErrors.commanderCallsign}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-offwhite/60 uppercase mb-1 text-[10px]">
                      Primary Deep Space Network Complex
                    </label>
                    <select
                      value={formData.groundStation}
                      onChange={(e) =>
                        updateField(
                          'groundStation',
                          e.target.value as 'Goldstone' | 'Madrid' | 'Canberra'
                        )
                      }
                      className="w-full bg-space-surface border border-panel-blue/70 p-2.5 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
                    >
                      <option value="Goldstone">Goldstone Deep Space Comm Complex (USA) · 35m & 70m Dishes</option>
                      <option value="Madrid">Madrid Deep Space Comm Complex (Spain) · 34m Beam Waveguide</option>
                      <option value="Canberra">Canberra Deep Space Comm Complex (Australia) · 70m Sub-Reflector</option>
                    </select>
                  </div>

                  <div className="p-3 bg-control-navy border border-panel-blue/50 flex flex-col justify-center text-[11px]">
                    <span className="text-offwhite/60 text-[10px]">ONE-WAY LIGHT-TIME LATENCY:</span>
                    <span className="text-telemetry-cyan font-bold text-sm">
                      1.282 SECONDS (τ = d / c)
                    </span>
                    <span className="text-[10px] text-offwhite/50">
                      Round-trip telemetry ping: ~2.564s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* INITIAL SCENARIO SELECTION */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RULES') && (
            <Card withBracket>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">
                    MISSION SCENARIO SELECTION (INITIAL FLIGHT DIRECTIVE)
                  </CardTitle>
                  <Badge
                    variant={
                      selectedScenarioDef.riskRating === 'CRITICAL'
                        ? 'critical'
                        : selectedScenarioDef.riskRating === 'HIGH'
                        ? 'warning'
                        : 'nominal'
                    }
                  >
                    RISK: {selectedScenarioDef.riskRating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MISSION_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => updateField('scenarioId', scen.id)}
                      className={`p-3 text-left border transition-all ${
                        formData.scenarioId === scen.id
                          ? 'border-telemetry-cyan bg-panel-blue/40 text-offwhite font-semibold shadow-telemetry-sm'
                          : 'border-panel-blue/50 bg-space-surface/50 text-offwhite/70 hover:border-panel-blue'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold uppercase text-telemetry-cyan text-xs">
                          {scen.title}
                        </span>
                        <Badge
                          variant={
                            scen.riskRating === 'CRITICAL'
                              ? 'critical'
                              : scen.riskRating === 'HIGH'
                              ? 'warning'
                              : 'nominal'
                          }
                        >
                          {scen.difficulty}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-offwhite/50 font-bold mb-1">
                        {scen.subtitle}
                      </div>
                      <p className="text-[11px] text-offwhite/70 leading-relaxed line-clamp-2">
                        {scen.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-control-navy border border-telemetry-cyan/40 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-telemetry-cyan font-bold uppercase">
                      ACTIVE SCENARIO BRIEFING:
                    </span>
                    <span className="text-offwhite font-bold">{selectedScenarioDef.title}</span>
                  </div>
                  <div className="text-[11px] text-offwhite/80">
                    <span className="text-offwhite/50">Primary Objective: </span>
                    {selectedScenarioDef.primaryObjective}
                  </div>
                  <div className="text-[11px] text-warning-amber">
                    <span className="text-offwhite/50">Contingency Risk: </span>
                    {selectedScenarioDef.contingencyRisk}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 02: EXPEDITION DIFFICULTY & AUTONOMY PROFILE (Preserving App.test.tsx target) */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RULES') && (
            <Card withBracket>
              <CardHeader>
                <CardTitle className="text-xs">
                  02. EXPEDITION DIFFICULTY & AUTONOMY PROFILE
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => updateField('difficulty', 'CADET')}
                  className={`p-3 text-left border transition-all ${
                    formData.difficulty === 'CADET'
                      ? 'border-telemetry-cyan bg-panel-blue/40 text-offwhite font-semibold'
                      : 'border-panel-blue/50 bg-space-surface/50 text-offwhite/70 hover:border-panel-blue'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase text-telemetry-cyan">CADET</span>
                    <Badge variant="nominal">ASSISTED</Badge>
                  </div>
                  <p className="text-[11px] text-offwhite/60 leading-relaxed">
                    Generous life support consumables, automatic anomaly recommendations, and stabilized cognitive readiness.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('difficulty', 'DIRECTOR')}
                  className={`p-3 text-left border transition-all ${
                    formData.difficulty === 'DIRECTOR'
                      ? 'border-telemetry-cyan bg-panel-blue/40 text-offwhite font-semibold'
                      : 'border-panel-blue/50 bg-space-surface/50 text-offwhite/70 hover:border-panel-blue'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase text-telemetry-cyan">FLIGHT DIRECTOR</span>
                    <Badge variant="telemetry">STANDARD</Badge>
                  </div>
                  <p className="text-[11px] text-offwhite/60 leading-relaxed">
                    Accurate 1.282s light-time delay, diurnal thermal shifts, standard sleep debt accumulation, and realistic ECLSS scrubbing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('difficulty', 'COMMANDER')}
                  className={`p-3 text-left border transition-all ${
                    formData.difficulty === 'COMMANDER'
                      ? 'border-telemetry-cyan bg-panel-blue/40 text-offwhite font-semibold'
                      : 'border-panel-blue/50 bg-space-surface/50 text-offwhite/70 hover:border-panel-blue'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase text-telemetry-cyan">MISSION COMMANDER</span>
                    <Badge variant="warning">HARDCORE</Badge>
                  </div>
                  <p className="text-[11px] text-offwhite/60 leading-relaxed">
                    Severe Solar Particle Event occurrences, unannounced loss-of-signal periods, tight consumable limits, and acute cognitive degradation.
                  </p>
                </button>
              </CardContent>
            </Card>
          )}

          {/* SECTION 03: ASTRONAUT CREW COMPLEMENT (4/4 CERTIFIED) (Preserving App.test.tsx target) */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'CREW') && (
            <div className="space-y-4">
              <Card withBracket>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs">
                      03. ASTRONAUT CREW COMPLEMENT (4/4 CERTIFIED)
                    </CardTitle>
                    <Badge variant="nominal">ALL 4 ASTRONAUTS CERTIFIED FOR FLIGHT</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {missionState.crew.map((ast) => (
                    <div
                      key={ast.astronautId}
                      className="p-3 bg-control-navy border border-panel-blue/60 hover:border-telemetry-cyan transition-colors space-y-2 cursor-pointer"
                      onClick={() => setSelectedAstronautForReview(ast.astronautId)}
                    >
                      <div className="flex items-center justify-between border-b border-panel-blue/40 pb-1.5">
                        <span className="font-bold text-telemetry-cyan text-xs">{ast.callsign}</span>
                        <span className="text-[10px] text-nominal-green font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> GO
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-offwhite text-xs">{ast.name}</div>
                        <div className="text-[10px] text-offwhite/50">{ast.role}</div>
                      </div>
                      <div className="space-y-1 text-[10px] text-offwhite/60 pt-1">
                        <div className="flex justify-between">
                          <span>SpO₂:</span>
                          <span className="text-offwhite font-bold">{ast.biometrics.bloodOxygenPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heart Rate:</span>
                          <span className="text-offwhite font-bold">{ast.biometrics.heartRateBpm} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cognitive Readiness:</span>
                          <span className="text-nominal-green font-bold">
                            {(100 - ast.fatigueIndex).toFixed(0)}% (OPTIMAL)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Baseline Sleep:</span>
                          <span className="text-offwhite font-bold">{ast.sleepHours.toFixed(1)} hrs/sol</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] h-6 mt-1 text-telemetry-cyan hover:bg-telemetry-cyan/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAstronautForReview(ast.astronautId);
                        }}
                      >
                        REVIEW FULL DOSSIER
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Crew Roles & Operational Responsibilities Breakdown */}
              <Card withBracket>
                <CardHeader>
                  <CardTitle className="text-xs">CREW ROLES & FLIGHT DIRECTIVE DUTIES</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                    <span className="font-bold text-telemetry-cyan text-[11px]">
                      COMMANDER (CDR) · Elena Vance
                    </span>
                    <p className="text-[11px] text-offwhite/70 leading-relaxed">
                      Holds supreme operational authority on the lunar surface. Responsible for final
                      ECLSS mass-balance directives, critical contingency procedure authorization,
                      and ground station communication prioritization.
                    </p>
                  </div>

                  <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                    <span className="font-bold text-telemetry-cyan text-[11px]">
                      LUNAR MODULE PILOT (LMP) · Marcus Chen
                    </span>
                    <p className="text-[11px] text-offwhite/70 leading-relaxed">
                      Lead surface systems engineer and rover pilot. Oversees descent stage power
                      interfaces, airlock ingress/egress, surface mobility rover telemetry, and
                      geological drill maintenance.
                    </p>
                  </div>

                  <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                    <span className="font-bold text-telemetry-cyan text-[11px]">
                      SCIENCE SPECIALIST (SCI) · Dr. Sarah Okafor
                    </span>
                    <p className="text-[11px] text-offwhite/70 leading-relaxed">
                      Geochemist and planetary geologist. Leads in-situ resource utilization (ISRU)
                      assays, cryo-sampling in permanently shadowed craters, and volatile gas
                      spectrometer readings.
                    </p>
                  </div>

                  <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                    <span className="font-bold text-telemetry-cyan text-[11px]">
                      MEDICAL SPECIALIST (MED) · Dr. David Hansen
                    </span>
                    <p className="text-[11px] text-offwhite/70 leading-relaxed">
                      Crew flight surgeon and life support monitor. Tracks cumulative dosimeter
                      radiation loads, circadian rhythm sleep phases, treadmill countermeasures, and
                      cabin atmosphere hypercapnia trends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 04: INITIAL CONSUMABLE RESOURCE MANIFEST & HABITAT MACHINERY */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RESOURCES') && (
            <div className="space-y-4">
              <Card withBracket>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs">
                      INITIAL CONSUMABLE RESOURCE MANIFEST (DAY 01 BASELINE)
                    </CardTitle>
                    <Badge variant="nominal">30-DAY EXPEDITION MARGINS NOMINAL</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="text-[10px] text-offwhite/50 uppercase">CRYOGENIC OXYGEN</span>
                    <div className="text-base font-bold text-telemetry-cyan">300.0 kg</div>
                    <div className="text-[10px] text-offwhite/60">
                      Rate: ~3.36 kg/day aggregate
                    </div>
                  </div>

                  <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="text-[10px] text-offwhite/50 uppercase">POTABLE WATER</span>
                    <div className="text-base font-bold text-telemetry-cyan">1,200.0 Liters</div>
                    <div className="text-[10px] text-offwhite/60">
                      Recycling: 90% catalytic loop
                    </div>
                  </div>

                  <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="text-[10px] text-offwhite/50 uppercase">FOOD RATIONS</span>
                    <div className="text-base font-bold text-telemetry-cyan">360,000 kcal</div>
                    <div className="text-[10px] text-offwhite/60">
                      3,000 kcal/crew/day (30 Sols)
                    </div>
                  </div>

                  <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="text-[10px] text-offwhite/50 uppercase">BATTERY STORAGE</span>
                    <div className="text-base font-bold text-telemetry-cyan">200.0 kWh</div>
                    <div className="text-[10px] text-nominal-green">
                      100% State of Charge (SOC)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Habitat Systems Machinery Status */}
              <Card withBracket>
                <CardHeader>
                  <CardTitle className="text-xs">HABITAT MACHINERY & SUBSYSTEM INTEGRITY</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-space-surface border border-panel-blue/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-offwhite">CDRA CO₂ Removal Assembly</div>
                        <div className="text-[10px] text-offwhite/50">Dual Amine & Zeolite Adsorbent Beds</div>
                      </div>
                      <Badge variant="nominal">100% CONDITION</Badge>
                    </div>

                    <div className="p-2.5 bg-space-surface border border-panel-blue/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-offwhite">Water Recovery System (WRS)</div>
                        <div className="text-[10px] text-offwhite/50">Catalytic Condensate & Urine Processor</div>
                      </div>
                      <Badge variant="nominal">100% CONDITION</Badge>
                    </div>

                    <div className="p-2.5 bg-space-surface border border-panel-blue/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-offwhite">Primary Polar Solar Arrays</div>
                        <div className="text-[10px] text-offwhite/50">Sun-Tracking Vertical Mast (45.0 kW daylight)</div>
                      </div>
                      <Badge variant="nominal">100% CONDITION</Badge>
                    </div>

                    <div className="p-2.5 bg-space-surface border border-panel-blue/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-offwhite">Surface Fission Power Reactor</div>
                        <div className="text-[10px] text-offwhite/50">Stirling Cycle Baseload (15.0 kW continuous)</div>
                      </div>
                      <Badge variant="nominal">100% CONDITION</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 05: LUNAR ENVIRONMENT & SITE PROFILE */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'ENVIRONMENT') && (
            <div className="space-y-4">
              <Card withBracket>
                <CardHeader>
                  <CardTitle className="text-xs">
                    GEOLOGICAL & ENVIRONMENTAL SITE SURVEY · SHACKLETON RIM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                      <span className="text-[10px] text-offwhite/50 uppercase">LANDING COORDINATES</span>
                      <div className="text-sm font-bold text-offwhite">89.9°S · 0.0°E</div>
                      <div className="text-[10px] text-offwhite/60">Shackleton Crater Connecting Ridge</div>
                    </div>

                    <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                      <span className="text-[10px] text-offwhite/50 uppercase">SURFACE ELEVATION</span>
                      <div className="text-sm font-bold text-offwhite">4,200 Meters</div>
                      <div className="text-[10px] text-offwhite/60">Peak of Quasi-Permanent Sunlight</div>
                    </div>

                    <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1">
                      <span className="text-[10px] text-offwhite/50 uppercase">SOLAR ILLUMINATION</span>
                      <div className="text-sm font-bold text-telemetry-cyan">86% Solar Visibility</div>
                      <div className="text-[10px] text-offwhite/60">Graze-angle polar illumination</div>
                    </div>
                  </div>

                  <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-2 text-xs">
                    <span className="font-bold text-telemetry-cyan">ENVIRONMENTAL HAZARDS SUMMARY:</span>
                    <ul className="space-y-1 text-[11px] text-offwhite/70 list-disc list-inside">
                      <li>
                        <strong className="text-offwhite">Extreme Thermal Shifts:</strong> Surface varies from -130°C in shadow to +120°C in direct sun. Habitat thermal fluid loops maintain cabin at 21.5°C.
                      </li>
                      <li>
                        <strong className="text-offwhite">Space Radiation Baseline:</strong> 0.35 mSv/sol background Galactic Cosmic Rays (GCR). Acute SPE alerts require immediate shelter ingress.
                      </li>
                      <li>
                        <strong className="text-offwhite">Electrostatic Regolith Dust:</strong> Highly abrasive lunar particulates with jagged crystalline morphology. Suits undergo vacuum airlock brushing prior to ingress.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 06: EXPEDITION FLIGHT OBJECTIVES & MATHEMATICAL ASSUMPTIONS */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RULES') && (
            <div className="space-y-4">
              <Card withBracket>
                <CardHeader>
                  <CardTitle className="text-xs">EXPEDITION FLIGHT OBJECTIVES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-2.5 bg-control-navy border-l-2 border-nominal-green pl-3 space-y-0.5">
                    <span className="font-bold text-nominal-green text-[11px]">
                      PRIMARY OBJECTIVE · ASTRONAUT PHYSIOLOGY & SURVIVAL
                    </span>
                    <p className="text-[11px] text-offwhite/70">
                      Keep all four astronauts within nominal physiological (SpO2 &gt; 95%, heart rate nominal) and psychological readiness bounds across the entire 30-day mission.
                    </p>
                  </div>

                  <div className="p-2.5 bg-control-navy border-l-2 border-telemetry-cyan pl-3 space-y-0.5">
                    <span className="font-bold text-telemetry-cyan text-[11px]">
                      SECONDARY OBJECTIVE · ECLSS CLOSED-LOOP MANAGEMENT
                    </span>
                    <p className="text-[11px] text-offwhite/70">
                      Balance oxygen replenishment, catalytic water recycling, and CO2 scrubbing to prevent consumable depletion or toxic gas accumulation.
                    </p>
                  </div>

                  <div className="p-2.5 bg-control-navy border-l-2 border-warning-amber pl-3 space-y-0.5">
                    <span className="font-bold text-warning-amber text-[11px]">
                      TERTIARY OBJECTIVE · SCIENTIFIC VOLATILE YIELD
                    </span>
                    <p className="text-[11px] text-offwhite/70">
                      Extract and analyze at least 3 deep ice core samples from Permanently Shadowed Regions without triggering crew exhaustion or battery brownouts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mathematical Simulation Assumptions */}
              <Card withBracket>
                <CardHeader>
                  <CardTitle className="text-xs">CALIBRATED EDUCATIONAL & SCIENTIFIC ASSUMPTIONS</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-offwhite/70 font-mono space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • Daily O₂ Consumption: 0.84 kg per astronaut per day.
                    </div>
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • Daily Water Requirement: 2.5 Liters per crew/day (90% recycled).
                    </div>
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • Light-Time Delay: 1.282s one-way propagation latency (d / c).
                    </div>
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • Sleep Threshold: &lt; 7.0h sleep/sol elevates cognitive fatigue by 15%/sol.
                    </div>
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • 30-Day Radiation Guideline: NASA 250 mSv career limit index.
                    </div>
                    <div className="p-2 bg-space-surface border border-panel-blue/30">
                      • Atmospheric Baseline: 56.5 kPa (Exploration Atmosphere Standard).
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 07: SAFETY FLIGHT RULES & AGREEMENT */}
          {(activeSectionFilter === 'ALL' || activeSectionFilter === 'RULES') && (
            <Card withBracket>
              <CardHeader>
                <CardTitle className="text-xs">LUNAR SURFACE FLIGHT SAFETY RULES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono text-offwhite/70">
                <div className="p-2.5 bg-space-surface border border-panel-blue/40">
                  <strong className="text-offwhite font-bold">FLIGHT RULE 4.1 (O₂ Safety):</strong> If cabin partial pressure ppO₂ drops below 19.0 kPa, all EVA operations are aborted immediately.
                </div>
                <div className="p-2.5 bg-space-surface border border-panel-blue/40">
                  <strong className="text-offwhite font-bold">FLIGHT RULE 5.2 (CO₂ Threshold):</strong> If ppCO₂ exceeds 0.53 kPa, an emergency caution alarm trips. If it exceeds 1.0 kPa, mission abort is mandatory.
                </div>
                <div className="p-2.5 bg-space-surface border border-panel-blue/40">
                  <strong className="text-offwhite font-bold">FLIGHT RULE 6.3 (Crew Autonomy Override):</strong> When telemetry latency prevents Earth from responding within the contingency reaction window, on-site crew autonomy automatically supersedes Earth directives.
                </div>
                <div className="p-2.5 bg-space-surface border border-panel-blue/40">
                  <strong className="text-offwhite font-bold">FLIGHT RULE 8.4 (Energy Bus Reserve):</strong> Battery storage must not discharge below 30.0 kWh (15% reserve floor) except during declared survival emergencies.
                </div>
                <div className="p-2.5 bg-space-surface border border-panel-blue/40">
                  <strong className="text-offwhite font-bold">FLIGHT RULE 9.1 (Solar Particle Shelter):</strong> In the event of a Solar Particle Event (SPE) alert, all crew must ingress the storm shelter within 20 minutes.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mandatory Flight Directives Agreement */}
          <div className="p-4 bg-control-navy/60 border border-panel-blue/70 text-xs flex items-start gap-3">
            <input
              type="checkbox"
              id="rules-check"
              checked={formData.agreedToSafetyRules}
              onChange={(e) => updateField('agreedToSafetyRules', e.target.checked)}
              className="mt-1 h-4 w-4 rounded-none border-panel-blue bg-space-surface text-telemetry-cyan focus:ring-telemetry-cyan cursor-pointer"
            />
            <label
              htmlFor="rules-check"
              className="text-offwhite/80 leading-relaxed cursor-pointer select-none"
            >
              I acknowledge the flight rules of autonomous human lunar spaceflight: Ground commands will
              experience a <span className="text-telemetry-cyan font-bold">~1.28-second one-way propagation latency</span>,
              and crew autonomy protocols will override Earth flight directives during rapid life-critical contingencies.
            </label>
          </div>
          {formErrors.agreedToSafetyRules && (
            <p className="text-[10px] text-critical-red font-bold">
              {formErrors.agreedToSafetyRules}
            </p>
          )}

          {/* Active Mission In-Progress Notice */}
          {activeMissionExists && (
            <Alert variant="warning" title="ACTIVE MISSION IN PROGRESS">
              A lunar expedition is currently stored in memory (Sol {missionState.mission.missionDay}, {missionState.mission.elapsedHours.toFixed(1)}h elapsed). Launching a new mission will create a fresh Day 01, Hour 00 expedition.
            </Alert>
          )}

          {/* Bottom Control Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-panel-blue/60 pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                className="gap-1.5 text-xs text-offwhite/60 hover:text-offwhite"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>RESET CONFIGURATION</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="hidden lg:block text-[11px] text-offwhite/50">
                TIMELINE: <span className="text-telemetry-cyan font-bold">30 DAYS (720 HRS)</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!formData.agreedToSafetyRules || isLaunching}
                className="w-full sm:w-auto gap-2"
              >
                <Rocket className="h-4 w-4" />
                LAUNCH 30-DAY LUNAR EXPEDITION
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL 1: RESET CONFIGURATION CONFIRMATION */}
      <Dialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="CONFIRM CONFIGURATION RESET"
        description="Reset all pre-launch setup fields to default values?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleResetToDefaults}>
              RESTORE DEFAULTS
            </Button>
          </div>
        }
      >
        <p className="text-xs font-mono text-offwhite/70">
          This will restore the standard mission name, default flight director callsign, and nominal
          Expedition 30 scenario profile.
        </p>
      </Dialog>

      {/* MODAL 2: LAUNCH MISSION CONFIRMATION */}
      <Dialog
        open={isLaunchConfirmOpen}
        onOpenChange={setIsLaunchConfirmOpen}
        title="LAUNCH CONFIRMATION · INITIATE 30-DAY LUNAR EXPEDITION"
        description="Verify pre-flight manifest parameters before descent engine ignition."
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-mono text-offwhite/50">
              EXPEDITION CLOCK: DAY 01 · 00:00:00 MET
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLaunchConfirmOpen(false)}
                disabled={isLaunching}
              >
                ABORT / REVIEW BRIEFING
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmLaunch}
                disabled={isLaunching}
                className="gap-1.5"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>{isLaunching ? 'INITIALIZING SIMULATION...' : 'CONFIRM & INITIATE DESCENT STAGE'}</span>
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-control-navy border border-telemetry-cyan/50 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-offwhite/60">MISSION NAME:</span>
              <span className="text-telemetry-cyan font-bold">{formData.missionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-offwhite/60">COMMANDER CALLSIGN:</span>
              <span className="text-offwhite font-bold">{formData.commanderCallsign}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-offwhite/60">SELECTED SCENARIO:</span>
              <span className="text-offwhite font-bold">{selectedScenarioDef.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-offwhite/60">STARTING SOL & TIME:</span>
              <span className="text-nominal-green font-bold">DAY 01 · HOUR 00.00 (0.0h MET)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-offwhite/60">TOTAL DURATION:</span>
              <span className="text-offwhite font-bold">30 DAYS (720.0 HOURS)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-offwhite/60">GROUND STATION:</span>
              <span className="text-offwhite font-bold">DSN {formData.groundStation}</span>
            </div>
          </div>

          {activeMissionExists && (
            <div className="p-2.5 bg-warning-amber/10 border border-warning-amber/40 text-warning-amber text-[11px]">
              ⚠️ An active mission is currently in progress. Confirming launch will replace it with a
              pristine Day 01 Hour 00 expedition.
            </div>
          )}

          <p className="text-[11px] text-offwhite/70">
            Upon confirmation, the pure TypeScript simulation engine will instantiate canonical
            MissionState, initialize ECLSS solvers, start the discrete mission clock, and transition to
            Mission Control.
          </p>
        </div>
      </Dialog>

      {/* MODAL 3: ASTRONAUT DOSSIER REVIEW */}
      {selectedAstronautForReview && (
        <Dialog
          open={!!selectedAstronautForReview}
          onOpenChange={(open) => !open && setSelectedAstronautForReview(null)}
          title={`PRE-FLIGHT ASTRONAUT DOSSIER · ${
            missionState.crew.find((c) => c.astronautId === selectedAstronautForReview)?.callsign
          }`}
          description={`${
            missionState.crew.find((c) => c.astronautId === selectedAstronautForReview)?.name
          } · ${
            missionState.crew.find((c) => c.astronautId === selectedAstronautForReview)?.role
          }`}
          footer={
            <Button size="sm" variant="secondary" onClick={() => setSelectedAstronautForReview(null)}>
              CLOSE DOSSIER
            </Button>
          }
        >
          {(() => {
            const astronaut = missionState.crew.find(
              (c) => c.astronautId === selectedAstronautForReview
            );
            if (!astronaut) return null;
            return (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="flex items-center gap-1 text-[10px] text-offwhite/50">
                      <Heart className="h-3 w-3 text-critical-red" />
                      CARDIOVASCULAR VITALS
                    </span>
                    <div className="font-bold text-offwhite">{astronaut.biometrics.heartRateBpm} BPM</div>
                    <div className="text-[10px] text-offwhite/60">
                      BP: {astronaut.biometrics.bloodPressureSystolicMmHg}/
                      {astronaut.biometrics.bloodPressureDiastolicMmHg} mmHg
                    </div>
                  </div>

                  <div className="p-2.5 bg-control-navy border border-panel-blue/40 space-y-1">
                    <span className="flex items-center gap-1 text-[10px] text-offwhite/50">
                      <Brain className="h-3 w-3 text-telemetry-cyan" />
                      COGNITIVE READINESS
                    </span>
                    <div className="font-bold text-nominal-green">
                      {(100 - astronaut.fatigueIndex).toFixed(0)}% (OPTIMAL)
                    </div>
                    <div className="text-[10px] text-offwhite/60">
                      Sleep: {astronaut.sleepHours.toFixed(1)} hrs/sol
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-space-surface border border-panel-blue/40 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-offwhite/60">Assigned Tasks:</span>
                    <span className="text-telemetry-cyan font-bold">
                      {astronaut.assignedTasks.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-offwhite/60">Cumulative Radiation Dose:</span>
                    <span className="text-offwhite font-bold">
                      {astronaut.biometrics.cumulativeRadiationDoseMsv.toFixed(2)} mSv
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-offwhite/60">Medical Flight Clearance:</span>
                    <span className="text-nominal-green font-bold">CERTIFIED GO FOR DESCENT</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Dialog>
      )}
    </div>
  );
};
