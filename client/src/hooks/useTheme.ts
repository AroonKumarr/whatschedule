import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'auto';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('whatschedule_theme_mode') as ThemeMode) || 'auto';
  });

  const [resolvedDark, setResolvedDark] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('whatschedule_theme_mode', themeMode);

    const updateTheme = () => {
      let isDark = true;

      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'light') {
        isDark = false;
      } else {
        // Auto Mode: Uses User's Local Timezone
        // Between 6:00 PM (18:00) and 6:00 AM, Night/Dark mode is active.
        // Between 6:00 AM and 6:00 PM, crisp Day/Light mode is active.
        const currentHour = new Date().getHours();
        isDark = currentHour < 6 || currentHour >= 18;
      }

      setResolvedDark(isDark);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    // Check periodically in case time crosses 6am/6pm
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const toggleTheme = () => {
    if (themeMode === 'auto') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light');
    else setThemeMode('auto');
  };

  return { themeMode, setThemeMode, resolvedDark, toggleTheme };
}
