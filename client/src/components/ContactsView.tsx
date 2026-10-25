import React, { useState } from 'react';
import { Contact } from '../types';
import {
  Users,
  Search,
  MessageSquare,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Send,
  UserPlus,
} from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onScheduleContact: (contact: Contact) => void;
  onSendNowContact: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContact,
  onScheduleContact,
  onSendNowContact,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    contacts[0]?.id || null
  );

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      c.number.toLowerCase().includes(q)
    );
  });

  const activeContact =
    contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;

  return (
    <div className="flex-1 h-full bg-[#0B0F0D] flex flex-col md:flex-row overflow-hidden select-none text-[#F2F7F4]">
      {/* Left Column: Contact List with Search */}
      <div className="w-full md:w-80 h-full border-r border-[#242424] flex flex-col bg-[#111111] shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[#242424] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2DD4A7]" />
              <h2 className="text-sm font-bold text-white tracking-tight">Contacts</h2>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1D3830] text-[#2DD4A7] border border-[#2DD4A7]/30">
              {contacts.length} synced
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#787878] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full h-8 pl-8 pr-3 bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#2DD4A7] rounded-xl text-xs text-white placeholder-[#787878] focus:outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1D1D1D]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#787878] text-xs space-y-2">
              <Users className="w-8 h-8 opacity-30 mx-auto text-[#2DD4A7]" />
              <p>No contacts found matching "{search}"</p>
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
                      ? 'bg-[#1D3830] text-white'
                      : 'hover:bg-[#1A1A1A] text-[#A0A0A0]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#1E3A2F] border border-[#2DD4A7]/30 text-[#2DD4A7] flex items-center justify-center font-bold text-xs shrink-0">
                    {initials || <Users className="w-4 h-4" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {displayName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#787878] truncate block">
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
      <div className="flex-1 h-full bg-[#0E1411] flex flex-col justify-between p-6 overflow-y-auto">
        {activeContact ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Contact Card Header */}
            <div className="p-6 rounded-3xl bg-[#141C18] border border-[#23332B] flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-[#1D3830] border-2 border-[#2DD4A7] text-[#2DD4A7] flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
                {(activeContact.name || activeContact.number)
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeContact.name || 'Unnamed Contact'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#1D3830] text-[#2DD4A7] w-fit mx-auto sm:mx-0">
                    <CheckCircle2 className="w-3 h-3" /> WhatsApp Contact
                  </span>
                </div>
                <p className="font-mono text-xs text-[#8A9A91]">
                  {activeContact.number.replace('@s.whatsapp.net', '')}
                </p>
                <p className="text-xs text-[#5D7168] pt-1">
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
                className="p-5 rounded-2xl bg-[#17211D] hover:bg-[#1D2B24] border border-[#273830] hover:border-[#2DD4A7]/60 text-left transition-all duration-150 group cursor-pointer shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1D3830] text-[#2DD4A7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#2DD4A7] transition-colors">
                  Schedule Future Message
                </h4>
                <p className="text-xs text-[#8A9A91] mt-1">
                  Compose a targeted text, video, or doc to send to this contact at any chosen time.
                </p>
              </button>

              {/* Action 2: Open Chat / Send Now */}
              <button
                type="button"
                onClick={() => onSelectContact(activeContact)}
                className="p-5 rounded-2xl bg-[#17211D] hover:bg-[#1D2B24] border border-[#273830] hover:border-[#2DD4A7]/60 text-left transition-all duration-150 group cursor-pointer shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1D3830] text-[#2DD4A7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#2DD4A7] transition-colors">
                  Open in Conversation View
                </h4>
                <p className="text-xs text-[#8A9A91] mt-1">
                  View scheduled timeline, message delivery status, or send an instant message.
                </p>
              </button>
            </div>

            {/* Information Tips */}
            <div className="p-4 rounded-2xl bg-[#131A17] border border-[#1E2B25] text-xs text-[#8A9A91] space-y-1">
              <span className="font-semibold text-white">🔒 Anti-Ban Protection Guarantee:</span>
              <p>
                Messages to synced contacts are processed with human typing simulation, jitter delay, and per-recipient concurrency serialization.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#8A9A91]">
            <Users className="w-12 h-12 opacity-30 text-[#2DD4A7] mb-3" />
            <p className="text-sm font-medium">Select a contact to view options or schedule dispatches</p>
          </div>
        )}
      </div>
    </div>
  );
};
