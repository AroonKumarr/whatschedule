import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import {
  Users,
  Search,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Smartphone,
  Plus,
  X,
  Upload,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

interface ContactsViewProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onScheduleContact: (contact: Contact) => void;
  onSendNowContact: (contact: Contact) => void;
  onRefreshContacts?: () => Promise<void>;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContact,
  onScheduleContact,
  onSendNowContact,
  onRefreshContacts,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    contacts[0]?.id || null
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out broadcast and internal groups for personal contact directory
  const filtered = contacts
    .filter((c) => !c.id.includes('@g.us') && !c.id.includes('@newsletter') && !c.id.includes('broadcast'))
    .filter((c) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        c.number.toLowerCase().includes(q)
      );
    });

  const activeContact =
    filtered.find((c) => c.id === selectedContactId) || filtered[0] || null;

  // Direct Phone Contacts Picker (Standard Mobile Browser API)
  const handleNativeContactPicker = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        setIsImporting(true);
        const props = ['name', 'tel'];
        const selected = await (navigator as any).contacts.select(props, { multiple: true });
        if (selected && selected.length > 0) {
          const payload = selected
            .map((c: any) => ({
              name: Array.isArray(c.name) ? c.name[0] : c.name || 'Contact',
              tel: Array.isArray(c.tel) ? c.tel[0] : c.tel || '',
            }))
            .filter((c: any) => !!c.tel);

          if (payload.length > 0) {
            const res = await api.importContacts(payload);
            setImportStatus(`Successfully imported ${res.count} contacts from your phone.`);
            if (onRefreshContacts) await onRefreshContacts();
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setIsImportModalOpen(true);
        }
      } finally {
        setIsImporting(false);
      }
    } else {
      // Desktop fallback: open modal with VCF / CSV / manual import
      setIsImportModalOpen(true);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) return;
    try {
      setIsImporting(true);
      await api.saveContact(manualName.trim() || manualPhone.trim(), manualPhone.trim());
      setManualName('');
      setManualPhone('');
      setIsImportModalOpen(false);
      if (onRefreshContacts) await onRefreshContacts();
    } catch (err: any) {
      alert(err.message || 'Failed to save contact');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const extracted: Array<{ name: string; tel: string }> = [];

      if (file.name.endsWith('.vcf')) {
        // Simple vCard parser
        const cards = text.split(/END:VCARD/i);
        for (const card of cards) {
          const fnMatch = card.match(/FN:(.*?)(\r|\n)/i);
          const telMatch = card.match(/TEL.*?:(.*?)(\r|\n)/i);
          if (telMatch && telMatch[1]) {
            extracted.push({
              name: fnMatch ? fnMatch[1].trim() : 'Contact',
              tel: telMatch[1].trim(),
            });
          }
        }
      } else {
        // CSV parser (name, phone or phone only)
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            extracted.push({ name: parts[0].trim(), tel: parts[1].trim() });
          } else if (parts[0]?.trim()) {
            extracted.push({ name: 'Contact', tel: parts[0].trim() });
          }
        }
      }

      if (extracted.length > 0) {
        const res = await api.importContacts(extracted);
        alert(`Imported ${res.count} contacts from ${file.name}`);
        setIsImportModalOpen(false);
        if (onRefreshContacts) await onRefreshContacts();
      } else {
        alert('No valid contacts found in the uploaded file.');
      }
    } catch (err: any) {
      alert('Error parsing file: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F4F7FB] dark:bg-[#09121B] flex flex-col md:flex-row overflow-hidden select-none text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Left Column: Contact List with Search & Actions */}
      <div className="w-full md:w-80 h-full border-r border-slate-200 dark:border-[#1E2D3D] flex flex-col bg-white dark:bg-[#0E1A26] shrink-0">
        
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#1E2D3D] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00A884]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Contacts</h2>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#00A884] border border-emerald-500/20">
              {filtered.length} synced
            </span>
          </div>

          {/* Quick Action: Import Contacts Button */}
          <button
            type="button"
            onClick={handleNativeContactPicker}
            disabled={isImporting}
            className="w-full py-2 px-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Import from Phone Contacts</span>
          </button>

          {importStatus && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {importStatus}
            </p>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#142332] border border-slate-200 dark:border-slate-700/80 focus:border-[#00A884] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E2D3D]/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Users className="w-8 h-8 opacity-30 mx-auto text-[#00A884]" />
              <p>No contacts found matching &quot;{search}&quot;</p>
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = activeContact?.id === c.id;
              const displayName = c.name || c.number.split('@')[0];
              const initials = displayName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedContactId(c.id)}
                  className={`w-full p-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-900 dark:text-white border-l-4 border-[#00A884]'
                      : 'hover:bg-slate-50 dark:hover:bg-[#142332]/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#00A884] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {initials || <Users className="w-4 h-4" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">
                        {displayName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate block">
                      {c.number.replace('@s.whatsapp.net', '')}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Contact Details & Quick Scheduling Actions */}
      <div className="flex-1 h-full bg-[#F4F7FB] dark:bg-[#09121B] flex flex-col justify-between p-6 overflow-y-auto">
        {activeContact ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            
            {/* Contact Card Header */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1A26] border border-slate-200 dark:border-[#1E2D3D] flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-[#00A884] text-[#00A884] flex items-center justify-center text-xl font-extrabold shrink-0 shadow-sm">
                {(activeContact.name || activeContact.number)
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeContact.name || 'WhatsApp Contact'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#00A884] border border-emerald-500/20 w-fit mx-auto sm:mx-0">
                    <CheckCircle2 className="w-3 h-3" /> WhatsApp Contact
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  +{activeContact.number.replace('@s.whatsapp.net', '')}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                  Synced directly from linked WhatsApp multi-device session
                </p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Action 1: Schedule Dispatch */}
              <button
                type="button"
                onClick={() => onScheduleContact(activeContact)}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E1A26] hover:bg-slate-50 dark:hover:bg-[#142332] border border-slate-200 dark:border-[#1E2D3D] hover:border-[#00A884] text-left transition-all duration-150 group cursor-pointer shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00A884] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00A884] transition-colors">
                  Schedule Future Message
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Compose a targeted text, video, or doc to send to this contact at any chosen time.
                </p>
              </button>

              {/* Action 2: Open Chat / Send Now */}
              <button
                type="button"
                onClick={() => onSelectContact(activeContact)}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E1A26] hover:bg-slate-50 dark:hover:bg-[#142332] border border-slate-200 dark:border-[#1E2D3D] hover:border-[#00A884] text-left transition-all duration-150 group cursor-pointer shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00A884] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00A884] transition-colors">
                  Open in Conversation View
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  View scheduled timeline, message delivery status, or send an instant message.
                </p>
              </button>
            </div>

            {/* Information Tips */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-[#00A884]">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Ban Protection Guarantee:</span>
              </span>
              <p className="leading-relaxed opacity-90">
                Messages to synced contacts are processed with human typing simulation, jitter delay, and per-recipient concurrency serialization.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Users className="w-12 h-12 opacity-30 text-[#00A884] mb-3" />
            <p className="text-sm font-medium">Select a contact to view options or schedule dispatches</p>
          </div>
        )}
      </div>

      {/* Import Contacts Modal (Desktop fallback or file upload) */}
      {isImportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#0E1A26] border border-slate-200 dark:border-[#1E2D3D] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D3D]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#00A884]" />
                <h3 className="text-sm font-bold tracking-tight">Import Contacts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option A: Upload VCF / CSV */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Option 1: Upload .VCF or .CSV Contact File
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00A884] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <Upload className="w-5 h-5 text-[#00A884]" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Choose vCard (.vcf) or CSV File
                </span>
                <span className="text-[10px] text-slate-400">
                  Exported from iPhone or Android Contacts
                </span>
              </button>
            </div>

            {/* Option B: Quick Add a Contact */}
            <form onSubmit={handleManualAdd} className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#1E2D3D]">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Option 2: Add Single Contact
              </span>
              <input
                type="text"
                placeholder="Contact Name (e.g. John Doe)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#142332] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00A884]"
              />
              <input
                type="tel"
                placeholder="Phone Number with country code (e.g. +923001234567)"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#142332] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00A884]"
              />
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#142332] text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#00A884] hover:bg-[#008f6f] text-white shadow-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
