import React, { useState, useMemo } from 'react';
import { ScheduledMessage, Contact } from '../types';
import {
  Search,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  RotateCcw,
  Send,
  Trash2,
  Video,
  Image as ImageIcon,
  FileText,
  WifiOff,
  Radio,
  Smartphone,
  Calendar,
  XCircle,
  Filter,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

interface ActivityViewProps {
  schedules: ScheduledMessage[];
  contacts: Contact[];
  onSelectMessage: (id: string) => void;
  onSendNow: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  sendingId: string | null;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  schedules,
  contacts,
  onSelectMessage,
  onSendNow,
  onRetry,
  onDelete,
  sendingId,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fast Tiered Search Algorithm:
  // Tier 1: Matching Contacts
  // Tier 2: Matching Messages
  const { matchedContacts, filteredMessages } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Matched Contacts
    let matchedContacts: Contact[] = [];
    if (q) {
      matchedContacts = contacts.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const numberMatch = c.number.includes(q);
        return nameMatch || numberMatch;
      });
    }

    // 2. Filtered Messages
    const filteredMessages = schedules.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (!q) return true;

      const recipientMatch = item.recipient.toLowerCase().includes(q);
      const nameMatch = item.recipientName?.toLowerCase().includes(q);
      const contentMatch = item.content?.toLowerCase().includes(q);
      const fileMatch = item.mediaFileName?.toLowerCase().includes(q);

      return recipientMatch || nameMatch || contentMatch || fileMatch;
    });

    return { matchedContacts, filteredMessages };
  }, [schedules, contacts, filter, searchQuery]);

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

  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-y-auto select-none transition-colors duration-150 p-6 sm:p-8 space-y-6">
      
      {/* Title & Stats Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#DCE7E1] dark:border-[#2D3D35]">
        <div>
          <h1 className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
            Activity & Message Management
          </h1>
          <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
            Comprehensive audit log of all queued, sent, and failed dispatches
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#17211D] p-1 rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027]'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
          >
            All ({schedules.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027]'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
          >
            Queued ({schedules.filter((s) => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'sent'
                ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027]'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
          >
            Sent ({schedules.filter((s) => s.status === 'sent').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'failed'
                ? 'bg-[#B42318] text-white'
                : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
            }`}
          >
            Failed ({schedules.filter((s) => s.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Fast Tiered Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#788980] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by contact name, phone number, or message text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#25C993] shadow-2xs"
        />
      </div>

      {/* Tier 1: Matching Contacts (if search query active) */}
      {searchQuery.trim() && matchedContacts.length > 0 && (
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#087F5B] dark:text-[#25C993]">
            Contacts Found ({matchedContacts.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {matchedContacts.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-bold text-xs flex items-center justify-center shrink-0">
                  {c.name ? c.name.charAt(0).toUpperCase() : '#'}
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-xs text-[#16231F] dark:text-[#F2F7F4] truncate">
                    {c.name || c.number}
                  </span>
                  <span className="text-[10px] text-[#788980] block font-mono">
                    {c.number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Messages Section */}
      <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl overflow-hidden shadow-2xs">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#788980] dark:text-[#8A9A91] space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-30 text-[#087F5B] dark:text-[#25C993]" />
            <p className="font-semibold text-sm text-[#16231F] dark:text-[#F2F7F4]">
              No messages found in this category
            </p>
            <p>Scheduled and sent messages will appear in this timeline.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE7E1] dark:divide-[#2D3D35]">
            {filteredMessages.map((item) => {
              const isSendingThis = sendingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMessage(item.id)}
                  className="p-4 sm:p-5 hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] transition-colors cursor-pointer space-y-3"
                >
                  {/* Top Row: Contact Name, Time & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-bold text-xs flex items-center justify-center shrink-0">
                        {item.recipientName ? item.recipientName.charAt(0).toUpperCase() : '#'}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs sm:text-sm text-[#16231F] dark:text-[#F2F7F4] truncate block">
                          {item.recipientName || item.recipient}
                        </span>
                        <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] block">
                          {item.recipient} • {formatScheduleTime(item.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.status === 'sent'
                            ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993]'
                            : item.status === 'pending'
                            ? 'bg-[#9A6700]/15 text-[#9A6700] dark:text-[#F3C969]'
                            : item.status === 'processing'
                            ? 'bg-[#087F5B]/20 text-[#087F5B] animate-pulse'
                            : 'bg-[#B42318]/15 text-[#B42318] dark:text-[#FF938B]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Message Content Preview */}
                  <div className="pl-11 text-xs text-[#5D7168] dark:text-[#B2C1B8] line-clamp-2 leading-relaxed">
                    {item.content || item.mediaFileName || 'No caption text'}
                  </div>

                  {/* Detailed Error Diagnostics (if failed) */}
                  {item.status === 'failed' && item.error && (
                    <div className="ml-11 p-3 bg-[#B42318]/10 border border-[#B42318]/25 rounded-xl text-xs text-[#B42318] dark:text-[#FF938B] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Diagnostic Explanation:</span>
                      </div>
                      <p className="leading-relaxed pl-5 font-mono text-[11px]">
                        {item.error}
                      </p>
                    </div>
                  )}

                  {/* Action Bar (Send Now, Retry, Delete) */}
                  <div className="pl-11 pt-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Delivery Status Indicator */}
                      {item.status === 'sent' && (
                        <div className="flex items-center gap-1 text-[11px] text-[#788980]">
                          {item.deliveryStatus === 'read' ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-[#2867A8] dark:text-[#8BBEFF]" />
                              <span>Read by recipient</span>
                            </>
                          ) : item.deliveryStatus === 'delivered' ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-[#788980]" />
                              <span>Delivered to device</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#788980]" />
                              <span>Sent to server</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Send Now for Queued Items */}
                      {item.status === 'pending' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendNow(item.id);
                          }}
                          disabled={isSendingThis}
                          className="px-3 py-1 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                          title="Dispatch this queued message right now"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isSendingThis ? 'Sending...' : 'Send Now'}</span>
                        </button>
                      )}

                      {/* Retry for Failed Items */}
                      {item.status === 'failed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(item.id);
                          }}
                          disabled={isSendingThis}
                          className="px-3 py-1 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all"
                          title="Retry dispatching this message"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry Now</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="p-1 hover:text-[#B42318] text-[#788980] rounded transition-colors"
                        title="Delete from log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Loading Bar when sending */}
                  {isSendingThis && (
                    <div className="h-1 w-full bg-[#E5F5EF] dark:bg-[#1D3830] rounded-full overflow-hidden">
                      <div className="h-full bg-[#087F5B] dark:bg-[#25C993] animate-pulse w-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
