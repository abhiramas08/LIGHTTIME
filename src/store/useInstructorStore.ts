/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * AI Mission Instructor – Zustand State Store
 *
 * Manages the slide-over AI Instructor drawer, conversation history,
 * mode tabs (Chat, Explain Event, Explain Warning, Post-Mission Feedback),
 * and interactions with the read-only AI Instructor Engine.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  InstructorMessage,
  InstructorEngineStatus,
  TargetWarningInfo,
} from '@/services/ai/aiInstructorTypes';
import { aiMissionInstructor } from '@/services/ai/aiInstructorEngine';
import { MissionEventRecord } from '@/simulation/models/missionState';
import { useMissionStore } from './useMissionStore';

export type InstructorActiveTab = 'CHAT' | 'EVENTS' | 'WARNINGS' | 'DEBRIEF';

interface InstructorStoreState {
  isOpen: boolean;
  isLoading: boolean;
  activeTab: InstructorActiveTab;
  messages: InstructorMessage[];
  status: InstructorEngineStatus;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setActiveTab: (tab: InstructorActiveTab) => void;
  askInstructor: (question: string) => Promise<void>;
  explainEvent: (event: MissionEventRecord) => Promise<void>;
  explainWarning: (warning: TargetWarningInfo) => Promise<void>;
  requestDebriefFeedback: () => Promise<void>;
  clearHistory: () => void;
  refreshStatus: () => void;
}

const DEFAULT_WELCOME_MESSAGE: InstructorMessage = {
  id: 'msg-welcome-001',
  sender: 'INSTRUCTOR',
  timestamp: new Date().toISOString(),
  mode: 'ASK_INSTRUCTOR',
  content: `Welcome, Flight Controller. I am your AI Mission Instructor, your educational flight director mentor for LIGHTTIME.

I provide read-only pedagogical explanations of closed-loop life support, crew neurobehavioral health, communication latency, and emergency trade-offs.

You can:
• Ask questions about your current mission state.
• Explain any event from the telemetry log.
• Explain active cautions and warnings.
• Request post-mission learning feedback.`,
  suggestedFollowUps: [
    'Why are my resources decreasing?',
    'Why is a habitat system failing?',
    'How does crew fatigue influence performance?',
    'Why did my emergency response succeed or fail?',
    'How do communication conditions affect decisions?',
  ],
  educationalTakeaways: [
    'Strict Read-Only Guarantee: I explain physics and human factors, but will never modify your simulation state.',
    'Speed-of-Light Invariance: Radio signals take 1.28s each way (2.56s round-trip). Houston cannot pilot the habitat in real time.',
  ],
  relatedFlightRules: ['FR-ECLSS-01', 'FR-COMMS-11', 'FR-CREW-02'],
};

