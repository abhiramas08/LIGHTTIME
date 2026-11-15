import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Button } from '@/components/common/Button';
import {
  Database,
  BookOpen,
  Scale,
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  Globe,
  Sun,
  Mountain,
  Users,
  Compass,
} from 'lucide-react';
import {
  SCIENTIFIC_DATASETS,
  SCIENCE_CATEGORIES,
  SCIENCE_ASSUMPTIONS_REGISTER,
} from '@/data/science';
import {
  ScienceDatasetCategory,
  DatasetScientificNature,
  AssumptionClassification,
} from '@/simulation/models/scienceData';
import { DatasetCard } from './components/DatasetCard';
import { AssumptionCard } from './components/AssumptionCard';
import { MeasurementVsModelMatrix } from './components/MeasurementVsModelMatrix';
import { TechnicalBibliography } from './components/TechnicalBibliography';
import { ScientificIntegrationPanel } from './components/ScientificIntegrationPanel';

export const ScienceDataView: React.FC = () => {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'DATASETS' | 'ASSUMPTIONS' | 'DEMARCATION' | 'BIBLIOGRAPHY' | 'FEEDS'>('DATASETS');

  // Datasets filtering state
  const [datasetSearch, setDatasetSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScienceDatasetCategory | 'ALL'>('ALL');
  const [selectedNature, setSelectedNature] = useState<DatasetScientificNature | 'ALL'>('ALL');

  // Assumptions filtering state
  const [assumptionSearch, setAssumptionSearch] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<AssumptionClassification | 'ALL'>('ALL');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');

  // Extract unique subsystems for filtering
  const subsystems = useMemo(() => {
    const set = new Set<string>();
    SCIENCE_ASSUMPTIONS_REGISTER.forEach((a) => set.add(a.subsystem));
    return Array.from(set).sort();
  }, []);

  // Filtered Datasets
  const filteredDatasets = useMemo(() => {
    return SCIENTIFIC_DATASETS.filter((ds) => {
      // Category filter
      if (selectedCategory !== 'ALL' && ds.category !== selectedCategory) {
        return false;
      }
      // Nature filter
      if (selectedNature !== 'ALL' && ds.nature !== selectedNature) {
        return false;
      }
      // Text search
      if (datasetSearch.trim()) {
        const query = datasetSearch.toLowerCase();
        const matchesName = ds.name.toLowerCase().includes(query);
        const matchesOrg = ds.organization.toLowerCase().includes(query);
        const matchesDesc = ds.description.toLowerCase().includes(query);
        const matchesType = ds.dataType.toLowerCase().includes(query);
        const matchesPlatform = ds.instrumentPlatform?.toLowerCase().includes(query);
        const matchesId = ds.id.toLowerCase().includes(query);
        if (!matchesName && !matchesOrg && !matchesDesc && !matchesType && !matchesPlatform && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedNature, datasetSearch]);

  // Filtered Assumptions
  const filteredAssumptions = useMemo(() => {
    return SCIENCE_ASSUMPTIONS_REGISTER.filter((asm) => {
      // Classification filter
      if (selectedClassification !== 'ALL' && asm.classification !== selectedClassification) {
        return false;
      }
      // Subsystem filter
      if (selectedSubsystem !== 'ALL' && asm.subsystem !== selectedSubsystem) {
        return false;
      }
      // Text search
      if (assumptionSearch.trim()) {
        const query = assumptionSearch.toLowerCase();
        const matchesName = asm.name.toLowerCase().includes(query);
        const matchesFormula = asm.valueOrFormula.toLowerCase().includes(query);
        const matchesExpl = asm.explanation.toLowerCase().includes(query);
        const matchesSource = asm.sourceOrRationale.toLowerCase().includes(query);
        const matchesLimits = asm.limitations.toLowerCase().includes(query);
        const matchesId = asm.id.toLowerCase().includes(query);
        if (!matchesName && !matchesFormula && !matchesExpl && !matchesSource && !matchesLimits && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [selectedClassification, selectedSubsystem, assumptionSearch]);

  const resetDatasetFilters = () => {
    setDatasetSearch('');
    setSelectedCategory('ALL');
    setSelectedNature('ALL');
  };

  const resetAssumptionFilters = () => {
    setAssumptionSearch('');
    setSelectedClassification('ALL');
    setSelectedSubsystem('ALL');
  };

  // Helper for category icons
  const getCategoryIcon = (catId: ScienceDatasetCategory) => {
    switch (catId) {
      case 'LUNAR_TERRAIN':
        return <Mountain className="h-3 w-3" />;
      case 'LUNAR_ILLUMINATION':
        return <Sun className="h-3 w-3" />;
      case 'SPACE_WEATHER':
        return <Activity className="h-3 w-3" />;
      case 'HUMAN_RESEARCH':
        return <Compass className="h-3 w-3" />;
      case 'CREW_WELLBEING':
        return <Users className="h-3 w-3" />;
      case 'ENVIRONMENTAL':
        return <Globe className="h-3 w-3" />;
      default:
        return <Database className="h-3 w-3" />;
    }
  };

  return (
    <PageContainer
      moduleCode="MOD-07"
      title="Science & Data Centre"
      description="Peer-reviewed planetary datasets, empirical NASA/ESA baselines, and the Science Assumptions Register documenting all simplified simulation equations."
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="nominal" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-nominal-green" />
            14 VERIFIED DATASETS
          </Badge>
          <Badge variant="telemetry">16 ASSUMPTION RULES</Badge>
          <Badge variant="neutral">6 SCIENTIFIC CATEGORIES</Badge>
        </div>
      }
    >
      {/* Top Statistical KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
          <CardContent className="p-3">
            <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">Authentic Datasets</span>
            <div className="text-xl font-bold text-telemetry-cyan mt-0.5">14 Datasets</div>
            <span className="text-[10px] text-offwhite/60">LRO, USGS, NOAA, ISS, JPL, JSC</span>
          </CardContent>
        </Card>

        <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
          <CardContent className="p-3">
            <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">Assumptions Register</span>
            <div className="text-xl font-bold text-nominal-green mt-0.5">16 Rules</div>
            <span className="text-[10px] text-offwhite/60">Documented formulas & limitations</span>
          </CardContent>
        </Card>

        <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
          <CardContent className="p-3">
            <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">Scientific Domains</span>
            <div className="text-xl font-bold text-offwhite mt-0.5">6 Disciplines</div>
            <span className="text-[10px] text-offwhite/60">Terrain, Solar, Weather, Human, Env</span>
          </CardContent>
        </Card>

        <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
          <CardContent className="p-3">
            <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">Model Demarcation</span>
            <div className="text-xl font-bold text-warning-amber mt-0.5">Strictly Separated</div>
            <span className="text-[10px] text-offwhite/60">SI Physics vs. Educational Indices</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs defaultValue="DATASETS" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="bg-control-navy/60 border-b border-panel-blue/60">
          <TabsTrigger value="DATASETS" badge={filteredDatasets.length}>
            <Database className="h-3.5 w-3.5" />
            <span>Scientific Datasets</span>
          </TabsTrigger>
          <TabsTrigger value="ASSUMPTIONS" badge={filteredAssumptions.length}>
            <Layers className="h-3.5 w-3.5" />
            <span>Assumptions Register</span>
          </TabsTrigger>
          <TabsTrigger value="DEMARCATION">
            <Scale className="h-3.5 w-3.5" />
            <span>Measurement vs Model Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="BIBLIOGRAPHY">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Technical Bibliography</span>
          </TabsTrigger>
          <TabsTrigger value="FEEDS">
            <Activity className="h-3.5 w-3.5 text-telemetry-cyan" />
            <span>NASA Scientific Feeds</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================== */}
        {/* TAB 1: SCIENTIFIC DATASETS REPOSITORY                                */}
        {/* ==================================================================== */}
        <TabsContent value="DATASETS" className="space-y-4">
          {/* Filter and Search Bar */}
          <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
            <CardContent className="p-3 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-offwhite/40" />
                  <input
                    type="text"
                    placeholder="Search datasets by name, platform, organization, or data type..."
                    value={datasetSearch}
                    onChange={(e) => setDatasetSearch(e.target.value)}
                    className="w-full bg-space-black/60 border border-panel-blue/50 text-offwhite text-xs pl-8 pr-3 py-1.5 placeholder:text-offwhite/30 focus:outline-none focus:border-telemetry-cyan"
                  />
                  {datasetSearch && (
                    <button
                      type="button"
                      onClick={() => setDatasetSearch('')}
                      className="absolute right-2 top-2 text-offwhite/40 hover:text-offwhite text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Nature Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-offwhite/50 uppercase tracking-wider">Provenance:</span>
                  {(['ALL', 'LIVE_OBSERVATION', 'PUBLISHED_RESEARCH', 'EDUCATIONAL_ASSUMPTION'] as const).map((nature) => (
                    <button
                      key={nature}
                      type="button"
                      onClick={() => setSelectedNature(nature)}
                      className={`px-2 py-0.5 text-[10px] uppercase font-mono border transition-colors ${
                        selectedNature === nature
                          ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
                          : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
                      }`}
                    >
                      {nature === 'ALL'
                        ? 'All'
                        : nature === 'LIVE_OBSERVATION'
                        ? 'Live Observation'
                        : nature === 'PUBLISHED_RESEARCH'
                        ? 'Published Research'
                        : 'Educational Assumption'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Mandatory Category Filter Pills */}
              <div className="space-y-1 pt-1 border-t border-panel-blue/30">
                <div className="text-[10px] text-offwhite/50 uppercase tracking-wider font-semibold">
                  Organize by Scientific Category:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                      selectedCategory === 'ALL'
                        ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
                        : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
                    }`}
                  >
                    All Categories ({SCIENTIFIC_DATASETS.length})
                  </button>

                  {SCIENCE_CATEGORIES.map((cat) => {
                    const count = SCIENTIFIC_DATASETS.filter((d) => d.category === cat.id).length;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                          isSelected
                            ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
                            : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
                        }`}
                      >
                        {getCategoryIcon(cat.id)}
                        <span>{cat.title}</span>
                        <span className="text-[9px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filter State & Reset */}
              {(datasetSearch || selectedCategory !== 'ALL' || selectedNature !== 'ALL') && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-telemetry-cyan">
                  <span>
                    Filtered view: showing {filteredDatasets.length} of {SCIENTIFIC_DATASETS.length} datasets
                  </span>
                  <button
                    type="button"
                    onClick={resetDatasetFilters}
                    className="inline-flex items-center gap-1 text-offwhite/60 hover:text-offwhite underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filters
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datasets Grid */}
          {filteredDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-panel-blue/40 bg-space-deep/40 font-mono text-xs">
              <Database className="h-8 w-8 text-offwhite/30 mx-auto mb-2" />
              <div className="text-offwhite/80 font-bold">No Datasets Match Query</div>
              <div className="text-offwhite/50 text-[11px] mt-1">
                Try clearing search terms or selecting &quot;All Categories&quot;.
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={resetDatasetFilters}
                className="mt-3 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 2: SCIENCE ASSUMPTIONS REGISTER                                  */}
        {/* ==================================================================== */}
        <TabsContent value="ASSUMPTIONS" className="space-y-4">
          {/* Assumptions Filter and Search Bar */}
          <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
            <CardContent className="p-3 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-offwhite/40" />
                  <input
                    type="text"
                    placeholder="Search assumptions by title, formula, subsystem, or NASA rationale..."
                    value={assumptionSearch}
                    onChange={(e) => setAssumptionSearch(e.target.value)}
                    className="w-full bg-space-black/60 border border-panel-blue/50 text-offwhite text-xs pl-8 pr-3 py-1.5 placeholder:text-offwhite/30 focus:outline-none focus:border-telemetry-cyan"
                  />
                  {assumptionSearch && (
                    <button
                      type="button"
                      onClick={() => setAssumptionSearch('')}
                      className="absolute right-2 top-2 text-offwhite/40 hover:text-offwhite text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Subsystem Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-offwhite/50 uppercase tracking-wider">Subsystem:</span>
                  <select
                    value={selectedSubsystem}
                    onChange={(e) => setSelectedSubsystem(e.target.value)}
                    className="bg-space-black/80 border border-panel-blue/50 text-offwhite text-xs px-2 py-1 focus:outline-none focus:border-telemetry-cyan"
                  >
                    <option value="ALL">All Subsystems</option>
                    {subsystems.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Classification Filter Buttons */}
              <div className="space-y-1 pt-1 border-t border-panel-blue/30">
                <div className="text-[10px] text-offwhite/50 uppercase tracking-wider font-semibold">
                  Distinguish Rule Classification:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedClassification('ALL')}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                      selectedClassification === 'ALL'
                        ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
                        : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
                    }`}
                  >
                    All Classifications ({SCIENCE_ASSUMPTIONS_REGISTER.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClassification('MEASURED_PHYSICAL_VALUE')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                      selectedClassification === 'MEASURED_PHYSICAL_VALUE'
                        ? 'border-nominal-green bg-nominal-green/20 text-nominal-green font-bold'
                        : 'border-panel-blue/40 text-offwhite/60 hover:text-nominal-green hover:bg-nominal-green/10'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-nominal-green" />
                    <span>Measured Physical Value</span>
                    <span className="text-[9px] opacity-75">
                      ({SCIENCE_ASSUMPTIONS_REGISTER.filter((a) => a.classification === 'MEASURED_PHYSICAL_VALUE').length})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClassification('ENGINEERING_BASELINE')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                      selectedClassification === 'ENGINEERING_BASELINE'
                        ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
                        : 'border-panel-blue/40 text-offwhite/60 hover:text-telemetry-cyan hover:bg-telemetry-cyan/10'
                    }`}
                  >
                    <Activity className="h-3 w-3 text-telemetry-cyan" />
                    <span>Engineering Baseline</span>
                    <span className="text-[9px] opacity-75">
                      ({SCIENCE_ASSUMPTIONS_REGISTER.filter((a) => a.classification === 'ENGINEERING_BASELINE').length})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClassification('EDUCATIONAL_SIMULATION_MODEL')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                      selectedClassification === 'EDUCATIONAL_SIMULATION_MODEL'
                        ? 'border-warning-amber bg-warning-amber/20 text-warning-amber font-bold'
                        : 'border-panel-blue/40 text-offwhite/60 hover:text-warning-amber hover:bg-warning-amber/10'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3 text-warning-amber" />
                    <span>Educational Simulation Model</span>
                    <span className="text-[9px] opacity-75">
                      ({SCIENCE_ASSUMPTIONS_REGISTER.filter((a) => a.classification === 'EDUCATIONAL_SIMULATION_MODEL').length})
                    </span>
                  </button>
                </div>
              </div>

              {/* Active Filter State & Reset */}
              {(assumptionSearch || selectedClassification !== 'ALL' || selectedSubsystem !== 'ALL') && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-telemetry-cyan">
                  <span>
                    Filtered view: showing {filteredAssumptions.length} of {SCIENCE_ASSUMPTIONS_REGISTER.length} assumptions
                  </span>
                  <button
                    type="button"
                    onClick={resetAssumptionFilters}
                    className="inline-flex items-center gap-1 text-offwhite/60 hover:text-offwhite underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filters
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assumptions List */}
          {filteredAssumptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssumptions.map((assumption) => (
                <AssumptionCard key={assumption.id} assumption={assumption} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-panel-blue/40 bg-space-deep/40 font-mono text-xs">
              <Layers className="h-8 w-8 text-offwhite/30 mx-auto mb-2" />
              <div className="text-offwhite/80 font-bold">No Assumptions Match Query</div>
              <div className="text-offwhite/50 text-[11px] mt-1">
                Try searching for keywords like &quot;oxygen&quot;, &quot;fatigue&quot;, &quot;reactor&quot;, or reset filters.
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={resetAssumptionFilters}
                className="mt-3 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 3: DEMARCATION MATRIX                                           */}
        {/* ==================================================================== */}
        <TabsContent value="DEMARCATION">
          <MeasurementVsModelMatrix />
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 4: TECHNICAL BIBLIOGRAPHY                                        */}
        {/* ==================================================================== */}
        <TabsContent value="BIBLIOGRAPHY">
          <TechnicalBibliography />
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 5: NASA SCIENTIFIC FEEDS & ADAPTER INTEGRATION                   */}
        {/* ==================================================================== */}
        <TabsContent value="FEEDS">
          <ScientificIntegrationPanel />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
