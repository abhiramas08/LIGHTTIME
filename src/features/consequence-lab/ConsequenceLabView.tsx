/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Consequence Laboratory View (MOD-05)
 *
 * Demonstrates how communication conditions influence autonomous lunar
 * mission decisions, consumables depletion, and crew outcomes.
 */

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  GitBranch,
  Play,
  RotateCcw,
  BarChart3,
  Sliders,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useConsequenceLabStore } from '@/store/useConsequenceLabStore';
import { LabConfigPanel } from './LabConfigPanel';
import { RunDeckColumn } from './RunDeckColumn';
import { ComparativeCharts } from './ComparativeCharts';
import { SynchronizedTimeline } from './SynchronizedTimeline';
import { EducationalExplanationCard } from './EducationalExplanationCard';

export const ConsequenceLabView: React.FC = () => {
  const {
    stage,
    activeTab,
    scenario,
    runA,
    runB,
    report,
    actionFeedbackA,
    actionFeedbackB,
    setStage,
    setActiveTab,
    initializeRuns,
    executeRunAction,
    advanceRunTime,
    advanceBothRunsTime,
    resolveRun,
    resolveBothRuns,
    generateReport,
    resetLab,
  } = useConsequenceLabStore();

  return (
    <PageContainer
      moduleCode="MOD-05"
      title="Consequence Laboratory"
      description="Comparative decision matrix. Fork two parallel mission runs from an identical initial MissionState snapshot to observe how speed-of-light delays and signal blackouts dictate autonomous command decisions, consumable preservation, and crew survival."
      actions={
        <div className="flex items-center gap-2">
          {stage === 'CONFIG' ? (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={initializeRuns}
              className="gap-1.5 font-mono text-xs"
            >
              <Play className="h-3.5 w-3.5" />
              INITIALIZE EXPERIMENT
            </Button>
          ) : stage === 'EXPERIMENT' ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => advanceBothRunsTime(1.0)}
                className="gap-1 font-mono text-xs"
              >
                <Clock className="h-3.5 w-3.5 text-telemetry-cyan" />
                ADVANCE BOTH 1.0H
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={generateReport}
                className="gap-1.5 font-mono text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                GENERATE REPORT
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetLab}
                className="gap-1 font-mono text-xs text-offwhite/60 hover:text-offwhite"
              >
                <RotateCcw className="h-3 w-3" />
                RESET
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setStage('EXPERIMENT')}
                className="gap-1.5 font-mono text-xs"
              >
                <GitBranch className="h-3.5 w-3.5" />
                RETURN TO RUN DECKS
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={resetLab}
                className="gap-1 font-mono text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                NEW EXPERIMENT SETUP
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Workflow Navigation Steps */}
      <div className="flex items-center justify-between border-b border-panel-blue/40 pb-3 mb-6 font-mono text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStage('CONFIG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              stage === 'CONFIG'
                ? 'bg-panel-blue text-offwhite font-bold border border-telemetry-cyan'
                : 'text-offwhite/60 hover:text-offwhite'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>1. EXPERIMENT SETUP</span>
          </button>

          <span className="text-offwhite/30">→</span>

          <button
            type="button"
            disabled={!runA || !runB}
            onClick={() => setStage('EXPERIMENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              stage === 'EXPERIMENT'
                ? 'bg-panel-blue text-offwhite font-bold border border-telemetry-cyan'
                : runA && runB
                ? 'text-offwhite/60 hover:text-offwhite'
                : 'text-offwhite/30 cursor-not-allowed'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>2. DUAL RUN DECKS</span>
          </button>

          <span className="text-offwhite/30">→</span>

          <button
            type="button"
            disabled={!report && (!runA || !runB)}
            onClick={() => {
              if (runA && runB && !report) {
                generateReport();
              } else {
                setStage('REPORT');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              stage === 'REPORT'
                ? 'bg-panel-blue text-offwhite font-bold border border-telemetry-cyan'
                : runA && runB
                ? 'text-offwhite/60 hover:text-offwhite'
                : 'text-offwhite/30 cursor-not-allowed'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>3. COMPARATIVE SYNTHESIS</span>
          </button>
        </div>

        <Badge variant={stage === 'REPORT' ? 'nominal' : stage === 'EXPERIMENT' ? 'warning' : 'telemetry'}>
          {stage === 'CONFIG'
            ? 'READY TO PRIMING'
            : stage === 'EXPERIMENT'
            ? 'PARALLEL TIMELINES ACTIVE'
            : 'OUTCOMES SYNTHESIZED'}
        </Badge>
      </div>

      {/* STAGE 1: Configuration Panel */}
      {stage === 'CONFIG' && <LabConfigPanel />}

      {/* STAGE 2: Parallel Run Decks */}
      {stage === 'EXPERIMENT' && runA && runB && (
        <div className="space-y-6">
          {/* Synchronized Contingency Notification Bar */}
          <div className="p-3.5 rounded border border-warning-amber/40 bg-warning-amber/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning-amber animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-offwhite">
                  ACTIVE CONTINGENCY: {scenario.title}
                </span>
                <p className="text-[11px] text-offwhite/70">
                  {scenario.triggerConditions.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-7 gap-1"
                onClick={() => advanceBothRunsTime(0.5)}
              >
                <Clock className="h-3 w-3" />
                Step Both +30m
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-7 gap-1"
                onClick={() => advanceBothRunsTime(1.0)}
              >
                <Clock className="h-3 w-3" />
                Step Both +1.0h
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-7 border-nominal-green/60 text-nominal-green hover:bg-nominal-green/10"
                onClick={resolveBothRuns}
              >
                <CheckCircle2 className="h-3 w-3" />
                Resolve Both
              </Button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-offwhite/50">DECK VIEW:</span>
              <Button
                type="button"
                size="sm"
                variant={activeTab === 'SIDE_BY_SIDE' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('SIDE_BY_SIDE')}
                className="text-xs h-7"
              >
                Side-by-Side Dual Deck
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeTab === 'RUN_A' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('RUN_A')}
                className="text-xs h-7"
              >
                Focus {runA.name}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeTab === 'RUN_B' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('RUN_B')}
                className="text-xs h-7"
              >
                Focus {runB.name}
              </Button>
            </div>

            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={generateReport}
              className="gap-1.5 text-xs h-7"
            >
              <span>View Full Outcome Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Dual Run Columns */}
          {activeTab === 'SIDE_BY_SIDE' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RunDeckColumn
                run={runA}
                scenario={scenario}
                onExecuteAction={(act) => executeRunAction('RUN_A', act)}
                onAdvanceTime={(dt) => advanceRunTime('RUN_A', dt)}
                onResolve={() => resolveRun('RUN_A')}
                actionFeedback={actionFeedbackA}
                borderColor="border-telemetry-cyan/50"
                badgeVariant="telemetry"
              />

              <RunDeckColumn
                run={runB}
                scenario={scenario}
                onExecuteAction={(act) => executeRunAction('RUN_B', act)}
                onAdvanceTime={(dt) => advanceRunTime('RUN_B', dt)}
                onResolve={() => resolveRun('RUN_B')}
                actionFeedback={actionFeedbackB}
                borderColor="border-critical-red/50"
                badgeVariant="critical"
              />
            </div>
          ) : activeTab === 'RUN_A' ? (
            <RunDeckColumn
              run={runA}
              scenario={scenario}
              onExecuteAction={(act) => executeRunAction('RUN_A', act)}
              onAdvanceTime={(dt) => advanceRunTime('RUN_A', dt)}
              onResolve={() => resolveRun('RUN_A')}
              actionFeedback={actionFeedbackA}
              borderColor="border-telemetry-cyan/50"
              badgeVariant="telemetry"
            />
          ) : (
            <RunDeckColumn
              run={runB}
              scenario={scenario}
              onExecuteAction={(act) => executeRunAction('RUN_B', act)}
              onAdvanceTime={(dt) => advanceRunTime('RUN_B', dt)}
              onResolve={() => resolveRun('RUN_B')}
              actionFeedback={actionFeedbackB}
              borderColor="border-critical-red/50"
              badgeVariant="critical"
            />
          )}

          {/* Live Synchronized Timeline Preview */}
          <SynchronizedTimeline runA={runA} runB={runB} />
        </div>
      )}

      {/* STAGE 3: Comparative Report & Educational Synthesis */}
      {stage === 'REPORT' && report && (
        <div className="space-y-6">
          <ComparativeCharts report={report} />
          <SynchronizedTimeline runA={report.runA} runB={report.runB} />
          <EducationalExplanationCard report={report} />
        </div>
      )}
    </PageContainer>
  );
};
