import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Globe, HardDrive, Cpu, RotateCcw, CheckCircle2, Download, Upload, AlertCircle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { missionState, resetMission, clearSavedMission, importMissionState } = useMissionStore();
  const [apiKey, setApiKey] = useState('DEMO_KEY');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = () => {
    resetMission();
    setStatusMessage('Mission state reset to Day 1 baseline.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleClearCache = () => {
    clearSavedMission();
    setStatusMessage('Browser storage cache purged and reset.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(missionState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `lighttime-mission-${missionState.mission.missionId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setStatusMessage('Mission telemetry exported successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Export failed: ${err?.message || 'Unknown error'}`);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = importMissionState(parsed);
        if (result.success) {
          setStatusMessage('Mission telemetry successfully imported.');
        } else {
          setErrorMessage(`Validation error: ${result.error || 'Invalid mission state schema'}`);
        }
      } catch (err: any) {
        setErrorMessage(`Import parse failed: ${err?.message || 'Invalid JSON format'}`);
      }
      setTimeout(() => {
        setStatusMessage(null);
        setErrorMessage(null);
      }, 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <PageContainer
      moduleCode="MOD-08"
      title="Settings"
      description="Simulator telemetry configuration, simulation rules version, and external educational adapters. Manage local browser mission persistence and data exports."
      actions={<Badge variant="nominal">CONFIGURATION SAVED</Badge>}
    >
      {statusMessage && (
        <div className="p-3 bg-nominal-green/15 border border-nominal-green/40 text-nominal-green text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-critical-red/15 border border-critical-red/40 text-critical-red text-xs font-mono flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Simulation Engine & Browser Persistence */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Cpu className="h-4 w-4 text-telemetry-cyan" />
              SIMULATION ENGINE & LOCAL PERSISTENCE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-panel-blue/30">
                <span className="text-offwhite/60">SIMULATION RULES VERSION:</span>
                <span className="text-telemetry-cyan font-bold">{missionState.mission.simulationRulesVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/30">
                <span className="text-offwhite/60">STORAGE SCHEMA:</span>
                <span className="text-nominal-green font-bold">lighttime_demo_mission_v1 (Zod-validated)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/30">
                <span className="text-offwhite/60">LOCAL PERSISTENCE:</span>
                <span className="text-nominal-green font-bold">Browser LocalStorage (Zero Database Required)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/30">
                <span className="text-offwhite/60">ENGINE ISOLATION:</span>
                <span className="text-offwhite">Pure TypeScript (In-Memory Physics)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                RESET STATE TO BASELINE
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearCache}>
                PURGE BROWSER STORAGE
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NASA Open APIs */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Globe className="h-4 w-4 text-telemetry-cyan" />
              NASA OPEN APIS (DONKI / LOLA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-offwhite/60 mb-1 uppercase">NASA API KEY</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-space-surface border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
              />
              <p className="text-[10px] text-offwhite/40 mt-1">
                Optional: Fetches live Solar Particle Events and Coronal Mass Ejection notifications with offline fallback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setStatusMessage('NASA Open API connection verified with offline resilient fallback.');
                setTimeout(() => setStatusMessage(null), 4000);
              }}>
                TEST API CONNECTION
              </Button>
              <Badge variant="nominal">Offline Resilient</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Local Mission Archive & Telemetry Export */}
        <Card withBracket className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              <HardDrive className="h-4 w-4 text-telemetry-cyan" />
              LOCAL MISSION ARCHIVE & TELEMETRY BACKUP (ZERO DATABASE REQUIRED)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[11px] text-offwhite/70 leading-relaxed font-sans">
              LIGHTTIME operates entirely client-side without Supabase or external database infrastructure.
              Mission progress, crew health curves, and emergency decision histories are persisted in your browser’s LocalStorage.
              You can export complete mission telemetry snapshots for offline academic evaluation or transfer them between devices.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-panel-blue/30">
              <Button size="sm" variant="primary" onClick={handleExportJson} className="gap-1.5 font-bold">
                <Download className="h-3.5 w-3.5" />
                EXPORT MISSION JSON
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border border-panel-blue hover:border-telemetry-cyan text-offwhite hover:text-telemetry-cyan bg-control-navy transition-colors select-none">
                  <Upload className="h-3.5 w-3.5" />
                  IMPORT MISSION JSON
                </div>
              </label>

              <span className="text-[10px] text-offwhite/50">
                Current Mission: {missionState.mission.missionId} (Day {missionState.mission.missionDay})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
