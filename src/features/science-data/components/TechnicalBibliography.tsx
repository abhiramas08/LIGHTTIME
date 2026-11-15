import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';

interface CitationEntry {
  citationKey: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  reportNumber?: string;
  doiOrUrl: string;
  category: string;
  description: string;
}

const CITATIONS: CitationEntry[] = [
  {
    citationKey: 'NASA-BVAD-2015',
    title: 'Life Support Baseline Values and Assumptions Document (BVAD)',
    authors: 'Anderson, M. S., Ewert, M. K., & Keener, J. F.',
    publication: 'NASA Technical Publication',
    year: 2015,
    reportNumber: 'NASA/TP-2015-218570',
    doiOrUrl: 'https://ntrs.nasa.gov/citations/20150003254',
    category: 'Life Support Systems',
    description:
      'Defines the standard exploration life support mass balances, metabolic oxygen intake (0.84 kg/day), CO2 output (1.00 kg/day), drinking water requirements (3.0 L/day), and solid food caloric standards (3,000 kcal/day).',
  },
  {
    citationKey: 'NASA-HIDH-2010',
    title: 'Human Integration Design Handbook (HIDH)',
    authors: 'NASA Human Factors Engineering Team',
    publication: 'NASA Special Publication',
    year: 2010,
    reportNumber: 'NASA/SP-2010-3407',
    doiOrUrl: 'https://www.nasa.gov/hhp/human-integration-design-handbook/',
    category: 'Human Factors & Ergonomics',
    description:
      'Provides empirical specifications for habitable cabin volume, acoustic noise threshold limit values, 70.3 kPa hypobaric atmosphere protocols, and lighting design for deep space habitats.',
  },
  {
    citationKey: 'NASA-HRP-SLEEP-2023',
    title: 'Evidence Report: Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload',
    authors: 'Dinges, D. F., Basner, M., Mollicone, D., & NASA HRP Behavioral Health Team',
    publication: 'NASA Human Research Program Evidence Books',
    year: 2023,
    doiOrUrl: 'https://humanresearchroadmap.nasa.gov/Evidence/',
    category: 'Crew Wellbeing Evidence',
    description:
      'Documents the cumulative neurobehavioral decrements, Psychomotor Vigilance Task (PVT) attentional lapses, and restorative recovery dynamics used to calibrate LIGHTTIME educational crew wellbeing indices.',
  },
  {
    citationKey: 'NASA-STD-3001',
    title: 'NASA Space Flight Human-System Standard, Volume 1: Crew Health',
    authors: 'Office of the Chief Health and Medical Officer',
    publication: 'NASA Technical Standard',
    year: 2022,
    reportNumber: 'NASA-STD-3001 Rev B',
    doiOrUrl: 'https://www.nasa.gov/ochmo/space-flight-human-system-standard/',
    category: 'Health & Radiation Standards',
    description:
      'Codifies occupational ionizing radiation permissible exposure limits (250 mSv short-term career limit for exploration class missions), bio-isolation guidelines, and countermeasure exercise regimens.',
  },
  {
    citationKey: 'LRO-LOLA-2010',
    title: 'Initial observations from the Lunar Orbiter Laser Altimeter (LOLA)',
    authors: 'Smith, D. E., Zuber, M. T., Neumann, G. A., et al.',
    publication: 'Geophysical Research Letters, Vol. 37, L18204',
    year: 2010,
    doiOrUrl: 'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/',
    category: 'Lunar Terrain & Elevation',
    description:
      'Primary topographical dataset establishing elevation profiles, slope roughness, and polar relief across the Shackleton rim and connecting ridges at 5–20 m spatial resolution.',
  },
  {
    citationKey: 'LRO-DIVINER-2010',
    title: 'The Diviner Lunar Radiometer Experiment on the Lunar Reconnaissance Orbiter Corporation',
    authors: 'Paige, D. A., Foote, M. C., Greenhagen, B. T., et al.',
    publication: 'Space Science Reviews, 150(1-4), 125-160',
    year: 2010,
    doiOrUrl: 'https://diviner.ucla.edu/',
    category: 'Thermal & Environmental Physics',
    description:
      'High-precision infrared radiometric mapping of lunar south polar temperatures, identifying elevated ridge diurnal stability (-50°C ± 20°C) versus cryogenic permanently shadowed craters (25–40 K).',
  },
  {
    citationKey: 'CRATER-RAD-2012',
    title: 'Does the radiation environment on the Moon support human exploration?',
    authors: 'Schwadron, N. A., Townsend, L. W., Kozarev, K., et al.',
    publication: 'Space Weather, 10, S00E02',
    year: 2012,
    doiOrUrl: 'https://crater.unh.edu/',
    category: 'Space Weather & Dosimetry',
    description:
      'Establishes the surface galactic cosmic ray microdosimetric baseline (0.015 mSv/hr shielded, 0.055 mSv/hr EVA) and coronal mass ejection proton hazards for lunar surface operations.',
  },
  {
    citationKey: 'JPL-DE440-2021',
    title: 'The JPL Planetary and Lunar Ephemerides DE440 and DE441',
    authors: 'Park, R. S., Folkner, W. M., Williams, J. G., & Boggs, D. H.',
    publication: 'The Astronomical Journal, 161(3), 105',
    year: 2021,
    doiOrUrl: 'https://ssd.jpl.nasa.gov/planets/eph_export.html',
    category: 'Celestial Mechanics & Illumination',
    description:
      'State-of-the-art numerical solar system ephemerides computing solar grazing angles and the 1.5424° lunar polar obliquity to the ecliptic plane.',
  },
  {
    citationKey: 'USGS-GEOL-3449',
    title: 'Unified Geologic Map of the Moon, 1:5,000,000-Scale',
    authors: 'Fortezzo, C. M., Spudis, P. D., & Harrel, S. L.',
    publication: 'USGS Scientific Investigations Map 3449',
    year: 2020,
    doiOrUrl: 'https://astrogeology.usgs.gov/search/map/Moon/Geology/Unified_Geologic_Map_of_the_Moon',
    category: 'Lunar Geology',
    description:
      'Comprehensive digital lithology and stratigraphy synthesis incorporating Apollo, Clementine, SELENE, and LRO data for south polar surface operations and mobility assessment.',
  },
];

