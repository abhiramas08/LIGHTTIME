import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { TopNavbar } from './TopNavbar';
import { AppSidebar } from './AppSidebar';
import { SimulationControlBar } from '@/components/mission/SimulationControlBar';
import { Dialog } from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { Heart, Activity, Brain, Radiation, ShieldCheck, MapPin } from 'lucide-react';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { crew, selectedAstronautId, setSelectedAstronautId, tick, mission } = useMissionStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const selectedAstronaut = crew.find((c) => c.id === selectedAstronautId);

  // 1-second interval for simulation time stepper
  useEffect(() => {
    if (!mission.isRunning) return;

    const interval = window.setInterval(() => {
      tick(1 * mission.timeWarpFactor);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [mission.isRunning, mission.timeWarpFactor, tick]);

  return (
    <div className="flex flex-col min-h-screen bg-space-deep text-offwhite bg-technical-grid bg-grid-pattern selection:bg-telemetry-cyan/20 selection:text-telemetry-cyan">
      {/* Persistent Mission Control Top Navigation Bar */}
      <TopNavbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileMenuOpen={isMobileOpen}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
      />

      {/* Persistent Simulation Control Bar Accessible Across All Modules */}
      <SimulationControlBar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Persistent Responsive Sidebar */}
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Astronaut Telemetry Dossier Modal */}
      {selectedAstronaut && (
        <Dialog
          open={!!selectedAstronaut}
          onOpenChange={(open) => !open && setSelectedAstronautId(null)}
          title={`ASTRONAUT TELEMETRY DOSSIER · ${selectedAstronaut.callsign}`}
          description={`${selectedAstronaut.fullName} · ${selectedAstronaut.role}`}
          footer={
            <Button size="sm" variant="secondary" onClick={() => setSelectedAstronautId(null)}>
              CLOSE DOSSIER
            </Button>
          }
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-space-surface border border-panel-blue/40">
              <span className="flex items-center gap-1.5 text-offwhite/60">
                <MapPin className="h-3.5 w-3.5 text-telemetry-cyan" />
                CURRENT LOCATION:
              </span>
              <span className="text-telemetry-cyan font-bold">{selectedAstronaut.location}</span>
            </div>

            {/* Detailed Biometrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-offwhite/50 uppercase">
                  <Heart className="h-3.5 w-3.5 text-critical-red" />
                  HEART RATE & BP
                </span>
                <div className="text-base font-bold text-offwhite">
                  {selectedAstronaut.vitals.heartRateBpm} BPM
                </div>
                <div className="text-[10px] text-offwhite/60">
                  BP: {selectedAstronaut.vitals.systolicBp}/{selectedAstronaut.vitals.diastolicBp} mmHg
                </div>
              </div>

              <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-offwhite/50 uppercase">
                  <Brain className="h-3.5 w-3.5 text-telemetry-cyan" />
                  COGNITIVE READINESS
                </span>
                <div className="text-base font-bold text-nominal-green">
                  {selectedAstronaut.cognitive.readinessScore}%
                </div>
                <div className="text-[10px] text-offwhite/60">
                  Sleep Debt: {selectedAstronaut.cognitive.sleepDebtHours}h
                </div>
              </div>

              <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-offwhite/50 uppercase">
                  <Radiation className="h-3.5 w-3.5 text-warning-amber" />
                  RADIATION ACCUMULATION
                </span>
                <div className="text-base font-bold text-offwhite">
                  {selectedAstronaut.radiation.accumulatedTotalMsv.toFixed(2)} mSv
                </div>
                <div className="text-[10px] text-offwhite/60">
                  Rate: {selectedAstronaut.radiation.currentRateMsvPerHour.toFixed(3)} mSv/h
                </div>
              </div>

              <div className="p-3 bg-control-navy border border-panel-blue/40 space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] text-offwhite/50 uppercase">
                  <Activity className="h-3.5 w-3.5 text-nominal-green" />
                  METABOLICS & SPO₂
                </span>
                <div className="text-base font-bold text-offwhite">
                  {selectedAstronaut.vitals.bloodOxygenPercent}% SpO₂
                </div>
                <div className="text-[10px] text-offwhite/60">
                  Hydration: {selectedAstronaut.hydrationPercent}%
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-nominal-green/10 border border-nominal-green/30 flex items-center justify-between text-nominal-green text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                MEDICAL CERTIFICATION FOR ACTIVE DUTY:
              </span>
              <span className="font-bold">QUALIFIED (GO)</span>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
