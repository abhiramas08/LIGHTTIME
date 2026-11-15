/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Central Mission Store (Zustand)
 *
 * Single source of truth for the entire application.
 * Connects the pure simulation engine to the frontend.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. The store calls the pure simulation engine (tickSimulation, advanceMissionTime, applyMissionCommand).
 * 2. React components and UI NEVER independently calculate simulation rules.
 * 3. All modules read from the same central state.
 * 4. State updates trigger synchronized updates across all connected dashboards and views.
 * 5. Uses versioned and validated browser storage persistence for the current demo mission.
 */

import { create } from 'zustand';
import {
  MissionState,
  MissionOperationalStatus,
  MissionActionRecord,
  MissionEventRecord,
  MissionRecords,
} from '@/simulation/models/missionState';
import {
  tickSimulation,
  createInitialMissionState,
  cloneMissionState,
} from '@/simulation/engine/core';
import { formatSimulationTime } from '@/simulation/models/eventTypes';
import {
  applyMissionCommand,
  MissionCommandInput,
  CommandExecutionResult,
} from '@/simulation/commands/commandDispatcher';
import {
  saveMissionToStorage,
  loadMissionFromStorage,
  clearMissionStorage,
} from './persistence';
import { MissionCommand } from '@/simulation/models/command';
import { Astronaut, CrewRole } from '@/simulation/models/crew';
import { HabitatTelemetry } from '@/simulation/models/telemetry';
import { MissionSetupFormData } from '@/features/setup/setupValidation';

export type NavigationTab =
  | 'dashboard'
  | 'live'
  | 'operate'
  | 'respond'
  | 'consequence-lab'
  | 'science-data'
  | 'mission-history'
  | 'settings';

// ============================================================================
// Projection Helpers (Synchronize Canonical State -> View Projections)
// ============================================================================

function mapCanonicalCrewToAstronauts(canonicalCrew: MissionState['crew']): Astronaut[] {
  return canonicalCrew.map((rec) => {
    let mappedRole: CrewRole = 'Commander';
    if (rec.role === 'Lunar Module Pilot') mappedRole = 'Lunar Module Pilot';
    else if (rec.role === 'Science Specialist') mappedRole = 'Mission Specialist / Science';
    else if (rec.role === 'Medical Specialist') mappedRole = 'Flight Surgeon / Medical Specialist';

    return {
      id: rec.astronautId,
      callsign: rec.callsign,
      fullName: rec.name,
      role: mappedRole,
      currentActivity:
        rec.availability === 'ON_EVA'
          ? 'EVA_SURFACE_SORTIE'
          : rec.availability === 'RESTING'
          ? 'CIRCADIAN_SLEEP_PERIOD'
          : 'HABITAT_SYSTEMS_MAINTENANCE',
      location:
        rec.availability === 'ON_EVA'
          ? 'SURFACE_ROVER'
          : rec.availability === 'RESTING'
          ? 'STORM_SHELTER'
          : 'HABITAT_CORE',
      vitals: {
        heartRateBpm: rec.biometrics.heartRateBpm,
        respirationRate: rec.biometrics.respirationRateBpm,
        systolicBp: rec.biometrics.bloodPressureSystolicMmHg,
        diastolicBp: rec.biometrics.bloodPressureDiastolicMmHg,
        coreTempCelsius: rec.biometrics.coreTemperatureCelsius,
        bloodOxygenPercent: rec.biometrics.bloodOxygenPercent,
      },
      cognitive: {
        readinessScore: Math.max(0, Math.min(100, Math.round(100 - rec.fatigueIndex))),
        sleepDebtHours: Math.max(0, Number((8.0 - rec.sleepHours).toFixed(1))),
        consecutiveAwakeHours: Number((rec.fatigueIndex * 0.2).toFixed(1)),
        stressIndex: rec.stressIndex,
        circadianPhaseHour: 14.5,
      },
      radiation: {
        accumulatedTotalMsv: rec.biometrics.cumulativeRadiationDoseMsv,
        currentRateMsvPerHour: 0.003,
        lastDosimeterCalibrationDay: 1,
      },
      evaHoursCompleted: rec.role === 'Lunar Module Pilot' ? 4.5 : 2.0,
      hydrationPercent: 96,
      caloricIntakeTodayKcal: Math.round(2400 * (rec.nutritionScore / 100)),
      isFitForDuty: rec.availability !== 'MEDICAL_RESTRICTED',
    };
  });
}

