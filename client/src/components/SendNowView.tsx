import React, { useState, useEffect } from 'react';
import { Contact, ScheduledMessage } from '../types';
import { api } from '../services/api';
import { OCCASION_TEMPLATES, AUTOFILL_PHRASES } from '../services/templates';
import {
  Send,
  User,
  Phone,
  Search,
  Check,
  Upload,
  FileText,
  X,
  Sparkles,
  Gift,
  Languages,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { addMinutes, addHours, addDays, format, setHours, setMinutes } from 'date-fns';

interface SendNowViewProps {
  contacts: Contact[];
  onMessageSent: () => void;
}

export const SendNowView: React.FC<SendNowViewProps> = ({ contacts, onMessageSent }) => {
  const [contactMode, setContactMode] = useState<'contacts' | 'direct'>(
    contacts.length > 0 ? 'contacts' : 'direct'
  );
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactJid, setSelectedContactJid] = useState(
    contacts.length > 0 ? contacts[0].id : ''
  );
  const [countryCode, setCountryCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Dispatch Mode: 'send_now' (Instant Send) vs 'schedule' (Scheduled for Future)
  const [dispatchMode, setDispatchMode] = useState<'send_now' | 'schedule'>('send_now');
  const [scheduledAtDate, setScheduledAtDate] = useState(() => {
    // Default scheduled time: 1 hour in the future
    return format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
  });

  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Smart Autofill Toggle & State
  const [autofillEnabled, setAutofillEnabled] = useState<boolean>(() => {
    return localStorage.getItem('whatschedule_autofill') !== 'false';
  });

  // Templates Modal State
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templateLanguage, setTemplateLanguage] = useState<'all' | 'en' | 'es' | 'hi' | 'ur' | 'ar' | 'fr' | 'de'>('all');

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || c.number.includes(q);
  });

  const filteredTemplates = OCCASION_TEMPLATES.filter((t) => {
    if (templateLanguage === 'all') return true;
    return t.language === templateLanguage;
  });

  const handleApplyTemplate = (text: string) => {
    const personalized = text.replace('{Name}', recipientName || 'there');
    setContent(personalized);
    setShowTemplatesModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        setStatusMessage({
          type: 'error',
          text: `File exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    let finalRecipient = '';
    let finalName = recipientName;

    if (contactMode === 'direct') {
      let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!cleanNumber) {
        setStatusMessage({ type: 'error', text: 'Please enter a valid phone number.' });
        return;
      }
      const cleanCc = countryCode.replace(/[^0-9]/g, '') || '92';

      // Smart normalization for local numbers starting with 0 (e.g. 03001234567 -> 923001234567)
      if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.replace(/^0+/, '');
      }

      if (!cleanNumber.startsWith(cleanCc)) {
        finalRecipient = `${cleanCc}${cleanNumber}`;
      } else {
        finalRecipient = cleanNumber;
      }
    } else {
      if (!selectedContactJid) {
        setStatusMessage({ type: 'error', text: 'Please select a contact.' });
        return;
      }
      finalRecipient = selectedContactJid;
      const c = contacts.find((item) => item.id === selectedContactJid);
      if (c?.name) finalName = c.name;
    }

    if (!content.trim() && !selectedFile) {
      setStatusMessage({ type: 'error', text: 'Please type a message or attach a file.' });
      return;
    }

    setIsSending(true);
    setSendingProgress(15);

    try {
      const formData = new FormData();
      formData.append('recipient', finalRecipient);
      if (finalName) formData.append('recipientName', finalName);
      formData.append('content', content);

      const targetIso = dispatchMode === 'send_now'
        ? new Date().toISOString()
        : new Date(scheduledAtDate).toISOString();

      formData.append('scheduledAt', targetIso);

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      setSendingProgress(45);
      const created = await api.createSchedule(formData);

      if (dispatchMode === 'send_now') {
        setSendingProgress(75);
        // Trigger instant Send Now via atomic backend lock
        await api.sendNow(created.id);
        setSendingProgress(100);
        setStatusMessage({ type: 'success', text: `Message sent immediately to ${finalName || finalRecipient}!` });
      } else {
        setSendingProgress(100);
        setStatusMessage({
          type: 'success',
          text: `Message successfully scheduled for ${format(new Date(scheduledAtDate), 'PPp')}!`,
        });
      }

      setContent('');
      setSelectedFile(null);
      onMessageSent();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to dispatch message.' });
    } finally {
      setTimeout(() => {
        setIsSending(false);
        setSendingProgress(0);
      }, 500);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-y-auto select-none transition-colors duration-150 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE7E1] dark:border-[#2D3D35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#087F5B] dark:bg-[#25C993] text-white dark:text-[#0D3027] flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
                Send Now (Instant Dispatch)
              </h1>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Dispatches immediately via WhatsApp with zero scheduling delay
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="px-3 py-1.5 bg-[#E5F5EF] hover:bg-[#D4ECE2] dark:bg-[#1D3830] dark:hover:bg-[#254A40] text-[#087F5B] dark:text-[#25C993] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993] border-[#087F5B]/30'
                : 'bg-[#B42318]/10 text-[#B42318] dark:text-[#FF938B] border-[#B42318]/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSendNowSubmit} className="space-y-5">
          
          {/* Recipient Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91] mb-2">
              Select Recipient
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
                <span>Contacts ({contacts.length})</span>
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

                <div className="max-h-32 overflow-y-auto divide-y divide-[#DCE7E1] dark:divide-[#2D3D35] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl bg-[#F6F9F7] dark:bg-[#101815]">
                  {filteredContacts.map((c) => (
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
                      {selectedContactJid === c.id && <Check className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-20 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-2.5 text-xs text-[#16231F] dark:text-[#F2F7F4] text-center font-mono focus:outline-none focus:border-[#087F5B]"
                    placeholder="+1"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (without leading 0)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-2.5 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Recipient Name (optional)"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-2.5 text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B]"
                />
              </div>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91]">
                Message Content
              </label>
              <span className="text-[11px] font-mono text-[#788980]">
                {content.length.toLocaleString()} / 65,536 chars
              </span>
            </div>

            {/* Smart Autofill Suggestions Pills */}
            {autofillEnabled && (
              <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[10px] text-[#788980] shrink-0 font-semibold uppercase">Suggestions:</span>
                {AUTOFILL_PHRASES.slice(0, 4).map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setContent((prev) => (prev ? `${prev} ${phrase}` : phrase))}
                    className="shrink-0 px-2.5 py-1 bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] text-[#087F5B] dark:text-[#25C993] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-lg text-[11px] font-medium transition-colors"
                  >
                    + {phrase.slice(0, 24)}...
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={4}
              placeholder="Type your WhatsApp message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl p-3.5 text-sm text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#25C993] resize-none"
            />
          </div>

          {/* Media Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#788980] dark:text-[#8A9A91] mb-2">
              Attach Video, Photo, or File (Optional)
            </label>
            <div className="border border-dashed border-[#DCE7E1] dark:border-[#2D3D35] bg-[#F6F9F7] dark:bg-[#101815] rounded-2xl p-3.5 text-center relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.heic,.mov"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between bg-[#F0F5F2] dark:bg-[#1E2B25] p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#087F5B] dark:text-[#25C993] shrink-0" />
                    <span className="truncate font-semibold">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:text-[#B42318] text-[#788980]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-[#788980]">
                  <Upload className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
                  <span>Click to select file or drag & drop</span>
                </div>
              )}
            </div>
          </div>

          {/* Dispatch Timing Mode: Send Now vs. Schedule This */}
          <div className="bg-[#F0F5F2] dark:bg-[#1E2B25] p-3 rounded-2xl border border-[#DCE7E1] dark:border-[#2D3D35] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
                <span>Delivery Timing</span>
              </span>
              <div className="flex p-0.5 bg-white dark:bg-[#17211D] rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35]">
                <button
                  type="button"
                  onClick={() => setDispatchMode('send_now')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    dispatchMode === 'send_now'
                      ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] shadow-2xs'
                      : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Send Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchMode('schedule')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    dispatchMode === 'schedule'
                      ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027] shadow-2xs'
                      : 'text-[#5D7168] dark:text-[#8A9A91] hover:text-[#16231F] dark:hover:text-[#F2F7F4]'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Schedule This</span>
                </button>
              </div>
            </div>

            {/* If Schedule This is chosen: display date/time picker and presets */}
            {dispatchMode === 'schedule' && (
              <div className="pt-2 border-t border-[#DCE7E1] dark:border-[#2D3D35] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduledAtDate}
                    onChange={(e) => setScheduledAtDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className="flex-1 bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] font-medium focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#25C993] focus-visible:outline-none"
                    required
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setScheduledAtDate(format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm"))}
                      className="px-2.5 py-1.5 bg-white dark:bg-[#17211D] hover:bg-[#E5F5EF] dark:hover:bg-[#1D3830] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-lg text-[11px] font-semibold text-[#5D7168] dark:text-[#B2C1B8] whitespace-nowrap"
                    >
                      +15m
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduledAtDate(format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"))}
                      className="px-2.5 py-1.5 bg-white dark:bg-[#17211D] hover:bg-[#E5F5EF] dark:hover:bg-[#1D3830] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-lg text-[11px] font-semibold text-[#5D7168] dark:text-[#B2C1B8] whitespace-nowrap"
                    >
                      +1h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow9 = setHours(setMinutes(addDays(new Date(), 1), 0), 9);
                        setScheduledAtDate(format(tomorrow9, "yyyy-MM-dd'T'HH:mm"));
                      }}
                      className="px-2.5 py-1.5 bg-white dark:bg-[#17211D] hover:bg-[#E5F5EF] dark:hover:bg-[#1D3830] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-lg text-[11px] font-semibold text-[#5D7168] dark:text-[#B2C1B8] whitespace-nowrap"
                    >
                      Tmrw 9am
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Progress Bar */}
          {isSending && (
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-[#E5F5EF] dark:bg-[#1D3830] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#087F5B] dark:bg-[#25C993] transition-all duration-300"
                  style={{ width: `${sendingProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-[#788980] block text-center">
                {dispatchMode === 'send_now'
                  ? 'Acquiring recipient lock & sending through WhatsApp...'
                  : 'Adding scheduled message to local SQLite queue...'}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] disabled:opacity-50 text-white dark:text-[#0D3027] font-bold rounded-xl text-sm transition-transform active:scale-[0.99] shadow-xs flex items-center justify-center gap-2"
          >
            {dispatchMode === 'send_now' ? (
              <>
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending Now...' : 'Send WhatsApp Message Now'}</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>{isSending ? 'Scheduling...' : 'Confirm Schedule for WhatsApp'}</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1] dark:border-[#2D3D35]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#087F5B] dark:text-[#25C993]" />
                <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                  Birthday & Occasion Templates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1 rounded-lg text-[#788980] hover:text-[#16231F] dark:hover:text-[#F2F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <Languages className="w-4 h-4 text-[#788980] shrink-0" />
              {(['all', 'en', 'es', 'hi', 'ur', 'ar', 'fr', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setTemplateLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase transition-colors ${
                    templateLanguage === lang
                      ? 'bg-[#087F5B] text-white dark:bg-[#25C993] dark:text-[#0D3027]'
                      : 'bg-[#F0F5F2] dark:bg-[#1E2B25] text-[#5D7168] dark:text-[#8A9A91]'
                  }`}
                >
                  {lang === 'all' ? 'All Languages' : lang}
                </button>
              ))}
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl.text)}
                  className="p-3.5 bg-[#F6F9F7] dark:bg-[#101815] hover:bg-[#E5F5EF] dark:hover:bg-[#1D3830] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#087F5B] dark:text-[#25C993]">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#DCE7E1]/50 dark:bg-[#2D3D35] text-[#788980]">
                      {tpl.language}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] leading-relaxed group-hover:text-[#16231F] dark:group-hover:text-[#F2F7F4]">
                    {tpl.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
