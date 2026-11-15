# LIGHTTIME: Engineering Development & Architecture Plan

## 1. Architectural Principles & Boundaries

The simulator architecture strictly separates presentation from the deterministic physics/human-factors simulation engine:

```
[ External APIs ] (NASA DONKI / Ephemeris, Supabase)
       ▲
       │ async fetch / sync
       ▼
[ Services Layer ] (src/services/*)
       ▲
       │ clean DTOs & telemetry packets
       ▼
[ Simulation Engine ] (src/simulation/engine/*)
  ├── Pure TypeScript mathematical solvers
  ├── Deterministic tick loop (Fixed Δt)
  ├── Human-factors state updates (fatigue, radiation, circadian, vitals)
  ├── Environmental Control & Life Support System (ECLSS) dynamics
  └── Light-time command queue (1.28s - 1.30s latency buffer)
       ▲
       │ Dispatches immutable snapshots
       ▼
[ Store Layer ] (src/store/* - Zustand)
  ├── Synchronizes simulation state into reactive stores
  ├── Manages command dispatching with transmission timestamping
  └── UI preferences, active view, filter states
       ▲
       │ Selectors & actions
       ▼
[ Presentation Layer ] (src/features/*, src/components/*)
  ├── Pure React components, styled via Tailwind CSS tokens
  ├── High-density mission control dashboards
  └── Real-time charts, telemetry gauges, interactive scheduling
```

### Strict Boundary Rules
1. **Simulation Engine has ZERO React imports:** All files under `src/simulation/` must remain pure TypeScript. They must run identically in a Node.js process, web worker, or Vitest suite without browser DOM dependencies.
2. **Deterministic Time-Stepping:** The simulation engine advances state via discrete ticks (`tick(state, dt)`). Replaying identical inputs and seeds produces bit-for-bit identical outcomes.
3. **Command Latency Queue:** Any command initiated by the student does not alter Moon habitat state immediately. It enters the `UplinkQueue`, stays in transit for `t_delay = distance / c`, is executed by the autonomous lunar habitat or crew, and telemetry confirming execution takes another `t_delay` to reflect on Earth dashboards.

---

## 2. Phase-by-Phase Roadmap

### Phase 1: Foundation, Design System & Scaffold (Completed)
- [x] Initialized React 18 + TypeScript + Vite project with strict compiler settings.
- [x] Configured Tailwind CSS with custom mission control color palette (Deep Space, Control Navy, Panel Blue, Telemetry Cyan, etc.).
- [x] Embedded Space Grotesk, Inter, and IBM Plex Mono typography.
- [x] Implemented atomic design system components (`Button`, `Card`, `Badge`, `TechnicalLabel`, `Table`, `Tabs`, `Dialog`, `Tooltip`, `Alert`, `LoadingState`, `EmptyState`).
- [x] Structured scalable directory tree (`src/app`, `components`, `features`, `simulation`, `store`, `services`, `data`, `hooks`, `utils`, `styles`).
- [x] Setup Vitest and React Testing Library test harness with path aliases.
- [x] Authored architectural blueprints and scientific assumption specifications.

### Phase 2: Deterministic Simulation Engine & Human Factors Models
- [ ] Core Simulation Loop (`SimulationEngine` class):
  - Configurable tick rate (default: 1 second simulation time per tick, with 1x, 5x, 60x, 3600x time-warp modes).
- [ ] Astronaut Physiological & Cognitive Models:
  - Sleep debt and 24.8-hour circadian rhythm tracking.
  - Cognitive fatigue index based on workload, sleep quality, and stress.
  - Acute and cumulative radiation dosage ($mSv$) calculation.
  - Caloric, hydration, and metabolic expenditure rates.
- [ ] Habitat ECLSS Model:
  - Atmospheric pressure ($101.3\text{ kPa}$ or $56.5\text{ kPa}$ exploration atmosphere).
  - Partial pressures: $ppO_2$, $ppCO_2$, water vapor, nitrogen buffer.
  - Sabatier reactor and carbon dioxide removal assembly (CDRA) simulation.
  - Potable, hygiene, and gray water loop balance.
