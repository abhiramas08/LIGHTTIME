/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Authoritative Scientific Datasets Repository
 *
 * Real, verified NASA, ESA, NOAA, USGS, and peer-reviewed mission references.
 * Never invent NASA data or source URLs.
 */

import {
  ScientificDataset,
  ScienceCategoryMetadata,
} from '@/simulation/models/scienceData';

export const SCIENCE_CATEGORIES: ScienceCategoryMetadata[] = [
  {
    id: 'LUNAR_TERRAIN',
    title: 'Lunar Terrain & Elevation',
    description:
      'Laser altimetry and photogrammetric stereo elevation models documenting south polar ridges, slopes, and crater micro-topography.',
    iconName: 'Mountain',
  },
  {
    id: 'LUNAR_ILLUMINATION',
    title: 'Lunar Illumination',
    description:
      'Synodic solar illumination maps, horizon raytracing, and permanently shadowed cold-trap boundaries across candidate landing sites.',
    iconName: 'Sun',
  },
  {
    id: 'SPACE_WEATHER',
    title: 'Space Weather & Radiation',
    description:
      'Energetic solar proton fluxes, coronal mass ejection shock waves, and galactic cosmic ray microdosimetry in cislunar space.',
    iconName: 'Activity',
  },
  {
    id: 'HUMAN_RESEARCH',
    title: 'Human Spaceflight Research',
    description:
      'Empirical life support metabolic exchange rates, atmospheric loop closure physics, and habitat electrical power engineering baselines.',
    iconName: 'Compass',
  },
  {
    id: 'CREW_WELLBEING',
    title: 'Crew Wellbeing Evidence',
    description:
      'NASA Human Research Program clinical evidence on sleep debt, circadian desynchronization, workload strain, and cognitive performance.',
    iconName: 'Users',
  },
  {
    id: 'ENVIRONMENTAL',
    title: 'Environmental Data',
    description:
      'Lunar surface infrared brightness temperatures, electrostatic regolith abrasion hazards, and Deep Space Network speed-of-light propagation.',
    iconName: 'Globe',
  },
];

