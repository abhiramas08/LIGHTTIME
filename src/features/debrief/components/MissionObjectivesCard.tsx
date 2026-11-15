/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Objectives Card (Achieved vs Missed)
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Target, CheckCircle2, XCircle } from 'lucide-react';
import { MissionObjectiveEvaluation } from '@/simulation/models/missionDebrief';

interface MissionObjectivesCardProps {
  objectivesAchieved: MissionObjectiveEvaluation[];
  objectivesMissed: MissionObjectiveEvaluation[];
}

export const MissionObjectivesCard: React.FC<MissionObjectivesCardProps> = ({
  objectivesAchieved,
  objectivesMissed,
}) => {
  const total = objectivesAchieved.length + objectivesMissed.length;
  const passRate = total > 0 ? Math.round((objectivesAchieved.length / total) * 100) : 0;

  return (
    <Card withBracket>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-telemetry-cyan" />
            <CardTitle>
              MISSION OBJECTIVES EVALUATION ({objectivesAchieved.length}/{total} ACHIEVED · {passRate}%)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="nominal">{objectivesAchieved.length} Achieved</Badge>
            {objectivesMissed.length > 0 && (
              <Badge variant="critical">{objectivesMissed.length} Missed</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Objectives Achieved */}
        <div className="space-y-2.5 font-mono text-xs">
          <span className="text-xs font-bold text-nominal-green uppercase flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>PRIMARY OBJECTIVES ACHIEVED ({objectivesAchieved.length})</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {objectivesAchieved.map((obj) => (
              <div
                key={obj.id}
                className="p-3 rounded border border-nominal-green/40 bg-space-black/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-offwhite">{obj.title}</span>
                  <Badge variant="nominal">{obj.category}</Badge>
                </div>
                <div className="text-[11px] text-offwhite/70">
                  <span className="text-telemetry-cyan">Target: </span>
                  {obj.targetCriteria}
                </div>
                <div className="text-[11px] text-nominal-green">
                  <span>Actual: </span>
                  {obj.actualResult}
                </div>
                <p className="text-[10px] text-offwhite/50 border-t border-panel-blue/20 pt-1">
                  {obj.impactAssessment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives Missed */}
        {objectivesMissed.length > 0 && (
          <div className="space-y-2.5 font-mono text-xs border-t border-panel-blue/30 pt-4">
            <span className="text-xs font-bold text-critical-red uppercase flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              <span>PRIMARY OBJECTIVES MISSED / COMPROMISED ({objectivesMissed.length})</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {objectivesMissed.map((obj) => (
                <div
                  key={obj.id}
                  className="p-3 rounded border border-critical-red/40 bg-critical-red/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-offwhite">{obj.title}</span>
                    <Badge variant="critical">{obj.category}</Badge>
                  </div>
                  <div className="text-[11px] text-offwhite/70">
                    <span className="text-telemetry-cyan">Target: </span>
                    {obj.targetCriteria}
                  </div>
                  <div className="text-[11px] text-critical-red">
                    <span>Actual: </span>
                    {obj.actualResult}
                  </div>
                  <p className="text-[10px] text-offwhite/50 border-t border-panel-blue/20 pt-1">
                    {obj.impactAssessment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
