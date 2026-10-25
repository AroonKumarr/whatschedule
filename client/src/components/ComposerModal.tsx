import React, { useState } from 'react';
import { Contact } from '../types';
import {
  X,
  Calendar,
  Clock,
  Video,
  FileText,
  Upload,
  User,
  Phone,
  Sparkles,
  Check,
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

  const [contactMode, setContactMode] = useState<'direct' | 'contacts'>('direct');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedContactJid, setSelectedContactJid] = useState('');

  // Default schedule: Tomorrow 9:00 AM (as requested in the prompt)
  const defaultTomorrow9am = format(
    setMinutes(setHours(addDays(new Date(), 1), 9), 0),
    "yyyy-MM-dd'T'HH:mm"
  );
  const [scheduledAt, setScheduledAt] = useState(defaultTomorrow9am);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset Date-Time Handlers
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
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      setError('Please pick a date and time for the schedule');
      return;
    }

    if (!content.trim() && !selectedFile) {
      setError('Please enter a message or attach a media file / document');
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#202c33] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#e9edef]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111b21] border-b border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00a884]/20 rounded-lg text-[#00a884]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e9edef]">New WhatsApp Schedule</h3>
              <p className="text-xs text-[#8696a0]">Dispatches automatically in background</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#202c33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[#ea4335]/15 border border-[#ea4335]/30 rounded-lg text-xs text-[#ea4335]">
              {error}
            </div>
          )}

          {/* Contact Input Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">
                Recipient Contact
              </label>
              <div className="flex rounded-lg bg-[#111b21] p-0.5 border border-[#2a3942] text-[11px]">
                <button
                  type="button"
                  onClick={() => setContactMode('direct')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    contactMode === 'direct'
                      ? 'bg-[#00a884] text-white font-medium'
                      : 'text-[#8696a0] hover:text-white'
                  }`}
                >
                  Direct Number
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('contacts')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    contactMode === 'contacts'
                      ? 'bg-[#00a884] text-white font-medium'
                      : 'text-[#8696a0] hover:text-white'
                  }`}
                >
                  Saved Contacts ({contacts.length})
                </button>
              </div>
            </div>

            {contactMode === 'direct' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#111b21] border border-[#2a3942] rounded-lg px-2.5 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#8696a0] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210 (HR / Manager)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-9 pr-3 py-2 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8696a0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. HR / Team Lead / Client)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>
            ) : (
              <select
                value={selectedContactJid}
                onChange={(e) => setSelectedContactJid(e.target.value)}
                className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-2.5 text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
              >
                <option value="">Select a synced contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.number})` : c.number}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8696a0] mb-2">
              Dispatch Time & Date
            </label>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset('15m')}
                className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg text-[#d1d7db] transition-colors"
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1h')}
                className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg text-[#d1d7db] transition-colors"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9am')}
                className="px-2.5 py-1.5 bg-[#00a884]/20 border border-[#00a884]/40 text-[#25D366] font-medium rounded-lg hover:bg-[#00a884]/30 transition-colors"
              >
                Tomorrow 9am
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tomorrow9pm')}
                className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg text-[#d1d7db] transition-colors"
              >
                Tomorrow 9pm
              </button>
            </div>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-2.5 text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          {/* Media & Document Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8696a0] mb-2">
              Attach Media / Document (Optional)
            </label>
            <div className="border-2 border-dashed border-[#2a3942] hover:border-[#00a884]/60 bg-[#111b21] rounded-xl p-4 text-center transition-colors relative">
              <input
                type="file"
                id="media-upload"
                onChange={handleFileChange}
                accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between bg-[#202c33] p-2 rounded-lg text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#00a884] shrink-0" />
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
                    <strong className="text-[#d1d7db]">Click to upload</strong> or drag & drop
                  </span>
                  <span className="text-[10px] text-[#667781]">
                    HD Videos (.mp4, .mov), Photos (.jpg, .png), Documents (.pdf, .docx)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message Text / Caption */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8696a0] mb-2">
              Message Content / Media Caption
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Good morning! Following up regarding the salary slip update as discussed..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00a884] hover:bg-[#02bd94] disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Scheduling in SQLite Queue...</span>
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
