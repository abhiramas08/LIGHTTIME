import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import {
  scientificDataHub,
  ScientificEnvironmentSnapshot,
  resilientApiClient,
} from '@/services/scientific';
import {
  Activity,
  Zap,
  Radio,
  Sun,
  Mountain,
  ShieldAlert,
  Database,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const ScientificIntegrationPanel: React.FC = () => {
  const [snapshot, setSnapshot] = useState<ScientificEnvironmentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceFallback, setForceFallback] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'DONKI' | 'LOLA' | 'ILLUMINATION' | 'OSDR'>('DONKI');
  const [rateLimitInfo, setRateLimitInfo] = useState(resilientApiClient.getRateLimitStatus('NASA_DONKI'));

  const fetchFeeds = async (fallbackMode: boolean) => {
    setLoading(true);
    try {
      const data = await scientificDataHub.syncScientificData({ forceFallback: fallbackMode });
      setSnapshot(data);
      setRateLimitInfo(resilientApiClient.getRateLimitStatus('NASA_DONKI'));
    } catch (err) {
      console.error('Failed to sync scientific data feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds(forceFallback);
  }, [forceFallback]);

  const handleRefresh = () => {
    fetchFeeds(forceFallback);
  };

  return (
    <div className="space-y-6">
      {/* Top Directive Alert */}
      <Alert variant="info" title="NASA SCIENTIFIC DATA ADAPTER & SAFEGUARD ARCHITECTURE">
        External observation feeds enter LIGHTTIME strictly through isolated scientific data adapters.
        External payloads are validated, cached, rate-limited, and converted into domain-specific environmental stimuli.
        <strong> Raw external data is never permitted to overwrite canonical MissionState.</strong> Furthermore,
        solar flare classifications (electromagnetic X-rays) are <strong>never directly converted into astronaut radiation dose</strong>,
        which is driven by high-energy particulate proton flux (&gt;100 MeV).
      </Alert>

      {/* Control Header & Feed Status */}
      <Card withBracket className="bg-space-deep/80 border-panel-blue/60">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-control-navy border border-panel-blue/50">
              <Database className="h-5 w-5 text-telemetry-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-offwhite uppercase">NASA Integration Status:</span>
                {snapshot && (
                  <Badge
                    variant={
                      snapshot.syncStatus === 'ONLINE_SYNC'
                        ? 'nominal'
                        : snapshot.syncStatus === 'CACHED'
                        ? 'telemetry'
                        : 'warning'
                    }
                    pulse={snapshot.syncStatus === 'ONLINE_SYNC'}
                  >
                    {snapshot.syncStatus === 'ONLINE_SYNC'
                      ? 'Live API Connected'
                      : snapshot.syncStatus === 'CACHED'
                      ? 'Telemetry Cached'
                      : 'Offline Fallback Active'}
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-offwhite/60 mt-0.5 flex items-center gap-3 flex-wrap">
                <span>DONKI Rate Limit: {rateLimitInfo.remaining}/{rateLimitInfo.limit} queries</span>
                <span>•</span>
                <span>Retry Policy: Exponential Backoff + Jitter</span>
                <span>•</span>
                <span>TTL: 15 Minutes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={forceFallback ? 'primary' : 'outline'}
              onClick={() => setForceFallback(!forceFallback)}
              className="text-xs"
            >
              {forceFallback ? 'Using Offline Fallback' : 'Simulate Offline Mode'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Feeds</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domain Sub-Navigation */}
      <div className="flex items-center gap-1.5 border-b border-panel-blue/50 pb-2">
        <button
          type="button"
          onClick={() => setSelectedSubTab('DONKI')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            selectedSubTab === 'DONKI'
              ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
              : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-warning-amber" />
          <span>Space Weather (NASA DONKI)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('LOLA')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            selectedSubTab === 'LOLA'
              ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
              : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
          }`}
        >
          <Mountain className="h-3.5 w-3.5 text-telemetry-cyan" />
          <span>Lunar Elevation (LRO LOLA)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('ILLUMINATION')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            selectedSubTab === 'ILLUMINATION'
              ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
              : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-warning-amber" />
          <span>Solar Illumination & PSRs</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubTab('OSDR')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
            selectedSubTab === 'OSDR'
              ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan font-bold'
              : 'border-panel-blue/40 text-offwhite/60 hover:text-offwhite hover:bg-panel-blue/10'
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-nominal-green" />
          <span>Space Biology (NASA OSDR)</span>
        </button>
      </div>

      {/* SUB-TAB 1: NASA DONKI SPACE WEATHER */}
      {selectedSubTab === 'DONKI' && snapshot && (
        <div className="space-y-4">
          {/* Space Weather Synthesis Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
              <CardContent className="p-3 font-mono text-xs">
                <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">
                  Educational Hazard Score
                </span>
                <div className="text-xl font-bold text-telemetry-cyan mt-1 flex items-center gap-2">
                  <span>{snapshot.spaceWeather.educationalSpaceWeatherIndex} / 100</span>
                  <Badge variant={snapshot.spaceWeather.educationalHazardClassification === 'CRITICAL' ? 'critical' : 'nominal'}>
                    {snapshot.spaceWeather.educationalHazardClassification}
                  </Badge>
                </div>
                <span className="text-[9px] text-offwhite/50 block mt-1">
                  *Derived pedagogical index, NOT clinical medical dose.
                </span>
              </CardContent>
            </Card>

            <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
              <CardContent className="p-3 font-mono text-xs">
                <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">
                  DSN Comms Blackout Risk
                </span>
                <div className="text-xl font-bold text-warning-amber mt-1">
                  {snapshot.spaceWeather.dsnInterruptionRiskPercent.toFixed(1)}%
                </div>
                <span className="text-[9px] text-offwhite/50 block mt-1">
                  Solar X-ray ionization attenuation on Earth-Moon link.
                </span>
              </CardContent>
            </Card>

            <Card withBracket className="bg-space-deep/70 border-panel-blue/50">
              <CardContent className="p-3 font-mono text-xs">
                <span className="text-[10px] text-offwhite/50 uppercase tracking-wider block">
                  Surface EVA Operational Protocol
                </span>
                <div className="text-xs font-semibold text-offwhite mt-1 leading-tight">
                  {snapshot.spaceWeather.evaOperationalRecommendation}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4 Space Weather Event Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stream 1: Solar Flares (FLR) */}
            <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
              <CardHeader className="pb-2 border-b border-panel-blue/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-warning-amber" />
                    1. SOLAR FLARES (/DONKI/FLR)
                  </CardTitle>
                  <Badge variant="telemetry">{snapshot.spaceWeather.solarFlares.length} Ingested</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 font-mono text-xs">
                {snapshot.spaceWeather.solarFlares.map((flare) => (
                  <div key={flare.flrId} className="p-2.5 bg-control-navy/50 border border-panel-blue/40 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-telemetry-cyan font-bold">{flare.flrId}</span>
                      <Badge variant="warning">{flare.classType} Class</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-offwhite/70 pt-1">
                      <div>Peak Flux: {flare.peakXRayFluxWattsPerM2.toExponential(2)} W/m²</div>
                      <div>NOAA Blackout: {flare.radioBlackoutScale}</div>
                      <div>Begin: {flare.beginTime}</div>
                      <div>Location: {flare.sourceLocation}</div>
                    </div>
                    <div className="text-[9px] text-offwhite/50 pt-1 border-t border-panel-blue/30 italic">
                      {flare.scientificNote}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stream 2: Coronal Mass Ejections (CME) */}
            <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
              <CardHeader className="pb-2 border-b border-panel-blue/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-telemetry-cyan" />
                    2. CORONAL MASS EJECTIONS (/DONKI/CME)
                  </CardTitle>
                  <Badge variant="telemetry">{snapshot.spaceWeather.coronalMassEjections.length} Ingested</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 font-mono text-xs">
                {snapshot.spaceWeather.coronalMassEjections.map((cme) => (
                  <div key={cme.activityId} className="p-2.5 bg-control-navy/50 border border-panel-blue/40 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-telemetry-cyan font-bold">{cme.activityId}</span>
                      <Badge variant={cme.isEarthDirected ? 'critical' : 'nominal'}>
                        {cme.isEarthDirected ? 'Earth/Moon Directed' : 'Flank Trajectory'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-offwhite/70 pt-1">
                      <div>Shock Speed: {cme.speedKmPerS} km/s</div>
                      <div>Half Angle: {cme.halfAngleDeg}°</div>
                      <div>Transit Time: ~{cme.transitTimeHours} hours</div>
                      <div>Catalog Type: {cme.catalogType}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stream 3: Solar Energetic Particles (SEP) */}
            <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
              <CardHeader className="pb-2 border-b border-panel-blue/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-critical-red" />
                    3. SOLAR PARTICLE EVENTS (/DONKI/SEP)
                  </CardTitle>
                  <Badge variant="critical">{snapshot.spaceWeather.solarParticleEvents.length} Ingested</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 font-mono text-xs">
                {snapshot.spaceWeather.solarParticleEvents.map((sep) => (
                  <div key={sep.sepId} className="p-2.5 bg-control-navy/50 border border-critical-red/40 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-critical-red font-bold">{sep.sepId}</span>
                      <Badge variant="critical">{sep.radiationStormScale}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-offwhite/70 pt-1">
                      <div>Flux &gt;10 MeV: {sep.protonFlux10MevPfu} PFU</div>
                      <div>Flux &gt;100 MeV: {sep.protonFlux100MevPfu} PFU</div>
                      <div>Event Time: {sep.eventTime}</div>
                      <div>Primary Threat: High-Z Relativistic Protons</div>
                    </div>
                    <div className="text-[10px] text-critical-red/90 pt-1 border-t border-critical-red/30">
                      {sep.biologicalHazardAlert}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stream 4: Geomagnetic Storms (GST) */}
            <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
              <CardHeader className="pb-2 border-b border-panel-blue/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-telemetry-cyan" />
                    4. GEOMAGNETIC STORMS (/DONKI/GST)
                  </CardTitle>
                  <Badge variant="telemetry">{snapshot.spaceWeather.geomagneticStorms.length} Ingested</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 font-mono text-xs">
                {snapshot.spaceWeather.geomagneticStorms.map((gst) => (
                  <div key={gst.gstId} className="p-2.5 bg-control-navy/50 border border-panel-blue/40 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-telemetry-cyan font-bold">{gst.gstId}</span>
                      <Badge variant="warning">{gst.geomagneticStormScale}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-offwhite/70 pt-1">
                      <div>Peak Kp Index: {gst.maxKpIndex.toFixed(1)} / 9.0</div>
                      <div>Start Time: {gst.startTime}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LRO LOLA TOPOGRAPHY */}
      {selectedSubTab === 'LOLA' && snapshot && (
        <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
          <CardHeader className="border-b border-panel-blue/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-offwhite flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-telemetry-cyan" />
                  NASA LRO LOLA Topographical Elevation Profile: {snapshot.topography.siteName}
                </CardTitle>
                <div className="text-xs text-offwhite/60 font-mono mt-0.5">
                  Lat: {snapshot.topography.centerCoordinates.latitudeDeg}°, Lon: {snapshot.topography.centerCoordinates.longitudeDeg}° (PDS Geosciences Node Stage 4)
                </div>
              </div>
              <Badge variant="telemetry">R = 1,737.4 km Sphere</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Mean Elevation</span>
                <span className="text-base font-bold text-telemetry-cyan">+{snapshot.topography.meanElevationMeters} m</span>
              </div>
              <div className="p-2.5 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Mean Slope</span>
                <span className="text-base font-bold text-offwhite">{snapshot.topography.meanSlopeDeg}°</span>
              </div>
              <div className="p-2.5 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Max Slope</span>
                <span className="text-base font-bold text-warning-amber">{snapshot.topography.maxSlopeDeg}°</span>
              </div>
              <div className="p-2.5 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Traverse Difficulty Index</span>
                <span className="text-base font-bold text-telemetry-cyan">{snapshot.topography.educationalTraverseDifficultyIndex}/100</span>
              </div>
            </div>

            {/* Transect Points Table */}
            <div className="border border-panel-blue/40 bg-control-navy/30">
              <div className="p-2 text-[10px] text-offwhite/60 font-bold uppercase tracking-wider border-b border-panel-blue/30">
                Surface Traverse 1D Topography Transect (4.5 km Ridge Profile)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-panel-blue/40 text-[10px] text-offwhite/50">
                      <th className="p-2">Distance along Path</th>
                      <th className="p-2">Absolute Elevation</th>
                      <th className="p-2">Local Incline Grade</th>
                      <th className="p-2">Mobility Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-panel-blue/20">
                    {snapshot.topography.elevationTransect.map((pt, idx) => (
                      <tr key={idx} className="hover:bg-panel-blue/10">
                        <td className="p-2 font-mono">{pt.distanceKm.toFixed(1)} km</td>
                        <td className="p-2 font-mono text-telemetry-cyan">+{pt.elevationMeters} m</td>
                        <td className="p-2 font-mono">{pt.slopeDeg}°</td>
                        <td className="p-2">
                          {pt.slopeDeg >= 20 ? (
                            <Badge variant="critical">Steep Grade (&gt;20°)</Badge>
                          ) : pt.slopeDeg >= 12 ? (
                            <Badge variant="warning">Moderate Incline</Badge>
                          ) : (
                            <Badge variant="nominal">Nominal Mobility</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUB-TAB 3: LUNAR ILLUMINATION */}
      {selectedSubTab === 'ILLUMINATION' && snapshot && (
        <Card withBracket className="bg-space-deep/60 border-panel-blue/50">
          <CardHeader className="border-b border-panel-blue/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-offwhite flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warning-amber" />
                  LRO Multi-Year Polar Solar Illumination Atlas (708.73h Synodic Cycle)
                </CardTitle>
                <div className="text-xs text-offwhite/60 font-mono mt-0.5">
                  Candidate Site: {snapshot.illumination.siteName}
                </div>
              </div>
              <Badge variant="nominal">Mean Sunlight: {snapshot.illumination.meanIlluminationPercent}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Instantaneous Illumination</span>
                <span className="text-xl font-bold text-warning-amber mt-1 block">
                  {snapshot.illumination.currentIlluminationPercent}%
                </span>
                <span className="text-[10px] text-offwhite/60">Solar elevation: +{snapshot.illumination.currentSolarElevationDeg}°</span>
              </div>

              <div className="p-3 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Max Consecutive Shadow</span>
                <span className="text-xl font-bold text-telemetry-cyan mt-1 block">
                  {snapshot.illumination.maxConsecutiveShadowHours} Hours
                </span>
                <span className="text-[10px] text-offwhite/60">Fission reactor buffers during dip</span>
              </div>

              <div className="p-3 bg-control-navy/50 border border-panel-blue/40">
                <span className="text-[10px] text-offwhite/50 block">Permanently Shadowed Floor</span>
                <span className="text-xl font-bold text-critical-red mt-1 block">
                  38 Kelvin (-235°C)
                </span>
                <span className="text-[10px] text-offwhite/60">Volatile water ice trap (0% sun)</span>
              </div>
            </div>

            <div className="p-3 bg-control-navy/30 border border-panel-blue/30 text-[11px] text-offwhite/80 space-y-1">
              <div className="font-bold text-telemetry-cyan uppercase">Scientific Illumination Rationale:</div>
              <p className="font-sans text-xs text-offwhite/70">
                Because the Moon&apos;s rotational axis has an obliquity of only 1.54° relative to the ecliptic,
                the sun constantly skims the horizon at the south pole. Elevated massifs along the Shackleton
                rim receive sunlight for &gt;75% of the lunar year, providing continuous solar generation and
                mitigating the extreme 354-hour lunar night experienced at equatorial regions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUB-TAB 4: NASA OSDR SPACE BIOLOGY */}
      {selectedSubTab === 'OSDR' && snapshot && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-panel-blue/40">
            <div>
              <h4 className="text-xs font-bold text-offwhite uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Activity className="h-3.5 w-3.5 text-nominal-green" />
                NASA Open Science Data Repository (OSDR) / GeneLab Investigations
              </h4>
              <p className="text-[11px] text-offwhite/60 font-sans">
                Peer-reviewed transcriptomic, cellular stress, and sleep deprivation analog datasets.
              </p>
            </div>
            <Badge variant="telemetry">3 Studies Cataloged</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {snapshot.spaceBiologyStudies.map((study) => (
              <Card key={study.studyId} withBracket className="bg-space-deep/70 border-panel-blue/50 flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-2 border-b border-panel-blue/40">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-nominal-green">{study.studyId}</span>
                      <Badge variant="neutral">{study.organism.split(' ')[0]}</Badge>
                    </div>
                    <CardTitle className="text-xs text-offwhite font-bold mt-1 line-clamp-2">
                      {study.title}
                    </CardTitle>
                    <div className="text-[10px] text-offwhite/60 font-mono mt-0.5">
                      Payload: {study.missionPayload}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2 font-mono text-xs">
                    <div className="text-[10px] text-offwhite/70 font-sans">
                      {study.findingsSummary}
                    </div>
                    <div className="p-2 bg-control-navy/50 border border-panel-blue/30 text-[10px] text-telemetry-cyan">
                      <span className="font-bold block uppercase">Curriculum Takeaway:</span>
                      <span className="text-offwhite/80 font-sans">{study.educationalTakeaways[0]}</span>
                    </div>
                  </CardContent>
                </div>
                <div className="p-2.5 border-t border-panel-blue/40 bg-control-navy/30 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-offwhite/50">{study.assayType.split('&')[0]}</span>
                  <a
                    href={study.provenance.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-telemetry-cyan hover:underline"
                  >
                    <span>View OSDR</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