export const useInstructorStore = create<InstructorStoreState>()(
  persist(
    (set) => ({
      isOpen: false,
      isLoading: false,
      activeTab: 'CHAT',
      messages: [DEFAULT_WELCOME_MESSAGE],
      status: aiMissionInstructor.getStatus(),

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setActiveTab: (tab) => set({ activeTab: tab }),

      refreshStatus: () => set({ status: aiMissionInstructor.getStatus() }),

      // 1. Ask the Mission Instructor (Student Q&A)
      askInstructor: async (question: string) => {
        if (!question.trim()) return;

        const userMsg: InstructorMessage = {
          id: `msg-user-${Date.now()}`,
          sender: 'USER',
          timestamp: new Date().toISOString(),
          content: question.trim(),
          mode: 'ASK_INSTRUCTOR',
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          isOpen: true,
          activeTab: 'CHAT',
        }));

        try {
          const missionStore = useMissionStore.getState();
          const currentState = missionStore.missionState;
          const events = missionStore.missionState?.records?.eventHistory || [];

          const response = await aiMissionInstructor.askInstructor(question, currentState, events);

          const instructorMsg: InstructorMessage = {
            id: `msg-inst-${Date.now()}`,
            sender: 'INSTRUCTOR',
            timestamp: new Date().toISOString(),
            content: response.answer,
            educationalTakeaways: response.educationalTakeaways,
            relatedFlightRules: response.relatedFlightRules,
            suggestedFollowUps: response.suggestedFollowUps,
            scientificReferencesUsed: response.scientificReferencesUsed,
            educationalAssumptionsUsed: response.educationalAssumptionsUsed,
            epistemologicalLimitations: response.epistemologicalLimitations,
            mode: 'ASK_INSTRUCTOR',
          };

          set((state) => ({
            messages: [...state.messages, instructorMsg],
            isLoading: false,
            status: aiMissionInstructor.getStatus(),
          }));
        } catch (err) {
          console.error('AI Mission Instructor inquiry failed:', err);
          const errorMsg: InstructorMessage = {
            id: `msg-err-${Date.now()}`,
            sender: 'INSTRUCTOR',
            timestamp: new Date().toISOString(),
            content:
              'Notice: AI service connection interrupted. The local educational knowledge engine remains active. Please try your inquiry again.',
          };
          set((state) => ({
            messages: [...state.messages, errorMsg],
            isLoading: false,
            status: aiMissionInstructor.getStatus(),
          }));
        }
      },

      // 2. Explain This Event
      explainEvent: async (event: MissionEventRecord) => {
        const userMsg: InstructorMessage = {
          id: `msg-user-evt-${Date.now()}`,
          sender: 'USER',
          timestamp: new Date().toISOString(),
          content: `Explain Event: "${event.title}" (${event.severity})`,
          mode: 'EXPLAIN_EVENT',
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          isOpen: true,
          activeTab: 'EVENTS',
        }));

        try {
          const missionStore = useMissionStore.getState();
          const currentState = missionStore.missionState;
          const events = missionStore.missionState?.records?.eventHistory || [];

          const response = await aiMissionInstructor.explainEvent(event, currentState, events);

          const instructorMsg: InstructorMessage = {
            id: `msg-inst-evt-${Date.now()}`,
            sender: 'INSTRUCTOR',
            timestamp: new Date().toISOString(),
            content: response.answer,
            educationalTakeaways: response.educationalTakeaways,
            relatedFlightRules: response.relatedFlightRules,
            suggestedFollowUps: response.suggestedFollowUps,
            scientificReferencesUsed: response.scientificReferencesUsed,
            educationalAssumptionsUsed: response.educationalAssumptionsUsed,
            epistemologicalLimitations: response.epistemologicalLimitations,
            mode: 'EXPLAIN_EVENT',
          };

          set((state) => ({
            messages: [...state.messages, instructorMsg],
            isLoading: false,
            status: aiMissionInstructor.getStatus(),
          }));
        } catch (err) {
          console.error('Explain event failed:', err);
          set(() => ({ isLoading: false }));
        }
      },

      // 3. Explain This Warning
      explainWarning: async (warning: TargetWarningInfo) => {
        const userMsg: InstructorMessage = {
          id: `msg-user-warn-${Date.now()}`,
          sender: 'USER',
          timestamp: new Date().toISOString(),
          content: `Explain Warning: "${warning.headline}" [${warning.severity}] on ${warning.subsystem}`,
          mode: 'EXPLAIN_WARNING',
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          isOpen: true,
          activeTab: 'WARNINGS',
        }));

        try {
          const missionStore = useMissionStore.getState();
          const currentState = missionStore.missionState;
          const events = missionStore.missionState?.records?.eventHistory || [];

          const response = await aiMissionInstructor.explainWarning(warning, currentState, events);

          const instructorMsg: InstructorMessage = {
            id: `msg-inst-warn-${Date.now()}`,
            sender: 'INSTRUCTOR',
            timestamp: new Date().toISOString(),
            content: response.answer,
            educationalTakeaways: response.educationalTakeaways,
            relatedFlightRules: response.relatedFlightRules,
            suggestedFollowUps: response.suggestedFollowUps,
            scientificReferencesUsed: response.scientificReferencesUsed,
            educationalAssumptionsUsed: response.educationalAssumptionsUsed,
            epistemologicalLimitations: response.epistemologicalLimitations,
            mode: 'EXPLAIN_WARNING',
          };

          set((state) => ({
            messages: [...state.messages, instructorMsg],
            isLoading: false,
            status: aiMissionInstructor.getStatus(),
          }));
        } catch (err) {
          console.error('Explain warning failed:', err);
          set(() => ({ isLoading: false }));
        }
      },

      // 4. Post-Mission Learning Feedback
      requestDebriefFeedback: async () => {
        const userMsg: InstructorMessage = {
          id: `msg-user-debrief-${Date.now()}`,
          sender: 'USER',
          timestamp: new Date().toISOString(),
          content: 'Request Comprehensive Post-Mission Learning Feedback and Decision Critique',
          mode: 'POST_MISSION_FEEDBACK',
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isLoading: true,
          isOpen: true,
          activeTab: 'DEBRIEF',
        }));

        try {
          const missionStore = useMissionStore.getState();
          const currentState = missionStore.missionState;
          const events = missionStore.missionState?.records?.eventHistory || [];

          const response = await aiMissionInstructor.generatePostMissionDebriefFeedback(currentState, events);

          const instructorMsg: InstructorMessage = {
            id: `msg-inst-debrief-${Date.now()}`,
            sender: 'INSTRUCTOR',
            timestamp: new Date().toISOString(),
            content: response.answer,
            educationalTakeaways: response.educationalTakeaways,
            relatedFlightRules: response.relatedFlightRules,
            suggestedFollowUps: response.suggestedFollowUps,
            scientificReferencesUsed: response.scientificReferencesUsed,
            educationalAssumptionsUsed: response.educationalAssumptionsUsed,
            epistemologicalLimitations: response.epistemologicalLimitations,
            mode: 'POST_MISSION_FEEDBACK',
          };

          set((state) => ({
            messages: [...state.messages, instructorMsg],
            isLoading: false,
            status: aiMissionInstructor.getStatus(),
          }));
        } catch (err) {
          console.error('Debrief feedback request failed:', err);
          set(() => ({ isLoading: false }));
        }
      },

      clearHistory: () =>
        set({
          messages: [
            {
              ...DEFAULT_WELCOME_MESSAGE,
              id: `msg-welcome-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
    }),
    {
      name: 'lighttime_ai_instructor_history',
      partialize: (state) => ({ messages: state.messages.slice(-25) }),
    }
  )
);
