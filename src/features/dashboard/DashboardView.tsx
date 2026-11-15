import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { CrewStatusCard } from '@/components/mission/CrewStatusCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { TechnicalLabel } from '@/components/common/TechnicalLabel';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { Send, Users, Activity, Radio, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useInstructorStore } from '@/store/useInstructorStore';

export const DashboardView: React.FC = () => {
  const {
    crew,
    telemetry,
    commands,
    queueCommand,
    setSelectedAstronautId,
  } = useMissionStore();

  const [commandAction, setCommandAction] = useState<string>('RECYCLE_CO2_SCRUBBER');
  const [targetSubsystem, setTargetSubsystem] = useState<'ECLSS' | 'POWER_GRID' | 'EVA_CONTROL'>('ECLSS');

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    queueCommand(targetSubsystem, commandAction, { source: 'COMMANDER_CONSOLE' });
  };

  return (
    <PageContainer
      moduleCode="MOD-01"
      title="Mission Overview"
      description="Primary expedition command console. Displays astronaut complement readiness, ECLSS life support summary, and uplink transmission telemetry."
      actions={<Badge variant="nominal" pulse>TELEMETRY LINK SYNCHRONIZED</Badge>}
    >
      {/* Flight Directive / Notice Banner */}
      <Alert
        variant="info"
        title="LUNAR FLIGHT DIRECTIVE · DAY 01 INITIALIZATION"
      >
        Surface establishment complete. Astronauts are conducting initial systems activation.
        All uplink instructions incur a 1.282s propagation delay to Moon habitat and 1.282s acknowledgment return.
      </Alert>

      {/* AI Mission Instructor Briefing Card */}
      <Card withBracket className="bg-space-deep/90 border-telemetry-cyan/40">
        <CardHeader className="pb-2 border-b border-panel-blue/40 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-telemetry-cyan animate-pulse" />
            <CardTitle className="text-xs text-telemetry-cyan font-bold uppercase tracking-wider">
              AI Mission Instructor • Flight Director Mentor
            </CardTitle>
          </div>
          <Badge variant="nominal">Read-Only Advisory</Badge>
        </CardHeader>
        <CardContent className="pt-3 font-mono text-xs space-y-2">
          <p className="text-offwhite/80 font-sans text-xs">
            Flight Director Mentor: Habitat life support loops are closing nominally. Cryogenic oxygen buffer provides &gt;120 days of margin.
            Crew circadian fatigue remains in the rested band (&lt;35%). Maintaining disciplined 8.0-hour sleep cycles is your primary defense against PVT attentional lapses.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-panel-blue/30 text-[11px] flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => useInstructorStore.getState().askInstructor('Why are my habitat resources decreasing?')}
                className="text-[10px] py-0.5 px-2 text-offwhite/80 hover:text-telemetry-cyan border-panel-blue/60"
              >
                Why Resources Decrease
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  useInstructorStore.getState().setActiveTab('WARNINGS');
                  useInstructorStore.getState().setOpen(true);
                }}
                className="text-[10px] py-0.5 px-2 text-warning-amber hover:text-white border-warning-amber/40"
              >
                Explain Warnings
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => useInstructorStore.getState().toggleOpen()}
              className="text-xs flex items-center gap-1.5 text-telemetry-cyan border-telemetry-cyan/50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask the Mission Instructor</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4-Member Astronaut Crew Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-telemetry-cyan" />
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-offwhite">
              ASTRONAUT CREW STATUS · EXPEDITION COMPLEMENT
            </h2>
          </div>
          <span className="text-[11px] font-mono text-offwhite/50">
            4 / 4 CREW MEMBERS REPORTING
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {crew.map((astronaut) => (
            <CrewStatusCard
              key={astronaut.id}
              astronaut={astronaut}
              onSelect={(id) => setSelectedAstronautId(id)}
            />
          ))}
        </div>
      </section>

      {/* Core Systems Telemetry Overview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atmosphere & ECLSS Quick Readout */}
        <Card withBracket className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Activity className="h-4 w-4 text-telemetry-cyan" />
              HABITAT LIFE SUPPORT & ATMOSPHERE [ECLSS]
            </CardTitle>
            <Badge variant="nominal">NOMINAL EXPLORATION ATMOSPHERE</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TechnicalLabel
                idCode="ECLSS-P-TOT"
                label="Total Pressure"
                value={telemetry.atmosphere.totalPressureKpa}
                unit="kPa"
                status="nominal"
              />
              <TechnicalLabel
                idCode="ECLSS-O2-PP"
                label="O₂ Partial Press"
                value={telemetry.atmosphere.ppO2Kpa}
                unit="kPa"
                status="nominal"
              />
              <TechnicalLabel
                idCode="ECLSS-CO2-PP"
                label="CO₂ Partial Press"
                value={telemetry.atmosphere.ppCO2Kpa}
                unit="kPa"
                status={telemetry.atmosphere.ppCO2Kpa > 0.4 ? 'warning' : 'nominal'}
              />
              <TechnicalLabel
                idCode="ECLSS-TEMP"
                label="Cabin Temperature"
                value={telemetry.atmosphere.cabinTempCelsius}
                unit="°C"
                status="nominal"
              />
              <TechnicalLabel
                idCode="ECLSS-HUMID"
                label="Relative Humidity"
                value={`${telemetry.atmosphere.relativeHumidityPercent}%`}
                status="nominal"
              />
              <TechnicalLabel
                idCode="PWR-SOC"
                label="Battery Reserve"
                value={`${telemetry.power.batteryStateOfChargePercent}%`}
                status="nominal"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-panel-blue/40 text-[11px] font-mono text-offwhite/60">
              <span>Potable Water: {telemetry.lifeSupport.potableWaterReserveLiters} L</span>
              <span>Gray Water Recovery: {telemetry.lifeSupport.grayWaterRecycledPercent}%</span>
              <span>Solar Output: {telemetry.power.solarArrayOutputKw} kW</span>
              <span>Surface Reactor: {telemetry.power.surfaceReactorOutputKw} kW</span>
            </div>
          </CardContent>
        </Card>

        {/* Command Uplink Pipeline with Light-Time Delay */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Radio className="h-4 w-4 text-telemetry-cyan" />
              UPLINK COMMAND PIPELINE
            </CardTitle>
            <Badge variant="telemetry">1.282s DELAY</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSendCommand} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] text-offwhite/50 uppercase mb-1">
                  Target Subsystem
                </label>
                <select
                  value={targetSubsystem}
                  onChange={(e) => setTargetSubsystem(e.target.value as any)}
                  className="w-full bg-space-surface border border-panel-blue/70 p-2 text-offwhite focus:border-telemetry-cyan focus:outline-none"
                >
                  <option value="ECLSS">ECLSS (Life Support)</option>
                  <option value="POWER_GRID">Power Grid & Battery</option>
                  <option value="EVA_CONTROL">EVA Surface Team</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-offwhite/50 uppercase mb-1">
                  Command Action
                </label>
                <select
                  value={commandAction}
                  onChange={(e) => setCommandAction(e.target.value)}
                  className="w-full bg-space-surface border border-panel-blue/70 p-2 text-offwhite focus:border-telemetry-cyan focus:outline-none"
                >
                  <option value="CYCLE_CO2_SCRUBBER">Cycle CO₂ Scrubber Bed</option>
                  <option value="BOOST_CABIN_O2">Purge & Inject O₂ (0.5 kPa)</option>
                  <option value="ACTIVATE_EVA_RECALL">Advisory: Recall EVA Team</option>
                  <option value="DIVERT_SOLAR_RECHARGE">Divert Max Solar to Battery</option>
                </select>
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full gap-2">
                <Send className="h-3.5 w-3.5" />
                TRANSMIT UPLINK (1.28s)
              </Button>
            </form>

            {/* Active Commands Stream */}
            <div className="pt-2 border-t border-panel-blue/40 space-y-2">
              <span className="text-[10px] font-mono text-offwhite/40 uppercase block">
                RECENT COMMAND PACKET BUFFER
              </span>

              {commands.length === 0 ? (
                <p className="text-[11px] font-mono text-offwhite/40 italic">
                  No active commands transmitted yet.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {commands.slice(0, 5).map((cmd) => (
                    <div
                      key={cmd.id}
                      className="p-1.5 bg-space-surface border border-panel-blue/30 text-[10px] font-mono flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="text-telemetry-cyan">{cmd.subsystem}</span>: {cmd.action}
                      </div>
                      <div>
                        {cmd.status === 'TRANSMITTING_UPLINK' && (
                          <span className="text-warning-amber flex items-center gap-1">
                            <Clock className="h-3 w-3 animate-spin" />
                            UPLINK
                          </span>
                        )}
                        {cmd.status === 'RECEIVED_HABITAT' && (
                          <span className="text-telemetry-cyan">EXEC...</span>
                        )}
                        {cmd.status === 'DOWNLINKING_ACK' && (
                          <span className="text-warning-amber">DOWNLINK</span>
                        )}
                        {cmd.status === 'CONFIRMED' && (
                          <span className="text-nominal-green flex items-center gap-0.5">
                            <CheckCircle className="h-3 w-3" />
                            ACK
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
};
