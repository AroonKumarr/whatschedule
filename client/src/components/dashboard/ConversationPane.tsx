import React, { useState, useRef, useEffect } from 'react';
import { ScheduledMessage } from '../../types';
import { SchedulingWallpaper } from '../wallpaper/SchedulingWallpaper';
import { Composer } from './Composer';
import { SchedulePopover, ScheduleOptions } from './SchedulePopover';
import {
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  FileText,
  Calendar,
  Send,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export interface ChatMessageItem {
  id: string;
  sender: 'incoming' | 'outgoing';
  content?: string | null;
  timestamp: string;
  status?: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read' | null;
  scheduledAt?: string;
  mediaUrl?: string | null;
  mediaType?: 'text' | 'image' | 'video' | 'document' | 'audio' | null;
  mediaName?: string | null;
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    domain: string;
    image?: string;
  };
}

interface ConversationPaneProps {
  selectedRecipient?: {
    id: string;
    name: string;
    number: string;
    avatarColor?: string;
    subtitle?: string;
  } | null;
  messages: ChatMessageItem[];
  onBack?: () => void;
  onSendMessage: (text: string, file: File | null) => void;
  onScheduleMessage: (text: string, file: File | null, options: ScheduleOptions) => void;
  onSendNow?: (id: string) => void;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSending?: boolean;
}

