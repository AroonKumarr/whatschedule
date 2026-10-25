import React, { useState, useRef, useEffect } from 'react';
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
  MicOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';

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

  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceNotice('Listening... speak your command ("send message at 9pm...")');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript;
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setVoiceNotice('Microphone access blocked. Click mic again to type command.');
          } else if (event.error !== 'no-speech') {
            setVoiceNotice(`Mic error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const spoken = transcriptRef.current.trim();
          if (spoken) {
            handleProcessVoice(spoken);
          }
        };

        recognitionRef.current = recognition;
      } catch (_) {}
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const handleProcessVoice = async (spokenText: string) => {
    setIsProcessingVoice(true);
    setVoiceNotice(`AI parsing: "${spokenText}"...`);
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const parsed = await api.parseVoiceCommand(spokenText, userTz);

      if (parsed.message) {
        setText(parsed.message);
      } else {
        setText(spokenText);
      }

      setVoiceNotice(
        parsed.scheduledAt
          ? `Parsed! Scheduled for ${new Date(parsed.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Parsed message! Ready to send.'
      );

      // If scheduled time detected, auto-open schedule popover with prefilled content
      if (parsed.scheduledAt) {
        setTimeout(() => {
          onOpenSchedulePopover(parsed.message || spokenText, selectedFile);
        }, 600);
      }

      setTimeout(() => setVoiceNotice(null), 4000);
    } catch (err: any) {
      setText(spokenText);
      setVoiceNotice('Voice parsed as plain text.');
      setTimeout(() => setVoiceNotice(null), 3000);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      return;
    }

    if (!recognitionRef.current) {
      const manual = prompt('Voice recognition unavailable in browser. Type your scheduling command:');
      if (manual?.trim()) {
        handleProcessVoice(manual.trim());
      }
      return;
    }

    transcriptRef.current = '';
    setVoiceNotice(null);

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        try {
          recognitionRef.current.start();
        } catch (_) {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      })
      .catch(() => {
        const manual = prompt('Microphone permission blocked. Type your scheduling command:');
        if (manual?.trim()) {
          handleProcessVoice(manual.trim());
        }
      });
  };

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
    } else {
      handleMicClick();
    }
  };

  const hasContent = text.trim().length > 0 || selectedFile !== null;

  return (
    <div className="w-full relative z-20 flex flex-col">
      {/* Voice Status Pill Notice */}
      {voiceNotice && (
        <div className="mx-4 mb-1.5 px-3 py-1.5 rounded-xl bg-[#144D37] border border-[#2DD4A7]/30 text-xs text-[#E9EDEF] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 truncate">
            {isProcessingVoice ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2DD4A7] shrink-0" />
            ) : isListening ? (
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4A7] shrink-0" />
            )}
            <span className="truncate">{voiceNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            className="text-[#A0A0A0] hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="w-full h-[56px] min-h-[56px] px-3 sm:px-4 flex items-center justify-between gap-2 bg-transparent pb-env-safe">
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

        {/* Right: 30px Circle Button (Accent Green #2DD4A7) with Live Voice AI */}
        <button
          type="button"
          onClick={handleSendClick}
          disabled={isSending || isProcessingVoice}
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
              : 'bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027]'
          }`}
          title={
            hasContent
              ? 'Send now'
              : isListening
              ? 'Listening... tap to process'
              : 'Voice AI (Click & Speak command)'
          }
          aria-label={hasContent ? 'Send now' : 'Voice AI'}
        >
          {hasContent ? (
            <Send className="w-3.5 h-3.5 transition-transform duration-150 rotate-0" />
          ) : isProcessingVoice ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
