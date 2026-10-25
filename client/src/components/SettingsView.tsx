import React, { useState } from 'react';
import { WhatsAppStatus, QueueStats } from '../types';
import {
  Settings as SettingsIcon,
  Smartphone,
  ShieldCheck,
  LogOut,
  Database,
  Cpu,
  Scale,
  Sparkles,
  Gift,
  Mic,
  Code,
  Check,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';

interface SettingsViewProps {
  status: WhatsAppStatus;
  stats: QueueStats;
  onLogout: () => void;
  onTogglePause: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  stats,
  onLogout,
  onTogglePause,
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

  const toggleFeature = (key: string, current: boolean, setter: (val: boolean) => void) => {
    const next = !current;
    setter(next);
    localStorage.setItem(key, String(next));
  };

  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-y-auto select-none transition-colors duration-150 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1] dark:border-[#2D3D35]">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#087F5B] dark:text-[#25C993]" />
          <div>
            <h1 className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
              Feature management, WhatsApp connection, and system configuration
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Feature Management & Extensions Module (Requested by user) */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-2xl text-[#087F5B] dark:text-[#25C993]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                Feature Modules & Productivity Tools
              </h2>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Enable or disable optional tools to keep your workflow simple and tailored
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#DCE7E1] dark:divide-[#2D3D35] pt-2">
            
            {/* Feature 1: Smart Autofill */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] block">
                  Smart Autofill Suggestions
                </span>
                <span className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] block">
                  Suggests autocomplete phrases and polite closings in the composer.
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_autofill', autofill, setAutofill)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  autofill ? 'bg-[#087F5B] dark:bg-[#25C993]' : 'bg-[#DCE7E1] dark:bg-[#2D3D35]'
                }`}
                aria-label="Toggle Autofill"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-[#101815] shadow-xs transition-transform ${
                    autofill ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature 2: Birthday & Occasion Templates */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] block">
                  Birthday & Occasion Templates
                </span>
                <span className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] block">
                  Pre-made greetings in 7 languages (English, Spanish, Hindi, Urdu, Arabic, French, German).
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_templates', templates, setTemplates)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  templates ? 'bg-[#087F5B] dark:bg-[#25C993]' : 'bg-[#DCE7E1] dark:bg-[#2D3D35]'
                }`}
                aria-label="Toggle Templates"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-[#101815] shadow-xs transition-transform ${
                    templates ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature 3: Voice Memo Scheduler */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] block">
                  Voice Memo & Audio Scheduler
                </span>
                <span className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] block">
                  Allows scheduling audio recordings (.m4a, .mp3, .ogg) as native voice notes.
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('whatschedule_voice', voiceScheduler, setVoiceScheduler)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  voiceScheduler ? 'bg-[#087F5B] dark:bg-[#25C993]' : 'bg-[#DCE7E1] dark:bg-[#2D3D35]'
                }`}
                aria-label="Toggle Voice Scheduler"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-[#101815] shadow-xs transition-transform ${
                    voiceScheduler ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Connection & Linked Device Card */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-2xl text-[#087F5B] dark:text-[#25C993]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                  WhatsApp Linked Session
                </h2>
                <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                  Connected via WhatsApp Multi-Device Protocol
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                status.state === 'connected'
                  ? 'bg-[#E5F5EF] text-[#087F5B] dark:bg-[#1D3830] dark:text-[#25C993]'
                  : 'bg-[#9A6700]/15 text-[#9A6700] dark:text-[#F3C969]'
              }`}
            >
              {status.state}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5D7168] dark:text-[#8A9A91]">
            <div className="p-3.5 rounded-2xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="block text-[10px] uppercase font-semibold text-[#788980]">Session User ID</span>
              <span className="font-mono text-[#16231F] dark:text-[#F2F7F4] text-xs font-semibold">
                {status.user?.id || 'Active'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="block text-[10px] uppercase font-semibold text-[#788980]">User Display Name</span>
              <span className="font-semibold text-[#16231F] dark:text-[#F2F7F4] text-xs">
                {status.user?.name || 'WhatsSchedule Client'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#788980] dark:text-[#8A9A91]">
              Unlinking terminates the encrypted session on this device.
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] dark:text-[#FF938B] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink WhatsApp Session</span>
            </button>
          </div>
        </div>

        {/* Emergency Pause Circuit Breaker */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                Emergency Queue Circuit Breaker
              </h3>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-0.5">
                Immediately freeze all outgoing message dispatches in case of accidental scheduling
              </p>
            </div>

            <button
              onClick={onTogglePause}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                stats.isPaused
                  ? 'bg-[#087F5B] text-white hover:bg-[#06684B]'
                  : 'bg-[#B42318] text-white hover:bg-[#921E14]'
              }`}
            >
              {stats.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{stats.isPaused ? 'Resume Dispatches' : 'Halt All Dispatches'}</span>
            </button>
          </div>
        </div>

        {/* Developer REST API & Webhooks Card */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-2xl text-[#087F5B] dark:text-[#25C993]">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">
                Developer REST API & Integrations
              </h3>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Full programmatic access to schedule, send now, and query queue statistics
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] text-xs space-y-2">
            <p className="font-semibold text-[#16231F] dark:text-[#F2F7F4]">
              Local Endpoint: <code className="font-mono text-[#087F5B] dark:text-[#25C993]">http://localhost:5001/api</code>
            </p>
            <p className="text-[#5D7168] dark:text-[#8A9A91]">
              Read full documentation, curl snippets, and schemas in <code className="font-mono">API_DOCUMENTATION.md</code>.
            </p>
          </div>
        </div>

        {/* Ownership & Copyright */}
        <div className="p-4 text-center text-xs text-[#788980] dark:text-[#8A9A91] space-y-1">
          <p>© {new Date().getFullYear()} Aroon Kumar. All Rights Reserved.</p>
          <p className="text-[11px]">
            WhatsSchedule is an independent open-source solution. WhatsApp is a registered trademark of Meta Platforms, Inc.
          </p>
        </div>

      </div>
    </div>
  );
};