export const ConversationPane: React.FC<ConversationPaneProps> = ({
  selectedRecipient,
  messages,
  onBack,
  onSendMessage,
  onScheduleMessage,
  onSendNow,
  onRetry,
  onDelete,
  isSending = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, selectedRecipient?.id]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isFarUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isFarUp);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenSchedulePopover = (text: string, file: File | null) => {
    setPendingText(text);
    setPendingFile(file);
    setIsPopoverOpen(true);
  };

  const handleConfirmSchedule = (options: ScheduleOptions) => {
    setIsPopoverOpen(false);
    onScheduleMessage(pendingText, pendingFile, options);
    setPendingText('');
    setPendingFile(null);
  };

  // If no recipient is selected: Empty State
  if (!selectedRecipient) {
    return (
      <SchedulingWallpaper className="items-center justify-center text-center p-8">
        <div className="max-w-md w-full bg-[#17211D]/90 backdrop-blur-md border border-[#2D3D35] rounded-3xl p-8 flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1D3830] flex items-center justify-center text-[#2DD4A7] mb-4 shadow-xs">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">WhatsSchedule</h2>
          <p className="text-xs text-[#A0A0A0] mt-2 leading-relaxed">
            Select a scheduled contact or draft from the list to preview timeline bubbles, media attachments, and upcoming dispatch controls.
          </p>
          <div className="mt-5 text-[11px] font-mono text-[#2DD4A7] bg-[#101815] px-3 py-1.5 rounded-full border border-[#2D3D35]">
            End-to-End Encrypted &bull; Dispatches Locally
          </div>
        </div>
      </SchedulingWallpaper>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0B0F0D]">
      {/* 1. Header (height ~45px, sticky, translucent with backdrop blur) */}
      <header
        role="banner"
        className="h-[45px] min-h-[45px] w-full px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 bg-[#0F0F0F]/70 backdrop-blur-md border-b border-[#242424]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-[#A0A0A0] hover:text-white rounded-lg transition-colors"
              aria-label="Back to schedule list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* 28px Round Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
            style={{ backgroundColor: selectedRecipient.avatarColor || '#144D37' }}
          >
            {selectedRecipient.name.charAt(0).toUpperCase()}
          </div>

          {/* Name (14px semibold white) & Subtitle (12px gray #A0A0A0) */}
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[14px] font-semibold text-white truncate">
              {selectedRecipient.name}
            </span>
            <span className="text-[12px] text-[#A0A0A0] truncate">
              {selectedRecipient.subtitle || selectedRecipient.number}
            </span>
          </div>
        </div>

        {/* Right: Small Pill-shaped button group (~50x22, radius 11px, bg rgba(255,255,255,0.08)) */}
        <div className="flex items-center bg-white/[0.08] rounded-[11px] h-[22px] px-1.5 gap-1 shrink-0">
          <button
            type="button"
            className="p-0.5 text-[#A0A0A0] hover:text-white transition-colors"
            title="Search inside conversation"
            aria-label="Search conversation"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-2.5 bg-white/10" />
          <button
            type="button"
            className="p-0.5 text-[#A0A0A0] hover:text-white transition-colors"
            title="More conversation options"
            aria-label="More options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Wallpaper & Message Area */}
      <SchedulingWallpaper className="flex-1 min-h-0 relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto px-3 sm:px-4 py-3 space-y-3 thin-scrollbar relative"
        >
          {/* Centered Date Pill ("Today") */}
          <div className="flex justify-center sticky top-2 z-10 my-1 pointer-events-none">
            <span className="bg-[rgba(30,30,30,0.9)] backdrop-blur-xs text-[12px] font-semibold text-white rounded-[8px] px-3 py-1 shadow-xs border border-white/5">
              Today
            </span>
          </div>

          {/* Messages Feed */}
          {messages.map((msg) => {
            const isOutgoing = msg.sender === 'outgoing';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} group animate-in fade-in duration-150`}
              >
                {/* 1. Link Preview Card (if message contains a link) */}
                {msg.linkPreview && (
                  <a
                    href={msg.linkPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-[320px] sm:max-w-[360px] bg-white text-[#16231F] rounded-[12px] overflow-hidden shadow-lg border border-[#DCE7E1] mb-1 block hover:opacity-95 transition-opacity"
                  >
                    {msg.linkPreview.image && (
                      <div className="h-28 w-full bg-[#E5F5EF] overflow-hidden">
                        <img
                          src={msg.linkPreview.image}
                          alt={msg.linkPreview.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3 relative">
                      <div className="text-[15px] font-bold text-[#16231F] leading-snug line-clamp-2">
                        {msg.linkPreview.title}
                      </div>
                      <div className="text-[13px] text-[#5D7168] mt-1 line-clamp-2 leading-relaxed">
                        {msg.linkPreview.description}
                      </div>
                      <div className="text-[11px] font-mono text-[#788980] mt-2 flex items-center gap-1 uppercase">
                        <ExternalLink className="w-3 h-3 text-[#087F5B]" />
                        <span>{msg.linkPreview.domain}</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white to-transparent" />
                    </div>
                  </a>
                )}

                {/* 2. Media Image / Document Bubble */}
                {msg.mediaUrl && (
                  <div
                    className={`max-w-[280px] sm:max-w-[340px] rounded-[12px] p-1 shadow-md mb-1 relative overflow-hidden ${
                      isOutgoing ? 'bg-[#144D37] rounded-tr-[4px]' : 'bg-[#202020] rounded-tl-[4px]'
                    }`}
                  >
                    {msg.mediaType === 'image' || msg.mediaUrl.match(/\.(jpeg|jpg|png|webp|gif)/i) ? (
                      <div className="rounded-[10px] overflow-hidden bg-black/30">
                        <img
                          src={msg.mediaUrl}
                          alt="Attached media"
                          className="w-full max-h-60 object-cover rounded-[10px]"
                        />
                      </div>
                    ) : (
                      <div className="p-2.5 flex items-center gap-2.5 bg-black/20 rounded-[10px]">
                        <FileText className="w-6 h-6 text-[#2DD4A7] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white truncate block">
                            {msg.mediaName || 'Document Attachment'}
                          </span>
                          <span className="text-[10px] text-[#A0A0A0]">WhatsApp Document</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Text Message Bubble */}
                {msg.content && (
                  <div
                    className={`relative text-[14px] leading-[1.45] py-2 px-2.5 max-w-[65%] shadow-sm ${
                      isOutgoing
                        ? 'bg-[#144D37] text-[#E9EDEF] rounded-[12px] rounded-tr-[4px]'
                        : 'bg-[#202020] text-[#E9EDEF] rounded-[12px] rounded-tl-[4px]'
                    }`}
                  >
                    <div className="break-words select-text pr-14">
                      {/* Detect URLs in text and format in accent green */}
                      {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                        part.match(/^https?:\/\//) ? (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2DD4A7] underline font-medium hover:opacity-80"
                          >
                            {part}
                          </a>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>

                    {/* Timestamp & Status Icon bottom-right */}
                    <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none pointer-events-none">
                      <span className="text-[11px] text-white/65">
                        {msg.timestamp}
                      </span>

                      {/* Status indicator (single tick, double tick, or scheduling clock) */}
                      {isOutgoing && (
                        <span className="text-white/70">
                          {msg.status === 'pending' ? (
                            <span title="Scheduled"><Clock className="w-3.5 h-3.5 text-[#F3C969]" /></span>
                          ) : msg.status === 'processing' ? (
                            <span className="w-2 h-2 rounded-full bg-[#2DD4A7] animate-ping" />
                          ) : msg.status === 'failed' ? (
                            <span title="Delivery failed"><AlertTriangle className="w-3.5 h-3.5 text-[#FF938B]" /></span>
                          ) : msg.deliveryStatus === 'read' ? (
                            <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-[#2DD4A7]" /></span>
                          ) : msg.deliveryStatus === 'delivered' ? (
                            <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-white/80" /></span>
                          ) : (
                            <span title="Sent to server"><Check className="w-3.5 h-3.5 text-white/60" /></span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Action controls on hover for scheduled/failed messages */}
                {isOutgoing && (msg.status === 'pending' || msg.status === 'failed') && (
                  <div className="flex items-center gap-2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity text-[11px]">
                    {msg.status === 'pending' && onSendNow && (
                      <button
                        type="button"
                        onClick={() => onSendNow(msg.id)}
                        className="text-[#2DD4A7] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Now</span>
                      </button>
                    )}
                    {msg.status === 'failed' && onRetry && (
                      <button
                        type="button"
                        onClick={() => onRetry(msg.id)}
                        className="text-[#FF938B] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(msg.id)}
                        className="text-[#8A9A91] hover:text-[#FF938B] flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Scroll-to-bottom Button (24px round, accent green, white chevron, ~8px above composer near left) */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-2 left-4 z-20 w-6 h-6 rounded-full bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 animate-in fade-in zoom-in-75 duration-150"
            title="Scroll to latest messages"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </SchedulingWallpaper>

      {/* 3. Composer (height ~56px pinned bottom, transparent over wallpaper) */}
      <Composer
        onSendMessage={onSendMessage}
        onOpenSchedulePopover={handleOpenSchedulePopover}
        isSending={isSending}
        placeholder={`Message ${selectedRecipient.name}...`}
      />

      {/* 4. Schedule Popover */}
      <SchedulePopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onConfirm={handleConfirmSchedule}
      />
    </div>
  );
};
