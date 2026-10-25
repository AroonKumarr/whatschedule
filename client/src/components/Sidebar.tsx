import React, { useState } from 'react';
import { ScheduledMessage, WhatsAppStatus, QueueStats } from '../types';
import { ThemeMode } from '../hooks/useTheme';
import {
  MessageSquarePlus,
  Calendar,
  FolderOpen,
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
  Sun,
  Moon,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

interface SidebarProps {
  schedules: ScheduledMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenComposer: () => void;
  activeView: 'chats' | 'calendar' | 'vault' | 'settings';
  setActiveView: (view: 'chats' | 'calendar' | 'vault' | 'settings') => void;
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
    <aside className="w-full md:w-[380px] lg:w-[420px] h-full bg-white dark:bg-[#17211D] border-r border-[#DCE7E1] dark:border-[#2D3D35] flex flex-col shrink-0 select-none transition-colors duration-150">
      {/* Top Bar Header */}
      <div className="h-[60px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-4 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35] transition-colors duration-150">
        {/* User Info & Connection Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#087F5B] dark:bg-[#25C993] flex items-center justify-center text-white dark:text-[#0D3027] font-bold text-sm shadow-xs">
              {status.user?.name ? status.user.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1E2B25] ${
                status.state === 'connected' ? 'bg-[#25C993]' : 'bg-[#9A6700] dark:bg-[#F3C969]'
              }`}
              title={status.state === 'connected' ? 'WhatsApp Connected' : 'Connecting...'}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4] truncate max-w-[120px]">
              {status.user?.name || 'WhatsSchedule'}
            </span>
            <span className="text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
              {status.state === 'connected' ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* View Switchers, Theme Toggle & Controls */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#087F5B] dark:hover:text-[#25C993] rounded-full transition-transform active:scale-95"
            title={`Toggle Theme (Current: ${themeMode.toUpperCase()})`}
            aria-label="Toggle Theme"
          >
            <span className="dark:hidden">
              <Moon className="w-4 h-4 text-[#5D7168]" />
            </span>
            <span className="hidden dark:inline">
              <Sun className="w-4 h-4 text-[#F3C969]" />
            </span>
          </button>

          <button
            onClick={() => setActiveView('chats')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'chats'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-white dark:bg-[#17211D] shadow-xs'
                : 'text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Scheduled Messages"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'calendar'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-white dark:bg-[#17211D] shadow-xs'
                : 'text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('vault')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'vault'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-white dark:bg-[#17211D] shadow-xs'
                : 'text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Media Vault"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'settings'
                ? 'text-[#087F5B] dark:text-[#25C993] bg-white dark:bg-[#17211D] shadow-xs'
                : 'text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
            title="Settings & Info"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Emergency Pause Switch */}
          <button
            onClick={onTogglePause}
            className={`p-2 rounded-full transition-colors ${
              stats.isPaused
                ? 'bg-[#B42318] text-white animate-pulse'
                : 'text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#B42318]'
            }`}
            title={stats.isPaused ? 'Resume Scheduled Dispatches' : 'Emergency Pause: Halt All Dispatches'}
          >
            {stats.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Master PIN Lock Button */}
          <button
            onClick={onLock}
            className="p-2 text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#B42318] rounded-full transition-colors"
            title="Lock WhatsSchedule (Master PIN)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* New Schedule Button */}
          <button
            onClick={onOpenComposer}
            className="ml-1 p-2 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] rounded-full transition-transform active:scale-95 shadow-xs"
            title="New Schedule"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Pause Warning Banner */}
      {stats.isPaused && (
        <div className="bg-[#B42318]/15 border-b border-[#B42318]/30 px-3 py-2 flex items-center justify-between text-xs text-[#B42318] dark:text-[#FF938B]">
          <span className="font-semibold flex items-center gap-1.5">
            <Pause className="w-3.5 h-3.5" />
            <span>Emergency Pause Active</span>
          </span>
          <button
            onClick={onTogglePause}
            className="text-[11px] font-bold text-white bg-[#B42318] px-2 py-0.5 rounded hover:bg-[#921E14]"
          >
            Resume
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-2 border-b border-[#DCE7E1] dark:border-[#2D3D35] bg-white dark:bg-[#17211D] transition-colors duration-150">
        <div className="relative flex items-center bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-xl px-3 py-1.5 text-sm transition-colors duration-150 border border-transparent focus-within:border-[#087F5B] dark:focus-within:border-[#25C993]">
          <Search className="w-4 h-4 text-[#788980] dark:text-[#8A9A91] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts or schedules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] dark:placeholder-[#8A9A91] text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#DCE7E1] dark:border-[#2D3D35] text-xs transition-colors duration-150">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] font-semibold shadow-2xs'
              : 'bg-[#F0F5F2] dark:bg-[#1E2B25] text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'pending'
              ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] font-semibold shadow-2xs'
              : 'bg-[#F0F5F2] dark:bg-[#1E2B25] text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'sent'
              ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] font-semibold shadow-2xs'
              : 'bg-[#F0F5F2] dark:bg-[#1E2B25] text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
          }`}
        >
          Sent ({stats.sent})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'failed'
              ? 'bg-[#B42318] text-white font-semibold shadow-2xs'
              : 'bg-[#F0F5F2] dark:bg-[#1E2B25] text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
          }`}
        >
          Failed ({stats.failed})
        </button>
      </div>

      {/* Scheduled Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#DCE7E1] dark:divide-[#2D3D35]/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#788980] dark:text-[#8A9A91] space-y-3">
            <Clock className="w-10 h-10 mx-auto opacity-30 text-[#087F5B] dark:text-[#25C993]" />
            <p className="text-sm">No scheduled messages in this view.</p>
            <button
              onClick={onOpenComposer}
              className="text-xs text-[#087F5B] dark:text-[#25C993] hover:underline font-medium"
            >
              + Schedule a new message or video
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
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#E5F5EF] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-center shrink-0 text-[#087F5B] dark:text-[#25C993] font-semibold text-base">
                  {item.recipientName ? item.recipientName.charAt(0).toUpperCase() : '#'}
                </div>

                {/* Info & Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4] truncate">
                      {item.recipientName || item.recipient.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] shrink-0 font-light">
                      {formatScheduleTime(item.scheduledAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5D7168] dark:text-[#8A9A91]">
                    <div className="flex items-center gap-1 truncate max-w-[210px]">
                      {item.type === 'video' && <Video className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993] shrink-0" />}
                      {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993] shrink-0" />}
                      {item.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993] shrink-0" />}
                      
                      <span className="truncate">
                        {item.content || item.mediaFileName || 'No caption'}
                      </span>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.status === 'sent' && (
                        <>
                          {item.deliveryStatus === 'read' ? (
                            <span title="Read (Seen)">
                              <CheckCheck className="w-4 h-4 text-[#2867A8] dark:text-[#8BBEFF]" />
                            </span>
                          ) : item.deliveryStatus === 'delivered' ? (
                            <span title="Delivered to phone">
                              <CheckCheck className="w-4 h-4 text-[#788980] dark:text-[#8A9A91]" />
                            </span>
                          ) : (
                            <span title="Sent to server">
                              <Check className="w-4 h-4 text-[#788980] dark:text-[#8A9A91]" />
                            </span>
                          )}
                        </>
                      )}
                      {item.status === 'pending' && (
                        <span title="Pending">
                          <Clock className="w-3.5 h-3.5 text-[#9A6700] dark:text-[#F3C969]" />
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#25C993] animate-ping" title="Sending now" />
                      )}
                      {item.status === 'failed' && (
                        <span title="Failed">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#B42318] dark:text-[#FF938B]" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="hidden group-hover:flex items-center gap-1">
                  {item.status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(item.id);
                      }}
                      className="p-1 hover:text-[#087F5B] dark:hover:text-[#25C993] text-[#788980] dark:text-[#8A9A91]"
                      title="Retry immediately"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 hover:text-[#B42318] text-[#788980] dark:text-[#8A9A91]"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
