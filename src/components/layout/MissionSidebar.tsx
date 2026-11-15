import React from 'react';
import { useMissionStore, NavigationTab } from '@/store/useMissionStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Activity,
  CalendarDays,
  AlertTriangle,
  GitBranch,
  Database,
  History,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  code: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const MissionSidebar: React.FC = () => {
  const { activeTab, setActiveTab, telemetry } = useMissionStore();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Mission Overview',
      code: 'DASH',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'live',
      label: 'Live Telemetry',
      code: 'TLM',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 'operate',
      label: 'Operate Crew',
      code: 'OPS',
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      id: 'respond',
      label: 'Respond & Alerts',
      code: 'ALRT',
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: telemetry.activeAlarmsCount > 0 ? telemetry.activeAlarmsCount : undefined,
    },
    {
      id: 'consequence-lab',
      label: 'Consequence Lab',
      code: 'LAB',
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      id: 'science-data',
      label: 'Science Data',
      code: 'SCI',
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: 'mission-history',
      label: 'Mission History',
      code: 'HIST',
      icon: <History className="h-4 w-4" />,
    },
    {
      id: 'settings',
      label: 'Sim Settings',
      code: 'CONF',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="w-full md:w-56 shrink-0 border-r border-panel-blue/60 bg-space-surface/90 flex flex-col justify-between select-none">
      <div className="p-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono text-offwhite/40 uppercase tracking-widest border-b border-panel-blue/30 mb-2">
          NAVIGATION CONSOLE
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-all duration-150 border-l-2',
                isActive
                  ? 'border-telemetry-cyan bg-control-navy text-telemetry-cyan font-semibold'
                  : 'border-transparent text-offwhite/70 hover:text-offwhite hover:bg-control-navy/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn(isActive ? 'text-telemetry-cyan' : 'text-offwhite/50')}>
                  {item.icon}
                </span>
                <span className="tracking-wide uppercase text-[11px]">{item.label}</span>
              </div>

              {item.badge !== undefined ? (
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-critical-red text-offwhite">
                  {item.badge}
                </span>
              ) : (
                <span className="text-[9px] text-offwhite/30 font-mono">[{item.code}]</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lunar Mission Day Footer */}
      <div className="p-3 border-t border-panel-blue/40 bg-space-darker text-[10px] font-mono text-offwhite/50 space-y-1">
        <div className="flex justify-between">
          <span>SURFACE DSN LINK:</span>
          <span className="text-nominal-green">DSN GOLDSTONE</span>
        </div>
        <div className="flex justify-between">
          <span>SIMULATION ENGINE:</span>
          <span className="text-telemetry-cyan">ACTIVE (1.0 Hz)</span>
        </div>
      </div>
    </aside>
  );
};
