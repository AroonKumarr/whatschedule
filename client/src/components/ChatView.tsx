import React from 'react';
import { ScheduledMessage } from '../types';
import {
  Send,
  Trash2,
  RotateCcw,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Smartphone,
  Info,
  Volume2,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface ChatViewProps {
  selectedMessage: ScheduledMessage | null;
  onSendNow: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenComposer: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  selectedMessage,
  onSendNow,
  onCancel,
  onDelete,
  onOpenComposer,
}) => {
  if (!selectedMessage) {
    return (
      <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col items-center justify-center text-center p-8 border-b-4 border-[#087F5B] dark:border-[#25C993] select-none transition-colors duration-150">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#17211D] flex items-center justify-center text-[#087F5B] dark:text-[#25C993] mb-6 shadow-xs border border-[#DCE7E1] dark:border-[#2D3D35]">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#16231F] dark:text-[#F2F7F4] mb-2 tracking-tight">
          Whats<span className="text-[#087F5B] dark:text-[#25C993]">Schedule</span>
        </h2>
        <p className="text-sm text-[#5D7168] dark:text-[#8A9A91] max-w-md mb-6 leading-relaxed">
          Select a scheduled dispatch from the sidebar to inspect its payload, or schedule a new automated message, video, or document.
        </p>
        <button
          onClick={onOpenComposer}
          className="px-6 py-2.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] rounded-xl font-semibold text-sm transition-transform active:scale-95 shadow-xs flex items-center gap-2"
        >
          <span>Schedule New Message</span>
        </button>

        <div className="mt-12 flex items-center gap-2 text-xs text-[#5D7168] dark:text-[#8A9A91]">
          <Smartphone className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
          <span>Independent Multi-Device Automation • Local & Private</span>
        </div>
      </div>
    );
  }

  const scheduleDate = new Date(selectedMessage.scheduledAt);
  const isExpired = isPast(scheduleDate);
  const timeRemaining = isExpired
    ? 'Trigger time reached'
    : `Sends ${formatDistanceToNow(scheduleDate, { addSuffix: true })}`;

  const mediaUrl = selectedMessage.mediaPath
    ? `/uploads/${selectedMessage.mediaPath.split('/').pop()}`
    : null;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#F6F9F7] dark:bg-[#101815] relative transition-colors duration-150">
      {/* Chat Header */}
      <div className="h-[60px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-4 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35] select-none z-10 transition-colors duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-center text-[#16231F] dark:text-[#F2F7F4] font-semibold text-base shadow-xs">
            {selectedMessage.recipientName
              ? selectedMessage.recipientName.charAt(0).toUpperCase()
              : '#'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                {selectedMessage.recipientName || selectedMessage.recipient.split('@')[0]}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                  selectedMessage.status === 'sent'
                    ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993]'
                    : selectedMessage.status === 'pending'
                    ? 'bg-[#9A6700]/15 text-[#9A6700] dark:text-[#F3C969]'
                    : 'bg-[#B42318]/15 text-[#B42318] dark:text-[#FF938B]'
                }`}
              >
                {selectedMessage.status}
              </span>
            </div>
            <div className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] flex items-center gap-1.5">
              <span>{selectedMessage.recipient}</span>
              <span>•</span>
              <span className="text-[#087F5B] dark:text-[#25C993] font-medium">{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {selectedMessage.status === 'pending' && (
            <>
              <button
                onClick={() => onSendNow(selectedMessage.id)}
                className="px-3.5 py-1.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs rounded-xl font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Send immediately right now"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Now</span>
              </button>
              <button
                onClick={() => onCancel(selectedMessage.id)}
                className="px-3.5 py-1.5 bg-white dark:bg-[#17211D] hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] text-xs text-[#5D7168] dark:text-[#B2C1B8] rounded-xl transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {selectedMessage.status === 'failed' && (
            <button
              onClick={() => onSendNow(selectedMessage.id)}
              className="px-3.5 py-1.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs rounded-xl font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => onDelete(selectedMessage.id)}
            className="p-2 text-[#788980] dark:text-[#8A9A91] hover:text-[#B42318] rounded-full hover:bg-white dark:hover:bg-[#17211D] transition-colors"
            title="Delete from schedule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Canvas */}
      <div className="flex-1 overflow-y-auto wa-chat-bg p-4 md:p-8 flex flex-col justify-end space-y-4">
        {/* Timestamp Banner */}
        <div className="flex justify-center select-none my-2">
          <div className="bg-white/95 dark:bg-[#17211D]/95 border border-[#DCE7E1] dark:border-[#2D3D35] text-[#5D7168] dark:text-[#8A9A91] text-xs px-4 py-1.5 rounded-xl shadow-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />
            <span>
              Target Execution: {format(scheduleDate, 'eeee, MMMM do yyyy @ h:mm a')}
            </span>
          </div>
        </div>

        {/* Message Bubble (WhatsApp Outgoing: Pale Mint in light / Forest Green in dark) */}
        <div className="flex justify-end">
          <div className="max-w-[85%] md:max-w-[65%] bg-[#E5F5EF] dark:bg-[#0D3027] text-[#16231F] dark:text-[#F2F7F4] rounded-2xl rounded-tr-xs p-3.5 shadow-xs border border-[#DCE7E1] dark:border-[#25C993]/20 relative group">
            
            {/* Video */}
            {selectedMessage.type === 'video' && mediaUrl && (
              <div className="mb-2 rounded-xl overflow-hidden bg-black/60 border border-black/20">
                <video
                  src={mediaUrl}
                  controls
                  className="w-full max-h-[360px] rounded-xl object-contain bg-black"
                />
                <div className="px-2.5 py-1 text-[11px] text-[#F2F7F4] flex justify-between bg-black/70">
                  <span className="truncate">{selectedMessage.mediaFileName || 'Video'}</span>
                  <span>{selectedMessage.mediaMimeType}</span>
                </div>
              </div>
            )}

            {/* Image */}
            {selectedMessage.type === 'image' && mediaUrl && (
              <div className="mb-2 rounded-xl overflow-hidden border border-black/10">
                <img
                  src={mediaUrl}
                  alt="Attachment"
                  className="w-full max-h-[360px] object-cover rounded-xl"
                />
              </div>
            )}

            {/* Audio */}
            {selectedMessage.type === 'audio' && mediaUrl && (
              <div className="mb-2 p-2.5 bg-white/80 dark:bg-[#17211D] rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#16231F] dark:text-white">
                  <Volume2 className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
                  <span>Voice Memo / Audio</span>
                </div>
                <audio src={mediaUrl} controls className="w-full h-8" />
              </div>
            )}

            {/* Document */}
            {selectedMessage.type === 'document' && (
              <div className="mb-2 p-3 bg-white/80 dark:bg-[#17211D] rounded-xl flex items-center gap-3 border border-[#DCE7E1] dark:border-[#2D3D35]">
                <div className="p-2.5 bg-[#087F5B] dark:bg-[#25C993] rounded-xl text-white dark:text-[#0D3027]">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#16231F] dark:text-white truncate">
                    {selectedMessage.mediaFileName || 'Document.pdf'}
                  </div>
                  <div className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] uppercase">
                    {selectedMessage.mediaMimeType?.split('/')[1] || 'DOC'}
                  </div>
                </div>
                {mediaUrl && (
                  <a
                    href={mediaUrl}
                    download={selectedMessage.mediaFileName || 'download'}
                    className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[#16231F] dark:text-white transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Message Body */}
            {selectedMessage.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-14 text-[#16231F] dark:text-[#F2F7F4]">
                {selectedMessage.content}
              </p>
            )}

            {/* Bubble Footer Ticks */}
            <div className="flex items-center justify-end gap-1 mt-1 select-none text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
              <span>{format(new Date(selectedMessage.createdAt), 'h:mm a')}</span>
              
              {selectedMessage.deliveryStatus === 'read' && (
                <span title="Read by recipient">
                  <CheckCheck className="w-4 h-4 text-[#2867A8] dark:text-[#8BBEFF]" />
                </span>
              )}
              {selectedMessage.deliveryStatus === 'delivered' && (
                <span title="Delivered to phone">
                  <CheckCheck className="w-4 h-4 text-[#5D7168] dark:text-[#8A9A91]" />
                </span>
              )}
              {selectedMessage.deliveryStatus === 'sent' && (
                <span title="Sent from server">
                  <Check className="w-4 h-4 text-[#5D7168] dark:text-[#8A9A91]" />
                </span>
              )}
              {selectedMessage.status === 'pending' && (
                <span title="Armed in queue">
                  <Clock className="w-3 h-3 text-[#9A6700] dark:text-[#F3C969]" />
                </span>
              )}
              {selectedMessage.status === 'failed' && (
                <span title="Failed to dispatch">
                  <AlertCircle className="w-3.5 h-3.5 text-[#B42318] dark:text-[#FF938B]" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Failed Error Alert */}
        {selectedMessage.status === 'failed' && selectedMessage.error && (
          <div className="flex justify-end">
            <div className="bg-[#B42318]/15 border border-[#B42318]/30 rounded-xl p-3 max-w-[85%] text-xs text-[#B42318] dark:text-[#FF938B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Dispatch Failed:</p>
                <p className="font-mono text-[11px] mt-0.5">{selectedMessage.error}</p>
                <button
                  onClick={() => onSendNow(selectedMessage.id)}
                  className="mt-2 text-xs font-semibold text-white bg-[#B42318] px-3 py-1 rounded shadow hover:bg-[#921E14] transition-colors"
                >
                  Retry Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Banner */}
      <div className="bg-[#F0F5F2] dark:bg-[#1E2B25] px-4 py-3 border-t border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between text-xs text-[#5D7168] dark:text-[#8A9A91] transition-colors duration-150">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
          <span>
            {selectedMessage.status === 'pending'
              ? 'Armed in persistent SQLite queue • Dispatches automatically even if display is asleep.'
              : selectedMessage.deliveryStatus === 'read'
              ? `Read by recipient on ${format(new Date(selectedMessage.readAt || selectedMessage.updatedAt), 'MMM d, h:mm a')}`
              : selectedMessage.status === 'sent'
              ? `Delivered on ${format(new Date(selectedMessage.sentAt || selectedMessage.updatedAt), 'MMM d, h:mm a')}`
              : 'Execution cancelled.'}
          </span>
        </div>

        <button
          onClick={onOpenComposer}
          className="text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold"
        >
          + Schedule Another
        </button>
      </div>
    </div>
  );
};
