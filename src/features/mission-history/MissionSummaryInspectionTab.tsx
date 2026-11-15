import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  FileText,
  Users,
  AlertTriangle,
  Clock,
  Radio,
  Play,
  ArrowLeft,
  Heart,
  Droplet,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';

export const MissionSummaryInspectionTab: React.FC = () => {
  const { savedRuns, selectedRunId, selectRun, setActiveTab, startReplay } =
    useMissionHistoryStore();

  const [inspectionSection, setInspectionSection] = useState<
    'overview' | 'crew' | 'emergencies' | 'resources' | 'actions'
  >('overview');

  const selectedRun =
    savedRuns.find((r) => r.missionId === selectedRunId) || savedRuns[0];

  if (!selectedRun) {
    return (
      <div className="p-8 text-center text-offwhite/50 space-y-3 font-mono">
        <p>No saved mission selected.</p>
        <Button variant="primary" size="sm" onClick={() => setActiveTab('library')}>
          SELECT A MISSION FROM LIBRARY
        </Button>
      </div>
    );
  }

  const sols = Number((selectedRun.completionTimeHours / 24).toFixed(1));
  const finalResources = selectedRun.finalState.habitatResources;
  const crewMembers = selectedRun.finalState.crew;

  // Emergency events and user emergency actions
  const emergencyEvents = selectedRun.simulationEvents.filter(
    (e) =>
      e.affectedSystem === 'EMERGENCY' ||
      e.severity === 'CRITICAL' ||
      e.category === 'EMERGENCY'
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-space-surface/90 p-3 border border-panel-blue/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('library')}
            className="text-xs text-signal-cyan hover:text-signal-cyan/80 gap-1 p-0 h-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>ARCHIVE LIBRARY</span>
          </Button>

          <span className="text-offwhite/30">|</span>

          {/* Quick Mission Selector */}
          <select
            value={selectedRun.missionId}
            onChange={(e) => selectRun(e.target.value)}
            className="bg-space-dark border border-panel-blue/60 text-offwhite text-xs px-2 py-1 focus:outline-none focus:border-signal-cyan"
          >
            {savedRuns.map((r) => (
              <option key={r.missionId} value={r.missionId}>
                {r.missionName} ({r.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => startReplay(selectedRun.missionId)}
            className="gap-1.5 text-xs bg-nominal-green text-space-dark hover:bg-nominal-green/90 font-bold"
          >
            <Play className="h-3.5 w-3.5" />
            <span>REPLAY THIS MISSION</span>
          </Button>
        </div>
      </div>

      {/* Mission Banner Card */}
      <Card withBracket className="border-signal-cyan/50 bg-space-surface">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/30 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-offwhite">
                  {selectedRun.missionName}
                </span>
                <Badge
                  variant={selectedRun.status === 'COMPLETED' ? 'nominal' : 'telemetry'}
                >
                  {selectedRun.status}
                </Badge>
                {selectedRun.grade && (
                  <Badge variant="nominal">GRADE: {selectedRun.grade}</Badge>
                )}
                {selectedRun.overallScore !== undefined && (
                  <Badge variant="telemetry">SCORE: {selectedRun.overallScore}/100</Badge>
                )}
              </div>
              <div className="text-[10px] text-offwhite/60 flex items-center gap-3">
                <span>MISSION ID: {selectedRun.missionId}</span>
                <span>•</span>
                <span>SCENARIO: {selectedRun.scenarioId ?? 'Standard'} (v{selectedRun.scenarioVersion ?? '1.0'})</span>
                <span>•</span>
                <span>FLIGHT RULES: {selectedRun.rulesVersion}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <div className="text-[10px] text-offwhite/40 uppercase">SURFACE DURATION</div>
                <div className="text-signal-cyan font-bold">{sols} Sols ({selectedRun.completionTimeHours}h)</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-offwhite/40 uppercase">ARCHIVE TIMESTAMP</div>
                <div className="text-offwhite">{new Date(selectedRun.savedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: 'overview', label: 'EXECUTIVE OVERVIEW', icon: FileText },
              { id: 'crew', label: `CREW BIOMETRICS (${crewMembers.length})`, icon: Users },
              { id: 'emergencies', label: `EMERGENCY DECISIONS (${emergencyEvents.length})`, icon: AlertTriangle },
              { id: 'resources', label: 'RESOURCE INVENTORY', icon: Clock },
              { id: 'actions', label: `DISPATCHED DIRECTIVES (${selectedRun.userActions.length})`, icon: Radio },
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = inspectionSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInspectionSection(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-1.5 transition-colors border ${
                    isCurrent
                      ? 'bg-signal-cyan text-space-dark border-signal-cyan'
                      : 'bg-space-dark/80 text-offwhite/70 border-panel-blue/40 hover:border-panel-blue hover:text-offwhite'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: EXECUTIVE OVERVIEW */}
      {inspectionSection === 'overview' && (
        <div className="space-y-4">
          <Card withBracket>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
                <FileText className="h-4 w-4 text-signal-cyan" />
                COMMANDER DEBRIEF & MISSION SUMMARY NOTES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 leading-relaxed text-offwhite/80">
              <p className="bg-space-dark/60 p-3 border border-panel-blue/30 text-xs">
                {selectedRun.summaryNotes || 'No summary notes documented.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-space-surface border border-panel-blue/40 text-center">
                  <div className="text-[10px] text-offwhite/40 uppercase">FLIGHT GRADE</div>
                  <div className="text-base font-bold text-nominal-green">{selectedRun.grade ?? 'NOMINAL'}</div>
                  <div className="text-[10px] text-offwhite/50">NASA Safety Threshold</div>
                </div>

                <div className="p-3 bg-space-surface border border-panel-blue/40 text-center">
                  <div className="text-[10px] text-offwhite/40 uppercase">CREW STATUS</div>
                  <div className="text-base font-bold text-signal-cyan">4/4 NOMINAL</div>
                  <div className="text-[10px] text-offwhite/50">Zero Fatalities</div>
                </div>

                <div className="p-3 bg-space-surface border border-panel-blue/40 text-center">
                  <div className="text-[10px] text-offwhite/40 uppercase">ECLSS MARGIN</div>
                  <div className="text-base font-bold text-warning-amber">
                    {finalResources.oxygenInventoryKg.toFixed(1)} kg O₂
                  </div>
                  <div className="text-[10px] text-offwhite/50">Reserve Remaining</div>
                </div>

                <div className="p-3 bg-space-surface border border-panel-blue/40 text-center">
                  <div className="text-[10px] text-offwhite/40 uppercase">DIRECTIVES</div>
                  <div className="text-base font-bold text-offwhite">{selectedRun.userActions.length} Dispatched</div>
                  <div className="text-[10px] text-offwhite/50">Command Execution</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 2: CREW HISTORY */}
      {inspectionSection === 'crew' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crewMembers.map((astro) => (
              <Card key={astro.astronautId} withBracket className="border-panel-blue/50 bg-space-surface">
                <CardHeader className="pb-2 border-b border-panel-blue/30 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-signal-cyan">
                      {astro.name}
                    </CardTitle>
                    <div className="text-[10px] text-offwhite/50">{astro.role} • {astro.astronautId}</div>
                  </div>
                  <Badge variant={astro.availability === 'AVAILABLE' ? 'nominal' : 'warning'}>
                    {astro.availability}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* Indices (Educational) */}
                  <div className="space-y-2 bg-space-dark/50 p-2.5 border border-panel-blue/20">
                    <div className="text-[10px] text-offwhite/40 uppercase font-bold tracking-wider">
                      EDUCATIONAL WELLBEING INDICES
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-offwhite/60">Fatigue Index:</span>
                          <span className="text-offwhite font-bold">{astro.fatigueIndex.toFixed(0)} / 100</span>
                        </div>
                        <div className="w-full bg-space-dark h-1.5 border border-panel-blue/40 overflow-hidden">
                          <div
                            className={`h-full ${astro.fatigueIndex > 60 ? 'bg-critical-red' : astro.fatigueIndex > 35 ? 'bg-warning-amber' : 'bg-nominal-green'}`}
                            style={{ width: `${Math.min(100, astro.fatigueIndex)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-offwhite/60">Stress Index:</span>
                          <span className="text-offwhite font-bold">{astro.stressIndex.toFixed(0)} / 100</span>
                        </div>
                        <div className="w-full bg-space-dark h-1.5 border border-panel-blue/40 overflow-hidden">
                          <div
                            className="h-full bg-warning-amber"
                            style={{ width: `${Math.min(100, astro.stressIndex)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-offwhite/60">Workload Index:</span>
                          <span className="text-offwhite font-bold">{astro.workloadIndex.toFixed(0)} / 100</span>
                        </div>
                        <div className="w-full bg-space-dark h-1.5 border border-panel-blue/40 overflow-hidden">
                          <div
                            className="h-full bg-signal-cyan"
                            style={{ width: `${Math.min(100, astro.workloadIndex)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Objective Biometrics Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-1.5 bg-space-dark/40 border border-panel-blue/20">
                      <span className="text-offwhite/40 block">Heart Rate</span>
                      <span className="font-bold text-offwhite flex items-center gap-1">
                        <Heart className="h-3 w-3 text-critical-red" />
                        {astro.biometrics.heartRateBpm.toFixed(0)} BPM
                      </span>
                    </div>

                    <div className="p-1.5 bg-space-dark/40 border border-panel-blue/20">
                      <span className="text-offwhite/40 block">Blood Oxygen</span>
                      <span className="font-bold text-nominal-green">
                        {astro.biometrics.bloodOxygenPercent.toFixed(1)}% SpO₂
                      </span>
                    </div>

                    <div className="p-1.5 bg-space-dark/40 border border-panel-blue/20">
                      <span className="text-offwhite/40 block">Core Temp</span>
                      <span className="font-bold text-offwhite">
                        {astro.biometrics.coreTemperatureCelsius.toFixed(1)}°C
                      </span>
                    </div>

                    <div className="p-1.5 bg-space-dark/40 border border-panel-blue/20">
                      <span className="text-offwhite/40 block">Sleep / Exercise</span>
                      <span className="font-bold text-signal-cyan">
                        {astro.sleepHours}h / {astro.exerciseMinutes}m
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: EMERGENCY DECISIONS */}
      {inspectionSection === 'emergencies' && (
        <Card withBracket>
          <CardHeader className="border-b border-panel-blue/40 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-amber" />
              EMERGENCY ANOMALIES & RESPONSE DIRECTIVE AUDIT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-2 pt-3">
            {emergencyEvents.length === 0 ? (
              <div className="text-center py-8 text-offwhite/50">
                No off-nominal emergency anomalies logged during this expedition.
              </div>
            ) : (
              emergencyEvents.map((evt) => (
                <div
                  key={evt.eventId}
                  className={`p-3 border space-y-1.5 ${
                    evt.severity === 'CRITICAL'
                      ? 'border-critical-red/50 bg-critical-red/10'
                      : 'border-warning-amber/40 bg-warning-amber/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={evt.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                        {evt.severity}
                      </Badge>
                      <span className="text-xs font-bold text-offwhite">{evt.title}</span>
                    </div>
                    <span className="text-[10px] text-signal-cyan">
                      {evt.simulationTime ?? `T+${evt.timestampHours}h`}
                    </span>
                  </div>
                  <p className="text-[11px] text-offwhite/80">{evt.details}</p>
                  {evt.relatedUserAction && (
                    <div className="text-[10px] text-signal-cyan font-bold pt-1 border-t border-panel-blue/20">
                      Mitigation Directive: {evt.relatedUserAction}
                    </div>
                  )}
                  {evt.educationalExplanation && (
                    <p className="text-[10px] text-offwhite/60 italic">
                      Flight Rule Note: {evt.educationalExplanation}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 4: RESOURCE INVENTORY */}
      {inspectionSection === 'resources' && (
        <div className="space-y-3">
          <Card withBracket>
            <CardHeader className="border-b border-panel-blue/40 pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
                <Clock className="h-4 w-4 text-signal-cyan" />
                FINAL EXPEDITION RESOURCE BALANCES
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                <div className="text-[10px] text-offwhite/40 uppercase">OXYGEN RESERVE</div>
                <div className="text-lg font-bold text-signal-cyan flex items-center gap-1.5">
                  <Droplet className="h-4 w-4 text-signal-cyan" />
                  {finalResources.oxygenInventoryKg.toFixed(1)} kg
                </div>
                <div className="text-[10px] text-offwhite/50">
                  Initial: {selectedRun.initialState.habitatResources.oxygenInventoryKg.toFixed(1)} kg • Used:{' '}
                  {Math.max(
                    0,
                    selectedRun.initialState.habitatResources.oxygenInventoryKg - finalResources.oxygenInventoryKg
                  ).toFixed(1)}{' '}
                  kg
                </div>
              </div>

              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                <div className="text-[10px] text-offwhite/40 uppercase">POTABLE WATER</div>
                <div className="text-lg font-bold text-signal-cyan flex items-center gap-1.5">
                  <Droplet className="h-4 w-4 text-panel-blue" />
                  {finalResources.waterInventoryLiters.toFixed(1)} L
                </div>
                <div className="text-[10px] text-offwhite/50">
                  Initial: {selectedRun.initialState.habitatResources.waterInventoryLiters.toFixed(1)} L • Used:{' '}
                  {Math.max(
                    0,
                    selectedRun.initialState.habitatResources.waterInventoryLiters - finalResources.waterInventoryLiters
                  ).toFixed(1)}{' '}
                  L
                </div>
              </div>

              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                <div className="text-[10px] text-offwhite/40 uppercase">BATTERY STORAGE</div>
                <div className="text-lg font-bold text-warning-amber flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-warning-amber" />
                  {finalResources.batteryStorageKwh.toFixed(1)} kWh
                </div>
                <div className="text-[10px] text-offwhite/50">
                  State of Charge: {finalResources.batteryStateOfChargePercent.toFixed(0)}% • Demand:{' '}
                  {finalResources.powerDemandKw.toFixed(1)} kW
                </div>
              </div>

              <div className="p-3 bg-space-surface border border-panel-blue/40 space-y-1">
                <div className="text-[10px] text-offwhite/40 uppercase">FOOD INVENTORY</div>
                <div className="text-lg font-bold text-nominal-green flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-nominal-green" />
                  {(finalResources.foodInventoryKcal / 1000).toFixed(0)}k kcal
                </div>
                <div className="text-[10px] text-offwhite/50">
                  Security Index: {finalResources.resourceSecurityIndex.toFixed(0)} / 100
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 5: DISPATCHED DIRECTIVES */}
      {inspectionSection === 'actions' && (
        <Card withBracket>
          <CardHeader className="border-b border-panel-blue/40 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
              <Radio className="h-4 w-4 text-signal-cyan" />
              DISPATCHED COMMAND DIRECTIVES AUDIT TRAIL ({selectedRun.userActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto pr-2 pt-3">
            {selectedRun.userActions.length === 0 ? (
              <div className="text-center py-8 text-offwhite/50">
                No user command directives recorded in this mission run.
              </div>
            ) : (
              selectedRun.userActions.map((act) => (
                <div
                  key={act.actionId}
                  className="flex items-center justify-between p-2.5 bg-space-dark/60 border border-panel-blue/30"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-signal-cyan">{act.command}</span>
                      <span className="text-[10px] text-offwhite/50">[{act.subsystem}]</span>
                      {act.targetAstronautId && (
                        <span className="text-[10px] text-offwhite/70">→ {act.targetAstronautId}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-offwhite/50">
                      Dispatched at: T+{act.timestampHours}h • Node: {act.initiatedBy} • ID: {act.actionId}
                    </div>
                  </div>
                  <Badge variant={act.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                    {act.outcome}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
