import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card withBracket className="max-w-lg w-full text-center">
        <CardHeader className="justify-center border-b border-panel-blue/60 py-3">
          <CardTitle className="text-warning-amber">
            <Compass className="h-4 w-4" />
            TELEMETRY VECTOR UNRESOLVED · 404 NOT FOUND
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-8 font-mono text-xs">
          <div className="text-5xl font-bold font-mono text-telemetry-cyan glow-cyan-sm">
            404
          </div>
          <p className="text-sm font-semibold uppercase text-offwhite">
            COMMUNICATIONS TARGET VECTOR OUT OF LUNAR ORBIT
          </p>
          <p className="text-offwhite/60 max-w-sm mx-auto text-[11px] leading-relaxed">
            The requested console coordinate does not match any active surface subsystem, flight directive, or telemetry channel on the lunar grid.
          </p>

          <div className="pt-4 flex justify-center">
            <Link to="/">
              <Button variant="primary" size="md" className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                RETURN TO MISSION OVERVIEW
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
