export type CommandSubsystem =
  | 'ECLSS'
  | 'CREW_SCHEDULE'
  | 'POWER_GRID'
  | 'COMMUNICATIONS'
  | 'EVA_CONTROL'
  | 'SCIENCE_INSTRUMENTS'
  | 'EMERGENCY';

export type CommandStatus =
  | 'TRANSMITTING_UPLINK' // In transit from Earth to Moon (1.28s)
  | 'RECEIVED_HABITAT' // Arrived at Moon, undergoing local parsing & flight-rule validation
  | 'EXECUTING' // Active on lunar habitat or crew
  | 'DOWNLINKING_ACK' // Telemetry confirmation in transit back to Earth (1.28s)
  | 'CONFIRMED' // Confirmed on Earth Mission Control console
  | 'REJECTED_CREW_DISCRETION' // Crew overrode or flight rule safety interlock tripped
  | 'FAILED';

export interface MissionCommand {
  id: string;
  subsystem: CommandSubsystem;
  action: string;
  parameters: Record<string, unknown>;
  issuedAtMetSeconds: number;
  uplinkArrivalMetSeconds: number; // issuedAtMetSeconds + lightTimeDelay
  executionCompletedMetSeconds: number;
  earthAckMetSeconds: number; // executionCompletedMetSeconds + lightTimeDelay
  status: CommandStatus;
  targetAstronautId?: string;
  rejectionReason?: string;
}
