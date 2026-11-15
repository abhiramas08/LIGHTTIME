import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/common/Button';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { METClock } from '@/components/mission/METClock';

describe('LIGHTTIME Design System Components', () => {
  it('renders technical primary button with proper classes', () => {
    render(<Button variant="primary">TRANSMIT UPLINK</Button>);
    const btn = screen.getByRole('button', { name: /TRANSMIT UPLINK/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-telemetry-cyan');
  });

  it('renders status indicator with nominal state', () => {
    render(<StatusIndicator status="nominal" label="SYSTEMS GO" />);
    expect(screen.getByText('SYSTEMS GO')).toBeInTheDocument();
  });

  it('renders technical panel card with title and content', () => {
    render(
      <Card withBracket>
        <CardHeader>
          <CardTitle>ECLSS ATMOSPHERE</CardTitle>
        </CardHeader>
        <CardContent>56.5 kPa Pressure</CardContent>
      </Card>
    );
    expect(screen.getByText('ECLSS ATMOSPHERE')).toBeInTheDocument();
    expect(screen.getByText('56.5 kPa Pressure')).toBeInTheDocument();
  });

  it('formats MET Clock correctly for Day 1', () => {
    // 14 hours, 30 min, 45 sec = 52245 seconds
    render(<METClock metSeconds={52245} missionDay={1} isRunning={true} timeWarpFactor={1} />);
    expect(screen.getByText('D01')).toBeInTheDocument();
    expect(screen.getByText('14:30:45')).toBeInTheDocument();
  });
});