function mapCanonicalToTelemetry(state: MissionState): HabitatTelemetry {
  const isMasterAlarm =
    state.emergency.severity === 'CRITICAL' ||
    state.emergency.severity === 'WARNING' ||
    state.habitatResources.oxygenInventoryKg < 60 ||
    state.habitatResources.batteryStorageKwh < 30;

  return {
    timestampUtc: new Date().toISOString(),
    missionDay: state.mission.missionDay,
    metSeconds: Math.round(state.mission.elapsedHours * 3600),
    atmosphere: {
      totalPressureKpa: 56.5,
      ppO2Kpa: 20.0,
      ppCO2Kpa: Number((0.40 - Math.min(0.20, state.habitatResources.co2RemovalCapacityKgPerHour * 0.5)).toFixed(2)),
      cabinTempCelsius: 21.5,
      relativeHumidityPercent: 45,
      airCirculationFlowRateM3PerMin: 14.2,
    },
    lifeSupport: {
      potableWaterReserveLiters: Number(state.habitatResources.waterInventoryLiters.toFixed(1)),
      grayWaterRecycledPercent: state.habitatResources.waterRecoveryRatePercent,
      oxygenSupplyKg: Number(state.habitatResources.oxygenInventoryKg.toFixed(2)),
      nitrogenSupplyKg: 120.0,
      carbonScrubberBedSaturationPercent: Math.min(
        100,
        Math.max(10, Math.round((1.0 - state.habitatResources.co2RemovalCapacityKgPerHour / 0.4) * 100))
      ),
      wasteManagementStatus: 'NOMINAL',
    },
    power: {
      solarArrayOutputKw: Number((state.habitatResources.powerGenerationKw * 0.82).toFixed(2)),
      surfaceReactorOutputKw: Number((state.habitatResources.powerGenerationKw * 0.18).toFixed(2)),
      fuelCellReservePercent: 95,
      totalHabitatLoadKw: Number(state.habitatResources.powerDemandKw.toFixed(2)),
      batteryStateOfChargePercent: state.habitatResources.batteryStateOfChargePercent,
      gridStatus:
        state.habitatResources.batteryStorageKwh < 30
          ? 'BATTERY_BACKUP_ACTIVE'
          : state.habitatResources.powerDemandKw > state.habitatResources.powerGenerationKw
          ? 'PEAK_LOAD_SHEDDING'
          : 'NOMINAL',
    },
    comms: {
      earthDistanceKm: 384400,
      oneWayLightTimeSeconds: state.communications.delaySeconds,
      roundTripDelaySeconds: Number((state.communications.delaySeconds * 2).toFixed(3)),
      dsnGroundStation: state.communications.dsnStation,
      downlinkDataRateMbps: 50,
      uplinkSignalToNoiseDb: 18.5,
      linkStatus:
        state.communications.status === 'CONNECTED'
          ? 'LOCKED'
          : state.communications.status === 'DEGRADED'
          ? 'DEGRADED'
          : 'LOSS_OF_SIGNAL_OCCULTATION',
    },
    environment: {
      surfaceTempCelsius: state.environment.environmentalTemperatureCelsius,
      solarIrradianceWPerM2: Number((state.environment.solarPowerAvailabilityPercent * 13.61).toFixed(1)),
      ambientRadiationMicroSvPerHour: Number((state.environment.educationalRadiationHazardIndex * 0.5).toFixed(2)),
      lunarDiurnalPhase: state.environment.lunarIlluminationPercent > 50 ? 'LUNAR_DAY' : 'LUNAR_NIGHT',
      dustStormParticulateIndex: 0,
    },
    masterAlarm: isMasterAlarm,
    activeAlarmsCount: state.emergency.activeScenario ? 1 : 0,
  };
}

// ============================================================================
// Store State Interface
// ============================================================================

export interface MissionStoreState {
  // 1. Single Canonical Mission State
  missionState: MissionState;

