import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  GitCompare,
  Trophy,
  Lightbulb,
} from 'lucide-react';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';
import { compareMissionRuns } from '@/simulation/engine/replayEngine';

export const MissionComparisonTab: React.FC = () => {
  const { savedRuns, comparisonRunIds, setComparisonRuns, setActiveTab } =
    useMissionHistoryStore();

  const [idA, idB] = comparisonRunIds;

  const runA = savedRuns.find((r) => r.missionId === idA) || savedRuns[0];
  const runB =
    savedRuns.find((r) => r.missionId === idB) ||
    savedRuns.find((r) => r.missionId !== runA?.missionId) ||
    savedRuns[1] ||
    runA;

  const comparisonReport = useMemo(() => {
    if (!runA || !runB) return null;
    return compareMissionRuns(runA, runB);
  }, [runA, runB]);

  if (!runA || !runB || !comparisonReport) {
    return (
      <div className="p-8 text-center text-offwhite/50 space-y-3 font-mono">
        <p>Insufficient mission runs available for comparative analysis.</p>
        <Button variant="primary" size="sm" onClick={() => setActiveTab('library')}>
          RETURN TO MISSION LIBRARY
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Run Selector Deck */}
      <Card withBracket className="border-signal-cyan/50 bg-space-surface">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Run A Selector */}
            <div className="w-full sm:w-1/2 space-y-1">
              <label className="text-[10px] text-signal-cyan uppercase font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-signal-cyan" />
                MISSION EXPEDITION ALPHA (RUN A)
              </label>
              <select
                value={runA.missionId}
                onChange={(e) => setComparisonRuns(e.target.value, runB.missionId)}
                className="w-full bg-space-dark border border-signal-cyan/60 text-offwhite text-xs px-2.5 py-1.5 focus:outline-none focus:border-signal-cyan"
              >
                {savedRuns.map((r) => (
                  <option key={r.missionId} value={r.missionId}>
                    {r.missionName} ({r.status} • {r.grade ?? 'Active'})
                  </option>
                ))}
              </select>
            </div>

            <div className="shrink-0 p-2 text-offwhite/40">
              <GitCompare className="h-5 w-5 text-signal-cyan" />
            </div>

            {/* Run B Selector */}
            <div className="w-full sm:w-1/2 space-y-1">
              <label className="text-[10px] text-warning-amber uppercase font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning-amber" />
                MISSION EXPEDITION BRAVO (RUN B)
              </label>
              <select
                value={runB.missionId}
                onChange={(e) => setComparisonRuns(runA.missionId, e.target.value)}
                className="w-full bg-space-dark border border-warning-amber/60 text-offwhite text-xs px-2.5 py-1.5 focus:outline-none focus:border-warning-amber"
              >
                {savedRuns.map((r) => (
                  <option key={r.missionId} value={r.missionId}>
                    {r.missionName} ({r.status} • {r.grade ?? 'Active'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Executive Takeaway Banner */}
          <div className="p-3 bg-space-dark/80 border-l-4 border-signal-cyan flex items-start gap-3">
            <Trophy className="h-4 w-4 text-warning-amber shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[10px] text-signal-cyan uppercase font-bold">
                COMPARATIVE PERFORMANCE EVALUATION
              </div>
              <p className="text-offwhite/90 text-xs leading-relaxed">
                {comparisonReport.executiveTakeaway}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Metrics Table */}
      <Card withBracket>
        <CardHeader className="border-b border-panel-blue/40 pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-signal-cyan" />
            SIDE-BY-SIDE TELEMETRY & FLIGHT PERFORMANCE MATRIX
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-space-dark/80 border-b border-panel-blue/40 text-[10px] text-offwhite/50 uppercase">
                <th className="py-2.5 px-3">CATEGORY / METRIC</th>
                <th className="py-2.5 px-3 text-signal-cyan">
                  RUN A: {runA.missionName.slice(0, 24)}...
                </th>
                <th className="py-2.5 px-3 text-warning-amber">
                  RUN B: {runB.missionName.slice(0, 24)}...
                </th>
                <th className="py-2.5 px-3 text-center">ADVANTAGE</th>
                <th className="py-2.5 px-3 text-right">DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-blue/20">
              {comparisonReport.metrics.map((row, idx) => {
                const isAdvA = row.advantage === 'A';
                const isAdvB = row.advantage === 'B';

                return (
                  <tr
                    key={idx}
                    className="hover:bg-space-surface/60 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-offwhite">{row.metricName}</div>
                      {row.notes && (
                        <div className="text-[10px] text-offwhite/40">{row.notes}</div>
                      )}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-bold ${
                        isAdvA ? 'text-nominal-green' : 'text-offwhite/90'
                      }`}
                    >
                      {row.valA}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-bold ${
                        isAdvB ? 'text-nominal-green' : 'text-offwhite/90'
                      }`}
                    >
                      {row.valB}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isAdvA ? (
                        <Badge variant="nominal" className="text-[9px] px-1.5 py-0">
                          ADVANTAGE A
                        </Badge>
                      ) : isAdvB ? (
                        <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                          ADVANTAGE B
                        </Badge>
                      ) : (
                        <Badge variant="telemetry" className="text-[9px] px-1.5 py-0">
                          {row.advantage}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-signal-cyan">
                      {row.delta ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Educational Explanations */}
      <Card withBracket className="border-panel-blue/40 bg-space-surface/90">
        <CardHeader className="border-b border-panel-blue/30 pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning-amber" />
            EDUCATIONAL FLIGHT DYNAMICS & TAKEAWAYS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-xs text-offwhite/80">
          {comparisonReport.educationalExplanations.map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-signal-cyan font-bold">•</span>
              <span>{note}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
