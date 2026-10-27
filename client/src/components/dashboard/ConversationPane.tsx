import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  ChevronDown,
  Send,
  Sparkles,
} from 'lucide-react';
import { Composer } from './Composer';
import { SchedulePopover, ScheduleOptions } from './SchedulePopover';
import { SchedulingWallpaper } from '../wallpaper/SchedulingWallpaper';
import { api } from '../../services/api';

export interface ChatMessageItem {
  id: string;
  sender: 'incoming' | 'outgoing';
  content: string;
  timestamp: string;
  status?: string;
  deliveryStatus?: string;
  scheduledAt?: string;
  mediaUrl?: string | null;
  mediaType?: string;
  mediaName?: string;
}

interface ConversationPaneProps {
  selectedRecipient: {
    id: string;
    name: string;
    number: string;
    avatarColor?: string;
    subtitle?: string;
  } | null;
  messages: ChatMessageItem[];
  onBack?: () => void;
  onSendMessage: (content: string, file: File | null) => Promise<void>;
  onScheduleMessage: (content: string, file: File | null, options: ScheduleOptions) => Promise<void>;
  onSendNow?: (id: string) => void;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSending?: boolean;
}

export const ConversationPane: React.FC<ConversationPaneProps> = ({
  selectedRecipient,
  messages: propMessages,
  onBack,
  onSendMessage,
  onScheduleMessage,
  onSendNow,
  onRetry,
  onDelete,
  isSending = false,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverInitialText, setPopoverInitialText] = useState('');
  const [popoverFile, setPopoverFile] = useState<File | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessageItem[]>(propMessages);
  const [loadingChat, setLoadingChat] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync and fetch full live conversation history for this recipient
  useEffect(() => {
    if (!selectedRecipient) {
      setLiveMessages([]);
      return;
    }

    let isMounted = true;
    const fetchChat = async () => {
      try {
        const res = await api.getChatMessages(selectedRecipient.number || selectedRecipient.id);
        if (!isMounted) return;

        const combined: (ChatMessageItem & { rawTimestamp?: number })[] = [];
        const seenMessageIds = new Set<string>();

        // 1. Inbound/Outbound chat history from database
        if (res.history && res.history.length > 0) {
          res.history.forEach((h: any) => {
            const rawTs = h.timestamp ? new Date(h.timestamp).getTime() : Date.now();
            if (h.waMessageId) seenMessageIds.add(h.waMessageId);
            seenMessageIds.add(h.id);

            combined.push({
              id: h.id,
              sender: h.sender === 'incoming' ? 'incoming' : 'outgoing',
              content: h.content,
              timestamp: new Date(rawTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: h.status,
              deliveryStatus: h.status,
              mediaUrl: h.mediaUrl,
              mediaType: h.mediaType,
              mediaName: h.mediaFileName,
              rawTimestamp: rawTs,
            });
          });
        }

        // 2. Scheduled outgoing dispatches for this recipient
        if (res.scheduled && res.scheduled.length > 0) {
          res.scheduled.forEach((s: any) => {
            // Avoid duplicate if already in history
            if (s.waMessageId && seenMessageIds.has(s.waMessageId)) return;
            if (s.status === 'sent' && seenMessageIds.has(s.id)) return;

            const rawTs = s.scheduledAt ? new Date(s.scheduledAt).getTime() : Date.now();
            combined.push({
              id: s.id,
              sender: 'outgoing',
              content: s.content || (s.status === 'pending' ? '(Scheduled Message)' : ''),
              timestamp: s.status === 'pending'
                ? `Scheduled: ${new Date(rawTs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`
                : new Date(rawTs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
              status: s.status,
              deliveryStatus: s.deliveryStatus,
              scheduledAt: s.scheduledAt,
              mediaUrl: s.mediaPath ? `/uploads/${s.mediaPath.split('/').pop()}` : null,
              mediaType: s.type,
              mediaName: s.mediaFileName,
              rawTimestamp: rawTs,
            });
          });
        }

        // Sort chronologically (earliest to latest)
        combined.sort((a, b) => (a.rawTimestamp || 0) - (b.rawTimestamp || 0));

        if (combined.length > 0) {
          setLiveMessages(combined);
        } else {
          setLiveMessages(propMessages);
        }
      } catch (err) {
        if (isMounted) setLiveMessages(propMessages);
      } finally {
        if (isMounted) setLoadingChat(false);
      }
    };

    fetchChat();

    // Fast polling every 2.5s while conversation is open to stream replies & new messages
    const pollInterval = setInterval(fetchChat, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [selectedRecipient?.id, selectedRecipient?.number]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveMessages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceToBottom > 150);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleOpenSchedulePopover = (content: string, file: File | null) => {
    setPopoverInitialText(content);
    setPopoverFile(file);
    setIsPopoverOpen(true);
  };

  const handleConfirmSchedule = async (options: ScheduleOptions) => {
    setIsPopoverOpen(false);
    const finalContent = options.content !== undefined ? options.content : popoverInitialText;
    await onScheduleMessage(finalContent, popoverFile, options);
  };

  if (!selectedRecipient) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#07111D] text-center p-8 select-none">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 mb-4 shadow-xs">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          Select a Conversation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Choose a chat from the left list to review real messages, send replies or schedule automatic dispatches.
        </p>
      </div>
    );
  }

  const initials = selectedRecipient.name
    ? selectedRecipient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'WA';

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-100 dark:bg-[#07111D] text-slate-900 dark:text-slate-100 relative select-none">
      
      {/* 1. Header (Translucent + backdrop blur, 56px) */}
      <header className="h-14 px-4 bg-white/90 dark:bg-[#0C1724]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
            style={{ backgroundColor: selectedRecipient.avatarColor || '#3B82F6' }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {selectedRecipient.name}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {selectedRecipient.subtitle || selectedRecipient.number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Search in chat"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Messages Wallpaper Area with Live Bubbles */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-10 bg-[#EFEAE2] dark:bg-[#0B141A]"
      >
        <SchedulingWallpaper className="p-4 sm:p-6 min-h-full">
          <div className="max-w-3xl mx-auto space-y-3 pb-2 w-full">
            
            {/* Encryption & Security Notice */}
            <div className="text-center my-3">
              <span className="inline-block px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-[10px] text-amber-800 dark:text-amber-200 font-medium">
                🔒 Messages are end-to-end encrypted through your WhatsApp connection.
              </span>
            </div>

            {liveMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No recorded messages yet. Send a message or schedule one below!
              </div>
            ) : (
              liveMessages.map((msg) => {
                const isOut = msg.sender === 'outgoing';
                const isQueued = msg.status === 'pending';
                const isFailed = msg.status === 'failed' || msg.status === 'cancelled';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOut ? 'items-end' : 'items-start'} animate-in fade-in`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-xs relative ${
                        isOut
                          ? isQueued
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-[#D9FDD3] dark:bg-[#005c4b] text-[#111B21] dark:text-[#E9EDEF] rounded-tr-xs border border-[#C1EBC0]/70 dark:border-transparent'
                          : 'bg-white dark:bg-[#202c33] text-[#111B21] dark:text-[#E9EDEF] rounded-tl-xs border border-slate-200/70 dark:border-transparent shadow-xs'
                      }`}
                    >
                      {/* Media Preview if attached */}
                      {msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden bg-black/10">
                          {msg.mediaType === 'image' ? (
                            <img src={msg.mediaUrl} alt="Attached media" className="w-full max-h-60 object-cover" />
                          ) : (
                            <div className="p-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="truncate font-semibold">{msg.mediaName || 'Document Attachment'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Content */}
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                        {msg.content}
                      </p>

                      {/* Timestamp & Delivery Indicators */}
                      <div
                        className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                          isOut
                            ? isQueued
                              ? 'text-white/80'
                              : 'text-emerald-950/60 dark:text-emerald-100/70'
                            : 'text-slate-500 dark:text-[#8696a0]'
                        }`}
                      >
                        <span>{msg.timestamp}</span>

                        {isOut && (
                          <span>
                            {isQueued ? (
                              <Clock className="w-3 h-3 text-cyan-200 inline" />
                            ) : isFailed ? (
                              <AlertCircle className="w-3 h-3 text-rose-500 inline" />
                            ) : msg.deliveryStatus === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                            ) : msg.deliveryStatus === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 inline" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-500 dark:text-slate-300 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline Quick Action for Queued / Scheduled message */}
                    {isQueued && onSendNow && (
                      <div className="flex items-center gap-2 mt-1 mr-1">
                        <button
                          type="button"
                          onClick={() => onSendNow(msg.id)}
                          className="px-2.5 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Send Now</span>
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(msg.id)}
                            className="text-[10px] text-slate-400 hover:text-rose-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

          </div>
        </SchedulingWallpaper>

        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="fixed bottom-20 right-8 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-200 hover:scale-105 transition-all z-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Composer Bar */}
      <div className="p-3 bg-white/95 dark:bg-[#0C1724]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 shrink-0">
        <Composer
          onSendMessage={onSendMessage}
          onOpenSchedulePopover={handleOpenSchedulePopover}
          isSending={isSending}
          placeholder={`Message ${selectedRecipient.name}...`}
        />
      </div>

      {/* 4. Schedule Modal Popover */}
      <SchedulePopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onConfirm={handleConfirmSchedule}
        initialContent={popoverInitialText}
        file={popoverFile}
      />
    </div>
  );
};
