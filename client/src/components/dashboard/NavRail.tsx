import React from 'react';
import {
  Home,
  MessageSquare,
  Settings,
  Users,
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
  // Main Navigation Items (Clean, WhatsApp-focused)
  const navItems = [
    { key: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { key: 'contacts' as const, label: 'Contacts', icon: Users },
    { key: 'home' as const, label: 'Home', icon: Home },
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
        <div className="px-1 flex items-center justify-center lg:justify-start gap-2.5">
          <BrandLogo size={42} className="shrink-0" />
          <div className="hidden lg:flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight text-white">
              Whats<span className="bg-gradient-to-r from-[#00A3FF] via-[#7B61FF] to-[#FF4B91] bg-clip-text text-transparent">Schedule</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Scheduling made simple
            </span>
          </div>
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
                    ? 'bg-[#00A884] text-white shadow-md shadow-emerald-600/25'
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
              </button>
            );
          })}
        </nav>
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
