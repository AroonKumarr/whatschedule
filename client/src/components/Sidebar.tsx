import React, { useState } from 'react';
import { ScheduledMessage, WhatsAppStatus, QueueStats } from '../types';
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
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
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
    <aside className="w-full md:w-[380px] lg:w-[420px] h-full bg-[#111b21] border-r border-[#222d34] flex flex-col shrink-0 select-none">
      {/* Top Bar Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34]">
        {/* User Info & Connection Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow">
              {status.user?.name ? status.user.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202c33] ${
                status.state === 'connected' ? 'bg-[#25D366]' : 'bg-[#e5a800]'
              }`}
              title={status.state === 'connected' ? 'WhatsApp Connected' : 'Waiting for connection'}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#e9edef] truncate max-w-[130px]">
              {status.user?.name || 'WhatsSchedule'}
            </span>
            <span className="text-[11px] text-[#8696a0]">
              {status.state === 'connected' ? 'Multi-Device Active' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* View Switchers & New Schedule Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('chats')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'chats' ? 'text-[#00a884] bg-[#111b21]' : 'text-[#aebac1] hover:text-[#e9edef]'
            }`}
            title="Scheduled Messages"
          >
            <Clock className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'calendar' ? 'text-[#00a884] bg-[#111b21]' : 'text-[#aebac1] hover:text-[#e9edef]'
            }`}
            title="Calendar View"
          >
            <Calendar className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('vault')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'vault' ? 'text-[#00a884] bg-[#111b21]' : 'text-[#aebac1] hover:text-[#e9edef]'
            }`}
            title="Media Vault"
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-full transition-colors ${
              activeView === 'settings' ? 'text-[#00a884] bg-[#111b21]' : 'text-[#aebac1] hover:text-[#e9edef]'
            }`}
            title="Settings & Info"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenComposer}
            className="ml-1 p-2 bg-[#00a884] hover:bg-[#02bd94] text-white rounded-full transition-transform active:scale-95 shadow"
            title="New Schedule"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 border-b border-[#222d34] bg-[#111b21]">
        <div className="relative flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 text-sm">
          <Search className="w-4 h-4 text-[#8696a0] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts or scheduled posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#222d34] text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-[#00a884] text-white font-medium'
              : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'pending'
              ? 'bg-[#00a884] text-white font-medium'
              : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'sent'
              ? 'bg-[#00a884] text-white font-medium'
              : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          Sent ({stats.sent})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'failed'
              ? 'bg-[#ea4335] text-white font-medium'
              : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          Failed ({stats.failed})
        </button>
      </div>

      {/* Scheduled Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] space-y-3">
            <Clock className="w-10 h-10 mx-auto opacity-30 text-[#00a884]" />
            <p className="text-sm">No scheduled messages in this view.</p>
            <button
              onClick={onOpenComposer}
              className="text-xs text-[#00a884] hover:underline font-medium"
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
                    ? 'bg-[#2a3942]'
                    : 'hover:bg-[#202c33]/70 bg-[#111b21]'
                }`}
              >
                {/* Contact Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center shrink-0 text-[#e9edef] font-semibold text-base">
                  {item.recipientName ? item.recipientName.charAt(0).toUpperCase() : '#'}
                </div>

                {/* Info & Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#e9edef] truncate">
                      {item.recipientName || item.recipient.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-[#8696a0] shrink-0 font-light">
                      {formatScheduleTime(item.scheduledAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8696a0]">
                    <div className="flex items-center gap-1 truncate max-w-[210px]">
                      {item.type === 'video' && <Video className="w-3.5 h-3.5 text-[#00a884] shrink-0" />}
                      {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#00a884] shrink-0" />}
                      {item.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#00a884] shrink-0" />}
                      
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
                              <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                            </span>
                          ) : item.deliveryStatus === 'delivered' ? (
                            <span title="Delivered to phone">
                              <CheckCheck className="w-4 h-4 text-[#8696a0]" />
                            </span>
                          ) : (
                            <span title="Sent to server">
                              <CheckCheck className="w-4 h-4 text-[#8696a0]" />
                            </span>
                          )}
                        </>
                      )}
                      {item.status === 'pending' && (
                        <span title="Pending">
                          <Clock className="w-3.5 h-3.5 text-[#e5a800]" />
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping" title="Sending now" />
                      )}
                      {item.status === 'failed' && (
                        <span title="Failed">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#ea4335]" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Hover Actions */}
                <div className="hidden group-hover:flex items-center gap-1">
                  {item.status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(item.id);
                      }}
                      className="p-1 hover:text-[#00a884] text-[#8696a0]"
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
                    className="p-1 hover:text-[#ea4335] text-[#8696a0]"
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
