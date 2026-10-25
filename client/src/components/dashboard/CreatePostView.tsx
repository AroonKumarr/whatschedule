import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Calendar,
  Clock,
  Send,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { Contact } from '../../types';
import { SocialPlatform } from '../ComposerModal';
import { VoiceSchedulerButton } from '../VoiceSchedulerButton';
import { api } from '../../services/api';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface CreatePostViewProps {
  contacts: Contact[];
  onSubmit: (formData: FormData) => Promise<void>;
  onSuccessNavigate?: () => void;
}

const PLATFORM_ICONS: Record<
  SocialPlatform,
  { name: string; color: string; label: string }
> = {
  whatsapp: { name: 'WhatsApp', color: '#25D366', label: 'WhatsApp Message' },
  instagram: { name: 'Instagram', color: '#E4405F', label: 'Instagram Post / Story' },
  facebook: { name: 'Facebook', color: '#1877F2', label: 'Facebook Page Post' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', label: 'LinkedIn Article' },
  x: { name: 'X (Twitter)', color: '#000000', label: 'X Post' },
};

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  contacts,
  onSubmit,
  onSuccessNavigate,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['whatsapp']);
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState(
    format(setMinutes(setHours(addDays(new Date(), 1), 9), 0), "yyyy-MM-dd'T'HH:mm")
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewMediaUrl(URL.createObjectURL(file));
      } else {
        setPreviewMediaUrl(null);
      }
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!content.trim() && !selectedFile) {
      alert('Please enter post text or attach an image/video.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      for (const platform of selectedPlatforms) {
        const formData = new FormData();
        const recipient =
          platform === 'whatsapp'
            ? contacts[0]?.id || 'broadcast@s.whatsapp.net'
            : `${platform}@social.post`;
        formData.append('recipient', recipient);
        formData.append('recipientName', `${PLATFORM_ICONS[platform].name} Broadcast`);
        formData.append('content', content);
        formData.append('scheduledAt', new Date(scheduledAt).toISOString());
        if (selectedFile) {
          formData.append('media', selectedFile);
        }
        await onSubmit(formData);
      }

      setStatusMessage('Post scheduled successfully across selected platforms!');
      setTimeout(() => {
        if (onSuccessNavigate) onSuccessNavigate();
      }, 1000);
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1319] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Post
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Design and schedule posts across WhatsApp, Instagram, Facebook, LinkedIn & X
          </p>
        </div>

        {/* Voice AI Shortcut */}
        <VoiceSchedulerButton
          contacts={contacts}
          onParsed={(parsed) => {
            if (parsed.message) setContent(parsed.message);
            if (parsed.scheduledAt) {
              setScheduledAt(format(new Date(parsed.scheduledAt), "yyyy-MM-dd'T'HH:mm"));
            }
          }}
        />
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Split: Form on Left (2 cols), Live Post Preview on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          
          {/* Select Platforms */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(['whatsapp', 'instagram', 'facebook', 'linkedin', 'x'] as SocialPlatform[]).map((p) => {
                const conf = PLATFORM_ICONS[p];
                const active = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
                    <span>{conf.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Post Content
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {content.length} chars
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="What's on your mind? Share news, photos or updates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Add Media (Drag & Drop box) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Add Media
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-6 text-center relative transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*,.pdf,.doc"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl text-xs max-w-sm mx-auto shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate font-semibold">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                      setPreviewMediaUrl(null);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
                  <Upload className="w-6 h-6 text-indigo-500" />
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">Click to upload</strong> or drag & drop
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports images, videos, reels and PDF brochures
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Scheduling Options */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Schedule For Later
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center text-xs text-slate-500 px-2 font-medium">
                Auto-dispatches at chosen local time
              </div>
            </div>
          </div>

          {/* Actions Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Schedule Post</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Post Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#15222E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Post Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Live Feed
              </span>
            </div>

            {/* Mock Social Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/60 shadow-2xs">
              <div className="p-3 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  WS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    WhatsSchedule
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Scheduled for {format(new Date(scheduledAt), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>

              {previewMediaUrl && (
                <img
                  src={previewMediaUrl}
                  alt="Post preview"
                  className="w-full h-44 object-cover"
                />
              )}

              <div className="p-3 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[60px]">
                {content || 'Fresh updates for your everyday tasks...'}
              </div>

              <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-3">
                <span>0 likes</span>
                <span>0 comments</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
