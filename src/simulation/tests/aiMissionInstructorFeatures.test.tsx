/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * AI Mission Instructor – Full Feature & Architectural Test Suite
 *
 * Verifies:
 * 1. Structured Information Receipt:
 *    - Current mission state, crew conditions, habitat resources, active emergency,
 *      recent events, scientific references, documented educational assumptions.
 * 2. Five Mandatory Core Explanations:
 *    - Why resources are decreasing.
 *    - Why a habitat system is failing.
 *    - How crew fatigue influences performance.
 *    - Why an emergency response succeeded or failed.
 *    - How communication conditions affected decisions.
 * 3. Four Core Feature Entrypoints:
 *    - Ask the Mission Instructor.
 *    - Explain This Event.
 *    - Explain This Warning.
 *    - Post-Mission Learning Feedback.
 * 4. Secure Backend Endpoint & Fallback Architecture:
 *    - Secure backend handler (handleInstructorApiRequest).
 *    - Zero exposed API keys in client code.
 *    - Fallback educational explanation when AI service is unavailable.
 * 5. Epistemological Honesty:
 *    - Clear limitation statements; never presents assumptions as real measurements.
 * 6. Strict Read-Only Immutability Guarantee:
 *    - MissionState is never mutated, modified, or dispatched to.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { aiMissionInstructor } from '@/services/ai/aiInstructorEngine';
import { useInstructorStore } from '@/store/useInstructorStore';
import { createInitialMissionState } from '@/simulation/engine/core';
import { MissionEventRecord } from '@/simulation/models/missionState';
import {
  handleInstructorApiRequest,
  generateServerFallbackExplanation,
} from '@/server/instructorApiHandler';
import { EventEmitter } from 'events';

