import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '@/lib/utils';
import { EmptyIllustration, type EmptyStateVariant } from './empty-illustrations';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-md border-dashed p-6 text-center text-balance',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-sm flex-col items-center gap-2', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg:not([class*='size-'])]:size-5",
        illustration: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface EmptyMediaProps
  extends React.ComponentProps<'div'>, VariantProps<typeof emptyMediaVariants> {
  illustration?: EmptyStateVariant;
  illustrationSize?: number | string;
}

function EmptyMedia({
  className,
  variant = 'default',
  illustration,
  illustrationSize = 120,
  children,
  ...props
}: EmptyMediaProps) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={illustration ? 'illustration' : variant}
      className={cn(
        emptyMediaVariants({ variant: illustration ? 'illustration' : variant, className }),
      )}
      {...props}
    >
      {illustration ? (
        <EmptyIllustration variant={illustration} size={illustrationSize} />
      ) : (
        children
      )}
    </div>
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('font-heading text-sm font-medium', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-xs/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-xs text-balance',
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyIllustration,
};
export type { EmptyStateVariant };
