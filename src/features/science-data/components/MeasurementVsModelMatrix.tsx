import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface MetricComparison {
  name: string;
  category: 'PHYSICAL_TELEMETRY' | 'EDUCATIONAL_MODEL';
  unit: string;
  hardwareBasis: string;
  simulationRule: string;
  veracityDisclaimer: string;
}

const COMPARISON_METRICS: MetricComparison[] = [
  {
    name: 'Cabin Pressure & Partial Pressures (pO2, pCO2)',
    category: 'PHYSICAL_TELEMETRY',
    unit: 'Kilopascals (kPa)',
    hardwareBasis: 'Barometric differential pressure transducers & quadrupole mass spectrometer gas analyzers.',
    simulationRule: 'Ideal gas law accounting for metabolic respiratory draw, CDRA amine scrubbing, and hull leakage rates.',
    veracityDisclaimer: 'Physical SI measurement governed by fluid dynamics and aerospace life-support engineering baselines.',
  },
  {
    name: 'Consumable Inventories (O2, H2O, Food, Energy)',
    category: 'PHYSICAL_TELEMETRY',
    unit: 'Kilograms (kg), Liters (L), Kilocalories (kcal), Kilowatt-Hours (kWh)',
    hardwareBasis: 'Load cells, cryogenic mass sensors, flow meters, and battery charge columb-counters.',
    simulationRule: 'Exact mass conservation law: dM/dt = Influx - Consumption - Leakage.',
    veracityDisclaimer: 'Physical conservation of mass and energy adhering strictly to SI units.',
  },
  {
    name: 'Speed-of-Light Radio Latency',
    category: 'PHYSICAL_TELEMETRY',
    unit: 'Seconds (s)',
    hardwareBasis: 'Deep Space Network 34m/70m antenna beam waveguide RF transceivers.',
    simulationRule: 'tau = d / c ≈ 384,400 km / 299,792 km/s = 1.282s one-way (2.564s round-trip).',
    veracityDisclaimer: 'Universal physical constant governed by Maxwell electrodynamics.',
  },
  {
    name: 'Cumulative Ionizing Radiation Dose',
    category: 'PHYSICAL_TELEMETRY',
    unit: 'Millisieverts (mSv)',
    hardwareBasis: 'CRaTER silicon solid-state microdosimeters & tissue-equivalent plastic (TEP) detectors.',
    simulationRule: 'Accumulates 0.015 mSv/hr background + storm flux penalties up to 250 mSv mission safety threshold.',
    veracityDisclaimer: 'Standard ionizing radiation dosimetry based on NASA-STD-3001 spaceflight human standards.',
  },
  {
    name: 'Circadian Fatigue Index',
    category: 'EDUCATIONAL_MODEL',
    unit: 'Pedagogical Score [0 - 100]',
    hardwareBasis: 'Non-clinical mathematical construct (inspired by NASA actigraphy and PVT psychomotor vigilance data).',
    simulationRule: 'Compounded rate: 1.2 * dt + max(0, 7.0 - sleepHours) * 0.45; recovered by 6.0 * dt during sleep.',
    veracityDisclaimer: 'NON-CLINICAL EDUCATIONAL MODEL. Simplifies neurobehavioral sleep-debt dynamics for classroom learning.',
  },
  {
    name: 'Situational Stress Index',
    category: 'EDUCATIONAL_MODEL',
    unit: 'Pedagogical Score [0 - 100]',
    hardwareBasis: 'Dimensionless indicator (inspired by NASA BHP analog psychological evaluations).',
    simulationRule: 'Base creep + penalties for master alarms, communications blackouts, and unisolated system failures.',
    veracityDisclaimer: 'NON-CLINICAL EDUCATIONAL MODEL. Does not measure endocrinological biomarkers (cortisol) or HRV.',
  },
  {
    name: 'Task Workload Index',
    category: 'EDUCATIONAL_MODEL',
    unit: 'Pedagogical Score [0 - 100]',
    hardwareBasis: 'Synthesized educational score based on NASA Task Load Index (NASA-TLX) subscale weightings.',
    simulationRule: 'Base duty load + 15.0 per concurrently assigned experiment/maintenance task + 40.0 during EVAs.',
    veracityDisclaimer: 'NON-CLINICAL EDUCATIONAL MODEL. Reflects instructional task-management demands rather than clinical strain.',
  },
  {
    name: 'Resource Security Index',
    category: 'EDUCATIONAL_MODEL',
    unit: 'Operational Health Score [0 - 100]',
    hardwareBasis: 'Mission Control flight controller situational margin heuristic.',
    simulationRule: 'Weighted composite of remaining consumables divided by nominal 30-sol expedition requirements.',
    veracityDisclaimer: 'OPERATIONAL LOGISTICS HEURISTIC. Informs student decision-making during resource conservation scenarios.',
  },
];

