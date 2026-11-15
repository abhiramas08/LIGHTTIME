# LIGHTTIME: Human-Centred Autonomous Lunar Mission Simulator

> **An Educational Lunar Mission Command, Life-Support & Human-Factors Simulation Platform**  
> Students act as Mission Commanders at Earth Mission Control or Autonomous Habitat Directors, overseeing a four-member astronaut crew during a high-stakes 30-day lunar surface expedition under realistic light-time communication latency.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: 5.5](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite: 5.4](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vitest: 2.1](https://img.shields.io/badge/Vitest-2.1-green.svg)](https://vitest.dev/)
[![Database: Zero-DB](https://img.shields.io/badge/Database-Zero--DB%20(Pure%20Local)-brightgreen.svg)]()
[![Deploy: Vercel Ready](https://img.shields.io/badge/Deploy-Vercel%20Ready-black.svg)]()

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Objectives](#2-project-objectives)
3. [Main Features](#3-main-features)
4. [Technology Stack](#4-technology-stack)
5. [Project Architecture](#5-project-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Installation Instructions](#7-installation-instructions)
8. [Development Setup](#8-development-setup)
9. [Environment Configuration](#9-environment-configuration)
10. [Running the Application Locally](#10-running-the-application-locally)
11. [Testing Instructions](#11-testing-instructions)
12. [Build Instructions](#12-build-instructions)
13. [Deployment Instructions (Vercel)](#13-deployment-instructions-vercel)
14. [Storage and Persistence Explanation](#14-storage-and-persistence-explanation)
15. [Simulation Engine Explanation](#15-simulation-engine-explanation)
16. [Known Limitations](#16-known-limitations)
17. [Future Improvements](#17-future-improvements)

---

## 1. Project Overview

**LIGHTTIME** is an aerospace-grade, web-based simulation and educational platform built to teach aerospace engineering, space medicine, environmental life-support systems (ECLSS), and autonomous mission architectures.

Unlike simplistic arcade simulations, LIGHTTIME places learners in the role of Earth Mission Control or Habitat Autonomous Systems Directors managing the *Artemis Base Camp* expedition on the lunar South Pole (Shackleton Crater rim). The mission challenges students with four fundamental realities of human interplanetary spaceflight:

1. **Light-Time Latency:** Communications between Earth and the Moon incur a physical speed-of-light delay (~1.28 to 1.30 seconds one-way; ~2.6 seconds round-trip). Because direct real-time teleoperation is impossible, students must design robust flight rules, pre-authorize contingency protocols, and rely on crew-directed autonomy when emergencies strike.
2. **Human Factors & Bio-Astronautics:** Astronauts are not machines. They experience circadian rhythm disruption, cumulative cognitive and physical fatigue, radiation exposure (GCR & SPE events), microgravity/partial-gravity muscular deconditioning, and high-stress interpersonal dynamics.
3. **Closed-Loop Consumables & Environmental Physics:** Closed-loop ECLSS thermodynamics: catalytic Sabatier reactors, Bosch carbon dioxide scrubbers, water reclamation systems (WRS), multi-junction photovoltaic arrays, fuel cell storage, and metabolic oxygen consumption.
4. **Autonomous Emergency Response:** Real-time triage of solar particle events (SPE), micrometeoroid impacts, ECLSS depressurization, coolant loop failures, and power brownouts under strict safety bounds and flight operational procedures.

*Disclaimer: LIGHTTIME is an independent educational simulator developed for teaching human-in-the-loop autonomous space mission operations. It incorporates publicly available NASA technical standards, Human Research Program (HRP) evidence, and DONKI scientific datasets. It is not officially endorsed by or affiliated with NASA.*

---

## 2. Project Objectives

- **Pedagogical Fidelity:** Deliver an authentic mission operations training tool that models realistic physical, physiological, and communications constraints without dumbing down the science.
- **Zero-Barrier Public Access:** Ensure 100% public accessibility. No logins, no passwords, no mandatory user accounts, and no paywalls. Any student, educator, or researcher can open the platform and launch a mission immediately.
- **Zero-Database Architecture:** Eliminate external database dependencies (such as PostgreSQL or Supabase) to guarantee seamless local execution, rapid serverless deployment to CDNs/Vercel, and total privacy with no collection of personal data.
- **Deterministic & Verifiable Simulation:** Maintain complete separation between the physics simulation engine and the UI layer. Every simulation tick is pure, deterministic, and replayable from initial conditions and timestamped command logs.
- **Curriculum-Grounded AI Assistance:** Provide a transparent, strictly read-only AI Mission Instructor that answers complex questions, explains resource depletion curves, critiques contingency responses, and highlights documented NASA scientific assumptions without hallucinations.

---

## 3. Main Features

### 🌐 Instant Public Access & Zero Authentication
- Direct landing page access with one-click mission start.
- No sign-up, login, email verification, or session timeouts.
- All telemetry, active states, and scenario archives reside securely in the user's browser via LocalStorage with automated JSON telemetry export and import.

### ⏱️ Real-Time & Accelerated Simulation Engine
- Configurable simulation speeds: 1x (real-time), 5x, 15x, and 60x time compression.
- Clock controls: Pause, Resume, Tick Advance, and Mission Reset.
- Strict conservation laws for mass, energy, and atmospheric partial pressures.

### 📡 LIVE Console (Mission Control Telemetry)
- Real-time telemetry streams for atmospheric composition ($O_2$, $CO_2$, $N_2$, Cabin Pressure).
- ECLSS status, thermal loop loops, and power generation (Solar PV vs. Fuel Cells).
- Dynamic speed-of-light link status displaying uplink/downlink signal latency, carrier lock, and queued telemetry packets.

### 🛠️ OPERATE Console (Habitat & Crew Operations)
- Interactive crew shift scheduling (EVA, Habitat Maintenance, Research, Rest, Exercise).
- Life support equipment controls (Electrolysis, Sabatier Reactor, Trace Contaminant Control, Water Processor).
- Resource rationing and emergency conservation mode toggles.

### 🚨 RESPOND Console (Anomaly Triage & Flight Rules)
- Real-time emergency detection and caution & warning alert system.
- Flight rule execution matrix with automated interlocks.
- Step-by-step emergency checklists for solar storms, depressurization, airlock seal breaches, and coolant leaks.

### 🧪 Consequence Laboratory ("What-If" Branching Sandbox)
- Isolate any active or saved mission state into an immutable sandbox.
- Run deterministic multi-variable parametric experiments:
  - Atmospheric leak rate testing.
  - Solar array degradation and dust occlusion.
  - Crew sleep deprivation and cognitive degradation analysis.
- Compare branching outcomes against nominal baselines using overlaid telemetry graphs.

### ⏪ Deterministic Mission History & Replay
- Full flight data recorder capturing initial mission snapshots, user uplink actions, and automated simulation events.
- Bit-accurate replay engine that reruns the deterministic simulation from initial conditions without mutating original archives.
- Side-by-side run comparison engine evaluating crew survival, resource conservation, and scientific yield.

### 📊 Mission Debrief & Post-Mission Analysis
- Comprehensive post-mission scoring: Crew Safety Index, Resource Efficiency Score, and Protocol Compliance.
- Detailed timeline logs of all commander decisions and emergency resolutions.
- Longitudinal biometric and psychological stress degradation analysis.

### 🛰️ LIGHTTIME Science & Data Centre
- Direct integration with NASA Space Weather APIs (DONKI: Solar Flares, CMEs, SEP events, Geomagnetic Storms) with request caching, rate-limiting, and offline fallbacks.
- Curated reference catalogues from NASA LOLA (elevation & terrain), OSDR (Open Science Data Repository), and NASA Human Research Program (HRP).
- **Science Assumptions Register:** Comprehensive transparency registry documenting all simplified educational formulas (e.g., metabolic rates, WRS recovery coefficients) alongside their scientific rationale and limitations.

### 🤖 Read-Only AI Mission Instructor
- Context-aware educational assistant powered by a secure server-side endpoint (`/api/instructor`) with deterministic offline pedagogical fallbacks.
- **Four Integrated Modalities:**
  1. *Ask the Mission Instructor:* Natural language dialogue explaining complex orbital mechanics, life-support chemistry, or crew psychology.
  2. *Explain This Event:* Contextual explanation of logged events and system milestones.
  3. *Explain This Warning:* Root-cause breakdown of active cautions and alarms with physiological consequences.
  4. *Post-Mission Learning Feedback:* Socratic debriefing critiquing commander strategies and flight rule applications.
- **Strict Read-Only Guarantee:** The AI assistant cannot mutate mission state, execute commands, alter resource inventories, or fabricate citations.

---

## 4. Technology Stack

| Category | Technology | Description |
|---|---|---|
| **Core Framework** | React 18.3 | Concurrent rendering, functional components, hooks |
| **Language** | TypeScript 5.5 | Strict type safety, interface-driven domain models |
| **Build & Tooling** | Vite 5.4 | Ultra-fast HMR, optimized Rollup bundling, custom dev server plugins |
| **State Management**| Zustand 4.5 + Immer | Lightweight reactive state stores with immutable mutations |
| **Data Validation** | Zod 3.23 | Strict runtime schema parsing for state, commands, and telemetry |
| **Styling & UI** | Tailwind CSS 3.4 | Atomic utility styling, custom aerospace theme tokens |
| **Icons & Visuals** | Lucide React | Crisp, consistent aerospace vector iconography |
| **Data Visualization**| Recharts 2.12 | Responsive telemetry charts, sparklines, and area plots |
| **Test Framework** | Vitest 2.1 | Blazing fast unit and integration testing engine |
| **Testing DOM** | React Testing Library + jsdom | User-centric UI testing and simulated DOM events |
| **Deployment Target**| Vercel | Global Edge CDN with zero-config SPA rewrites and security headers |

---

## 5. Project Architecture

LIGHTTIME follows a clean, decoupled layered architecture that isolates pure mathematical simulation models from UI components, state stores, and external integrations:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                         UI LAYER                               │   │
│   │   [TopNavbar] [AppLayout] [METClock] [AlertsDrawer]            │   │
│   │   Views: Landing | LIVE | OPERATE | RESPOND | ConsequenceLab   │   │
│   │          MissionHistory | Debrief | ScienceData | Settings     │   │
│   │   AI Components: [AiInstructorDrawer] [EventDetailsModal]      │   │
│   └───────────────────────────────▲────────────────────────────────┘   │
│                                   │ Reactive Hooks                     │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                       STATE LAYER (Zustand)                    │   │
│   │   • useMissionStore        - Active simulation state & clock   │   │
│   │   • useInstructorStore     - AI pedagogical dialogues & prompts│   │
│   │   • useMissionHistoryStore - Mission snapshots & replay records│   │
│   └───────────────────────────────▲────────────────────────────────┘   │
│                                   │ State Actions & Solvers            │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                  PURE SIMULATION ENGINE                        │   │
│   │   • core.ts                - Deterministic tick engine         │   │
│   │   • replayEngine.ts        - Bit-accurate replay & diffing     │   │
│   │   • ECLSS / Power / Comms  - Mass balance & energy solvers     │   │
│   │   • Crew Physiology        - Fatigue, circadian & stress models│   │
│   │   • validation/            - Zod schemas for strict state parse│   │
│   └───────────────────────────────▲────────────────────────────────┘   │
│                                   │ Data Adapters                      │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │              SERVICES & DATA INTEGRATION LAYER                 │   │
│   │   • nasa/donkiService.ts   - Space weather feeds & fallbacks   │   │
│   │   • scientific/            - LOLA elevation & HRP literature   │   │
│   │   • aiInstructorEngine.ts  - Context payload builder & fallback│   │
│   │   • LocalStorage Storage   - Versioned local browser store     │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTP POST /api/instructor (Optional)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND / SERVERLESS API                        │
│   • vite.config.ts (Dev) / Vercel Serverless Function (Production)     │
│   • instructorApiHandler.ts - Server-side key protection & rate limit  │
│   • Deterministic Pedagogical Rule Engine (100% offline fallback)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Folder Structure

```
nasaproject/
├── .env.example                     # Environment template (all optional)
├── index.html                       # Application HTML entrypoint
├── package.json                     # Dependencies, scripts, and engine configs
├── tsconfig.json                    # Strict TypeScript compiler options
├── tsconfig.app.json                # Frontend TypeScript project configuration
├── tsconfig.node.json               # Build tooling TypeScript configuration
├── vercel.json                      # Vercel SPA routing and security header specs
├── vite.config.ts                   # Vite configuration with chunk splitting & dev API
│
├── public/                          # Static assets and favicons
│
└── src/
    ├── app/                         # Application bootstrap & route configurations
    ├── components/                  # Reusable UI component library
    │   ├── alerts/                  # Alert badges, modals, and AlertsDrawer
    │   ├── common/                  # Buttons, cards, badges, indicators
    │   ├── events/                  # Event log viewers and EventDetailsModal
    │   ├── instructor/              # AI Mission Instructor drawer & widgets
    │   ├── layout/                  # TopNavbar, AppLayout, METClock
    │   └── mission/                 # Telemetry panels, CrewCards, CommsLagBar
    │
    ├── data/                        # Static datasets, baselines, and catalogues
    │   ├── crew/                    # Baseline astronaut profiles & bio stats
    │   ├── mission/                 # Default missions & saved scenario runs
    │   ├── scenarios/               # Standard 30-day curriculum scenario configs
    │   ├── science/                 # Science sources & educational assumptions register
    │   └── scientific-fallbacks/    # Offline NASA DONKI, LOLA & HRP cache data
    │
    ├── features/                    # Feature modules & main user consoles
    │   ├── consequence-lab/         # What-if branching sandbox & parametric sweeps
    │   ├── dashboard/               # High-level mission overview & telemetry status
    │   ├── debrief/                 # Post-mission scoring & decision analysis
    │   ├── landing/                 # Public zero-auth landing page & scenario picker
    │   ├── live/                    # Real-time sensor telemetry & cabin monitors
    │   ├── mission-history/         # Saved run history, run comparator & replays
    │   ├── operate/                 # Crew schedule & habitat equipment management
    │   ├── respond/                 # Emergency procedures & caution/warning triage
    │   ├── science-data/            # Scientific sources viewer & assumptions register
    │   └── settings/                # Simulation speed, audio alerts & JSON backup
    │
    ├── server/                      # Serverless backend request handlers
    │   └── instructorApiHandler.ts  # Node/Vercel POST /api/instructor handler
    │
    ├── services/                    # External service adapters & educational engines
    │   ├── ai/                      # AI Instructor engine, context builder, types
    │   ├── nasa/                    # NASA DONKI space weather client with caching
    │   └── scientific/              # LOLA, OSDR, and HRP scientific adapters
    │
    ├── simulation/                  # Pure deterministic physics & biological models
    │   ├── engine/                  # Core tick loop, clock, solvers, replay engine
    │   ├── models/                  # Domain types: MissionState, Crew, Resources
    │   ├── rules/                   # Flight rules, medical thresholds, interlocks
    │   ├── scenarios/               # Scenario generators and emergency triggers
    │   ├── tests/                   # 18 comprehensive Vitest automated test suites
    │   └── validation/              # Zod validation schemas for all mission objects
    │
    ├── store/                       # Zustand application state management
    │   ├── useInstructorStore.ts    # AI instructor UI state & conversation threads
    │   ├── useMissionHistoryStore.ts# Replay records, saved runs, run comparisons
    │   └── useMissionStore.ts       # Active mission state, telemetry, and actions
    │
    ├── styles/                      # Tailwind CSS entrypoint and custom utility classes
    └── utils/                       # Time formatters, math utilities, export helpers
```

---

## 7. Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (v9.0.0+) or `yarn` / `pnpm`
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (supporting ES2022 and modern CSS Grid/Flexbox)

### Step-by-Step Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/nasaproject.git
cd nasaproject

# 2. Install all dependencies
npm install
```

---

## 8. Development Setup

Start the local Vite development server with Hot Module Replacement (HMR) and embedded `/api/instructor` mock proxy:

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:5173
```

---

## 9. Environment Configuration

LIGHTTIME is fully functional **without setting any environment variables**. All external APIs gracefully fall back to embedded NASA scientific cache baselines, and the AI Mission Instructor automatically operates via a built-in pedagogical rule engine.

To connect live upstream services, create a `.env` file in the project root:

```bash
cp .env.example .env
```

### Available Variables

```ini
# Optional: Upstream AI API Key for real-time model synthesis
# (Kept securely on the server; NEVER exposed in frontend code)
AI_INSTRUCTOR_API_KEY=

# Optional: Upstream AI endpoint URL (defaults to Gemini 1.5 Flash endpoint)
AI_INSTRUCTOR_ENDPOINT=

# Optional: NASA Open Data Portal API Key (defaults to DEMO_KEY if blank)
VITE_NASA_API_KEY=DEMO_KEY

# Application environment mode
VITE_APP_ENV=development
```

> 🔒 **Security Notice:** Supabase environment variables have been completely removed. No database connection strings or secret service keys exist in the repository.

---

## 10. Running the Application Locally

1. **Start Development Server:**
   ```bash
   npm run dev
   ```
2. **Open in Browser:** Navigate to `http://localhost:5173`.
3. **Select a Mission Scenario:** Click **"LAUNCH EXPEDITION"** or choose one of the pre-configured scenarios (e.g., *Nominal Expedition*, *Solar Particle Event*, *ECLSS Depressurization*).
4. **Interact with the Consoles:**
   - Use **LIVE** to monitor telemetry and light-time delay.
   - Use **OPERATE** to alter crew assignments and life-support machinery.
   - Use **RESPOND** to execute emergency checklists when alarms sound.
   - Click the **AI Mission Instructor** icon (top right) or contextual **"Explain This Event / Warning"** buttons to receive real-time pedagogical explanations.

---

## 11. Testing Instructions

LIGHTTIME features a comprehensive automated test suite consisting of **18 test files** and **250+ individual tests** covering physics, physiological rules, emergency branches, store synchronization, replay invariance, and AI instructor capabilities.

### Run All Tests
```bash
npm test -- --run
```

### Run Tests with Interactive Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI Dashboard
```bash
npm run test:ui
```

### Run Specific Test Suite
```bash
# Test AI Mission Instructor features
npx vitest run src/simulation/tests/aiMissionInstructorFeatures.test.tsx

# Test Deterministic Replay Engine
npx vitest run src/simulation/tests/missionHistoryAndReplay.test.tsx

# Test NASA Scientific Data Integration
npx vitest run src/simulation/tests/scientificDataIntegration.test.ts
```

---

## 12. Build Instructions

Compile and package the production bundle with strict TypeScript type checking:

```bash
npm run build
```

### Bundle Output Structure
Vite bundles the application into the `dist/` directory using granular vendor chunking:
- `dist/assets/vendor-react-*.js`: React, React-DOM core runtime (~163 kB)
- `dist/assets/vendor-charts-*.js`: Recharts visualization library (~407 kB)
- `dist/assets/vendor-icons-*.js`: Lucide icons collection (~40 kB)
- `dist/assets/vendor-utils-*.js`: Zod schema validation & date-fns (~54 kB)
- `dist/assets/index-*.js`: Application code and simulation models (~777 kB)

### Test the Production Build Locally
```bash
npm run preview
```
Serves the generated `dist/` folder on `http://localhost:4173`.

---

## 13. Deployment Instructions (Vercel)

LIGHTTIME is engineered for zero-configuration, one-click deployment to **Vercel** as a static single-page application with optional serverless edge API routing.

### Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy directly from repository root
vercel
```

### Deploy via Vercel Git Integration
1. Push your code to your GitHub/GitLab repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `nasaproject` repository.
4. The deployment settings will be detected automatically:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **"Deploy"**.

### Vercel Routing Configuration (`vercel.json`)
The included `vercel.json` provides:
- Single-page application route rewrites (`/(.*)` -> `/index.html`).
- Cache-control optimization for immutable hashed assets (`max-age=31536000, immutable`).
- Strict HTTP security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 14. Storage and Persistence Explanation

LIGHTTIME implements a **Zero-Database (Local-First)** architecture:

1. **Browser LocalStorage Persistence:**
   - Active mission telemetry, commander preferences, and saved runs are serialized under isolated keys (`lighttime_mission_state_v1`, `lighttime_saved_runs_v1`).
   - All state is version-tagged to facilitate automatic schema migrations.
2. **Quota & Corruption Resilience:**
   - In private browsing modes or when browser storage is restricted, the storage adapter automatically catches quota exceptions and falls back gracefully to in-memory state, ensuring unhindered gameplay.
   - Corrupted storage strings are automatically detected, quarantined, and safely reset to default baselines without crashing the UI.
3. **Mission Telemetry Backup & Restore (JSON):**
   - Commanders can export full mission telemetry and snapshot logs to a portable `.json` file at any time from the **Settings** view.
   - Imported JSON archives are rigorously validated against the `missionStateSchema` (Zod) before hydrating the application state, preventing malformed state injection.

---

## 15. Simulation Engine Explanation

The simulation engine (`src/simulation/engine/core.ts`) executes a deterministic discrete-time solver modeled after real human spaceflight engineering:

- **Atmospheric & Consumables Solver:**
  - Cabin pressure is governed by the Ideal Gas Law: $PV = nRT$.
  - Metabolic consumption follows NASA-STD-3001: $0.84\text{ kg } O_2/\text{crew-day}$ at nominal activity ($1.2\times$ during EVA; $0.7\times$ during sleep).
  - $CO_2$ generation: $1.00\text{ kg } CO_2/\text{crew-day}$. Carbon Dioxide scrubbers (CDRA) operate with a $95\%$ continuous removal efficiency.
  - Water balance: $2.5\text{ kg } H_2O/\text{crew-day}$ consumption with $90\%$ greywater/urine reclamation efficiency in the Water Recovery System (WRS).
- **Power Grid Solver:**
  - Multi-junction solar array output is coupled to the lunar day/night cycle (354 hours of continuous daylight followed by 354 hours of lunar night at the equator; partially mitigated at South Pole high-rim sites).
  - Secondary power storage uses Regenerative Fuel Cells (RFC) with charging/discharging round-trip efficiency of $75\%$.
- **Bio-Astronautics & Human Performance:**
  - Crew fatigue compounds exponentially with sustained wakefulness past 16 hours and sleep deprivation.
  - Cognitive effectiveness scales inversely with fatigue and acute psychological stress, reducing emergency procedure success rates.
- **Light-Time Communication Model:**
  - All uplink commands and downlink telemetry packets are routed through a timestamped delay queue representing the $\approx 1.28\text{s}$ speed-of-light one-way latency between the Moon and Earth Deep Space Network (DSN).
  - Critical alarms trigger autonomous habitat flight rules when round-trip communication delay ($\approx 2.56\text{s}$) exceeds allowable intervention windows.

---

## 16. Known Limitations

1. **Speed-of-Light Physical Invariance:** The 1.28-second communication latency is a physical constant of nature and cannot be disabled in nominal difficulty modes.
2. **Lumped-Parameter Fluid Dynamics:** Atmospheric gas diffusion and thermal dissipation within the habitat are modeled using lumped-parameter chamber volumes rather than full 3D computational fluid dynamics (CFD).
3. **Browser Storage Limits:** Web browser LocalStorage has an operating quota of approximately 5 MB. Extensive telemetry logs spanning multiple continuous 30-day missions should be archived using the built-in **JSON Export** feature in Settings.
4. **AI Rate Limiting:** The optional AI Mission Instructor backend enforces an educational rate limit (60 requests/hour per client) to prevent API abuse. When the quota is reached or offline, the system seamlessly transitions to the built-in pedagogical rule engine.

---

## 17. Future Improvements

- **WebRTC Collaborative Flight Control:** Enable multi-seat classroom sessions where different students manage separate consoles (CAPCOM, EECOM, FLIGHT, SURGEON).
- **3D WebGL Digital Twin:** Interactive 3D rendering of the lunar surface habitat, solar arrays, and astronaut EVA suits with real-time sensor heatmaps.
- **Progressive Web App (PWA):** Service worker offline precaching for complete offline capability in remote educational settings without network connectivity.
- **Expanded Space Weather Feeds:** Extended real-time integration with ESA and NOAA planetary ephemeris and cosmic ray monitoring networks.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
