/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Pure TypeScript Command Dispatcher
 *
 * Validates and executes mission commands strictly through pure deterministic logic.
 * ZERO dependencies on React, Zustand, DOM, or browser APIs.
 */

import { z } from 'zod';
import {
  MissionState,
  MissionActionRecord,
  MissionEventRecord,
  CrewComplement,
} from '../models/missionState';
import {
  formatSimulationTime,
  mapCategoryToAffectedSystem,
  getEducationalExplanation,
} from '../models/eventTypes';
import { cloneMissionState } from '../engine/core';

// ============================================================================
// Command Input Validation Schema
// ============================================================================

export const commandSubsystemSchema = z.enum([
  'ECLSS',
  'POWER_GRID',
  'CREW_SCHEDULE',
  'COMMUNICATIONS',
  'EVA_CONTROL',
  'SCIENCE_INSTRUMENTS',
  'EMERGENCY',
  'EQUIPMENT',
  'HABITAT_SYSTEMS',
]);

export type CommandSubsystemType = z.infer<typeof commandSubsystemSchema>;

export const missionCommandInputSchema = z.object({
  subsystem: commandSubsystemSchema,
  action: z.string().min(1, 'Action name required'),
  parameters: z.record(z.unknown()).optional().default({}),
  targetAstronautId: z.string().optional(),
  initiatedBy: z.enum(['GROUND', 'CREW']).optional().default('GROUND'),
});

export type MissionCommandInput = z.input<typeof missionCommandInputSchema>;

export interface CommandExecutionResult {
  updatedState: MissionState;
  actionRecord: MissionActionRecord;
  eventRecord: MissionEventRecord;
  success: boolean;
  message: string;
}

// ============================================================================
// Pure Command Execution Engine
// ============================================================================

/**
 * Validates and applies a mission command against a MissionState snapshot.
 * Returns an updated canonical state clone, an action record, and an event log record.
 */
