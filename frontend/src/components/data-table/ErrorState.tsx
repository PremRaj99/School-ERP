import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export interface ErrorStateProps {
  title?: string;
  /** Usually `error.message` from a failed React Query — falls back to a generic line. */
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * The third state every data-fetching page needs alongside `<Skeleton>`/`<Empty>` (ALIGNMENT_PLAN.md
 * Phase 4, item 6) — a failed query should never silently fall back to stale mock data, it should say
 * so and offer a retry (`query.refetch`).
 */
export function ErrorState({
  title = 'Couldn’t load this',
  description = 'Something went wrong talking to the server.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Empty className={className ? `rounded-none border ${className}` : 'rounded-none border'}>
      <EmptyMedia variant="icon">
        <AlertTriangle className="size-5" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-1 text-xs" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Empty>
  );
}
