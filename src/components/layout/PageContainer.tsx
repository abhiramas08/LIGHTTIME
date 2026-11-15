import React from 'react';
import { cn } from '@/utils/cn';

export interface PageContainerProps {
  moduleCode: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  moduleCode,
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Consistent Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-blue/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30 text-[10px] font-mono font-bold tracking-widest uppercase">
              {moduleCode}
            </span>
            <h1 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
              {title}
            </h1>
          </div>
          <p className="text-xs font-mono text-offwhite/60 max-w-3xl">
            {description}
          </p>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Module Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
};
