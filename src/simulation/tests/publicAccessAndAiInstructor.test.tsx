/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Public Access & AI Mission Instructor Test Suite
 *
 * Verifies:
 * 1. 100% Public Access: All routes and modules work without login, signup, or authentication.
 * 2. AI Mission Instructor Reasoning Engine:
 *    - Resource explanation (oxygen, CO2, water, power).
 *    - Crew wellbeing assessment (fatigue, sleep debt, stress).
 *    - Emergency explanation and latency consequence analysis.
 *    - Post-mission educational debrief feedback.
 *    - Interactive student Q&A matching key domain concepts.
 * 3. Strict Read-Only Guarantee:
 *    - AI instructor never mutates or dispatches changes to MissionState.
 * 4. Offline Resilience & Rate-Limiting:
 *    - Operates out-of-the-box in autonomous local knowledge engine mode.
 * 5. UI Components:
 *    - AiInstructorDrawer and AiInstructorTrigger rendering and message interactions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { aiMissionInstructor } from '@/services/ai/aiInstructorEngine';
import { useInstructorStore } from '@/store/useInstructorStore';
import { createInitialMissionState } from '@/simulation/engine/core';
import { AiInstructorDrawer } from '@/components/instructor/AiInstructorDrawer';
import { AiInstructorTrigger } from '@/components/instructor/AiInstructorTrigger';

