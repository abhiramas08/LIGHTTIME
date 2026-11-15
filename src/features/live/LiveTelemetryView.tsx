import React from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Activity, Zap, Wind } from 'lucide-react';

export const LiveTelemetryView: React.FC = () => {
  const { telemetry } = useMissionStore();

  const atmosphereData = [
    { param: 'Total Habitat Pressure', value: `${telemetry.atmosphere.totalPressureKpa} kPa`, standard: '56.5 kPa (Exploration)', status: 'nominal' },
    { param: 'ppO₂ (Oxygen Partial Pressure)', value: `${telemetry.atmosphere.ppO2Kpa} kPa`, standard: '19.3 – 22.7 kPa', status: 'nominal' },
    { param: 'ppCO₂ (Carbon Dioxide)', value: `${telemetry.atmosphere.ppCO2Kpa} kPa`, standard: '< 0.40 kPa (< 3.0 mmHg)', status: telemetry.atmosphere.ppCO2Kpa > 0.4 ? 'warning' : 'nominal' },
    { param: 'Cabin Temperature', value: `${telemetry.atmosphere.cabinTempCelsius} °C`, standard: '21.0 ± 2.0 °C', status: 'nominal' },
    { param: 'Relative Humidity', value: `${telemetry.atmosphere.relativeHumidityPercent} %`, standard: '30 – 60 %', status: 'nominal' },
    { param: 'Air Circulation Flow Rate', value: `${telemetry.atmosphere.airCirculationFlowRateM3PerMin} m³/min`, standard: '> 10.0 m³/min', status: 'nominal' },
  ];

  const powerData = [
    { param: 'Solar Array Generation', value: `${telemetry.power.solarArrayOutputKw} kW`, standard: 'Daylight Nominal', status: 'nominal' },
    { param: 'Surface Fission Power', value: `${telemetry.power.surfaceReactorOutputKw} kW`, standard: '15.0 kW Base', status: 'nominal' },
    { param: 'Total Habitat Electrical Load', value: `${telemetry.power.totalHabitatLoadKw} kW`, standard: '< 35.0 kW', status: 'nominal' },
    { param: 'Battery State of Charge', value: `${telemetry.power.batteryStateOfChargePercent} %`, standard: '> 80 % Day / > 40 % Night', status: 'nominal' },
    { param: 'Fuel Cell Backup Capacity', value: `${telemetry.power.fuelCellReservePercent} %`, standard: 'Emergency Reserve', status: 'nominal' },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-panel-blue/50 pb-3">
        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
            <Activity className="h-4 w-4 text-telemetry-cyan" />
            LIVE TELEMETRY STREAM & CALIBRATED SENSOR MATRIX
          </h2>
          <p className="text-xs text-offwhite/50">
            Real-time downlinked measurements from Habitat Core, Power Distribution Bus, and ECLSS loops.
          </p>
        </div>
        <Badge variant="nominal" pulse>
          DOWNLINK SYNC: 150 MBPS
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atmosphere Panel */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Wind className="h-4 w-4 text-telemetry-cyan" />
              ATMOSPHERIC SENSOR BUS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PARAMETER</TableHead>
                  <TableHead>VALUE</TableHead>
                  <TableHead>STANDARD</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atmosphereData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-offwhite font-medium">{row.param}</TableCell>
                    <TableCell className="text-telemetry-cyan font-bold">{row.value}</TableCell>
                    <TableCell className="text-offwhite/50">{row.standard}</TableCell>
                    <TableCell>
                      <Badge variant={row.status as any}>{row.status.toUpperCase()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Power Grid Panel */}
        <Card withBracket>
          <CardHeader>
            <CardTitle>
              <Zap className="h-4 w-4 text-telemetry-cyan" />
              ELECTRICAL POWER SUBSYSTEM (EPS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SUBSYSTEM</TableHead>
                  <TableHead>READOUT</TableHead>
                  <TableHead>RATED OPERATING RANGE</TableHead>
                  <TableHead>HEALTH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-offwhite font-medium">{row.param}</TableCell>
                    <TableCell className="text-telemetry-cyan font-bold">{row.value}</TableCell>
                    <TableCell className="text-offwhite/50">{row.standard}</TableCell>
                    <TableCell>
                      <Badge variant={row.status as any}>{row.status.toUpperCase()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
