import { MissionCommand } from '../models/command';

export class CommandPipeline {
  static createUplinkCommand(
    subsystem: MissionCommand['subsystem'],
    action: string,
    parameters: Record<string, unknown>,
    currentMetSeconds: number,
    lightTimeDelaySec: number,
    targetAstronautId?: string
  ): MissionCommand {
    const uplinkArrival = currentMetSeconds + lightTimeDelaySec;
    const executionCompleted = uplinkArrival + 1.0;
    const earthAck = executionCompleted + lightTimeDelaySec;

    return {
      id: `CMD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      subsystem,
      action,
      parameters,
      issuedAtMetSeconds: currentMetSeconds,
      uplinkArrivalMetSeconds: uplinkArrival,
      executionCompletedMetSeconds: executionCompleted,
      earthAckMetSeconds: earthAck,
      status: 'TRANSMITTING_UPLINK',
      targetAstronautId,
    };
  }
}
