/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Emergency Scenarios Catalog
 *
 * Defines the five canonical playable emergency scenarios with:
 * - Scenario ID and version
 * - Initial conditions & triggers
 * - Alarm severity & event duration
 * - Response deadlines
 * - Interactive actions with real resource/time/crew costs
 * - Deterministic physical consequences
 * - Educational learning objectives & NASA flight rules
 */

import { CommandSubsystemType } from '@/simulation/commands/commandDispatcher';

export interface EmergencyActionCost {
  timeMinutes: number;
  o2Kg?: number;
  powerKw?: number;
  batteryKwh?: number;
  waterLiters?: number;
  crewFatigueDelta?: number;
  crewStressDelta?: number;
  crewWorkloadDelta?: number;
}

export interface EmergencyActionDefinition {
  actionId: string;
  label: string;
  description: string;
  subsystem: CommandSubsystemType;
  action: string;
  parameters: Record<string, unknown>;
  authorizedBy: 'GROUND' | 'CREW_AUTONOMY';
  requiresEarthComms: boolean;
  cost: EmergencyActionCost;
  consequenceSummary: string;
  mitigationEffect: string;
}

export interface PlayableEmergencyScenario {
  id: string;
  version: string;
  title: string;
  shortTitle: string;
  category: 'OXYGEN' | 'POWER' | 'RADIATION' | 'COMMUNICATIONS' | 'CO2';
  difficulty: 'CADET' | 'COMMANDER' | 'VETERAN';
  severity: 'WARNING' | 'CRITICAL';
  eventDurationSeconds: number;
  responseDeadlineSeconds: number;
  triggerConditions: {
    description: string;
    telemetryMetric: string;
    thresholdDisplay: string;
  };
  initialConditions: {
    narrative: string;
    telemetryDeltas: Record<string, string>;
  };
  consequences: {
    unresolvedFailure: string;
    successfulMitigation: string;
  };
  learningObjectives: string[];
  flightRuleReferences: string[];
  availableActions: EmergencyActionDefinition[];
}