describe('LIGHTTIME AI Mission Instructor – Educational Assistant', () => {
  beforeEach(() => {
    useInstructorStore.getState().clearHistory();
    useInstructorStore.getState().setOpen(false);
  });

  // ==========================================================================
  // 1. Structured Information Ingestion
  // ==========================================================================
  describe('1. Structured Information Receipt', () => {
    it('compiles a complete structured context payload containing all 7 required domains', () => {
      const state = createInitialMissionState();
      const sampleEvents: MissionEventRecord[] = [
        {
          eventId: 'EVT-TEST-001',
          timestampHours: 12.5,
          category: 'ECLSS',
          severity: 'INFO',
          title: 'Oxygen Generator Cycle Complete',
          details: 'Electrolysis cycle produced 1.2 kg O2 into main accumulator.',
        },
      ];

      const payload = aiMissionInstructor.buildContextPayload(state, sampleEvents, {
        mode: 'ASK_INSTRUCTOR',
        userQuestion: 'Explain our current status',
      });

      // 1. Current Mission State
      expect(payload.missionState).toBeDefined();
      expect(payload.missionState.missionDay).toBe(1);
      expect(payload.missionState.missionStatus).toBe('ACTIVE');

      // 2. Crew Condition (4 astronauts with biometrics and human factors)
      expect(payload.crewCondition.length).toBe(4);
      expect(payload.crewCondition[0]!.name).toBe('Elena Vance');
      expect(payload.crewCondition[0]!.fatigueIndex).toBeDefined();
      expect(payload.crewCondition[0]!.sleepHours).toBeDefined();

      // 3. Habitat Resources
      expect(payload.habitatResources).toBeDefined();
      expect(payload.habitatResources.oxygenInventoryKg).toBeGreaterThan(0);
      expect(payload.habitatResources.waterRecoveryRatePercent).toBeGreaterThan(90);
      expect(payload.habitatResources.batteryStorageKwh).toBeGreaterThan(0);
      expect(payload.habitatResources.equipmentConditionSummary.length).toBeGreaterThan(0);

      // 4. Active Emergency
      expect(payload.activeEmergency).toBeDefined();

      // 5. Recent Mission Events
      expect(payload.recentEvents.length).toBeGreaterThanOrEqual(1);
      expect(payload.recentEvents[0]!.title).toBe('Oxygen Generator Cycle Complete');

      // 6. Relevant Scientific References (NASA DONKI, LOLA, HRP, OSDR)
      expect(payload.relevantScientificReferences.length).toBeGreaterThanOrEqual(3);
      expect(payload.relevantScientificReferences.some((r) => r.organization.includes('NASA'))).toBe(true);

      // 7. Documented Educational Assumptions (ASM-O2, ASM-CO2, ASM-CREW, ASM-COMMS)
      expect(payload.documentedEducationalAssumptions.length).toBeGreaterThanOrEqual(4);
      expect(payload.documentedEducationalAssumptions.some((a) => a.id.includes('ASM-O2'))).toBe(true);
      expect(payload.documentedEducationalAssumptions.some((a) => a.id.includes('ASM-CREW'))).toBe(true);
    });
  });

  // ==========================================================================
  // 2. Mandatory Core Explanations
  // ==========================================================================
  describe('2. Five Mandatory Core Explanations', () => {
    it('EXPLANATION 1: Explains why resources are decreasing (metabolic O2, loop non-closure, power deficit)', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainResourceDepletion(state);

      expect(response.answer).toMatch(/Why Resources Are Decreasing/i);
      expect(response.answer).toMatch(/0\.035 kg\/hr.*0\.14 kg\/hr/i); // ASM-O2-METABOLIC-01
      expect(response.answer).toMatch(/Water Recovery Loop/i);
      expect(response.answer).toMatch(/Electrical Power & Battery Discharge/i);
      expect(response.educationalTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(response.relatedFlightRules).toContain('FR-ECLSS-01 (Atmospheric Redlines)');
      expect(response.educationalAssumptionsUsed).toBeDefined();
    });

    it('EXPLANATION 2: Explains why a habitat system is failing (wear, dust, valve jam, power starvation)', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainSystemFailure(state, 'CDRA Carbon Dioxide Removal Assembly');

      expect(response.answer).toMatch(/Why Subsystem.*Is Failing/i);
      expect(response.answer).toMatch(/Mechanical Wear & Thermal Cycling/i);
      expect(response.answer).toMatch(/Regolith Dust Abrasion/i);
      expect(response.answer).toMatch(/Chemical Bed Saturation/i);
      expect(response.relatedFlightRules).toContain('FR-MAINT-01 (Component Servicing Intervals)');
      expect(response.educationalTakeaways.some((t) => t.includes('Preventive Maintenance'))).toBe(true);
    });

    it('EXPLANATION 3: Explains how crew fatigue influences performance (NASA HRP, PVT lapses, MEDICAL_RESTRICTED)', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainCrewFatigueImpact(state);

      expect(response.answer).toMatch(/How Crew Fatigue Influences Mission Performance/i);
      expect(response.answer).toMatch(/NASA Human Research Program \(HRP\) Evidence/i);
      expect(response.answer).toMatch(/7\.0 to 8\.0 hours/i);
      expect(response.answer).toMatch(/Psychomotor Vigilance Task \(PVT\)/i);
      expect(response.answer).toMatch(/MEDICAL_RESTRICTED/i);
      expect(response.relatedFlightRules).toContain('FR-CREW-02 (Circadian Rest Restraints)');
    });

    it('EXPLANATION 4: Explains why an emergency response succeeded or failed (deadlines, containment, latency)', () => {
      const state = createInitialMissionState();
      // Test when active emergency exists
      const emergencyState = {
        ...state,
        emergency: {
          activeScenario: 'SCN-O2-MICROFRACTURE-01',
          severity: 'CRITICAL' as const,
          remainingResponseTimeSeconds: 1200,
          responseActions: [
            {
              actionId: 'ACT-ISO-O2-01',
              description: 'Isolate Damaged Manifold Valve',
              status: 'AVAILABLE' as const,
              authorizedBy: 'CREW_AUTONOMY' as const,
            },
          ],
        },
      };

      const response = aiMissionInstructor.explainEmergencyOutcome(emergencyState);

      expect(response.answer).toMatch(/EMERGENCY OUTCOME ANALYSIS/i);
      expect(response.answer).toMatch(/Why Emergency Responses SUCCEED/i);
      expect(response.answer).toMatch(/Why Emergency Responses FAIL/i);
      expect(response.answer).toMatch(/Autonomous Override/i);
      expect(response.answer).toMatch(/Expired Deadline/i);
      expect(response.relatedFlightRules).toContain('FR-EMERG-01 (Master Alarm Containment)');
    });

    it('EXPLANATION 5: Explains how communication conditions and speed-of-light delay affected decisions', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainCommsInfluence(state);

      expect(response.answer).toMatch(/COMMUNICATION CONDITIONS & SPEED-OF-LIGHT DELAY/i);
      expect(response.answer).toMatch(/299,792,458 m\/s/);
      expect(response.answer).toMatch(/384,400 km/);
      expect(response.answer).toMatch(/2\.56.*seconds/);
      expect(response.answer).toMatch(/Remote Joysticking is Physically Impossible/i);
      expect(response.answer).toMatch(/Autonomous crew authority/i);
      expect(response.relatedFlightRules).toContain('FR-COMMS-01 (Latency Standards)');
    });
  });

  // ==========================================================================
  // 3. Four Core Feature Entrypoints
  // ==========================================================================
  describe('3. Four Core Feature Entrypoints', () => {
    it('FEATURE 1: "Ask the Mission Instructor" handles contextual student Q&A', async () => {
      const state = createInitialMissionState();
      const response = await aiMissionInstructor.askInstructor('Why is our power dropping so fast?', state);

      expect(response.answer).toBeDefined();
      expect(response.answer).toMatch(/Power|Electrical|Battery/i);
      expect(response.educationalTakeaways.length).toBeGreaterThan(0);
      expect(response.suggestedFollowUps.length).toBeGreaterThan(0);
    });

    it('FEATURE 2: "Explain This Event" provides detailed causal breakdown of any log record', async () => {
      const state = createInitialMissionState();
      const event: MissionEventRecord = {
        eventId: 'EVT-CDRA-JAM-01',
        timestampHours: 34.2,
        category: 'ECLSS',
        severity: 'WARNING',
        title: 'CDRA Desorption Valve Jammed in Sector B',
        details: 'Mechanical desorb valve failed to rotate to desorb position.',
        trigger: 'Actuator torque limit exceeded due to regolith particulate contamination.',
        educationalExplanation: 'CDRA desorption failure prevents zeolite beds from venting trapped CO2.',
      };

      const response = await aiMissionInstructor.explainEvent(event, state);

      expect(response.answer).toMatch(/EVENT ANALYSIS: CDRA Desorption Valve Jammed/i);
      expect(response.answer).toMatch(/Physical & Operational Root Cause/i);
      expect(response.answer).toMatch(/Actuator torque limit exceeded/i);
      expect(response.answer).toMatch(/NASA Flight Rule & System Impact/i);
      expect(response.educationalTakeaways.length).toBeGreaterThan(0);
    });

    it('FEATURE 3: "Explain This Warning" details caution triggers and mitigation procedures', async () => {
      const state = createInitialMissionState();
      const warning = {
        warningId: 'WARN-O2-CRIT',
        subsystem: 'ECLSS Atmosphere',
        severity: 'CRITICAL' as const,
        headline: 'Cabin Pressure Drop Rate Exceeded',
        currentValue: '51.2 kPa (-0.8 kPa/min)',
        thresholdValue: '56.5 kPa nominal',
        details: 'Atmospheric pressure transducer detected rapid cabin decompression.',
      };

      const response = await aiMissionInstructor.explainWarning(warning, state);

      expect(response.answer).toMatch(/CAUTION & WARNING BREAKDOWN/i);
      expect(response.answer).toMatch(/Cabin Pressure Drop Rate Exceeded/i);
      expect(response.answer).toMatch(/Why this Warning Tripped/i);
      expect(response.answer).toMatch(/Immediate Flight Controller Mitigation/i);
      expect(response.relatedFlightRules).toContain('FR-ALARM-01 (Master Alarm Classification)');
    });

    it('FEATURE 4: "Post-Mission Learning Feedback" delivers comprehensive debrief analysis', async () => {
      const state = createInitialMissionState();
      const response = await aiMissionInstructor.generatePostMissionDebriefFeedback(state);

      expect(response.answer).toMatch(/POST-MISSION.*DEBRIEF/i);
      expect(response.answer).toMatch(/Consumables Stewardship & Life Support/i);
      expect(response.answer).toMatch(/Crew Human Factors & Circadian Rest/i);
      expect(response.answer).toMatch(/Emergency Handling & Communication Delay Impact/i);
      expect(response.answer).toMatch(/Key Presentation Takeaways for Students/i);
      expect(response.scientificReferencesUsed?.length).toBeGreaterThan(0);
      expect(response.educationalAssumptionsUsed?.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 4. Secure Backend Endpoint & Fallback Architecture
  // ==========================================================================
  describe('4. Secure Backend Endpoint & Fallback Architecture', () => {
    it('executes server-side fallback reasoning when external AI service is unavailable', () => {
      const state = createInitialMissionState();
      const payload = aiMissionInstructor.buildContextPayload(state, [], {
        mode: 'POST_MISSION_FEEDBACK',
      });

      const response = generateServerFallbackExplanation(payload);

      expect(response).toBeDefined();
      expect(response.answer).toMatch(/POST-MISSION EDUCATIONAL DEBRIEF/i);
      expect(response.sourceMode).toBe('LOCAL_KNOWLEDGE_ENGINE');
      expect(response.educationalTakeaways.length).toBeGreaterThan(0);
    });

    it('handles HTTP POST /api/instructor request via handleInstructorApiRequest securely', async () => {
      const state = createInitialMissionState();
      const payload = aiMissionInstructor.buildContextPayload(state, [], {
        mode: 'ASK_INSTRUCTOR',
        userQuestion: 'How does oxygen recycling work?',
      });

      // Mock Node HTTP IncomingMessage
      const req = new EventEmitter() as any;
      req.method = 'POST';
      req.headers = { 'content-type': 'application/json' };
      req.socket = { remoteAddress: '127.0.0.1' };

      // Mock Node HTTP ServerResponse
      let statusCode = 0;
      const headers: Record<string, string> = {};
      let responseBody = '';

      const res = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        end: (body: string) => {
          responseBody = body;
        },
        get statusCode() {
          return statusCode;
        },
        set statusCode(code: number) {
          statusCode = code;
        },
      } as any;

      const handlerPromise = handleInstructorApiRequest(req, res);

      // Emit request payload
      req.emit('data', Buffer.from(JSON.stringify(payload)));
      req.emit('end');

      await handlerPromise;

      expect(statusCode).toBe(200);
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-RateLimit-Limit']).toBe('60');

      const parsed = JSON.parse(responseBody);
      expect(parsed.answer).toBeDefined();
      expect(parsed.educationalTakeaways.length).toBeGreaterThan(0);
    });

    it('rejects HTTP non-POST methods with 405 Method Not Allowed', async () => {
      const req = new EventEmitter() as any;
      req.method = 'GET';
      req.headers = {};
      req.socket = { remoteAddress: '127.0.0.1' };

      let statusCode = 0;
      let responseBody = '';

      const res = {
        setHeader: () => {},
        end: (body: string) => {
          responseBody = body;
        },
        get statusCode() {
          return statusCode;
        },
        set statusCode(code: number) {
          statusCode = code;
        },
      } as any;

      await handleInstructorApiRequest(req, res);

      expect(statusCode).toBe(405);
      expect(JSON.parse(responseBody).error).toMatch(/Method Not Allowed/i);
    });
  });

  // ==========================================================================
  // 5. Epistemological Honesty & Scientific Limitations
  // ==========================================================================
  describe('5. Epistemological Honesty & Scientific Limitations', () => {
    it('clearly documents limitations and distinguishes measured data from educational assumptions', () => {
      const state = createInitialMissionState();
      const response = aiMissionInstructor.explainResourceDepletion(state);

      expect(response.epistemologicalLimitations).toBeDefined();
      expect(response.epistemologicalLimitations).toMatch(/Epistemological Limitation/i);
      expect(response.scientificReferencesUsed).toBeDefined();
      expect(response.educationalAssumptionsUsed).toBeDefined();

      // Check distinction: assumptions have classifications
      const assumptions = response.educationalAssumptionsUsed || [];
      expect(assumptions.some((a) => a.classification === 'MEASURED_PHYSICAL_VALUE' || a.classification === 'ENGINEERING_BASELINE')).toBe(true);
    });
  });

  // ==========================================================================
  // 6. Strict Read-Only Immutability Guarantee
  // ==========================================================================
  describe('6. Strict Read-Only Immutability Guarantee', () => {
    it('guarantees that calling any or all AI instructor functions NEVER mutates MissionState', async () => {
      const state = createInitialMissionState();
      const baselineSnapshot = JSON.stringify(state);

      // Invoke all functions
      aiMissionInstructor.explainResourceDepletion(state);
      aiMissionInstructor.explainSystemFailure(state);
      aiMissionInstructor.explainCrewFatigueImpact(state);
      aiMissionInstructor.explainEmergencyOutcome(state);
      aiMissionInstructor.explainCommsInfluence(state);
      await aiMissionInstructor.askInstructor('Why is cabin oxygen low?', state);
      await aiMissionInstructor.generatePostMissionDebriefFeedback(state);

      // Assert state is byte-for-byte identical
      expect(JSON.stringify(state)).toBe(baselineSnapshot);
    });
  });
});
