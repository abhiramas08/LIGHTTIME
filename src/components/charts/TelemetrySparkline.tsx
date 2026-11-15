import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

export interface TelemetrySparklineProps {
  data: { time: number; value: number }[];
  color?: string;
  unit?: string;
  height?: number;
}

export const TelemetrySparkline: React.FC<TelemetrySparklineProps> = ({
  data,
  color = '#43C6E8',
  height = 36,
}) => {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
