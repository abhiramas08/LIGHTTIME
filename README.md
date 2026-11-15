# LIGHTTIME: Human-Centred Autonomous Lunar Mission Simulator

> **An Educational Lunar Mission Command & Human-Factors Simulation Platform**  
> Students act as Mission Commanders at Earth Mission Control, overseeing a four-member astronaut crew during a critical 30-day lunar surface expedition.

---

## 🛰️ Overview

**LIGHTTIME** is a web-based educational simulation platform designed to teach aerospace engineering, space medicine, and human-in-the-loop autonomous operations. Students confront the realities of human spaceflight:

1. **Light-Time Latency:** Communications between Earth and the Moon experience a ~1.28 to 1.30-second one-way delay (~2.6-second round trip). Commanders cannot "joystick" operations; they must set policies, approve autonomous flight rules, and rely on crew autonomy when anomalies develop rapidly.
2. **Human Factors & Crew Well-being:** Unlike mechanical simulations, astronauts suffer from circadian disruption, cumulative fatigue, radiation dose limits, microgravity/partial-gravity adaptation, and psychological stress.
3. **Closed-Loop Life Support & Consumables:** Management of oxygen generation, $CO_2$ scrubbing, water reclamation, metabolic caloric intake, thermal balance, and power grids across 30 lunar mission days.
4. **Mission Decision Architecture:** Balance science discovery yield (drilling, EVA regolith collection, astronomical observations) against crew safety margins and equipment health.

*Disclaimer: LIGHTTIME is an independent educational simulator developed for teaching autonomous mission architecture and human factors. It is inspired by public aerospace engineering standards and scientific literature; it does not display official NASA insignia or claim official agency affiliation.*

---

## 🏛️ System Architecture

LIGHTTIME enforces strict architectural boundaries to guarantee modularity, deterministic simulation testing, and testability without UI couplings:

```
src/
├── app/                  # Application bootstrap, routing, and providers
├── components/           # Shared UI component library
│   ├── layout/           # MissionHeader, MissionSidebar, AppLayout
│   ├── common/           # Atomic design system (Button, Card, Badge, Table, etc.)
│   ├── charts/           # Telemetry charts, sparklines, radar diagrams
│   └── mission/          # Domain UI widgets (CrewCard, LatencyIndicator, METClock)
├── features/             # Feature modules (views & command consoles)
│   ├── dashboard/        # Mission Overview, MET, high-level status
│   ├── live/             # Real-time telemetry streams & sensor panels
│   ├── operate/          # Crew scheduling, timeline, task assignment
│   ├── respond/          # Anomaly management, alert triage, contingency procedures
│   ├── consequence-lab/  # Branching "What-If" scenario simulation sandbox
│   ├── mission-history/  # Timeline playback, event logs, post-mission telemetry review
│   ├── science-data/     # Experiments, geological samples, science telemetry yield
│   └── settings/         # Simulation speed, audio alerts, API integrations
├── simulation/           # Pure deterministic simulation engine (NO React dependencies)
│   ├── engine/           # State machine, tick loop, time acceleration, solvers
│   ├── models/           # Domain models: CrewMember, HabitatECLSS, PowerGrid, Comms
│   ├── rules/            # Flight rules, medical limits, safety interlocks
│   ├── scenarios/        # Pre-configured 30-day curriculum scenarios & emergencies
│   ├── commands/         # Uplink command pipeline with light-time queuing & ACKs
│   ├── validation/       # Zod schemas for commands, telemetry, and crew stats
│   └── tests/            # Vitest unit & integration test suites
├── store/                # Zustand stores bridging simulation engine with React UI
├── services/             # External integration adapters (NASA Open APIs, Supabase)
│   ├── nasa/             # Space weather (DONKI) & ephemeris data adapters
│   └── supabase/         # Multi-student session archives & state persistence
├── data/                 # Static catalogs and calibration baselines
│   ├── scenarios/        # Scenario JSON definitions
│   ├── crew/             # Astronaut profiles, skills, baseline biometrics
│   └── assumptions/      # Scientific constants, metabolic rates, ECLSS efficiencies
├── hooks/                # Custom React hooks (useMET, useTelemetry, useLatency)
├── utils/                # Mathematical, time formatting, and styling helpers
└── styles/               # Global CSS, Tailwind configurations, design tokens
```

---

## 🎨 Design System

LIGHTTIME employs an aerospace-grade command interface characterized by high data density, thin technical borders, restrained status glows, and strict ergonomic hierarchy.

### Color Palette
- **Deep Space** (`#07111F`): Primary viewport backdrop
- **Control Navy** (`#10243A`): Secondary console surfaces and panels
- **Panel Blue** (`#193B59`): Card backgrounds, division borders, header panels
- **Telemetry Cyan** (`#43C6E8`): Primary data readouts, active status, telemetry highlights
- **Off-white** (`#F2F4F5`): Primary textual content, labels, crisp readings
- **Warning Amber** (`#F5A623`): Caution alerts, sub-optimal parameters, delay indicators
- **Critical Red** (`#E05252`): Life support hazards, critical anomalies, abort triggers
- **Nominal Green** (`#45B77A`): Systems GO, nominal crew vitals, verified links

### Typography
- **Headings:** Space Grotesk
- **Interface & Body:** Inter
- **Telemetry & Technical Data:** IBM Plex Mono

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd nasaproject

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Development Scripts
```bash
# Launch Vite development server
npm run dev

# Run strict TypeScript type check & build bundle
npm run build

# Run unit and integration tests
npm test

# Run tests with interactive UI
npm run test:watch
```

---

## 🔬 Scientific Foundations
See [SCIENCE_ASSUMPTIONS.md](file:///Users/neenajayan/nasaproject/SCIENCE_ASSUMPTIONS.md) for the mathematical, physiological, and environmental equations governing the simulation engine.