export function applyMissionCommand(
  state: MissionState,
  rawInput: unknown
): CommandExecutionResult {
  const parseResult = missionCommandInputSchema.safeParse(rawInput);
  const next = cloneMissionState(state);
  const currentHours = next.mission.elapsedHours;

  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
    const actionId = `ACT-REJ-${Date.now().toString(36).toUpperCase()}`;
    const actionRecord: MissionActionRecord = {
      actionId,
      timestampHours: currentHours,
      command:
        typeof rawInput === 'object' && rawInput !== null && 'action' in rawInput
          ? String((rawInput as Record<string, unknown>).action)
          : 'UNKNOWN_COMMAND',
      subsystem:
        typeof rawInput === 'object' && rawInput !== null && 'subsystem' in rawInput
          ? String((rawInput as Record<string, unknown>).subsystem)
          : 'UNKNOWN',
      initiatedBy: 'GROUND',
      outcome: 'REJECTED',
    };

    const metFormatted = formatSimulationTime(currentHours, next.mission.missionDay);
    const eventRecord: MissionEventRecord = {
      eventId: `EVT-${Date.now().toString(36).toUpperCase()}`,
      timestampHours: currentHours,
      simulationTime: metFormatted,
      affectedSystem: 'MISSION',
      category: 'COMMAND_PIPELINE',
      eventType: 'USER_DIRECTIVE',
      title: 'COMMAND VALIDATION FAILED',
      details: `Flight directive rejected by flight rule validator: ${errorMsg}`,
      severity: 'WARNING',
      previousValue: null,
      newValue: 'REJECTED',
      trigger: 'Invalid directive parameters or flight rule schema check',
      relatedUserAction:
        typeof rawInput === 'object' && rawInput !== null && 'action' in rawInput
          ? String((rawInput as Record<string, unknown>).action)
          : null,
      educationalExplanation:
        'Artemis Flight Rules require every command packet to adhere to strict subsystem schemas to prevent unvalidated hardware state changes.',
      acknowledged: false,
    };

    next.records.actionHistory.unshift(actionRecord);
    next.records.eventHistory.unshift(eventRecord);

    return {
      updatedState: next,
      actionRecord,
      eventRecord,
      success: false,
      message: errorMsg,
    };
  }

  const command = parseResult.data;
  let success = true;
  let message = `Command ${command.action} successfully executed on ${command.subsystem}.`;
  let severity: MissionEventRecord['severity'] = 'INFO';

  // ============================================================================
  // Communication Constraint Enforcement
  // ============================================================================
  // When communications are unavailable (DISCONNECTED or LOSS_OF_SIGNAL_OCCULTATION),
  // the user must not receive assistance that requires Earth contact.
  const isCommsOffline =
    state.communications.status === 'DISCONNECTED' ||
    state.communications.status === 'LOSS_OF_SIGNAL_OCCULTATION';

  const requiresEarthComms =
    command.parameters?.requiresEarthComms === true ||
    command.action.startsWith('REQUEST_GROUND_') ||
    command.action.startsWith('REQUEST_RADIATION_') ||
    command.action.startsWith('REQUEST_SURGEON_') ||
    (command.initiatedBy === 'GROUND' &&
      command.subsystem === 'EMERGENCY' &&
      command.action !== 'TRIGGER_EMERGENCY_SCENARIO' &&
      command.action !== 'RESET_EMERGENCY' &&
      command.action !== 'RESOLVE_EMERGENCY');

  if (isCommsOffline && requiresEarthComms) {
    const actionRecord: MissionActionRecord = {
      actionId: `ACT-REJ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      timestampHours: currentHours,
      command: command.action,
      subsystem: command.subsystem,
      initiatedBy: 'GROUND',
      outcome: 'REJECTED',
    };

    const metFormatted = formatSimulationTime(currentHours, next.mission.missionDay);
    const eventRecord: MissionEventRecord = {
      eventId: `EVT-REJ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      timestampHours: currentHours,
      simulationTime: metFormatted,
      affectedSystem: 'COMMUNICATIONS',
      category: 'COMMUNICATIONS',
      eventType: 'COMMUNICATION_LINK_EVENT',
      title: 'COMMUNICATION INTERLOCK: GROUND DIRECTIVE BLOCKED',
      details: `Directive ${command.action} blocked: Earth Deep Space Network carrier lock is severed (${state.communications.status}). Earth assistance unavailable under Flight Rule 11.5. Crew autonomy mandatory.`,
      severity: 'WARNING',
      previousValue: state.communications.status,
      newValue: 'REJECTED_LOS',
      trigger: 'Flight Rule 11.5 Loss-of-Signal Interlock',
      relatedUserAction: command.action,
      educationalExplanation:
        'NASA Flight Rule 11.5: Ground flight controllers cannot issue real-time commands during Loss-of-Signal (LOS). The on-board lunar crew possesses sole operational command authority.',
      acknowledged: false,
    };

    next.records.actionHistory.unshift(actionRecord);
    next.records.eventHistory.unshift(eventRecord);

    return {
      updatedState: next,
      actionRecord,
      eventRecord,
      success: false,
      message: `COMMAND BLOCKED: Earth Deep Space Network carrier lock is unavailable (${state.communications.status}). Ground-directed assistance cannot be received without active link. Autonomous on-board response required (Flight Rule 11.5).`,
    };
  }

  switch (command.subsystem) {
    case 'ECLSS':
    case 'HABITAT_SYSTEMS':
    case 'EQUIPMENT': {
      if (
        command.action === 'START_MAINTENANCE' ||
        command.action === 'PERFORM_MAINTENANCE' ||
        command.action === 'MAINTENANCE'
      ) {
        const targetId = String(command.parameters.equipmentId ?? '');
        let target = targetId ? next.equipment.find((e) => e.equipmentId === targetId) : undefined;
        if (!target) {
          // If no explicit ID, target lowest condition or maintenanceRequired
          target = [...next.equipment].sort((a, b) => a.condition - b.condition)[0];
        }

        if (target) {
          target.condition = 100.0;
          target.maintenanceRequired = false;
          target.status = 'OPERATIONAL';

          if (target.equipmentId.includes('CDRA') || target.equipmentName.includes('CDRA')) {
            next.habitatResources.co2RemovalCapacityKgPerHour = 0.35;
          } else if (target.equipmentId.includes('WRS') || target.equipmentName.includes('Water')) {
            next.habitatResources.waterRecoveryRatePercent = 95.0;
          }

          message = `Preventive maintenance successfully performed on ${target.equipmentName} (${target.equipmentId}). Condition restored to 100% and OPERATIONAL state.`;
        } else {
          message = 'No habitat equipment identified for maintenance.';
          success = false;
        }
      } else if (command.action === 'PRIORITIZE_SYSTEMS') {
        const mode = String(command.parameters.priorityMode ?? 'LIFE_SUPPORT');
        if (mode === 'LIFE_SUPPORT') {
          // Ensure ECLSS has operational power, put airlock on standby
          const cdra = next.equipment.find((e) => e.equipmentName.includes('CDRA'));
          const wrs = next.equipment.find((e) => e.equipmentName.includes('Water'));
          const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
          if (cdra) cdra.status = 'OPERATIONAL';
          if (wrs) wrs.status = 'OPERATIONAL';
          if (airlock) airlock.status = 'STANDBY';
          next.habitatResources.powerDemandKw = 24.5;
          next.habitatResources.co2RemovalCapacityKgPerHour = Math.max(0.28, next.habitatResources.co2RemovalCapacityKgPerHour);
          message = 'Operational priority shifted to LIFE SUPPORT. CDRA and Water Recovery prioritized; non-essential airlock in standby.';
        } else if (mode === 'POWER_CONSERVATION') {
          const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
          if (airlock) airlock.status = 'STANDBY';
          next.habitatResources.powerDemandKw = 23.5;
          severity = 'CAUTION';
          message = 'Operational priority shifted to POWER CONSERVATION. Non-essential loads shed; habitat demand reduced to 23.5 kW.';
        } else {
          for (const eq of next.equipment) {
            if (eq.status === 'STANDBY') eq.status = 'OPERATIONAL';
          }
          next.habitatResources.powerDemandKw = 28.4;
          message = 'Operational priority reset to BALANCED NOMINAL operations across all subsystems.';
        }
      } else if (command.action === 'REDUCE_NON_ESSENTIAL_POWER' || command.action === 'SHED_LOAD') {
        const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
        if (airlock) airlock.status = 'STANDBY';
        next.habitatResources.powerDemandKw = Math.max(18.0, Number((next.habitatResources.powerDemandKw - 4.5).toFixed(1)));
        severity = 'CAUTION';
        message = 'Non-essential electrical loads shed. Habitat power demand reduced by 4.5 kW.';
      } else if (command.action === 'CHANGE_RESOURCE_ALLOCATION') {
        const resourceType = String(command.parameters.resourceType ?? 'OXYGEN');
        const tier = String(command.parameters.allocationTier ?? 'NOMINAL');

        if (resourceType === 'OXYGEN') {
          if (tier === 'CONSERVATIVE') {
            next.habitatResources.oxygenConsumptionRateKgPerHour = 0.12;
            message = 'Oxygen delivery set to CONSERVATIVE allocation (0.12 kg/hr cabin flow).';
          } else if (tier === 'ENRICHED') {
            next.habitatResources.oxygenConsumptionRateKgPerHour = 0.18;
            message = 'Oxygen delivery set to ENRICHED allocation (0.18 kg/hr high-activity buffer).';
          } else {
            next.habitatResources.oxygenConsumptionRateKgPerHour = 0.14;
            message = 'Oxygen delivery set to NOMINAL baseline allocation (0.14 kg/hr).';
          }
        } else if (resourceType === 'WATER') {
          if (tier === 'RATIONED') {
            message = 'Potable water allocation set to RATIONED mode (2.0 L/sol/crew quota).';
          } else {
            message = 'Potable water allocation set to NOMINAL mode (2.5 L/sol/crew quota).';
          }
        } else if (resourceType === 'FOOD') {
          if (tier === 'RATIONED') {
            next.habitatResources.foodConsumptionKcalPerHour = 400.0;
            message = 'Food rations set to CONSERVATIVE RATIONING (400 kcal/hr aggregate).';
          } else if (tier === 'ENRICHED') {
            next.habitatResources.foodConsumptionKcalPerHour = 560.0;
            message = 'Food rations set to HIGH METABOLIC intake (560 kcal/hr aggregate).';
          } else {
            next.habitatResources.foodConsumptionKcalPerHour = 480.0;
            message = 'Food rations set to NOMINAL standard (480 kcal/hr aggregate).';
          }
        }
      } else if (command.action === 'ACTIVATE_BACKUP_EQUIPMENT') {
        const system = String(command.parameters.backupSystem ?? 'CDRA_BED_B');
        if (system === 'CDRA_BED_B' || system === 'CO2_SCRUBBER_BACKUP') {
          next.habitatResources.co2RemovalCapacityKgPerHour = 0.35;
          const cdra = next.equipment.find((e) => e.equipmentName.includes('CDRA'));
          if (cdra) {
            cdra.condition = 100.0;
            cdra.status = 'OPERATIONAL';
            cdra.maintenanceRequired = false;
          }
          message = 'Secondary CDRA Amine Bed B engaged. CO2 scrubbing rate restored to 0.35 kg/hr nominal.';
        } else if (system === 'WRS_AUX_CORE' || system === 'WATER_RECOVERY_BACKUP') {
          next.habitatResources.waterRecoveryRatePercent = 98.0;
          const wrs = next.equipment.find((e) => e.equipmentName.includes('Water'));
          if (wrs) {
            wrs.condition = 100.0;
            wrs.status = 'OPERATIONAL';
            wrs.maintenanceRequired = false;
          }
          message = 'Auxiliary catalytic distillation column activated. Water recovery rate boosted to 98.0%.';
        } else if (system === 'AUX_BATTERY_BANK' || system === 'POWER_BACKUP') {
          next.habitatResources.batteryStorageKwh = Math.min(250.0, next.habitatResources.batteryStorageKwh + 30.0);
          next.habitatResources.batteryStateOfChargePercent = Math.min(
            100.0,
            Number(((next.habitatResources.batteryStorageKwh / 200.0) * 100.0).toFixed(1))
          );
          message = 'Auxiliary solid-state battery bank tied into electrical bus (+30 kWh capacity).';
        } else if (system === 'O2_SURGE_TANK' || system === 'OXYGEN_BACKUP') {
          next.habitatResources.oxygenInventoryKg = Math.min(500.0, next.habitatResources.oxygenInventoryKg + 10.0);
          message = 'High-pressure gaseous oxygen surge tank discharged into cabin buffer (+10.0 kg O2).';
        } else {
          message = `Backup equipment system "${system}" engaged into habitat bus.`;
        }
      } else if (command.action === 'RECYCLE_CO2_SCRUBBER' || command.action === 'DIVERT_CDRA_BED') {
        next.habitatResources.co2RemovalCapacityKgPerHour = 0.35;
        const cdra = next.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-CDRA-01' || e.equipmentId === 'EQ-ECLSS-02' || e.equipmentName.includes('CDRA'));
        if (cdra) {
          cdra.condition = 100.0;
          cdra.status = 'OPERATIONAL';
          cdra.maintenanceRequired = false;
        }
        message = 'CDRA zeolite and desiccant beds regenerated. ppCO2 scrub rate restored to nominal capacity.';
      } else if (command.action === 'BOOST_OXYGEN_INJECTION') {
        next.habitatResources.oxygenInventoryKg = Math.min(500.0, next.habitatResources.oxygenInventoryKg + 5.0);
        message = 'Auxiliary high-pressure oxygen pulse injection delivered to habitat cabin atmosphere.';
      } else if (command.action === 'FLUSH_WATER_CATALYST') {
        next.habitatResources.waterRecoveryRatePercent = 95.0;
        const wrs = next.equipment.find((e) => e.equipmentId === 'EQ-ECLSS-WRS-01' || e.equipmentId === 'EQ-ECLSS-01' || e.equipmentName.includes('Water'));
        if (wrs) {
          wrs.condition = 100.0;
          wrs.status = 'OPERATIONAL';
          wrs.maintenanceRequired = false;
        }
        message = 'Water Recovery System catalytic core flushed. Gray water recycling efficiency at 95%.';
      } else {
        message = `ECLSS directive ${command.action} acknowledged and applied to habitat loop.`;
      }
      break;
    }

    case 'POWER_GRID': {
      if (
        command.action === 'START_MAINTENANCE' ||
        command.action === 'PERFORM_MAINTENANCE'
      ) {
        const targetId = String(command.parameters.equipmentId ?? 'EQ-EPS-SOLAR-01');
        const target = next.equipment.find((e) => e.equipmentId === targetId);
        if (target) {
          target.condition = 100.0;
          target.maintenanceRequired = false;
          target.status = 'OPERATIONAL';
          message = `Power generation maintenance completed on ${target.equipmentName}. Condition 100%.`;
        }
      } else if (command.action === 'PRIORITIZE_SYSTEMS') {
        const mode = String(command.parameters.priorityMode ?? 'POWER_CONSERVATION');
        if (mode === 'POWER_CONSERVATION') {
          const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
          if (airlock) airlock.status = 'STANDBY';
          next.habitatResources.powerDemandKw = 23.5;
          severity = 'CAUTION';
          message = 'Electrical bus reconfigured to POWER CONSERVATION mode (demand: 23.5 kW).';
        } else {
          next.habitatResources.powerDemandKw = 28.4;
          message = 'Electrical bus reconfigured to BALANCED mode.';
        }
      } else if (command.action === 'REDUCE_NON_ESSENTIAL_POWER' || command.action === 'SHED_LOAD') {
        const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
        if (airlock) airlock.status = 'STANDBY';
        next.habitatResources.powerDemandKw = Math.max(18.0, Number((next.habitatResources.powerDemandKw - 4.5).toFixed(1)));
        severity = 'CAUTION';
        message = 'Non-critical habitat payloads shed. Electrical bus demand reduced by 4.5 kW.';
      } else if (command.action === 'RESTORE_FULL_POWER') {
        next.habitatResources.powerDemandKw = 28.4;
        const airlock = next.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
        if (airlock && airlock.status === 'STANDBY') airlock.status = 'OPERATIONAL';
        message = 'Nominal electrical bus distribution restored across all science and crew modules.';
      } else if (command.action === 'ACTIVATE_BACKUP_EQUIPMENT' || command.action === 'ACTIVATE_AUX_BATTERY') {
        next.habitatResources.batteryStorageKwh = Math.min(
          250.0,
          next.habitatResources.batteryStorageKwh + 30.0
        );
        next.habitatResources.batteryStateOfChargePercent = Math.min(
          100.0,
          Number(((next.habitatResources.batteryStorageKwh / 200.0) * 100.0).toFixed(1))
        );
        message = 'Auxiliary solid-state battery reserve bus tied into primary electrical distribution (+30 kWh).';
      } else if (command.action === 'TOGGLE_EQUIPMENT_POWER') {
        const eqId = String(command.parameters.equipmentId ?? '');
        const targetEq = next.equipment.find((e) => e.equipmentId === eqId);
        if (targetEq) {
          targetEq.status = targetEq.status === 'STANDBY' ? 'OPERATIONAL' : 'STANDBY';
          message = `Equipment ${targetEq.equipmentName} (${eqId}) operating status set to ${targetEq.status}.`;
        } else {
          message = `Equipment target ${eqId} not found in telemetry registry.`;
          success = false;
        }
      } else {
        message = `Power grid directive ${command.action} executed.`;
      }
      break;
    }

    case 'CREW_SCHEDULE': {
      const targetId = command.targetAstronautId || 'CREW-01';
      const astronaut = next.crew.find((c) => c.astronautId === targetId);

      if (!astronaut) {
        success = false;
        message = `Target astronaut ${targetId} not found in 4-member complement.`;
        break;
      }

      if (command.action === 'ASSIGN_SLEEP') {
        if (astronaut.availability === 'ON_EVA') {
          success = false;
          message = `Cannot assign sleep while ${astronaut.name} is on active EVA. Ingress airlock first.`;
          break;
        }
        const hours = Math.max(1.0, Math.min(12.0, Number(command.parameters.sleepHours ?? 8.0)));
        astronaut.availability = 'SLEEPING';
        astronaut.sleepHours = Math.min(12.0, Number((astronaut.sleepHours + hours).toFixed(1)));
        astronaut.fatigueIndex = Math.max(0.0, Number((astronaut.fatigueIndex - hours * 3.5).toFixed(1)));
        astronaut.stressIndex = Math.max(0.0, Number((astronaut.stressIndex - hours * 2.0).toFixed(1)));
        astronaut.workloadIndex = 0.0;
        message = `Circadian sleep cycle (${hours}h) assigned to ${astronaut.name}. Cognitive recovery active.`;
      } else if (command.action === 'ASSIGN_REST' || command.action === 'MANDATE_REST') {
        if (astronaut.availability === 'ON_EVA') {
          success = false;
          message = `Cannot assign rest period while ${astronaut.name} is on EVA. Ingress airlock first.`;
          break;
        }
        const restHours = Math.max(1.0, Math.min(8.0, Number(command.parameters.restHours ?? 2.0)));
        astronaut.availability = 'RESTING';
        astronaut.fatigueIndex = Math.max(0.0, Number((astronaut.fatigueIndex - restHours * 2.5).toFixed(1)));
        astronaut.stressIndex = Math.max(0.0, Number((astronaut.stressIndex - restHours * 3.0).toFixed(1)));
        astronaut.workloadIndex = 10.0;
        message = `${restHours}-hour scheduled rest period assigned to ${astronaut.name}. Fatigue and stress reduced.`;
      } else if (command.action === 'ASSIGN_EXERCISE' || command.action === 'MANDATE_EXERCISE') {
        if (astronaut.fatigueIndex > 85.0) {
          success = false;
          message = `Exercise session rejected for ${astronaut.name}: fatigue index (${astronaut.fatigueIndex}%) exceeds 85% safety limit.`;
          break;
        }
        if (astronaut.availability === 'SLEEPING' || astronaut.availability === 'ON_EVA') {
          success = false;
          message = `Cannot assign exercise while ${astronaut.name} is sleeping or on EVA.`;
          break;
        }
        const mins = Math.max(15, Math.min(120, Number(command.parameters.exerciseMinutes ?? 45)));
        astronaut.exerciseMinutes = Math.min(180, astronaut.exerciseMinutes + mins);
        astronaut.stressIndex = Math.max(0.0, Number((astronaut.stressIndex - mins * 0.2).toFixed(1)));
        astronaut.workloadIndex = Math.min(100.0, astronaut.workloadIndex + 15.0);
        message = `${mins}-minute countermeasure exercise session completed by ${astronaut.name} on T2 treadmill / ARED.`;
      } else if (command.action === 'ASSIGN_WORK_TASK' || command.action === 'ASSIGN_TASK') {
        if (astronaut.availability === 'MEDICAL_RESTRICTED') {
          success = false;
          message = `Cannot assign work task: ${astronaut.name} is medically restricted from duty.`;
          break;
        }
        if (astronaut.availability === 'SLEEPING') {
          success = false;
          message = `Cannot assign work task while ${astronaut.name} is in circadian sleep period. Wake astronaut first.`;
          break;
        }
        const taskId = String(command.parameters.taskId ?? 'TASK-HABITAT-MAINTENANCE');
        const intensity = Math.max(10, Math.min(100, Number(command.parameters.workloadIntensity ?? 50)));
        if (!astronaut.assignedTasks.includes(taskId)) {
          astronaut.assignedTasks.push(taskId);
        }
        astronaut.workloadIndex = intensity;
        astronaut.availability = 'AVAILABLE';
        message = `Task "${taskId}" assigned to ${astronaut.name} at ${intensity}% workload intensity.`;
      } else if (command.action === 'ALLOCATE_NUTRITION') {
        const calories = Math.max(200, Math.min(4000, Number(command.parameters.caloriesKcal ?? 1000)));
        if (next.habitatResources.foodInventoryKcal < calories) {
          success = false;
          message = `Insufficient food inventory in habitat store (${next.habitatResources.foodInventoryKcal.toFixed(0)} kcal remaining).`;
          break;
        }
        next.habitatResources.foodInventoryKcal = Math.max(0, next.habitatResources.foodInventoryKcal - calories);
        astronaut.nutritionScore = Math.min(100.0, Number((astronaut.nutritionScore + calories / 150).toFixed(1)));
        astronaut.fatigueIndex = Math.max(0.0, Number((astronaut.fatigueIndex - 3.0).toFixed(1)));
        message = `${calories} kcal nutrition allocation provided to ${astronaut.name}. Nutrition score at ${astronaut.nutritionScore}.`;
      } else {
        message = `Crew flight directive ${command.action} dispatched to ${astronaut.name}.`;
      }
      break;
    }

    case 'EVA_CONTROL': {
      const targetId = command.targetAstronautId || 'CREW-02';
      const astronaut = next.crew.find((c) => c.astronautId === targetId);

      if (command.action === 'AUTHORIZE_EVA') {
        if (astronaut) {
          astronaut.availability = 'ON_EVA';
          message = `EVA surface sortie authorized for ${astronaut.name}. Airlock egress approved.`;
        }
      } else if (command.action === 'TERMINATE_EVA') {
        if (astronaut) {
          astronaut.availability = 'AVAILABLE';
          message = `EVA terminated. ${astronaut.name} ingressed into habitat airlock and repressurized.`;
        }
      } else {
        message = `EVA control instruction ${command.action} confirmed by telemetry.`;
      }
      break;
    }

    case 'EMERGENCY': {
      if (command.action === 'TRIGGER_EMERGENCY_SCENARIO') {
        const scenarioId = String(command.parameters.scenarioId || 'SCENARIO-EMG-01-O2-LEAK');
        next.emergency.activeScenario = scenarioId;
        next.emergency.responseActions = [];

        if (scenarioId === 'SCENARIO-EMG-01-O2-LEAK') {
          next.emergency.severity = 'CRITICAL';
          next.emergency.remainingResponseTimeSeconds = 1200; // 20m
          next.habitatResources.oxygenInventoryKg = Math.max(0.0, Number((next.habitatResources.oxygenInventoryKg - 10.0).toFixed(2)));
          next.habitatResources.oxygenConsumptionRateKgPerHour = 1.20;
          message = 'EMERGENCY: Cryogenic Oxygen line breach detected. Bleed rate: 1.20 kg/hr. 20-minute response deadline initiated.';
          severity = 'CRITICAL';
        } else if (scenarioId === 'SCENARIO-EMG-02-POWER-COLLAPSE') {
          next.emergency.severity = 'CRITICAL';
          next.emergency.remainingResponseTimeSeconds = 1800; // 30m
          const reactor = next.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
          if (reactor) {
            reactor.condition = 10.0;
            reactor.status = 'FAILED';
            reactor.maintenanceRequired = true;
          }
          next.habitatResources.batteryStorageKwh = 20.0;
          next.habitatResources.batteryStateOfChargePercent = 10.0;
          next.habitatResources.powerGenerationKw = 8.2;
          message = 'EMERGENCY: Surface Fission Reactor SCRAM tripped. Generation down to 8.2 kW. Battery brownout imminent in 30 minutes.';
          severity = 'CRITICAL';
        } else if (scenarioId === 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT') {
          next.emergency.severity = 'CRITICAL';
          next.emergency.remainingResponseTimeSeconds = 1200; // 20m (Flight Rule 9.2)
          next.environment.educationalRadiationHazardIndex = 92.0;
          next.crew = next.crew.map((c) => ({
            ...c,
            stressIndex: Math.min(100.0, c.stressIndex + 25.0),
          })) as CrewComplement;
          message = 'EMERGENCY: Class X Solar Particle Event alert. Radiation hazard index spiked to 92.0. Mandatory storm shelter ingress required (Flight Rule 9.2).';
          severity = 'CRITICAL';
        } else if (scenarioId === 'SCENARIO-EMG-04-COMMS-BLACKOUT') {
          next.emergency.severity = 'WARNING';
          next.emergency.remainingResponseTimeSeconds = 2400; // 40m
          next.communications.status = 'DISCONNECTED';
          next.communications.availabilityPercent = 0.0;
          message = 'CAUTION: Deep Space Network carrier lock lost. Communications DISCONNECTED. Ground assistance blocked under Flight Rule 11.5.';
          severity = 'WARNING';
        } else if (scenarioId === 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT') {
          next.emergency.severity = 'CRITICAL';
          next.emergency.remainingResponseTimeSeconds = 1800; // 30m
          const cdra = next.equipment.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('Carbon Dioxide'));
          if (cdra) {
            cdra.condition = 15.0;
            cdra.status = 'FAILED';
            cdra.maintenanceRequired = true;
          }
          next.habitatResources.co2RemovalCapacityKgPerHour = 0.00;
          message = 'EMERGENCY: CDRA Amine Bed heater burnout. CO2 scrubbing halted at 0.00 kg/hr. Cabin ppCO2 rising rapidly.';
          severity = 'CRITICAL';
        } else {
          next.emergency.severity = 'WARNING';
          next.emergency.remainingResponseTimeSeconds = 1800;
          message = `Contingency scenario ${scenarioId} initiated.`;
        }
      } else if (command.action === 'ISOLATE_O2_LEAK') {
        next.habitatResources.oxygenConsumptionRateKgPerHour = 0.14;
        next.habitatResources.oxygenInventoryKg = Math.max(0.0, Number((next.habitatResources.oxygenInventoryKg - 2.0).toFixed(2))); // purge
        next.emergency.responseActions.push({
          actionId: 'ACT-O2-ISOLATE-LINE',
          description: 'Damaged Cryogenic Line Segment B Isolated at Valve MV-02',
          status: 'COMPLETED',
          authorizedBy: 'CREW_AUTONOMY',
        });
        message = 'Cryogenic line segment B isolated at motor valve MV-02. Feedline leak arrested. Consumable bleed rate normalized to 0.14 kg/hr.';
        severity = 'INFO';
      } else if (command.action === 'MOVE_CREW_TO_SHELTER') {
        next.environment.educationalRadiationHazardIndex = 15.0; // Shielded
        next.crew = next.crew.map((c) => ({
          ...c,
          assignedTasks: [...new Set([...c.assignedTasks, 'STORM_SHELTER_CONFINEMENT'])],
          stressIndex: Math.min(100.0, c.stressIndex + 10.0),
          workloadIndex: Math.min(100.0, c.workloadIndex + 15.0),
        })) as CrewComplement;
        next.emergency.responseActions.push({
          actionId: 'ACT-RAD-MOVE-SHELTER',
          description: 'All 4 Crew Ingressed into Core Storm Shelter',
          status: 'COMPLETED',
          authorizedBy: 'CREW_AUTONOMY',
        });
        message = 'All 4 astronauts relocated into Core Storm Shelter. Hydrogenous regolith shielding engaged. Radiation dose rate attenuated by 92%.';
        severity = 'INFO';
      } else if (command.action === 'DEPLOY_WATER_SHIELD') {
        next.emergency.responseActions.push({
          actionId: 'ACT-RAD-DEPLOY-WATER-SHIELD',
          description: '150 Liters Greywater Pumped into Ceiling Radiation Baffles',
          status: 'COMPLETED',
          authorizedBy: 'CREW_AUTONOMY',
        });
        message = '150 Liters of greywater pumped into overhead storm ceiling baffles. Secondary radiation stopping power maximized.';
        severity = 'INFO';
      } else if (command.action === 'REQUEST_GROUND_DIAGNOSTICS') {
        next.emergency.responseActions.push({
          actionId: 'ACT-O2-GROUND-DIAG',
          description: 'Ground POIC Transducer Analysis Confirms Joint B-4 Rupture',
          status: 'COMPLETED',
          authorizedBy: 'GROUND',
        });
        next.crew = next.crew.map((c) => ({ ...c, stressIndex: Math.max(0.0, c.stressIndex - 10.0) })) as CrewComplement;
        message = 'Ground ECLSS flight controllers confirm acoustic transducer analysis: Manifold Joint B-4 isolated successfully. Secondary feedline certified nominal.';
        severity = 'INFO';
      } else if (command.action === 'REQUEST_GROUND_REACTOR_RESTART') {
        const reactor = next.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
        if (reactor) {
          reactor.condition = 100.0;
          reactor.status = 'OPERATIONAL';
          reactor.maintenanceRequired = false;
        }
        next.habitatResources.powerGenerationKw = 34.2;
        next.emergency.responseActions.push({
          actionId: 'ACT-PWR-GROUND-RESTART',
          description: 'Ground Reactor SCRAM Override & Stirling Restart Confirmed',
          status: 'COMPLETED',
          authorizedBy: 'GROUND',
        });
        next.crew = next.crew.map((c) => ({ ...c, stressIndex: Math.max(0.0, c.stressIndex - 10.0) })) as CrewComplement;
        message = 'Ground Reactor Team completes bypass valve cycle and automated Stirling restart. Baseline 24.0 kW nuclear generation restored.';
        severity = 'INFO';
      } else if (command.action === 'REQUEST_RADIATION_TRAJECTORY') {
        next.emergency.responseActions.push({
          actionId: 'ACT-RAD-EARTH-HELIOPHY',
          description: 'NOAA SWPC Heliophysics CME Trajectory Model Received',
          status: 'COMPLETED',
          authorizedBy: 'GROUND',
        });
        next.crew = next.crew.map((c) => ({ ...c, stressIndex: Math.max(0.0, c.stressIndex - 15.0) })) as CrewComplement;
        message = 'NOAA SWPC and SRAG telemetry uplink: CME core trajectory peak passing south lunar limb. Ambient flux projected below threshold within 24 hours.';
        severity = 'INFO';
      } else if (command.action === 'REQUEST_GROUND_UPLINK') {
        next.emergency.responseActions.push({
          actionId: 'ACT-COMMS-GROUND-DIRECTIVE',
          description: 'Houston MCC Emergency Carrier Synchronization Received',
          status: 'COMPLETED',
          authorizedBy: 'GROUND',
        });
        message = 'Houston MCC emergency carrier sync packet downlinked. Direct DSN lock confirmed.';
        severity = 'INFO';
      } else if (command.action === 'REQUEST_SURGEON_AIR_ANALYSIS') {
        next.emergency.responseActions.push({
          actionId: 'ACT-CDRA-GROUND-OVERRIDE',
          description: 'Flight Surgeon Hypercapnia Assessment & Clearance Received',
          status: 'COMPLETED',
          authorizedBy: 'GROUND',
        });
        next.crew = next.crew.map((c) => ({ ...c, stressIndex: Math.max(0.0, c.stressIndex - 15.0) })) as CrewComplement;
        message = 'Houston BMed Flight Surgeon confirms crew cognitive battery normal. Authorized ventilation purge cycle steps.';
        severity = 'INFO';
      } else if (command.action === 'RESOLVE_EMERGENCY') {
        next.emergency.activeScenario = null;
        next.emergency.severity = 'NONE';
        next.emergency.remainingResponseTimeSeconds = null;
        message = 'Emergency contingency successfully resolved. Habitat telemetry returned to nominal flight rules envelope.';
        severity = 'INFO';
      } else if (command.action === 'RESET_EMERGENCY') {
        next.emergency.activeScenario = null;
        next.emergency.severity = 'NONE';
        next.emergency.remainingResponseTimeSeconds = null;
        next.emergency.responseActions = [];
        next.habitatResources.oxygenConsumptionRateKgPerHour = 0.14;
        next.environment.educationalRadiationHazardIndex = 18.0;
        next.communications.status = 'CONNECTED';
        next.communications.availabilityPercent = 100.0;

        const cdra = next.equipment.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('Carbon Dioxide'));
        if (cdra && cdra.status === 'FAILED') {
          cdra.condition = 92.0;
          cdra.status = 'OPERATIONAL';
          cdra.maintenanceRequired = false;
        }

        const reactor = next.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
        if (reactor && reactor.status === 'FAILED') {
          reactor.condition = 100.0;
          reactor.status = 'OPERATIONAL';
          reactor.maintenanceRequired = false;
          next.habitatResources.powerGenerationKw = 34.2;
        }

        next.crew = next.crew.map((c) => ({
          ...c,
          assignedTasks: c.assignedTasks.filter((t) => t !== 'STORM_SHELTER_CONFINEMENT'),
        })) as CrewComplement;

        message = 'Emergency response simulator reset to initial baseline flight conditions.';
        severity = 'INFO';
      } else if (command.action === 'EXECUTE_CHECKLIST_STEP') {
        if (next.emergency.activeScenario) {
          const actionStep = {
            actionId: `ACT-RES-${Date.now().toString(36).toUpperCase()}`,
            description: String(command.parameters.stepName || 'Emergency Procedure Step Executed'),
            status: 'COMPLETED' as const,
            authorizedBy: 'GROUND' as const,
          };
          next.emergency.responseActions.push(actionStep);

          if (next.emergency.responseActions.length >= 2 || command.parameters.resolveImmediately === true) {
            next.emergency.activeScenario = null;
            next.emergency.severity = 'NONE';
            next.emergency.remainingResponseTimeSeconds = null;
            message = 'Emergency contingency procedure verified and fully resolved. Cabin telemetry nominal.';
            severity = 'INFO';
          } else {
            message = `Contingency action executed. Steps completed: ${next.emergency.responseActions.length}.`;
            severity = 'CAUTION';
          }
        } else {
          message = 'No active emergency scenario currently flagged in habitat telemetry.';
        }
      } else if (command.action === 'SEAL_AIRLOCK') {
        message = 'Primary and secondary airlock bulkheads secured and pressure integrity verified.';
      } else if (command.action === 'TRIGGER_FIRE_SUPPRESSION') {
        message = 'Automated nitrogen inerting fire suppression discharged in avionics bay.';
        severity = 'WARNING';
      } else {
        message = `Emergency procedure ${command.action} broadcast to crew.`;
      }
      break;
    }

    case 'COMMUNICATIONS': {
      if (command.action === 'REALIGN_HIGH_GAIN_ANTENNA') {
        next.communications.status = 'CONNECTED';
        next.communications.availabilityPercent = 100.0;
        message = 'High-gain gimbal realigned with Goldstone DSN. Communication link connected at 100%.';
      } else if (command.action === 'SWITCH_GATEWAY_RELAY') {
        next.communications.status = 'CONNECTED';
        next.communications.availabilityPercent = 95.0;
        message = 'Switched to Lunar Gateway NRHO halo relay downlink.';
      } else {
        message = `Communications directive ${command.action} confirmed.`;
      }
      break;
    }

    case 'SCIENCE_INSTRUMENTS': {
      if (command.action === 'RUN_CORE_DRILL_ANALYSIS') {
        message = 'Permanently shadowed region volatile core sample spectrometer scan completed.';
      } else {
        message = `Science instrument directive ${command.action} dispatched to surface array.`;
      }
      break;
    }

    default:
      message = `Directive ${command.action} applied.`;
  }

  // Create action history audit record
  const actionRecord: MissionActionRecord = {
    actionId: `ACT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    timestampHours: currentHours,
    command: command.action,
    subsystem: command.subsystem,
    initiatedBy: command.initiatedBy ?? 'GROUND',
    outcome: success ? 'SUCCESS' : 'FAILED',
    parameters: command.parameters,
    targetAstronautId: command.targetAstronautId,
  };

  // Create event log audit record
  const metFormatted = formatSimulationTime(currentHours, next.mission.missionDay);
  const affectedSys = mapCategoryToAffectedSystem(command.subsystem);

  const eventRecord: MissionEventRecord = {
    eventId: `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    timestampHours: currentHours,
    simulationTime: metFormatted,
    affectedSystem: affectedSys,
    category: command.subsystem,
    eventType: 'USER_DIRECTIVE',
    title: `DIRECTIVE: ${command.action}`,
    details: message,
    severity,
    previousValue: null,
    newValue: `Executed on ${command.subsystem}`,
    trigger: `Student Commander flight directive: ${command.action}`,
    relatedUserAction: command.action,
    educationalExplanation: getEducationalExplanation(command.subsystem, command.action, severity),
    acknowledged: false,
  };

  // Keep audit histories bounded
  next.records.actionHistory.unshift(actionRecord);
  if (next.records.actionHistory.length > 100) {
    next.records.actionHistory.pop();
  }

  next.records.eventHistory.unshift(eventRecord);
  if (next.records.eventHistory.length > 200) {
    next.records.eventHistory.pop();
  }

  return {
    updatedState: next,
    actionRecord,
    eventRecord,
    success,
    message,
  };
}
