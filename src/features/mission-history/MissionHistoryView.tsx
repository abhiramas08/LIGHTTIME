import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  History,
  Play,
  FileText,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import { useMissionHistoryStore } from '@/store/useMissionHistoryStore';
import { MissionLibraryTab } from './MissionLibraryTab';
import { MissionSummaryInspectionTab } from './MissionSummaryInspectionTab';
import { MissionComparisonTab } from './MissionComparisonTab';
import { MissionReplayTab } from './MissionReplayTab';
import { MissionEventsTab } from './MissionEventsTab';

export const MissionHistoryView: React.FC = () => {
  const { activeTab, setActiveTab, savedRuns, activeReplay } = useMissionHistoryStore();

  const isInspectionTab =
    activeTab === 'summary' ||
    activeTab === 'crew' ||
    activeTab === 'emergencies' ||
    activeTab === 'resources';

  return (
    <PageContainer
      moduleCode="MOD-06"
      title="Mission History & Deterministic Replay"
      description="Black-box flight telemetry recorder, mission archive, cross-expedition comparative laboratory, and bitwise-deterministic replay engine. Audit crew biometrics, resource curves, and emergency directives."
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="nominal">ARCHIVE VERIFIED</Badge>
          <Badge variant="telemetry">{savedRuns.length} SAVED MISSIONS</Badge>
          {activeReplay && (
            <Badge variant="warning" className="animate-pulse">
              REPLAY ACTIVE: STEP {activeReplay.currentStepIndex + 1}/{activeReplay.timeline.length}
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-4 font-mono">
        {/* Main Navigation Bar */}
        <div className="flex flex-wrap gap-2 border-b border-panel-blue/60 pb-2">
          <Button
            variant={activeTab === 'library' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('library')}
            className="gap-1.5 text-xs font-bold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>SAVED EXPEDITIONS ARCHIVE ({savedRuns.length})</span>
          </Button>

          <Button
            variant={isInspectionTab ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('summary')}
            className="gap-1.5 text-xs font-bold"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>EXPEDITION SUMMARY & AUDIT</span>
          </Button>

          <Button
            variant={activeTab === 'comparison' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('comparison')}
            className="gap-1.5 text-xs font-bold"
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>RUN COMPARISON DECK</span>
          </Button>

          <Button
            variant={activeTab === 'replay' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              if (!activeReplay && savedRuns.length > 0 && savedRuns[0]) {
                useMissionHistoryStore.getState().startReplay(savedRuns[0].missionId);
              } else {
                setActiveTab('replay');
              }
            }}
            className="gap-1.5 text-xs font-bold"
          >
            <Play className="h-3.5 w-3.5" />
            <span>DETERMINISTIC REPLAY</span>
          </Button>

          <Button
            variant={activeTab === 'events' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('events')}
            className="gap-1.5 text-xs font-bold"
          >
            <History className="h-3.5 w-3.5" />
            <span>LIVE EVENT & ALERT STREAM</span>
          </Button>
        </div>

        {/* View Switcher */}
        {activeTab === 'library' && <MissionLibraryTab />}
        {isInspectionTab && <MissionSummaryInspectionTab />}
        {activeTab === 'comparison' && <MissionComparisonTab />}
        {activeTab === 'replay' && <MissionReplayTab />}
        {activeTab === 'events' && <MissionEventsTab />}
      </div>
    </PageContainer>
  );
};
