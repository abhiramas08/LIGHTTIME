import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Bell, AlertTriangle, Flame } from 'lucide-react';
import { normalizeSeverity } from '@/simulation/models/eventTypes';
import { AlertsDrawer } from './AlertsDrawer';

export const GlobalAlertIndicator: React.FC = () => {
  const { missionEventLog, missionState } = useMissionStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const events = missionEventLog.length > 0 ? missionEventLog : missionState.records.eventHistory;

  // Filter alerts (warnings and criticals)
  const criticalCount = events.filter((e) => normalizeSeverity(e.severity) === 'CRITICAL').length;
  const warningCount = events.filter((e) => normalizeSeverity(e.severity) === 'WARNING').length;
  const unacknowledgedCount = events.filter(
    (e) => !e.acknowledged && (normalizeSeverity(e.severity) === 'CRITICAL' || normalizeSeverity(e.severity) === 'WARNING')
  ).length;

  const hasCritical = criticalCount > 0;
  const hasWarning = warningCount > 0;

  return (
    <>
      <button
        type="button"
        aria-label="Mission alerts indicator"
        onClick={() => setIsDrawerOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all duration-150 font-mono text-xs select-none ${
          hasCritical
            ? 'bg-critical-red/20 border-critical-red text-critical-red hover:bg-critical-red/30 animate-pulse'
            : hasWarning
            ? 'bg-warning-amber/15 border-warning-amber text-warning-amber hover:bg-warning-amber/25'
            : 'bg-control-navy border-panel-blue/60 text-nominal-green hover:border-signal-cyan hover:text-signal-cyan'
        }`}
        title={`Global Alerts (${unacknowledgedCount} unacknowledged, ${criticalCount} critical, ${warningCount} warnings)`}
      >
        {hasCritical ? (
          <Flame className="h-4 w-4 text-critical-red animate-pulse" />
        ) : hasWarning ? (
          <AlertTriangle className="h-3.5 w-3.5 text-warning-amber" />
        ) : (
          <Bell className="h-3.5 w-3.5 text-nominal-green" />
        )}

        <span className="hidden sm:inline font-bold">
          {hasCritical ? (
            <span>{criticalCount} CRITICAL</span>
          ) : hasWarning ? (
            <span>{warningCount} WARNING</span>
          ) : (
            <span>ALERTS (0)</span>
          )}
        </span>

        {unacknowledgedCount > 0 && (
          <span className="ml-0.5 px-1 py-0.2 bg-critical-red text-white text-[9px] font-bold rounded-none">
            {unacknowledgedCount}
          </span>
        )}
      </button>

      {/* Slide-out Alerts Drawer */}
      <AlertsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
