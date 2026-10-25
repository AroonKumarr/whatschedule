import React, { useState } from 'react';
import { Contact } from '../types';
import { api } from '../services/api';
import {
  X,
  Clock,
  Video,
  FileText,
  Upload,
  User,
  Phone,
  Search,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { addMinutes, addHours, setHours, setMinutes, addDays, format } from 'date-fns';
import { VoiceSchedulerButton } from './VoiceSchedulerButton';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  contacts: Contact[];
  initialText?: string;
  initialRecipient?: string;
}

const COUNTRY_CODES = [
  { code: '+92', country: 'Pakistan' },
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+65', country: 'Singapore' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+966', country: 'Saudi Arabia' },
];

export type SocialPlatform = 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'x';

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { name: string; color: string; maxChars: number; label: string }
> = {
  whatsapp: { name: 'WhatsApp', color: '#25D366', maxChars: 65536, label: 'WhatsApp Message' },
  instagram: { name: 'Instagram', color: '#E4405F', maxChars: 2200, label: 'Instagram Post / Reel' },
  facebook: { name: 'Facebook', color: '#1877F2', maxChars: 63206, label: 'Facebook Page Post' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', maxChars: 3000, label: 'LinkedIn Article / Post' },
  x: { name: 'X (Twitter)', color: '#000000', maxChars: 280, label: 'X Post' },
};

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contacts,
  initialText = '',
  initialRecipient = '',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('whatsapp');
  const [contactMode, setContactMode] = useState<'contacts' | 'direct'>(
    initialRecipient || contacts.length > 0 ? 'contacts' : 'direct'
  );
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactJid, setSelectedContactJid] = useState(
    initialRecipient || (contacts.length > 0 ? contacts[0].id : '')
  );

  const [countryCode, setCountryCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Default: Tomorrow at 9:00 AM
  const defaultTomorrow9am = format(
    setMinutes(setHours(addDays(new Date(), 1), 9), 0),
    "yyyy-MM-dd'T'HH:mm"
  );
  const [scheduledAt, setScheduledAt] = useState(defaultTomorrow9am);
  const [content, setContent] = useState(initialText);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasConsent, setHasConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialText) setContent(initialText);
  }, [initialText]);

  React.useEffect(() => {
    if (initialRecipient) {
      setSelectedContactJid(initialRecipient);
      setContactMode('contacts');
    }
  }, [initialRecipient]);

  if (!isOpen) return null;

  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const MAX_CHAR_LIMIT = 65536; // Official WhatsApp maximum limit
  const MAX_FILE_SIZE_MB = 100; // 100MB maximum file size limit

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || c.number.includes(q);
  });

  const applyPreset = (preset: '15m' | '1h' | 'tomorrow9am' | 'tomorrow9pm') => {
    const now = new Date();
    let target = now;
    if (preset === '15m') target = addMinutes(now, 15);
    else if (preset === '1h') target = addHours(now, 1);
    else if (preset === 'tomorrow9am') target = setMinutes(setHours(addDays(now, 1), 9), 0);
    else if (preset === 'tomorrow9pm') target = setMinutes(setHours(addDays(now, 1), 21), 0);

    setScheduledAt(format(target, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleAiDraft = async () => {
    if (!aiPromptInput.trim()) return;
    setIsAiGenerating(true);
    setError(null);
    try {
      const draft = await api.generateAIDraft(aiPromptInput, 'professional', recipientName);
      setContent(draft);
      setShowAiPrompt(false);
      setAiPromptInput('');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate AI draft');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Limit is ${MAX_FILE_SIZE_MB} MB.`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasConsent) {
      setError('You must confirm that you have permission to contact this recipient.');
      return;
    }

    const maxLimit = PLATFORM_CONFIG[selectedPlatform].maxChars;
    if (content.length > maxLimit) {
      setError(`Message exceeds ${PLATFORM_CONFIG[selectedPlatform].name} limit of ${maxLimit} characters.`);
      return;
    }

    let finalRecipient = '';
    let finalName = recipientName;

    if (selectedPlatform !== 'whatsapp') {
      finalRecipient = `${selectedPlatform}@social.post`;
      finalName = `${PLATFORM_CONFIG[selectedPlatform].name} Post`;
    } else if (contactMode === 'direct') {
      let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!cleanNumber) {
        setError('Please enter a valid phone number');
        return;
      }
      const codeDigits = countryCode.replace(/[^0-9]/g, '') || '92';
      if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.replace(/^0+/, '');
      }
      if (!cleanNumber.startsWith(codeDigits)) {
        finalRecipient = `${codeDigits}${cleanNumber}`;
      } else {
        finalRecipient = cleanNumber;
      }
    } else {
      if (!selectedContactJid) {
        setError('Please select a contact from the list');
        return;
      }
      finalRecipient = selectedContactJid;
      const c = contacts.find((item) => item.id === selectedContactJid);
      if (c?.name) finalName = c.name;
    }

    if (!scheduledAt) {
      setError('Please choose a date and time for the message');
      return;
    }

    if (!content.trim() && !selectedFile) {
      setError('Please type a message or attach a file');
      return;
    }

    const formData = new FormData();
    formData.append('recipient', finalRecipient);
    if (finalName) formData.append('recipientName', finalName);
    formData.append('content', content);
    formData.append('scheduledAt', new Date(scheduledAt).toISOString());
    if (selectedFile) {
      formData.append('media', selectedFile);
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Light & Dark Adaptive Modal Shell */}
      <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[94vh] overflow-hidden text-[#16231F] dark:text-[#F2F7F4] transition-colors duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F0F5F2] dark:bg-[#1E2B25] border-b border-[#DCE7E1] dark:border-[#2D3D35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-xl text-[#087F5B] dark:text-[#25C993]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                Schedule WhatsApp Message
              </h2>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Dispatches automatically via WhatsApp multi-device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#788980] hover:text-[#16231F] dark:hover:text-[#F2F7F4] rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[#B42318]/10 dark:bg-[#FF938B]/15 border border-[#B42318]/20 dark:border-[#FF938B]/30 rounded-xl text-xs text-[#B42318] dark:text-[#FF938B] font-medium">
              {error}
            </div>
          )}

          {/* Voice to AI Scheduling Assistant Banner */}
          <div className="p-3.5 bg-gradient-to-r from-[#E5F5EF] to-emerald-50/50 dark:from-[#1D3830] dark:to-[#172B24] border border-[#087F5B]/25 dark:border-[#25C993]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#087F5B] dark:text-[#25C993]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Voice to AI Fast Scheduler</span>
              </div>
              <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] mt-0.5">
                Say: &quot;Send message to Aroon tomorrow at 9pm message is let&apos;s play cricket&quot;
              </p>
            </div>
            <VoiceSchedulerButton
              contacts={contacts}
              onParsed={(parsed) => {
                if (parsed.recipientJid) {
                  setSelectedContactJid(parsed.recipientJid);
                  setContactMode('contacts');
                } else if (parsed.phoneNumber) {
                  setPhoneNumber(parsed.phoneNumber);
                  setContactMode('direct');
                }
                if (parsed.recipientName) {
                  setRecipientName(parsed.recipientName);
                }
                if (parsed.message) {
                  setContent(parsed.message);
                }
                if (parsed.scheduledAt) {
                  try {
                    const d = new Date(parsed.scheduledAt);
                    setScheduledAt(format(d, "yyyy-MM-dd'T'HH:mm"));
                  } catch (_) {}
                }
              }}
            />
          </div>

          {/* 1. Multi-Platform Selector (Brand Spec) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91]">
              Publishing Destination
            </label>
            <div className="flex flex-wrap gap-2">
              {(['whatsapp', 'instagram', 'facebook', 'linkedin', 'x'] as SocialPlatform[]).map((p) => {
                const conf = PLATFORM_CONFIG[p];
                const isSelected = selectedPlatform === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    style={
                      isSelected
                        ? { borderColor: conf.color, color: conf.color, backgroundColor: `${conf.color}15` }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }} />
                    <span>{conf.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Recipient / Account Selection */}
          {selectedPlatform === 'whatsapp' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91] mb-2">
                WhatsApp Recipient
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setContactMode('contacts')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    contactMode === 'contacts'
                      ? 'bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] border-[#087F5B]/30 dark:border-[#25C993]/30'
                      : 'bg-[#F6F9F7] dark:bg-[#101815] text-[#5D7168] dark:text-[#8A9A91] border-[#DCE7E1] dark:border-[#2D3D35]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>From Contacts ({contacts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContactMode('direct')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    contactMode === 'direct'
                      ? 'bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] border-[#087F5B]/30 dark:border-[#25C993]/30'
                      : 'bg-[#F6F9F7] dark:bg-[#101815] text-[#5D7168] dark:text-[#8A9A91] border-[#DCE7E1] dark:border-[#2D3D35]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Phone Number</span>
                </button>
              </div>

              {/* Mode 1: Contact Picker */}
              {contactMode === 'contacts' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#788980] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search synced contacts..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl pl-9 pr-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#25C993]"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-[#DCE7E1] dark:divide-[#2D3D35] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl bg-[#F6F9F7] dark:bg-[#101815]">
                    {filteredContacts.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#788980]">
                        No contacts found matching search.
                      </div>
                    ) : (
                      filteredContacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedContactJid(c.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer text-xs transition-colors ${
                            selectedContactJid === c.id
                              ? 'bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-semibold'
                              : 'hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25] text-[#16231F] dark:text-[#F2F7F4]'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block font-medium truncate">{c.name || c.number}</span>
                            <span className="text-[10px] text-[#788980] dark:text-[#8A9A91]">{c.number}</span>
                          </div>
                          {selectedContactJid === c.id && (
                            <Check className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Mode 2: Direct Phone Input */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-2 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] focus:outline-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      placeholder="Mobile Number (without leading 0)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Recipient Name (e.g. Client / Project Manager)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Social Channel Publishing Indicator */
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLATFORM_CONFIG[selectedPlatform].color }}
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    {PLATFORM_CONFIG[selectedPlatform].label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Publishing to your authorized {PLATFORM_CONFIG[selectedPlatform].name} account
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                Connected
              </span>
            </div>
          )}

          {/* Schedule Date & Time Selection with Instant Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91] mb-2">
              Dispatch Date & Time
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset('15m')}
                className="py-2 px-3 bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl text-[#16231F] dark:text-[#F2F7F4] transition-colors font-medium text-center"
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1h')}
                className="py-2 px-3 bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl text-[#16231F] dark:text-[#F2F7F4] transition-colors font-medium text-center"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9am')}
                className="py-2 px-3 bg-[#E5F5EF] dark:bg-[#1D3830] border border-[#087F5B]/30 dark:border-[#25C993]/40 text-[#087F5B] dark:text-[#25C993] font-semibold rounded-xl hover:bg-[#D4ECE2] dark:hover:bg-[#254A40] transition-colors text-center"
              >
                Tomorrow 9am
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9pm')}
                className="py-2 px-3 bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl text-[#16231F] dark:text-[#F2F7F4] transition-colors font-medium text-center"
              >
                Tomorrow 9pm
              </button>
            </div>

            {/* Adaptive Datetime Input */}
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-3 text-sm text-[#16231F] dark:text-[#F2F7F4] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#25C993]"
            />
          </div>

          {/* Media & Document Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91] mb-2">
              Attach Video, Photo or Document (Optional)
            </label>
            <div className="border-2 border-dashed border-[#DCE7E1] dark:border-[#2D3D35] hover:border-[#087F5B]/70 dark:hover:border-[#25C993]/70 bg-[#F6F9F7] dark:bg-[#101815] rounded-2xl p-4 text-center transition-colors relative">
              <input
                type="file"
                id="media-upload"
                onChange={handleFileChange}
                accept="video/*,image/*,audio/*,.heic,.heif,.mov,.m4a,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between bg-[#F0F5F2] dark:bg-[#1E2B25] p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-[#087F5B] dark:text-[#25C993] shrink-0" />
                    <span className="truncate font-semibold">{selectedFile.name}</span>
                    <span className="text-[#788980] dark:text-[#8A9A91]">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:text-[#B42318] text-[#788980]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-xs text-[#788980] dark:text-[#8A9A91]">
                  <Upload className="w-6 h-6 text-[#087F5B] dark:text-[#25C993]" />
                  <span>
                    <strong className="text-[#16231F] dark:text-[#F2F7F4]">Tap to upload</strong> or drag & drop files
                  </span>
                  <span className="text-[11px] text-[#788980] dark:text-[#8A9A91]">
                    iPhone Photos (.heic, .png), HD Videos (.mov, .mp4), Voice Memos (.m4a), Documents (.pdf)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message Content with Live Counter & AI Assistant */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91]">
                Message Text / Caption
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiPrompt(!showAiPrompt)}
                  className="text-xs text-[#087F5B] dark:text-[#25C993] hover:underline font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assist Draft</span>
                </button>
                <span className={`text-[11px] font-mono ${content.length > PLATFORM_CONFIG[selectedPlatform].maxChars * 0.85 ? 'text-amber-500 font-bold' : 'text-[#788980] dark:text-[#8A9A91]'}`}>
                  {content.length.toLocaleString()} / {PLATFORM_CONFIG[selectedPlatform].maxChars.toLocaleString()} chars
                </span>
              </div>
            </div>

            {/* AI Prompt Input Bar */}
            {showAiPrompt && (
              <div className="mb-2.5 p-2.5 bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-xl border border-[#087F5B]/30 dark:border-[#25C993]/30 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Follow up with HR about salary slip politely..."
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiDraft();
                    }
                  }}
                  className="flex-1 bg-transparent text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAiDraft}
                  disabled={isAiGenerating || !aiPromptInput.trim()}
                  className="px-3 py-1 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] disabled:opacity-50 text-white dark:text-[#0D3027] rounded-lg text-xs font-semibold"
                >
                  {isAiGenerating ? 'Drafting...' : 'Generate'}
                </button>
              </div>
            )}

            <textarea
              rows={4}
              maxLength={PLATFORM_CONFIG[selectedPlatform].maxChars}
              placeholder={`Write your ${PLATFORM_CONFIG[selectedPlatform].name} post or message here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-3 text-sm text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#25C993] resize-none"
            />
          </div>

          {/* Compliance & Consent Confirmation */}
          <div className="bg-[#F0F5F2] dark:bg-[#1E2B25] p-3 rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35]">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#16231F] dark:text-[#F2F7F4]">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 rounded border-[#DCE7E1] dark:border-[#2D3D35] text-[#087F5B] dark:text-[#25C993] focus:ring-0"
              />
              <span className="leading-relaxed text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
                I confirm this content complies with platform guidelines and community policies. (PECA / GDPR / Spam safeguards).
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              style={{ backgroundColor: PLATFORM_CONFIG[selectedPlatform].color }}
              className="w-full py-3.5 text-white font-bold rounded-xl text-sm transition-transform active:scale-[0.99] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Scheduling Post in Local Queue...</span>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Schedule on {PLATFORM_CONFIG[selectedPlatform].name}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
