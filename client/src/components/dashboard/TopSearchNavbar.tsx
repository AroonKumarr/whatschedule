import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeMode } from '../../hooks/useTheme';

interface TopSearchNavbarProps {
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  userName?: string;
  userRole?: string;
}

export const TopSearchNavbar: React.FC<TopSearchNavbarProps> = ({
  themeMode = 'auto',
  onToggleTheme,
  onOpenSettings,
  userName = 'Aroon Kumar',
  userRole = 'Creator',
}) => {
  return (
    <header className="h-16 px-6 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0C1520] flex items-center justify-between gap-4 shrink-0 transition-colors z-20">
      {/* Search Input Bar (Matches Screenshot 1 top pill) */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search posts, accounts, or anything..."
            className="w-full bg-slate-50 dark:bg-[#13202E] border border-slate-200/80 dark:border-slate-700/60 rounded-full pl-10 pr-12 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
          <span className="hidden sm:inline-block absolute right-3.5 top-2.5 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right Controls: Notification Bell, Theme Switcher, Profile Badge */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#0C1520]" />
        </button>

        {/* Theme Toggle Sun / Moon */}
        <ThemeToggle themeMode={themeMode} onToggleTheme={onToggleTheme} />

        {/* User Profile Pill matching screenshot */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
          title="Profile & Settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            AK
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
