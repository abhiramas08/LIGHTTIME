/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Science Assumptions Register
 *
 * Full documentation of simplified physical equations, engineering baselines,
 * and educational human factors models used by the simulation engine.
 * Clearly distinguishes measured physical values from pedagogical educational models.
 */

import { ScienceAssumption } from '@/simulation/models/scienceData';

export const SCIENCE_ASSUMPTIONS_REGISTER: ScienceAssumption[] = [
  // ==========================================================================
  // 1. Life Support & Human Metabolic Equations
  // ==========================================================================
  {
    id: 'ASM-O2-METABOLIC-01',
    name: 'Metabolic Oxygen Consumption Rate',
    subsystem: 'ECLSS / Cabin Atmosphere',
    valueOrFormula: '0.035 kg/hour per crew member (4 crew aggregate: 0.14 kg/hr = 3.36 kg/day)',
    unit: 'Kilograms per Hour (kg/hr)',
    explanation:
      'Models respiratory oxygen uptake across the 4-astronaut expedition complement during nominal habitat operations, drawing directly from the cryogenic storage inventory.',
    sourceOrRationale:
      'NASA Life Support Baseline Values and Assumptions Document (BVAD, NASA/TP-2015-218570), Section 4.1.1 (Nominal adult metabolic intake at 2,800–3,000 kcal/day).',
    limitations:
      'Assumes a steady aggregate consumption rate across waking activities. Does not model instantaneous respiratory quotient shifts between deep REM sleep (0.025 kg/hr) and high-intensity EVA metabolic peaks (up to 0.080 kg/hr).',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Students learn how daily consumable budgets scale directly with crew headcount and expedition mission duration.',
  },
  {
    id: 'ASM-CO2-EXHALATION-02',
    name: 'Metabolic Carbon Dioxide Exhalation Rate',
    subsystem: 'ECLSS / Cabin Atmosphere',
    valueOrFormula: '0.0417 kg/hour per crew member (4 crew aggregate: 0.167 kg/hr = 4.00 kg/day)',
    unit: 'Kilograms of CO₂ per Hour (kg/hr)',
    explanation:
      'Models respiratory CO₂ accumulation within the enclosed cabin atmosphere prior to catalytic amine scrubbing.',
    sourceOrRationale:
      'NASA BVAD Section 4.1.2 (Nominal respiratory quotient RQ ≈ 0.85 yielding ~1.00 kg CO₂ per person per day).',
    limitations:
      'Assumes instantaneous and uniform gas dispersal throughout the cabin volume. Does not model spatial gas diffusion gradients or localized CO₂ micro-pocketing.',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Demonstrates the critical importance of active ventilation; without scrubbing, cabin CO₂ rapidly reaches hypercapnia thresholds within 8–12 hours.',
  },
  {
    id: 'ASM-CO2-SCRUBBING-03',
    name: 'CDRA Amine Bed Scrubbing Capacity',
    subsystem: 'ECLSS / Equipment Machinery',
    valueOrFormula: '0.28 kg CO₂/hour nominal (operating efficiency proportional to equipment condition)',
    unit: 'Kilograms of CO₂ per Hour (kg/hr)',
    explanation:
      'Thermal amine desorbing beds and 4-bed molecular sieve (CDRA) actively remove exhaled carbon dioxide, venting it or routing it to Sabatier methanation.',
    sourceOrRationale:
      'International Space Station (ISS) Node 3 CDRA operational telemetry and flight specifications.',
    limitations:
      'Simplified to continuous steady-state scrubbing rather than discrete thermal half-cycle desorb/adsorb switching phases (typically 144-minute valve cycles).',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Highlights the concept of equipment wear: mechanical degradation below 30% reduces scrubbing throughput, causing cabin air quality alarms.',
  },
  {
    id: 'ASM-H2O-METABOLIC-04',
    name: 'Potable and Hygiene Water Consumption Rate',
    subsystem: 'ECLSS / Water Recovery',
    valueOrFormula: '0.125 Liters/hour per crew member (4 crew aggregate: 0.50 L/hr = 12.0 L/day)',
    unit: 'Liters per Hour (L/hr)',
    explanation:
      'Models hydration intake, food rehydration, and essential surface hygiene usage for four astronauts.',
    sourceOrRationale:
      'NASA BVAD Table 4.2.1 Exploration Habitation Water Balance Baseline (3.0 L/person-day minimum for exploration classes).',
    limitations:
      'Aggregates drinking water, oral hygiene, and meal prep into a single uniform consumption stream without modeling discrete water dispenser draws.',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Allows students to observe the direct relationship between water consumption and water recovery loop closure.',
  },
  {
    id: 'ASM-H2O-RECOVERY-05',
    name: 'Catalytic Water Loop Closure Efficiency',
    subsystem: 'ECLSS / Water Recovery',
    valueOrFormula: '93.4% baseline recovery (0.934 recovery factor; up to 98.0% optimal)',
    unit: 'Percent (%) loop closure',
    explanation:
      'The percentage of atmospheric humidity condensate and graywater recovered into purified potable water via vapor compression distillation and catalytic oxidation.',
    sourceOrRationale:
      'NASA Marshall Space Flight Center Environmental Control and Life Support System (ECLSS) ISS Technology Demonstration Milestones (2023).',
    limitations:
      'Assumes continuous catalytic throughput. Does not model brine processing distillation assembly (BPA) maintenance cycles or filter clogging transients.',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Demonstrates that even 93.4% loop closure requires consumable water reserves for long expeditions (30–60 sols) due to unrecovered moisture losses.',
  },
  {
    id: 'ASM-FOOD-CALORIC-06',
    name: 'Food Caloric Metabolic Inventory Depletion',
    subsystem: 'Habitat Consumables / Nutrition',
    valueOrFormula: '125 kcal/hour per crew member (4 crew aggregate: 500 kcal/hr = 12,000 kcal/day)',
    unit: 'Kilocalories per Hour (kcal/hr)',
    explanation:
      'Depletes shelf-stable metabolic rations from the habitat pantry to support basal metabolic expenditure and daily countermeasure physical exercise.',
    sourceOrRationale:
      'NASA Human Integration Design Handbook (HIDH) Section 7.2 Food and Nutrition Standards (3,000 kcal/day for active lunar surface astronauts).',
    limitations:
      'Assumes fixed caloric consumption rate without simulating individual macronutrient breakdown (proteins, carbohydrates, fats) or micronutrient degradation.',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Emphasizes logistics mass: 30 days of food for 4 crew requires ~360,000 kcal (~110 kg of dehydrated rations).',
  },

  // ==========================================================================
  // 2. Electrical Power Subsystem (EPS)
  // ==========================================================================
  {
    id: 'ASM-EPS-GENERATION-07',
    name: 'Dual-Source Power Architecture (Photovoltaic + Fission Reactor)',
    subsystem: 'Electrical Power (EPS)',
    valueOrFormula: 'P_gen = P_solar_peak * (illum / 100) * health_solar + P_reactor * health_reactor (where P_solar = 45 kW, P_reactor = 15 kW)',
    unit: 'Kilowatts (kW)',
    explanation:
      'Combines dual tracking solar arrays (generating up to 45 kW during peak polar sunlight) with a base-load 15 kW Stirling fission surface micro-reactor that guarantees baseline power through night shadowing.',
    sourceOrRationale:
      'NASA Artemis Base Camp Surface Power Architecture & Kilopower / Fission Surface Power (FSP) project design baselines.',
    limitations:
      'Assumes linear degradation with mechanical equipment condition; does not model solar cell temperature coefficient penalties or individual array motor gimbal jams.',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Teaches students the engineering vulnerability of relying purely on solar power during polar shadowing periods.',
  },
  {
    id: 'ASM-EPS-DEMAND-08',
    name: 'Habitat Electrical Load & Machinery Requirements',
    subsystem: 'Electrical Power (EPS)',
    valueOrFormula: 'P_demand = P_base (18.0 kW) + Σ(P_equipment_active) ≈ 28.4 kW nominal',
    unit: 'Kilowatts (kW)',
    explanation:
      'Calculates total habitat power draw by summing avionics, life support pumps, thermal control loops, lighting, and active subsystem machinery.',
    sourceOrRationale:
      'NASA Exploration Habitat Concept of Operations & Deep Space Habitat EPS design studies.',
    limitations:
      'Equipment draws are modeled as constant lump loads rather than dynamic AC/DC waveform inrush currents or pulsed transmitter spikes.',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Enables students to practice load-shedding: turning off non-essential systems (4.5 kW) extends emergency battery life during power brownouts.',
  },
  {
    id: 'ASM-EPS-STORAGE-09',
    name: 'Regenerative Fuel Cell / Lithium-Ion Battery Storage',
    subsystem: 'Electrical Power (EPS)',
    valueOrFormula: 'Capacity: 200 kWh, Charging efficiency: 95%, Discharging efficiency: 100%',
    unit: 'Kilowatt-Hours (kWh)',
    explanation:
      'Buffers surplus solar energy during peak illumination to support habitat demands when electrical generation dips below consumption.',
    sourceOrRationale:
      'Artemis Habitation and Logistics Outpost (HALO) lithium-ion battery subsystem specifications.',
    limitations:
      'Does not simulate battery cycle-life fading, cell temperature overheating, or Depth of Discharge (DoD) degradation below 20%.',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Provides a deterministic energy reservoir allowing students to calculate reserve margin time: Remaining Hours = Battery Storage / Net Power Deficit.',
  },

  // ==========================================================================
  // 3. Environmental Physics & Communications
  // ==========================================================================
  {
    id: 'ASM-ENV-SUNLIGHT-10',
    name: 'Lunar South Polar Grazing Sunlight Model (Shackleton Rim)',
    subsystem: 'Environment / Celestial Mechanics',
    valueOrFormula: 'Illum(t) = min(100, max(0, 75.0 + 20.0 * sin(2π * (elapsedHours % 708.73) / 708.73)))',
    unit: 'Percent (%) Illumination',
    explanation:
      'Approximates continuous grazing solar illumination on elevated polar massifs along Shackleton Crater rim, cycling between 55% and 95% over the 708.73-hour synodic period.',
    sourceOrRationale:
      'LRO LOLA and LROC south pole illumination studies documenting candidate Artemis landing zones.',
    limitations:
      'Simplified sinusoidal curve; does not compute 3D raytraced terrain horizon masks or occultation by distant massifs (e.g. Malapert Mountain).',
    classification: 'ENGINEERING_BASELINE',
    educationalNote:
      'Demonstrates why the lunar south pole was selected for Artemis: elevated crater rims offer sunlight and solar power for >70% of the lunar year.',
  },
  {
    id: 'ASM-ENV-TEMP-11',
    name: 'Polar Surface Temperature Model',
    subsystem: 'Environment / Thermal Physics',
    valueOrFormula: 'T(t) = -50.0 + 20.0 * sin(2π * (elapsedHours % 708.73) / 708.73)',
    unit: 'Degrees Celsius (°C)',
    explanation:
      'Models ambient exterior surface temperature on sunlit elevated polar ridges, oscillating between -30°C and -70°C.',
    sourceOrRationale:
      'LRO Diviner Lunar Radiometer Experiment southern hemisphere thermal mapping.',
    limitations:
      'Models only the illuminated ridge environment. Does not model extreme cryogenic cold traps in permanently shadowed crater floors (-248°C / 25 K).',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Contrasts polar temperature stability (-50°C ± 20°C) with equatorial lunar swings (-130°C night to +120°C noon).',
  },
  {
    id: 'ASM-COMMS-LATENCY-12',
    name: 'Speed-of-Light Radio Propagation Delay',
    subsystem: 'Communications / Deep Space Network',
    valueOrFormula: 'τ = d / c ≈ 384,400,000 m / 299,792,458 m/s = 1.2822 seconds (one-way; 2.5644s round-trip)',
    unit: 'Seconds (s)',
    explanation:
      'The physical propagation latency of electromagnetic radio transmissions traveling through free space between Earth DSN antennas and the lunar surface.',
    sourceOrRationale:
      'Classical electrodynamics and NASA DSN 810-005 Design Handbook parameters.',
    limitations:
      'Uses mean lunar orbital semi-major axis. Does not model orbital eccentricity (perigee 363,300 km to apogee 405,500 km, ± 0.07s variation) or terrestrial ground network routing latency.',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'The foundational scientific reason for autonomous crew decision-making: in emergency anomalies, 2.56s speed-of-light delay makes real-time joystick control from Houston impossible.',
  },

  // ==========================================================================
  // 4. Human Factors & Crew Wellbeing (Educational Models)
  // ==========================================================================
  {
    id: 'ASM-CREW-FATIGUE-13',
    name: 'Educational Circadian Fatigue Accumulation Model',
    subsystem: 'Crew Wellbeing / Human Factors',
    valueOrFormula: 'Fatigue Gain = 1.2 * Δt + max(0, 7.0 - sleepHours) * 0.45 * Δt; Recovery = 6.0 * Δt during SLEEPING',
    unit: 'Educational Score [0 - 100]',
    explanation:
      'Pedagogical mathematical model translating cumulative wakefulness, sleep debt, and scheduled tasks into an intuitive fatigue score for students.',
    sourceOrRationale:
      'NASA Human Research Program (HRP) Evidence on Risk of Performance Decrements from Sleep Loss, Circadian Desynchronization, and Work Overload.',
    limitations:
      'EDUCATIONAL SIMULATION MODEL, NOT A CLINICAL MEDICAL MEASUREMENT. Simplifies complex neurobehavioral two-process sleep regulation (Borbély circadian/homeostatic equations) into a linear-differential index.',
    classification: 'EDUCATIONAL_SIMULATION_MODEL',
    educationalNote:
      'Teaches students that skimping on sleep (<7 hours/sol) triggers rapid fatigue compounding, degrading astronaut operational availability.',
  },
  {
    id: 'ASM-CREW-STRESS-14',
    name: 'Educational Situational Stress Index Model',
    subsystem: 'Crew Wellbeing / Human Factors',
    valueOrFormula: 'Stress Gain = 0.1 * Δt + emergency_penalties (up to +30/hr during alarms); Recovery = 0.8 * Δt during RESTING',
    unit: 'Educational Score [0 - 100]',
    explanation:
      'Synthesizes environmental hazards, master alarm activations, and off-nominal equipment failures into a pedagogical situational anxiety indicator.',
    sourceOrRationale:
      'NASA Behavioral Health and Performance (BHP) Lab isolated, confined, and extreme (ICE) mission evidence.',
    limitations:
      'EDUCATIONAL SIMULATION MODEL, NOT A CLINICAL DIAGNOSIS. Does not measure physiological endocrinology (salivary cortisol, alpha-amylase) or heart rate variability (HRV) power spectral density.',
    classification: 'EDUCATIONAL_SIMULATION_MODEL',
    educationalNote:
      'Helps students realize that unresolved habitat warnings create compounding psychological strain on the crew.',
  },
  {
    id: 'ASM-CREW-WORKLOAD-15',
    name: 'Educational Task Workload Index Model',
    subsystem: 'Crew Wellbeing / Human Factors',
    valueOrFormula: 'Workload = base_duty + (num_assigned_tasks * 15.0) + (EVA_active ? 40.0 : 0.0)',
    unit: 'Educational Score [0 - 100]',
    explanation:
      'Pedagogical translation of NASA Task Load Index (NASA-TLX) dimensions (mental demand, physical demand, temporal demand) into a real-time operational gauge.',
    sourceOrRationale:
      'NASA Ames Research Center Task Load Index (TLX) multi-dimensional assessment protocol.',
    limitations:
      'EDUCATIONAL SIMULATION MODEL. Assumes fixed task weightings without capturing individual cognitive differences or subjective effort ratings.',
    classification: 'EDUCATIONAL_SIMULATION_MODEL',
    educationalNote:
      'Demonstrates the danger of task over-allocation: assigning multiple experiments simultaneously during an emergency spike leads to crew exhaustion.',
  },
  {
    id: 'ASM-RAD-DOSIMETRY-16',
    name: 'Ionizing Radiation & Solar Proton Exposure Model',
    subsystem: 'Crew Health / Space Weather',
    valueOrFormula: 'Dose = Baseline (0.015 mSv/hr) + (EVA ? 0.040 : 0) + (SPE_Storm ? 0.85 : 0); 30-day max limit = 250 mSv',
    unit: 'Millisieverts (mSv)',
    explanation:
      'Calculates cumulative equivalent radiation dose absorbed by astronauts inside the shielded habitat vs. exterior surface EVA vs. coronal solar proton events.',
    sourceOrRationale:
      'LRO CRaTER tissue-equivalent plastic (TEP) measurements and NASA Space Flight Human-System Standard NASA-STD-3001 Volume 1.',
    limitations:
      'Calculates whole-body effective dose equivalent. Does not model anisotropic shielding mass geometry (habitat regolith berming) or high-Z cosmic ray nuclear fragmentation.',
    classification: 'MEASURED_PHYSICAL_VALUE',
    educationalNote:
      'Illustrates radiation physics: sheltering inside the central habitat storm shelter cuts proton exposure by over 90% during coronal mass ejections.',
  },
];
