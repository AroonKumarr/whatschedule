import React from 'react';
import { ScheduledMessage } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

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
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-hidden select-none transition-colors duration-150">
      {/* Header */}
      <div className="h-[60px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-6 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35]">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#087F5B] dark:text-[#25C993]" />
          <div>
            <h2 className="text-sm font-bold text-[#16231F] dark:text-[#F2F7F4]">Schedule Calendar & Timeline</h2>
            <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
              Visual day-by-day roadmap of all upcoming automated dispatches
            </p>
          </div>
        </div>

        <button
          onClick={onOpenComposer}
          className="px-4 py-1.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs rounded-xl font-semibold shadow-xs transition-colors"
        >
          + Add Schedule
        </button>
      </div>

      {/* Timeline Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {sortedDates.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-[#788980] dark:text-[#8A9A91]">
            <CalendarIcon className="w-12 h-12 opacity-30 text-[#087F5B] dark:text-[#25C993] mb-3" />
            <p className="text-sm">No scheduled events found on the timeline.</p>
            <button
              onClick={onOpenComposer}
              className="mt-2 text-xs text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] dark:text-[#25C993]">
                    {dateLabel}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#DCE7E1] dark:border-[#2D3D35]" />
                  <span className="text-[11px] text-[#788980] dark:text-[#8A9A91]">
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
                        className="bg-white dark:bg-[#17211D] hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-4 cursor-pointer transition-colors shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-[#087F5B] dark:text-[#25C993] flex items-center gap-1.5 bg-[#E5F5EF] dark:bg-[#1D3830] px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              {itemTime}
                            </span>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                item.status === 'sent'
                                  ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993]'
                                  : item.status === 'pending'
                                  ? 'bg-[#9A6700]/15 text-[#9A6700] dark:text-[#F3C969]'
                                  : 'bg-[#B42318]/15 text-[#B42318] dark:text-[#FF938B]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4] truncate mb-1">
                            {item.recipientName || item.recipient}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#5D7168] dark:text-[#8A9A91] mb-2 truncate">
                            {item.type === 'video' && <Video className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />}
                            {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />}
                            {item.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />}
                            <span className="truncate">
                              {item.content || item.mediaFileName || 'No caption'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
                          <span className="font-medium">{item.type.toUpperCase()}</span>
                          <span className="text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold">
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