- [ ] Power & Thermal Model:
  - Solar array tracking and lunar day/night thermal transition (14 Earth days daylight, 14 Earth days night).
  - Surface fission reactor / fuel cell backup discharge curves.

### Phase 3: Light-Time Communications & Autonomous Command Protocol
- [ ] Ground-to-Moon Transmission Model:
  - Dynamic lunar distance calculation ($363,300\text{ km}$ to $405,500\text{ km}$).
  - One-way light-time calculation: $\tau = d / c$ ($1.21\text{ s}$ to $1.35\text{ s}$).
  - Round-trip acknowledgment delay ($2\tau \approx 2.56\text{ s} - 2.70\text{ s}$).
- [ ] Uplink & Downlink Pipeline:
  - Queued commands with transmission timestamp and execution schedule.
  - Loss-of-Signal (LOS) periods during lunar orbital occultations or Deep Space Network handover.
- [ ] Autonomous Rule Engine:
  - "Crew Discretion" protocol: when time-critical emergency occurs (e.g. rapid cabin depressurization), crew executes automated emergency flight rules without waiting for Earth permission.

### Phase 4: Core Feature Modules
- [ ] **Dashboard Feature (`src/features/dashboard`)**:
  - Mission Elapsed Time (MET) clock: `DAY:HR:MIN:SEC`.
  - Four-member crew status cards: vitals, readiness score, current task.
  - Master alarm status and active caution indicators.
  - 30-day mission progress timeline.
- [ ] **Live Telemetry Console (`src/features/live`)**:
  - Real-time environmental readings (Atmosphere, Thermal, Power, ECLSS).
  - High-frequency sparklines and trend charts with Recharts.
- [ ] **Operate Feature (`src/features/operate`)**:
  - 24-hour crew activity scheduler (EVA, Habitat Maintenance, Science, Sleep, Meal, Exercise).
  - Workload balance validator to prevent crew burnout.
- [ ] **Respond Feature (`src/features/respond`)**:
  - Anomaly checklist and procedural step-by-step resolution.
  - Crew autonomy toggle and emergency override authorizations.

### Phase 5: Consequence Lab & Educational Curriculum
- [ ] **Consequence Lab (`src/features/consequence-lab`)**:
  - Branching "What-If" sandbox allowing students to clone the current mission state, tweak a decision (e.g., extend EVA by 2 hours vs. abort due to solar particle event warning), and simulate 48 hours forward to inspect consequences.
- [ ] **Science Data Console (`src/features/science-data`)**:
  - Geological sample catalog (regolith cores, basalt specimens, permanently shadowed region ice samples).
  - Research yield analytics.
- [ ] **Mission History & Debrief (`src/features/mission-history`)**:
  - Black-box recorder event log.
  - Mission score card: Crew Health Score, Science Achievement Score, Resource Efficiency Score.

### Phase 6: External APIs, Persistence & Multi-Student Deployment
- [ ] NASA DONKI API integration for live Solar Flare and Coronal Mass Ejection (CME) data feeds.
- [ ] Supabase backend integration for classroom mission sharing, leaderboards, and instructor grading rubrics.

---

## 3. Testing & Verification Strategy

1. **Deterministic State Tests:** Verify that executing 1,000 ticks from identical initial states yields bit-exact equivalence.
2. **Human Factors Boundary Tests:** Ensure extreme conditions (zero water intake, prolonged sleep deprivation) produce medical alarms and cognitive degradation within validated physiological thresholds.
3. **Latency Verification:** Assert that commands dispatched at $t_0$ do not execute before $t_0 + \tau$, and telemetry reflecting state changes is not visible to the student before $t_0 + 2\tau$.
4. **UI Accessibility & Responsiveness:** Strict ARIA labelling on mission alarms, keyboard navigation for command confirmation, and WCAG AA color contrast compliance.
