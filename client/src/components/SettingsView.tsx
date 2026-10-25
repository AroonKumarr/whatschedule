import React, { useState, useEffect } from 'react';
import { WhatsAppStatus, QueueStats } from '../types';
import {
  Settings as SettingsIcon,
  Smartphone,
  ShieldCheck,
  LogOut,
  Code,
  Sparkles,
  Pause,
  Play,
  X,
  Check,
  Cpu,
} from 'lucide-react';

interface SettingsViewProps {
  status: WhatsAppStatus;
  stats: QueueStats;
  onLogout: () => void;
  onTogglePause: () => void;
  onClose?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  stats,
  onLogout,
  onTogglePause,
  onClose,
}) => {
  // Feature module preferences stored in localStorage
  const [autofill, setAutofill] = useState<boolean>(() => {
    return localStorage.getItem('whatschedule_autofill') !== 'false';
  });

  const [templates, setTemplates] = useState<boolean>(() => {
    return localStorage.getItem('whatschedule_templates') !== 'false';
  });

  const [voiceScheduler, setVoiceScheduler] = useState<boolean>(() => {
    return localStorage.getItem('whatschedule_voice') !== 'false';
  });

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleFeature = (key: string, current: boolean, setter: (val: boolean) => void) => {
    const next = !current;
    setter(next);
    localStorage.setItem(key, String(next));
  };

  return (
    <div className="flex flex-col h-full bg-[#121A16] text-[#F2F7F4] select-none rounded-3xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-6 border-b border-[#23332B] bg-[#16211C] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1D3830] border border-[#2DD4A7]/20 flex items-center justify-center text-[#2DD4A7]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs text-[#8A9A91]">
              Manage scheduling features, WhatsApp connection, and system behavior
            </p>
          </div>
        </div>

        {/* Working Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A9A91] hover:text-white hover:bg-white/5 border border-transparent hover:border-[#273830] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Close Settings (Esc)"
            aria-label="Close Settings"
          >
            <span className="text-[11px] font-mono text-[#8A9A91] hidden sm:inline">ESC</span>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Section 1: Feature Modules & Smart Autofill */}
        <div className="bg-[#17231E] border border-[#26382E] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1D3830] rounded-xl text-[#2DD4A7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Feature Modules & Productivity Tools
              </h3>
              <p className="text-xs text-[#8A9A91]">
                Enable or disable workflow assistants to customize your scheduling workspace
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#23332B] pt-1">
            {/* Autofill Switch */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">
                  Smart Autofill Suggestions
                </span>
                <span className="text-[11px] text-[#8A9A91] block">
                  Suggests quick-reply greetings, occasion phrases, and closings in the composer.
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_autofill', autofill, setAutofill)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  autofill ? 'bg-[#2DD4A7]' : 'bg-[#2D3D35]'
                }`}
                aria-label="Toggle Autofill"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#101815] shadow-xs transition-transform ${
                    autofill ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Templates Switch */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">
                  Occasion & Holiday Templates
                </span>
                <span className="text-[11px] text-[#8A9A91] block">
                  Access 7-language greetings for birthdays, meetings, and business updates.
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_templates', templates, setTemplates)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  templates ? 'bg-[#2DD4A7]' : 'bg-[#2D3D35]'
                }`}
                aria-label="Toggle Templates"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#101815] shadow-xs transition-transform ${
                    templates ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Memo Switch */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">
                  Voice Memo & Audio Notes
                </span>
                <span className="text-[11px] text-[#8A9A91] block">
                  Enables audio file scheduling as WhatsApp push-to-talk voice notes.
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_voice', voiceScheduler, setVoiceScheduler)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  voiceScheduler ? 'bg-[#2DD4A7]' : 'bg-[#2D3D35]'
                }`}
                aria-label="Toggle Voice Memo Scheduler"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#101815] shadow-xs transition-transform ${
                    voiceScheduler ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Linked Session */}
        <div className="bg-[#17231E] border border-[#26382E] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#1D3830] rounded-xl text-[#2DD4A7]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  WhatsApp Linked Session
                </h3>
                <p className="text-xs text-[#8A9A91]">
                  Connected via Baileys Multi-Device Socket
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                status.state === 'connected'
                  ? 'bg-[#1D3830] text-[#2DD4A7] border border-[#2DD4A7]/30'
                  : 'bg-[#9A6700]/20 text-[#F3C969] border border-[#F3C969]/30'
              }`}
            >
              {status.state}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#131B17] border border-[#23332B]">
              <span className="block text-[10px] uppercase font-semibold text-[#8A9A91]">Connected Account</span>
              <span className="font-mono text-white text-xs font-semibold">
                {status.user?.id ? status.user.id.replace('@s.whatsapp.net', '') : 'Active Session'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#131B17] border border-[#23332B]">
              <span className="block text-[10px] uppercase font-semibold text-[#8A9A91]">Display Name</span>
              <span className="font-semibold text-white text-xs">
                {status.user?.name || 'WhatsSchedule Client'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8A9A91]">
              Unlinking terminates the encrypted session on this device.
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 bg-[#2D1615] hover:bg-[#3D1D1C] text-[#FF938B] border border-[#5B2321] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink WhatsApp Session</span>
            </button>
          </div>
        </div>

        {/* Section 3: Emergency Queue Circuit Breaker */}
        <div className="bg-[#17231E] border border-[#26382E] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Emergency Queue Circuit Breaker
              </h3>
              <p className="text-xs text-[#8A9A91] mt-0.5">
                Instantly freeze all scheduled message dispatches in case of accidental scheduling
              </p>
            </div>

            <button
              type="button"
              onClick={onTogglePause}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                stats.isPaused
                  ? 'bg-[#2DD4A7] text-[#0D3027] hover:bg-[#25C993]'
                  : 'bg-[#B42318] text-white hover:bg-[#921E14]'
              }`}
            >
              {stats.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{stats.isPaused ? 'Resume Dispatches' : 'Halt All Dispatches'}</span>
            </button>
          </div>
        </div>

        {/* Section 4: Developer REST API */}
        <div className="bg-[#17231E] border border-[#26382E] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1D3830] rounded-xl text-[#2DD4A7]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Developer REST API & Integrations
              </h3>
              <p className="text-xs text-[#8A9A91]">
                Programmatic access to schedule, send now, and inspect queues
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131B17] border border-[#23332B] text-xs space-y-1.5">
            <p className="font-semibold text-white">
              Local Endpoint: <code className="font-mono text-[#2DD4A7]">http://localhost:5001/api</code>
            </p>
            <p className="text-[#8A9A91]">
              Full OpenAPI documentation and curl snippets available in <code className="font-mono text-white">API_DOCUMENTATION.md</code>.
            </p>
          </div>
        </div>

        {/* Section 5: Ownership & Copyright */}
        <div className="text-center text-xs text-[#8A9A91] pt-2 space-y-1">
          <p>© {new Date().getFullYear()} Aroon Kumar. All Rights Reserved.</p>
          <p className="text-[11px] text-[#5D7168]">
            WhatsSchedule is an independent open-source solution. WhatsApp is a trademark of Meta Platforms, Inc.
          </p>
        </div>
      </div>

      {/* Footer Bar with Close Button */}
      {onClose && (
        <div className="p-4 border-t border-[#23332B] bg-[#16211C] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done / Close Settings
          </button>
        </div>
      )}
    </div>
  );
};
