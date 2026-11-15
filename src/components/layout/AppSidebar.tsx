import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMissionStore } from '@/store/useMissionStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Users,
  Home,
  AlertTriangle,
  GitBranch,
  History,
  Database,
  Settings,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface NavRouteItem {
  path: string;
  label: string;
  code: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'critical' | 'warning' | 'nominal' | 'telemetry';
}

export interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { telemetry } = useMissionStore();

  const navItems: NavRouteItem[] = [
    {
      path: '/overview',
      label: 'Mission Overview',
      code: 'OVERVIEW',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/live-crew',
      label: 'LIVE – Crew',
      code: 'CREW',
      icon: <Users className="h-4 w-4 shrink-0" />,
      badge: '4/4',
      badgeVariant: 'telemetry',
    },
    {
      path: '/operate-habitat',
      label: 'OPERATE – Habitat',
      code: 'ECLSS',
      icon: <Home className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/respond-emergencies',
      label: 'RESPOND – Emergencies',
      code: 'ALERT',
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      badge: telemetry.activeAlarmsCount > 0 ? telemetry.activeAlarmsCount : '0',
      badgeVariant: telemetry.activeAlarmsCount > 0 ? 'critical' : 'nominal',
    },
    {
      path: '/consequence-lab',
      label: 'Consequence Laboratory',
      code: 'LAB',
      icon: <GitBranch className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/mission-history',
      label: 'Mission History',
      code: 'HIST',
      icon: <History className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/science-data',
      label: 'Science & Data',
      code: 'DATA',
      icon: <Database className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/settings',
      label: 'Settings',
      code: 'CONF',
      icon: <Settings className="h-4 w-4 shrink-0" />,
    },
    {
      path: '/mission-debrief',
      label: 'Debrief & Report',
      code: 'DEBRIEF',
      icon: <Award className="h-4 w-4 shrink-0" />,
      badge: 'REPORT',
      badgeVariant: 'telemetry',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-space-darker/80 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Responsive Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 md:static flex flex-col justify-between border-r border-panel-blue/60 bg-space-surface/95 backdrop-blur-md transition-all duration-200 select-none',
          // Desktop & Tablet
          isCollapsed ? 'md:w-16' : 'md:w-60',
          // Mobile Drawer Slide-in
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between p-3 border-b border-panel-blue/60">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-offwhite">
                MISSION CONSOLE
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 text-offwhite/50 hover:text-offwhite"
              aria-label="Close mobile menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section Header */}
          {!isCollapsed && (
            <div className="hidden md:block px-4 py-2.5 text-[10px] font-mono text-offwhite/40 uppercase tracking-widest border-b border-panel-blue/30">
              NAVIGATION BUS
            </div>
          )}

          {/* Navigation Route Links */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 font-mono text-xs transition-all duration-150 border-l-2',
                    isActive
                      ? 'border-telemetry-cyan bg-control-navy text-telemetry-cyan font-semibold shadow-telemetry-sm'
                      : 'border-transparent text-offwhite/70 hover:text-offwhite hover:bg-control-navy/50'
                  )
                }
              >
                {/* Icon */}
                <span className="group-hover:text-telemetry-cyan transition-colors">
                  {item.icon}
                </span>

                {/* Text Label & Badge (when expanded or on mobile) */}
                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate tracking-wide uppercase text-[11px]">
                      {item.label}
                    </span>

                    {item.badge !== undefined ? (
                      <span
                        className={cn(
                          'px-1.5 py-0.2 text-[9px] font-mono font-bold border',
                          item.badgeVariant === 'critical' &&
                            'bg-critical-red/20 text-critical-red border-critical-red/50 animate-pulse',
                          item.badgeVariant === 'warning' &&
                            'bg-warning-amber/20 text-warning-amber border-warning-amber/50',
                          item.badgeVariant === 'nominal' &&
                            'bg-nominal-green/20 text-nominal-green border-nominal-green/50',
                          item.badgeVariant === 'telemetry' &&
                            'bg-telemetry-cyan/15 text-telemetry-cyan border-telemetry-cyan/40'
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-[9px] text-offwhite/30 font-mono">[{item.code}]</span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Collapse Toggle (Desktop/Tablet) */}
        <div className="border-t border-panel-blue/50 p-2 bg-space-darker/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex items-center justify-center w-full py-1.5 text-offwhite/50 hover:text-telemetry-cyan hover:bg-control-navy transition-colors text-xs font-mono"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>COLLAPSE CONSOLE</span>
              </div>
            )}
          </button>

          {/* Mobile Footer Status */}
          <div className="md:hidden w-full text-[10px] font-mono text-offwhite/50 p-1 flex justify-between">
            <span>LINK: LOCKED</span>
            <span className="text-telemetry-cyan">DSN GOLDSTONE</span>
          </div>
        </div>
      </aside>
    </>
  );
};
