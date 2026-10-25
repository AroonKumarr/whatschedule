import React, { useState, useRef } from 'react';
import {
  Plus,
  Smile,
  Send,
  Calendar,
  Clock,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';

interface ComposerProps {
  onSendMessage: (content: string, file: File | null) => void;
  onOpenSchedulePopover: (content: string, file: File | null) => void;
  isSending?: boolean;
  placeholder?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onOpenSchedulePopover,
  isSending = false,
  placeholder = 'Type a message to schedule or send...',
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() || selectedFile) {
        onSendMessage(text, selectedFile);
        setText('');
        setSelectedFile(null);
      }
    }
  };

  const handleSendClick = () => {
    if (text.trim() || selectedFile) {
      onSendMessage(text, selectedFile);
      setText('');
      setSelectedFile(null);
    }
  };

  const hasContent = text.trim().length > 0 || selectedFile !== null;

  return (
    <div className="w-full h-[56px] min-h-[56px] px-3 sm:px-4 flex items-center justify-between gap-2 bg-transparent relative z-20 pb-env-safe">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Left: 28px Circle Outline Attachment Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-7 h-7 rounded-full border border-[#4A4A4A] hover:border-[#2DD4A7] hover:bg-white/5 flex items-center justify-center text-[#A0A0A0] hover:text-[#2DD4A7] transition-all duration-150 shrink-0"
        title="Attach image, video or document"
        aria-label="Add attachment"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Center: Input Pill with Attached File Tag & Emoji */}
      <div className="flex-1 flex items-center bg-[#262626] border border-[#3A3A3A] rounded-2xl h-8 px-3 relative focus-within:border-[#2DD4A7] transition-colors overflow-hidden">
        {selectedFile && (
          <div className="flex items-center gap-1 bg-[#144D37] text-[#E9EDEF] px-1.5 py-0.5 rounded-lg text-[10px] font-medium mr-2 shrink-0 max-w-[120px] truncate">
            <FileText className="w-3 h-3 text-[#2DD4A7] shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-[#A0A0A0] hover:text-white ml-0.5"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[#E9EDEF] placeholder-[#A0A0A0] focus:outline-none"
          style={{ caretColor: '#2DD4A7' }}
        />

        {/* Right-aligned emoji button */}
        <button
          type="button"
          onClick={() => setText((prev) => prev + ' 😊')}
          className="text-[#A0A0A0] hover:text-[#2DD4A7] transition-colors ml-1 p-0.5"
          title="Add emoji"
          aria-label="Insert emoji"
        >
          <Smile className="w-4 h-4" />
        </button>
      </div>

      {/* Schedule Popover Trigger Button */}
      <button
        type="button"
        onClick={() => onOpenSchedulePopover(text, selectedFile)}
        className="h-7 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#3A3A3A] text-xs font-semibold text-[#2DD4A7] hover:border-[#2DD4A7]/40 flex items-center gap-1 transition-colors shrink-0"
        title="Schedule for future dispatch"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Schedule</span>
      </button>

      {/* Right: 30px Circle Button (Accent Green #2DD4A7) */}
      <button
        type="button"
        onClick={handleSendClick}
        disabled={isSending}
        className="w-[30px] h-[30px] rounded-full bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
        title={hasContent ? 'Send now' : 'Voice memo (Hold to record)'}
        aria-label={hasContent ? 'Send now' : 'Voice memo'}
      >
        {hasContent ? (
          <Send className="w-3.5 h-3.5 transition-transform duration-150 rotate-0" />
        ) : (
          <Mic className="w-3.5 h-3.5 transition-transform duration-150" />
        )}
      </button>
    </div>
  );
};
