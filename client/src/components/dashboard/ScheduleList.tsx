import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Plus,
} from 'lucide-react';

export interface ScheduleListItem {
  id: string;
  name: string;
  number: string;
  avatarColor?: string;
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
  onNewSchedule?: () => void;
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');

  const filtered = items.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.number.toLowerCase().includes(q) ||
      item.previewText.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-[#0E1A26] border-r border-slate-200 dark:border-[#1E2D3D] text-slate-900 dark:text-slate-100 select-none ${className}`}>
      
      {/* Search Header Strip */}
      <div className="p-3.5 border-b border-slate-100 dark:border-[#1E2D3D] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold tracking-tight">Messages</h2>
          {onNewSchedule && (
            <button
              type="button"
              onClick={onNewSchedule}
              className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
              title="Compose message"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search chats, posts or numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#142332] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-[11px] font-bold">
          {(['all', 'pending', 'sent', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#142332] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'pending' ? 'Queued' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Rows List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No messages found.
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedId === item.id;
            const initials = item.name
              ? item.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'WA';

            return (
              <div
                key={item.id}
                onClick={() => onSelectSchedule(item.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-500'
                    : 'hover:bg-slate-50/80 dark:hover:bg-[#142332]/50'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-xs"
                  style={{ backgroundColor: item.avatarColor || '#3B82F6' }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {item.nextSendTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
                    {item.previewText}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    {item.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Sent</span>
                      </span>
                    ) : item.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3" />
                        <span>Scheduled</span>
                      </span>
                    )}

                    {item.hasMedia && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                        <FileText className="w-2.5 h-2.5" />
                        <span>Media</span>
                      </span>
                    )}
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
