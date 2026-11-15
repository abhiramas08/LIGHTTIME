/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Science & Data Centre Test Suite
 *
 * Verifies:
 * 1. Six mandatory scientific source categories.
 * 2. Authenticity and schema compliance of all scientific datasets (all 9 required fields).
 * 3. Verified, non-invented NASA, USGS, NOAA, and academic URLs.
 * 4. Science Assumptions Register schema and simulation rules documentation.
 * 5. Strict epistemological demarcation between measured SI physical values and educational models.
 * 6. UI views, search filters, category switching, tabs, and technical bibliography.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SCIENTIFIC_DATASETS,
  SCIENCE_CATEGORIES,
  SCIENCE_ASSUMPTIONS_REGISTER,
} from '@/data/science';
import { ScienceDataView } from '@/features/science-data/ScienceDataView';
import {
  ScienceDatasetCategory,
  DatasetScientificNature,
  AssumptionClassification,
} from '@/simulation/models/scienceData';

describe('LIGHTTIME Science and Data Centre', () => {
  // ==========================================================================
  // 1. Mandatory Scientific Categories
  // ==========================================================================
  describe('Six Mandatory Scientific Categories', () => {
    const MANDATORY_CATEGORIES: ScienceDatasetCategory[] = [
      'LUNAR_TERRAIN',
      'LUNAR_ILLUMINATION',
      'SPACE_WEATHER',
      'HUMAN_RESEARCH',
      'CREW_WELLBEING',
      'ENVIRONMENTAL',
    ];

    it('defines metadata for all 6 mandatory categories', () => {
      const categoryIds = SCIENCE_CATEGORIES.map((c) => c.id);
      MANDATORY_CATEGORIES.forEach((cat) => {
        expect(categoryIds).toContain(cat);
      });
      expect(SCIENCE_CATEGORIES.length).toBe(6);
    });

    it('ensures each mandatory category contains at least one authentic dataset', () => {
      MANDATORY_CATEGORIES.forEach((cat) => {
        const matchingDatasets = SCIENTIFIC_DATASETS.filter((d) => d.category === cat);
        expect(matchingDatasets.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==========================================================================
  // 2. Dataset Schema & Authenticity (9 Required Fields)
  // ==========================================================================
  describe('Scientific Datasets Schema Compliance', () => {
    it('contains at least 12 authentic datasets covering lunar mission science', () => {
      expect(SCIENTIFIC_DATASETS.length).toBeGreaterThanOrEqual(12);
    });

    it('verifies all 9 mandatory fields for every dataset without exception', () => {
      const validNatures: DatasetScientificNature[] = [
        'LIVE_OBSERVATION',
        'PUBLISHED_RESEARCH',
        'EDUCATIONAL_ASSUMPTION',
      ];

      SCIENTIFIC_DATASETS.forEach((ds) => {
        // 1. Dataset Name
        expect(ds.name).toBeDefined();
        expect(typeof ds.name).toBe('string');
        expect(ds.name.trim().length).toBeGreaterThan(0);

        // 2. Organization
        expect(ds.organization).toBeDefined();
        expect(typeof ds.organization).toBe('string');
        expect(ds.organization.trim().length).toBeGreaterThan(0);

        // 3. Source URL (must be valid HTTPS URL)
        expect(ds.sourceUrl).toBeDefined();
        expect(ds.sourceUrl.startsWith('https://')).toBe(true);

        // 4. Description
        expect(ds.description).toBeDefined();
        expect(typeof ds.description).toBe('string');
        expect(ds.description.length).toBeGreaterThan(20);

        // 5. Data Type
        expect(ds.dataType).toBeDefined();
        expect(typeof ds.dataType).toBe('string');
        expect(ds.dataType.trim().length).toBeGreaterThan(0);

        // 6. Units
        expect(ds.units).toBeDefined();
        expect(typeof ds.units).toBe('string');
        expect(ds.units.trim().length).toBeGreaterThan(0);

        // 7. Retrieval Date (YYYY-MM-DD)
        expect(ds.retrievalDate).toBeDefined();
        expect(/^\d{4}-\d{2}-\d{2}$/.test(ds.retrievalDate)).toBe(true);

        // 8. Dataset Version
        expect(ds.datasetVersion).toBeDefined();
        expect(typeof ds.datasetVersion).toBe('string');
        expect(ds.datasetVersion.trim().length).toBeGreaterThan(0);

        // 9. Nature (Live Observation, Published Research, or Educational Assumption)
        expect(ds.nature).toBeDefined();
        expect(validNatures).toContain(ds.nature);
      });
    });

    it('guarantees source URLs point exclusively to authoritative repositories (no placeholder domains)', () => {
      const allowedDomains = [
        'nasa.gov',
        'wustl.edu', // PDS Geosciences node
        'asu.edu', // LROC at Arizona State
        'usgs.gov', // USGS Astrogeology
        'noaa.gov', // NOAA SWPC
        'unh.edu', // CRaTER at UNH
        'ucla.edu', // Diviner at UCLA
      ];

      SCIENTIFIC_DATASETS.forEach((ds) => {
        const hasValidDomain = allowedDomains.some((domain) => ds.sourceUrl.includes(domain));
        expect(
          hasValidDomain,
          `Dataset ${ds.id} (${ds.name}) sourceUrl "${ds.sourceUrl}" must be a real NASA/institutional domain`
        ).toBe(true);
      });
    });
  });

  // ==========================================================================
  // 3. Science Assumptions Register Schema
  // ==========================================================================
  describe('Science Assumptions Register Schema', () => {
    it('contains at least 14 documented simulation rules', () => {
      expect(SCIENCE_ASSUMPTIONS_REGISTER.length).toBeGreaterThanOrEqual(14);
    });

    it('verifies all required fields for every assumption in the register', () => {
      const validClassifications: AssumptionClassification[] = [
        'MEASURED_PHYSICAL_VALUE',
        'ENGINEERING_BASELINE',
        'EDUCATIONAL_SIMULATION_MODEL',
      ];

      SCIENCE_ASSUMPTIONS_REGISTER.forEach((asm) => {
        // Assumption ID & Name
        expect(asm.id).toBeDefined();
        expect(asm.id.startsWith('ASM-')).toBe(true);
        expect(asm.name.trim().length).toBeGreaterThan(0);

        // Subsystem
        expect(asm.subsystem).toBeDefined();
        expect(asm.subsystem.trim().length).toBeGreaterThan(0);

        // Value or Formula
        expect(asm.valueOrFormula).toBeDefined();
        expect(asm.valueOrFormula.trim().length).toBeGreaterThan(0);

        // Unit
        expect(asm.unit).toBeDefined();
        expect(asm.unit.trim().length).toBeGreaterThan(0);

        // Explanation
        expect(asm.explanation).toBeDefined();
        expect(asm.explanation.length).toBeGreaterThan(15);

        // Source or Rationale
        expect(asm.sourceOrRationale).toBeDefined();
        expect(asm.sourceOrRationale.length).toBeGreaterThan(15);

        // Physical Limitations
        expect(asm.limitations).toBeDefined();
        expect(asm.limitations.length).toBeGreaterThan(15);

        // Classification
        expect(validClassifications).toContain(asm.classification);
      });
    });

    it('covers all mission critical subsystems', () => {
      const subsystems = SCIENCE_ASSUMPTIONS_REGISTER.map((a) => a.subsystem);
      const joined = subsystems.join(' ');

      expect(joined).toMatch(/ECLSS|Cabin/i);
      expect(joined).toMatch(/Water/i);
      expect(joined).toMatch(/Electrical|Power|EPS/i);
      expect(joined).toMatch(/Environment|Thermal|Celestial/i);
      expect(joined).toMatch(/Communications|Deep Space/i);
      expect(joined).toMatch(/Crew|Wellbeing|Human Factors/i);
      expect(joined).toMatch(/Radiation|Space Weather/i);
    });
  });

  // ==========================================================================
  // 4. Scientific Demarcation & Non-Clinical Labeling Standard
  // ==========================================================================
  describe('Scientific Demarcation & Non-Clinical Medical Labeling Rule', () => {
    it('strictly classifies human factors indices as EDUCATIONAL_SIMULATION_MODEL', () => {
      const educationalIndices = SCIENCE_ASSUMPTIONS_REGISTER.filter(
        (a) =>
          a.id.includes('FATIGUE') ||
          a.id.includes('STRESS') ||
          a.id.includes('WORKLOAD')
      );

      expect(educationalIndices.length).toBeGreaterThanOrEqual(3);
      educationalIndices.forEach((item) => {
        expect(item.classification).toBe('EDUCATIONAL_SIMULATION_MODEL');
        // Limitations must state it is an educational model and NOT a clinical medical diagnosis
        expect(item.limitations).toMatch(/EDUCATIONAL|NOT A CLINICAL/i);
      });
    });

    it('strictly classifies physical SI variables as MEASURED_PHYSICAL_VALUE or ENGINEERING_BASELINE', () => {
      const physicalRules = SCIENCE_ASSUMPTIONS_REGISTER.filter(
        (a) =>
          a.id.includes('O2') ||
          a.id.includes('CO2') ||
          a.id.includes('H2O') ||
          a.id.includes('LATENCY') ||
          a.id.includes('RAD')
      );

      expect(physicalRules.length).toBeGreaterThanOrEqual(4);
      physicalRules.forEach((item) => {
        expect(['MEASURED_PHYSICAL_VALUE', 'ENGINEERING_BASELINE']).toContain(item.classification);
      });
    });
  });

  // ==========================================================================
  // 5. UI Views & Integration
  // ==========================================================================
  describe('ScienceDataView UI Rendering & User Workflows', () => {
    it('renders the Science & Data Centre header with module code MOD-07', () => {
      render(<ScienceDataView />);
      expect(screen.getByText('MOD-07')).toBeInTheDocument();
      expect(screen.getByText('Science & Data Centre')).toBeInTheDocument();
      expect(screen.getByText(/14 VERIFIED DATASETS/i)).toBeInTheDocument();
    });

    it('renders all four primary navigation tabs', () => {
      render(<ScienceDataView />);
      expect(screen.getByRole('tab', { name: /Scientific Datasets/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Assumptions Register/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Measurement vs Model Matrix/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Technical Bibliography/i })).toBeInTheDocument();
    });

    it('renders dataset cards with required metadata and external links', () => {
      render(<ScienceDataView />);
      // LOLA Dataset check
      expect(screen.getByText(/Lunar Orbiter Laser Altimeter/i)).toBeInTheDocument();
      expect(screen.getByText(/NASA Goddard Space Flight Center/i)).toBeInTheDocument();

      // Check external links contain target="_blank" and rel="noopener noreferrer"
      const links = screen.getAllByRole('link', { name: /Open Repository/i });
      expect(links.length).toBeGreaterThanOrEqual(1);
      const firstLink = links[0];
      expect(firstLink).toHaveAttribute('target', '_blank');
      expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('filters datasets by category when category filter pill is clicked', () => {
      render(<ScienceDataView />);

      // Initially all datasets are shown
      expect(screen.getByText(/Lunar Orbiter Laser Altimeter/i)).toBeInTheDocument();
      expect(screen.getByText(/LRO Diviner Lunar Radiometer/i)).toBeInTheDocument();

      // Click Lunar Terrain filter
      const terrainPill = screen.getByRole('button', { name: /Lunar Terrain & Elevation/i });
      fireEvent.click(terrainPill);

      // Terrain dataset remains
      expect(screen.getByText(/Lunar Orbiter Laser Altimeter/i)).toBeInTheDocument();

      // Diviner is environmental, should not be displayed in terrain filtered view
      expect(screen.queryByText(/LRO Diviner Lunar Radiometer/i)).not.toBeInTheDocument();
    });

    it('filters datasets by text query in search bar', () => {
      render(<ScienceDataView />);

      const searchInput = screen.getByPlaceholderText(/Search datasets by name/i);
      fireEvent.change(searchInput, { target: { value: 'ephemerides' } });

      // DE440 ephemerides should match
      expect(screen.getByText(/JPL Planetary and Lunar Ephemerides/i)).toBeInTheDocument();

      // LOLA should not match
      expect(screen.queryByText(/Lunar Orbiter Laser Altimeter/i)).not.toBeInTheDocument();
    });

    it('switches to Assumptions Register tab and displays simulation formulas', () => {
      render(<ScienceDataView />);

      const assumptionsTab = screen.getByRole('tab', { name: /Assumptions Register/i });
      fireEvent.click(assumptionsTab);

      // Check formula from metabolic consumption
      expect(screen.getByText(/Metabolic Oxygen Consumption Rate/i)).toBeInTheDocument();
      expect(screen.getByText(/0.035 kg\/hour per crew member/i)).toBeInTheDocument();
      expect(screen.getByText(/Kilograms per Hour \(kg\/hr\)/i)).toBeInTheDocument();
      expect(screen.getByText(/NASA Life Support Baseline Values and Assumptions Document/i)).toBeInTheDocument();
    });

    it('filters assumptions by classification (Measured Physical Value)', () => {
      render(<ScienceDataView />);

      const assumptionsTab = screen.getByRole('tab', { name: /Assumptions Register/i });
      fireEvent.click(assumptionsTab);

      // Click "Measured Physical Value" filter button
      const measuredPill = screen.getByRole('button', { name: /Measured Physical Value/i });
      fireEvent.click(measuredPill);

      // O2 consumption is a measured physical value
      expect(screen.getByText(/Metabolic Oxygen Consumption Rate/i)).toBeInTheDocument();

      // Circadian fatigue is an educational model, should be filtered out
      expect(screen.queryByText(/Circadian Fatigue Accumulation Model/i)).not.toBeInTheDocument();
    });

    it('switches to Demarcation Matrix tab and displays non-clinical advisory', () => {
      render(<ScienceDataView />);

      const matrixTab = screen.getByRole('tab', { name: /Measurement vs Model Matrix/i });
      fireEvent.click(matrixTab);

      expect(
        screen.getByText(/SCIENTIFIC METHODOLOGY & CLINICAL NON-EQUIVALENCE DIRECTIVE/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SIMULATION METRICS DEMARCATION REGISTER/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Cabin Pressure & Partial Pressures/i)).toBeInTheDocument();
      expect(screen.getByText(/Circadian Fatigue Index/i)).toBeInTheDocument();
    });

    it('switches to Technical Bibliography tab and displays authentic NASA publications', () => {
      render(<ScienceDataView />);

      const biblioTab = screen.getByRole('tab', { name: /Technical Bibliography/i });
      fireEvent.click(biblioTab);

      expect(screen.getByText(/NASA & Peer-Reviewed Scientific Bibliography/i)).toBeInTheDocument();
      expect(screen.getByText(/\[NASA-BVAD-2015\]/i)).toBeInTheDocument();
      expect(screen.getByText(/\[NASA-HIDH-2010\]/i)).toBeInTheDocument();
      expect(screen.getByText(/\[NASA-HRP-SLEEP-2023\]/i)).toBeInTheDocument();
      expect(screen.getByText(/\[LRO-LOLA-2010\]/i)).toBeInTheDocument();
    });
  });
});