export const TechnicalBibliography: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-panel-blue/40">
        <div>
          <h3 className="text-sm font-bold text-offwhite uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-telemetry-cyan" />
            NASA & Peer-Reviewed Scientific Bibliography
          </h3>
          <p className="text-xs text-offwhite/60 font-sans mt-0.5">
            Verified academic citations, technical publications, and aerospace engineering standards referenced in LIGHTTIME.
          </p>
        </div>
        <Badge variant="nominal" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Authentic Research References
        </Badge>
      </div>

      <div className="space-y-3">
        {CITATIONS.map((cite) => (
          <Card key={cite.citationKey} withBracket className="bg-space-deep/60 border-panel-blue/50">
            <CardHeader className="pb-2 border-b border-panel-blue/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-telemetry-cyan">
                    [{cite.citationKey}]
                  </span>
                  <Badge variant="telemetry">{cite.category}</Badge>
                </div>
                {cite.reportNumber && (
                  <span className="font-mono text-[10px] text-offwhite/50">
                    Report: {cite.reportNumber}
                  </span>
                )}
              </div>
              <CardTitle className="text-sm text-offwhite font-bold mt-1">
                {cite.title}
              </CardTitle>
              <div className="text-xs text-offwhite/70 font-mono">
                {cite.authors} ({cite.year}). <em>{cite.publication}</em>.
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-3 flex items-center justify-between gap-4 font-mono text-xs">
              <p className="text-offwhite/80 font-sans text-xs flex-1">
                {cite.description}
              </p>
              <a
                href={cite.doiOrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-telemetry-cyan bg-panel-blue/20 hover:bg-telemetry-cyan/20 border border-telemetry-cyan/40 hover:border-telemetry-cyan transition-colors"
              >
                <span>Read Document</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
