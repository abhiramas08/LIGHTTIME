import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Globe, Database, Cpu, RotateCcw, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { missionState, resetMission, clearSavedMission } = useMissionStore();
  const [apiKey, setApiKey] = useState('DEMO_KEY');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  return (
    <PageContainer
      moduleCode="MOD-08"
      title="Settings"
      description="Simulator telemetry configuration, simulation rules version, and external educational adapters. Connect NASA Space Weather APIs and manage mission state persistence."
      actions={<Badge variant="nominal">CONFIGURATION SAVED</Badge>}
    >
      {statusMessage && (
        <div className="p-3 bg-nominal-green/15 border border-nominal-green/40 text-nominal-green text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMessage}</span>
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
                <span className="text-offwhite/60">CANONICAL TICK ORDERS:</span>
                <span className="text-offwhite">12 Connected Solvers</span>
              </div>
              <div className="flex justify-between py-1 border-b border-panel-blue/30">
                <span className="text-offwhite/60">ENGINE ISOLATION:</span>
                <span className="text-offwhite">Pure TypeScript (In-Memory)</span>
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
              NASA OPEN APIS (DONKI / HORIZONS)
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
                Enables live Solar Particle Event and Coronal Mass Ejection notifications.
              </p>
            </div>
            <Button size="sm" variant="outline">
              TEST API CONNECTION
            </Button>
          </CardContent>
        </Card>

        {/* Supabase Mission Archive */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Database className="h-4 w-4 text-telemetry-cyan" />
              SUPABASE MISSION ARCHIVE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-offwhite/60 mb-1 uppercase">SUPABASE URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-space-surface border border-panel-blue/70 p-2 text-offwhite font-mono focus:border-telemetry-cyan focus:outline-none"
              />
              <p className="text-[10px] text-offwhite/40 mt-1">
                Persists student mission logs, decision branching, and assessment scores.
              </p>
            </div>
            <Button size="sm" variant="outline">
              VERIFY STORAGE ENDPOINT
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
