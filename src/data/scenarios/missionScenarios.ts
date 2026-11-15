/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Scenario Catalog
 *
 * Defines standard and contingency pre-launch scenarios with educational
 * learning goals, risk levels, and initial subsystem conditions.
 */

export interface MissionScenarioDefinition {
  id: 'STANDARD_MISSION' | 'SOLAR_PARTICLE_EVENT' | 'CO2_SCRUBBER_ANOMALY' | 'EXTENDED_PSR_SORTIE';
  title: string;
  subtitle: string;
  difficulty: 'CADET' | 'DIRECTOR' | 'COMMANDER';
  riskRating: 'NOMINAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  educationalFocus: string;
  primaryObjective: string;
  contingencyRisk: string;
}

export const MISSION_SCENARIOS: MissionScenarioDefinition[] = [
  {
    id: 'STANDARD_MISSION',
    title: 'Standard Expedition 30 Baseline',
    subtitle: 'Nominal Artemis Lunar Surface Architecture',
    difficulty: 'DIRECTOR',
    riskRating: 'NOMINAL',
    description:
      'Nominal 30-day lunar surface expedition establishing the Shackleton Outpost. All habitat life support systems, cryogenic consumables, and electrical generation operate at factory baseline.',
    educationalFocus:
      'Master fundamental ECLSS balancing, 1.282s light-time latency communication buffers, and astronaut circadian work-rest cycles.',
    primaryObjective:
      'Achieve 100% mission sol survival with zero life-support safety violations and nominal crew cognitive readiness.',
    contingencyRisk: 'Baseline random micro-meteoroid and equipment wear curves.',
  },
  {
    id: 'SOLAR_PARTICLE_EVENT',
    title: 'Solar Particle Event (SPE) Alert',
    subtitle: 'Acute Space Weather Radiation Contingency',
    difficulty: 'COMMANDER',
    riskRating: 'CRITICAL',
    description:
      'NOAA Space Weather Prediction Center models an unannounced coronal mass ejection intercepting lunar orbit on Day 03. Ambient radiation jumps by 400x.',
    educationalFocus:
      'Space radiation physics, storm shelter ingress timelines (Rule 9.1: 20-minute threshold), and EVA recall coordination under latency.',
    primaryObjective:
      'Recall surface rover EVA sorties and enforce storm shelter confinement before cumulative dose exceeds 25 mSv.',
    contingencyRisk: 'Acute radiation sickness, cognitive degradation, and communications scintillation.',
  },
  {
    id: 'CO2_SCRUBBER_ANOMALY',
    title: 'ECLSS CDRA Bed Failure',
    subtitle: 'Carbon Dioxide Removal Assembly Valve Malfunction',
    difficulty: 'DIRECTOR',
    riskRating: 'HIGH',
    description:
      'On Day 02, Desiccant Bed 1 diverter valve sticks in a closed position. Habitat ppCO2 begins climbing toward the 0.53 kPa flight rule caution threshold.',
    educationalFocus:
      'ECLSS mass-balance dynamics, step-by-step contingency procedure execution under Earth-Moon latency, and crew autonomy delegation.',
    primaryObjective:
      'Execute emergency checklist ECLSS-CO2-02 to divert adsorbent airflow or authorize local crew override before hypercapnia impairs crew.',
    contingencyRisk: 'Crew hypercapnia, headaches, loss of consciousness, and mission abort.',
  },
  {
    id: 'EXTENDED_PSR_SORTIE',
    title: 'Permanently Shadowed Region Ice Campaign',
    subtitle: 'High-Demand Geological Science Sortie',
    difficulty: 'COMMANDER',
    riskRating: 'HIGH',
    description:
      'Heavy surface exploration campaign into Shoemaker and Faustini craters to drill cryo-preserved volatile core samples in cryogenic -230°C darkness.',
    educationalFocus:
      'Electrical battery depth-of-discharge management, cryogenic thermal management, and physical exhaustion countermeasures.',
    primaryObjective:
      'Recover 3 geological ice drill cores while maintaining rover battery reserve above 30% and crew fatigue below 60%.',
    contingencyRisk: 'Rover battery freezing, rover stranding, and severe astronaut sleep debt.',
  },
];
