/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Debrief Important Educational Lessons Card
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { GraduationCap, Lightbulb } from 'lucide-react';

interface ImportantLessonsCardProps {
  importantLessons: string[];
}

export const ImportantLessonsCard: React.FC<ImportantLessonsCardProps> = ({ importantLessons }) => {
  return (
    <Card withBracket className="border-panel-blue/70 bg-space-surface/95">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-blue/30 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-telemetry-cyan" />
            <CardTitle>EDUCATIONAL LESSONS & CLASSROOM TAKEAWAYS</CardTitle>
          </div>
          <Badge variant="telemetry">ACADEMIC & CURRICULAR SYNTHESIS</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 font-mono text-xs">
        <p className="text-[11px] text-offwhite/70">
          These principles link simulated decisions directly to real NASA human exploration standards and orbital mechanics realities.
        </p>

        <div className="space-y-3">
          {importantLessons.map((lesson, idx) => {
            const [headline, ...rest] = lesson.split(': ');
            return (
              <div
                key={idx}
                className="p-3.5 rounded border border-panel-blue/40 bg-space-black/50 space-y-1"
              >
                <div className="flex items-center gap-2 text-telemetry-cyan font-bold text-xs uppercase">
                  <Lightbulb className="h-3.5 w-3.5 text-warning-amber shrink-0" />
                  <span>{headline}</span>
                </div>
                <p className="text-[11px] text-offwhite/80 leading-relaxed pl-5">
                  {rest.join(': ')}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
