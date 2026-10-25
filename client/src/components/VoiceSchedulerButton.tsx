import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Loader2, CheckCircle2, AlertCircle, Keyboard, Send } from 'lucide-react';
import { api } from '../services/api';
import { Contact } from '../types';

interface VoiceSchedulerButtonProps {
  contacts: Contact[];
  onParsed: (data: {
    recipientJid?: string;
    recipientName?: string;
    phoneNumber?: string;
    message?: string;
    scheduledAt?: string;
  }) => void;
  className?: string;
}

export const VoiceSchedulerButton: React.FC<VoiceSchedulerButtonProps> = ({
  contacts,
  onParsed,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [showInputBar, setShowInputBar] = useState(false);
  const [manualText, setManualText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusType('info');
        setStatusMessage('Listening... speak now ("Send message to Aroon tomorrow at 9am...")');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = currentTranscript;
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusType('error');
          setStatusMessage('Microphone access denied. Click the keyboard icon to type command.');
          setShowInputBar(true);
        } else if (event.error !== 'no-speech') {
          setStatusType('error');
          setStatusMessage(`Mic error (${event.error}). Click keyboard to type command.`);
          setShowInputBar(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const text = transcriptRef.current.trim();
        if (text) {
          processTranscript(text);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      setShowInputBar(true);
      setStatusType('info');
      setStatusMessage('Enter your voice scheduling instruction:');
      return;
    }

    transcriptRef.current = '';
    setStatusMessage(null);

    // Request microphone permission and start
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        // Stream acquired successfully, release tracks and start speech recognition
        stream.getTracks().forEach((track) => track.stop());
        try {
          recognitionRef.current.start();
        } catch (e) {
          try {
            recognitionRef.current.stop();
            setTimeout(() => recognitionRef.current.start(), 200);
          } catch (_) {
            setShowInputBar(true);
          }
        }
      })
      .catch((err) => {
        console.warn('Microphone permission rejected or unavailable:', err);
        setStatusType('error');
        setStatusMessage('Mic permission unavailable in browser. Type your command below:');
        setShowInputBar(true);
      });
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setStatusType('info');
    setStatusMessage(`AI analyzing: "${text}"...`);

    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const result = await api.parseVoiceCommand(text, userTz);

      let matchedJid: string | undefined = undefined;
      let matchedName: string | undefined = result.recipientName || undefined;
      let matchedNumber: string | undefined = undefined;

      // Contact matching
      if (result.recipientName) {
        const query = result.recipientName.toLowerCase().trim();
        const found = contacts.find(
          (c) =>
            (c.name && c.name.toLowerCase().includes(query)) ||
            c.number.includes(query) ||
            query.includes(c.name ? c.name.toLowerCase() : '---')
        );

        if (found) {
          matchedJid = found.id;
          matchedName = found.name || found.number;
          matchedNumber = found.number;
        } else {
          matchedName = result.recipientName;
        }
      }

      setStatusType('success');
      setStatusMessage(
        `Parsed! Recipient: ${matchedName || 'Detected'} | Time: ${
          result.scheduledAt
            ? new Date(result.scheduledAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Immediate'
        }`
      );

      onParsed({
        recipientJid: matchedJid,
        recipientName: matchedName,
        phoneNumber: matchedNumber,
        message: result.message || text,
        scheduledAt: result.scheduledAt || undefined,
      });

      setShowInputBar(false);
      setManualText('');

      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err?.message || 'Failed to parse command. Try typing it.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manualText.trim()) {
      processTranscript(manualText.trim());
    }
  };

  return (
    <div className={`relative flex flex-col items-start w-full ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Mic Button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30 ring-2 ring-rose-400'
              : isProcessing
              ? 'bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] cursor-wait'
              : 'bg-[#E5F5EF] hover:bg-[#D4ECE2] dark:bg-[#1D3830] dark:hover:bg-[#254A40] text-[#087F5B] dark:text-[#25C993] border border-[#087F5B]/30 dark:border-[#25C993]/40'
          }`}
          title="Voice-to-AI Scheduling Assistant"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#087F5B] dark:text-[#25C993]" />
          ) : isListening ? (
            <MicOff className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
          )}

          <span>
            {isProcessing
              ? 'AI Analyzing Command...'
              : isListening
              ? 'Tap to Finish Speaking'
              : 'Speak Command'}
          </span>

          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Quick Keyboard Toggle */}
        <button
          type="button"
          onClick={() => setShowInputBar(!showInputBar)}
          className="p-2 rounded-xl bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] border border-[#DCE7E1] dark:border-[#2D3D35] text-[#5D7168] dark:text-[#8A9A91] transition-colors"
          title="Type command text directly"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Manual Voice-Command Prompt Bar (Instant fallback / quick typing) */}
      {showInputBar && (
        <form onSubmit={handleManualSubmit} className="mt-2.5 w-full flex items-center gap-2 animate-in fade-in">
          <input
            type="text"
            placeholder='e.g. "Send message to Aroon tomorrow at 9pm message is let&#39;s play cricket"'
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-white dark:bg-[#101815] border border-[#087F5B]/40 dark:border-[#25C993]/40 rounded-xl px-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
            autoFocus
          />
          <button
            type="submit"
            disabled={isProcessing || !manualText.trim()}
            className="px-3 py-2 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Parse</span>
          </button>
        </form>
      )}

      {/* Status / Live Banner */}
      {statusMessage && (
        <div
          className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 w-full max-w-lg shadow-xs border animate-in fade-in transition-all ${
            statusType === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : statusType === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-[#F0F5F2] dark:bg-[#1E2B25] border-[#DCE7E1] dark:border-[#2D3D35] text-[#16231F] dark:text-[#F2F7F4]'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : statusType === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#25C993] animate-ping shrink-0" />
          )}
          <span className="truncate">{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
