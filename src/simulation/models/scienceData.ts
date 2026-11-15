/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Science & Data Centre Models
 *
 * Types and schemas for scientific datasets, NASA bibliographic references,
 * and the Science Assumptions Register documenting all simulation rules.
 */

export type ScienceDatasetCategory =
  | 'LUNAR_TERRAIN'
  | 'LUNAR_ILLUMINATION'
  | 'SPACE_WEATHER'
  | 'HUMAN_RESEARCH'
  | 'CREW_WELLBEING'
  | 'ENVIRONMENTAL';

export type DatasetScientificNature =
  | 'LIVE_OBSERVATION'
  | 'PUBLISHED_RESEARCH'
  | 'EDUCATIONAL_ASSUMPTION';

export interface ScientificDataset {
  /** Unique dataset ID (e.g., "DS-LOLA-DEM-01") */
  id: string;
  /** Human-readable scientific dataset title */
  name: string;
  /** Principal publishing institution or research team */
  organization: string;
  /** Authoritative NASA / ESA / PDS repository URL */
  sourceUrl: string;
  /** Scientific description and mission utility */
  description: string;
  /** Technical data representation format (e.g. "Gridded Altimetry Raster", "Time-Series Flux") */
  dataType: string;
  /** Physical SI unit or dimension */
  units: string;
  /** Date when dataset was ingested or verified */
  retrievalDate: string;
  /** Official dataset version identifier */
  datasetVersion: string;
  /** Categorization of data provenance */
  nature: DatasetScientificNature;
  /** High-level science category */
  category: ScienceDatasetCategory;
  /** Mission instrument or satellite platform (e.g., "LRO LOLA", "GOES-16 SEISS") */
  instrumentPlatform?: string;
  /** Key scientific parameters or sample values */
  keyParameters?: { label: string; value: string }[];
}

export type AssumptionClassification =
  | 'MEASURED_PHYSICAL_VALUE'
  | 'ENGINEERING_BASELINE'
  | 'EDUCATIONAL_SIMULATION_MODEL';

export interface ScienceAssumption {
  /** Unique assumption ID (e.g., "ASM-O2-METABOLIC-01") */
  id: string;
  /** Clear assumption title */
  name: string;
  /** Affected habitat, crew, or environmental subsystem */
  subsystem: string;
  /** Mathematical value, equation, or solver rule */
  valueOrFormula: string;
  /** Physical unit or index scale */
  unit: string;
  /** Detailed educational explanation of the rule */
  explanation: string;
  /** Scientific paper, NASA flight rule, or technical rationale */
  sourceOrRationale: string;
  /** Known real-world physical limitations and simplifications */
  limitations: string;
  /** Scientific classification distinguishing physical measurements from educational models */
  classification: AssumptionClassification;
  /** Specific educational takeaway or pedagogical tip */
  educationalNote?: string;
}

export interface ScienceCategoryMetadata {
  id: ScienceDatasetCategory;
  title: string;
  description: string;
  iconName: string;
}
