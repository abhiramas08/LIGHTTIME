import React from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'warning' | 'critical';
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  variant = 'default',
  className,
}) => {
  if (!open) return null;

  const variantBorder = {
    default: 'tech-border',
    warning: 'tech-border-warning shadow-warning-sm',
    critical: 'tech-border-critical shadow-critical-sm',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-space-darker/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg bg-control-navy p-0 text-offwhite hud-bracket shadow-2xl',
          variantBorder[variant],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-blue/70 px-5 py-3.5 bg-control-muted/60">
          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-offwhite flex items-center gap-2">
              <span className="h-2 w-2 bg-telemetry-cyan inline-block" />
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs font-mono text-offwhite/60">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-offwhite/50 hover:text-telemetry-cyan transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 font-sans text-sm text-offwhite/90">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-panel-blue/50 px-5 py-3 bg-space-surface/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