export const EMERGENCY_SCENARIOS: PlayableEmergencyScenario[] = [
  // ==========================================================================
  // 1. Oxygen Leakage
  // ==========================================================================
  {
    id: 'SCENARIO-EMG-01-O2-LEAK',
    version: '1.0.0',
    title: 'Cryogenic Oxygen Feedline Micrometeoroid Breach',
    shortTitle: '1. Oxygen Leakage',
    category: 'OXYGEN',
    difficulty: 'COMMANDER',
    severity: 'CRITICAL',
    eventDurationSeconds: 1800, // 30 minutes
    responseDeadlineSeconds: 1200, // 20 minutes before hypoxia threshold
    triggerConditions: {
      description: 'Pinhole micrometeoroid impact punctures Cryo Feedline B downstream of Tank 1 manifold.',
      telemetryMetric: 'Cabin O2 Inflow & Feedline Differential Pressure',
      thresholdDisplay: 'Bleed Rate: 1.20 kg/hr (>8x nominal 0.14 kg/hr), ΔP = -18 kPa',
    },
    initialConditions: {
      narrative:
        'A micro-penetration breached external cryogenic manifold line B. High-pressure liquid oxygen is escaping into vacuum at 1.20 kg/hr. 10.0 kg of reserve has leaked out immediately upon impact. Available hypoxia runway is dropping below 45 hours.',
      telemetryDeltas: {
        'Oxygen Leak Rate': '1.20 kg/hr (Normal: 0.14 kg/hr)',
        'Lost Cryo Inventory': '-10.0 kg instantaneous loss',
        'Cabin ppO2 Trend': 'Declining rapidly toward 19.0 kPa warning floor',
        'Hypoxia Runway': '20 minutes to critical intervention deadline',
      },
    },
    consequences: {
      unresolvedFailure:
        'Cryogenic oxygen depleted. Cabin partial pressure collapses below 16.0 kPa. Crew develops acute hypoxia, cognitive incapacitation, and mandatory emergency ascent abort.',
      successfulMitigation:
        'Damaged line isolated at motor valve MV-02. Auxiliary surge tank engaged. Oxygen consumption rate returns to nominal 0.14 kg/hr with cabin safety buffer restored.',
    },
    learningObjectives: [
      'Master time-critical ECLSS manifold isolation under hyper-accelerated consumables depletion.',
      'Differentiate between metabolic consumption rates and physical line breaches.',
      'Apply NASA Flight Rule 4.1 for minimum safe oxygen partial pressure thresholds.',
    ],
    flightRuleReferences: [
      'FR-ECLSS-04: If cryo manifold pressure drops > 15 kPa/min, isolate affected loop immediately.',
      'FR-CREW-02: Hypoxia prevention mandates cabin ppO2 maintained above 19.5 kPa at all times.',
    ],
    availableActions: [
      {
        actionId: 'ACT-O2-ISOLATE-LINE',
        label: 'Isolate Damaged Oxygen Line',
        description: 'Command motorized cutoff valve MV-02 to isolate ruptured line segment B and re-route feed through manifold A.',
        subsystem: 'EMERGENCY',
        action: 'ISOLATE_O2_LEAK',
        parameters: { manifold: 'B', isolationValve: 'MV-02' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 5,
          o2Kg: 2.0, // Line purge loss
          crewStressDelta: 5,
          crewWorkloadDelta: 15,
        },
        consequenceSummary: 'Halts rapid oxygen leak. Expends 2.0 kg purge gas and restores baseline consumption rate (0.14 kg/hr).',
        mitigationEffect: 'REDUCES_LEAK_TO_ZERO',
      },
      {
        actionId: 'ACT-O2-SURGE-TANK',
        label: 'Activate Auxiliary Emergency O2 Surge Tank',
        description: 'Open emergency solenoid on unpunctured auxiliary surge bottle (+10.0 kg cryo O2 reserve).',
        subsystem: 'HABITAT_SYSTEMS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { unitType: 'O2_SURGE_TANK' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 3,
          batteryKwh: 1.5,
          crewStressDelta: -5,
        },
        consequenceSummary: 'Injects +10.0 kg high-purity oxygen into cabin accumulator to extend survival runway.',
        mitigationEffect: 'RESTORES_10KG_OXYGEN',
      },
      {
        actionId: 'ACT-O2-GROUND-DIAG',
        label: 'Request Ground Transducer Telemetry Analysis',
        description: 'Uplink high-rate acoustic manifold pressure telemetry to Houston POIC for pinhole leak triangulation.',
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_DIAGNOSTICS',
        parameters: { subsystemTarget: 'ECLSS_O2' },
        authorizedBy: 'GROUND',
        requiresEarthComms: true, // Blocked when communications are offline!
        cost: {
          timeMinutes: 8,
          powerKw: 1.0,
          crewStressDelta: -10,
        },
        consequenceSummary: 'Ground confirms exact rupture locus at Manifold Joint B-4 and approves manifold reroute.',
        mitigationEffect: 'GROUND_VERIFIED_DIAGNOSTIC',
      },
    ],
  },

  // ==========================================================================
  // 2. Power Shortage
  // ==========================================================================
  {
    id: 'SCENARIO-EMG-02-POWER-COLLAPSE',
    version: '1.0.0',
    title: 'Surface Reactor Coolant SCRAM & Main Bus Brownout',
    shortTitle: '2. Power Shortage',
    category: 'POWER',
    difficulty: 'VETERAN',
    severity: 'CRITICAL',
    eventDurationSeconds: 3600, // 60 minutes
    responseDeadlineSeconds: 1800, // 30 minutes before battery collapse
    triggerConditions: {
      description: 'Stirling surface fission reactor automated safety SCRAM due to heat-pipe thermal loop cavitation.',
      telemetryMetric: 'Total Electrical Generation vs Demand',
      thresholdDisplay: 'Generation collapsed: 34.2 kW → 8.2 kW; Battery discharge rate: -16.6 kW',
    },
    initialConditions: {
      narrative:
        'Primary fission reactor tripped offline following a thermal pump desync. Solar arrays deliver only 8.2 kW in polar rim shadow. Habitat demand is 24.8 kW. Battery storage is draining at 16.6 kW net deficit. Without intervention, complete electrical blackout occurs in 1.8 hours.',
      telemetryDeltas: {
        'Power Generation': '8.2 kW (Nuclear reactor OFFLINE)',
        'Battery Discharge': '-16.6 kW continuous net drain',
        'Battery SoC': 'Dropped to 20.0 kWh (10.0% State of Charge)',
        'Blackout Runway': '30 minutes to complete battery exhaustion',
      },
    },
    consequences: {
      unresolvedFailure:
        'Battery fully depleted. Habitat enters cascading blackout. ECLSS heaters fail, ambient temperature drops to -50°C, air circulation stalls, and life support fails.',
      successfulMitigation:
        'Non-essential loads shedded (-4.5 kW), auxiliary battery bank engaged (+30 kWh), demand balanced within available generation budget.',
    },
    learningObjectives: [
      'Implement hierarchical load-shedding to prevent cascading micro-grid collapse.',
      'Analyze battery state-of-charge discharge curves under high-draw life support burdens.',
      'Balance critical ECLSS power requirements against non-essential scientific experiments.',
    ],
    flightRuleReferences: [
      'FR-EPS-01: When battery SoC drops < 20%, shed all non-essential loads immediately.',
      'FR-EPS-05: Critical life support buses must retain at least 15 kWh dedicated blackout reserve.',
    ],
    availableActions: [
      {
        actionId: 'ACT-PWR-SHED-LOAD',
        label: 'Reduce Non-Essential Electrical Loads',
        description: 'Shed airlock depress pumps, external floodlights, and science payload incubators to shave 4.5 kW.',
        subsystem: 'POWER_GRID',
        action: 'REDUCE_NON_ESSENTIAL_POWER',
        parameters: { targetLoadKw: 4.5 },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 5,
          crewWorkloadDelta: 10,
          crewStressDelta: 5,
        },
        consequenceSummary: 'Immediately reduces electrical demand by 4.5 kW, slowing battery discharge and extending survival buffer.',
        mitigationEffect: 'SHEDS_4_5_KW_DEMAND',
      },
      {
        actionId: 'ACT-PWR-AUX-BATTERY',
        label: 'Switch to Backup Power & Aux Battery Bank',
        description: 'Switch main power bus to secondary lithium-metal solid-state auxiliary battery bank (+30.0 kWh).',
        subsystem: 'HABITAT_SYSTEMS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { unitType: 'AUX_BATTERY_BANK' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 10,
          crewWorkloadDelta: 15,
        },
        consequenceSummary: 'Brings +30.0 kWh reserve battery online, raising State of Charge back above critical warning floor.',
        mitigationEffect: 'ADDS_30_KWH_STORAGE',
      },
      {
        actionId: 'ACT-PWR-GROUND-RESTART',
        label: 'Request Ground Remote Reactor SCRAM Override',
        description: 'Coordinate with Earth Reactor Flight Controllers to cycle Stirling bypass valves and initiate controlled nuclear restart.',
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_REACTOR_RESTART',
        parameters: { reactorId: 'EQ-EPS-REACTOR-01' },
        authorizedBy: 'GROUND',
        requiresEarthComms: true, // Blocked when communications are offline!
        cost: {
          timeMinutes: 15,
          crewStressDelta: -10,
        },
        consequenceSummary: 'Ground validates coolant thermal margin and commands reactor restart, restoring 24.0 kW baseline generation.',
        mitigationEffect: 'RESTORES_REACTOR_GENERATION',
      },
    ],
  },

  // ==========================================================================
  // 3. Radiation Event
  // ==========================================================================
  {
    id: 'SCENARIO-EMG-03-SOLAR-PARTICLE-EVENT',
    version: '1.0.0',
    title: 'Class X Coronal Mass Ejection & Solar Proton Storm',
    shortTitle: '3. Radiation Event',
    category: 'RADIATION',
    difficulty: 'COMMANDER',
    severity: 'CRITICAL',
    eventDurationSeconds: 7200, // 2 hours
    responseDeadlineSeconds: 1200, // 20 minutes (NASA Flight Rule 9.2)
    triggerConditions: {
      description: 'Interplanetary coronal mass ejection shockfront arrives at lunar orbit. High-energy proton flux crosses danger threshold.',
      telemetryMetric: 'Educational Radiation Hazard Index / High-Energy Proton Flux',
      thresholdDisplay: 'Hazard Index: 92.0 / 100 (> 40.0 shelter threshold), Proton Flux > 500 pfu',
    },
    initialConditions: {
      narrative:
        'NOAA SWPC and the Lunar Gateway heliophysics suite confirm an unannounced Class X solar flare CME hitting the south polar region. Unshielded ambient radiation spiked to 92.0 index (0.85 mSv/hr). EVA crew and peripheral habitat zones face acute radiation sickness without immediate shelter confinement.',
      telemetryDeltas: {
        'Radiation Hazard Index': '92.0 (Threshold: 40.0)',
        'Unshielded Dose Rate': '0.85 mSv/hr (Nominal: 0.015 mSv/hr)',
        'NASA Flight Rule Alert': 'FR-RAD-03: Mandatory storm shelter ingress within 20 minutes',
        'Crew Location': 'All 4 crew currently in peripheral habitat compartments',
      },
    },
    consequences: {
      unresolvedFailure:
        'Cumulative astronaut radiation dose exceeds 250 mSv. Crew suffers acute radiation sickness (nausea, fatigue, immune suppression), forcing mission abort.',
      successfulMitigation:
        'All 4 crew moved into Core Storm Shelter surrounded by regolith and water mass. Ionizing radiation attenuated by 92%, protecting crew biometrics.',
    },
    learningObjectives: [
      'Differentiate between galactic cosmic rays and acute Solar Particle Events.',
      'Enforce NASA Flight Rule 9.2: 20-minute shelter ingress deadline.',
      'Utilize passive mass shielding (regolith berms and greywater bladders) for radiation attenuation.',
    ],
    flightRuleReferences: [
      'FR-RAD-03: When solar proton flux exceeds 10 pfu, all crew must ingress core storm shelter within 20 minutes.',
      'FR-CREW-04: Cumulative expedition radiation dose must not exceed 250 mSv per astronaut.',
    ],
    availableActions: [
      {
        actionId: 'ACT-RAD-MOVE-SHELTER',
        label: 'Move Crew to Designated Safer Location (Storm Shelter)',
        description: 'Order immediate ingress of all four astronauts into the thick-walled Core Storm Shelter module.',
        subsystem: 'EMERGENCY',
        action: 'MOVE_CREW_TO_SHELTER',
        parameters: { shelterLocation: 'CORE_STORM_SHELTER' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 12,
          crewWorkloadDelta: 20,
          crewStressDelta: 10,
        },
        consequenceSummary: 'Attenuates incoming solar proton radiation by 92%. Lowers crew dose rate to 0.03 mSv/hr and secures biometrics.',
        mitigationEffect: 'MOVES_CREW_ATTENUATES_RADIATION',
      },
      {
        actionId: 'ACT-RAD-DEPLOY-WATER-SHIELD',
        label: 'Activate Water Recovery Shielding Bladders',
        description: 'Pump greywater from WRS holding tanks into ceiling radiation baffles to create a 30 cm hydrogenous protective layer.',
        subsystem: 'HABITAT_SYSTEMS',
        action: 'DEPLOY_WATER_SHIELD',
        parameters: { volumeLiters: 150 },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 8,
          powerKw: 1.2,
          crewStressDelta: -5,
        },
        consequenceSummary: 'Adds supplemental hydrogenous mass shielding, eliminating secondary bremsstrahlung radiation.',
        mitigationEffect: 'BOOSTS_SHELTER_SHIELDING',
      },
      {
        actionId: 'ACT-RAD-EARTH-HELIOPHY',
        label: 'Request NOAA SWPC Solar Proton Trajectory Model',
        description: 'Request Deep Space Climate Observatory (DSCOVR) CME trajectory simulation from Houston Space Radiation Analysis Group.',
        subsystem: 'EMERGENCY',
        action: 'REQUEST_RADIATION_TRAJECTORY',
        parameters: { asset: 'NOAA_SWPC' },
        authorizedBy: 'GROUND',
        requiresEarthComms: true, // Blocked when communications are offline!
        cost: {
          timeMinutes: 10,
          crewStressDelta: -15,
        },
        consequenceSummary: 'Ground confirms CME core transit window and projects radiation drop below warning threshold at MET +24h.',
        mitigationEffect: 'GROUND_RADIATION_MODEL',
      },
    ],
  },

  // ==========================================================================
  // 4. Communication Interruption
  // ==========================================================================
  {
    id: 'SCENARIO-EMG-04-COMMS-BLACKOUT',
    version: '1.0.0',
    title: 'Deep Space Network Carrier Loss & Tracking Desync',
    shortTitle: '4. Communication Interruption',
    category: 'COMMUNICATIONS',
    difficulty: 'CADET',
    severity: 'WARNING',
    eventDurationSeconds: 3600, // 60 minutes
    responseDeadlineSeconds: 2400, // 40 minutes before safing mode
    triggerConditions: {
      description: 'High-gain gimbal drive servo desync accompanied by lunar regolith dust deposition on RF feed horn.',
      telemetryMetric: 'DSN Carrier Signal-to-Noise Ratio & Uplink Status',
      thresholdDisplay: 'Status: DISCONNECTED, Carrier Lock: 0.0%, Latency: UNREACHABLE',
    },
    initialConditions: {
      narrative:
        'Primary steerable Ka-band dish lost tracking lock on Goldstone DSN. Communication link dropped completely to DISCONNECTED. No voice, telemetry, or uplink commands can reach Earth. Crucially: under NASA Flight Rule 11.5, Ground-assisted directives are strictly blocked until communications are restored.',
      telemetryDeltas: {
        'Communication Status': 'DISCONNECTED (Carrier lock lost)',
        'Earth Assistance': 'UNAVAILABLE (Ground directives locked)',
        'One-Way Latency': 'Infinite (No carrier)',
        'Operational Protocol': 'Mandatory Crew Autonomy matrix engaged',
      },
    },
    consequences: {
      unresolvedFailure:
        'Prolonged loss of signal causes Mission Control to declare spacecraft contingency, abort surface operations, and command automated safing.',
      successfulMitigation:
        'Crew autonomously executes conical spiral antenna realignment or switches to Lunar Gateway halo relay, restoring 100% Earth carrier lock.',
    },
    learningObjectives: [
      'Experience operational constraints of Loss-of-Signal (LOS) conditions in deep space.',
      'Understand why Earth-dependent assistance is blocked without active communications.',
      'Apply NASA Flight Rule 11.5 to exercise local crew autonomy when disconnected.',
    ],
    flightRuleReferences: [
      'FR-COMMS-04: If DSN carrier lock is lost > 120 seconds, habitat transitions to autonomous local governor.',
      'FR-COMMS-11: Ground-authorized procedures are invalid during LOS; crew autonomy has sole command authority.',
    ],
    availableActions: [
      {
        actionId: 'ACT-COMMS-REALIGN-ANTENNA',
        label: 'Attempt Communication with Earth (Realign Gimbal)',
        description: 'Execute autonomous closed-loop search pattern to re-acquire Goldstone 70-meter dish carrier frequency.',
        subsystem: 'COMMUNICATIONS',
        action: 'REALIGN_HIGH_GAIN_ANTENNA',
        parameters: { searchPattern: 'CONICAL_SPIRAL', targetStation: 'Goldstone' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 12,
          powerKw: 1.8,
          crewStressDelta: -10,
          crewWorkloadDelta: 10,
        },
        consequenceSummary: 'Re-establishes direct DSN carrier lock with Goldstone. Restores communications to CONNECTED at 100% availability.',
        mitigationEffect: 'RESTORES_EARTH_COMMS_DIRECT',
      },
      {
        actionId: 'ACT-COMMS-SWITCH-GATEWAY',
        label: 'Switch to Lunar Gateway Halo Orbit Relay',
        description: 'Repoint secondary S-band patch antenna toward Lunar Gateway in Near-Rectilinear Halo Orbit (NRHO).',
        subsystem: 'COMMUNICATIONS',
        action: 'SWITCH_GATEWAY_RELAY',
        parameters: { relayAsset: 'GATEWAY_NRHO' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 8,
          powerKw: 0.8,
          crewStressDelta: -5,
        },
        consequenceSummary: 'Establishes indirect relay through Lunar Gateway, restoring communications to CONNECTED (95% bandwidth).',
        mitigationEffect: 'RESTORES_EARTH_COMMS_GATEWAY',
      },
      {
        actionId: 'ACT-COMMS-GROUND-DIRECTIVE',
        label: 'Request Houston Mission Control Uplink Directive',
        description: 'Request Earth flight directors to beam emergency carrier synchronization vectors from Madrid station.',
        subsystem: 'EMERGENCY',
        action: 'REQUEST_GROUND_UPLINK',
        parameters: { station: 'Madrid' },
        authorizedBy: 'GROUND',
        requiresEarthComms: true, // Crucial: BLOCKED when comms is disconnected!
        cost: {
          timeMinutes: 10,
        },
        consequenceSummary: 'REQUIRES ACTIVE DSN LINK. Cannot be executed while carrier is severed.',
        mitigationEffect: 'BLOCKED_WITHOUT_COMMS',
      },
    ],
  },

  // ==========================================================================
  // 5. CO2 Removal Malfunction
  // ==========================================================================
  {
    id: 'SCENARIO-EMG-05-CO2-SCRUBBER-FAULT',
    version: '1.0.0',
    title: 'CDRA Solid Amine Bed Desorption Heater Burnout',
    shortTitle: '5. CO2 Removal Malfunction',
    category: 'CO2',
    difficulty: 'COMMANDER',
    severity: 'CRITICAL',
    eventDurationSeconds: 3600, // 60 minutes
    responseDeadlineSeconds: 1800, // 30 minutes before hypercapnia
    triggerConditions: {
      description: 'Primary Carbon Dioxide Removal Assembly (CDRA) desiccant bed heater element open circuit.',
      telemetryMetric: 'Cabin ppCO2 & Active Scrubbing Capacity',
      thresholdDisplay: 'Scrubbing: 0.00 kg/hr (was 0.26 kg/hr), ppCO2 climbing rapidly > 3.8 mmHg',
    },
    initialConditions: {
      narrative:
        'The desorption heater in CDRA amine bed 1 burned out. Saturated sorbent cannot regenerate, collapsing CO2 scrubbing capacity to 0.00 kg/hr. 4-crew metabolic exhalation (0.16 kg/hr) is accumulating in the cabin atmosphere. In 30 minutes, ppCO2 will breach the 4.0 mmHg flight rule limit, inducing hypercapnia.',
      telemetryDeltas: {
        'CDRA Condition': '15.0% (Status: FAILED)',
        'CO2 Removal Capacity': '0.00 kg/hr (Normal: 0.26 kg/hr)',
        'Cabin ppCO2': '3.8 mmHg (Safety ceiling: 4.0 mmHg)',
        'Cognitive Risk': 'Mild headache, visual tunneling beginning',
      },
    },
    consequences: {
      unresolvedFailure:
        'Cabin ppCO2 breaches 5.5 mmHg. Crew experiences acute hypercapnia, severe throbbing headaches, disorientation, and cognitive collapse.',
      successfulMitigation:
        'Secondary CDRA amine Bed B activated, manual sorbent flush executed, CO2 scrubbing restored to 0.35 kg/hr, ppCO2 normalized to 2.4 mmHg.',
    },
    learningObjectives: [
      'Understand the physiological hazards of acute hypercapnia on astronaut decision-making.',
      'Master dual-bed solid amine desorption regeneration cycles in closed-loop ECLSS.',
      'Enforce NASA Flight Rule FR-ECLSS-01 for atmospheric scrubber failover.',
    ],
    flightRuleReferences: [
      'FR-ECLSS-01: When cabin ppCO2 >= 0.53 kPa (4.0 mmHg), activate secondary CDRA bed immediately.',
      'FR-CREW-05: Astronaut cognitive testing required if ambient CO2 exposure exceeds 4.0 mmHg for > 30 minutes.',
    ],
    availableActions: [
      {
        actionId: 'ACT-CDRA-ACTIVATE-BED-B',
        label: 'Activate Available Emergency Equipment (CDRA Bed B)',
        description: 'Actuate diverter valves to route cabin atmosphere through redundant backup amine Bed B.',
        subsystem: 'HABITAT_SYSTEMS',
        action: 'ACTIVATE_BACKUP_EQUIPMENT',
        parameters: { unitType: 'CDRA_BED_B' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 8,
          powerKw: 2.4,
          crewStressDelta: -10,
          crewWorkloadDelta: 10,
        },
        consequenceSummary: 'Restores active CO2 scrubbing to 0.35 kg/hr. Halts ppCO2 accumulation and drives cabin air back into nominal envelope.',
        mitigationEffect: 'RESTORES_CO2_SCRUBBING_BED_B',
      },
      {
        actionId: 'ACT-CDRA-PURGE-DESICCANT',
        label: 'Execute Manual Heater Reset & Bed Flush',
        description: 'Astronaut technician performs manual bypass on heater thermal cutouts and flushes desiccant bed.',
        subsystem: 'EQUIPMENT',
        action: 'START_MAINTENANCE',
        parameters: { equipmentId: 'EQ-ECLSS-CDRA-01' },
        authorizedBy: 'CREW_AUTONOMY',
        requiresEarthComms: false,
        cost: {
          timeMinutes: 15,
          powerKw: 1.0,
          crewWorkloadDelta: 20,
          crewStressDelta: 5,
        },
        consequenceSummary: 'Overhauls primary CDRA bed back to 100% condition and OPERATIONAL status.',
        mitigationEffect: 'REPAIRS_PRIMARY_CDRA',
      },
      {
        actionId: 'ACT-CDRA-GROUND-OVERRIDE',
        label: 'Request Ground Biomedical Flight Surgeon Consultation',
        description: 'Transmit crew cognitive battery and metabolic blood gas telemetry to Houston BMed for hypercapnia mitigation counsel.',
        subsystem: 'EMERGENCY',
        action: 'REQUEST_SURGEON_AIR_ANALYSIS',
        parameters: { specialist: 'FLIGHT_SURGEON' },
        authorizedBy: 'GROUND',
        requiresEarthComms: true, // Blocked when communications are offline!
        cost: {
          timeMinutes: 10,
          crewStressDelta: -15,
        },
        consequenceSummary: 'Flight Surgeon certifies crew physiological stability and provides optimized ventilation cycling steps.',
        mitigationEffect: 'GROUND_BIOMED_CONSULT',
      },
    ],
  },
];
