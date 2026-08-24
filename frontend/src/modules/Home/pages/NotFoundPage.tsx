import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PiHouse, PiArrowLeft, PiMapPinLine } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/public-layout';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        {/* Background Ambient Glow */}
        <div className="bg-primary/10 pointer-events-none fixed top-1/3 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />

        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md sm:p-12 dark:border-zinc-800 dark:bg-zinc-900/80">
          {/* Signpost Lost Path Vector Illustration */}
          <div className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60">
            <img
              src="/not-found-signpost.jpg"
              alt="Wandered Off Path - 404 Page Not Found"
              className="h-full w-full object-contain dark:hue-rotate-180 dark:invert"
            />
          </div>

          <div className="bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <PiMapPinLine className="h-3.5 w-3.5" />
            <span>Error 404 · Off the Map</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            You’ve wandered off the trail
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
            The page you're looking for doesn't exist, may have been relocated, or is no longer
            available in the portal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="h-10 px-5 text-xs font-semibold"
            >
              <PiArrowLeft className="mr-1.5 size-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="sm"
              className="bg-primary hover:bg-primary/90 h-10 px-5 text-xs font-semibold text-white shadow-md"
            >
              <PiHouse className="mr-1.5 size-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
