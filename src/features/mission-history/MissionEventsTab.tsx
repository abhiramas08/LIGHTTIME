import React, { useState, useMemo } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Info,
  Flame,
} from 'lucide-react';
import { MissionEventRecord } from '@/simulation/models/missionState';
import {
  NotificationCategory,
  EventAffectedSystem,
  normalizeSeverity,
  formatSimulationTime,
  mapCategoryToAffectedSystem,
} from '@/simulation/models/eventTypes';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';

export const MissionEventsTab: React.FC = () => {
  const { missionState, missionEventLog, userActions, acknowledgeEvent } = useMissionStore();

  const [activeSubTab, setActiveSubTab] = useState<'events' | 'actions' | 'telemetry'>('events');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<'ALL' | EventAffectedSystem>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'ALL' | NotificationCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [inspectedEvent, setInspectedEvent] = useState<MissionEventRecord | null>(null);

  // Combine and deduplicate events by eventId to prevent repeated render issues
  const allEvents = useMemo(() => {
    const raw = missionEventLog.length > 0 ? missionEventLog : missionState.records.eventHistory;
    const seen = new Set<string>();
    const deduplicated: MissionEventRecord[] = [];

    for (const evt of raw) {
      if (!seen.has(evt.eventId)) {
        seen.add(evt.eventId);
        deduplicated.push(evt);
      }
    }
    return deduplicated;
  }, [missionEventLog, missionState.records.eventHistory]);

  // Counts for system filters
  const systemCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allEvents.length,
      CREW: 0,
      HABITAT: 0,
      EMERGENCY: 0,
      COMMUNICATIONS: 0,
      MISSION: 0,
    };
    for (const e of allEvents) {
      const sys = e.affectedSystem ?? mapCategoryToAffectedSystem(e.category);
      if (counts[sys] !== undefined) counts[sys]++;
    }
    return counts;
  }, [allEvents]);

  // Counts for severity categories
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allEvents.length,
      CRITICAL: 0,
      WARNING: 0,
      NOMINAL: 0,
      INFORMATIONAL: 0,
    };
    for (const e of allEvents) {
      const sev = normalizeSeverity(e.severity);
      if (counts[sev] !== undefined) counts[sev]++;
    }
    return counts;
  }, [allEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((evt) => {
        // System Filter
        if (selectedSystemFilter !== 'ALL') {
          const sys = evt.affectedSystem ?? mapCategoryToAffectedSystem(evt.category);
          if (sys !== selectedSystemFilter) return false;
        }

        // Severity Filter
        if (selectedSeverityFilter !== 'ALL') {
          const sev = normalizeSeverity(evt.severity);
          if (sev !== selectedSeverityFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(query);
          const matchDetails = evt.details.toLowerCase().includes(query);
          const matchTrigger = evt.trigger?.toLowerCase().includes(query) ?? false;
          const matchExplanation = evt.educationalExplanation?.toLowerCase().includes(query) ?? false;
          const matchCategory = evt.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDetails && !matchTrigger && !matchExplanation && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortDirection === 'desc') {
          return b.timestampHours - a.timestampHours;
        }
        return a.timestampHours - b.timestampHours;
      });
  }, [allEvents, selectedSystemFilter, selectedSeverityFilter, searchQuery, sortDirection]);

  const getSeverityBadgeVariant = (sev: NotificationCategory): 'critical' | 'warning' | 'nominal' | 'telemetry' => {
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

  const getSeverityIcon = (sev: NotificationCategory) => {
    switch (sev) {
      case 'CRITICAL':
        return <Flame className="h-4 w-4 text-critical-red animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-warning-amber" />;
      case 'NOMINAL':
        return <CheckCircle2 className="h-4 w-4 text-nominal-green" />;
      default:
        return <Info className="h-4 w-4 text-signal-cyan" />;
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-panel-blue/60 pb-2">
        <Button
          variant={activeSubTab === 'events' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveSubTab('events')}
          className="gap-1.5 text-xs"
        >
          <History className="h-3.5 w-3.5" />
          <span>FLIGHT EVENTS & ALERTS ({allEvents.length})</span>
        </Button>
        <Button
          variant={activeSubTab === 'actions' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveSubTab('actions')}
          className="gap-1.5 text-xs"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>COMMAND DIRECTIVES ({userActions.length})</span>
        </Button>
        <Button
          variant={activeSubTab === 'telemetry' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveSubTab('telemetry')}
          className="gap-1.5 text-xs"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>RESOURCE SNAPSHOTS ({missionState.records.resourceHistory.length})</span>
        </Button>
      </div>

      {/* Sub Tab 1: Chronological Event Log */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          {/* Filter & Search Console */}
          <Card withBracket className="border-panel-blue/60 bg-space-surface/90 text-xs">
            <CardContent className="p-4 space-y-3">
              {/* Row 1: Search Bar & Sort Order */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-offwhite/40" />
                  <input
                    type="text"
                    placeholder="Search events by title, telemetry, trigger, or NASA flight rule..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-space-dark border border-panel-blue/50 text-offwhite text-xs pl-8 pr-3 py-1.5 placeholder:text-offwhite/30 focus:outline-none focus:border-signal-cyan"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-offwhite/50 hover:text-offwhite text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="gap-1.5 text-xs text-offwhite/70 hover:text-offwhite border border-panel-blue/40 shrink-0"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span>SORT: {sortDirection === 'desc' ? 'NEWEST FIRST (DESC)' : 'OLDEST FIRST (ASC)'}</span>
                </Button>
              </div>

              {/* Row 2: System Filters (Crew, Habitat, Emergency, Comms, Mission) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-panel-blue/30">
                <span className="text-[10px] text-offwhite/50 uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Filter className="h-3 w-3 text-signal-cyan" />
                  SYSTEM FILTER:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'CREW', 'HABITAT', 'EMERGENCY', 'COMMUNICATIONS', 'MISSION'] as const).map(
                    (sys) => {
                      const count = systemCounts[sys] ?? 0;
                      const isSelected = selectedSystemFilter === sys;

                      return (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => setSelectedSystemFilter(sys)}
                          className={`px-2 py-0.5 text-[10px] font-bold tracking-wider transition-colors border ${
                            isSelected
                              ? 'bg-signal-cyan text-space-dark border-signal-cyan'
                              : 'bg-space-dark/60 text-offwhite/70 border-panel-blue/40 hover:border-panel-blue hover:text-offwhite'
                          }`}
                        >
                          {sys} ({count})
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Row 3: Notification Categories / Severity Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-panel-blue/20">
                <span className="text-[10px] text-offwhite/50 uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <AlertTriangle className="h-3 w-3 text-warning-amber" />
                  CATEGORY SEVERITY:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'CRITICAL', 'WARNING', 'NOMINAL', 'INFORMATIONAL'] as const).map((sev) => {
                    const count = severityCounts[sev] ?? 0;
                    const isSelected = selectedSeverityFilter === sev;

                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSelectedSeverityFilter(sev)}
                        className={`px-2 py-0.5 text-[10px] font-bold tracking-wider transition-colors border ${
                          isSelected
                            ? sev === 'CRITICAL'
                              ? 'bg-critical-red text-white border-critical-red'
                              : sev === 'WARNING'
                              ? 'bg-warning-amber text-space-dark border-warning-amber'
                              : sev === 'NOMINAL'
                              ? 'bg-nominal-green text-space-dark border-nominal-green'
                              : 'bg-signal-cyan text-space-dark border-signal-cyan'
                            : 'bg-space-dark/60 text-offwhite/70 border-panel-blue/40 hover:border-panel-blue hover:text-offwhite'
                        }`}
                      >
                        {sev} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Log Stream */}
          <Card withBracket>
            <CardHeader className="pb-3 border-b border-panel-blue/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
                <History className="h-4 w-4 text-signal-cyan" />
                CHRONOLOGICAL EVENT LOG ({filteredEvents.length} MATCHING)
              </CardTitle>
              <span className="text-[10px] text-offwhite/50">
                Click any event for deep black-box telemetry inspection
              </span>
            </CardHeader>

            <CardContent className="space-y-3 font-mono text-xs max-h-[600px] overflow-y-auto pr-2 pt-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-offwhite/40 space-y-2">
                  <History className="h-8 w-8 text-offwhite/20 mx-auto" />
                  <p>No mission events match the selected filters.</p>
                  <p className="text-[10px]">Adjust your filter selection or clear search query.</p>
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const normSev = normalizeSeverity(evt.severity);
                  const sys = evt.affectedSystem ?? mapCategoryToAffectedSystem(evt.category);
                  const simTime =
                    evt.simulationTime ||
                    formatSimulationTime(evt.timestampHours, missionState.mission.missionDay);

                  return (
                    <div
                      key={evt.eventId}
                      onClick={() => setInspectedEvent(evt)}
                      className={`p-3 border transition-all cursor-pointer text-left space-y-2 relative ${
                        normSev === 'CRITICAL'
                          ? 'border-critical-red/50 bg-critical-red/10 hover:border-critical-red'
                          : normSev === 'WARNING'
                          ? 'border-warning-amber/40 bg-warning-amber/10 hover:border-warning-amber'
                          : 'border-panel-blue/40 bg-space-surface/50 hover:border-signal-cyan'
                      }`}
                    >
                      {/* Header: Timestamp, Severity, System, Type */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-signal-cyan font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3 text-warning-amber" />
                            {simTime}
                          </span>
                          <Badge variant={getSeverityBadgeVariant(normSev)} className="text-[9px] px-1.5 py-0">
                            {normSev}
                          </Badge>
                          <Badge variant="telemetry" className="text-[9px] px-1.5 py-0">
                            {sys}
                          </Badge>
                          {evt.eventType && (
                            <Badge variant="neutral" className="text-[9px] px-1.5 py-0 text-offwhite/60">
                              {evt.eventType}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-offwhite/40">{evt.eventId}</span>
                      </div>

                      {/* Title & Details */}
                      <div className="space-y-0.5">
                        <div className="font-bold text-offwhite text-xs flex items-center gap-1.5">
                          {getSeverityIcon(normSev)}
                          <span>{evt.title}</span>
                        </div>
                        <p className="text-[11px] text-offwhite/80 leading-snug">{evt.details}</p>
                      </div>

                      {/* Before / After State Transition Pill */}
                      {(evt.previousValue !== null && evt.previousValue !== undefined) ||
                      (evt.newValue !== null && evt.newValue !== undefined) ? (
                        <div className="flex items-center gap-2 text-[10px] bg-space-dark/80 px-2.5 py-1 border border-panel-blue/30 w-fit">
                          <span className="text-offwhite/50">Transition:</span>
                          <span className="text-offwhite/80 font-bold">{evt.previousValue ?? 'Initial'}</span>
                          <ArrowRight className="h-3 w-3 text-signal-cyan" />
                          <span className="text-signal-cyan font-bold">{evt.newValue ?? 'Updated'}</span>
                        </div>
                      ) : null}

                      {/* Trigger & Related User Action */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-offwhite/60 pt-1 border-t border-panel-blue/20">
                        {evt.trigger && (
                          <div>
                            <span className="text-offwhite/40">Trigger: </span>
                            <span>{evt.trigger}</span>
                          </div>
                        )}
                        {evt.relatedUserAction && (
                          <div>
                            <span className="text-offwhite/40">Related Action: </span>
                            <span className="text-signal-cyan font-bold">{evt.relatedUserAction}</span>
                          </div>
                        )}
                        <div className="ml-auto text-signal-cyan font-bold flex items-center gap-0.5">
                          INSPECT DETAILS <ArrowRight className="h-2.5 w-2.5" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sub Tab 2: User Action / Command Log */}
      {activeSubTab === 'actions' && (
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Radio className="h-4 w-4 text-signal-cyan" />
              COMMAND DIRECTIVES & DISPATCH AUDIT LOG
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs max-h-[550px] overflow-y-auto pr-2">
            {userActions.length === 0 ? (
              <div className="text-center py-8 text-offwhite/50">
                No commander directives dispatched yet. Execute commands from LIVE, OPERATE, or RESPOND consoles.
              </div>
            ) : (
              userActions.map((action) => (
                <div
                  key={action.actionId}
                  className="flex gap-4 items-center justify-between border-l-2 border-signal-cyan/60 pl-4 py-2.5 bg-control-navy border border-panel-blue/40"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-signal-cyan">{action.command}</span>
                      <span className="text-[10px] text-offwhite/50">[{action.subsystem}]</span>
                    </div>
                    <div className="text-[11px] text-offwhite/60">
                      Initiated by: {action.initiatedBy} ·{' '}
                      {formatSimulationTime(action.timestampHours, missionState.mission.missionDay)}
                    </div>
                  </div>
                  <Badge variant={action.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                    {action.outcome}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Sub Tab 3: Resource History Snapshots */}
      {activeSubTab === 'telemetry' && (
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Clock className="h-4 w-4 text-signal-cyan" />
              PERIODIC RESOURCE TELEMETRY SNAPSHOTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-xs max-h-[550px] overflow-y-auto pr-2">
            {missionState.records.resourceHistory.length === 0 ? (
              <div className="text-center py-8 text-offwhite/50">
                No periodic snapshots captured yet. Advance time to record.
              </div>
            ) : (
              missionState.records.resourceHistory
                .slice(-25)
                .reverse()
                .map((snap, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-2 p-2 bg-space-surface border border-panel-blue/30 text-center text-xs"
                  >
                    <div className="text-left font-bold text-signal-cyan">
                      {formatSimulationTime(snap.timestampHours, missionState.mission.missionDay)}
                    </div>
                    <div>
                      O₂: <span className="font-bold text-offwhite">{snap.oxygenKg.toFixed(1)} kg</span>
                    </div>
                    <div>
                      H₂O: <span className="font-bold text-offwhite">{snap.waterLiters.toFixed(1)} L</span>
                    </div>
                    <div>
                      BATT: <span className="font-bold text-offwhite">{snap.batteryKwh.toFixed(1)} kWh</span>
                    </div>
                    <div>
                      PWR: <span className="font-bold text-offwhite">{snap.powerKw.toFixed(1)} kW</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      {inspectedEvent && (
        <EventDetailsModal
          event={inspectedEvent}
          onClose={() => setInspectedEvent(null)}
          onAcknowledge={(id) => {
            acknowledgeEvent(id);
            setInspectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
