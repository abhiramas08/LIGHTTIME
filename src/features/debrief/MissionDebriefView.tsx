/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief & Learning Report View (MOD-09)
 *
 * Generated at the conclusion of a mission based strictly on actual simulation data.
 * Includes PDF export and Student Presentation Mode.
 */

import React, { useMemo, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Printer,
  Presentation,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMissionStore } from '@/store/useMissionStore';
import { generateMissionDebriefReport } from '@/simulation/engine/debriefEngine';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard';
import { MissionObjectivesCard } from './components/MissionObjectivesCard';
import { CrewWellbeingDebrief } from './components/CrewWellbeingDebrief';
import { ResourceUsageDebrief } from './components/ResourceUsageDebrief';
import { EquipmentDebrief } from './components/EquipmentDebrief';
import { DecisionAnalysisCard } from './components/DecisionAnalysisCard';
import { DebriefTelemetryCharts } from './components/DebriefTelemetryCharts';
import { ImportantLessonsCard } from './components/ImportantLessonsCard';

export const MissionDebriefView: React.FC = () => {
  const { missionState } = useMissionStore();

  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Generate report purely from actual simulation state
  const report = useMemo(() => {
    return generateMissionDebriefReport(missionState);
  }, [missionState]);

  // Handle PDF Export / Print
  const handlePrintPdf = () => {
    window.print();
  };

  const slides = [
    { title: 'Executive Overview', component: <ExecutiveSummaryCard report={report} /> },
    { title: 'Mission Objectives', component: <MissionObjectivesCard objectivesAchieved={report.objectivesAchieved} objectivesMissed={report.objectivesMissed} /> },
    { title: 'Crew Human Factors', component: <CrewWellbeingDebrief crewRecords={report.crewWellbeingSummary} aggregateCrewHealthScore={report.aggregateCrewHealthScore} /> },
    { title: 'Resource Balances', component: <ResourceUsageDebrief resourceSummary={report.resourceUsageSummary} /> },
    { title: 'Systems & Machinery', component: <EquipmentDebrief equipmentSummary={report.equipmentSummary} /> },
    { title: 'Decision Critique', component: <DecisionAnalysisCard decisionAnalysis={report.decisionAnalysis} totalDirectivesExecuted={report.totalDirectivesExecuted} /> },
    { title: 'Telemetry Trends', component: <DebriefTelemetryCharts report={report} /> },
    { title: 'Educational Lessons', component: <ImportantLessonsCard importantLessons={report.importantLessons} /> },
  ];

  return (
    <PageContainer
      moduleCode="MOD-09"
      title="Mission Debrief & Learning Report"
      description="Post-flight debrief and academic synthesis. Analyzes actual simulation telemetry, human factors curves, resource consumption balances, and commander directive outcomes."
      actions={
        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            size="sm"
            variant={isPresentationMode ? 'primary' : 'outline'}
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className="gap-1.5 font-mono text-xs"
          >
            <Presentation className="h-3.5 w-3.5" />
            {isPresentationMode ? 'EXIT PRESENTATION' : 'PRESENTATION MODE'}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePrintPdf}
            className="gap-1.5 font-mono text-xs text-telemetry-cyan hover:bg-telemetry-cyan/10"
          >
            <Printer className="h-3.5 w-3.5" />
            EXPORT PDF / PRINT
          </Button>
        </div>
      }
    >
      {/* Presentation Mode Controller */}
      {isPresentationMode ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded border border-telemetry-cyan/50 bg-panel-blue/30 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="telemetry">SLIDE {currentSlideIndex + 1} OF {slides.length}</Badge>
              <span className="font-bold text-offwhite text-sm">
                {slides[currentSlideIndex]?.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                className="text-xs h-7 gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous Slide
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                className="text-xs h-7 gap-1"
              >
                Next Slide
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="min-h-[500px]">
            {slides[currentSlideIndex]?.component}
          </div>
        </div>
      ) : (
        /* Standard Full Dossier View */
        <div className="space-y-8 debrief-dossier-print">
          {/* 1. Executive Summary */}
          <section id="executive-summary" className="print:break-after-page">
            <ExecutiveSummaryCard report={report} />
          </section>

          {/* 2. Objectives Achieved vs Missed */}
          <section id="mission-objectives" className="print:break-after-page">
            <MissionObjectivesCard
              objectivesAchieved={report.objectivesAchieved}
              objectivesMissed={report.objectivesMissed}
            />
          </section>

          {/* 3. Decision Analysis Section (5 Pillars) */}
          <section id="decision-analysis" className="print:break-after-page">
            <DecisionAnalysisCard
              decisionAnalysis={report.decisionAnalysis}
              totalDirectivesExecuted={report.totalDirectivesExecuted}
            />
          </section>

          {/* 4. Crew Wellbeing Debrief */}
          <section id="crew-wellbeing" className="print:break-after-page">
            <CrewWellbeingDebrief
              crewRecords={report.crewWellbeingSummary}
              aggregateCrewHealthScore={report.aggregateCrewHealthScore}
            />
          </section>

          {/* 5. Resource Consumption Summary */}
          <section id="resource-usage" className="print:break-after-page">
            <ResourceUsageDebrief resourceSummary={report.resourceUsageSummary} />
          </section>

          {/* 6. Habitat Machinery & Systems Audit */}
          <section id="equipment-condition" className="print:break-after-page">
            <EquipmentDebrief equipmentSummary={report.equipmentSummary} />
          </section>

          {/* 7. Six Visual Telemetry Trend Charts */}
          <section id="telemetry-charts" className="print:break-after-page">
            <DebriefTelemetryCharts report={report} />
          </section>

          {/* 8. Important Educational Lessons */}
          <section id="educational-lessons" className="print:break-after-page">
            <ImportantLessonsCard importantLessons={report.importantLessons} />
          </section>
        </div>
      )}
    </PageContainer>
  );
};
