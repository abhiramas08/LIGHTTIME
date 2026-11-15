import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/features/landing/LandingPage';
import { MissionSetupPage } from '@/features/setup/MissionSetupPage';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { LiveCrewView } from '@/features/live/LiveCrewView';
import { OperateHabitatView } from '@/features/operate/OperateHabitatView';
import { RespondEmergenciesView } from '@/features/respond/RespondEmergenciesView';
import { ConsequenceLabView } from '@/features/consequence-lab/ConsequenceLabView';
import { MissionHistoryView } from '@/features/mission-history/MissionHistoryView';
import { ScienceDataView } from '@/features/science-data/ScienceDataView';
import { SettingsView } from '@/features/settings/SettingsView';
import { MissionDebriefView } from '@/features/debrief/MissionDebriefView';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Cinematic Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* Mission Setup & Briefing Page */}
      <Route path="/setup" element={<MissionSetupPage />} />

      {/* Mission Control Shell (Persistent Sidebar & Top Navbar) */}
      <Route element={<AppLayout />}>
        {/* 1. Mission Overview */}
        <Route path="overview" element={<DashboardView />} />

        {/* 2. LIVE – Crew */}
        <Route path="live-crew" element={<LiveCrewView />} />

        {/* 3. OPERATE – Habitat */}
        <Route path="operate-habitat" element={<OperateHabitatView />} />

        {/* 4. RESPOND – Emergencies */}
        <Route path="respond-emergencies" element={<RespondEmergenciesView />} />

        {/* 5. Consequence Laboratory */}
        <Route path="consequence-lab" element={<ConsequenceLabView />} />

        {/* 6. Mission History */}
        <Route path="mission-history" element={<MissionHistoryView />} />

        {/* 7. Science & Data */}
        <Route path="science-data" element={<ScienceDataView />} />

        {/* 8. Settings */}
        <Route path="settings" element={<SettingsView />} />

        {/* 9. Mission Debrief & Learning Report */}
        <Route path="mission-debrief" element={<MissionDebriefView />} />
        <Route path="debrief" element={<MissionDebriefView />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
