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
  Play,
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
      <div className="flex-1 h-full bg-[#222e35] flex flex-col items-center justify-center text-center p-8 border-b-8 border-[#00a884] select-none">
        <div className="w-16 h-16 rounded-full bg-[#111b21] flex items-center justify-center text-[#00a884] mb-6 shadow-xl border border-[#2a3942]">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-light text-[#e9edef] mb-2">
          WhatsSchedule for Web & Mobile
        </h2>
        <p className="text-sm text-[#8696a0] max-w-md mb-6 leading-relaxed">
          Select a scheduled dispatch from the sidebar to inspect its payload, or schedule a new automated message, video, or voice note.
        </p>
        <button
          onClick={onOpenComposer}
          className="px-6 py-2.5 bg-[#00a884] hover:bg-[#02bd94] text-white rounded-full font-medium text-sm transition-transform active:scale-95 shadow-md flex items-center gap-2"
        >
          <span>Schedule New Message</span>
        </button>

        <div className="mt-12 flex items-center gap-2 text-xs text-[#8696a0]">
          <Smartphone className="w-4 h-4 text-[#00a884]" />
          <span>Independent Multi-Device Automation • Screen Can Be Off</span>
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
    <div className="flex-1 h-full flex flex-col bg-[#0b141a] relative">
      {/* Chat Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] select-none z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111b21] border border-[#2a3942] flex items-center justify-center text-[#e9edef] font-semibold text-base">
            {selectedMessage.recipientName
              ? selectedMessage.recipientName.charAt(0).toUpperCase()
              : '#'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#e9edef]">
                {selectedMessage.recipientName || selectedMessage.recipient.split('@')[0]}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedMessage.status === 'sent'
                    ? 'bg-[#005c4b] text-[#25D366]'
                    : selectedMessage.status === 'pending'
                    ? 'bg-[#e5a800]/20 text-[#e5a800]'
                    : 'bg-[#ea4335]/20 text-[#ea4335]'
                }`}
              >
                {selectedMessage.status.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-[#8696a0] flex items-center gap-1.5">
              <span>{selectedMessage.recipient}</span>
              <span>•</span>
              <span className="text-[#00a884] font-medium">{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {selectedMessage.status === 'pending' && (
            <>
              <button
                onClick={() => onSendNow(selectedMessage.id)}
                className="px-3 py-1.5 bg-[#00a884] hover:bg-[#02bd94] text-white text-xs rounded-lg font-medium flex items-center gap-1.5 shadow transition-colors"
                title="Send immediately right now"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Now</span>
              </button>
              <button
                onClick={() => onCancel(selectedMessage.id)}
                className="px-3 py-1.5 bg-[#111b21] hover:bg-[#202c33] border border-[#2a3942] text-xs text-[#d1d7db] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {selectedMessage.status === 'failed' && (
            <button
              onClick={() => onSendNow(selectedMessage.id)}
              className="px-3 py-1.5 bg-[#00a884] hover:bg-[#02bd94] text-white text-xs rounded-lg font-medium flex items-center gap-1.5 shadow transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => onDelete(selectedMessage.id)}
            className="p-2 text-[#8696a0] hover:text-[#ea4335] rounded-full hover:bg-[#111b21] transition-colors"
            title="Delete from schedule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Canvas with Doodle Background */}
      <div className="flex-1 overflow-y-auto wa-chat-bg p-4 md:p-8 flex flex-col justify-end space-y-4">
        {/* Scheduled Timestamp Banner */}
        <div className="flex justify-center select-none my-2">
          <div className="bg-[#182229] border border-[#222d34] text-[#8696a0] text-xs px-4 py-1.5 rounded-lg shadow flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#00a884]" />
            <span>
              Target Execution: {format(scheduleDate, 'eeee, MMMM do yyyy @ h:mm a')}
            </span>
          </div>
        </div>

        {/* Message Bubble (WhatsApp Outgoing Style #005c4b) */}
        <div className="flex justify-end">
          <div className="max-w-[85%] md:max-w-[65%] bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none p-3 shadow-md border border-[#005c4b]/80 relative group">
            
            {/* Render Video (including iPhone QuickTime .mov and .mp4) */}
            {selectedMessage.type === 'video' && mediaUrl && (
              <div className="mb-2 rounded-lg overflow-hidden bg-black/50 border border-black/20">
                <video
                  src={mediaUrl}
                  controls
                  className="w-full max-h-[360px] rounded-lg object-contain bg-black"
                />
                <div className="px-2 py-1 text-[11px] text-[#8696a0] flex justify-between bg-black/60">
                  <span className="truncate">{selectedMessage.mediaFileName || 'Video'}</span>
                  <span>{selectedMessage.mediaMimeType}</span>
                </div>
              </div>
            )}

            {/* Render Image (including iPhone .heic, .webp, .png, .jpg) */}
            {selectedMessage.type === 'image' && mediaUrl && (
              <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
                <img
                  src={mediaUrl}
                  alt="Attachment"
                  className="w-full max-h-[360px] object-cover rounded-lg"
                />
              </div>
            )}

            {/* Render Audio / Voice Memo */}
            {selectedMessage.type === 'audio' && mediaUrl && (
              <div className="mb-2 p-2.5 bg-[#0a332c] rounded-lg border border-[#00a884]/20 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-white">
                  <Volume2 className="w-4 h-4 text-[#25D366]" />
                  <span>Voice Memo / Audio</span>
                </div>
                <audio src={mediaUrl} controls className="w-full h-8" />
              </div>
            )}

            {/* Render Document */}
            {selectedMessage.type === 'document' && (
              <div className="mb-2 p-3 bg-[#0a332c] rounded-lg flex items-center gap-3 border border-[#00a884]/20">
                <div className="p-2.5 bg-[#00a884] rounded-lg text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {selectedMessage.mediaFileName || 'Document.pdf'}
                  </div>
                  <div className="text-[11px] text-[#8696a0] uppercase">
                    {selectedMessage.mediaMimeType?.split('/')[1] || 'DOC'}
                  </div>
                </div>
                {mediaUrl && (
                  <a
                    href={mediaUrl}
                    download={selectedMessage.mediaFileName || 'download'}
                    className="p-2 hover:bg-[#005c4b] rounded-full text-white transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Message Body Text */}
            {selectedMessage.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-14 text-[#e9edef]">
                {selectedMessage.content}
              </p>
            )}

            {/* Authentic WhatsApp Delivery & Read Ticks */}
            <div className="flex items-center justify-end gap-1 mt-1 select-none text-[11px] text-[#8696a0]">
              <span>{format(new Date(selectedMessage.createdAt), 'h:mm a')}</span>
              
              {/* Double Blue Ticks (Recipient opened and read the message) */}
              {selectedMessage.deliveryStatus === 'read' && (
                <span title="Read by recipient">
                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                </span>
              )}

              {/* Double Grey Ticks (Delivered to recipient phone) */}
              {selectedMessage.deliveryStatus === 'delivered' && (
                <span title="Delivered to phone">
                  <CheckCheck className="w-4 h-4 text-[#8696a0]" />
                </span>
              )}

              {/* Single Grey Tick (Sent to WhatsApp servers) */}
              {selectedMessage.deliveryStatus === 'sent' && (
                <span title="Sent from server">
                  <Check className="w-4 h-4 text-[#8696a0]" />
                </span>
              )}

              {/* Pending Clock Icon */}
              {selectedMessage.status === 'pending' && (
                <span title="Armed in queue">
                  <Clock className="w-3 h-3 text-[#8696a0]" />
                </span>
              )}

              {/* Failed Icon */}
              {selectedMessage.status === 'failed' && (
                <span title="Failed to dispatch">
                  <AlertCircle className="w-3.5 h-3.5 text-[#ea4335]" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Failed Error Log Display */}
        {selectedMessage.status === 'failed' && selectedMessage.error && (
          <div className="flex justify-end">
            <div className="bg-[#ea4335]/15 border border-[#ea4335]/30 rounded-lg p-3 max-w-[85%] text-xs text-[#ea4335] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Dispatch Failed:</p>
                <p className="font-mono text-[11px] mt-0.5">{selectedMessage.error}</p>
                <button
                  onClick={() => onSendNow(selectedMessage.id)}
                  className="mt-2 text-xs font-semibold text-white bg-[#ea4335] px-3 py-1 rounded shadow hover:bg-[#d93025] transition-colors"
                >
                  Retry Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Composer Status Banner */}
      <div className="bg-[#202c33] px-4 py-3 border-t border-[#222d34] flex items-center justify-between text-xs text-[#8696a0]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#00a884]" />
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
          className="text-[#00a884] hover:underline font-medium"
        >
          + Schedule Another
        </button>
      </div>
    </div>
  );
};
