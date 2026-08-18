import React, { useEffect, useState } from 'react';
import { ThemeProviderContext, type Theme } from './theme-context';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'school-erp-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  const getResolvedTheme = (): 'dark' | 'light' => {
    if (theme === 'system') {
      return typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  };

  const resolvedTheme = getResolvedTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const effectiveTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    root.classList.add(effectiveTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export default ThemeProvider;
