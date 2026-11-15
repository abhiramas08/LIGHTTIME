import { MissionState } from '@/simulation/models/missionState';

/**
 * Canonical default mission state for LIGHTTIME – Expedition 30.
 * Calibrated against NASA human spaceflight standards and scientific literature.
 */
export const DEFAULT_MISSION_STATE: MissionState = {
  // 1. Mission Information
  mission: {
    missionId: 'LT-EXP30-SHACKLETON',
    missionName: 'LIGHTTIME 30-Day Lunar Surface Expedition',
    missionDay: 1,
    elapsedHours: 14.5, // Day 1, 14h 30m elapsed
    missionDuration: 30,
    missionStatus: 'ACTIVE',
    simulationRulesVersion: '1.0.0-artemis',
  },

  // 2. Exactly four astronaut records
  crew: [
    {
      astronautId: 'CREW-01',
      name: 'Elena Vance',
      callsign: 'ARTEMIS-1',
      role: 'Commander',
      sleepHours: 7.5,
      exerciseMinutes: 60,
      nutritionScore: 94.0,
      fatigueIndex: 18.0,
      stressIndex: 22.0,
      workloadIndex: 45.0,
      availability: 'AVAILABLE',
      assignedTasks: ['TASK-HAB-SYSTEMS-CHECK', 'TASK-FLIGHT-DIRECTIVE-REVIEW'],
      biometrics: {
        heartRateBpm: 68,
        respirationRateBpm: 14,
        bloodOxygenPercent: 98.5,
        coreTemperatureCelsius: 36.8,
        bloodPressureSystolicMmHg: 118,
        bloodPressureDiastolicMmHg: 76,
        cumulativeRadiationDoseMsv: 1.25,
      },
    },
    {
      astronautId: 'CREW-02',
      name: 'Marcus Chen',
      callsign: 'EAGLE-2',
      role: 'Lunar Module Pilot',
      sleepHours: 7.0,
      exerciseMinutes: 45,
      nutritionScore: 91.0,
      fatigueIndex: 32.0,
      stressIndex: 28.0,
      workloadIndex: 75.0,
      availability: 'ON_EVA',
      assignedTasks: ['TASK-EVA-SORTIE-01', 'TASK-ROVER-PROSPECTING'],
      biometrics: {
        heartRateBpm: 94,
        respirationRateBpm: 18,
        bloodOxygenPercent: 97.2,
        coreTemperatureCelsius: 37.1,
        bloodPressureSystolicMmHg: 126,
        bloodPressureDiastolicMmHg: 82,
        cumulativeRadiationDoseMsv: 1.62,
      },
    },
    {
      astronautId: 'CREW-03',
      name: 'Dr. Sarah Okafor',
      callsign: 'GEO-3',
      role: 'Science Specialist',
      sleepHours: 8.0,
      exerciseMinutes: 60,
      nutritionScore: 96.0,
      fatigueIndex: 14.0,
      stressIndex: 16.0,
      workloadIndex: 38.0,
      availability: 'AVAILABLE',
      assignedTasks: ['TASK-ISRU-VOLATILE-ASSAY', 'TASK-CORE-SAMPLE-CATALOG'],
      biometrics: {
        heartRateBpm: 72,
        respirationRateBpm: 15,
        bloodOxygenPercent: 99.0,
        coreTemperatureCelsius: 36.7,
        bloodPressureSystolicMmHg: 115,
        bloodPressureDiastolicMmHg: 74,
        cumulativeRadiationDoseMsv: 1.10,
      },
    },
    {
      astronautId: 'CREW-04',
      name: 'Dr. David Hansen',
      callsign: 'CADUCEUS-4',
      role: 'Medical Specialist',
      sleepHours: 6.8,
      exerciseMinutes: 75,
      nutritionScore: 89.0,
      fatigueIndex: 26.0,
      stressIndex: 20.0,
      workloadIndex: 52.0,
      availability: 'AVAILABLE',
      assignedTasks: ['TASK-CREW-HEALTH-AUDIT', 'TASK-ECLSS-WATER-CULTURE-TEST'],
      biometrics: {
        heartRateBpm: 78,
        respirationRateBpm: 16,
        bloodOxygenPercent: 97.8,
        coreTemperatureCelsius: 36.9,
        bloodPressureSystolicMmHg: 122,
        bloodPressureDiastolicMmHg: 78,
        cumulativeRadiationDoseMsv: 1.34,
      },
    },
  ],

  // 3. Habitat Resources (Closed-Loop ECLSS & Power)
  habitatResources: {
    // Scientific Measurements
    oxygenInventoryKg: 285.0,
    oxygenConsumptionRateKgPerHour: 0.14, // ~3.36 kg/day for 4 crew members
    co2RemovalCapacityKgPerHour: 0.28,
    waterInventoryLiters: 1140.0,
    waterRecoveryRatePercent: 93.4,
    foodInventoryKcal: 342000.0,
    foodConsumptionKcalPerHour: 480.0, // ~11,520 kcal/day for 4 crew
    powerGenerationKw: 57.6, // 42.6 kW solar + 15 kW surface reactor
    batteryStorageKwh: 193.0,
    batteryStateOfChargePercent: 96.5,
    powerDemandKw: 28.4,
    // Educational Indices
    resourceSecurityIndex: 96.0,
    eclssEfficiencyScore: 94.5,
  },

  // 4. Equipment Records
  equipment: [
    {
      equipmentId: 'EQ-ECLSS-CDRA-01',
      equipmentName: 'Carbon Dioxide Removal Assembly (Amine Bed A/B)',
      condition: 92.0,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 2.4,
    },
    {
      equipmentId: 'EQ-ECLSS-WRS-01',
      equipmentName: 'Catalytic Water Reclamation Loop & Urine Distiller',
      condition: 95.5,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 3.2,
    },
    {
      equipmentId: 'EQ-EPS-SOLAR-01',
      equipmentName: 'Photovoltaic Tracking Solar Array Complex (45 kW Rated)',
      condition: 98.0,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 0.4,
    },
    {
      equipmentId: 'EQ-EPS-REACTOR-01',
      equipmentName: 'Surface Fission Stirling Micro-Reactor (15 kW Baseline)',
      condition: 99.5,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 0.8,
    },
    {
      equipmentId: 'EQ-HAB-AIRLOCK-01',
      equipmentName: 'Suitlock Ingress/Egress Depressurization Pump',
      condition: 91.0,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 4.8,
    },
    {
      equipmentId: 'EQ-COMMS-HGA-01',
      equipmentName: 'S-Band Steerable High-Gain Deep Space Antenna',
      condition: 97.0,
      status: 'OPERATIONAL',
      maintenanceRequired: false,
      powerRequirementKw: 1.2,
    },
  ],

  // 5. Lunar Surface Environment
  environment: {
    lunarIlluminationPercent: 92.0,
    environmentalTemperatureCelsius: -42.5,
    educationalRadiationHazardIndex: 18.0,
    terrainInformation: {
      siteName: 'Shackleton Crater Rim - Ridge B',
      latitudeDeg: -89.9,
      longitudeDeg: 0.0,
      elevationMeters: 1240.0,
      slopeDeg: 4.5,
      dustRisk: 'MODERATE',
    },
    solarPowerAvailabilityPercent: 95.0,
  },

  // 6. Communications & Light-Time Latency
  communications: {
    status: 'CONNECTED',
    delaySeconds: 1.282,
    availabilityPercent: 99.8,
    dsnStation: 'Goldstone',
  },

  // 7. Emergency & Contingency State
  emergency: {
    activeScenario: null,
    severity: 'NONE',
    remainingResponseTimeSeconds: null,
    responseActions: [],
  },

  // 8. Mission Records & Black-Box Audit Trail
  records: {
    eventHistory: [
      {
        eventId: 'EVT-001',
        timestampHours: 0.0,
        category: 'TRAJECTORY',
        title: 'Lunar Surface Touchdown Verified',
        details: 'Descent stage engine shutdown confirmed at Shackleton Crater Rim.',
        severity: 'INFO',
      },
      {
        eventId: 'EVT-002',
        timestampHours: 2.5,
        category: 'HABITAT',
        title: 'Habitat Core Hatch Seal & Pressurization Complete',
        details: 'Cabin total pressure reached 56.5 kPa nominal exploration standard.',
        severity: 'INFO',
      },
      {
        eventId: 'EVT-003',
        timestampHours: 6.0,
        category: 'POWER',
        title: 'Solar Tracking Array Bus Online',
        details: 'Full 57.6 kW electrical bus established. Battery charging active.',
        severity: 'INFO',
      },
      {
        eventId: 'EVT-004',
        timestampHours: 12.0,
        category: 'EVA',
        title: 'EVA-01 Commenced by LMP Chen',
        details: 'Surface rover ingress verified for geologic regolith prospecting.',
        severity: 'INFO',
      },
    ],
    actionHistory: [
      {
        actionId: 'ACT-001',
        timestampHours: 2.0,
        command: 'PRESSURIZE_CABIN_VOLUME',
        subsystem: 'ECLSS',
        initiatedBy: 'GROUND',
        outcome: 'SUCCESS',
      },
      {
        actionId: 'ACT-002',
        timestampHours: 5.5,
        command: 'DEPLOY_SOLAR_ARRAY_A',
        subsystem: 'POWER_GRID',
        initiatedBy: 'GROUND',
        outcome: 'SUCCESS',
      },
      {
        actionId: 'ACT-003',
        timestampHours: 11.5,
        command: 'AUTHORIZE_EVA_SORTIE',
        subsystem: 'EVA_CONTROL',
        initiatedBy: 'GROUND',
        outcome: 'SUCCESS',
      },
    ],
    resourceHistory: [
      { timestampHours: 0.0, oxygenKg: 290.0, waterLiters: 1150.0, batteryKwh: 180.0, powerKw: 55.0, foodKcal: 360000.0 },
      { timestampHours: 4.0, oxygenKg: 288.5, waterLiters: 1147.0, batteryKwh: 185.0, powerKw: 56.2, foodKcal: 358000.0 },
      { timestampHours: 8.0, oxygenKg: 287.0, waterLiters: 1144.5, batteryKwh: 190.0, powerKw: 57.0, foodKcal: 356000.0 },
      { timestampHours: 12.0, oxygenKg: 285.8, waterLiters: 1141.5, batteryKwh: 192.5, powerKw: 57.5, foodKcal: 354000.0 },
      { timestampHours: 14.5, oxygenKg: 285.0, waterLiters: 1140.0, batteryKwh: 193.0, powerKw: 57.6, foodKcal: 352800.0 },
    ],
    crewWellbeingHistory: [
      { timestampHours: 0.0, astronautId: 'CREW-01', fatigueIndex: 12.0, stressIndex: 25.0, workloadIndex: 30.0 },
      { timestampHours: 0.0, astronautId: 'CREW-02', fatigueIndex: 15.0, stressIndex: 22.0, workloadIndex: 35.0 },
      { timestampHours: 14.5, astronautId: 'CREW-01', fatigueIndex: 18.0, stressIndex: 22.0, workloadIndex: 45.0 },
      { timestampHours: 14.5, astronautId: 'CREW-02', fatigueIndex: 32.0, stressIndex: 28.0, workloadIndex: 75.0 },
    ],
  },
};