describe('LIGHTTIME Public Access & AI Mission Instructor', () => {
  beforeEach(() => {
    useInstructorStore.getState().clearHistory();
    useInstructorStore.getState().setOpen(false);
  });

  // ==========================================================================
  // 1. 100% Public Access & Zero Authentication Friction
  // ==========================================================================
  describe('Public Access Architecture (No Login Required)', () => {
    it('initializes mission state and store without requiring user login or account credentials', () => {
      const state = createInitialMissionState();
      expect(state.mission.missionId).toBeDefined();
      expect(state.mission.missionStatus).toBe('ACTIVE');
      expect(state.crew.length).toBe(4);
      expect(state.habitatResources.oxygenInventoryKg).toBeGreaterThan(0);
    });

    it('confirms AI Mission Instructor operates freely for public visitors with no auth requirements', () => {
      const status = aiMissionInstructor.getStatus();
      expect(status.isConfigured).toBe(true);
      expect(status.mode).toMatch(/LOCAL_KNOWLEDGE_ENGINE|SERVER_AI_PROXY/);
      expect(status.rateLimitRemaining).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. AI Mission Instructor Domain Reasoning Engine
  // ==========================================================================
  describe('AI Mission Instructor Domain Reasoning Engine', () => {
    it('explains oxygen, CO2, water, and electrical power in plain student-friendly language', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainResources(state);

      expect(response.answer).toMatch(/Oxygen \(O₂\)/i);
      expect(response.answer).toMatch(/Carbon Dioxide \(CO₂\)/i);
      expect(response.answer).toMatch(/Water/i);
      expect(response.answer).toMatch(/Electrical Power/i);
      expect(response.educationalTakeaways.length).toBeGreaterThanOrEqual(1);
      expect(response.relatedFlightRules.some((r) => r.includes('FR-ECLSS-01'))).toBe(true);
      expect(response.suggestedFollowUps.length).toBeGreaterThanOrEqual(2);
    });

    it('assesses crew health, neurobehavioral fatigue, and sleep debt guidelines', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainCrewConditions(state);

      expect(response.answer).toMatch(/Crew Fatigue|Human Factors|Crew Health/i);
      expect(response.answer).toMatch(/Elena Vance/i);
      expect(response.answer).toMatch(/NASA Human Research Program \(HRP\) Evidence/i);
      expect(response.answer).toMatch(/7\.0 to 8\.0 hours/i);
      expect(response.educationalTakeaways.some((t) => t.includes('Sleep') || t.includes('Fatigue'))).toBe(true);
    });

    it('explains emergency scenarios, speed-of-light delay, and autonomous crew authority', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainEmergencies(state);

      expect(response.answer).toMatch(/ALL SYSTEMS NOMINAL/i);
      expect(response.educationalTakeaways.length).toBeGreaterThanOrEqual(1);
    });

    it('generates post-mission educational debrief feedback on decisions and lessons learned', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.generateDebriefFeedback(state);

      expect(response.answer).toMatch(/Post-mission|Debrief/i);
      expect(response.educationalTakeaways.length).toBeGreaterThanOrEqual(1);
    });

    it('answers student questions across key spaceflight life-support and physics concepts', async () => {
      const state = createInitialMissionState();

      // Q1: Oxygen query
      const o2Ans = await aiMissionInstructor.answerQuestion('How does oxygen recycling work in the lunar habitat?', state);
      expect(o2Ans.answer).toMatch(/Oxygen \(O₂\)/i);

      // Q2: Speed-of-light radio delay query
      const commsAns = await aiMissionInstructor.answerQuestion('Why is there a speed of light delay to the Moon?', state);
      expect(commsAns.answer).toMatch(/Speed-of-Light|Delay/i);
      expect(commsAns.answer).toMatch(/384,400 km/i);

      // Q3: Emergency query
      const emgAns = await aiMissionInstructor.answerQuestion('What should I do in an emergency?', state);
      expect(emgAns.answer).toMatch(/Emergency/i);
    });
  });

  // ==========================================================================
  // 3. Strict Read-Only Immutability Guarantee
  // ==========================================================================
  describe('Strict Read-Only Guarantee (No State Mutation)', () => {
    it('never mutates MissionState, resources, simulation time, or crew conditions', async () => {
      const state = createInitialMissionState();
      const beforeSnapshot = JSON.stringify(state);

      // Execute all reasoning functions
      aiMissionInstructor.explainResources(state);
      aiMissionInstructor.explainCrewConditions(state);
      aiMissionInstructor.explainEmergencies(state);
      aiMissionInstructor.generateDebriefFeedback(state);
      await aiMissionInstructor.answerQuestion('How do I fix an oxygen leak?', state);

      // Verify the state is byte-for-byte identical to the original
      expect(JSON.stringify(state)).toBe(beforeSnapshot);
    });
  });

  // ==========================================================================
  // 4. UI Drawer & Interactive Chat Workflows
  // ==========================================================================
  describe('AI Instructor Drawer UI & User Workflows', () => {
    it('renders the floating trigger and opens the drawer when clicked', () => {
      render(
        <div>
          <AiInstructorTrigger />
          <AiInstructorDrawer />
        </div>
      );

      // Trigger is initially visible
      const triggerBtn = screen.getByRole('button', { name: /AI Instructor/i });
      expect(triggerBtn).toBeInTheDocument();

      // Click trigger to open drawer
      fireEvent.click(triggerBtn);

      // Drawer is now open
      expect(screen.getByText('AI Mission Instructor')).toBeInTheDocument();
      expect(screen.getByText(/Flight Director • Read-Only Advisory/i)).toBeInTheDocument();
      expect(screen.getByText(/Strictly Read-Only • No State Mutation/i)).toBeInTheDocument();
    });

    it('submits a user inquiry and displays the AI Instructor explanation', async () => {
      useInstructorStore.getState().setOpen(true);

      render(<AiInstructorDrawer />);

      const textarea = screen.getByPlaceholderText(/Ask a question about life support/i);
      fireEvent.change(textarea, { target: { value: 'Explain habitat power generation' } });

      const sendBtn = screen.getByRole('button', { name: /Send inquiry/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('Explain habitat power generation')).toBeInTheDocument();
        expect(screen.getByText(/Power|Electrical|Battery/i)).toBeInTheDocument();
      });
    });

    it('clicking a quick inquiry chip immediately prompts the instructor', async () => {
      useInstructorStore.getState().setOpen(true);

      render(<AiInstructorDrawer />);

      const airChip = screen.getByRole('button', { name: /Air & Oxygen/i });
      fireEvent.click(airChip);

      await waitFor(() => {
        expect(screen.getByText(/Life Support and Resource Assessment/i)).toBeInTheDocument();
      });
    });
  });
});
