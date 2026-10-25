import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Users,
  FolderOpen,
  FileCode,
  ChevronDown,
  History,
  AlertOctagon,
  FileEdit,
  Share2,
  TrendingUp,
  Settings,
  Globe,
  Plus,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

export type NavItemKey =
  | 'scheduled'
  | 'calendar'
  | 'accounts'
  | 'analytics'
  | 'contacts'
  | 'media'
  | 'templates'
  | 'sent'
  | 'failed'
  | 'drafts'
  | 'groups'
  | 'landing';

interface NavRailProps {
  activeItem: NavItemKey;
  onSelectItem: (key: NavItemKey) => void;
  onNewSchedule?: () => void;
  scheduledCount: number;
  failedCount?: number;
  onOpenSettings?: () => void;
  className?: string;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeItem,
  onSelectItem,
  onNewSchedule,
  scheduledCount,
  failedCount = 0,
  onOpenSettings,
  className = '',
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const workspaceItems = [
    { key: 'scheduled' as const, label: 'Dashboard', icon: Clock, count: scheduledCount },
    { key: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { key: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { key: 'contacts' as const, label: 'Contacts', icon: Users },
  ];

  const managementItems = [
    { key: 'accounts' as const, label: 'Social Accounts', icon: Share2 },
    { key: 'templates' as const, label: 'Templates', icon: FileCode },
    { key: 'media' as const, label: 'Media Library', icon: FolderOpen },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Application Rail"
      className={`h-full flex flex-col justify-between bg-[#111827] border-r border-[#1F2937] text-slate-400 select-none py-3.5 px-2.5 transition-all duration-200 w-[68px] lg:w-[220px] shrink-0 ${className}`}
    >
      {/* Top Brand Logo & Navigation Groups */}
      <div className="flex flex-col items-center lg:items-stretch space-y-4">
        {/* Brand Header */}
        <div className="px-1 py-1 flex items-center justify-center lg:justify-start">
          <BrandLogo size={32} />
        </div>

        {/* Quick Create Action Button (Desktop) */}
        {onNewSchedule && (
          <div className="w-full">
            <button
              type="button"
              onClick={onNewSchedule}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#1877F2] via-[#E4405F] to-[#9333EA] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Create Post or Message"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Create Post</span>
            </button>
          </div>
        )}

        {/* Nav List */}
        <div className="space-y-4 w-full pt-1">
          {/* Group 1: Workspace */}
          <div className="space-y-1">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 pb-1">
              Workspace
            </span>

            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectItem(item.key)}
                  className={`w-full flex items-center justify-center lg:justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                    <span className="hidden lg:inline text-xs font-medium truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`hidden lg:flex min-w-[20px] h-[20px] px-1 text-[10px] font-bold rounded-full items-center justify-center ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group 2: Management */}
          <div className="space-y-1 pt-1">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 pb-1">
              Management
            </span>

            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectItem(item.key)}
                  className={`w-full flex items-center justify-center lg:justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                    <span className="hidden lg:inline text-xs font-medium truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 3: History & Archive */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="w-full flex items-center justify-center lg:justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
            >
              <span className="hidden lg:inline">History</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isHistoryOpen && (
              <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-100">
                <button
                  type="button"
                  onClick={() => onSelectItem('sent')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeItem === 'sent' ? 'bg-emerald-600/15 text-emerald-400' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-xs">Published</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectItem('failed')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeItem === 'failed' ? 'bg-rose-600/15 text-rose-400' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden lg:inline text-xs">Failed</span>
                  </div>
                  {failedCount > 0 && (
                    <span className="hidden lg:inline text-[10px] bg-rose-500/20 text-rose-400 px-1 rounded-full font-bold">
                      {failedCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pt-3 border-t border-slate-800 space-y-1">
        {/* Landing Showcase Toggle */}
        <button
          type="button"
          onClick={() => onSelectItem('landing')}
          className={`w-full flex items-center justify-center lg:justify-start gap-2.5 p-2 rounded-xl text-xs transition-colors cursor-pointer ${
            activeItem === 'landing' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Product Tour & Showcase"
        >
          <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
          <span className="hidden lg:inline text-xs font-medium">Product Tour</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center lg:justify-start gap-2.5 p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Settings & System Preferences"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline text-xs font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};
