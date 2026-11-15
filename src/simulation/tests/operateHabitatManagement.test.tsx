/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * OPERATE Module: Habitat Management, ECLSS & Resource Conservation Tests
 *
 * Verifies:
 * 1. Six functional systems (O2, CO2, Water, Food, Power, Maintenance).
 * 2. Operational controls issue validated mission commands and mutate shared state:
 *    - Start maintenance
 *    - Prioritize systems
 *    - Reduce non-essential power
 *    - Change resource allocations
 *    - Activate available backup equipment
 * 3. Physical system dependencies:
 *    - Power availability affects powered equipment (load shedding & blackout).
 *    - Equipment health affects system capacity (CDRA -> CO2 scrub, WRS -> water recovery).
 *    - CO2 removal performance affects cabin air quality.
 *    - Water recovery affects available water.
 *    - Resource consumption depends on crew and mission conditions.
 * 4. Deterministic resource balances and physical non-negative limits.
 * 5. Full UI rendering and interactive control dispatch.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import {
  createInitialMissionState,
  simulateOxygen,
  simulateCO2Removal,
  simulateWater,
  simulatePower,
  simulateEquipment,
} from '@/simulation/engine/core';
import { DEFAULT_SIMULATION_CONFIG } from '@/simulation/engine/config';
import { OperateHabitatView } from '@/features/operate/OperateHabitatView';

