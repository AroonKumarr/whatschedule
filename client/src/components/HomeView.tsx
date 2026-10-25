import React from 'react';
import { ScheduledMessage, WhatsAppStatus, QueueStats } from '../types';
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface HomeViewProps {
  status: WhatsAppStatus;
  stats: QueueStats;
  schedules: ScheduledMessage[];
  onNavigate: (view: 'home' | 'send-now' | 'schedule' | 'activity' | 'settings') => void;
  onSendNow: (id: string) => void;
  sendingId: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  status,
  stats,
  schedules,
  onNavigate,
  onSendNow,
  sendingId,
}) => {
  const pendingMessages = schedules.filter((s) => s.status === 'pending');
  const failedMessages = schedules.filter((s) => s.status === 'failed');

  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-y-auto select-none transition-colors duration-150 p-6 sm:p-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E5F5EF] dark:bg-[#1D3830] flex items-center justify-center text-[#087F5B] dark:text-[#25C993] shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
                WhatsApp Engine
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
                  status.state === 'connected'
                    ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993]'
                    : 'bg-[#9A6700]/15 text-[#9A6700] dark:text-[#F3C969]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#25C993] animate-pulse" />
                {status.state === 'connected' ? 'Active & Linked' : 'Connecting...'}
              </span>
            </div>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-0.5">
              {status.user?.name
                ? `Logged in as ${status.user.name} (${status.user.id.split('@')[0]})`
                : 'Local Multi-Device Background Socket Running'}
            </p>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center px-3 py-1.5 bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35]">
            <span className="block text-base font-bold text-[#087F5B] dark:text-[#25C993]">
              {stats.pending}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#788980]">Queued</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35]">
            <span className="block text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
              {stats.sent}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#788980]">Sent</span>
          </div>
          {stats.failed > 0 && (
            <div className="text-center px-3 py-1.5 bg-[#B42318]/10 rounded-xl border border-[#B42318]/20">
              <span className="block text-base font-bold text-[#B42318] dark:text-[#FF938B]">
                {stats.failed}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#B42318] dark:text-[#FF938B]">Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Two Primary Action Cards (Send Now vs. Schedule for Later) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Action 1: Send Now */}
        <div
          onClick={() => onNavigate('send-now')}
          className="group cursor-pointer bg-white dark:bg-[#17211D] hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] hover:border-[#087F5B] dark:hover:border-[#25C993] rounded-2xl p-6 shadow-2xs transition-all duration-150 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B] dark:bg-[#25C993] text-white dark:text-[#0D3027] flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
              Send Now
            </h2>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-1.5 leading-relaxed">
              Compose and immediately dispatch an urgent WhatsApp text, document, video, or voice memo without scheduling delays.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between text-xs font-semibold text-[#087F5B] dark:text-[#25C993]">
            <span>Launch Instant Composer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 2: Schedule for Later */}
        <div
          onClick={() => onNavigate('schedule')}
          className="group cursor-pointer bg-white dark:bg-[#17211D] hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] hover:border-[#087F5B] dark:hover:border-[#25C993] rounded-2xl p-6 shadow-2xs transition-all duration-150 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
              Schedule for Later
            </h2>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-1.5 leading-relaxed">
              Plan messages, birthday greetings, and HR salary follow-ups for tomorrow morning or specific dates. Runs automatically in the background.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between text-xs font-semibold text-[#087F5B] dark:text-[#25C993]">
            <span>Open Scheduling Timeline</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Upcoming Queued Dispatches Section */}
      <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
            <h3 className="text-sm font-bold text-[#16231F] dark:text-[#F2F7F4]">
              Upcoming Queued Messages ({pendingMessages.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold"
          >
            View All Activity →
          </button>
        </div>

        {pendingMessages.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#788980] dark:text-[#8A9A91] space-y-1">
            <p>Your queue is clear. No scheduled messages waiting.</p>
            <p>Click "Schedule for Later" above to set up an automated reminder.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE7E1] dark:divide-[#2D3D35]">
            {pendingMessages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#16231F] dark:text-[#F2F7F4] truncate">
                      {msg.recipientName || msg.recipient}
                    </span>
                    <span className="text-[10px] text-[#087F5B] dark:text-[#25C993] font-medium bg-[#E5F5EF] dark:bg-[#1D3830] px-2 py-0.5 rounded-full">
                      Sends {formatDistanceToNow(new Date(msg.scheduledAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] truncate mt-0.5">
                    {msg.content || msg.mediaFileName || 'Attachment'}
                  </p>
                </div>

                {/* Instant Send Now Button */}
                <button
                  onClick={() => onSendNow(msg.id)}
                  disabled={sendingId === msg.id}
                  className="shrink-0 px-3 py-1.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                  title="Send this queued message right now"
                >
                  <Send className="w-3 h-3" />
                  <span>{sendingId === msg.id ? 'Sending...' : 'Send Now'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Failures Alert Section (if any) */}
      {failedMessages.length > 0 && (
        <div className="bg-[#B42318]/10 border border-[#B42318]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#B42318] dark:text-[#FF938B]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold">
              Attention Required: {failedMessages.length} message{failedMessages.length > 1 ? 's' : ''} failed to dispatch
            </h4>
          </div>
          <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
            Messages may fail if your computer lost Wi-Fi connectivity or your phone was disconnected. You can retry them in the Activity view.
          </p>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-bold text-white bg-[#B42318] hover:bg-[#921E14] px-4 py-2 rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <span>Review Failed Messages & Retry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
