import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PiCompass, PiHouse, PiArrowLeft } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/public-layout';

/**
 * Catch-all route (`path: '*'` in routes/index.tsx) — there was no 404 page at all before this;
 * any unmatched URL previously fell through to a blank router error boundary.
 *
 * Illustration placeholder: a single Phosphor icon in a brand-tinted circular chip, matching the
 * `EmptyMedia` pattern used for empty/error states elsewhere. Swap the icon chip below for a real
 * illustration using this prompt:
 *
 *   "A simple, single-weight monotone line illustration in brand blue (#000075) on a transparent
 *   background: a signpost or compass with the path ahead trailing off into a dotted line, evoking
 *   'you've wandered off the map.' Flat geometric line art, no gradients, no shading, no secondary
 *   colors, no photorealism — matches a Phosphor-icon-style visual language at a larger scale."
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="bg-primary/10 text-primary mb-6 flex size-16 items-center justify-center rounded-full">
          <PiCompass className="size-8" />
        </div>
        <p className="text-primary text-sm font-semibold tracking-wide">404</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <PiArrowLeft className="mr-1.5 size-4" />
            Go back
          </Button>
          <Button onClick={() => navigate('/')} size="sm">
            <PiHouse className="mr-1.5 size-4" />
            Back to home
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
