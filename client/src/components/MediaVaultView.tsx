import React, { useState } from 'react';
import { ScheduledMessage } from '../types';
import {
  FolderOpen,
  Video,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { format } from 'date-fns';

interface MediaVaultViewProps {
  schedules: ScheduledMessage[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MediaVaultView: React.FC<MediaVaultViewProps> = ({
  schedules,
  onSelect,
  onDelete,
}) => {
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'image' | 'document'>('all');

  const mediaItems = schedules.filter((s) => {
    if (!s.mediaPath) return false;
    if (mediaFilter === 'all') return true;
    return s.type === mediaFilter;
  });

  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-hidden select-none transition-colors duration-150">
      {/* Header */}
      <div className="h-[60px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-6 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35]">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-[#087F5B] dark:text-[#25C993]" />
          <div>
            <h2 className="text-sm font-bold text-[#16231F] dark:text-[#F2F7F4]">Media Vault & Storage</h2>
            <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
              Scheduled videos, documents, and photos saved locally
            </p>
          </div>
        </div>

        {/* Media Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F0F5F2] dark:bg-[#17211D] p-1 rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] text-xs">
          {(['all', 'video', 'image', 'document'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMediaFilter(t)}
              className={`px-3 py-1 rounded-lg capitalize font-semibold transition-colors ${
                mediaFilter === t
                  ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] shadow-2xs'
                  : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {mediaItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-[#788980] dark:text-[#8A9A91]">
            <HardDrive className="w-12 h-12 opacity-30 text-[#087F5B] dark:text-[#25C993] mb-3" />
            <p className="text-sm">No media attachments found in the vault.</p>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-1">
              Videos, documents, and photos attached to scheduled messages appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => {
              const fileName = item.mediaFileName || item.mediaPath?.split('/').pop() || 'Media';
              const fileUrl = `/uploads/${item.mediaPath?.split('/').pop()}`;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between hover:border-[#087F5B]/50 dark:hover:border-[#25C993]/50 transition-colors group"
                >
                  {/* Preview Banner */}
                  <div className="h-36 bg-[#F0F5F2] dark:bg-[#1E2B25] flex items-center justify-center overflow-hidden relative">
                    {item.type === 'image' ? (
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === 'video' ? (
                      <div className="flex flex-col items-center gap-2 text-[#087F5B] dark:text-[#25C993]">
                        <Video className="w-10 h-10" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white">
                          VIDEO
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#087F5B] dark:text-[#25C993]">
                        <FileText className="w-10 h-10" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white uppercase">
                          {item.mediaMimeType?.split('/')[1] || 'DOCUMENT'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#16231F] dark:text-[#F2F7F4] truncate mb-1" title={fileName}>
                        {fileName}
                      </div>
                      <div className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] truncate">
                        To: {item.recipientName || item.recipient}
                      </div>
                      <div className="text-[10px] text-[#788980] dark:text-[#8A9A91] mt-0.5">
                        {format(new Date(item.scheduledAt), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between text-xs">
                      <a
                        href={fileUrl}
                        download={fileName}
                        className="p-1.5 hover:text-[#087F5B] dark:hover:text-[#25C993] text-[#5D7168] dark:text-[#8A9A91] rounded-lg hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onSelect(item.id)}
                        className="text-[11px] text-[#087F5B] dark:text-[#25C993] font-semibold hover:underline"
                      >
                        View Chat →
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 hover:text-[#B42318] text-[#788980] rounded-lg hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] transition-colors"
                        title="Delete schedule & file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
