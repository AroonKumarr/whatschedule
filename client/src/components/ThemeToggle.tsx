import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  themeMode?: 'light' | 'dark' | 'auto';
  onToggleTheme?: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  themeMode = 'auto',
  onToggleTheme,
  className = '',
}) => {
  if (!onToggleTheme) return null;

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className={`relative p-2 rounded-xl bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#087F5B] dark:hover:text-[#25C993] hover:border-[#087F5B]/40 dark:hover:border-[#25C993]/40 transition-colors duration-200 shadow-xs focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#25C993] focus-visible:outline-none overflow-hidden group ${className}`}
      title={`Toggle theme (Current: ${themeMode})`}
      aria-label="Toggle theme between Light and Dark mode"
    >
      <div className="relative w-4 h-4">
        {/* Sun Icon for Light Mode (visible in Dark mode to switch back to Light) */}
        <Sun
          className="w-4 h-4 absolute inset-0 transition-all duration-300 ease-in-out transform dark:rotate-0 dark:scale-100 dark:opacity-100 rotate-90 scale-0 opacity-0 text-[#F3C969] motion-reduce:transition-none"
          aria-hidden="true"
        />
        {/* Moon Icon for Dark Mode (visible in Light mode to switch to Dark) */}
        <Moon
          className="w-4 h-4 absolute inset-0 transition-all duration-300 ease-in-out transform rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0 text-[#5D7168] group-hover:text-[#087F5B] motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>
    </button>
  );
};
