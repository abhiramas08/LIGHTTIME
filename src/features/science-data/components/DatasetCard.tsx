import React from 'react';
import { ScientificDataset, DatasetScientificNature } from '@/simulation/models/scienceData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ExternalLink, Database, Calendar, Activity } from 'lucide-react';

interface DatasetCardProps {
  dataset: ScientificDataset;
}

const getNatureBadgeVariant = (nature: DatasetScientificNature): 'nominal' | 'telemetry' | 'warning' => {
  switch (nature) {
    case 'LIVE_OBSERVATION':
      return 'nominal';
    case 'PUBLISHED_RESEARCH':
      return 'telemetry';
    case 'EDUCATIONAL_ASSUMPTION':
      return 'warning';
    default:
      return 'telemetry';
  }
};

const getNatureLabel = (nature: DatasetScientificNature): string => {
  switch (nature) {
    case 'LIVE_OBSERVATION':
      return 'Live Observation';
    case 'PUBLISHED_RESEARCH':
      return 'Published Research';
    case 'EDUCATIONAL_ASSUMPTION':
      return 'Educational Assumption';
    default:
      return nature;
  }
};

export const DatasetCard: React.FC<DatasetCardProps> = ({ dataset }) => {
  return (
    <Card withBracket className="flex flex-col justify-between h-full bg-space-deep/70 border-panel-blue/60 hover:border-telemetry-cyan/60 transition-colors">
      <div>
        <CardHeader className="pb-3 border-b border-panel-blue/40">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-telemetry-cyan/80 tracking-widest uppercase">
                {dataset.id}
              </span>
              <Badge variant={getNatureBadgeVariant(dataset.nature)} pulse={dataset.nature === 'LIVE_OBSERVATION'}>
                {getNatureLabel(dataset.nature)}
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold text-offwhite leading-tight mt-1">
              {dataset.name}
            </CardTitle>
            <div className="text-[11px] font-mono text-offwhite/60">
              {dataset.organization}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3 space-y-3 font-mono text-xs">
          {/* Description */}
          <p className="text-offwhite/80 font-sans text-xs leading-relaxed">
            {dataset.description}
          </p>

          {/* Instrument / Platform if available */}
          {dataset.instrumentPlatform && (
            <div className="p-2 bg-control-navy/50 border border-panel-blue/40 flex items-center gap-2 text-[11px]">
              <Activity className="h-3.5 w-3.5 text-telemetry-cyan shrink-0" />
              <span className="text-offwhite/60">Platform/Instrument:</span>
              <span className="text-offwhite font-semibold truncate">{dataset.instrumentPlatform}</span>
            </div>
          )}

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-control-navy/30 border border-panel-blue/30 rounded-none">
            <div>
              <span className="text-offwhite/50 block text-[9px] uppercase tracking-wider">Data Type</span>
              <span className="text-offwhite font-medium break-words">{dataset.dataType}</span>
            </div>
            <div>
              <span className="text-offwhite/50 block text-[9px] uppercase tracking-wider">Physical Units</span>
              <span className="text-telemetry-cyan font-semibold break-words">{dataset.units}</span>
            </div>
            <div>
              <span className="text-offwhite/50 block text-[9px] uppercase tracking-wider">Dataset Version</span>
              <span className="text-offwhite font-mono">{dataset.datasetVersion}</span>
            </div>
            <div>
              <span className="text-offwhite/50 block text-[9px] uppercase tracking-wider">Retrieval Date</span>
              <span className="text-offwhite/70 font-mono flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5 text-offwhite/40" />
                {dataset.retrievalDate}
              </span>
            </div>
          </div>

          {/* Key Parameters */}
          {dataset.keyParameters && dataset.keyParameters.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block font-semibold">
                Key Parameters & Telemetry Baselines:
              </span>
              <div className="space-y-1">
                {dataset.keyParameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[10px] py-0.5 px-2 bg-panel-blue/10 border-l border-telemetry-cyan/60"
                  >
                    <span className="text-offwhite/70">{param.label}:</span>
                    <span className="text-telemetry-cyan font-mono font-medium">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Footer with External Link */}
      <div className="p-3 pt-2 border-t border-panel-blue/40 bg-control-navy/40 flex items-center justify-between">
        <span className="text-[10px] font-mono text-offwhite/50 flex items-center gap-1">
          <Database className="h-3 w-3 text-telemetry-cyan/60" />
          Authoritative Source
        </span>
        <a
          href={dataset.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-telemetry-cyan bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-telemetry-cyan/40 hover:border-telemetry-cyan transition-colors"
        >
          <span>Open Repository</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
};
