import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('whatschedule_theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        return saved;
      }
    } catch (e) {}
    return 'auto';
  });

  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('whatschedule_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (e) {}
    return false;
  });

  const applyTheme = useCallback((mode: ThemeMode) => {
    let isDark = false;
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'light') {
      isDark = false;
    } else {
      // Auto: follow system preferred color scheme
      if (typeof window !== 'undefined' && window.matchMedia) {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }

    setResolvedDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      try {
        localStorage.setItem('whatschedule_theme', mode);
      } catch (e) {}
      applyTheme(mode);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    // If currently dark (either explicitly or via auto), switch to light.
    // If light, switch to dark.
    const nextMode: ThemeMode = resolvedDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [resolvedDark, setThemeMode]);

  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme('auto');
      };

      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch (e) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode, applyTheme]);

  return {
    themeMode,
    setThemeMode,
    resolvedDark,
    toggleTheme,
  };
}
