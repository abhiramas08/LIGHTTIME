import React from 'react';
import { cn } from '@/utils/cn';

export interface MissionInsigniaProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MissionInsignia: React.FC<MissionInsigniaProps> = ({
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none',
        sizeMap[size],
        className
      )}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(67,198,232,0.3)]"
      >
        {/* Outer Circular Boundary */}
        <circle
          cx="100"
          cy="100"
          r="94"
          stroke="#43C6E8"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="opacity-70 animate-[spin_60s_linear_infinite]"
        />
        <circle
          cx="100"
          cy="100"
          r="88"
          stroke="#193B59"
          strokeWidth="3"
        />

        {/* Deep Space Backdrop */}
        <circle cx="100" cy="100" r="86" fill="#07111F" />

        {/* Concentric Coordinate Grids */}
        <circle cx="100" cy="100" r="64" stroke="#193B59" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="100" cy="100" r="42" stroke="#193B59" strokeWidth="1" opacity="0.4" />

        {/* Polar Targeting Crosshairs */}
        <line x1="100" y1="18" x2="100" y2="40" stroke="#43C6E8" strokeWidth="1.5" />
        <line x1="100" y1="160" x2="100" y2="182" stroke="#43C6E8" strokeWidth="1.5" />
        <line x1="18" y1="100" x2="40" y2="100" stroke="#43C6E8" strokeWidth="1.5" />
        <line x1="160" y1="100" x2="182" y2="100" stroke="#43C6E8" strokeWidth="1.5" />

        {/* Lunar Surface Limb & South Pole Crater Rim */}
        <path
          d="M 40 120 C 60 70, 140 70, 160 120 C 130 150, 70 150, 40 120 Z"
          fill="#10243A"
          stroke="#43C6E8"
          strokeWidth="1.5"
        />
        <ellipse cx="100" cy="115" rx="28" ry="12" fill="#0A1726" stroke="#45B77A" strokeWidth="1.5" />
        <circle cx="100" cy="115" r="3" fill="#43C6E8" className="animate-ping" />

        {/* Orbital Trajectory Vector (Earth-to-Moon Light Path) */}
        <path
          d="M 28 150 C 60 60, 140 40, 172 100"
          stroke="#F5A623"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 4 Stars representing the 4 Astronaut Crew Complement */}
        <polygon points="100,28 102,33 107,33 103,36 105,41 100,38 95,41 97,36 93,33 98,33" fill="#F2F4F5" />
        <polygon points="46,65 48,69 52,69 49,71 50,75 46,73 42,75 43,71 40,69 44,69" fill="#F2F4F5" />
        <polygon points="154,65 156,69 160,69 157,71 158,75 154,73 150,75 151,71 148,69 152,69" fill="#F2F4F5" />
        <polygon points="100,165 101,168 104,168 102,170 103,173 100,171 97,173 98,170 96,168 99,168" fill="#F2F4F5" />

        {/* Technical Text Arching inside Insignia */}
        <text x="100" y="56" fill="#43C6E8" fontSize="8" fontFamily="IBM Plex Mono" fontWeight="bold" textAnchor="middle" letterSpacing="2">
          LIGHTTIME
        </text>
        <text x="100" y="146" fill="#F2F4F5" fontSize="6.5" fontFamily="IBM Plex Mono" opacity="0.8" textAnchor="middle" letterSpacing="1.5">
          EXPEDITION 30
        </text>
      </svg>
    </div>
  );
};
