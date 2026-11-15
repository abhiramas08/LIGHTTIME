import React from 'react';
import { Link } from 'react-router-dom';
import { MissionInsignia } from '@/components/common/MissionInsignia';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Rocket,
  Activity,
  Home,
  AlertTriangle,
  GitBranch,
  BookOpen,
  ArrowRight,
  Heart,
  Brain,
  ShieldCheck,
  Signal,
  Wind,
  Droplets,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-deep text-offwhite bg-technical-grid bg-grid-pattern selection:bg-telemetry-cyan/20 selection:text-telemetry-cyan font-sans">
      {/* Top Navigation Bar for Landing Page */}
      <header className="sticky top-0 z-50 w-full border-b border-panel-blue/70 bg-space-darker/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-control-navy border border-telemetry-cyan/50 text-telemetry-cyan font-mono font-bold text-sm hud-bracket">
              LT
            </div>
            <div>
              <span className="font-heading text-base font-bold tracking-wider text-offwhite uppercase">
                LIGHTTIME
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.2 bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30">
                SIMULATOR v0.1
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-offwhite/70">
            <a href="#about" className="hover:text-telemetry-cyan transition-colors">
              About
            </a>
            <a href="#experiences" className="hover:text-telemetry-cyan transition-colors">
              Experiences
            </a>
            <a href="#consequence-lab" className="hover:text-telemetry-cyan transition-colors">
              Consequence Lab
            </a>
            <a href="#science" className="hover:text-telemetry-cyan transition-colors">
              Science
            </a>
            <a href="#architecture" className="hover:text-telemetry-cyan transition-colors">
              Engine
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/overview">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                COMMAND CONSOLE
              </Button>
            </Link>
            <Link to="/setup">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Rocket className="h-3.5 w-3.5" />
                <span>START MISSION</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: Cinematic Lunar Surface Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-panel-blue/50">
        {/* Subtle radial atmospheric glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-telemetry-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Custom Mission Insignia Badge */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-telemetry-cyan/20 blur-md group-hover:bg-telemetry-cyan/30 transition-all duration-300" />
              <MissionInsignia size="xl" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-control-navy tech-border text-[11px] font-mono text-telemetry-cyan uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-nominal-green animate-pulse" />
                EDUCATIONAL LUNAR MISSION SIMULATION PLATFORM
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-offwhite uppercase">
                LIGHTTIME
              </h1>

              <p className="font-mono text-base sm:text-lg lg:text-xl text-telemetry-cyan font-medium tracking-wide max-w-2xl mx-auto">
                Human-Centred Autonomous Lunar Mission Simulator
              </p>

              <p className="font-sans text-sm sm:text-base text-offwhite/70 max-w-2xl mx-auto leading-relaxed pt-2">
                Step into Earth Mission Control as flight commander. Lead a four-member astronaut crew through a rigorous 30-day expedition on the lunar surface under real speed-of-light communications delay.
              </p>
            </div>

            {/* Subtle Animated Lunar Telemetry HUD Strip */}
            <div className="w-full max-w-4xl pt-4">
              <div className="bg-control-navy/70 border border-panel-blue/70 p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono text-xs">
                <div className="border-l-2 border-telemetry-cyan pl-2.5">
                  <span className="text-[10px] text-offwhite/50 uppercase block">TARGET SITE</span>
                  <span className="font-bold text-offwhite text-[11px]">89.9°S Shackleton Rim</span>
                  <span className="text-[9px] text-telemetry-cyan block">Permanently Shadowed</span>
                </div>

                <div className="border-l-2 border-warning-amber pl-2.5">
                  <span className="text-[10px] text-offwhite/50 uppercase block">LIGHT-TIME LATENCY</span>
                  <span className="font-bold text-warning-amber text-[11px]">1.282s (1-Way)</span>
                  <span className="text-[9px] text-offwhite/50 block">2.564s Round-Trip RTT</span>
                </div>

                <div className="border-l-2 border-nominal-green pl-2.5">
                  <span className="text-[10px] text-offwhite/50 uppercase block">HABITAT ATMOSPHERE</span>
                  <span className="font-bold text-nominal-green text-[11px]">56.5 kPa Normoxic</span>
                  <span className="text-[9px] text-offwhite/50 block">ppO₂ 20.0 kPa Target</span>
                </div>

                <div className="border-l-2 border-telemetry-cyan pl-2.5">
                  <span className="text-[10px] text-offwhite/50 uppercase block">CREW COMPLEMENT</span>
                  <span className="font-bold text-offwhite text-[11px]">4 Astronauts</span>
                  <span className="text-[9px] text-nominal-green block">100% Medical Fit (GO)</span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link to="/setup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  <Rocket className="h-4 w-4" />
                  <span>START MISSION (SETUP)</span>
                </Button>
              </Link>

              <Link to="/overview">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                  <span>ENTER MISSION CONTROL</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#science">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>SCIENTIFIC ASSUMPTIONS</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: About LIGHTTIME */}
      <section id="about" className="py-16 sm:py-24 border-b border-panel-blue/50 bg-space-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-widest">
              PEDAGOGICAL MISSION ARCHITECTURE
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-offwhite">
              Why Human Spaceflight Demands New Command Paradigms
            </h2>
            <p className="text-sm font-sans text-offwhite/70 leading-relaxed">
              Traditional simulators focus solely on orbital trajectories and thruster burns. LIGHTTIME puts the human being at the center of the mission equation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-6 bg-control-navy/80 tech-border hud-bracket space-y-3">
              <div className="flex items-center gap-2 text-telemetry-cyan">
                <Signal className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Speed-of-Light Reality</span>
              </div>
              <p className="text-offwhite/70 leading-relaxed font-sans">
                At 384,400 km, communications take ~1.28 seconds each way. You cannot "joystick" operations from Earth. When life-critical alarms trigger, commanders must rely on autonomous pre-approved flight rules and crew discretion.
              </p>
            </div>

            <div className="p-6 bg-control-navy/80 tech-border hud-bracket space-y-3">
              <div className="flex items-center gap-2 text-warning-amber">
                <Brain className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Human Factors First</span>
              </div>
              <p className="text-offwhite/70 leading-relaxed font-sans">
                Astronauts are not machines. Cumulative sleep debt, 24.8h circadian phase shift, high-stress EVA sorties, and radiation exposure degrade cognitive readiness, increasing critical procedural error rates.
              </p>
            </div>

            <div className="p-6 bg-control-navy/80 tech-border hud-bracket space-y-3">
              <div className="flex items-center gap-2 text-nominal-green">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Closed-Loop Survival</span>
              </div>
              <p className="text-offwhite/70 leading-relaxed font-sans">
                Manage the habitat's Environmental Control & Life Support System (ECLSS). Monitor oxygen generation, carbon dioxide scrubbing, gray water catalytic recycling, and electrical power loads across 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: The Three Connected Experiences: LIVE, OPERATE, RESPOND */}
      <section id="experiences" className="py-16 sm:py-24 border-b border-panel-blue/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-widest">
              CORE OPERATIONAL TRIPTYCH
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-offwhite">
              The Three Connected Experiences
            </h2>
            <p className="text-sm font-sans text-offwhite/70 leading-relaxed">
              Every decision cascades across three deeply interlinked domains. Balance human readiness against habitat consumables and contingency protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-mono">
            {/* Experience 1: LIVE */}
            <div className="bg-control-navy/90 tech-border p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-panel-blue/50 pb-2">
                  <span className="text-xs text-telemetry-cyan font-bold tracking-wider">EXP-01</span>
                  <Badge variant="telemetry">BIOMEDICAL</Badge>
                </div>
                <div className="flex items-center gap-2 text-offwhite font-heading font-bold text-lg uppercase">
                  <Activity className="h-5 w-5 text-telemetry-cyan" />
                  LIVE – Crew
                </div>
                <p className="font-sans text-xs text-offwhite/70 leading-relaxed">
                  Real-time physiological downlinks for Commander Vance, LMP Chen, Dr. Diallo, and Dr. Lindqvist.
                </p>
                <ul className="text-xs space-y-1.5 text-offwhite/80 pt-2 border-t border-panel-blue/40">
                  <li className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-critical-red shrink-0" />
                    Continuous ECG heart rate & SpO₂ monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5 text-telemetry-cyan shrink-0" />
                    Cognitive readiness & 24.8h sleep debt scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-warning-amber shrink-0" />
                    Acute and cumulative radiation dosimetry (mSv)
                  </li>
                </ul>
              </div>
              <Link to="/live-crew" className="pt-4">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <span>OPEN LIVE CONSOLE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Experience 2: OPERATE */}
            <div className="bg-control-navy/90 tech-border p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-panel-blue/50 pb-2">
                  <span className="text-xs text-nominal-green font-bold tracking-wider">EXP-02</span>
                  <Badge variant="nominal">ECLSS & POWER</Badge>
                </div>
                <div className="flex items-center gap-2 text-offwhite font-heading font-bold text-lg uppercase">
                  <Home className="h-5 w-5 text-nominal-green" />
                  OPERATE – Habitat
                </div>
                <p className="font-sans text-xs text-offwhite/70 leading-relaxed">
                  Control the closed-loop life support machinery keeping the four astronauts alive in extreme vacuum.
                </p>
                <ul className="text-xs space-y-1.5 text-offwhite/80 pt-2 border-t border-panel-blue/40">
                  <li className="flex items-center gap-2">
                    <Wind className="h-3.5 w-3.5 text-nominal-green shrink-0" />
                    56.5 kPa exploration atmosphere & ppCO₂ beds
                  </li>
                  <li className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5 text-telemetry-cyan shrink-0" />
                    Catalytic gray water & urine recovery (93%+)
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-warning-amber shrink-0" />
                    Solar tracking arrays & surface fission micro-reactor
                  </li>
                </ul>
              </div>
              <Link to="/operate-habitat" className="pt-4">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <span>OPEN HABITAT CONSOLE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Experience 3: RESPOND */}
            <div className="bg-control-navy/90 tech-border p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-panel-blue/50 pb-2">
                  <span className="text-xs text-critical-red font-bold tracking-wider">EXP-03</span>
                  <Badge variant="warning">CONTINGENCY</Badge>
                </div>
                <div className="flex items-center gap-2 text-offwhite font-heading font-bold text-lg uppercase">
                  <AlertTriangle className="h-5 w-5 text-warning-amber" />
                  RESPOND – Emergencies
                </div>
                <p className="font-sans text-xs text-offwhite/70 leading-relaxed">
                  Triage emergencies when 1.282-second latency prevents real-time manual control.
                </p>
                <ul className="text-xs space-y-1.5 text-offwhite/80 pt-2 border-t border-panel-blue/40">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-critical-red shrink-0" />
                    Master alarm triage & emergency step checklists
                  </li>
                  <li className="flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5 text-warning-amber shrink-0" />
                    Loss-of-Signal (LOS) occultation management
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-nominal-green shrink-0" />
                    Dynamic flight rules & crew local autonomy override
                  </li>
                </ul>
              </div>
              <Link to="/respond-emergencies" className="pt-4">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <span>OPEN EMERGENCY CONSOLE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Mission Consequence Laboratory */}
      <section id="consequence-lab" className="py-16 sm:py-24 border-b border-panel-blue/50 bg-space-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-control-navy tech-border text-[10px] font-mono text-telemetry-cyan uppercase">
                <GitBranch className="h-3.5 w-3.5" />
                BRANCHING WHAT-IF SANDBOX
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-offwhite">
                Mission Consequence Laboratory
              </h2>
              <p className="font-sans text-sm sm:text-base text-offwhite/70 leading-relaxed">
                What happens if you approve a high-yield core drilling sortie despite rising solar activity? The Consequence Laboratory allows students to snapshot any moment of the mission, fork into alternate timelines, and simulate 48 hours forward.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 font-mono text-xs">
                <div className="p-3 bg-control-navy border border-panel-blue/60 space-y-1">
                  <span className="text-telemetry-cyan font-bold text-sm">Deterministic Physics</span>
                  <p className="text-[11px] text-offwhite/60 font-sans">
                    Every fork branches from identical initial states without stochastic drift.
                  </p>
                </div>
                <div className="p-3 bg-control-navy border border-panel-blue/60 space-y-1">
                  <span className="text-warning-amber font-bold text-sm">Trade-off Analytics</span>
                  <p className="text-[11px] text-offwhite/60 font-sans">
                    Directly compare science point gains against crew health and consumable risks.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Fork Preview */}
            <div className="w-full lg:w-96 bg-control-navy tech-border p-5 font-mono text-xs space-y-3 hud-bracket">
              <div className="flex items-center justify-between border-b border-panel-blue/60 pb-2">
                <span className="text-telemetry-cyan font-bold">TIMELINE FORK #14</span>
                <Badge variant="warning">48H FORECAST</Badge>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2 bg-space-surface border-l-2 border-nominal-green">
                  <span className="text-nominal-green font-bold">Timeline A (Rest):</span>
                  <div className="text-offwhite/70">Readiness: 94% · Science Yield: Baseline</div>
                </div>
                <div className="p-2 bg-space-surface border-l-2 border-warning-amber">
                  <span className="text-warning-amber font-bold">Timeline B (Sortie):</span>
                  <div className="text-offwhite/70">Readiness: 72% · Science: +35% · Dose: +0.09 mSv</div>
                </div>
              </div>

              <Link to="/consequence-lab" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full gap-2">
                  <span>ENTER CONSEQUENCE LAB</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Scientific Data and Educational Assumptions */}
      <section id="science" className="py-16 sm:py-24 border-b border-panel-blue/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-widest">
              RIGOROUS FOUNDATIONS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-offwhite">
              Scientific Data & Educational Assumptions
            </h2>
            <p className="text-sm font-sans text-offwhite/70 leading-relaxed">
              LIGHTTIME does not use fictional numbers. All simulation models are calibrated against peer-reviewed aerospace standards and physical constants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-control-navy border border-panel-blue/60 space-y-2">
              <span className="text-[10px] text-offwhite/50 uppercase block">ORBITAL MECHANICS</span>
              <div className="text-lg font-bold text-offwhite">384,400 KM</div>
              <p className="text-[11px] text-offwhite/70 font-sans leading-relaxed">
                Mean Earth-Moon distance. Yields an exact one-way speed of light delay of τ = d/c = 1.282 seconds.
              </p>
            </div>

            <div className="p-4 bg-control-navy border border-panel-blue/60 space-y-2">
              <span className="text-[10px] text-offwhite/50 uppercase block">NASA-STD-3001 RADIATION</span>
              <div className="text-lg font-bold text-warning-amber">&lt; 250 mSv</div>
              <p className="text-[11px] text-offwhite/70 font-sans leading-relaxed">
                Strict 30-day mission dose ceiling to prevent acute radiation illness and hematopoietic compromise.
              </p>
            </div>

            <div className="p-4 bg-control-navy border border-panel-blue/60 space-y-2">
              <span className="text-[10px] text-offwhite/50 uppercase block">EXPLORATION ATMOSPHERE</span>
              <div className="text-lg font-bold text-nominal-green">56.5 kPa (8.2 psi)</div>
              <p className="text-[11px] text-offwhite/70 font-sans leading-relaxed">
                Target cabin atmosphere with 20.0 kPa normoxic ppO₂ to slash pre-breathe times before surface EVA.
              </p>
            </div>

            <div className="p-4 bg-control-navy border border-panel-blue/60 space-y-2">
              <span className="text-[10px] text-offwhite/50 uppercase block">METABOLIC EXPENDITURE</span>
              <div className="text-lg font-bold text-telemetry-cyan">0.84 kg O₂/day</div>
              <p className="text-[11px] text-offwhite/70 font-sans leading-relaxed">
                Human metabolic rate per astronaut with 1.00 kg CO₂ exhalation and 3.0 L drinking water demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: How the Simulation Works */}
      <section id="architecture" className="py-16 sm:py-24 border-b border-panel-blue/50 bg-space-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-widest">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-offwhite">
              How the Simulation Works
            </h2>
            <p className="text-sm font-sans text-offwhite/70 leading-relaxed">
              Four architectural layers guarantee deterministic execution, realistic network latency, and modular decoupling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="p-5 bg-control-navy tech-border space-y-2">
              <span className="text-telemetry-cyan font-bold text-sm block">01. Discrete Engine</span>
              <p className="text-offwhite/70 font-sans text-xs">
                Pure TypeScript state machine advancing via discrete ticks (Δt = 1.0s). Zero UI dependencies.
              </p>
            </div>

            <div className="p-5 bg-control-navy tech-border space-y-2">
              <span className="text-warning-amber font-bold text-sm block">02. Latency Queue</span>
              <p className="text-offwhite/70 font-sans text-xs">
                Every command enters an uplink buffer, traveling 1.282s to the Moon habitat before execution.
              </p>
            </div>

            <div className="p-5 bg-control-navy tech-border space-y-2">
              <span className="text-nominal-green font-bold text-sm block">03. Autonomous Rules</span>
              <p className="text-offwhite/70 font-sans text-xs">
                In-situ flight safety rules govern rapid emergencies if light-time prevents manual Earth intervention.
              </p>
            </div>

            <div className="p-5 bg-control-navy tech-border space-y-2">
              <span className="text-offwhite font-bold text-sm block">04. Reactive State</span>
              <p className="text-offwhite/70 font-sans text-xs">
                Zustand stores synchronize immutable snapshots directly into aerospace telemetry widgets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Start Mission CTA Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden border-b border-panel-blue/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="p-8 sm:p-12 bg-control-navy/90 tech-border hud-bracket space-y-6">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-widest">
              MISSION READINESS VERIFIED · GO FOR FLIGHT
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-offwhite">
              Assume Command of Expedition 30
            </h2>

            <p className="font-sans text-sm sm:text-base text-offwhite/80 max-w-2xl mx-auto leading-relaxed">
              Your four astronauts are suited in the airlock at Shackleton Base. The lunar dawn is breaking over the south polar highlands. Are you ready to lead?
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/setup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  <Rocket className="h-4 w-4" />
                  <span>START MISSION (SETUP & BRIEFING)</span>
                </Button>
              </Link>
              <Link to="/overview">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                  <span>ENTER ACTIVE MISSION CONTROL</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-6 text-[10px] font-mono text-offwhite/50">
              <span>✓ 4/4 ASTRONAUTS CERTIFIED</span>
              <span>✓ ECLSS CLOSED-LOOP NOMINAL</span>
              <span>✓ DSN GOLDSTONE S-BAND LOCKED</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Project Credits and Educational Disclaimer */}
      <footer className="py-12 bg-space-darker text-offwhite/60 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-panel-blue/40 pb-6">
            <div className="flex items-center gap-3">
              <MissionInsignia size="sm" />
              <div>
                <span className="font-heading text-sm font-bold text-offwhite uppercase">
                  LIGHTTIME
                </span>
                <p className="text-[10px] text-offwhite/40">
                  Human-Centred Autonomous Lunar Mission Simulator
                </p>
              </div>
            </div>

            <div className="text-[11px] text-offwhite/50 text-center md:text-right">
              Curriculum Reference: STEM Aerospace Engineering & Space Medicine
            </div>
          </div>

          <div className="text-[11px] leading-relaxed text-offwhite/40 space-y-2">
            <p>
              <strong>Educational Simulation Disclaimer:</strong> LIGHTTIME is an independent educational simulation application designed for university and secondary school aerospace curricula. It is inspired by publicly accessible NASA technical literature (including NASA-STD-3001, NASA SP-2008-540, and NASA Exploration Atmospheres Technical Interchange guidelines). This software is not an official NASA product, does not copy official agency insignia, and does not claim or imply official NASA sponsorship or endorsement.
            </p>
            <p>
              Built with React 18, TypeScript, Tailwind CSS, Zustand, Zod, and Vitest.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
