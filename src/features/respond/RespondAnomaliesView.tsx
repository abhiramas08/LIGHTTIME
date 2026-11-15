import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AlertTriangle, ShieldCheck, Wind } from 'lucide-react';

export const RespondAnomaliesView: React.FC = () => {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-panel-blue/50 pb-3">
        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning-amber" />
            ANOMALY RESPONSE & FLIGHT RULES CONTINGENCY CONSOLE
          </h2>
          <p className="text-xs text-offwhite/50">
            Emergency triage protocols. Evaluate autonomous flight rules and execute contingency checklists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Alert variant="warning" title="SIMULATED CONTINGENCY SCENARIO ACTIVE">
            Elevated carbon dioxide partial pressure trend detected in Habitat Core loop. Scrubber bed 1 approaching saturation threshold (0.42 kPa).
          </Alert>

          <Card withBracket>
            <CardHeader>
              <CardTitle>CONTINGENCY ACTION CHECKLIST: ECLSS-CO2-02</CardTitle>
              <Badge variant="warning">STEP 2 OF 4 IN PROGRESS</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-nominal-green/10 border border-nominal-green/30 text-nominal-green">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>STEP 1: Verify secondary CDRA amine bed desorbing status (CONFIRMED)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-warning-amber/10 border border-warning-amber/30 text-warning-amber">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>STEP 2: Command manual bed valve diversion or authorize crew local override</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-space-surface border border-panel-blue/30 text-offwhite/50">
                  <Wind className="h-4 w-4 shrink-0" />
                  <span>STEP 3: Monitor ppCO₂ rate of decline over 15 minutes</span>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <Button variant="primary" size="sm">
                  EXECUTE UPLINK FLIGHT DIRECTIVE
                </Button>
                <Button variant="secondary" size="sm">
                  DELEGATE TO CREW AUTONOMY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card withBracket>
            <CardHeader>
              <CardTitle>FLIGHT SAFETY RULES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[11px] text-offwhite/70">
              <p>• Rule 4.1: If cabin ppO₂ drops below 19.0 kPa, abort ongoing EVA immediately.</p>
              <p>• Rule 6.3: Crew autonomy overrides Earth commands whenever light-time latency exceeds available emergency reaction window.</p>
              <p>• Rule 9.2: Solar Particle Event (SPE) warnings mandate shelter ingress within 20 minutes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
