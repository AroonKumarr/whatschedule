import React, { useState } from 'react';
import {
  Clock,
  Search,
  Plus,
  Send,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { ScheduledMessage } from '../../types';
import { format } from 'date-fns';

interface ScheduledPostsViewProps {
  schedules: ScheduledMessage[];
  onOpenCreatePost: () => void;
  onSendNow: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ScheduledPostsView: React.FC<ScheduledPostsViewProps> = ({
  schedules,
  onOpenCreatePost,
  onSendNow,
  onRetry,
  onDelete,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const filtered = schedules.filter((s) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'pending'
        ? s.status === 'pending'
        : filter === 'sent'
        ? s.status === 'sent'
        : s.status === 'failed' || s.status === 'cancelled';

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (s.recipientName && s.recipientName.toLowerCase().includes(q)) ||
      s.recipient.includes(q) ||
      (s.content && s.content.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F4F7FB] dark:bg-[#09121B] p-6 lg:p-8 space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Scheduled Posts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your outgoing queue across WhatsApp and social channels
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreatePost}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-xs shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search scheduled posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#0E1A26] border border-slate-200 dark:border-[#1E2D3D] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#0E1A26] border border-slate-200 dark:border-[#1E2D3D] rounded-xl text-xs font-semibold">
          {(['all', 'pending', 'sent', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'pending' ? 'Queued' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Posts Table / Cards */}
      <div className="bg-white dark:bg-[#0E1A26] border border-slate-200 dark:border-[#1E2D3D] rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No scheduled posts in this view
            </p>
            <button
              type="button"
              onClick={onOpenCreatePost}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + Create a new post now
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.recipientName ? item.recipientName[0].toUpperCase() : 'WA'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.recipientName || item.recipient}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.recipient}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(item.scheduledAt), 'MMM d, yyyy · h:mm a')}</span>
                    </span>
                    {item.mediaFileName && (
                      <span className="flex items-center gap-1 text-indigo-500">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{item.mediaFileName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                {item.status === 'pending' ? (
                  <>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      Queued
                    </span>
                    <button
                      type="button"
                      onClick={() => onSendNow(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Send immediately"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Now</span>
                    </button>
                  </>
                ) : item.status === 'sent' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dispatched</span>
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRetry(item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Retry"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
