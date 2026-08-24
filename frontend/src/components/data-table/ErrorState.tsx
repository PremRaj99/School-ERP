import React from 'react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  /** Usually `error.message` from a failed React Query — falls back to a generic line. */
  description?: string;
  onRetry?: () => void;
  className?: string;
  size?: number | string;
}

/**
 * Calm, matter-of-fact connection interruption illustration:
 * - Device/monitor in lower-left
 * - Cloud outline in upper-right
 * - Interrupted dotted line between them (with a visible gap)
 * - Semantic red (#dc2626 / #f87171)
 */
export const ErrorConnectionIllustration: React.FC<
  React.ImgHTMLAttributes<HTMLImageElement> & { size?: number | string }
> = ({
  size = 64,
  className,
  alt = 'Interrupted network connection illustration',
  style,
  ...props
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src="/error-connection.jpg"
      alt={alt}
      style={{
        width: dimension,
        height: dimension,
        ...style,
      }}
      className={cn(
        'shrink-0 object-contain mix-blend-multiply transition-transform duration-200 dark:mix-blend-screen dark:hue-rotate-180 dark:invert',
        className,
      )}
      loading="lazy"
      {...props}
    />
  );
};

/**
 * The error fallback state across all data-fetching pages:
 * Displays a calm, semantic interrupted-connection illustration with a clear retry trigger.
 */
export function ErrorState({
  title = 'Couldn’t load this',
  description = 'Something went wrong talking to the server.',
  onRetry,
  className,
  size = 120,
}: ErrorStateProps) {
  return (
    <Empty className={cn('rounded-md border p-8', className)}>
      <EmptyMedia className="mb-1 bg-transparent">
        <ErrorConnectionIllustration size={size} />
      </EmptyMedia>
      <EmptyTitle className="text-slate-900 dark:text-white">{title}</EmptyTitle>
      <EmptyDescription className="max-w-md">{description}</EmptyDescription>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Empty>
  );
}
