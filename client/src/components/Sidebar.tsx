import React, { useState } from 'react';
import { ScheduledMessage, WhatsAppStatus, QueueStats } from '../types';
import { ThemeMode } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import {
  Home,
  Send,
  Calendar,
  Inbox,
  Settings,
  Search,
  Video,
  Image as ImageIcon,
  FileText,
  Clock,
  Check,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Lock,
  Pause,
  Play,
  MessageSquarePlus,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export type MainNavView = 'home' | 'send-now' | 'schedule' | 'activity' | 'settings';

interface SidebarProps {
  schedules: ScheduledMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenComposer: () => void;
  activeView: MainNavView;
  setActiveView: (view: MainNavView) => void;
  status: WhatsAppStatus;
  stats: QueueStats;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onLock: () => void;
  onTogglePause: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  schedules,
  selectedId,
  onSelect,
  onOpenComposer,
  activeView,
  setActiveView,
  status,
  stats,
  onRetry,
  onDelete,
  onLock,
  onTogglePause,
  themeMode,
  onToggleTheme,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const formatScheduleTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return `Today ${format(d, 'h:mm a')}`;
      if (isTomorrow(d)) return `Tomorrow ${format(d, 'h:mm a')}`;
      return format(d, 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  const filtered = schedules.filter((item) => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.recipientName?.toLowerCase().includes(q);
      const matchNumber = item.recipient.includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      return matchName || matchNumber || matchContent;
    }
    return true;
  });

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] h-full bg-white dark:bg-[#17211D] border-r border-[#DCE7E1] dark:border-[#2D3D35] flex flex-col shrink-0 select-none transition-colors duration-150">
      {/* Top Bar Header with 5-Item Primary Navigation */}
      <div className="h-[64px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-3.5 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35] transition-colors duration-150">
        
        {/* User Avatar & Connection Status */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#087F5B] dark:bg-[#25C993] flex items-center justify-center text-white dark:text-[#0D3027] font-bold text-xs shadow-xs">
              {status.user?.name ? status.user.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1E2B25] ${
                status.state === 'connected' ? 'bg-[#25C993]' : 'bg-[#9A6700] dark:bg-[#F3C969]'
              }`}
              title={status.state === 'connected' ? 'Connected' : 'Connecting...'}
            />
          </div>
        </div>

        {/* 5 Core Navigation Buttons (Requested by user) */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-white/70 dark:bg-[#17211D]/70 p-1 rounded-2xl border border-[#DCE7E1] dark:border-[#2D3D35]">
          {/* 1. Home */}
          <button
            onClick={() => setActiveView('home')}
            className={`p-2 rounded-xl transition-colors ${
              activeView === 'home'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] font-bold shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Home Dashboard"
            aria-label="Home Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* 2. Send Now */}
          <button
            onClick={() => setActiveView('send-now')}
            className={`p-2 rounded-xl transition-colors ${
              activeView === 'send-now'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] font-bold shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Send Now (Instant Dispatch)"
            aria-label="Send Now"
          >
            <Send className="w-4 h-4" />
          </button>

          {/* 3. Schedule */}
          <button
            onClick={() => setActiveView('schedule')}
            className={`p-2 rounded-xl transition-colors ${
              activeView === 'schedule'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] font-bold shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Schedule for Later"
            aria-label="Schedule for Later"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* 4. Activity */}
          <button
            onClick={() => setActiveView('activity')}
            className={`p-2 rounded-xl transition-colors ${
              activeView === 'activity'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] font-bold shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Activity & Message Management"
            aria-label="Activity & Message Management"
          >
            <Inbox className="w-4 h-4" />
          </button>

          {/* 5. Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-xl transition-colors ${
              activeView === 'settings'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] font-bold shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Settings & Preferences"
            aria-label="Settings & Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        {/* Right Tools (Theme Toggle, Emergency Pause, Master PIN Lock) */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle
            themeMode={themeMode}
            onToggleTheme={onToggleTheme}
            className="p-1.5"
          />

          <button
            onClick={onLock}
            className="p-1.5 text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#B42318] rounded-xl border border-transparent hover:border-[#B42318]/30 transition-colors"
            title="Lock WhatsSchedule (Master PIN)"
            aria-label="Lock WhatsSchedule"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Pause Banner (if active) */}
      {stats.isPaused && (
        <div className="bg-[#B42318]/15 border-b border-[#B42318]/30 px-3 py-2 flex items-center justify-between text-xs text-[#B42318] dark:text-[#FF938B]">
          <span className="font-semibold flex items-center gap-1.5">
            <Pause className="w-3.5 h-3.5" />
            <span>Emergency Pause Active</span>
          </span>
          <button
            onClick={onTogglePause}
            className="text-[10px] font-bold text-white bg-[#B42318] px-2 py-0.5 rounded hover:bg-[#921E14]"
          >
            Resume
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-2.5 border-b border-[#DCE7E1] dark:border-[#2D3D35] bg-white dark:bg-[#17211D]">
        <div className="relative flex items-center bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-xl px-3 py-1.5 text-xs border border-transparent focus-within:border-[#087F5B] dark:focus-within:border-[#25C993]">
          <Search className="w-3.5 h-3.5 text-[#788980] dark:text-[#8A9A91] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search queue & messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#DCE7E1] dark:border-[#2D3D35] text-xs">
        {(['all', 'pending', 'sent', 'failed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] shadow-2xs'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
          >
            {tab} ({tab === 'all' ? stats.total : (stats as any)[tab] || 0})
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#DCE7E1] dark:divide-[#2D3D35]/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#788980] dark:text-[#8A9A91] space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-30 text-[#087F5B] dark:text-[#25C993]" />
            <p className="text-xs">No messages in this filter.</p>
            <button
              onClick={onOpenComposer}
              className="text-xs text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold"
            >
              + Create New Dispatch
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                  isSelected
                    ? 'bg-[#E5F5EF] dark:bg-[#1D3830]'
                    : 'hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25]/70 bg-white dark:bg-[#17211D]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#E5F5EF] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-center shrink-0 text-[#087F5B] dark:text-[#25C993] font-bold text-xs">
                  {item.recipientName ? item.recipientName.charAt(0).toUpperCase() : '#'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] truncate">
                      {item.recipientName || item.recipient.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-[#788980] dark:text-[#8A9A91] shrink-0 font-mono">
                      {formatScheduleTime(item.scheduledAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5D7168] dark:text-[#8A9A91]">
                    <span className="truncate text-[11px] max-w-[200px]">
                      {item.content || item.mediaFileName || 'Attachment'}
                    </span>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === 'sent' && (
                        <>
                          {item.deliveryStatus === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#2867A8] dark:text-[#8BBEFF]" />
                          ) : item.deliveryStatus === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#788980]" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-[#788980]" />
                          )}
                        </>
                      )}
                      {item.status === 'pending' && (
                        <Clock className="w-3 h-3 text-[#9A6700] dark:text-[#F3C969]" />
                      )}
                      {item.status === 'processing' && (
                        <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-ping" />
                      )}
                      {item.status === 'failed' && (
                        <AlertTriangle className="w-3 h-3 text-[#B42318] dark:text-[#FF938B]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="hidden group-hover:flex items-center gap-1">
                  {item.status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(item.id);
                      }}
                      className="p-1 hover:text-[#087F5B] dark:hover:text-[#25C993] text-[#788980]"
                      title="Retry"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 hover:text-[#B42318] text-[#788980]"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
