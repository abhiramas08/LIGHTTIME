import React, { useState, useRef, useEffect } from 'react';
import { useInstructorStore, InstructorActiveTab } from '@/store/useInstructorStore';
import { useMissionStore } from '@/store/useMissionStore';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Zap,
  Activity,
  Heart,
  HelpCircle,
  Cpu,
  AlertTriangle,
  FileText,
  Bookmark,
  Scale,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { normalizeSeverity } from '@/simulation/models/eventTypes';
import { TargetWarningInfo } from '@/services/ai/aiInstructorTypes';

export const AiInstructorDrawer: React.FC = () => {
  const {
    isOpen,
    setOpen,
    activeTab,
    setActiveTab,
    messages,
    isLoading,
    status,
    askInstructor,
    explainEvent,
    explainWarning,
    requestDebriefFeedback,
    clearHistory,
  } = useInstructorStore();

  const { missionState, missionEventLog } = useMissionStore();

  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuestion;
    if (!q.trim() || isLoading) return;
    setInputQuestion('');
    await askInstructor(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Compile active warnings from telemetry and event logs
  const events = missionEventLog.length > 0 ? missionEventLog : missionState.records.eventHistory;
  const recentEvents = events.slice(-8);

  const activeWarnings: TargetWarningInfo[] = [];

  // 1. Oxygen reserve check
  if (missionState.habitatResources.oxygenInventoryKg < 150) {
    activeWarnings.push({
      warningId: 'WARN-O2-LOW',
      subsystem: 'ECLSS Atmosphere',
      severity: missionState.habitatResources.oxygenInventoryKg < 80 ? 'CRITICAL' : 'WARNING',
      headline: 'Low Cryogenic Oxygen Storage',
      currentValue: `${missionState.habitatResources.oxygenInventoryKg.toFixed(1)} kg`,
      thresholdValue: '150.0 kg',
      details: 'Cryogenic oxygen inventory has dropped below safe operational reserves.',
    });
  }

  // 2. Battery state of charge check
  if (missionState.habitatResources.batteryStateOfChargePercent < 40) {
    activeWarnings.push({
      warningId: 'WARN-EPS-BATT',
      subsystem: 'Electrical Power (EPS)',
      severity: missionState.habitatResources.batteryStateOfChargePercent < 20 ? 'CRITICAL' : 'WARNING',
      headline: 'Battery Bank Depletion Caution',
      currentValue: `${missionState.habitatResources.batteryStateOfChargePercent.toFixed(1)}%`,
      thresholdValue: '40.0%',
      details: 'Habitat battery storage is rapidly discharging under baseline loads.',
    });
  }

  // 3. Active Emergency Scenario
  if (missionState.emergency?.activeScenario) {
    activeWarnings.push({
      warningId: 'WARN-EMERG-ACTIVE',
      subsystem: 'Emergency Operations',
      severity: missionState.emergency.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      headline: `Active Emergency: ${missionState.emergency.activeScenario}`,
      currentValue: missionState.emergency.severity,
      thresholdValue: 'NONE',
      details: `Anomalous contingency condition declared. Response window: ${
        missionState.emergency.remainingResponseTimeSeconds != null
          ? `${(missionState.emergency.remainingResponseTimeSeconds / 60).toFixed(0)} min`
          : 'Indefinite'
      }.`,
    });
  }

  // 4. Critical / Warning events from log
  events.slice(-5).forEach((e) => {
    const sev = normalizeSeverity(e.severity);
    if (sev === 'CRITICAL' || sev === 'WARNING') {
      if (!activeWarnings.some((w) => w.headline === e.title)) {
        activeWarnings.push({
          warningId: e.eventId,
          subsystem: e.affectedSystem || e.category,
          severity: sev === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          headline: e.title,
          currentValue: e.newValue || 'Fault Tripped',
          thresholdValue: 'Nominal',
          details: e.details,
        });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-space-black/60 backdrop-blur-sm flex justify-end">
      {/* Background click overlay */}
      <div className="flex-1" onClick={() => setOpen(false)} />

      {/* Slide-over Drawer Frame */}
      <div className="w-full max-w-xl bg-space-darker border-l border-panel-blue/70 shadow-2xl flex flex-col h-full font-mono text-xs select-none">
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-panel-blue/60 bg-control-navy/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-space-deep border border-telemetry-cyan/60 text-telemetry-cyan">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-offwhite uppercase tracking-wider">
                  AI Mission Instructor
                </span>
                <Badge variant="telemetry" className="text-[9px]">
                  Public Flight Mentor
                </Badge>
              </div>
              <div className="text-[10px] text-offwhite/60">
                Educational Flight Director • Read-Only Advisory
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={clearHistory}
              title="Clear chat history"
              className="p-1.5 text-offwhite/50 hover:text-offwhite hover:bg-panel-blue/30 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 text-offwhite/50 hover:text-offwhite hover:bg-panel-blue/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Engine Status & Safeguard Banner */}
        <div className="px-3.5 py-1.5 bg-space-deep/90 border-b border-panel-blue/40 flex items-center justify-between text-[10px] flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-nominal-green animate-ping" />
            <span className="text-offwhite/70">
              {status.mode === 'SERVER_AI_PROXY' ? 'Cloud AI Proxy Connected' : 'Autonomous Local Knowledge Engine'}
            </span>
          </div>

          <Badge variant="nominal" className="flex items-center gap-1 text-[9px]">
            <ShieldCheck className="h-2.5 w-2.5" />
            Strictly Read-Only • No State Mutation
          </Badge>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center border-b border-panel-blue/50 bg-space-dark text-[10px] font-bold">
          {(
            [
              { id: 'CHAT', label: 'Ask Instructor', icon: <HelpCircle className="h-3 w-3" /> },
              { id: 'EVENTS', label: 'Explain Event', icon: <FileText className="h-3 w-3" /> },
              { id: 'WARNINGS', label: 'Explain Warning', icon: <AlertTriangle className="h-3 w-3" /> },
              { id: 'DEBRIEF', label: 'Debrief Feedback', icon: <BookOpen className="h-3 w-3" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as InstructorActiveTab)}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-colors border-r last:border-r-0 border-panel-blue/30 ${
                activeTab === tab.id
                  ? 'bg-telemetry-cyan/20 text-telemetry-cyan border-b-2 border-b-telemetry-cyan font-bold'
                  : 'text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab-Specific Quick Action Strip */}
        {activeTab === 'CHAT' && (
          <div className="p-2 bg-control-navy/40 border-b border-panel-blue/30 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => handleSend('Why are my habitat resources decreasing?')}
              className="px-2 py-1 text-[10px] bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-panel-blue/50 hover:border-telemetry-cyan text-offwhite/80 hover:text-telemetry-cyan transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Zap className="h-3 w-3 text-warning-amber" />
              <span>Air & Oxygen (Resource Decrease)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('Why is a habitat system failing?')}
              className="px-2 py-1 text-[10px] bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-panel-blue/50 hover:border-telemetry-cyan text-offwhite/80 hover:text-telemetry-cyan transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Cpu className="h-3 w-3 text-telemetry-cyan" />
              <span>Why Systems Fail</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('How does crew fatigue influence performance?')}
              className="px-2 py-1 text-[10px] bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-panel-blue/50 hover:border-telemetry-cyan text-offwhite/80 hover:text-telemetry-cyan transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Heart className="h-3 w-3 text-nominal-green" />
              <span>Crew Fatigue Impact</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('Why does an emergency response succeed or fail?')}
              className="px-2 py-1 text-[10px] bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-panel-blue/50 hover:border-telemetry-cyan text-offwhite/80 hover:text-telemetry-cyan transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Activity className="h-3 w-3 text-critical-red" />
              <span>Emergency Outcomes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('How do communication conditions affect decisions?')}
              className="px-2 py-1 text-[10px] bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-panel-blue/50 hover:border-telemetry-cyan text-offwhite/80 hover:text-telemetry-cyan transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-telemetry-cyan" />
              <span>Comms & Latency</span>
            </button>
          </div>
        )}

        {/* Tab View: Explain Event Selection List */}
        {activeTab === 'EVENTS' && (
          <div className="p-3 bg-space-deep/80 border-b border-panel-blue/40 space-y-2 max-h-48 overflow-y-auto shrink-0">
            <div className="text-[10px] text-offwhite/60 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Select an Event from the Black-Box Log to Explain:</span>
              <span className="text-telemetry-cyan">{recentEvents.length} Recent Events</span>
            </div>
            {recentEvents.length === 0 ? (
              <p className="text-[10px] text-offwhite/40 italic">No events recorded yet in active mission.</p>
            ) : (
              <div className="space-y-1.5">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-2 border border-panel-blue/30 bg-space-dark/80 hover:border-telemetry-cyan transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[9px] mb-0.5">
                        <Badge variant="neutral" className="px-1 py-0 text-[8px]">
                          {evt.severity}
                        </Badge>
                        <span className="text-telemetry-cyan font-bold">{evt.affectedSystem || evt.category}</span>
                        <span className="text-offwhite/40">MET {evt.timestampHours.toFixed(1)}h</span>
                      </div>
                      <div className="font-bold text-offwhite truncate text-[11px]">{evt.title}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => explainEvent(evt)}
                      className="text-[10px] text-telemetry-cyan hover:bg-telemetry-cyan/15 shrink-0 py-1 px-2"
                    >
                      EXPLAIN
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab View: Explain Warning Selection List */}
        {activeTab === 'WARNINGS' && (
          <div className="p-3 bg-space-deep/80 border-b border-panel-blue/40 space-y-2 max-h-48 overflow-y-auto shrink-0">
            <div className="text-[10px] text-offwhite/60 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Active Cautions & Warnings:</span>
              <span className="text-warning-amber font-bold">{activeWarnings.length} Active</span>
            </div>
            {activeWarnings.length === 0 ? (
              <div className="p-3 text-center border border-nominal-green/30 bg-nominal-green/5 text-nominal-green text-[11px]">
                ✓ All habitat systems operating nominal. No active cautions or warnings declared.
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeWarnings.map((warn) => (
                  <div
                    key={warn.warningId}
                    className={`p-2 border transition-colors flex items-center justify-between gap-2 ${
                      warn.severity === 'CRITICAL'
                        ? 'border-critical-red/60 bg-critical-red/10'
                        : 'border-warning-amber/50 bg-warning-amber/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[9px] mb-0.5">
                        <Badge
                          variant={warn.severity === 'CRITICAL' ? 'critical' : 'warning'}
                          className="px-1 py-0 text-[8px]"
                        >
                          {warn.severity}
                        </Badge>
                        <span className="text-offwhite/70 font-bold">{warn.subsystem}</span>
                        {warn.currentValue && (
                          <span className="text-telemetry-cyan">Val: {warn.currentValue}</span>
                        )}
                      </div>
                      <div className="font-bold text-offwhite truncate text-[11px] flex items-center gap-1">
                        {warn.severity === 'CRITICAL' && (
                          <Flame className="h-3 w-3 text-critical-red animate-pulse shrink-0" />
                        )}
                        <span>{warn.headline}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => explainWarning(warn)}
                      className="text-[10px] shrink-0 py-1 px-2"
                    >
                      EXPLAIN
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab View: Debrief Trigger Banner */}
        {activeTab === 'DEBRIEF' && (
          <div className="p-3 bg-control-navy/60 border-b border-panel-blue/40 flex items-center justify-between gap-3 shrink-0">
            <div>
              <div className="font-bold text-offwhite text-xs">POST-MISSION LEARNING CRITIQUE</div>
              <div className="text-[10px] text-offwhite/60">
                Generate in-depth pedagogical critique based on actual flight telemetry.
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={requestDebriefFeedback}
              className="text-xs font-bold gap-1.5 shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5" />
              GENERATE DEBRIEF
            </Button>
          </div>
        )}

        {/* Message History Timeline */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-space-deep/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[94%] p-3.5 rounded-none font-mono ${
                  msg.sender === 'USER'
                    ? 'bg-telemetry-cyan/15 border border-telemetry-cyan/50 text-offwhite'
                    : 'bg-control-navy border border-panel-blue/60 text-offwhite/90 shadow-md'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-panel-blue/30 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tracking-wider text-telemetry-cyan">
                      {msg.sender === 'USER' ? 'FLIGHT CONTROLLER' : 'AI MISSION INSTRUCTOR'}
                    </span>
                    {msg.mode && (
                      <Badge variant="neutral" className="text-[8px] py-0">
                        {msg.mode.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <span className="text-offwhite/40 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                {/* Content with linebreaks preserved */}
                <div className="text-xs font-sans whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>

                {/* Educational Takeaways Box if present */}
                {msg.educationalTakeaways && msg.educationalTakeaways.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-panel-blue/30 space-y-1.5">
                    <span className="text-[10px] text-telemetry-cyan font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="h-3 w-3 text-telemetry-cyan" />
                      Key Educational Takeaways:
                    </span>
                    {msg.educationalTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] font-sans text-offwhite/85 bg-space-deep/60 p-2 border-l-2 border-telemetry-cyan"
                      >
                        {takeaway}
                      </div>
                    ))}
                  </div>
                )}

                {/* Relevant Scientific References Cited */}
                {msg.scientificReferencesUsed && msg.scientificReferencesUsed.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-panel-blue/30 space-y-1">
                    <span className="text-[9px] text-offwhite/60 uppercase tracking-wider flex items-center gap-1">
                      <Scale className="h-2.5 w-2.5 text-nominal-green" />
                      Scientific Literature & Data Ingestion:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.scientificReferencesUsed.map((ref, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 bg-nominal-green/10 text-nominal-green border border-nominal-green/30"
                          title={`Organization: ${ref.organization} | Nature: ${ref.nature}`}
                        >
                          {ref.citation || ref.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documented Educational Assumptions Cited */}
                {msg.educationalAssumptionsUsed && msg.educationalAssumptionsUsed.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-panel-blue/20 space-y-1">
                    <span className="text-[9px] text-offwhite/60 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-2.5 w-2.5 text-warning-amber" />
                      Documented Educational Assumptions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.educationalAssumptionsUsed.map((asm, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 bg-warning-amber/10 text-warning-amber border border-warning-amber/30"
                          title={`${asm.name}: ${asm.valueOrFormula} (${asm.explanation})`}
                        >
                          {asm.id}: {asm.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Epistemological Limitations Notice */}
                {msg.epistemologicalLimitations && (
                  <div className="mt-2.5 p-2 bg-space-deep/80 border border-panel-blue/40 text-[10px] text-offwhite/70 space-y-0.5">
                    <div className="text-warning-amber font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning-amber" />
                      Epistemological Limitation & Model Distinction:
                    </div>
                    <p className="leading-snug">{msg.epistemologicalLimitations}</p>
                  </div>
                )}

                {/* Related Flight Rules */}
                {msg.relatedFlightRules && msg.relatedFlightRules.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-offwhite/50 uppercase">Flight Rules:</span>
                    {msg.relatedFlightRules.map((rule, idx) => (
                      <Badge key={idx} variant="neutral" className="text-[8px] py-0">
                        {rule}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-panel-blue/30 space-y-1">
                    <span className="text-[9px] text-offwhite/50 uppercase tracking-wider block">
                      Suggested Follow-Up Inquiries:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="text-left text-[10px] text-telemetry-cyan hover:text-offwhite hover:bg-panel-blue/20 p-1 border border-panel-blue/40 transition-colors flex items-center gap-1"
                        >
                          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start">
              <div className="max-w-[85%] p-3 bg-control-navy border border-telemetry-cyan/50 text-telemetry-cyan font-mono text-xs flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>AI Flight Director is analyzing physical equations, telemetry, and flight rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-panel-blue/60 bg-space-darker">
          <div className="relative flex items-end gap-2">
            <textarea
              rows={2}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about life support, equipment failure, fatigue, comms, or emergency rules..."
              className="flex-1 bg-space-black border border-panel-blue/60 text-offwhite text-xs p-2.5 focus:outline-none focus:border-telemetry-cyan resize-none placeholder:text-offwhite/30"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="primary"
              aria-label="Send inquiry"
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || isLoading}
              className="h-full px-3 py-2 flex items-center justify-center shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[9px] text-offwhite/40 mt-1.5">
            <span>Press Enter to send, Shift+Enter for newline</span>
            <span>Strictly Read-Only Pedagogical Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
