/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Controlled Simulation Clock & Manager
 *
 * Provides controlled execution hooks: start, pause, resume, advanceOneHour,
 * advanceOneDay, and reset. Pure TypeScript with observer subscription pattern.
 */

import { MissionState } from '../models/missionState';
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from './config';
import {
  createInitialMissionState,
  cloneMissionState,
  tickSimulation,
  calculateMissionOutcome,
  MissionOutcome,
} from './core';

export type SimulationListener = (state: MissionState) => void;

export class SimulationClock {
  private state: MissionState;
  private readonly initialState: MissionState;
  private config: SimulationConfig;
  private listeners: Set<SimulationListener> = new Set();

  constructor(
    initialStateOverrides?: Partial<MissionState>,
    configOverrides?: Partial<SimulationConfig>
  ) {
    this.config = { ...DEFAULT_SIMULATION_CONFIG, ...(configOverrides || {}) };
    this.initialState = createInitialMissionState(initialStateOverrides);
    this.state = cloneMissionState(this.initialState);
  }

  /** Returns an immutable deep copy of the current mission state */
  getState(): MissionState {
    return cloneMissionState(this.state);
  }

  /** Returns current simulation configuration */
  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  /** Updates simulation configuration assumptions */
  setConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /** Starts or sets the mission into ACTIVE status */
  start(): MissionState {
    this.state.mission.missionStatus = 'ACTIVE';
    this.notify();
    return this.getState();
  }

  /** Pauses the mission clock and freezing state advancement */
  pause(): MissionState {
    this.state.mission.missionStatus = 'PAUSED';
    this.notify();
    return this.getState();
  }

  /** Resumes an active simulation run */
  resume(): MissionState {
    return this.start();
  }

  /** Advances the simulation forward by exactly one hour (1.0h) */
  advanceOneHour(): MissionState {
    return this.step(1.0);
  }

  /** Advances the simulation forward by exactly one Earth calendar day (24.0h) */
  advanceOneDay(): MissionState {
    return this.step(24.0);
  }

  /** Steps the simulation forward by arbitrary deltaHours */
  step(deltaHours: number): MissionState {
    if (deltaHours <= 0) return this.getState();

    // Ensure status is active for manual stepping
    const wasPaused = this.state.mission.missionStatus === 'PAUSED';
    if (wasPaused) {
      this.state.mission.missionStatus = 'ACTIVE';
    }

    this.state = tickSimulation(this.state, deltaHours, this.config);

    if (wasPaused && this.state.mission.missionStatus === 'ACTIVE') {
      this.state.mission.missionStatus = 'PAUSED';
    }

    this.notify();
    return this.getState();
  }

  /** Resets the mission state back to its original configured baseline */
  reset(): MissionState {
    this.state = cloneMissionState(this.initialState);
    this.notify();
    return this.getState();
  }

  /** Evaluates end-of-mission performance scoring */
  getOutcome(): MissionOutcome {
    return calculateMissionOutcome(this.state, this.config);
  }

  /** Subscribes a listener callback to state change notifications */
  subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
