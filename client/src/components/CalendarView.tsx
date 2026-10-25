import React from 'react';
import { ScheduledMessage } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface CalendarViewProps {
  schedules: ScheduledMessage[];
  onSelect: (id: string) => void;
  onOpenComposer: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedules,
  onSelect,
  onOpenComposer,
}) => {
  // Group schedules by date key (yyyy-MM-dd)
  const grouped = schedules.reduce((acc, msg) => {
    try {
      const dateKey = format(parseISO(msg.scheduledAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
    } catch (e) {}
    return acc;
  }, {} as Record<string, ScheduledMessage[]>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-6 flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#00a884]" />
          <div>
            <h2 className="text-sm font-semibold text-[#e9edef]">Schedule Calendar & Timeline</h2>
            <p className="text-[11px] text-[#8696a0]">
              Visual day-by-day roadmap of all upcoming automated dispatches
            </p>
          </div>
        </div>

        <button
          onClick={onOpenComposer}
          className="px-4 py-1.5 bg-[#00a884] hover:bg-[#02bd94] text-white text-xs rounded-lg font-medium shadow transition-colors"
        >
          + Add Schedule
        </button>
      </div>

      {/* Timeline Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {sortedDates.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-[#8696a0]">
            <CalendarIcon className="w-12 h-12 opacity-30 text-[#00a884] mb-3" />
            <p className="text-sm">No scheduled events found on the timeline.</p>
            <button
              onClick={onOpenComposer}
              className="mt-2 text-xs text-[#00a884] hover:underline font-medium"
            >
              Click here to schedule a message or video
            </button>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const items = grouped[dateKey];
            const dateObj = parseISO(dateKey);
            const dateLabel = isToday(dateObj)
              ? 'Today'
              : isTomorrow(dateObj)
              ? 'Tomorrow'
              : format(dateObj, 'EEEE, MMMM do yyyy');

            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00a884]">
                    {dateLabel}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#222d34]" />
                  <span className="text-[11px] text-[#8696a0]">
                    {items.length} {items.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const itemTime = format(parseISO(item.scheduledAt), 'h:mm a');
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className="bg-[#111b21] hover:bg-[#202c33] border border-[#2a3942] rounded-xl p-4 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#00a884] flex items-center gap-1.5 bg-[#00a884]/10 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              {itemTime}
                            </span>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                item.status === 'sent'
                                  ? 'bg-[#005c4b] text-[#25D366]'
                                  : item.status === 'pending'
                                  ? 'bg-[#e5a800]/20 text-[#e5a800]'
                                  : 'bg-[#ea4335]/20 text-[#ea4335]'
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-sm font-semibold text-[#e9edef] truncate mb-1">
                            {item.recipientName || item.recipient}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mb-2 truncate">
                            {item.type === 'video' && <Video className="w-3.5 h-3.5 text-[#00a884]" />}
                            {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#00a884]" />}
                            {item.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#00a884]" />}
                            <span className="truncate">
                              {item.content || item.mediaFileName || 'No caption'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#222d34] flex items-center justify-between text-[11px] text-[#8696a0]">
                          <span>{item.type.toUpperCase()}</span>
                          <span className="text-[#00a884] hover:underline font-medium">
                            View Details →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