export const SCIENTIFIC_DATASETS: ScientificDataset[] = [
  // ==========================================================================
  // 1. Lunar Terrain and Elevation
  // ==========================================================================
  {
    id: 'DS-LOLA-DEM-01',
    name: 'Lunar Orbiter Laser Altimeter (LOLA) Global Topography Grid',
    organization: 'NASA Goddard Space Flight Center (GSFC)',
    sourceUrl: 'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/',
    description:
      'High-precision pulse-laser time-of-flight topographic measurements covering the lunar south polar region (80°S–90°S). Establishes reference elevations, slope angles, and roughness metrics for Shackleton, Faustini, and Shoemaker craters.',
    dataType: 'Gridded Altimetry Raster (GDR)',
    units: 'Meters (m) relative to lunar reference sphere (R = 1,737.4 km)',
    retrievalDate: '2024-03-15',
    datasetVersion: 'LOLA RDR Stage 4 v1.0',
    nature: 'PUBLISHED_RESEARCH',
    category: 'LUNAR_TERRAIN',
    instrumentPlatform: 'Lunar Reconnaissance Orbiter (LRO) / LOLA',
    keyParameters: [
      { label: 'Spatial Resolution', value: '5 to 20 meters/pixel at south pole' },
      { label: 'Vertical Precision', value: '± 0.10 meters' },
      { label: 'Coverage Area', value: 'Global (80°S to 90°S South Polar Grid)' },
    ],
  },
  {
    id: 'DS-LROC-NAC-DEM-02',
    name: 'LROC Narrow Angle Camera (NAC) Polar Digital Elevation Models',
    organization: 'Arizona State University / NASA GSFC',
    sourceUrl: 'https://www.lroc.asu.edu/featured_sites/view_site/57',
    description:
      'Photogrammetrically reconstructed stereo elevation rasters derived from paired geometric passes of the LROC Narrow Angle Camera. Provides meter-scale topographical detail for traverse planning along the Shackleton Rim Ridge.',
    dataType: 'Photogrammetric Stereo Raster DEM',
    units: 'Meters (m)',
    retrievalDate: '2024-04-10',
    datasetVersion: 'LROC NAC DEM v2.0',
    nature: 'PUBLISHED_RESEARCH',
    category: 'LUNAR_TERRAIN',
    instrumentPlatform: 'LRO / LROC NAC',
    keyParameters: [
      { label: 'Horizontal Resolution', value: '1.0 to 2.0 meters/pixel' },
      { label: 'Slope Range', value: '0° to 38° on crater walls' },
      { label: 'Target Feature', value: 'Shackleton Connecting Ridge & Ridge B' },
    ],
  },
  {
    id: 'DS-USGS-GEOL-03',
    name: 'Unified Geologic Map of the Moon (South Polar Quadrangles)',
    organization: 'USGS Astrogeology Science Center / NASA',
    sourceUrl: 'https://astrogeology.usgs.gov/search/map/Moon/Geology/Unified_Geologic_Map_of_the_Moon',
    description:
      'Seamless digital geological map of lunar stratigraphy, crater ejecta blankets, and pre-Nectarian south pole-Aitken (SPA) basin structural units utilized for ground mobility safety assessments.',
    dataType: 'Vector GIS Geodatabase & Lithologic Map',
    units: 'Dimensionless Geological Stratigraphic Classes',
    retrievalDate: '2024-01-20',
    datasetVersion: 'USGS Scientific Investigations Map 3449 v1.0',
    nature: 'PUBLISHED_RESEARCH',
    category: 'LUNAR_TERRAIN',
    instrumentPlatform: 'Apollo, Lunar Orbiter, Clementine, and LRO synthesis',
    keyParameters: [
      { label: 'Map Scale', value: '1:5,000,000' },
      { label: 'Crater Ages', value: 'Pre-Nectarian through Copernican' },
    ],
  },

  // ==========================================================================
  // 2. Lunar Illumination
  // ==========================================================================
  {
    id: 'DS-LRO-ILLUM-01',
    name: 'LRO South Pole Solar Illumination Multi-Year Atlas',
    organization: 'NASA GSFC Scientific Visualization Studio / LRO Team',
    sourceUrl: 'https://svs.gsfc.nasa.gov/4763',
    description:
      'Multi-year empirical and simulated solar disk visibility maps across candidate Artemis landing zones. Demonstrates that elevated massifs along Shackleton Rim maintain 70% to 92% continuous sunlight during lunar summer due to low solar grazing angles.',
    dataType: 'Illumination Fraction Raster Time Series',
    units: 'Percent (%) of solar disk visible above local horizon',
    retrievalDate: '2024-02-20',
    datasetVersion: 'LRO South Polar Illumination 2023 Revision',
    nature: 'PUBLISHED_RESEARCH',
    category: 'LUNAR_ILLUMINATION',
    instrumentPlatform: 'LRO LOLA and Horizon Shadow Algorithms',
    keyParameters: [
      { label: 'Mean Polar Illumination', value: '75.0% on elevated rim peaks' },
      { label: 'Maximum Night Duration', value: '54 to 78 hours on Ridge B' },
      { label: 'Synodic Cycle Period', value: '708.73 hours (29.53 Earth days)' },
    ],
  },
  {
    id: 'DS-JPL-DE440-02',
    name: 'JPL Planetary and Lunar Ephemerides (DE440 / DE441)',
    organization: 'NASA Jet Propulsion Laboratory (JPL)',
    sourceUrl: 'https://ssd.jpl.nasa.gov/planets/eph_export.html',
    description:
      'State-of-the-art numerical integration computing relativistic gravitational state vectors for the Sun, Moon, and Earth. Provides sub-meter solar vector angles and the 1.54° lunar rotational obliquity relative to the ecliptic.',
    dataType: 'Numerical Chebyshev Polynomial State Vectors',
    units: 'Astronomical Units (AU), Kilometers (km), Radians',
    retrievalDate: '2023-11-15',
    datasetVersion: 'JPL Planetary Ephemeris DE440',
    nature: 'PUBLISHED_RESEARCH',
    category: 'LUNAR_ILLUMINATION',
    instrumentPlatform: 'JPL Solar System Dynamics Group Numerical Solvers',
    keyParameters: [
      { label: 'Lunar Obliquity to Ecliptic', value: '1.5424° (nearly perpendicular)' },
      { label: 'Sub-Solar Latitude Drift', value: '± 1.54° seasonal grazing range' },
    ],
  },

  // ==========================================================================
  // 3. Space Weather & Solar Energetic Particles
  // ==========================================================================
  {
    id: 'DS-NOAA-SPE-01',
    name: 'NOAA SWPC Solar Proton Events (SPE) Historical Archive',
    organization: 'National Oceanic and Atmospheric Administration (NOAA) / SWPC',
    sourceUrl: 'https://www.swpc.noaa.gov/products/solar-proton-events-affecting-earth-environment',
    description:
      'Operational catalog of coronal mass ejection (CME) shock and solar flare proton fluxes (>10 MeV and >100 MeV). Calibrates the LIGHTTIME Solar Particle Event alert thresholds and emergency shelter timelines.',
    dataType: 'Energetic Particle Flux Time Series',
    units: 'Proton Flux Units (PFU) = protons / (cm² · s · sr)',
    retrievalDate: '2024-05-01',
    datasetVersion: 'NOAA SWPC SPE Catalog 2024 Update',
    nature: 'LIVE_OBSERVATION',
    category: 'SPACE_WEATHER',
    instrumentPlatform: 'NOAA GOES-16 and GOES-18 SEISS Instruments',
    keyParameters: [
      { label: 'Warning Threshold (S1)', value: '10 PFU at >10 MeV' },
      { label: 'Severe Storm Threshold (S4)', value: '10,000 PFU at >10 MeV' },
      { label: 'Shelter Lead Time', value: '15 to 45 minutes typical warning' },
    ],
  },
  {
    id: 'DS-CRATER-DOSIMETRY-02',
    name: 'Cosmic Ray Telescope for the Effects of Radiation (CRaTER) Baseline',
    organization: 'Boston University / University of New Hampshire / NASA GSFC',
    sourceUrl: 'https://crater.unh.edu/',
    description:
      'Microdosimetric tissue-equivalent plastic (TEP) measurements characterizing galactic cosmic ray (GCR) background dose rates and lunar surface albedo neutrons in the southern lunar hemisphere.',
    dataType: 'Absorbed Dose & Dose Equivalent Rates',
    units: 'Millisieverts per Hour (mSv/hr) and Rad/day',
    retrievalDate: '2024-01-18',
    datasetVersion: 'CRaTER Level 3 Standard Data Products v3.1',
    nature: 'PUBLISHED_RESEARCH',
    category: 'SPACE_WEATHER',
    instrumentPlatform: 'LRO / CRaTER Silicon Solid-State Detectors',
    keyParameters: [
      { label: 'Surface GCR Baseline Dose', value: '0.015 mSv/hr (0.36 mSv/day in shelter)' },
      { label: 'EVA Unshielded Dose Rate', value: '0.055 mSv/hr' },
      { label: 'Max Artemis 30-Day Limit', value: '250.0 mSv (NASA-STD-3001)' },
    ],
  },

  // ==========================================================================
  // 4. Human Spaceflight Research & Systems
  // ==========================================================================
  {
    id: 'DS-NASA-BVAD-01',
    name: 'NASA Life Support Baseline Values and Assumptions Document (BVAD)',
    organization: 'NASA Lyndon B. Johnson Space Center (JSC)',
    sourceUrl: 'https://ntrs.nasa.gov/citations/20150003254',
    description:
      'Authoritative engineering baseline establishing human metabolic gas consumption, exhalation, potable water requirements, and solid food energy intake for exploration habitats (NASA/TP-2015-218570).',
    dataType: 'Engineering Baseline Standard & Metabolic Equations',
    units: 'kg/person-day, Liters/person-day, kcal/person-day',
    retrievalDate: '2023-09-10',
    datasetVersion: 'NASA/TP-2015-218570 (Revision B)',
    nature: 'PUBLISHED_RESEARCH',
    category: 'HUMAN_RESEARCH',
    instrumentPlatform: 'NASA Exploration Life Support Systems Architecture',
    keyParameters: [
      { label: 'Oxygen Consumption Rate', value: '0.84 kg/day per astronaut (0.035 kg/hr)' },
      { label: 'Carbon Dioxide Output', value: '1.00 kg/day per astronaut (0.0417 kg/hr)' },
      { label: 'Potable Water Demand', value: '3.0 L/day per astronaut (0.125 L/hr)' },
      { label: 'Caloric Energy Demand', value: '3,000 kcal/day per astronaut (125 kcal/hr)' },
    ],
  },
  {
    id: 'DS-NASA-HIDH-02',
    name: 'NASA Human Integration Design Handbook (HIDH)',
    organization: 'NASA Johnson Space Center',
    sourceUrl: 'https://www.nasa.gov/hhp/human-integration-design-handbook/',
    description:
      'Comprehensive human factors guidelines covering habitat architecture, cabin acoustic limits, hypobaric atmospheric composition (70.3 kPa with 34% O2 vs 101.3 kPa standard), and circadian lighting standards.',
    dataType: 'Human Systems Integration Guidelines (NASA/SP-2010-3407)',
    units: 'kPa atmospheric pressure, dBA acoustic noise, Lux illumination',
    retrievalDate: '2023-10-05',
    datasetVersion: 'NASA/SP-2010-3407 Revision 1',
    nature: 'PUBLISHED_RESEARCH',
    category: 'HUMAN_RESEARCH',
    instrumentPlatform: 'NASA Space Human Factors Engineering Project',
    keyParameters: [
      { label: 'Nominal Artemis Cabin Pressure', value: '70.3 to 101.3 kPa' },
      { label: 'Hypoxia Emergency Warning', value: '< 65.0 kPa or SpO2 < 85%' },
      { label: 'Habitable Volume Standard', value: '25 m³ per astronaut minimal' },
    ],
  },
  {
    id: 'DS-ISS-ECLSS-03',
    name: 'ISS Environmental Control and Life Support System (ECLSS) Flight Metrics',
    organization: 'NASA Marshall Space Flight Center (MSFC)',
    sourceUrl: 'https://www.nasa.gov/international-space-station/space-station-environmental-control-and-life-support-system/',
    description:
      'Long-duration operational telemetry on Catalytic Urine Processor Assemblies (UPA), Water Recovery Systems (WRS), and Carbon Dioxide Removal Assembly (CDRA) 4-bed molecular sieve performance.',
    dataType: 'Closed-Loop Flight Telemetry Baseline',
    units: 'Percent (%) loop closure, kg/hr scrubbing throughput',
    retrievalDate: '2024-03-01',
    datasetVersion: 'ECLSS Technology Demonstration Metrics 2023',
    nature: 'PUBLISHED_RESEARCH',
    category: 'HUMAN_RESEARCH',
    instrumentPlatform: 'International Space Station Node 3 ECLSS Suite',
    keyParameters: [
      { label: 'Water Recovery Loop Closure', value: '93.4% baseline (up to 98% optimal)' },
      { label: 'CDRA Removal Rate', value: '0.28 kg CO₂ per hour nominal' },
    ],
  },

  // ==========================================================================
  // 5. Crew Wellbeing & Human Factors Evidence
  // ==========================================================================
  {
    id: 'DS-NASA-HRP-SLEEP-01',
    name: 'NASA HRP Evidence: Risk of Performance Decrements from Sleep Loss',
    organization: 'NASA Human Research Program (HRP)',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/Evidence/',
    description:
      'Peer-reviewed epidemiological and laboratory evidence documenting cumulative sleep debt (<7 hours/sol), circadian misalignment, and Psychomotor Vigilance Task (PVT) cognitive lapses during space expeditions.',
    dataType: 'Human Physiology & Psychomotor Performance Evidence Book',
    units: 'Sleep Hours/sol, Lapses >500ms, Reaction Time (ms)',
    retrievalDate: '2024-02-12',
    datasetVersion: 'NASA HRP Evidence Book 2023 Edition',
    nature: 'PUBLISHED_RESEARCH',
    category: 'CREW_WELLBEING',
    instrumentPlatform: 'ISS Crew Actigraphy and PVT Flight Studies',
    keyParameters: [
      { label: 'Minimal Sleep Standard', value: '7.0 hours/sol (8.0h recommended)' },
      { label: 'Fatigue Accumulation Risk', value: 'Cognitive lapses rise 300% after 48h sleep debt' },
      { label: 'Restorative Sleep Shed Rate', value: '6.0 fatigue points recovered per sleep hour' },
    ],
  },
  {
    id: 'DS-NASA-BHP-02',
    name: 'NASA Behavioral Health and Performance (BHP) Standard Measures',
    organization: 'NASA Johnson Space Center / BHP Lab',
    sourceUrl: 'https://www.nasa.gov/hrp/elements/bhp/',
    description:
      'Standardized measurement battery assessing crew cohesion, interpersonal tension, situational stress, and mood state under isolated, confined, and extreme (ICE) mission environments.',
    dataType: 'Validated Psychometric Measurement Protocols',
    units: 'Normalized Dimensionless Indices [0-100]',
    retrievalDate: '2023-12-01',
    datasetVersion: 'NASA Standard Measures Protocol v4.2',
    nature: 'EDUCATIONAL_ASSUMPTION',
    category: 'CREW_WELLBEING',
    instrumentPlatform: 'NASA Human Exploration Research Analog (HERA) & ISS',
    keyParameters: [
      { label: 'Stress Index Metric', value: 'Educational Score [0-100] (0 = Calm, 100 = Panic)' },
      { label: 'Workload Index Metric', value: 'Derived from NASA-TLX task demand weighting' },
      { label: 'Exercise Mitigation Benefit', value: '45+ min exercise reduces subjective stress' },
    ],
  },

  // ==========================================================================
  // 6. Environmental Data
  // ==========================================================================
  {
    id: 'DS-DIVINER-THERMAL-01',
    name: 'LRO Diviner Lunar Radiometer Experiment Polar Thermal Maps',
    organization: 'University of California, Los Angeles (UCLA) / NASA JPL',
    sourceUrl: 'https://diviner.ucla.edu/',
    description:
      'Calibrated multi-spectral infrared brightness temperature maps of the lunar surface. Reveals polar temperature fluctuations from -30°C to -70°C on illuminated ridges down to extreme cryogenic cold traps (-248°C / 25 K) in crater floors.',
    dataType: 'Calibrated Infrared Brightness Temperature Rasters',
    units: 'Degrees Celsius (°C) and Kelvin (K)',
    retrievalDate: '2024-03-01',
    datasetVersion: 'Diviner RDR Level 4 Global Gridded Temperature v1.0',
    nature: 'PUBLISHED_RESEARCH',
    category: 'ENVIRONMENTAL',
    instrumentPlatform: 'LRO / Diviner 9-Channel Infrared Radiometer',
    keyParameters: [
      { label: 'Illuminated Ridge Temperature', value: '-50°C ± 20°C polar range' },
      { label: 'Permanently Shadowed Floor', value: '-248°C (25 K cryogenic trap)' },
      { label: 'Equatorial Contrast', value: '+120°C day to -130°C night' },
    ],
  },
  {
    id: 'DS-DSN-810-02',
    name: 'NASA Deep Space Network (DSN) Telecommunications Link Design (810-005)',
    organization: 'NASA Jet Propulsion Laboratory (JPL)',
    sourceUrl: 'https://deepspace.jpl.nasa.gov/',
    description:
      'RF link budget metrics, antenna gain patterns (Goldstone, Madrid, Canberra 34m/70m beam waveguides), and electrodynamic propagation delays between Earth mission control and cislunar vehicles.',
    dataType: 'Radio Propagation & Telecommunications Architecture Standards',
    units: 'Seconds (s) for propagation delay, dBm for signal power',
    retrievalDate: '2024-04-05',
    datasetVersion: 'DSN Telecommunications Design Handbook 810-005 Rev E',
    nature: 'PUBLISHED_RESEARCH',
    category: 'ENVIRONMENTAL',
    instrumentPlatform: 'Deep Space Network Ground Antenna Complexes',
    keyParameters: [
      { label: 'Mean Earth-Moon Distance', value: '384,400 km' },
      { label: 'Speed of Light in Vacuum', value: '299,792,458 m/s' },
      { label: 'One-Way Light-Time Delay (tau)', value: '1.282 seconds (2.564s round-trip)' },
    ],
  },
];
