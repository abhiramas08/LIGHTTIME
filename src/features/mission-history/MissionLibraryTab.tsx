import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  History,
  Play,
  FileText,
  GitCompare,
  Users,
  Search,
  Filter,
  Save,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';
import { useMissionStore } from '@/store/useMissionStore';
import { createInitialMissionState } from '@/simulation/engine/core';
import { formatSimulationTime } from '@/simulation/models/eventTypes';

export const MissionLibraryTab: React.FC = () => {
  const {
    savedRuns,
    selectedRunId,
    selectRun,
    setActiveTab,
    startReplay,
    setComparisonRuns,
    saveCurrentMission,
    deleteRun,
    resetToDefaultArchive,
  } = useMissionHistoryStore();

  const { missionState } = useMissionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'ACTIVE'>('ALL');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const filteredRuns = useMemo(() => {
    return savedRuns.filter((run) => {
      if (statusFilter !== 'ALL' && run.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = run.missionName.toLowerCase().includes(q);
        const matchId = run.missionId.toLowerCase().includes(q);
        const matchScenario = run.scenarioId?.toLowerCase().includes(q) ?? false;
        const matchNotes = run.summaryNotes?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchId && !matchScenario && !matchNotes) return false;
      }
      return true;
    });
  }, [savedRuns, statusFilter, searchQuery]);

  const handleSaveCurrent = () => {
    const initialSnap = createInitialMissionState({
      mission: {
        missionId: missionState.mission.missionId,
        missionName: missionState.mission.missionName,
        missionDay: 1,
        elapsedHours: 0,
        missionDuration: missionState.mission.missionDuration,
        missionStatus: 'ACTIVE',
        simulationRulesVersion: missionState.mission.simulationRulesVersion,
      },
    });
    const newRun = saveCurrentMission(missionState, initialSnap, customNotes);
    setSaveModalOpen(false);
    setCustomNotes('');
    setSaveSuccessMsg(`Mission snapshot saved successfully: ${newRun.missionId}`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const getGradeBadgeVariant = (grade?: string): 'nominal' | 'warning' | 'critical' | 'telemetry' => {
    switch (grade) {
      case 'EXEMPLARY':
        return 'nominal';
      case 'PROFICIENT':
        return 'telemetry';
      case 'MARGINAL':
        return 'warning';
      case 'FAILED':
        return 'critical';
      default:
        return 'telemetry';
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner & Snapshot Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-space-surface/80 p-3 border border-panel-blue/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-signal-cyan" />
            <span className="font-bold text-sm text-offwhite tracking-wider">
              SAVED MISSIONS ARCHIVE & BLACK-BOX REPOSITORIES
            </span>
            <Badge variant="nominal">{savedRuns.length} ARCHIVED RUNS</Badge>
          </div>
          <p className="text-[11px] text-offwhite/60">
            Audit completed and active expeditions, inspect crew biometrics, compare flight profiles, or replay scenarios deterministically.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSaveModalOpen(true)}
            className="gap-1.5 text-xs bg-signal-cyan text-space-dark hover:bg-signal-cyan/90 font-bold"
          >
            <Save className="h-3.5 w-3.5" />
            <span>SAVE CURRENT MISSION</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaultArchive}
            className="text-[10px] text-offwhite/50 hover:text-offwhite border border-panel-blue/30"
            title="Restore canonical exemplar mission dataset"
          >
            RESET ARCHIVE
          </Button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-2.5 bg-nominal-green/20 border border-nominal-green text-nominal-green flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Card withBracket className="border-panel-blue/40 bg-space-surface/90">
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-offwhite/40" />
              <input
                type="text"
                placeholder="Search missions by name, ID, scenario, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-space-dark border border-panel-blue/50 text-offwhite text-xs pl-8 pr-3 py-1.5 placeholder:text-offwhite/30 focus:outline-none focus:border-signal-cyan"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-offwhite/50 hover:text-offwhite text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-offwhite/50 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3 text-signal-cyan" />
                STATUS:
              </span>
              {(['ALL', 'COMPLETED', 'ACTIVE'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 text-[10px] font-bold tracking-wider transition-colors border ${
                    statusFilter === filter
                      ? 'bg-signal-cyan text-space-dark border-signal-cyan'
                      : 'bg-space-dark/60 text-offwhite/70 border-panel-blue/40 hover:border-panel-blue hover:text-offwhite'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredRuns.length === 0 ? (
          <div className="text-center py-12 text-offwhite/40 border border-panel-blue/30 bg-space-surface/40 space-y-2">
            <History className="h-8 w-8 text-offwhite/20 mx-auto" />
            <p>No saved missions match the selected query or filter.</p>
          </div>
        ) : (
          filteredRuns.map((run) => {
            const isSelected = selectedRunId === run.missionId;
            const sols = Number((run.completionTimeHours / 24).toFixed(1));

            return (
              <Card
                key={run.missionId}
                withBracket
                className={`transition-all border ${
                  isSelected
                    ? 'border-signal-cyan bg-space-surface/90 shadow-lg shadow-signal-cyan/5'
                    : 'border-panel-blue/40 bg-space-surface/50 hover:border-panel-blue/80'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Row 1: Header, Badges, Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/30 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-offwhite hover:text-signal-cyan transition-colors">
                          {run.missionName}
                        </span>
                        <Badge
                          variant={run.status === 'COMPLETED' ? 'nominal' : 'telemetry'}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {run.status}
                        </Badge>
                        {run.grade && (
                          <Badge
                            variant={getGradeBadgeVariant(run.grade)}
                            className="text-[9px] px-1.5 py-0"
                          >
                            GRADE: {run.grade}
                          </Badge>
                        )}
                        {run.overallScore !== undefined && (
                          <Badge variant="telemetry" className="text-[9px] px-1.5 py-0">
                            SCORE: {run.overallScore}/100
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-offwhite/50">
                        <span>ID: {run.missionId}</span>
                        <span>•</span>
                        <span>SCENARIO: {run.scenarioId ?? 'STANDARD'} (v{run.scenarioVersion ?? '1.0'})</span>
                        <span>•</span>
                        <span>RULES: {run.rulesVersion}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-offwhite/80 self-start sm:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] text-offwhite/40 uppercase">DURATION</div>
                        <div className="text-signal-cyan font-bold flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 text-warning-amber" />
                          {sols} Sols ({run.completionTimeHours}h)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-offwhite/40 uppercase">ACTIONS</div>
                        <div className="text-offwhite font-bold">{run.userActions.length} cmds</div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Summary Notes & Telemetry Teaser */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                    <div className="md:col-span-3 space-y-1">
                      <p className="text-offwhite/70 line-clamp-2 leading-relaxed">
                        {run.summaryNotes || 'No mission summary notes recorded.'}
                      </p>
                      <div className="text-[10px] text-offwhite/40 flex items-center gap-2">
                        <span>Archived: {new Date(run.savedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>Initial Snapshot: Day 01, 00:00 MET</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-space-dark/60 p-2 border border-panel-blue/20 rounded-none text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-offwhite/50">Final O₂:</span>
                        <span className="text-offwhite font-bold">
                          {run.finalState.habitatResources.oxygenInventoryKg.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-offwhite/50">Final H₂O:</span>
                        <span className="text-offwhite font-bold">
                          {run.finalState.habitatResources.waterInventoryLiters.toFixed(1)} L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-offwhite/50">Final Batt:</span>
                        <span className="text-offwhite font-bold">
                          {run.finalState.habitatResources.batteryStorageKwh.toFixed(1)} kWh
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-panel-blue/20">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant={isSelected ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          selectRun(run.missionId);
                          setActiveTab('summary');
                        }}
                        className="gap-1.5 text-[11px]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>OPEN SUMMARY</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          selectRun(run.missionId);
                          setActiveTab('crew');
                        }}
                        className="gap-1.5 text-[11px]"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>CREW HISTORY</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          selectRun(run.missionId);
                          setActiveTab('resources');
                        }}
                        className="gap-1.5 text-[11px]"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>RESOURCE HISTORY</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startReplay(run.missionId)}
                        className="gap-1.5 text-[11px] bg-nominal-green text-space-dark hover:bg-nominal-green/90 font-bold"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>REPLAY MISSION</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const otherRun = savedRuns.find((r) => r.missionId !== run.missionId);
                          if (otherRun) {
                            setComparisonRuns(run.missionId, otherRun.missionId);
                            setActiveTab('comparison');
                          }
                        }}
                        className="gap-1 text-[10px] text-offwhite/60 hover:text-offwhite border border-panel-blue/30"
                      >
                        <GitCompare className="h-3 w-3" />
                        <span>COMPARE</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete saved mission ${run.missionName}? This cannot be undone.`)) {
                            deleteRun(run.missionId);
                          }
                        }}
                        className="text-[10px] text-critical-red/60 hover:text-critical-red"
                      >
                        DELETE
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Save Current Mission Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <Card withBracket className="max-w-lg w-full border-signal-cyan bg-space-surface shadow-2xl">
            <div className="p-4 space-y-4 text-xs">
              <div className="border-b border-panel-blue/50 pb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-signal-cyan flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  SAVE CURRENT LIVE MISSION TO ARCHIVE
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-offwhite font-bold">{missionState.mission.missionName}</div>
                <div className="text-[11px] text-offwhite/60">
                  Current Time: {formatSimulationTime(missionState.mission.elapsedHours, missionState.mission.missionDay)} • Status: {missionState.mission.missionStatus}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-offwhite/50 uppercase">COMMANDER NOTES & FLIGHT SUMMARY</label>
                <textarea
                  rows={3}
                  placeholder="Record mission objectives achieved, anomalies handled, or student notes..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-space-dark border border-panel-blue/50 text-offwhite text-xs p-2 placeholder:text-offwhite/30 focus:outline-none focus:border-signal-cyan"
                />
              </div>

              <div className="p-2.5 bg-space-dark/60 border border-panel-blue/30 text-[10px] text-offwhite/70 space-y-1">
                <div className="font-bold text-signal-cyan">IMMUTABLE ARCHIVAL SPECIFICATION:</div>
                <p>
                  Saving captures a deep clone of the initial launch state, all {missionState.records.actionHistory.length} dispatched directives, and the current final telemetry state for deterministic replay.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-panel-blue/30">
                <Button variant="ghost" size="sm" onClick={() => setSaveModalOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveCurrent} className="bg-signal-cyan text-space-dark">
                  CONFIRM ARCHIVE SAVE
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
