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
  Users2,
  Settings,
  Lock,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

export type NavItemKey =
  | 'scheduled'
  | 'calendar'
  | 'contacts'
  | 'media'
  | 'templates'
  | 'sent'
  | 'failed'
  | 'drafts'
  | 'groups';

interface NavRailProps {
  activeItem: NavItemKey;
  onSelectItem: (key: NavItemKey) => void;
  scheduledCount: number;
  failedCount?: number;
  onOpenSettings?: () => void;
  onLockApp?: () => void;
  className?: string;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeItem,
  onSelectItem,
  scheduledCount,
  failedCount = 0,
  onOpenSettings,
  onLockApp,
  className = '',
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);

  const primaryItems = [
    { key: 'scheduled' as const, label: 'Scheduled', icon: Clock, count: scheduledCount },
    { key: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { key: 'contacts' as const, label: 'Contacts', icon: Users },
    { key: 'media' as const, label: 'Media & Docs', icon: FolderOpen },
    { key: 'templates' as const, label: 'Templates', icon: FileCode },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Application Rail"
      className={`h-full flex flex-col justify-between bg-[#111111] border-r border-[#242424] text-[#A0A0A0] select-none py-3 px-2 transition-all duration-200 w-[64px] lg:w-[113px] shrink-0 ${className}`}
    >
      {/* Top Brand Logo & Primary Navigation */}
      <div className="flex flex-col items-center lg:items-stretch space-y-4">
        {/* App Logo */}
        <div className="flex items-center gap-2 px-1 justify-center lg:justify-start">
          <BrandLogo size={32} />
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight leading-none">
              Whats<span className="text-[#2DD4A7]">Schedule</span>
            </span>
            <span className="text-[9px] text-[#787878] mt-0.5 font-mono">v1.0 Pro</span>
          </div>
        </div>

        {/* Primary Nav List */}
        <nav className="space-y-1 w-full" aria-label="Primary Navigation">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectItem(item.key)}
                className={`relative w-full flex items-center justify-center lg:justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#1D3830] text-[#2DD4A7] shadow-xs'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#2DD4A7]' : 'text-[#A0A0A0] group-hover:text-white'}`} />
                  <span className="hidden lg:inline truncate text-[11px] font-medium">{item.label}</span>
                </div>

                {/* Count Badge */}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`hidden lg:flex min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#2DD4A7] text-[#0D3027]'
                        : 'bg-[#2A2A2A] text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Collapsible 'More' (Sent history, Failed, Drafts) */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className="w-full flex items-center justify-center lg:justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#787878] hover:text-white transition-colors"
              title="More sections"
            >
              <span className="hidden lg:inline uppercase tracking-wider text-[10px]">More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-180 ${
                  isMoreOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMoreOpen && (
              <div className="mt-1 space-y-0.5 pl-1 animate-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => onSelectItem('sent')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activeItem === 'sent' ? 'bg-[#1D3830] text-[#2DD4A7]' : 'hover:bg-white/5 text-[#A0A0A0]'
                  }`}
                  title="Sent History"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Sent history</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectItem('failed')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activeItem === 'failed' ? 'bg-[#1D3830] text-[#2DD4A7]' : 'hover:bg-white/5 text-[#A0A0A0]'
                  }`}
                  title="Failed Dispatches"
                >
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-[#FF938B]" />
                    <span className="hidden lg:inline text-[11px]">Failed</span>
                  </div>
                  {failedCount > 0 && (
                    <span className="hidden lg:inline text-[10px] bg-[#FF938B]/20 text-[#FF938B] px-1 rounded-full font-bold">
                      {failedCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectItem('drafts')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activeItem === 'drafts' ? 'bg-[#1D3830] text-[#2DD4A7]' : 'hover:bg-white/5 text-[#A0A0A0]'
                  }`}
                  title="Drafts"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Drafts</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible 'Groups' */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsGroupsOpen((prev) => !prev)}
              className="w-full flex items-center justify-center lg:justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#787878] hover:text-white transition-colors"
              title="Broadcast & Recipient Groups"
            >
              <div className="flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-[#2DD4A7]" />
                <span className="hidden lg:inline uppercase tracking-wider text-[10px]">Groups</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-180 ${
                  isGroupsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isGroupsOpen && (
              <div className="mt-1 space-y-0.5 pl-1 animate-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => onSelectItem('groups')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activeItem === 'groups' ? 'bg-[#1D3830] text-[#2DD4A7]' : 'hover:bg-white/5 text-[#A0A0A0]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A7]" />
                  <span className="hidden lg:inline text-[11px] truncate">Team Standup</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectItem('groups')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[#A0A0A0] hover:bg-white/5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span className="hidden lg:inline text-[11px] truncate">Project Alpha</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom User Chip & System Controls */}
      <div className="pt-3 border-t border-white/5 space-y-1">
        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center lg:justify-start gap-2 p-2 rounded-xl text-xs text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
          title="App Settings"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline text-[11px] font-medium">Settings</span>
        </button>

        {/* Lock PIN */}
        {onLockApp && (
          <button
            type="button"
            onClick={onLockApp}
            className="w-full flex items-center justify-center lg:justify-start gap-2 p-2 rounded-xl text-xs text-[#A0A0A0] hover:text-[#FF938B] hover:bg-white/5 transition-colors"
            title="Lock with Master PIN"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-medium">Lock</span>
          </button>
        )}
      </div>
    </aside>
  );
};
