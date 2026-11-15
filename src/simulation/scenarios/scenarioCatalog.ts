export interface MissionScenario {
  id: string;
  name: string;
  dayStart: number;
  dayEnd: number;
  difficulty: 'CADET' | 'COMMANDER' | 'VETERAN';
  description: string;
  primaryChallenges: string[];
}

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'SCENARIO-01-NOMINAL',
    name: '30-Day Expedition Baseline: Shackleton South Rim',
    dayStart: 1,
    dayEnd: 30,
    difficulty: 'CADET',
    description: 'Standard expedition curriculum balancing daily science sampling with ECLSS maintenance and sleep schedules.',
    primaryChallenges: ['Circadian rhythm pacing', 'Daily consumable balancing', 'Water reclamation monitoring'],
  },
  {
    id: 'SCENARIO-02-SOLAR-FLARE',
    name: 'Contingency Alpha: Class X Solar Particle Event',
    dayStart: 12,
    dayEnd: 15,
    difficulty: 'COMMANDER',
    description: 'A major solar coronal mass ejection intersects the Moon. Commander must manage EVA recall, storm shelter rationing, and comms degradation.',
    primaryChallenges: ['Time-critical EVA abort under 1.28s latency', 'Storm shelter life support crowding', 'Acute radiation dosage control'],
  },
  {
    id: 'SCENARIO-03-SCRUBBER-FAILURE',
    name: 'Contingency Beta: ECLSS Carbon Scrubber Bed Fault',
    dayStart: 8,
    dayEnd: 10,
    difficulty: 'VETERAN',
    description: 'Desorption heater failure in primary CDRA bed triggers CO2 buildup during deep lunar sleep cycle.',
    primaryChallenges: ['Autonomous flight rule validation', 'Crew awakening & cognitive impairment assessment', 'Manual valve rerouting'],
  },
];
