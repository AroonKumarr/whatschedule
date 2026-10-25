import React, { useState } from 'react';
import { Contact } from '../types';
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

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  contacts: Contact[];
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+65', country: 'Singapore' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+966', country: 'Saudi Arabia' },
];

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contacts,
}) => {
  if (!isOpen) return null;

  const [contactMode, setContactMode] = useState<'contacts' | 'direct'>(
    contacts.length > 0 ? 'contacts' : 'direct'
  );
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactJid, setSelectedContactJid] = useState(
    contacts.length > 0 ? contacts[0].id : ''
  );

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Default: Tomorrow at 9:00 AM
  const defaultTomorrow9am = format(
    setMinutes(setHours(addDays(new Date(), 1), 9), 0),
    "yyyy-MM-dd'T'HH:mm"
  );
  const [scheduledAt, setScheduledAt] = useState(defaultTomorrow9am);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasConsent, setHasConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (content.length > MAX_CHAR_LIMIT) {
      setError(`Message exceeds WhatsApp limit of ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    let finalRecipient = '';
    let finalName = recipientName;

    if (contactMode === 'direct') {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!cleanNumber) {
        setError('Please enter a valid phone number');
        return;
      }
      const codeDigits = countryCode.replace(/[^0-9]/g, '');
      finalRecipient = `${codeDigits}${cleanNumber}`;
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      {/* 100% WhatsApp Dark Container (Zero White Popups) */}
      <div className="bg-[#202c33] border border-[#2a3942] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-[#e9edef]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111b21] border-b border-[#222d34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00a884]/20 rounded-xl text-[#00a884]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e9edef]">Schedule Message / Media</h3>
              <p className="text-xs text-[#8696a0]">Dispatches automatically in the background</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#202c33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[#ea4335]/15 border border-[#ea4335]/30 rounded-xl text-xs text-[#ea4335]">
              {error}
            </div>
          )}

          {/* Contact Selector (Contacts at Top for 1-Tap Ease) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">
                Select Recipient
              </label>
              <div className="flex rounded-lg bg-[#111b21] p-0.5 border border-[#2a3942] text-xs">
                <button
                  type="button"
                  onClick={() => setContactMode('contacts')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    contactMode === 'contacts'
                      ? 'bg-[#00a884] text-white font-medium'
                      : 'text-[#8696a0] hover:text-white'
                  }`}
                >
                  WhatsApp Contacts ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('direct')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    contactMode === 'direct'
                      ? 'bg-[#00a884] text-white font-medium'
                      : 'text-[#8696a0] hover:text-white'
                  }`}
                >
                  Enter Phone Number
                </button>
              </div>
            </div>

            {contactMode === 'contacts' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search synced contacts by name or number..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl pl-9 pr-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>

                {/* Scrollable Contact Picker List */}
                <div className="max-h-40 overflow-y-auto bg-[#111b21] rounded-xl border border-[#2a3942] divide-y divide-[#222d34]/60">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#8696a0]">
                      {contacts.length === 0
                        ? 'No contacts synced yet. You can use "Enter Phone Number" tab to message anyone!'
                        : 'No contacts match your search.'}
                    </div>
                  ) : (
                    filteredContacts.map((c) => {
                      const isSelected = selectedContactJid === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedContactJid(c.id)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#005c4b]/50' : 'hover:bg-[#202c33]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : '#'}
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-medium text-[#e9edef] block truncate">
                                {c.name || c.number}
                              </span>
                              <span className="text-[10px] text-[#8696a0]">{c.number}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#25D366] shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#111b21] border border-[#2a3942] rounded-xl px-2.5 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#8696a0] absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8696a0] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. HR / Manager / Client)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl pl-9 pr-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Schedule Date & Time (Dark styled, no white calendar flash) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8696a0] mb-2">
              Delivery Date & Time
            </label>

            {/* Quick 1-Tap Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset('15m')}
                className="py-2 px-3 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-[#d1d7db] transition-colors font-medium text-center"
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1h')}
                className="py-2 px-3 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-[#d1d7db] transition-colors font-medium text-center"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9am')}
                className="py-2 px-3 bg-[#00a884]/20 border border-[#00a884]/50 text-[#25D366] font-semibold rounded-xl hover:bg-[#00a884]/30 transition-colors text-center"
              >
                Tomorrow 9am
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9pm')}
                className="py-2 px-3 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-[#d1d7db] transition-colors font-medium text-center"
              >
                Tomorrow 9pm
              </button>
            </div>

            {/* Dark Styled Datetime Input */}
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl p-3 text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884] [color-scheme:dark]"
            />
          </div>

          {/* Media & Document Attachment (Supports iPhone HEIC, MOV, Audio, PDF) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8696a0] mb-2">
              Attach Video, Photo or Document (Optional)
            </label>
            <div className="border-2 border-dashed border-[#2a3942] hover:border-[#00a884]/70 bg-[#111b21] rounded-2xl p-4 text-center transition-colors relative">
              <input
                type="file"
                id="media-upload"
                onChange={handleFileChange}
                accept="video/*,image/*,audio/*,.heic,.heif,.mov,.m4a,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between bg-[#202c33] p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-[#00a884] shrink-0" />
                    <span className="truncate font-medium">{selectedFile.name}</span>
                    <span className="text-[#8696a0]">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:text-[#ea4335] text-[#8696a0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-xs text-[#8696a0]">
                  <Upload className="w-6 h-6 text-[#00a884]" />
                  <span>
                    <strong className="text-[#d1d7db]">Tap to upload</strong> or drag & drop files
                  </span>
                  <span className="text-[11px] text-[#8696a0]">
                    iPhone Photos (.heic, .png), HD Videos (.mov, .mp4), Voice Memos (.m4a), Documents (.pdf)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message Content with Live Counter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">
                Message Text / Caption
              </label>
              <span className={`text-[11px] font-mono ${content.length > 4000 ? 'text-[#e5a800]' : 'text-[#8696a0]'}`}>
                {content.length.toLocaleString()} / {MAX_CHAR_LIMIT.toLocaleString()} chars
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={MAX_CHAR_LIMIT}
              placeholder="Type your scheduled message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl p-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] resize-none"
            />
          </div>

          {/* Compliance & Consent Confirmation */}
          <div className="bg-[#111b21] p-3 rounded-xl border border-[#2a3942]/60">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#d1d7db]">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 rounded border-[#3b4a54] bg-[#202c33] text-[#00a884] focus:ring-0"
              />
              <span className="leading-relaxed text-[11px] text-[#8696a0]">
                I confirm I have prior consent or a legitimate personal/business relationship with this recipient. (Anti-Spam & PECA/GDPR compliance).
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#00a884] hover:bg-[#02bd94] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Scheduling in Local Queue...</span>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Schedule WhatsApp Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
