import { z } from 'zod';

export const missionCommandSchema = z.object({
  id: z.string(),
  subsystem: z.enum([
    'ECLSS',
    'CREW_SCHEDULE',
    'POWER_GRID',
    'COMMUNICATIONS',
    'EVA_CONTROL',
    'SCIENCE_INSTRUMENTS',
    'EMERGENCY',
  ]),
  action: z.string().min(1),
  parameters: z.record(z.unknown()),
  issuedAtMetSeconds: z.number().min(0),
  uplinkArrivalMetSeconds: z.number().min(0),
  executionCompletedMetSeconds: z.number().min(0),
  earthAckMetSeconds: z.number().min(0),
  status: z.enum([
    'TRANSMITTING_UPLINK',
    'RECEIVED_HABITAT',
    'EXECUTING',
    'DOWNLINKING_ACK',
    'CONFIRMED',
    'REJECTED_CREW_DISCRETION',
    'FAILED',
  ]),
  targetAstronautId: z.string().optional(),
  rejectionReason: z.string().optional(),
});
