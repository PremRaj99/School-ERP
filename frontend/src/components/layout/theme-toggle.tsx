import React from 'react';
import { PiSun, PiMoon } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/shared/common/theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Shared light/dark toggle icon-button — previously duplicated independently in `app-layout.tsx`
 * and `public-layout.tsx`. Pass `className` to size/position it the way each call site did before.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      title="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <PiSun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <PiMoon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
};

export default ThemeToggle;
