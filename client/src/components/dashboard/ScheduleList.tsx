import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Search,
  Clock,
  CheckCheck,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Calendar,
  Sparkles,
} from 'lucide-react';

export interface ScheduleListItem {
  id: string;
  name: string;
  number: string;
  avatarColor: string;
  previewText: string;
  nextSendTime: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  unreadCount?: number;
  hasMedia?: boolean;
}

interface ScheduleListProps {
  items: ScheduleListItem[];
  selectedId: string | null;
  onSelectSchedule: (id: string) => void;
  onNewSchedule: () => void;
  className?: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  items,
  selectedId,
  onSelectSchedule,
  onNewSchedule,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.previewText.toLowerCase().includes(q) ||
      item.number.includes(q)
    );
  });

  return (
    <div
      className={`w-full md:w-[305px] min-w-[305px] h-full flex flex-col bg-[#141414] border-r border-[#242424] relative overflow-hidden select-none ${className}`}
    >
      {/* 1. Translucent Sticky Header Strip & Pill Search (blur ~12px, bg rgba(15,15,15,0.7)) */}
      <div className="sticky top-0 z-20 backdrop-blur-[12px] bg-[rgba(15,15,15,0.7)] px-3 pt-3 pb-2 border-b border-white/5 space-y-2">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 rounded-lg text-[#A0A0A0] hover:text-white transition-colors"
              title="Menu"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">Scheduled</h1>
          </div>

          {/* Accent '+' New Schedule Button */}
          <button
            type="button"
            onClick={onNewSchedule}
            className="w-7 h-7 rounded-full bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95"
            title="Create New Schedule"
            aria-label="New Schedule"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Pill Search */}
        <div className="relative flex items-center bg-[#202020]/90 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-[#2DD4A7]/60 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#A0A0A0] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-xs text-white placeholder-[#787878] focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Scrollable Rows Area (Scrolls Underneath Blurred Header) */}
      <div
        className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-1 thin-scrollbar"
        role="listbox"
        aria-label="Scheduled Messages List"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 px-4 text-[#787878] text-xs">
            No scheduled conversations found.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelectSchedule(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSchedule(item.id);
                  }
                }}
                className={`group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none outline-none transition-all duration-120 active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#2A2A2A] rounded-[12px] shadow-sm'
                    : 'rounded-[12px] hover:bg-[#1C1C1C]'
                }`}
                style={{
                  // Inset ~6px from the panel edges
                  margin: '1px 3px',
                }}
              >
                {/* 40px Round Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-2xs select-none"
                  style={{ backgroundColor: item.avatarColor }}
                >
                  {item.name.charAt(0).toUpperCase()}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[14px] font-semibold text-white truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#A0A0A0] shrink-0 font-medium ml-2">
                      {item.nextSendTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[12px] text-[#A0A0A0]">
                    <div className="flex items-center gap-1 truncate">
                      {item.hasMedia && (
                        <ImageIcon className="w-3.5 h-3.5 text-[#2DD4A7] shrink-0" />
                      )}
                      <span className="truncate group-hover:text-[#D1D5DB] transition-colors">
                        {item.previewText}
                      </span>
                    </div>

                    {/* Status Badge / Unread Count */}
                    <div className="shrink-0 flex items-center gap-1">
                      {item.status === 'pending' && (
                        <span title="Scheduled"><Clock className="w-3.5 h-3.5 text-[#F3C969]" /></span>
                      )}
                      {item.status === 'failed' && (
                        <span title="Delivery failed"><AlertTriangle className="w-3.5 h-3.5 text-[#FF938B]" /></span>
                      )}
                      {item.status === 'sent' && (
                        <span title="Sent"><CheckCheck className="w-3.5 h-3.5 text-[#2DD4A7]" /></span>
                      )}
                      {item.unreadCount !== undefined && item.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-[#2DD4A7] text-[#0D3027] font-bold text-[10px] rounded-full flex items-center justify-center">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
