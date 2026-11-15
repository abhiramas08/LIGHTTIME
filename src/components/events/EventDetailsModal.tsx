import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  FileText,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { MissionEventRecord } from '@/simulation/models/missionState';
import { normalizeSeverity } from '@/simulation/models/eventTypes';

interface EventDetailsModalProps {
  event: MissionEventRecord | null;
  onClose: () => void;
  onAcknowledge?: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onAcknowledge,
}) => {
  if (!event) return null;

  const normSeverity = normalizeSeverity(event.severity);

  const getSeverityBadgeVariant = (sev: string): 'critical' | 'warning' | 'nominal' | 'telemetry' => {
    switch (sev) {
      case 'CRITICAL':
        return 'critical';
      case 'WARNING':
        return 'warning';
      case 'NOMINAL':
        return 'nominal';
      default:
        return 'telemetry';
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-critical-red animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-warning-amber" />;
      case 'NOMINAL':
        return <CheckCircle2 className="h-5 w-5 text-nominal-green" />;
      default:
        return <Info className="h-5 w-5 text-signal-cyan" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-dark/85 backdrop-blur-sm animate-in fade-in select-none">
      <Card
        withBracket
        className="max-w-2xl w-full border-2 border-panel-blue bg-space-surface/98 shadow-2xl overflow-hidden font-mono text-xs"
      >
        {/* Header */}
        <CardHeader className="border-b border-panel-blue/40 pb-3 bg-space-dark/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getSeverityBadgeVariant(normSeverity)} className="text-[10px] font-bold">
                  {normSeverity}
                </Badge>
                {event.affectedSystem && (
                  <Badge variant="telemetry" className="text-[10px]">
                    SYSTEM: {event.affectedSystem}
                  </Badge>
                )}
                {event.eventType && (
                  <Badge variant="neutral" className="text-[10px] text-offwhite/60">
                    TYPE: {event.eventType}
                  </Badge>
                )}
                <span className="text-[10px] text-offwhite/50">{event.eventId}</span>
              </div>
              <CardTitle className="text-sm font-bold text-offwhite flex items-center gap-2 mt-1">
                {getSeverityIcon(normSeverity)}
                {event.title}
              </CardTitle>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-offwhite/60 hover:text-offwhite shrink-0"
              title="Close Event Details"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Simulation Time Banner */}
          <div className="p-2.5 bg-space-dark/90 border border-panel-blue/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-offwhite/70">
              <Clock className="h-4 w-4 text-warning-amber" />
              <span>SIMULATION TIME:</span>
              <strong className="text-offwhite font-bold">
                {event.simulationTime || `MET ${event.timestampHours.toFixed(2)}h`}
              </strong>
            </div>
            <div className="text-[11px] text-offwhite/50">
              Elapsed: {event.timestampHours.toFixed(2)} hours
            </div>
          </div>

          {/* Event Narrative & Details */}
          <div className="p-3 bg-panel-blue/10 border-l-2 border-signal-cyan space-y-1">
            <div className="text-[10px] font-bold text-signal-cyan uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              SITUATIONAL DETAILS & TELEMETRY OBSERVATION
            </div>
            <p className="text-xs text-offwhite/90 leading-relaxed">{event.details}</p>
          </div>

          {/* State Transition (Previous vs New Value) */}
          {(event.previousValue !== null || event.newValue !== null) && (
            <div className="p-3 bg-space-dark/70 border border-panel-blue/30 space-y-1.5">
              <div className="text-[10px] font-bold text-offwhite/60 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-warning-amber" />
                TELEMETRY STATE TRANSITION
              </div>
              <div className="flex items-center gap-3 text-xs bg-space-surface/60 p-2 border border-panel-blue/20">
                <div className="flex-1">
                  <span className="text-[10px] text-offwhite/50 block">PREVIOUS VALUE:</span>
                  <span className="text-offwhite/80 font-bold font-mono">
                    {event.previousValue ?? 'Nominal / Baseline'}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-signal-cyan shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-offwhite/50 block">NEW VALUE:</span>
                  <span className="text-signal-cyan font-bold font-mono">
                    {event.newValue ?? 'Updated'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trigger & Related User Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/30 space-y-1">
              <span className="text-[10px] text-offwhite/50 font-bold uppercase tracking-wider block">
                ROOT CAUSE TRIGGER:
              </span>
              <p className="text-offwhite/80 text-[11px] leading-snug">
                {event.trigger || 'Discrete mathematical solver threshold breach'}
              </p>
            </div>

            <div className="p-2.5 bg-space-dark/60 border border-panel-blue/30 space-y-1">
              <span className="text-[10px] text-offwhite/50 font-bold uppercase tracking-wider block">
                RELATED FLIGHT ACTION:
              </span>
              <p className="text-offwhite/80 text-[11px] leading-snug font-mono">
                {event.relatedUserAction ? (
                  <span className="text-signal-cyan font-bold">{event.relatedUserAction}</span>
                ) : (
                  <span className="text-offwhite/40 italic">Autonomous Engine Evaluation (No direct action)</span>
                )}
              </p>
            </div>
          </div>

          {/* NASA Educational Explanation */}
          <div className="p-3 bg-space-dark/80 border border-panel-blue/40 space-y-1.5">
            <div className="text-[10px] font-bold text-nominal-green flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-nominal-green" />
              NASA FLIGHT RULES & SCIENTIFIC PRINCIPLES
            </div>
            <p className="text-[11px] text-offwhite/80 leading-relaxed">
              {event.educationalExplanation ||
                'NASA Flight Safety Rules define parameter envelopes to safeguard crew life and habitat vehicle integrity during long-duration lunar surface exploration.'}
            </p>
          </div>

          {/* Read-Only Inspection Notice */}
          <div className="p-2 bg-space-dark/40 border border-panel-blue/20 text-[10px] text-offwhite/50 flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-signal-cyan shrink-0" />
            <span>
              READ-ONLY BLACK-BOX INSPECTION: Reviewing historical event records does not alter current mission
              state, consumables inventories, or clock timing.
            </span>
          </div>

          {/* Modal Action Footer */}
          <div className="pt-2 border-t border-panel-blue/30 flex items-center justify-between gap-3">
            <div>
              {onAcknowledge && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-offwhite/70 hover:text-offwhite text-xs font-mono"
                  onClick={() => onAcknowledge(event.eventId)}
                >
                  <UserCheck className="h-3.5 w-3.5 text-nominal-green" />
                  {event.acknowledged ? 'ACKNOWLEDGED' : 'MARK ACKNOWLEDGED'}
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="font-bold text-xs font-mono tracking-wider"
            >
              DISMISS PANEL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
