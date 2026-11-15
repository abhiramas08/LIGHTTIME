/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Habitat Operational Controls & Directives Console
 *
 * Implements validated mission control directives for:
 * 1. Start maintenance (preventive / corrective repairs to 100% condition)
 * 2. Prioritize systems (Life support vs Power conservation vs Balanced)
 * 3. Reduce non-essential power (Load shedding directive)
 * 4. Change resource allocations (Oxygen, water, and food allocation modes)
 * 5. Activate available backup equipment (CDRA Bed B, WRS Aux, Battery Bank, O2 Surge)
 */

import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Dialog } from '@/components/common/Dialog';
import {
  Wrench,
  Sliders,
  ZapOff,
  RotateCw,
  PlusCircle,
} from 'lucide-react';

export const HabitatControlsConsole: React.FC = () => {
  const { missionState, executeMissionCommand } = useMissionStore();
  const eq = missionState.equipment;

  // Feedback state
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'maintenance' | 'priority' | 'allocation' | 'backup' | null
  >(null);

  // Form selections
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(eq[0]?.equipmentId || 'EQ-ECLSS-CDRA-01');
  const [selectedPriority, setSelectedPriority] = useState<'LIFE_SUPPORT' | 'POWER_CONSERVATION' | 'BALANCED'>('LIFE_SUPPORT');
  const [resourceType, setResourceType] = useState<'OXYGEN' | 'WATER' | 'FOOD'>('OXYGEN');
  const [allocationTier, setAllocationTier] = useState<'CONSERVATIVE' | 'NOMINAL' | 'ENRICHED' | 'RATIONED'>('NOMINAL');
  const [backupSystem, setBackupSystem] = useState<'CDRA_BED_B' | 'WRS_AUX_CORE' | 'AUX_BATTERY_BANK' | 'O2_SURGE_TANK'>('CDRA_BED_B');

  // Command handlers
  const handleExecuteMaintenance = (equipmentId: string) => {
    const result = executeMissionCommand({
      subsystem: 'ECLSS',
      action: 'START_MAINTENANCE',
      parameters: { equipmentId },
      initiatedBy: 'GROUND',
    });
    setFeedback({ success: result.success, message: result.message });
    setActiveModal(null);
  };

  const handleExecutePriority = () => {
    const result = executeMissionCommand({
      subsystem: 'ECLSS',
      action: 'PRIORITIZE_SYSTEMS',
      parameters: { priorityMode: selectedPriority },
      initiatedBy: 'GROUND',
    });
    setFeedback({ success: result.success, message: result.message });
    setActiveModal(null);
  };

  const handleExecutePowerShedding = () => {
    const result = executeMissionCommand({
      subsystem: 'POWER_GRID',
      action: 'REDUCE_NON_ESSENTIAL_POWER',
      parameters: {},
      initiatedBy: 'GROUND',
    });
    setFeedback({ success: result.success, message: result.message });
  };

  const handleExecuteAllocation = () => {
    const result = executeMissionCommand({
      subsystem: 'ECLSS',
      action: 'CHANGE_RESOURCE_ALLOCATION',
      parameters: { resourceType, allocationTier },
      initiatedBy: 'GROUND',
    });
    setFeedback({ success: result.success, message: result.message });
    setActiveModal(null);
  };

  const handleExecuteBackup = () => {
    const result = executeMissionCommand({
      subsystem: 'ECLSS',
      action: 'ACTIVATE_BACKUP_EQUIPMENT',
      parameters: { backupSystem },
      initiatedBy: 'GROUND',
    });
    setFeedback({ success: result.success, message: result.message });
    setActiveModal(null);
  };

  return (
    <Card withBracket className="bg-control-navy border-panel-blue">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs">
            <Sliders className="h-4 w-4 text-telemetry-cyan" />
            OPERATIONAL COMMAND DIRECTIVES & GOVERNOR OVERRIDES
          </CardTitle>
          <span className="text-[10px] font-mono text-offwhite/50">
            ALL DIRECTIVES CALL THE CENTRAL SIMULATION ENGINE
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 font-mono text-xs">
        {/* Feedback Alert Banner */}
        {feedback && (
          <Alert
            variant={feedback.success ? 'nominal' : 'warning'}
            title={feedback.success ? 'DIRECTIVE CONFIRMED & EXECUTED' : 'DIRECTIVE RESTRICTION'}
            className="text-xs"
          >
            {feedback.message}
          </Alert>
        )}

        {/* Quick Directives Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Action 1: Start Maintenance */}
          <div className="p-3 bg-space-surface border border-panel-blue/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-telemetry-cyan text-xs mb-1">
                <Wrench className="h-3.5 w-3.5" />
                Start Maintenance
              </div>
              <p className="text-[10px] text-offwhite/60 leading-tight">
                Inspect and overhaul degraded ECLSS, power arrays, or life support pumps.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveModal('maintenance')}
              className="w-full text-[10px] h-7"
            >
              OVERHAUL EQUIPMENT
            </Button>
          </div>

          {/* Action 2: Prioritize Systems */}
          <div className="p-3 bg-space-surface border border-panel-blue/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-nominal-green text-xs mb-1">
                <Sliders className="h-3.5 w-3.5" />
                Prioritize Systems
              </div>
              <p className="text-[10px] text-offwhite/60 leading-tight">
                Direct electrical power and ECLSS bus to Life Support, Power, or Science.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveModal('priority')}
              className="w-full text-[10px] h-7"
            >
              SET SYSTEM PRIORITY
            </Button>
          </div>

          {/* Action 3: Reduce Non-Essential Power */}
          <div className="p-3 bg-space-surface border border-panel-blue/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-warning-amber text-xs mb-1">
                <ZapOff className="h-3.5 w-3.5" />
                Shed Load (-4.5 kW)
              </div>
              <p className="text-[10px] text-offwhite/60 leading-tight">
                Instantly shed non-essential airlock pumps to protect battery reserve.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleExecutePowerShedding}
              className="w-full text-[10px] h-7"
            >
              SHED 4.5 kW LOAD
            </Button>
          </div>

          {/* Action 4: Change Resource Allocation */}
          <div className="p-3 bg-space-surface border border-panel-blue/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-telemetry-cyan text-xs mb-1">
                <RotateCw className="h-3.5 w-3.5" />
                Resource Allocation
              </div>
              <p className="text-[10px] text-offwhite/60 leading-tight">
                Configure conservative vs nominal quotas for O2, water, and food rations.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveModal('allocation')}
              className="w-full text-[10px] h-7"
            >
              ADJUST ALLOCATIONS
            </Button>
          </div>

          {/* Action 5: Activate Backup Equipment */}
          <div className="p-3 bg-space-surface border border-panel-blue/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-nominal-green text-xs mb-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Backup Equipment
              </div>
              <p className="text-[10px] text-offwhite/60 leading-tight">
                Engage secondary CDRA amine beds, WRS catalytic cores, or aux battery bus.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveModal('backup')}
              className="w-full text-[10px] h-7"
            >
              ENGAGE BACKUP UNIT
            </Button>
          </div>
        </div>
      </CardContent>

      {/* MODAL 1: START MAINTENANCE */}
      {activeModal === 'maintenance' && (
        <Dialog
          open={true}
          onOpenChange={() => setActiveModal(null)}
          title="START PREVENTIVE & CORRECTIVE MAINTENANCE"
          description="Direct habitat technicians or autonomous actuators to restore mechanical condition to 100%."
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-offwhite/70 mb-1">Select Target Equipment:</label>
              <select
                className="w-full bg-space-deep border border-panel-blue/70 p-2 text-offwhite focus:border-telemetry-cyan focus:outline-none"
                value={selectedEquipmentId}
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
              >
                {eq.map((e) => (
                  <option key={e.equipmentId} value={e.equipmentId}>
                    {e.equipmentName} ({e.equipmentId}) · Condition: {e.condition.toFixed(1)}% · {e.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
              <span className="text-[10px] text-offwhite/50 block">EXPECTED RESTORATION OUTCOME:</span>
              <p className="text-[11px] text-nominal-green">
                Mechanical wear restored to 100.0%. Mandatory maintenance flags cleared. Status returned to OPERATIONAL.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                CANCEL
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleExecuteMaintenance(selectedEquipmentId)}
              >
                EXECUTE MAINTENANCE DIRECTIVE
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 2: PRIORITIZE SYSTEMS */}
      {activeModal === 'priority' && (
        <Dialog
          open={true}
          onOpenChange={() => setActiveModal(null)}
          title="SET SUBSYSTEM OPERATIONAL PRIORITY"
          description="Rebalance electrical and life-support buses to favor critical habitat functions."
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  selectedPriority === 'LIFE_SUPPORT'
                    ? 'border-nominal-green bg-nominal-green/10 text-offwhite'
                    : 'border-panel-blue/40 bg-space-surface text-offwhite/70'
                }`}
                onClick={() => setSelectedPriority('LIFE_SUPPORT')}
              >
                <input
                  type="radio"
                  name="priority"
                  checked={selectedPriority === 'LIFE_SUPPORT'}
                  onChange={() => setSelectedPriority('LIFE_SUPPORT')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-nominal-green block">LIFE SUPPORT PRIORITY</span>
                  <span className="text-[11px] text-offwhite/60">
                    Prioritizes CDRA CO₂ scrubbers and WRS water recycling. Sheds non-essential airlock heaters (24.5 kW).
                  </span>
                </div>
              </label>

              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  selectedPriority === 'POWER_CONSERVATION'
                    ? 'border-warning-amber bg-warning-amber/10 text-offwhite'
                    : 'border-panel-blue/40 bg-space-surface text-offwhite/70'
                }`}
                onClick={() => setSelectedPriority('POWER_CONSERVATION')}
              >
                <input
                  type="radio"
                  name="priority"
                  checked={selectedPriority === 'POWER_CONSERVATION'}
                  onChange={() => setSelectedPriority('POWER_CONSERVATION')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-warning-amber block">POWER CONSERVATION PRIORITY</span>
                  <span className="text-[11px] text-offwhite/60">
                    Minimizes bus demand to 23.5 kW during eclipse or battery depletion states.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  selectedPriority === 'BALANCED'
                    ? 'border-telemetry-cyan bg-telemetry-cyan/10 text-offwhite'
                    : 'border-panel-blue/40 bg-space-surface text-offwhite/70'
                }`}
                onClick={() => setSelectedPriority('BALANCED')}
              >
                <input
                  type="radio"
                  name="priority"
                  checked={selectedPriority === 'BALANCED'}
                  onChange={() => setSelectedPriority('BALANCED')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-telemetry-cyan block">BALANCED NOMINAL OPERATIONS</span>
                  <span className="text-[11px] text-offwhite/60">
                    Powers all habitat modules, airlocks, and science telemetry equally (28.4 kW).
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                CANCEL
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecutePriority}>
                APPLY PRIORITY DIRECTIVE
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 3: RESOURCE ALLOCATION */}
      {activeModal === 'allocation' && (
        <Dialog
          open={true}
          onOpenChange={() => setActiveModal(null)}
          title="CHANGE RESOURCE ALLOCATIONS & RATIONING"
          description="Adjust consumables consumption rates and rationing protocols."
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-offwhite/70 mb-1">Target Resource Subsystem:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={resourceType === 'OXYGEN' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setResourceType('OXYGEN')}
                  className="text-xs"
                >
                  OXYGEN
                </Button>
                <Button
                  variant={resourceType === 'WATER' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setResourceType('WATER')}
                  className="text-xs"
                >
                  WATER
                </Button>
                <Button
                  variant={resourceType === 'FOOD' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setResourceType('FOOD')}
                  className="text-xs"
                >
                  FOOD RATIONS
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-offwhite/70 mb-1">Allocation Protocol Tier:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={allocationTier === 'CONSERVATIVE' || allocationTier === 'RATIONED' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAllocationTier('CONSERVATIVE')}
                  className="text-xs"
                >
                  CONSERVATIVE
                </Button>
                <Button
                  variant={allocationTier === 'NOMINAL' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAllocationTier('NOMINAL')}
                  className="text-xs"
                >
                  NOMINAL
                </Button>
                <Button
                  variant={allocationTier === 'ENRICHED' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAllocationTier('ENRICHED')}
                  className="text-xs"
                >
                  ENRICHED / BOOST
                </Button>
              </div>
            </div>

            <div className="p-3 bg-space-surface border border-panel-blue/40">
              <span className="text-[10px] text-offwhite/50 block">SIMULATION GOVERNOR IMPACT:</span>
              <p className="text-[11px] text-offwhite/80">
                Adjusting allocation alters instantaneous hourly consumption without creating negative inventories.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                CANCEL
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteAllocation}>
                DISPATCH ALLOCATION DIRECTIVE
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 4: ACTIVATE BACKUP EQUIPMENT */}
      {activeModal === 'backup' && (
        <Dialog
          open={true}
          onOpenChange={() => setActiveModal(null)}
          title="ACTIVATE AVAILABLE BACKUP HARDWARE"
          description="Engage secondary redundant hardware strings to restore degraded or failed capacities."
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  backupSystem === 'CDRA_BED_B'
                    ? 'border-telemetry-cyan bg-telemetry-cyan/10'
                    : 'border-panel-blue/40 bg-space-surface'
                }`}
                onClick={() => setBackupSystem('CDRA_BED_B')}
              >
                <input
                  type="radio"
                  name="backup"
                  checked={backupSystem === 'CDRA_BED_B'}
                  onChange={() => setBackupSystem('CDRA_BED_B')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-telemetry-cyan block">SECONDARY CDRA AMINE BED B</span>
                  <span className="text-[11px] text-offwhite/60">
                    Engages alternate desiccant/amine bed string, restoring CO₂ scrubbing to 0.35 kg/hr nominal.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  backupSystem === 'WRS_AUX_CORE'
                    ? 'border-nominal-green bg-nominal-green/10'
                    : 'border-panel-blue/40 bg-space-surface'
                }`}
                onClick={() => setBackupSystem('WRS_AUX_CORE')}
              >
                <input
                  type="radio"
                  name="backup"
                  checked={backupSystem === 'WRS_AUX_CORE'}
                  onChange={() => setBackupSystem('WRS_AUX_CORE')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-nominal-green block">AUXILIARY CATALYTIC WATER DISTILLER</span>
                  <span className="text-[11px] text-offwhite/60">
                    Engages auxiliary catalytic column on WRS, boosting recycling recovery rate to 98.0%.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  backupSystem === 'AUX_BATTERY_BANK'
                    ? 'border-warning-amber bg-warning-amber/10'
                    : 'border-panel-blue/40 bg-space-surface'
                }`}
                onClick={() => setBackupSystem('AUX_BATTERY_BANK')}
              >
                <input
                  type="radio"
                  name="backup"
                  checked={backupSystem === 'AUX_BATTERY_BANK'}
                  onChange={() => setBackupSystem('AUX_BATTERY_BANK')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-warning-amber block">AUXILIARY SOLID-STATE BATTERY STRING</span>
                  <span className="text-[11px] text-offwhite/60">
                    Ties in reserve solid-state cells (+30 kWh capacity) to protect critical night survival loads.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 border cursor-pointer transition-all flex items-start gap-2.5 ${
                  backupSystem === 'O2_SURGE_TANK'
                    ? 'border-telemetry-cyan bg-telemetry-cyan/10'
                    : 'border-panel-blue/40 bg-space-surface'
                }`}
                onClick={() => setBackupSystem('O2_SURGE_TANK')}
              >
                <input
                  type="radio"
                  name="backup"
                  checked={backupSystem === 'O2_SURGE_TANK'}
                  onChange={() => setBackupSystem('O2_SURGE_TANK')}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-telemetry-cyan block">HIGH-PRESSURE O₂ BUFFER SURGE TANK</span>
                  <span className="text-[11px] text-offwhite/60">
                    Discharges emergency 10.0 kg cryogenic gaseous oxygen reserve directly into cabin loop.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                CANCEL
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteBackup}>
                ENGAGE BACKUP SYSTEM
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </Card>
  );
};
