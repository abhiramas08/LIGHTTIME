import React from 'react';
import { useInstructorStore } from '@/store/useInstructorStore';
import { Sparkles } from 'lucide-react';

export const AiInstructorTrigger: React.FC = () => {
  const { toggleOpen, isOpen } = useInstructorStore();

  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <button
        type="button"
        onClick={toggleOpen}
        className="group flex items-center gap-2.5 px-3.5 py-2 bg-space-darker/95 border border-telemetry-cyan/60 hover:border-telemetry-cyan text-offwhite font-mono text-xs shadow-lg hover:shadow-telemetry-sm transition-all duration-200 hud-bracket active:scale-95 backdrop-blur-md"
      >
        <div className="relative flex items-center justify-center h-6 w-6 bg-control-navy border border-telemetry-cyan text-telemetry-cyan group-hover:scale-105 transition-transform">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-nominal-green" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-[11px] text-offwhite group-hover:text-telemetry-cyan tracking-wider uppercase leading-none">
            AI Instructor
          </span>
          <span className="text-[9px] text-offwhite/50 tracking-tight leading-none mt-0.5">
            Flight Director Mentor
          </span>
        </div>
      </button>
    </div>
  );
};