describe('OPERATE Habitat Management Module & Subsystem Dependencies', () => {
  beforeEach(() => {
    useMissionStore.getState().resetMission();
  });

  // ==========================================================================
  // 1. Operational Directives & Validated Command Execution
  // ==========================================================================
  describe('1. Operational Directives & Command Dispatching', () => {
    it('executes START_MAINTENANCE to restore degraded equipment condition to 100% and OPERATIONAL status', () => {
      const store = useMissionStore.getState();

      // Degrade CDRA scrubber condition
      const current = useMissionStore.getState().missionState;
      const cdra = current.equipment.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('Carbon Dioxide'))!;
      cdra.condition = 25.0;
      cdra.status = 'MAINTENANCE_REQUIRED';
      cdra.maintenanceRequired = true;
      useMissionStore.setState({ missionState: { ...current } });

      const result = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'START_MAINTENANCE',
        parameters: { equipmentId: cdra.equipmentId },
        initiatedBy: 'GROUND',
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      const updatedCdra = updated.equipment.find((e) => e.equipmentId === cdra.equipmentId)!;
      expect(updatedCdra.condition).toBe(100.0);
      expect(updatedCdra.status).toBe('OPERATIONAL');
      expect(updatedCdra.maintenanceRequired).toBe(false);
      expect(updated.habitatResources.co2RemovalCapacityKgPerHour).toBe(0.35);

      // Verify audit record
      expect(updated.records.actionHistory.some((a) => a.command === 'START_MAINTENANCE')).toBe(true);
    });

    it('executes PRIORITIZE_SYSTEMS to shift operational bus to LIFE_SUPPORT or POWER_CONSERVATION', () => {
      const store = useMissionStore.getState();

      const result = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'PRIORITIZE_SYSTEMS',
        parameters: { priorityMode: 'LIFE_SUPPORT' },
        initiatedBy: 'GROUND',
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      expect(updated.habitatResources.powerDemandKw).toBeLessThanOrEqual(25.0);

      const airlock = updated.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
      expect(airlock?.status).toBe('STANDBY');
    });

    it('executes REDUCE_NON_ESSENTIAL_POWER (load shedding) to reduce electrical power demand', () => {
      const store = useMissionStore.getState();
      const initialDemand = store.missionState.habitatResources.powerDemandKw;

      const result = store.executeMissionCommand({
        subsystem: 'POWER_GRID',
        action: 'REDUCE_NON_ESSENTIAL_POWER',
        parameters: {},
        initiatedBy: 'GROUND',
      });

      expect(result.success).toBe(true);

      const updated = useMissionStore.getState().missionState;
      expect(updated.habitatResources.powerDemandKw).toBeLessThan(initialDemand);

      const airlock = updated.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');
      expect(airlock?.status).toBe('STANDBY');
    });

    it('executes CHANGE_RESOURCE_ALLOCATION for oxygen and food rationing modes', () => {
      const store = useMissionStore.getState();

      // Change O2 allocation to CONSERVATIVE
      const o2Result = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'CHANGE_RESOURCE_ALLOCATION',
        parameters: { resourceType: 'OXYGEN', allocationTier: 'CONSERVATIVE' },
      });
      expect(o2Result.success).toBe(true);
      expect(useMissionStore.getState().missionState.habitatResources.oxygenConsumptionRateKgPerHour).toBe(0.12);

      // Change food allocation to RATIONED
      const foodResult = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'CHANGE_RESOURCE_ALLOCATION',
        parameters: { resourceType: 'FOOD', allocationTier: 'RATIONED' },
      });
      expect(foodResult.success).toBe(true);
      expect(useMissionStore.getState().missionState.habitatResources.foodConsumptionKcalPerHour).toBe(400.0);
    });

    it('executes ACTIVATE_BACKUP_EQUIPMENT to engage CDRA Bed B, Aux WRS Core, or Aux Battery', () => {
      const store = useMissionStore.getState();

      // Engage CDRA Bed B
      const cdraResult = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { backupSystem: 'CDRA_BED_B' },
      });
      expect(cdraResult.success).toBe(true);
      expect(useMissionStore.getState().missionState.habitatResources.co2RemovalCapacityKgPerHour).toBe(0.35);

      // Engage Aux WRS Core
      const wrsResult = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { backupSystem: 'WRS_AUX_CORE' },
      });
      expect(wrsResult.success).toBe(true);
      expect(useMissionStore.getState().missionState.habitatResources.waterRecoveryRatePercent).toBe(98.0);

      // Engage Aux Battery Bank
      const prevBattery = useMissionStore.getState().missionState.habitatResources.batteryStorageKwh;
      const batteryResult = store.executeMissionCommand({
        subsystem: 'ECLSS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { backupSystem: 'AUX_BATTERY_BANK' },
      });
      expect(batteryResult.success).toBe(true);
      expect(useMissionStore.getState().missionState.habitatResources.batteryStorageKwh).toBeGreaterThan(prevBattery);
    });
  });

  // ==========================================================================
  // 2. Physical Dependencies & Deterministic System Calculations
  // ==========================================================================
  describe('2. Physical System Dependencies in Simulation Engine', () => {
    it('dependency: Equipment health degrades system capacity (CDRA condition scales CO2 removal)', () => {
      const pristineState = createInitialMissionState();
      const nominalSim = simulateCO2Removal(pristineState, 1.0, DEFAULT_SIMULATION_CONFIG);
      const nominalCapacity = nominalSim.habitatResources.co2RemovalCapacityKgPerHour;

      // Degrade CDRA to 50% condition
      const degradedState = createInitialMissionState();
      const cdra = degradedState.equipment.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('Carbon Dioxide'))!;
      cdra.condition = 50.0;

      const degradedSim = simulateCO2Removal(degradedState, 1.0, DEFAULT_SIMULATION_CONFIG);
      expect(degradedSim.habitatResources.co2RemovalCapacityKgPerHour).toBeLessThan(nominalCapacity);
      expect(degradedSim.habitatResources.co2RemovalCapacityKgPerHour).toBeCloseTo(0.14, 2);
    });

    it('dependency: Water recovery equipment condition scales water recovery percentage', () => {
      const pristineState = createInitialMissionState();
      const nominalSim = simulateWater(pristineState, 10.0, DEFAULT_SIMULATION_CONFIG);
      const nominalRecovery = nominalSim.habitatResources.waterRecoveryRatePercent;

      // Degrade WRS to 60% condition
      const degradedState = createInitialMissionState();
      const wrs = degradedState.equipment.find((e) => e.equipmentName.includes('Water'))!;
      wrs.condition = 60.0;

      const degradedSim = simulateWater(degradedState, 10.0, DEFAULT_SIMULATION_CONFIG);
      expect(degradedSim.habitatResources.waterRecoveryRatePercent).toBeLessThan(nominalRecovery);
    });

    it('dependency: Power availability affects powered equipment and triggers load shedding', () => {
      const state = createInitialMissionState();

      // Set low battery state of charge (20%)
      state.habitatResources.batteryStateOfChargePercent = 20.0;
      state.habitatResources.batteryStorageKwh = 40.0;

      const simEquipment = simulateEquipment(state, 1.0, DEFAULT_SIMULATION_CONFIG);
      const airlock = simEquipment.equipment.find((e) => e.equipmentId === 'EQ-HAB-AIRLOCK-01');

      // Non-essential airlock should be placed into STANDBY during power shortage
      expect(airlock?.status).toBe('STANDBY');
    });

    it('dependency: Complete blackout forces non-nuclear equipment to FAILED status', () => {
      const state = createInitialMissionState();
      state.habitatResources.batteryStorageKwh = 0.05;
      state.habitatResources.powerGenerationKw = 10.0;
      state.habitatResources.powerDemandKw = 25.0;

      const simEquipment = simulateEquipment(state, 1.0, DEFAULT_SIMULATION_CONFIG);
      const cdra = simEquipment.equipment.find((e) => e.equipmentId.includes('CDRA') || e.equipmentName.includes('Carbon Dioxide'));
      expect(cdra?.status).toBe('FAILED');
    });

    it('dependency: Water recovery mitigates water loss compared to failed reclamation loop', () => {
      const base = createInitialMissionState();

      // 1. With nominal water recovery (93.4%)
      const nominalRecovState = simulateWater(base, 24.0, DEFAULT_SIMULATION_CONFIG);
      const nominalWaterLost = base.habitatResources.waterInventoryLiters - nominalRecovState.habitatResources.waterInventoryLiters;

      // 2. With completely failed WRS loop (0% recovery)
      const failedWrsState = createInitialMissionState();
      const wrs = failedWrsState.equipment.find((e) => e.equipmentName.includes('Water'))!;
      wrs.status = 'FAILED';
      wrs.condition = 0.0;

      const failedSim = simulateWater(failedWrsState, 24.0, DEFAULT_SIMULATION_CONFIG);
      const failedWaterLost = failedWrsState.habitatResources.waterInventoryLiters - failedSim.habitatResources.waterInventoryLiters;

      // Failed WRS should lose substantially more water over 24 hours
      expect(failedWaterLost).toBeGreaterThan(nominalWaterLost * 5);
    });
  });

  // ==========================================================================
  // 3. Resource Conservation & Non-Negative Inventories
  // ==========================================================================
  describe('3. Resource Conservation & Non-Negative Physical Limits', () => {
    it('strictly prevents negative oxygen inventory during prolonged deprivation', () => {
      const state = createInitialMissionState();
      state.habitatResources.oxygenInventoryKg = 0.05; // tiny reserve

      // Advance by 24 hours with active crew
      const afterSim = simulateOxygen(state, 24.0, DEFAULT_SIMULATION_CONFIG);

      expect(afterSim.habitatResources.oxygenInventoryKg).toBe(0.0);
      expect(afterSim.habitatResources.oxygenInventoryKg).toBeGreaterThanOrEqual(0.0);
    });

    it('strictly prevents negative water inventory during prolonged drought', () => {
      const state = createInitialMissionState();
      state.habitatResources.waterInventoryLiters = 0.5;

      const afterSim = simulateWater(state, 48.0, DEFAULT_SIMULATION_CONFIG);

      expect(afterSim.habitatResources.waterInventoryLiters).toBe(0.0);
      expect(afterSim.habitatResources.waterInventoryLiters).toBeGreaterThanOrEqual(0.0);
    });

    it('strictly bounds battery storage within physical limits [0, capacity]', () => {
      const state = createInitialMissionState();

      // 1. Overcharging scenario (huge generation, low demand)
      state.habitatResources.powerGenerationKw = 200.0;
      state.habitatResources.powerDemandKw = 10.0;
      state.habitatResources.batteryStorageKwh = 199.0;

      const overcharged = simulatePower(state, 10.0, DEFAULT_SIMULATION_CONFIG);
      expect(overcharged.habitatResources.batteryStorageKwh).toBeLessThanOrEqual(DEFAULT_SIMULATION_CONFIG.batteryCapacityKwh);
      expect(overcharged.habitatResources.batteryStateOfChargePercent).toBe(100.0);

      // 2. Discharging scenario (reactor disabled, surface in shadow)
      state.environment.solarPowerAvailabilityPercent = 0.0;
      const reactor = state.equipment.find((e) => e.equipmentId === 'EQ-EPS-REACTOR-01');
      if (reactor) reactor.condition = 0.0;
      state.habitatResources.batteryStorageKwh = 5.0;

      const depleted = simulatePower(state, 10.0, DEFAULT_SIMULATION_CONFIG);
      expect(depleted.habitatResources.batteryStorageKwh).toBe(0.0);
      expect(depleted.habitatResources.batteryStateOfChargePercent).toBe(0.0);
    });

    it('continuous time ticking causes deterministic mechanical wear and flags maintenanceRequired', () => {
      let state = createInitialMissionState();

      // Set CDRA condition to 31.0% (just above maintenance threshold of 30.0%)
      const cdra = state.equipment.find((e) => e.equipmentId.includes('CDRA'))!;
      cdra.condition = 31.0;
      cdra.maintenanceRequired = false;
      cdra.status = 'OPERATIONAL';

      // Advance 200 hours of mechanical wear (200 hours * 0.01% / hr = 2.0% wear)
      state = simulateEquipment(state, 200.0, DEFAULT_SIMULATION_CONFIG);

      // Condition should degrade to 29.0%, triggering maintenanceRequired and status update
      const updatedCdra = state.equipment.find((e) => e.equipmentId.includes('CDRA'))!;
      expect(updatedCdra.condition).toBeCloseTo(29.0, 1);
      expect(updatedCdra.maintenanceRequired).toBe(true);
      expect(updatedCdra.status).toBe('MAINTENANCE_REQUIRED');
    });
  });

  // ==========================================================================
  // 4. UI View Rendering & Interactive Controls
  // ==========================================================================
  describe('4. OPERATE Habitat View UI Rendering & Navigation', () => {
    it('renders all six functional habitat systems with readouts', () => {
      render(
        <BrowserRouter>
          <OperateHabitatView />
        </BrowserRouter>
      );

      // 1. Oxygen management
      expect(screen.getByText(/1. OXYGEN MANAGEMENT/i)).toBeInTheDocument();
      // 2. CO2 removal
      expect(screen.getByText(/2. CO₂ REMOVAL \(CDRA\)/i)).toBeInTheDocument();
      // 3. Water recovery
      expect(screen.getByText(/3. WATER RECOVERY \(WRS\)/i)).toBeInTheDocument();
      // 4. Food inventory
      expect(screen.getByText(/4. FOOD INVENTORY/i)).toBeInTheDocument();
      // 5. Electrical power
      expect(screen.getByText(/5. ELECTRICAL POWER \(EPS\)/i)).toBeInTheDocument();
      // 6. Equipment maintenance
      expect(screen.getByText(/6. EQUIPMENT MAINTENANCE/i)).toBeInTheDocument();

      // Top metrics summary
      expect(screen.getAllByText(/1. Oxygen Reserve/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/2. CO₂ Scrub Rate/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/3. Water Recovery/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/4. Food Runway/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/5. Battery SoC/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/6. Fleet Health/i).length).toBeGreaterThanOrEqual(1);
    });

    it('allows tab switching between Six Systems, Schematic Diagram, Telemetry, and Directives', () => {
      render(
        <BrowserRouter>
          <OperateHabitatView />
        </BrowserRouter>
      );

      // Verify navigation buttons
      expect(screen.getByRole('button', { name: /SIX FUNCTIONAL SYSTEMS/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ARCHITECTURAL SCHEMATIC/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /HISTORICAL TELEMETRY TRENDS/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /OPERATIONAL DIRECTIVES/i })).toBeInTheDocument();

      // Switch to Schematic tab
      fireEvent.click(screen.getByRole('button', { name: /ARCHITECTURAL SCHEMATIC/i }));
      expect(screen.getByText(/CLOSED-LOOP ECLSS & POWER ARCHITECTURE SCHEMATIC/i)).toBeInTheDocument();

      // Switch to Telemetry tab
      fireEvent.click(screen.getByRole('button', { name: /HISTORICAL TELEMETRY TRENDS/i }));
      expect(screen.getByText(/HABITAT TELEMETRY TRENDS & HISTORICAL LOGIC CURVES/i)).toBeInTheDocument();

      // Switch to Controls tab
      fireEvent.click(screen.getByRole('button', { name: /OPERATIONAL DIRECTIVES/i }));
      expect(screen.getByText(/OPERATIONAL COMMAND DIRECTIVES & GOVERNOR OVERRIDES/i)).toBeInTheDocument();
    });

    it('triggers load shedding directly from the operational controls console', () => {
      render(
        <BrowserRouter>
          <OperateHabitatView />
        </BrowserRouter>
      );

      const shedButton = screen.getByRole('button', { name: /SHED 4.5 kW LOAD/i });
      fireEvent.click(shedButton);

      // Feedback should appear
      expect(screen.getByText(/DIRECTIVE CONFIRMED & EXECUTED/i)).toBeInTheDocument();
      expect(screen.getByText(/demand reduced by 4.5 kW/i)).toBeInTheDocument();
    });

    it('opens maintenance overhaul dialog and executes maintenance on equipment', () => {
      render(
        <BrowserRouter>
          <OperateHabitatView />
        </BrowserRouter>
      );

      const overhaulButton = screen.getByRole('button', { name: /OVERHAUL EQUIPMENT/i });
      fireEvent.click(overhaulButton);

      // Modal dialog opens
      expect(screen.getByText(/START PREVENTIVE & CORRECTIVE MAINTENANCE/i)).toBeInTheDocument();

      const executeBtn = screen.getByRole('button', { name: /EXECUTE MAINTENANCE DIRECTIVE/i });
      fireEvent.click(executeBtn);

      expect(screen.getByText(/DIRECTIVE CONFIRMED & EXECUTED/i)).toBeInTheDocument();
    });
  });
});