  // 2. Simulation Status
  simulationStatus: MissionOperationalStatus;

  // 3. Mission History
  missionHistory: MissionRecords;

  // 4. User Actions
  userActions: MissionActionRecord[];

  // 5. Active Scenario
  activeScenario: MissionState['emergency']['activeScenario'];

  // 6. Mission Event Log
  missionEventLog: MissionEventRecord[];

  // Synchronized UI projections
  mission: {
    id: string;
    name: string;
    commanderCallsign: string;
    currentDay: number;
    totalDays: number;
    metSeconds: number;
    elapsedHours: number;
    isRunning: boolean;
    timeWarpFactor: 1 | 5 | 60 | 3600;
    phase: string;
    lightTimeDelaySec: number;
    scienceYieldScore: number;
    crewHealthScore: number;
    systemsReliabilityScore: number;
  };
  telemetry: HabitatTelemetry;
  crew: Astronaut[];
  commands: MissionCommand[];

  // UI state
  activeTab: NavigationTab;
  selectedAstronautId: string | null;

  // Validated actions
  initializeNewMission: (setupData: MissionSetupFormData) => MissionState;
  startMission: () => void;
  pauseMission: () => void;
  resumeMission: () => void;
  advanceOneHour: () => void;
  advanceOneDay: () => void;
  resetMission: () => void;
  executeMissionCommand: (command: MissionCommandInput) => CommandExecutionResult;

  // Continuous Clock Ticker & Navigation Controls
  tick: (dtSeconds: number) => void;
  setTimeWarpFactor: (factor: 1 | 5 | 60 | 3600) => void;
  toggleSimulationRunning: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedAstronautId: (id: string | null) => void;
  queueCommand: (
    subsystem: MissionCommand['subsystem'],
    action: string,
    parameters?: Record<string, unknown>,
    targetAstronautId?: string
  ) => void;
  restoreSavedMission: () => boolean;
  clearSavedMission: () => void;
  acknowledgeEvent: (eventId: string) => void;
  acknowledgeAllEvents: () => void;
}

// Initial state resolution: try restored state from versioned localStorage, fallback to pristine engine state
const initialCanonicalState: MissionState =
  loadMissionFromStorage() ?? createInitialMissionState();

