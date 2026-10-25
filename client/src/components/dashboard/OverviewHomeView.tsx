import React from 'react';
import {
  TrendingUp,
  Clock,
  Send,
  Plus,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { ScheduledMessage, QueueStats, Contact, WhatsAppStatus } from '../../types';
import { format } from 'date-fns';

interface OverviewHomeViewProps {
  stats: QueueStats;
  schedules: ScheduledMessage[];
  contacts: Contact[];
  status: WhatsAppStatus;
  onOpenCreatePost: () => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewHomeView: React.FC<OverviewHomeViewProps> = ({
  stats,
  schedules,
  contacts,
  status,
  onOpenCreatePost,
  onNavigateTab,
}) => {
  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const recentActivities = schedules.slice(0, 5);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1319] p-4 sm:p-6 lg:p-8 space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Top Hero Banner — "One App. All Your Social Media. Scheduled." */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 dark:from-[#1E1B4B]/40 dark:via-[#1E293B] dark:to-[#311042]/30 border border-indigo-100 dark:border-indigo-950/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2.5 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Good morning, Aroon!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            One App. All Your Social Media.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Scheduled.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Connect. Create. Schedule. Grow across WhatsApp, Instagram, Facebook, LinkedIn & X.
          </p>
        </div>

        {/* Hero CTA & Quick Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCreatePost}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Posts */}
        <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Posts</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-bold">
              +12% vs last 7d
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.total || 124}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across 5 social networks
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Scheduled Posts</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full font-bold">
              Queue Active
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {pendingSchedules.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Ready for future dispatch
          </div>
        </div>

        {/* Total Reach */}
        <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Reach</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-bold">
              +21%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            48.2K
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Estimated audience views
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Engagement</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full font-bold">
              8.6K
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            18.4%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Avg reply & click rate
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Posts (Left 2 cols) & Right Column (Actions, Connected & Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Upcoming Posts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Upcoming Posts
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  {pendingSchedules.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('scheduled')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Scheduled Items */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {pendingSchedules.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">No upcoming posts scheduled yet.</p>
                  <button
                    type="button"
                    onClick={onOpenCreatePost}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    + Schedule your first post
                  </button>
                </div>
              ) : (
                pendingSchedules.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                        {s.recipientName ? s.recipientName[0].toUpperCase() : 'WA'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {s.recipientName || s.recipient}
                        </div>
                        <div className="text-slate-500 truncate text-[11px]">
                          {s.content}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500">
                        {format(new Date(s.scheduledAt), 'MMM d, h:mm a')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connected Platforms Bar */}
          <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-500" />
                <span>Connected Platforms</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('accounts')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Manage Accounts
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'WhatsApp', color: '#25D366', status: status.state === 'connected' ? 'Connected' : 'Scan to link' },
                { name: 'Instagram', color: '#E4405F', status: 'Connected' },
                { name: 'Facebook', color: '#1877F2', status: 'Connected' },
                { name: 'LinkedIn', color: '#0A66C2', status: 'Connected' },
                { name: 'X (Twitter)', color: '#000000', status: 'Connected' },
              ].map((plat) => (
                <div
                  key={plat.name}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center gap-1.5"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: plat.color }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{plat.name}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{plat.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenCreatePost}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Create Post</span>
                <span className="text-[10px] text-slate-500">Design & publish</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('calendar')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Schedule Post</span>
                <span className="text-[10px] text-slate-500">Plan for later</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('scheduled')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Messages</span>
                <span className="text-[10px] text-slate-500">Direct chats</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('accounts')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Accounts</span>
                <span className="text-[10px] text-slate-500">Connect 5 channels</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Mini List */}
          <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('scheduled')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {act.recipientName ? `Message to ${act.recipientName}` : 'Message scheduled'}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(act.createdAt || act.scheduledAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
