import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

describe('LIGHTTIME Landing Page & Public Sections', () => {
  it('renders Section 1: Hero with cinematic title, subtitle, custom insignia, and telemetry HUD', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Large Title and Mission Subtitle
    expect(screen.getByRole('heading', { name: 'LIGHTTIME' })).toBeInTheDocument();
    expect(screen.getAllByText(/Human-Centred Autonomous Lunar Mission Simulator/i).length).toBeGreaterThan(0);

    // Telemetry HUD Strip
    expect(screen.getByText(/89.9°S Shackleton Rim/i)).toBeInTheDocument();
    expect(screen.getByText(/1.282s \(1-Way\)/i)).toBeInTheDocument();
    expect(screen.getByText(/56.5 kPa Normoxic/i)).toBeInTheDocument();

    // Custom Insignia
    expect(screen.getAllByText('EXPEDITION 30').length).toBeGreaterThan(0);
  });

  it('renders Section 2: About LIGHTTIME', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Why Human Spaceflight Demands New Command Paradigms/i)).toBeInTheDocument();
    expect(screen.getByText(/Speed-of-Light Reality/i)).toBeInTheDocument();
    expect(screen.getByText(/Human Factors First/i)).toBeInTheDocument();
    expect(screen.getByText(/Closed-Loop Survival/i)).toBeInTheDocument();
  });

  it('renders Section 3: The Three Connected Experiences (LIVE, OPERATE, RESPOND)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/The Three Connected Experiences/i)).toBeInTheDocument();
    expect(screen.getByText(/EXP-01/i)).toBeInTheDocument();
    expect(screen.getByText(/EXP-02/i)).toBeInTheDocument();
    expect(screen.getByText(/EXP-03/i)).toBeInTheDocument();
  });

  it('renders Section 4: Mission Consequence Laboratory', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Mission Consequence Laboratory/i })).toBeInTheDocument();
    expect(screen.getByText(/BRANCHING WHAT-IF SANDBOX/i)).toBeInTheDocument();
    expect(screen.getByText(/TIMELINE FORK #14/i)).toBeInTheDocument();
  });

  it('renders Section 5: Scientific Data & Educational Assumptions', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Scientific Data & Educational Assumptions/i })).toBeInTheDocument();
    expect(screen.getByText('384,400 KM')).toBeInTheDocument();
    expect(screen.getByText('< 250 mSv')).toBeInTheDocument();
    expect(screen.getByText('56.5 kPa (8.2 psi)')).toBeInTheDocument();
    expect(screen.getByText('0.84 kg O₂/day')).toBeInTheDocument();
  });

  it('renders Section 6: How the Simulation Works', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /How the Simulation Works/i })).toBeInTheDocument();
    expect(screen.getByText(/01\. Discrete Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/02\. Latency Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/03\. Autonomous Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/04\. Reactive State/i)).toBeInTheDocument();
  });

  it('renders Section 7: Start Mission CTA banner & navigates to Mission Setup page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Assume Command of Expedition 30/i })).toBeInTheDocument();

    // Click "START MISSION" button
    const startMissionButtons = screen.getAllByRole('button', { name: /START MISSION/i });
    expect(startMissionButtons.length).toBeGreaterThan(0);
    fireEvent.click(startMissionButtons[0]!);

    // Should navigate to Mission Setup
    expect(screen.getByRole('heading', { name: /CONFIGURE 30-DAY LUNAR EXPEDITION/i })).toBeInTheDocument();
  });

  it('renders Section 8: Project Credits and Educational Disclaimer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Educational Simulation Disclaimer:/i)).toBeInTheDocument();
    expect(screen.getByText(/not an official NASA product/i)).toBeInTheDocument();
  });
});

describe('Mission Setup & Mission Control Routing', () => {
  it('renders Mission Setup page and launches to Mission Overview', () => {
    render(
      <MemoryRouter initialEntries={['/setup']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /CONFIGURE 30-DAY LUNAR EXPEDITION/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('CDR. E. VANCE')).toBeInTheDocument();
    expect(screen.getByText('02. EXPEDITION DIFFICULTY & AUTONOMY PROFILE')).toBeInTheDocument();
    expect(screen.getByText('03. ASTRONAUT CREW COMPLEMENT (4/4 CERTIFIED)')).toBeInTheDocument();

    // Open launch confirmation modal
    const launchButton = screen.getByRole('button', { name: /LAUNCH 30-DAY LUNAR EXPEDITION/i });
    fireEvent.click(launchButton);

    // Confirm launch in pre-flight dialog
    const confirmButton = screen.getByRole('button', { name: /CONFIRM & INITIATE DESCENT STAGE/i });
    fireEvent.click(confirmButton);

    // Navigates to Mission Overview
    expect(screen.getByRole('heading', { name: /Mission Overview/i })).toBeInTheDocument();
  });

  it('renders Mission Control Top Navigation Bar with telemetry and wordmark', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/EXP-30 · SHACKLETON/i)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEMS GO/i)).toBeInTheDocument();
    expect(screen.getByText('FLIGHT DIR')).toBeInTheDocument();
    expect(screen.getByText('CDR. E. VANCE')).toBeInTheDocument();
  });

  it('renders all 9 mission control routes properly', () => {
    const routes = [
      { path: '/overview', heading: /Mission Overview/i, code: 'MOD-01' },
      { path: '/live-crew', heading: /LIVE – Crew/i, code: 'MOD-02' },
      { path: '/operate-habitat', heading: /OPERATE – Habitat/i, code: 'MOD-03' },
      { path: '/respond-emergencies', heading: /RESPOND – Emergencies/i, code: 'MOD-04' },
      { path: '/consequence-lab', heading: /Consequence Laboratory/i, code: 'MOD-05' },
      { path: '/mission-history', heading: /Mission History/i, code: 'MOD-06' },
      { path: '/science-data', heading: /Science & Data/i, code: 'MOD-07' },
      { path: '/settings', heading: /Settings/i, code: 'MOD-08' },
      { path: '/mission-debrief', heading: /Mission Debrief & Learning Report/i, code: 'MOD-09' },
    ];

    for (const route of routes) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route.path]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: route.heading })).toBeInTheDocument();
      expect(screen.getByText(route.code)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders 404 page for unknown trajectory routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-lunar-sector']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/TELEMETRY VECTOR UNRESOLVED · 404 NOT FOUND/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RETURN TO MISSION OVERVIEW/i })).toBeInTheDocument();
  });

  it('toggles sidebar collapse/expand controls in mission control', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const collapseButtons = screen.getAllByRole('button', { name: /Collapse sidebar/i });
    expect(collapseButtons.length).toBeGreaterThan(0);

    fireEvent.click(collapseButtons[0]!);

    const expandButtons = screen.getAllByRole('button', { name: /Expand sidebar/i });
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu drawer in mission control', () => {
    render(
      <MemoryRouter initialEntries={['/overview']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const mobileMenuButton = screen.getByRole('button', { name: /Toggle mobile menu/i });
    expect(mobileMenuButton).toBeInTheDocument();

    fireEvent.click(mobileMenuButton);

    const closeMobileButton = screen.getByRole('button', { name: /Close mobile menu/i });
    expect(closeMobileButton).toBeInTheDocument();

    fireEvent.click(closeMobileButton);
  });
});