export const useMissionStore = create<MissionStoreState>((set, get) => ({
  // Canonical State
  missionState: initialCanonicalState,
  simulationStatus: initialCanonicalState.mission.missionStatus,
  missionHistory: initialCanonicalState.records,
  userActions: initialCanonicalState.records.actionHistory,
  activeScenario: initialCanonicalState.emergency.activeScenario,
  missionEventLog: initialCanonicalState.records.eventHistory,

  // Synchronized UI projections
  mission: {
    id: initialCanonicalState.mission.missionId,
    name: initialCanonicalState.mission.missionName,
    commanderCallsign: 'EARTH-FLIGHT-DIRECTOR',
    currentDay: initialCanonicalState.mission.missionDay,
    totalDays: initialCanonicalState.mission.missionDuration,
    metSeconds: Math.round(initialCanonicalState.mission.elapsedHours * 3600),
    elapsedHours: initialCanonicalState.mission.elapsedHours,
    isRunning: initialCanonicalState.mission.missionStatus === 'ACTIVE',
    timeWarpFactor: 1,
    phase: 'SURFACE_EXPEDITION_ACTIVE',
    lightTimeDelaySec: initialCanonicalState.communications.delaySeconds,
    scienceYieldScore: 82,
    crewHealthScore: 94,
    systemsReliabilityScore: 97,
  },
  telemetry: mapCanonicalToTelemetry(initialCanonicalState),
  crew: mapCanonicalCrewToAstronauts(initialCanonicalState.crew),
  commands: [],
  activeTab: 'dashboard',
  selectedAstronautId: null,

  // ==========================================================================
  // Validated Simulation Actions (Calling Pure Simulation Engine)
  // ==========================================================================

  initializeNewMission: (setupData) => {
    const isCo2Anomaly = setupData.scenarioId === 'CO2_SCRUBBER_ANOMALY';
    const isSpeAlert = setupData.scenarioId === 'SOLAR_PARTICLE_EVENT';

    // Pure simulation engine initialization starting strictly at Day 01, Hour 00
    const newMissionState = createInitialMissionState({
      mission: {
        missionId: `LT-${setupData.missionName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 16)}-D01`,
        missionName: setupData.missionName,
        missionDay: 1, // Exactly Day 01
        elapsedHours: 0.0, // Exactly Hour 00
        missionDuration: 30, // Exactly 30 Days
        missionStatus: 'ACTIVE',
        simulationRulesVersion: '1.0.0-artemis',
      },
      communications: {
        status: 'CONNECTED',
        delaySeconds: 1.282,
        availabilityPercent: 100.0,
        dsnStation: setupData.groundStation,
      },
      emergency: {
        activeScenario: isCo2Anomaly
          ? 'SCEN-ECLSS-CO2-01'
          : isSpeAlert
          ? 'SCEN-SPE-RADIATION-01'
          : null,
        severity: isCo2Anomaly ? 'CAUTION' : isSpeAlert ? 'WARNING' : 'NONE',
        remainingResponseTimeSeconds: isCo2Anomaly ? 7200 : isSpeAlert ? 1200 : null,
        responseActions: [],
      },
      records: {
        eventHistory: [
          {
            eventId: `EVT-LAUNCH-${Date.now().toString(36).toUpperCase()}`,
            timestampHours: 0.0,
            category: 'MISSION_CONTROL',
            title: 'EXPEDITION LAUNCH & SURFACE INITIALIZATION',
            details: `Mission "${setupData.missionName}" initialized at Day 01, Hour 00. Deep Space Network tracked via ${setupData.groundStation}. 4-member astronaut crew commenced nominal surface operations at Shackleton Crater rim.`,
            severity: 'INFO',
          },
        ],
        actionHistory: [],
        resourceHistory: [
          {
            timestampHours: 0.0,
            oxygenKg: 300.0,
            waterLiters: 1200.0,
            batteryKwh: 200.0,
            powerKw: 45.0,
          },
        ],
        crewWellbeingHistory: [],
      },
    });

    saveMissionToStorage(newMissionState);

    set({
      missionState: newMissionState,
      simulationStatus: 'ACTIVE',
      missionHistory: newMissionState.records,
      userActions: [],
      activeScenario: newMissionState.emergency.activeScenario,
      missionEventLog: newMissionState.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(newMissionState.crew),
      telemetry: mapCanonicalToTelemetry(newMissionState),
      commands: [],
      mission: {
        ...get().mission,
        id: newMissionState.mission.missionId,
        name: newMissionState.mission.missionName,
        commanderCallsign: setupData.commanderCallsign,
        currentDay: 1,
        totalDays: 30,
        metSeconds: 0,
        elapsedHours: 0.0,
        isRunning: true,
        timeWarpFactor: 1,
      },
    });

    return newMissionState;
  },

  startMission: () => {
    const { missionState, mission } = get();
    if (missionState.mission.missionStatus === 'COMPLETED' || missionState.mission.missionStatus === 'ABORTED') {
      return;
    }

    const nextState = cloneMissionState(missionState);
    nextState.mission.missionStatus = 'ACTIVE';

    const metFormatted = formatSimulationTime(nextState.mission.elapsedHours, nextState.mission.missionDay);
    const startEvent: MissionEventRecord = {
      eventId: `EVT-START-${Date.now().toString(36).toUpperCase()}`,
      timestampHours: nextState.mission.elapsedHours,
      simulationTime: metFormatted,
      affectedSystem: 'MISSION',
      category: 'MISSION_CONTROL',
      eventType: 'MISSION_PHASE_CHANGE',
      title: 'SIMULATION CLOCK STARTED',
      details: 'Mission simulation set to ACTIVE state. Discrete-time mathematical solvers running.',
      severity: 'INFORMATIONAL',
      previousValue: 'PAUSED',
      newValue: 'ACTIVE',
      trigger: 'Flight Director started simulation clock',
      relatedUserAction: 'startMission',
      educationalExplanation: 'Artemis mission operations timeline active. Closed-loop life support and human physiological models ticking forward.',
      acknowledged: false,
    };
    nextState.records.eventHistory.unshift(startEvent);

    saveMissionToStorage(nextState);

    set({
      missionState: nextState,
      simulationStatus: 'ACTIVE',
      missionHistory: nextState.records,
      missionEventLog: nextState.records.eventHistory,
      mission: {
        ...mission,
        isRunning: true,
      },
      telemetry: mapCanonicalToTelemetry(nextState),
    });
  },

  pauseMission: () => {
    const { missionState, mission } = get();
    const nextState = cloneMissionState(missionState);
    nextState.mission.missionStatus = 'PAUSED';

    const metFormatted = formatSimulationTime(nextState.mission.elapsedHours, nextState.mission.missionDay);
    const pauseEvent: MissionEventRecord = {
      eventId: `EVT-PAUSE-${Date.now().toString(36).toUpperCase()}`,
      timestampHours: nextState.mission.elapsedHours,
      simulationTime: metFormatted,
      affectedSystem: 'MISSION',
      category: 'MISSION_CONTROL',
      eventType: 'MISSION_PHASE_CHANGE',
      title: 'SIMULATION CLOCK PAUSED',
      details: 'Simulation clock paused by flight controller. Telemetry streams frozen.',
      severity: 'INFORMATIONAL',
      previousValue: 'ACTIVE',
      newValue: 'PAUSED',
      trigger: 'Flight Director paused simulation clock',
      relatedUserAction: 'pauseMission',
      educationalExplanation: 'Simulation frozen for analysis and flight rule review without consuming mission consumables.',
      acknowledged: false,
    };
    nextState.records.eventHistory.unshift(pauseEvent);

    saveMissionToStorage(nextState);

    set({
      missionState: nextState,
      simulationStatus: 'PAUSED',
      missionHistory: nextState.records,
      missionEventLog: nextState.records.eventHistory,
      mission: {
        ...mission,
        isRunning: false,
      },
      telemetry: mapCanonicalToTelemetry(nextState),
    });
  },

  resumeMission: () => {
    get().startMission();
  },

  advanceOneHour: () => {
    const { missionState, mission, commands } = get();
    if (missionState.mission.missionStatus === 'COMPLETED' || missionState.mission.missionStatus === 'ABORTED') {
      return;
    }

    const wasPaused = missionState.mission.missionStatus === 'PAUSED';
    let next = cloneMissionState(missionState);
    if (wasPaused) {
      next.mission.missionStatus = 'ACTIVE';
    }

    // Call pure simulation engine
    next = tickSimulation(next, 1.0);

    if (wasPaused && next.mission.missionStatus === 'ACTIVE') {
      next.mission.missionStatus = 'PAUSED';
    }

    const newMet = Math.round(next.mission.elapsedHours * 3600);
    const updatedCommands = commands.map((cmd) => {
      if (cmd.status === 'TRANSMITTING_UPLINK' && newMet >= cmd.uplinkArrivalMetSeconds) {
        return { ...cmd, status: 'RECEIVED_HABITAT' as const };
      }
      if (cmd.status === 'RECEIVED_HABITAT' && newMet >= cmd.executionCompletedMetSeconds) {
        return { ...cmd, status: 'DOWNLINKING_ACK' as const };
      }
      if (cmd.status === 'DOWNLINKING_ACK' && newMet >= cmd.earthAckMetSeconds) {
        return { ...cmd, status: 'CONFIRMED' as const };
      }
      return cmd;
    });

    saveMissionToStorage(next);

    set({
      missionState: next,
      simulationStatus: next.mission.missionStatus,
      missionHistory: next.records,
      userActions: next.records.actionHistory,
      activeScenario: next.emergency.activeScenario,
      missionEventLog: next.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(next.crew),
      telemetry: mapCanonicalToTelemetry(next),
      commands: updatedCommands,
      mission: {
        ...mission,
        currentDay: next.mission.missionDay,
        metSeconds: newMet,
        elapsedHours: next.mission.elapsedHours,
        isRunning: next.mission.missionStatus === 'ACTIVE',
      },
    });
  },

  advanceOneDay: () => {
    const { missionState, mission, commands } = get();
    if (missionState.mission.missionStatus === 'COMPLETED' || missionState.mission.missionStatus === 'ABORTED') {
      return;
    }

    const wasPaused = missionState.mission.missionStatus === 'PAUSED';
    let next = cloneMissionState(missionState);
    if (wasPaused) {
      next.mission.missionStatus = 'ACTIVE';
    }

    // Call pure simulation engine for 24 hours
    next = tickSimulation(next, 24.0);

    if (wasPaused && next.mission.missionStatus === 'ACTIVE') {
      next.mission.missionStatus = 'PAUSED';
    }

    const newMet = Math.round(next.mission.elapsedHours * 3600);
    const updatedCommands = commands.map((cmd) => ({
      ...cmd,
      status: 'CONFIRMED' as const,
    }));

    saveMissionToStorage(next);

    set({
      missionState: next,
      simulationStatus: next.mission.missionStatus,
      missionHistory: next.records,
      userActions: next.records.actionHistory,
      activeScenario: next.emergency.activeScenario,
      missionEventLog: next.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(next.crew),
      telemetry: mapCanonicalToTelemetry(next),
      commands: updatedCommands,
      mission: {
        ...mission,
        currentDay: next.mission.missionDay,
        metSeconds: newMet,
        elapsedHours: next.mission.elapsedHours,
        isRunning: next.mission.missionStatus === 'ACTIVE',
      },
    });
  },

  resetMission: () => {
    const next = createInitialMissionState();
    clearMissionStorage();
    saveMissionToStorage(next);

    set({
      missionState: next,
      simulationStatus: next.mission.missionStatus,
      missionHistory: next.records,
      userActions: next.records.actionHistory,
      activeScenario: next.emergency.activeScenario,
      missionEventLog: next.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(next.crew),
      telemetry: mapCanonicalToTelemetry(next),
      commands: [],
      mission: {
        ...get().mission,
        id: next.mission.missionId,
        name: next.mission.missionName,
        currentDay: next.mission.missionDay,
        totalDays: next.mission.missionDuration,
        metSeconds: Math.round(next.mission.elapsedHours * 3600),
        elapsedHours: next.mission.elapsedHours,
        isRunning: next.mission.missionStatus === 'ACTIVE',
        timeWarpFactor: 1,
      },
    });
  },

  executeMissionCommand: (commandInput: MissionCommandInput) => {
    const { missionState, mission } = get();

    // Call pure command dispatcher
    const result = applyMissionCommand(missionState, commandInput);

    saveMissionToStorage(result.updatedState);

    set({
      missionState: result.updatedState,
      simulationStatus: result.updatedState.mission.missionStatus,
      missionHistory: result.updatedState.records,
      userActions: result.updatedState.records.actionHistory,
      activeScenario: result.updatedState.emergency.activeScenario,
      missionEventLog: result.updatedState.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(result.updatedState.crew),
      telemetry: mapCanonicalToTelemetry(result.updatedState),
      mission: {
        ...mission,
        currentDay: result.updatedState.mission.missionDay,
        metSeconds: Math.round(result.updatedState.mission.elapsedHours * 3600),
        elapsedHours: result.updatedState.mission.elapsedHours,
      },
    });

    return result;
  },

  // ==========================================================================
  // Continuous Clock Ticker & UI Controls
  // ==========================================================================

  tick: (dtSeconds: number) => {
    const { missionState, mission, commands } = get();
    if (missionState.mission.missionStatus !== 'ACTIVE') return;

    const deltaHours = dtSeconds / 3600;
    // Pure simulation engine execution
    const next = tickSimulation(missionState, deltaHours);

    const newMet = Math.round(next.mission.elapsedHours * 3600);

    const updatedCommands = commands.map((cmd) => {
      if (cmd.status === 'TRANSMITTING_UPLINK' && newMet >= cmd.uplinkArrivalMetSeconds) {
        return { ...cmd, status: 'RECEIVED_HABITAT' as const };
      }
      if (cmd.status === 'RECEIVED_HABITAT' && newMet >= cmd.executionCompletedMetSeconds) {
        return { ...cmd, status: 'DOWNLINKING_ACK' as const };
      }
      if (cmd.status === 'DOWNLINKING_ACK' && newMet >= cmd.earthAckMetSeconds) {
        return { ...cmd, status: 'CONFIRMED' as const };
      }
      return cmd;
    });

    set({
      missionState: next,
      simulationStatus: next.mission.missionStatus,
      missionHistory: next.records,
      userActions: next.records.actionHistory,
      activeScenario: next.emergency.activeScenario,
      missionEventLog: next.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(next.crew),
      telemetry: mapCanonicalToTelemetry(next),
      commands: updatedCommands,
      mission: {
        ...mission,
        currentDay: next.mission.missionDay,
        metSeconds: newMet,
        elapsedHours: next.mission.elapsedHours,
      },
    });
  },

  setTimeWarpFactor: (factor) => {
    set((state) => ({
      mission: { ...state.mission, timeWarpFactor: factor },
    }));
  },

  toggleSimulationRunning: () => {
    const { missionState } = get();
    if (missionState.mission.missionStatus === 'ACTIVE') {
      get().pauseMission();
    } else {
      get().startMission();
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAstronautId: (id) => set({ selectedAstronautId: id }),

  queueCommand: (subsystem, action, parameters = {}, targetAstronautId) => {
    const { mission, commands } = get();
    const delay = mission.lightTimeDelaySec;
    const issuedAt = mission.metSeconds;
    const arrivalAt = issuedAt + delay;
    const execAt = arrivalAt + 1.0;
    const ackAt = execAt + delay;

    const newCommand: MissionCommand = {
      id: `CMD-${Date.now().toString(36).toUpperCase()}`,
      subsystem,
      action,
      parameters,
      issuedAtMetSeconds: issuedAt,
      uplinkArrivalMetSeconds: arrivalAt,
      executionCompletedMetSeconds: execAt,
      earthAckMetSeconds: ackAt,
      status: 'TRANSMITTING_UPLINK',
      targetAstronautId,
    };

    set({ commands: [newCommand, ...commands.slice(0, 49)] });

    // Apply directive to canonical state via pure command dispatcher
    get().executeMissionCommand({
      subsystem,
      action,
      parameters,
      targetAstronautId,
      initiatedBy: 'GROUND',
    });
  },

  restoreSavedMission: () => {
    const restored = loadMissionFromStorage();
    if (!restored) return false;

    set({
      missionState: restored,
      simulationStatus: restored.mission.missionStatus,
      missionHistory: restored.records,
      userActions: restored.records.actionHistory,
      activeScenario: restored.emergency.activeScenario,
      missionEventLog: restored.records.eventHistory,
      crew: mapCanonicalCrewToAstronauts(restored.crew),
      telemetry: mapCanonicalToTelemetry(restored),
      mission: {
        ...get().mission,
        id: restored.mission.missionId,
        name: restored.mission.missionName,
        currentDay: restored.mission.missionDay,
        totalDays: restored.mission.missionDuration,
        metSeconds: Math.round(restored.mission.elapsedHours * 3600),
        elapsedHours: restored.mission.elapsedHours,
        isRunning: restored.mission.missionStatus === 'ACTIVE',
      },
    });

    return true;
  },

  clearSavedMission: () => {
    clearMissionStorage();
    get().resetMission();
  },

  acknowledgeEvent: (eventId: string) => {
    const { missionState } = get();
    const updatedHistory = missionState.records.eventHistory.map((evt) =>
      evt.eventId === eventId ? { ...evt, acknowledged: true } : evt
    );
    const next = {
      ...missionState,
      records: {
        ...missionState.records,
        eventHistory: updatedHistory,
      },
    };
    saveMissionToStorage(next);
    set({
      missionState: next,
      missionHistory: next.records,
      missionEventLog: updatedHistory,
    });
  },

  acknowledgeAllEvents: () => {
    const { missionState } = get();
    const updatedHistory = missionState.records.eventHistory.map((evt) => ({
      ...evt,
      acknowledged: true,
    }));
    const next = {
      ...missionState,
      records: {
        ...missionState.records,
        eventHistory: updatedHistory,
      },
    };
    saveMissionToStorage(next);
    set({
      missionState: next,
      missionHistory: next.records,
      missionEventLog: updatedHistory,
    });
  },
}));
