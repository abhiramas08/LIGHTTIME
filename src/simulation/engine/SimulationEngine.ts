import { HabitatTelemetry } from '../models/telemetry';
import { Astronaut } from '../models/crew';
import { LegacyMissionState } from '../models/mission';
import { MissionCommand } from '../models/command';

export interface SimulationSnapshot {
  mission: LegacyMissionState;
  telemetry: HabitatTelemetry;
  crew: Astronaut[];
  activeCommands: MissionCommand[];
}

export class SimulationEngine {
  private snapshot: SimulationSnapshot;

  constructor(initialSnapshot: SimulationSnapshot) {
    this.snapshot = initialSnapshot;
  }

  getSnapshot(): SimulationSnapshot {
    return this.snapshot;
  }

  /**
   * Advances the physical, physiological, and communications state by Δt seconds.
   * Pure deterministic calculation.
   */
  step(dtSeconds: number): SimulationSnapshot {
    const { mission, telemetry, crew, activeCommands } = this.snapshot;
    if (!mission.isRunning) return this.snapshot;

    const newMet = mission.metSeconds + dtSeconds;
    const newDay = Math.floor(newMet / 86400) + 1;

    // Advance light-time command propagation
    const updatedCommands = activeCommands.map((cmd) => {
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

    this.snapshot = {
      mission: {
        ...mission,
        metSeconds: newMet,
        currentDay: Math.min(newDay, 30),
      },
      telemetry: {
        ...telemetry,
        metSeconds: newMet,
        missionDay: Math.min(newDay, 30),
        timestampUtc: new Date().toISOString(),
      },
      crew,
      activeCommands: updatedCommands,
    };

    return this.snapshot;
  }
}
