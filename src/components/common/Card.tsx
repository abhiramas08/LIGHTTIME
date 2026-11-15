import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'warning' | 'critical' | 'nominal';
  withBracket?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', withBracket = false, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-control-navy/80 tech-border',
      subtle: 'bg-space-surface/90 tech-border-subtle',
      warning: 'bg-control-navy/90 tech-border-warning shadow-warning-sm',
      critical: 'bg-control-navy/90 tech-border-critical shadow-critical-sm',
      nominal: 'bg-control-navy/90 tech-border-nominal shadow-nominal-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-none text-offwhite transition-colors duration-200 backdrop-blur-sm',
          variantStyles[variant],
          withBracket && 'hud-bracket',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between border-b border-panel-blue/60 px-4 py-2.5',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-heading text-sm font-semibold tracking-wider text-offwhite uppercase flex items-center gap-2',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-offwhite/60 font-mono tracking-tight', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center border-t border-panel-blue/40 px-4 py-2 text-xs font-mono text-offwhite/70',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
