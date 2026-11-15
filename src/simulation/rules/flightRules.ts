export interface FlightRule {
  id: string;
  category: 'ECLSS' | 'EVA' | 'RADIATION' | 'CREW_FATIGUE' | 'COMMUNICATIONS';
  ruleTitle: string;
  thresholdCondition: string;
  prescribedAction: string;
  autonomyLevel: 'AUTOMATIC_LOCAL_EXECUTION' | 'CREW_DISCRETION' | 'EARTH_APPROVAL_REQUIRED';
}

export const LUNAR_FLIGHT_RULES: FlightRule[] = [
  {
    id: 'FR-ECLSS-01',
    category: 'ECLSS',
    ruleTitle: 'Hypercapnia Prevention Limit',
    thresholdCondition: 'Cabin ppCO2 >= 0.53 kPa (4.0 mmHg)',
    prescribedAction: 'Activate secondary Amine CDRA bed. Ingress crew to ventilated core.',
    autonomyLevel: 'AUTOMATIC_LOCAL_EXECUTION',
  },
  {
    id: 'FR-EVA-02',
    category: 'EVA',
    ruleTitle: 'Consumables Reserve Return Margin',
    thresholdCondition: 'Suit O2 reserve <= 30 minutes OR Battery <= 25%',
    prescribedAction: 'Immediate termination of surface operations; commence rover transit to airlock.',
    autonomyLevel: 'CREW_DISCRETION',
  },
  {
    id: 'FR-RAD-03',
    category: 'RADIATION',
    ruleTitle: 'Solar Particle Event (SPE) Alert',
    thresholdCondition: 'Proton flux > 10 pfu (E > 10 MeV)',
    prescribedAction: 'Abort EVA within 15 minutes. Ingress all four crew members into core storm shelter.',
    autonomyLevel: 'AUTOMATIC_LOCAL_EXECUTION',
  },
  {
    id: 'FR-COMMS-04',
    category: 'COMMUNICATIONS',
    ruleTitle: 'Loss-of-Signal Autonomous Operations',
    thresholdCondition: 'DSN link carrier lock lost > 120 seconds',
    prescribedAction: 'Transition habitat automation to local autonomous governor. Defer non-critical maneuvers.',
    autonomyLevel: 'AUTOMATIC_LOCAL_EXECUTION',
  },
];
