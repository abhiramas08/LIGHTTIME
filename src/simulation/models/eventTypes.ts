/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Mission Event & Alert Data Model
 *
 * Provides strongly-typed models, category definitions, and helper utilities
 * for the chronological mission event and alert system.
 */

export type NotificationCategory = 'INFORMATIONAL' | 'NOMINAL' | 'WARNING' | 'CRITICAL';

export type EventAffectedSystem =
  | 'CREW'
  | 'HABITAT'
  | 'EMERGENCY'
  | 'COMMUNICATIONS'
  | 'MISSION';

export type EventType =
  | 'THRESHOLD_BREACH'
  | 'EQUIPMENT_STATUS_CHANGE'
  | 'CREW_HEALTH_ALERT'
  | 'COMMUNICATION_LINK_EVENT'
  | 'RESOURCE_DEPLETION'
  | 'USER_DIRECTIVE'
  | 'MISSION_PHASE_CHANGE'
  | 'SYSTEM_RECOVERY'
  | 'CONTINGENCY_ALARM';

/**
 * Normalizes legacy severity keys ('INFO', 'CAUTION') to standard categories:
 * Informational, Nominal, Warning, Critical.
 */
export function normalizeSeverity(sev: string): NotificationCategory {
  const upper = sev.toUpperCase();
  if (upper === 'CRITICAL') return 'CRITICAL';
  if (upper === 'WARNING' || upper === 'CAUTION') return 'WARNING';
  if (upper === 'NOMINAL' || upper === 'SUCCESS') return 'NOMINAL';
  return 'INFORMATIONAL';
}

/**
 * Formats elapsed decimal hours into human-readable lunar mission elapsed time (MET).
 * Example: 26.5 hours -> "Day 02, 02:30:00 MET"
 */
export function formatSimulationTime(elapsedHours: number, day?: number): string {
  const calculatedDay = day ?? Math.floor(elapsedHours / 24.0) + 1;
  const dayPadded = calculatedDay.toString().padStart(2, '0');

  const totalSeconds = Math.round(elapsedHours * 3600);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `Day ${dayPadded}, ${hh}:${mm}:${ss} MET`;
}

/**
 * Maps subsystem strings to one of the 5 canonical event filter categories:
 * CREW | HABITAT | EMERGENCY | COMMUNICATIONS | MISSION
 */
export function mapCategoryToAffectedSystem(category: string): EventAffectedSystem {
  const cat = category.toUpperCase();
  if (cat.includes('CREW') || cat.includes('EVA') || cat.includes('BIOMED') || cat.includes('ASTRONAUT')) {
    return 'CREW';
  }
  if (
    cat.includes('ECLSS') ||
    cat.includes('EPS') ||
    cat.includes('POWER') ||
    cat.includes('HABITAT') ||
    cat.includes('EQUIPMENT') ||
    cat.includes('WATER') ||
    cat.includes('OXYGEN') ||
    cat.includes('CO2') ||
    cat.includes('FOOD')
  ) {
    return 'HABITAT';
  }
  if (cat.includes('EMERGENCY') || cat.includes('CONTINGENCY') || cat.includes('ALARM')) {
    return 'EMERGENCY';
  }
  if (cat.includes('COMM') || cat.includes('DSN') || cat.includes('LATENCY') || cat.includes('RF')) {
    return 'COMMUNICATIONS';
  }
  return 'MISSION';
}

/**
 * Generates pedagogical NASA flight rule explanations for events based on system and context.
 */
export function getEducationalExplanation(category: string, title: string, severity: string): string {
  const norm = normalizeSeverity(severity);
  const sys = mapCategoryToAffectedSystem(category);

  if (title.includes('Oxygen') || title.includes('O2')) {
    return 'NASA Flight Rule 4.1: Cryogenic consumables must maintain minimum 48-hour reserve margin. Rapid bleed triggers mandatory EVA abort and manifold isolation to prevent hypoxic crew impairment.';
  }
  if (title.includes('Carbon') || title.includes('CO2') || title.includes('CDRA')) {
    return 'NASA Flight Rule FR-ECLSS-01: Cabin partial pressure of CO2 must remain below 0.53 kPa (4.0 mmHg). Elevated ppCO2 triggers secondary amine bed cycling to avert hypercapnic headaches and cognitive decrement.';
  }
  if (title.includes('Power') || title.includes('Battery') || title.includes('Brownout') || title.includes('EPS')) {
    return 'NASA Flight Rule FR-EPS-01: Battery Depth of Discharge must be preserved above 20% State of Charge. Automatic load shedding disconnects non-essential auxiliary systems to protect primary life support loops.';
  }
  if (title.includes('Radiation') || title.includes('Solar') || title.includes('SPE')) {
    return 'NASA Flight Rule 9.2: Solar Particle Event alert mandates crew ingress into Core Storm Shelter within 20 minutes to limit acute ionizing radiation dose below 250 mSv career safety limits.';
  }
  if (title.includes('Communication') || title.includes('DSN') || title.includes('Carrier') || title.includes('LOS')) {
    return 'NASA Flight Rule 11.5: During Deep Space Network loss of signal, ground flight control commands are interlocked. The lunar crew must exercise local autonomous contingency protocols.';
  }
  if (sys === 'CREW') {
    return 'NASA Human Research Program (HRP): Chronic sleep restriction (< 6h) and high workload degrade astronaut situational awareness. Resistive exercise and circadian alignment mitigate physiological deconditioning.';
  }
  if (norm === 'CRITICAL') {
    return 'NASA Flight Safety Rule: Critical anomaly threatens vehicle integrity or crew survival. Immediate checklist execution required prior to expiration of physical contingency window.';
  }
  if (norm === 'WARNING') {
    return 'Flight Rule Advisory: System telemetry breached caution threshold. Corrective action recommended to prevent cascading subsystem degradation.';
  }
  return 'Nominal Flight Operations: Telemetry streams verified within standard Artemis Base Camp flight envelope.';
}
