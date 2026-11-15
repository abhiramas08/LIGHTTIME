import React from 'react';
import { ScienceAssumption, AssumptionClassification } from '@/simulation/models/scienceData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { BookOpen, AlertTriangle, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

interface AssumptionCardProps {
  assumption: ScienceAssumption;
}

const getClassificationConfig = (classification: AssumptionClassification) => {
  switch (classification) {
    case 'MEASURED_PHYSICAL_VALUE':
      return {
        badgeVariant: 'nominal' as const,
        label: 'Measured Physical Value',
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-nominal-green" />,
        borderAccent: 'border-l-nominal-green',
      };
    case 'ENGINEERING_BASELINE':
      return {
        badgeVariant: 'telemetry' as const,
        label: 'Engineering Baseline',
        icon: <Cpu className="h-3.5 w-3.5 text-telemetry-cyan" />,
        borderAccent: 'border-l-telemetry-cyan',
      };
    case 'EDUCATIONAL_SIMULATION_MODEL':
      return {
        badgeVariant: 'warning' as const,
        label: 'Educational Simulation Model',
        icon: <AlertTriangle className="h-3.5 w-3.5 text-warning-amber" />,
        borderAccent: 'border-l-warning-amber',
      };
    default:
      return {
        badgeVariant: 'neutral' as const,
        label: classification,
        icon: <BookOpen className="h-3.5 w-3.5" />,
        borderAccent: 'border-l-panel-blue',
      };
  }
};

export const AssumptionCard: React.FC<AssumptionCardProps> = ({ assumption }) => {
  const config = getClassificationConfig(assumption.classification);

  return (
    <Card withBracket className={`bg-space-deep/70 border-panel-blue/60 ${config.borderAccent} border-l-2`}>
      <CardHeader className="pb-2 border-b border-panel-blue/40">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-telemetry-cyan/80 tracking-widest uppercase">
              {assumption.id} • {assumption.subsystem}
            </span>
            <Badge variant={config.badgeVariant} className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <CardTitle className="text-sm font-bold text-offwhite mt-1">
            {assumption.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-3 font-mono text-xs">
        {/* Value or Formula box */}
        <div className="p-2.5 bg-space-black/80 border border-panel-blue/50 rounded-none">
          <div className="flex items-center justify-between text-[10px] text-offwhite/50 uppercase tracking-wider mb-1">
            <span>Value / Formula</span>
            <span className="text-telemetry-cyan font-semibold">Unit: {assumption.unit}</span>
          </div>
          <div className="font-mono text-xs text-telemetry-cyan font-semibold break-all selection:bg-telemetry-cyan/20">
            {assumption.valueOrFormula}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block font-semibold mb-0.5">
            Explanation & Simulation Mechanism:
          </span>
          <p className="text-offwhite/80 font-sans text-xs leading-relaxed">
            {assumption.explanation}
          </p>
        </div>

        {/* Source / Technical Rationale */}
        <div className="p-2 bg-control-navy/40 border border-panel-blue/30 text-[11px]">
          <div className="flex items-center gap-1.5 text-telemetry-cyan text-[10px] uppercase tracking-wider font-semibold mb-1">
            <BookOpen className="h-3 w-3" />
            Source Document / Rationale:
          </div>
          <div className="text-offwhite/90 font-mono leading-relaxed">
            {assumption.sourceOrRationale}
          </div>
        </div>

        {/* Physical Limitations */}
        <div className="p-2 bg-warning-amber/5 border border-warning-amber/30 text-[11px]">
          <div className="flex items-center gap-1.5 text-warning-amber text-[10px] uppercase tracking-wider font-semibold mb-1">
            <AlertTriangle className="h-3 w-3" />
            Simulation Simplifications & Physical Limitations:
          </div>
          <div className="text-offwhite/80 font-sans text-xs leading-relaxed">
            {assumption.limitations}
          </div>
        </div>

        {/* Educational Note */}
        {assumption.educationalNote && (
          <div className="p-2 bg-telemetry-cyan/5 border border-telemetry-cyan/20 text-[11px] flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-telemetry-cyan shrink-0 mt-0.5" />
            <div>
              <span className="text-telemetry-cyan font-semibold block text-[10px] uppercase tracking-wider">
                Pedagogical Takeaway:
              </span>
              <span className="text-offwhite/80 font-sans text-xs">
                {assumption.educationalNote}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
