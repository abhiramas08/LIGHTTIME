import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Database, CheckCircle2, FlaskConical } from 'lucide-react';

export const ScienceDataView: React.FC = () => {
  const samples = [
    { id: 'SMP-LUN-001', name: 'South Pole Regolith Core Drill', mass: '1.42 kg', location: 'Shackleton Rim', status: 'Secured in Cryo-Stowage' },
    { id: 'SMP-LUN-002', name: 'Permanently Shadowed Water Ice Volatiles', mass: '0.85 kg', location: 'Shoemaker Crater', status: 'Analysis in Progress' },
    { id: 'SMP-LUN-003', name: 'Impact Melt Breccia', mass: '2.10 kg', location: 'Faustini Ridge', status: 'Cataloged' },
  ];

  return (
    <PageContainer
      moduleCode="MOD-07"
      title="Science & Data"
      description="Lunar surface scientific yield repository. Catalog geological core specimens, permanently shadowed region ice assays, and in-situ analytical experiments."
      actions={<Badge variant="telemetry">3 SPECIMENS CATALOGED</Badge>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {samples.map((s) => (
          <Card key={s.id} withBracket>
            <CardHeader>
              <CardTitle className="text-xs">
                <FlaskConical className="h-3.5 w-3.5 text-telemetry-cyan" />
                {s.id}
              </CardTitle>
              <Badge variant="nominal">{s.mass}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-bold text-offwhite">{s.name}</div>
              <div className="text-[11px] text-offwhite/60">Site: {s.location}</div>
              <div className="text-[10px] text-telemetry-cyan flex items-center gap-1 pt-1 border-t border-panel-blue/30">
                <CheckCircle2 className="h-3 w-3 text-nominal-green" />
                {s.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card withBracket>
        <CardHeader>
          <CardTitle>
            <Database className="h-4 w-4 text-telemetry-cyan" />
            IN-SITU RESOURCE UTILIZATION (ISRU) ASSAY READOUTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs text-offwhite/70">
          <p>
            Thermal volatile extraction from permanently shadowed lunar soil indicates volatile hydrogen and water concentrations suitable for catalytic water processing.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
