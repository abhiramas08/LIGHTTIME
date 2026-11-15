import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  X,
  AlertTriangle,
  Flame,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { MissionEventRecord } from '@/simulation/models/missionState';
import { normalizeSeverity } from '@/simulation/models/eventTypes';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import { useInstructorStore } from '@/store/useInstructorStore';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { missionEventLog, missionState, acknowledgeEvent, acknowledgeAllEvents } =
    useMissionStore();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'UNREAD'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<MissionEventRecord | null>(null);

  if (!isOpen) return null;

  const events = missionEventLog.length > 0 ? missionEventLog : missionState.records.eventHistory;

  // Filter alerts (warnings and criticals)
  const alertEvents = events.filter((e) => {
    const sev = normalizeSeverity(e.severity);
    if (activeFilter === 'CRITICAL') return sev === 'CRITICAL';
    if (activeFilter === 'WARNING') return sev === 'WARNING';
    if (activeFilter === 'UNREAD') return !e.acknowledged && (sev === 'CRITICAL' || sev === 'WARNING');
    return sev === 'CRITICAL' || sev === 'WARNING' || sev === 'INFORMATIONAL' || sev === 'NOMINAL';
  });

  const unacknowledgedCount = events.filter(
    (e) => !e.acknowledged && (normalizeSeverity(e.severity) === 'CRITICAL' || normalizeSeverity(e.severity) === 'WARNING')
  ).length;

  const handleOpenFullArchive = () => {
    onClose();
    navigate('/mission-history');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-mono text-xs select-none animate-in fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-space-dark/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-space-surface/98 border-l-2 border-panel-blue shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-panel-blue/40 bg-space-dark/90 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={unacknowledgedCount > 0 ? 'critical' : 'nominal'} className="text-[10px] font-bold">
                  {unacknowledgedCount > 0 ? `${unacknowledgedCount} UNACKNOWLEDGED` : 'ALL ALERTS CLEAR'}
                </Badge>
                <span className="text-[10px] text-offwhite/50">{events.length} TOTAL EVENTS</span>
              </div>
              <h2 className="text-sm font-bold font-heading text-offwhite uppercase tracking-wider flex items-center gap-2 mt-1">
                <AlertTriangle className="h-4 w-4 text-warning-amber" />
                GLOBAL MISSION ALERTS
              </h2>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-offwhite/60 hover:text-offwhite"
              title="Close Alerts Drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-space-dark/60 border-b border-panel-blue/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {(['ALL', 'CRITICAL', 'WARNING', 'UNREAD'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-1 text-[10px] font-bold tracking-wider transition-colors ${
                    activeFilter === filter
                      ? 'bg-signal-cyan text-space-dark'
                      : 'text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {unacknowledgedCount > 0 && (
              <button
                type="button"
                onClick={acknowledgeAllEvents}
                className="text-[10px] text-signal-cyan hover:underline flex items-center gap-1 font-bold"
              >
                <UserCheck className="h-3 w-3" />
                ACK ALL
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {alertEvents.length === 0 ? (
              <div className="text-center py-12 text-offwhite/40 space-y-2">
                <ShieldCheck className="h-8 w-8 text-nominal-green mx-auto opacity-60" />
                <p>No active alerts matching filter criteria.</p>
                <p className="text-[10px]">All telemetry streams operating within nominal limits.</p>
              </div>
            ) : (
              alertEvents.map((evt) => {
                const normSev = normalizeSeverity(evt.severity);
                const isCritical = normSev === 'CRITICAL';
                const isWarning = normSev === 'WARNING';

                return (
                  <div
                    key={evt.eventId}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 border transition-all cursor-pointer text-left relative ${
                      isCritical
                        ? 'border-critical-red/60 bg-critical-red/10 hover:border-critical-red'
                        : isWarning
                        ? 'border-warning-amber/50 bg-warning-amber/10 hover:border-warning-amber'
                        : 'border-panel-blue/30 bg-space-dark/50 hover:border-panel-blue'
                    } ${!evt.acknowledged ? 'ring-1 ring-inset ring-signal-cyan/50' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant={
                            isCritical ? 'critical' : isWarning ? 'warning' : 'nominal'
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {normSev}
                        </Badge>
                        {evt.affectedSystem && (
                          <span className="text-[9px] text-signal-cyan font-bold">
                            {evt.affectedSystem}
                          </span>
                        )}
                        {!evt.acknowledged && (
                          <span className="w-1.5 h-1.5 rounded-full bg-signal-cyan animate-ping" />
                        )}
                      </div>
                      <span className="text-[9px] text-offwhite/50 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {evt.simulationTime || `MET ${evt.timestampHours.toFixed(1)}h`}
                      </span>
                    </div>

                    <div className="font-bold text-offwhite text-xs mb-1 flex items-center gap-1.5">
                      {isCritical && <Flame className="h-3 w-3 text-critical-red animate-pulse" />}
                      <span className="truncate">{evt.title}</span>
                    </div>

                    <p className="text-[11px] text-offwhite/75 line-clamp-2 leading-snug">
                      {evt.details}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-panel-blue/20 flex items-center justify-between text-[9px] text-offwhite/50">
                      {isCritical || isWarning ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            useInstructorStore.getState().explainWarning({
                              warningId: evt.eventId,
                              subsystem: evt.affectedSystem || evt.category,
                              severity: isCritical ? 'CRITICAL' : 'WARNING',
                              headline: evt.title,
                              currentValue: evt.newValue || 'Caution Active',
                              thresholdValue: 'Nominal Limit',
                              details: evt.details,
                            });
                          }}
                          className="text-warning-amber hover:text-white font-bold flex items-center gap-1 hover:underline"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-warning-amber animate-pulse" />
                          EXPLAIN WARNING
                        </button>
                      ) : (
                        <span>Click to view telemetry details</span>
                      )}
                      <span className="text-signal-cyan font-bold flex items-center gap-0.5">
                        INSPECT <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-panel-blue/40 bg-space-dark/90 flex items-center justify-between gap-2">
            <span className="text-[10px] text-offwhite/50">Black-Box Event Log</span>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs text-signal-cyan border-panel-blue hover:border-signal-cyan"
              onClick={handleOpenFullArchive}
            >
              <Search className="h-3.5 w-3.5" />
              OPEN FULL EVENT ARCHIVE
            </Button>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAcknowledge={(id) => {
            acknowledgeEvent(id);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
