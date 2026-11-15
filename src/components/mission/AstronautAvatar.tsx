/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Astronaut Avatar & Portrait Component
 *
 * Renders an aerospace-inspired astronaut helmet portrait with role-specific
 * insignia decals and operational status indicators.
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { AstronautRole, AstronautAvailability } from '@/simulation/models/missionState';

export interface AstronautAvatarProps {
  role: AstronautRole;
  callsign: string;
  availability?: AstronautAvailability;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AstronautAvatar: React.FC<AstronautAvatarProps> = ({
  role,
  callsign,
  availability = 'AVAILABLE',
  size = 'md',
  className,
}) => {
  // Role-specific visor reflection and decal accents
  const roleColors: Record<AstronautRole, { primary: string; secondary: string; visor: string }> = {
    Commander: {
      primary: '#F5A623', // Warning Amber / Gold Commander Stripe
      secondary: '#10243A',
      visor: '#43C6E8',
    },
    'Lunar Module Pilot': {
      primary: '#43C6E8', // Telemetry Cyan
      secondary: '#10243A',
      visor: '#F5A623',
    },
    'Science Specialist': {
      primary: '#45B77A', // Nominal Green
      secondary: '#10243A',
      visor: '#43C6E8',
    },
    'Medical Specialist': {
      primary: '#E05252', // Critical Red / Medical Cross
      secondary: '#10243A',
      visor: '#45B77A',
    },
  };

  const colors = roleColors[role] ?? roleColors.Commander;

  const sizeClasses = {
    sm: 'w-8 h-8 text-[9px]',
    md: 'w-12 h-12 text-[10px]',
    lg: 'w-16 h-16 text-xs',
    xl: 'w-24 h-24 text-sm',
  };

  const statusIndicatorColors: Record<AstronautAvailability, string> = {
    AVAILABLE: 'bg-nominal-green',
    ON_EVA: 'bg-telemetry-cyan animate-pulse',
    RESTING: 'bg-warning-amber',
    SLEEPING: 'bg-panel-blue',
    MEDICAL_RESTRICTED: 'bg-critical-red animate-pulse',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center select-none', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(67,198,232,0.25)]"
      >
        <title>{callsign} Avatar</title>
        {/* Outer Hexagonal Shield Ring */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          fill="#07111F"
          stroke={colors.primary}
          strokeWidth="2.5"
          opacity="0.85"
        />

        {/* Helmet Base Dome */}
        <path
          d="M 24 68 C 22 42, 32 18, 50 18 C 68 18, 78 42, 76 68 Z"
          fill="#10243A"
          stroke="#193B59"
          strokeWidth="2"
        />

        {/* Gold / Telemetry Visor Shield */}
        <path
          d="M 28 58 C 26 42, 34 26, 50 26 C 66 26, 74 42, 72 58 C 64 63, 36 63, 28 58 Z"
          fill={colors.visor}
          fillOpacity="0.4"
          stroke={colors.visor}
          strokeWidth="1.5"
        />

        {/* Visor Glare Line */}
        <path
          d="M 36 34 Q 50 30 64 34"
          stroke="#F2F4F5"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Neck Seal Ring */}
        <rect
          x="32"
          y="68"
          width="36"
          height="8"
          rx="2"
          fill="#07111F"
          stroke="#193B59"
          strokeWidth="1.5"
        />

        {/* Role Decal Symbol */}
        {role === 'Commander' && (
          <path d="M 44 80 L 50 74 L 56 80 Z" fill={colors.primary} />
        )}
        {role === 'Lunar Module Pilot' && (
          <circle cx="50" cy="78" r="3.5" fill={colors.primary} />
        )}
        {role === 'Science Specialist' && (
          <polygon points="50,74 54,82 46,82" fill={colors.primary} />
        )}
        {role === 'Medical Specialist' && (
          <path d="M 47 75 H 53 M 50 72 V 78" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>

      {/* Real-time Status Pip */}
      <span
        className={cn(
          'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-space-deep shadow-sm',
          statusIndicatorColors[availability] || 'bg-nominal-green'
        )}
        title={`Status: ${availability}`}
      />
    </div>
  );
};
