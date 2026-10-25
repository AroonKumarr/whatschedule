import React, { useState, useMemo } from 'react';
import { ScheduledMessage, Contact, WhatsAppStatus, QueueStats } from '../../types';
import { NavRail, NavItemKey } from './NavRail';
import { ScheduleList, ScheduleListItem } from './ScheduleList';
import { ConversationPane, ChatMessageItem } from './ConversationPane';
import { ScheduleOptions } from './SchedulePopover';
import {
  Clock,
  Calendar as CalendarIcon,
  Users,
  FolderOpen,
  Settings,
  Plus,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

interface WhatsScheduleDashboardProps {
  schedules: ScheduledMessage[];
  contacts: Contact[];
  status: WhatsAppStatus;
  stats: QueueStats;
  selectedId: string | null;
  onSelectSchedule: (id: string) => void;
  onNewSchedule: () => void;
  onSendNow: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onScheduleMessage: (recipientJid: string, recipientName: string, content: string, file: File | null, options?: ScheduleOptions) => Promise<void>;
  onLockApp: () => void;
  onOpenSettings: () => void;
  isSending?: boolean;
}

// Built-in Seed Conversations as specified in reference UI spec
const SEED_RECIPIENTS = [
  {
    id: 'seed-ayesha',
    name: 'Ayesha Khan',
    number: '+92 331 0390837',
    avatarColor: '#144D37',
    subtitle: 'next send tomorrow at 9:00 AM',
    nextSendTime: 'Tomorrow 9:00 AM',
    status: 'pending' as const,
    unreadCount: 0,
    hasMedia: false,
    previewText: 'Sent you the project roadmap link: https://whatschedule.app/roadmap',
    messages: [
      {
        id: 'msg-ayesha-1',
        sender: 'incoming' as const,
        content: 'Hi! Could you send over the updated scheduling roadmap before the standup tomorrow?',
        timestamp: '4:15 PM',
      },
      {
        id: 'msg-ayesha-2',
        sender: 'outgoing' as const,
        content: 'Sure! Here is the latest roadmap and feature timeline: https://whatschedule.app/roadmap',
        timestamp: '4:18 PM',
        status: 'pending' as const,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        linkPreview: {
          url: 'https://whatschedule.app/roadmap',
          title: 'WhatsSchedule 2026 Architectural Roadmap & Feature Matrix',
          description: 'Explore the complete local-first WhatsApp scheduler architecture with Baileys multi-device engine.',
          domain: 'whatschedule.app',
          image: '/brand/logo.png',
        },
      },
    ],
  },
  {
    id: 'seed-standup',
    name: 'Team Standup',
    number: 'broadcast@g.us',
    avatarColor: '#087F5B',
    subtitle: 'recurring daily at 10:00 AM',
    nextSendTime: 'Today 10:00 AM',
    status: 'sent' as const,
    unreadCount: 0,
    hasMedia: true,
    previewText: 'Daily progress update & task tracker attached',
    messages: [
      {
        id: 'msg-standup-1',
        sender: 'outgoing' as const,
        content: 'Good morning team! Please find the standup agenda and sprint progress report attached below.',
        timestamp: '10:00 AM',
        status: 'sent' as const,
        deliveryStatus: 'delivered' as const,
        mediaUrl: '/brand/logo.png',
        mediaType: 'image' as const,
        mediaName: 'Sprint_Progress_Dashboard.png',
      },
      {
        id: 'msg-standup-2',
        sender: 'incoming' as const,
        content: 'Thanks! Reviewing now.',
        timestamp: '10:04 AM',
      },
    ],
  },
  {
    id: 'seed-project',
    name: 'Project Group Alpha',
    number: 'project-group@g.us',
    avatarColor: '#2867A8',
    subtitle: 'weekly on Friday at 5:00 PM',
    nextSendTime: 'Friday 5:00 PM',
    status: 'pending' as const,
    unreadCount: 2,
    hasMedia: false,
    previewText: 'Weekly client review deck & release notes',
    messages: [
      {
        id: 'msg-proj-1',
        sender: 'outgoing' as const,
        content: 'Reminder: Weekly client sync scheduled for Friday 5:00 PM PKT.',
        timestamp: 'Yesterday',
        status: 'pending' as const,
      },
    ],
  },
];

export const WhatsScheduleDashboard: React.FC<WhatsScheduleDashboardProps> = ({
  schedules,
  contacts,
  status,
  stats,
  selectedId,
  onSelectSchedule,
  onNewSchedule,
  onSendNow,
  onRetry,
  onDelete,
  onScheduleMessage,
  onLockApp,
  onOpenSettings,
  isSending = false,
}) => {
  const [activeNav, setActiveNav] = useState<NavItemKey>('scheduled');
  
  // Mobile single-column screen management (Screen 1: List vs. Screen 2: Conversation)
  const [mobileScreen, setMobileScreen] = useState<'list' | 'conversation'>('list');

  // Format real schedules from DB into schedule list items
  const liveListItems: ScheduleListItem[] = useMemo(() => {
    // 1. Group DB schedules by recipient JID
    const grouped = new Map<string, ScheduledMessage[]>();
    schedules.forEach((s) => {
      const list = grouped.get(s.recipient) || [];
      list.push(s);
      grouped.set(s.recipient, list);
    });

    const realItems: ScheduleListItem[] = [];
    grouped.forEach((msgs, recipientJid) => {
      const latest = msgs[0];
      const contact = contacts.find((c) => c.id === recipientJid);
      const name = latest.recipientName || contact?.name || recipientJid.split('@')[0];

      let formattedTime = 'Scheduled';
      try {
        const d = new Date(latest.scheduledAt);
        if (isToday(d)) formattedTime = `Today ${format(d, 'h:mm a')}`;
        else if (isTomorrow(d)) formattedTime = `Tomorrow ${format(d, 'h:mm a')}`;
        else formattedTime = format(d, 'MMM d, h:mm a');
      } catch {
        formattedTime = latest.scheduledAt;
      }

      realItems.push({
        id: latest.id,
        name,
        number: recipientJid,
        avatarColor: '#144D37',
        previewText: latest.content || (latest.type !== 'text' ? `[${latest.type.toUpperCase()}]` : 'Scheduled message'),
        nextSendTime: formattedTime,
        status: latest.status === 'cancelled' ? 'failed' : latest.status,
        hasMedia: !!latest.mediaPath,
      });
    });

    // 2. Combine with seed items so the UI is completely populated
    const seedFormatted: ScheduleListItem[] = SEED_RECIPIENTS.map((s) => ({
      id: s.id,
      name: s.name,
      number: s.number,
      avatarColor: s.avatarColor,
      previewText: s.previewText,
      nextSendTime: s.nextSendTime,
      status: s.status,
      unreadCount: s.unreadCount,
      hasMedia: s.hasMedia,
    }));

    return [...realItems, ...seedFormatted];
  }, [schedules, contacts]);

  // Determine currently selected conversation & messages
  const currentConversation = useMemo(() => {
    const activeId = selectedId || (liveListItems.length > 0 ? liveListItems[0].id : 'seed-ayesha');

    // Check seed items first
    const seed = SEED_RECIPIENTS.find((s) => s.id === activeId);
    if (seed) {
      return {
        recipient: {
          id: seed.id,
          name: seed.name,
          number: seed.number,
          avatarColor: seed.avatarColor,
          subtitle: seed.subtitle,
        },
        messages: seed.messages,
      };
    }

    // Check real schedules
    const real = schedules.find((s) => s.id === activeId);
    if (real) {
      const contact = contacts.find((c) => c.id === real.recipient);
      const name = real.recipientName || contact?.name || real.recipient.split('@')[0];

      let formattedTime = '';
      try {
        formattedTime = format(new Date(real.scheduledAt), 'h:mm a');
      } catch {
        formattedTime = 'Scheduled';
      }

      const msgs: ChatMessageItem[] = [
        {
          id: real.id,
          sender: 'outgoing',
          content: real.content,
          timestamp: formattedTime,
          status: real.status,
          deliveryStatus: real.deliveryStatus,
          scheduledAt: real.scheduledAt,
          mediaUrl: real.mediaPath ? `/uploads/${real.mediaPath.split('/').pop()}` : null,
          mediaType: real.type,
          mediaName: real.mediaFileName,
        },
      ];

      return {
        recipient: {
          id: real.recipient,
          name,
          number: real.recipient,
          avatarColor: '#144D37',
          subtitle: `scheduled for ${format(new Date(real.scheduledAt), 'PPp')}`,
        },
        messages: msgs,
      };
    }

    return null;
  }, [selectedId, schedules, contacts, liveListItems]);

  const handleSelectRow = (id: string) => {
    onSelectSchedule(id);
    setMobileScreen('conversation');
  };

  const handleSendOrSchedule = async (content: string, file: File | null, options?: ScheduleOptions) => {
    if (!currentConversation) return;
    await onScheduleMessage(
      currentConversation.recipient.number,
      currentConversation.recipient.name,
      content,
      file,
      options
    );
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-[#0B0F0D] text-[#E9EDEF] select-none font-sans">
      
      {/* ========================================================= */}
      {/* ZONE 1: LEFT NAV RAIL (~113px desktop, 64px tablet)       */}
      {/* ========================================================= */}
      <div className="hidden md:flex shrink-0 h-full">
        <NavRail
          activeItem={activeNav}
          onSelectItem={(key) => setActiveNav(key)}
          scheduledCount={stats.pending + 1}
          failedCount={stats.failed}
          onOpenSettings={onOpenSettings}
          onLockApp={onLockApp}
        />
      </div>

      {/* ========================================================= */}
      {/* ZONE 2: MIDDLE LIST (~305px desktop & tablet)             */}
      {/* ========================================================= */}
      <div
        className={`h-full ${
          mobileScreen === 'conversation' ? 'hidden md:flex' : 'flex w-full md:w-[305px]'
        }`}
      >
        <div className="flex-1 h-full flex flex-col min-w-0">
          <ScheduleList
            items={liveListItems}
            selectedId={selectedId || (liveListItems[0]?.id ?? null)}
            onSelectSchedule={handleSelectRow}
            onNewSchedule={onNewSchedule}
            className="w-full h-full"
          />

          {/* Phone Bottom Tab Bar (< 768px Screen 1) */}
          <nav
            aria-label="Mobile Navigation"
            className="md:hidden h-14 bg-[#141414] border-t border-[#242424] flex items-center justify-around px-2 pb-env-safe shrink-0 z-30"
          >
            {[
              { id: 'scheduled', label: 'Scheduled', icon: Clock },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'media', label: 'Media', icon: FolderOpen },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeNav === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'settings') onOpenSettings();
                    else setActiveNav(tab.id as any);
                  }}
                  className={`flex flex-col items-center justify-center w-14 h-full gap-0.5 text-[10px] font-semibold transition-colors ${
                    isCurrent ? 'text-[#2DD4A7]' : 'text-[#787878] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ZONE 3: RIGHT CONVERSATION PANE                           */}
      {/* ========================================================= */}
      <div
        className={`flex-1 h-full overflow-hidden ${
          mobileScreen === 'list' ? 'hidden md:flex' : 'flex w-full'
        }`}
      >
        <ConversationPane
          selectedRecipient={currentConversation?.recipient || null}
          messages={currentConversation?.messages || []}
          onBack={() => setMobileScreen('list')}
          onSendMessage={(text, file) => handleSendOrSchedule(text, file)}
          onScheduleMessage={(text, file, options) => handleSendOrSchedule(text, file, options)}
          onSendNow={onSendNow}
          onRetry={onRetry}
          onDelete={onDelete}
          isSending={isSending}
        />
      </div>

    </div>
  );
};
