import React, { useState } from 'react';
import {
  Home,
  PlusSquare,
  Calendar,
  Clock,
  MessageSquare,
  TrendingUp,
  Share2,
  Settings,
  Users,
  FolderOpen,
  FileCode,
  Globe,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

export type NavItemKey =
  | 'home'
  | 'create'
  | 'calendar'
  | 'scheduled'
  | 'messages'
  | 'analytics'
  | 'accounts'
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
  // Main Navigation Items (Exactly matching designer screens)
  const navItems = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'create' as const, label: 'Create Post', icon: PlusSquare },
    { key: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { key: 'scheduled' as const, label: 'Scheduled Posts', icon: Clock, count: scheduledCount },
    { key: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { key: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { key: 'accounts' as const, label: 'Accounts', icon: Share2 },
    { key: 'contacts' as const, label: 'Contacts', icon: Users },
  ];

  const connectedSocials = [
    { name: 'WhatsApp', color: '#25D366' },
    { name: 'Instagram', color: '#E4405F' },
    { name: 'Facebook', color: '#1877F2' },
    { name: 'LinkedIn', color: '#0A66C2' },
    { name: 'X (Twitter)', color: '#000000' },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Application Rail"
      className={`h-full flex flex-col justify-between bg-[#111A22] border-r border-[#1B2733] text-slate-400 select-none py-4 px-3 transition-all duration-200 w-[72px] lg:w-[230px] shrink-0 ${className}`}
    >
      {/* Top Brand Logo & Primary Nav Items */}
      <div className="flex flex-col items-center lg:items-stretch space-y-5">
        
        {/* Brand Header */}
        <div className="px-1 flex items-center justify-center lg:justify-start">
          <BrandLogo size={32} />
        </div>

        {/* Nav Items List */}
        <nav className="space-y-1 w-full pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectItem(item.key)}
                className={`w-full flex items-center justify-center lg:justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#1E75FF] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span className="hidden lg:inline text-xs font-medium truncate">
                    {item.label}
                  </span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`hidden lg:flex min-w-[20px] h-[20px] px-1 text-[10px] font-bold rounded-full items-center justify-center ${
                      isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Connected Accounts Quick Section (Matching Designer Nav) */}
        <div className="hidden lg:block pt-3 border-t border-slate-800/80 w-full">
          <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Connected Accounts</span>
            <button
              type="button"
              onClick={() => onSelectItem('accounts')}
              className="text-blue-400 hover:underline lowercase font-normal"
            >
              + add
            </button>
          </div>
          <div className="space-y-1">
            {connectedSocials.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onSelectItem('accounts')}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="truncate text-[11px]">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Area: Settings & Open Source Banner */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80 w-full">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </button>

        {/* Designer Open Source Banner Box */}
        <div className="hidden lg:block p-3 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Source</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-1.5">
            Free forever & customizable.
          </p>
          <a
            href="https://github.com/AroonKumarr/whatschedule"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-blue-400 hover:underline"
          >
            Learn More →
          </a>
        </div>
      </div>
    </aside>
  );
};