export const MeasurementVsModelMatrix: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Educational Advisory Callout */}
      <Alert
        variant="warning"
        title="SCIENTIFIC METHODOLOGY & CLINICAL NON-EQUIVALENCE DIRECTIVE"
      >
        In accordance with NASA Human Research Program (HRP) educational standards, this simulation enforces a strict
        epistemological boundary between <strong>Physical Telemetry</strong> (direct sensor measurements adhering to SI units)
        and <strong>Pedagogical Human Factors Indices</strong> (normalized educational scores). Fatigue, stress, and workload
        indices are heuristic decision-training models; they are <strong>never</strong> to be interpreted as medical diagnoses,
        clinical biomarkers, or therapeutic evaluations.
      </Alert>

      {/* Side-by-Side Classification Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Measured Physical Values Card */}
        <Card withBracket className="bg-space-deep/80 border-nominal-green/40">
          <CardHeader className="border-b border-panel-blue/40 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-nominal-green" />
                <CardTitle className="text-nominal-green text-sm">
                  1. Measured Physical Values & Engineering Telemetry
                </CardTitle>
              </div>
              <Badge variant="nominal">SI Physical Standards</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-3 font-mono text-xs text-offwhite/80">
            <p className="font-sans text-xs">
              Direct physical phenomena quantified using standard SI dimensions. Derived from physical laws (fluid mechanics,
              orbital mechanics, electrodynamics, mass conservation).
            </p>
            <ul className="space-y-2 text-[11px] border-t border-panel-blue/30 pt-2">
              <li className="flex items-start gap-2">
                <span className="text-nominal-green font-bold">•</span>
                <span><strong>Dimensional Veracity:</strong> Kilograms (kg), Liters (L), Kilopascals (kPa), Kilowatt-Hours (kWh), Seconds (s).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-nominal-green font-bold">•</span>
                <span><strong>Hardware Counterparts:</strong> Mass spectrometers, pressure transducers, RF wavemeters, solid-state dosimeters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-nominal-green font-bold">•</span>
                <span><strong>Simulation Behavior:</strong> Strict deterministic conservation of mass and energy. No resource is created or destroyed without a registered physical flux.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Educational Simulation Models Card */}
        <Card withBracket className="bg-space-deep/80 border-warning-amber/40">
          <CardHeader className="border-b border-panel-blue/40 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning-amber" />
                <CardTitle className="text-warning-amber text-sm">
                  2. Educational Simulation Models (Pedagogical Indices)
                </CardTitle>
              </div>
              <Badge variant="warning">Pedagogical Constructs</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-3 font-mono text-xs text-offwhite/80">
            <p className="font-sans text-xs">
              Instructional decision-training algorithms that convert qualitative human performance research (NASA HRP, NASA-TLX)
              into responsive numeric indicators [0–100].
            </p>
            <ul className="space-y-2 text-[11px] border-t border-panel-blue/30 pt-2">
              <li className="flex items-start gap-2">
                <span className="text-warning-amber font-bold">•</span>
                <span><strong>Scale:</strong> Normalized dimensionless range [0 - 100] reflecting operational readiness.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning-amber font-bold">•</span>
                <span><strong>Not Clinical Telemetry:</strong> Cannot be equated to clinical ECG, EEG, polysomnography, or plasma biochemistry.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning-amber font-bold">•</span>
                <span><strong>Pedagogical Goal:</strong> Demonstrates to students how sleep deprivation, continuous high workload, and mission crises degrade human operational reliability.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Metric Demarcation Table */}
      <Card withBracket className="bg-space-deep/70">
        <CardHeader className="border-b border-panel-blue/40">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4 text-telemetry-cyan" />
            SIMULATION METRICS DEMARCATION REGISTER
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-panel-blue/60 text-[10px] text-offwhite/50 uppercase tracking-wider bg-control-navy/50">
                  <th className="py-2.5 px-3">Metric Name</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Dimension / Unit</th>
                  <th className="py-2.5 px-3">Hardware / Evidence Basis</th>
                  <th className="py-2.5 px-3">Simulation Solver Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-blue/30 text-[11px]">
                {COMPARISON_METRICS.map((metric, idx) => (
                  <tr key={idx} className="hover:bg-panel-blue/10 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-offwhite">
                      {metric.name}
                    </td>
                    <td className="py-2.5 px-3">
                      {metric.category === 'PHYSICAL_TELEMETRY' ? (
                        <Badge variant="nominal">Physical Telemetry</Badge>
                      ) : (
                        <Badge variant="warning">Educational Model</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-telemetry-cyan font-mono">
                      {metric.unit}
                    </td>
                    <td className="py-2.5 px-3 text-offwhite/70 max-w-xs font-sans text-xs">
                      {metric.hardwareBasis}
                    </td>
                    <td className="py-2.5 px-3 text-offwhite/80 font-mono text-[10px] max-w-sm">
                      {metric.simulationRule}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
