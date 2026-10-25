import React, { useState } from 'react';
import { ScheduledMessage } from '../types';
import {
  FolderOpen,
  Video,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  ExternalLink,
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

  // Filter messages that have media
  const mediaItems = schedules.filter((s) => {
    if (!s.mediaPath) return false;
    if (mediaFilter === 'all') return true;
    return s.type === mediaFilter;
  });

  return (
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-6 flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-[#00a884]" />
          <div>
            <h2 className="text-sm font-semibold text-[#e9edef]">Media Vault & Storage</h2>
            <p className="text-[11px] text-[#8696a0]">
              Scheduled videos, documents, and photos saved locally
            </p>
          </div>
        </div>

        {/* Media Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#111b21] p-1 rounded-lg border border-[#2a3942] text-xs">
          {(['all', 'video', 'image', 'document'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMediaFilter(t)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                mediaFilter === t
                  ? 'bg-[#00a884] text-white font-medium'
                  : 'text-[#8696a0] hover:text-[#e9edef]'
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
          <div className="h-64 flex flex-col items-center justify-center text-center text-[#8696a0]">
            <HardDrive className="w-12 h-12 opacity-30 text-[#00a884] mb-3" />
            <p className="text-sm">No media files currently in the vault.</p>
            <p className="text-xs text-[#667781] mt-1">
              Upload videos or documents when scheduling messages to manage them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaItems.map((item) => {
              const fileName = item.mediaPath ? item.mediaPath.split('/').pop() : '';
              const fileUrl = `/uploads/${fileName}`;

              return (
                <div
                  key={item.id}
                  className="bg-[#111b21] border border-[#2a3942] rounded-xl overflow-hidden flex flex-col shadow-sm group hover:border-[#00a884]/40 transition-colors"
                >
                  {/* Media Preview Box */}
                  <div className="h-40 bg-black/60 relative flex items-center justify-center overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={fileUrl}
                        alt={item.mediaFileName || 'Image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : item.type === 'video' ? (
                      <video
                        src={fileUrl}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#00a884]">
                        <FileText className="w-12 h-12" />
                        <span className="text-[11px] text-[#8696a0] uppercase">
                          {item.mediaMimeType?.split('/')[1] || 'PDF'}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      {item.type === 'video' && <Video className="w-3 h-3 text-[#00a884]" />}
                      {item.type === 'image' && <ImageIcon className="w-3 h-3 text-[#00a884]" />}
                      {item.type === 'document' && <FileText className="w-3 h-3 text-[#00a884]" />}
                      <span>{item.type}</span>
                    </span>
                  </div>

                  {/* Information Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-medium text-[#e9edef] truncate mb-0.5">
                        {item.mediaFileName || 'Attachment'}
                      </h4>
                      <p className="text-[11px] text-[#8696a0] truncate">
                        To: {item.recipientName || item.recipient}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-[#222d34] flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelect(item.id)}
                        className="text-[#00a884] hover:underline font-medium text-[11px]"
                      >
                        Inspect
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={fileUrl}
                          download={item.mediaFileName || 'download'}
                          className="p-1 hover:text-white text-[#8696a0]"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 hover:text-[#ea4335] text-[#8696a0]"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
