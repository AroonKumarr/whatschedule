import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Globe,
  Repeat,
  Check,
  X,
  Zap,
} from 'lucide-react';
import { addMinutes, addHours, addDays, format, setHours, setMinutes } from 'date-fns';

export interface ScheduleOptions {
  scheduledAt: string;
  timezone: string;
  repeat: 'none' | 'daily' | 'weekly' | 'custom';
}

interface SchedulePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ScheduleOptions) => void;
  initialDateTime?: string;
}

export const SchedulePopover: React.FC<SchedulePopoverProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDateTime,
}) => {
  if (!isOpen) return null;

  const [dateTime, setDateTime] = useState<string>(() => {
    if (initialDateTime) return initialDateTime;
    return format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
  });

  const [timezone, setTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi';
    } catch {
      return 'Asia/Karachi';
    }
  });

  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'custom'>('none');

  const handleQuickPreset = (minutes: number) => {
    setDateTime(format(addMinutes(new Date(), minutes), "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTomorrow9am = () => {
    const tmrw = setMinutes(setHours(addDays(new Date(), 1), 9), 0);
    setDateTime(format(tmrw, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      scheduledAt: new Date(dateTime).toISOString(),
      timezone,
      repeat,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-popover-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-[#17211D] border border-[#2D3D35] rounded-2xl p-5 shadow-2xl text-[#F2F7F4] space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3D35]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1D3830] flex items-center justify-center text-[#2DD4A7]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="schedule-popover-title" className="text-sm font-bold text-white tracking-tight">
                Schedule Message
              </h3>
              <p className="text-[11px] text-[#A0A0A0]">Choose exact dispatch time & recurrence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A9A91] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleQuickPreset(15)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1E2B25] hover:bg-[#254A40] text-[#2DD4A7] border border-[#2D3D35] transition-colors whitespace-nowrap"
          >
            +15m
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(60)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1E2B25] hover:bg-[#254A40] text-[#2DD4A7] border border-[#2D3D35] transition-colors whitespace-nowrap"
          >
            +1 hour
          </button>
          <button
            type="button"
            onClick={handleTomorrow9am}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1E2B25] hover:bg-[#254A40] text-[#2DD4A7] border border-[#2D3D35] transition-colors whitespace-nowrap"
          >
            Tomorrow 9 AM
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {/* Date & Time Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5">
              Dispatch Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              required
              className="w-full bg-[#101815] border border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4A7] font-mono"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#2DD4A7]" />
              <span>Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#101815] border border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4A7]"
            >
              <option value="Asia/Karachi">Asia/Karachi (PKT +05:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
              <option value="Europe/London">Europe/London (GMT/BST +00:00)</option>
              <option value="America/New_York">America/New_York (EST/EDT -05:00)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
              <option value="UTC">Universal Time Coordinated (UTC)</option>
            </select>
          </div>

          {/* Repeat Recurrence */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-[#2DD4A7]" />
              <span>Repeat Cadence</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: 'Does not repeat' },
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRepeat(item.id as any)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                    repeat === item.id
                      ? 'bg-[#1D3830] text-[#2DD4A7] border-[#2DD4A7]/40'
                      : 'bg-[#101815] text-[#A0A0A0] border-[#2D3D35] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {repeat === item.id && <Check className="w-3 h-3 text-[#2DD4A7]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1E2B25] text-[#A0A0A0] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirm Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
