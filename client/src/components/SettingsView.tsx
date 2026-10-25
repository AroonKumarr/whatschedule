import React from 'react';
import { WhatsAppStatus, QueueStats } from '../types';
import {
  Settings as SettingsIcon,
  Smartphone,
  ShieldCheck,
  LogOut,
  Database,
  Cpu,
  Scale,
  Award,
} from 'lucide-react';

interface SettingsViewProps {
  status: WhatsAppStatus;
  stats: QueueStats;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  stats,
  onLogout,
}) => {
  return (
    <div className="flex-1 h-full bg-[#F6F9F7] dark:bg-[#101815] flex flex-col overflow-hidden select-none transition-colors duration-150">
      {/* Header */}
      <div className="h-[60px] bg-[#F0F5F2] dark:bg-[#1E2B25] px-6 flex items-center justify-between border-b border-[#DCE7E1] dark:border-[#2D3D35]">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#087F5B] dark:text-[#25C993]" />
          <div>
            <h2 className="text-sm font-bold text-[#16231F] dark:text-[#F2F7F4]">Settings & System Configuration</h2>
            <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
              Multi-Device session, background engine health, and license ownership
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        
        {/* Connection & Linked Device Card */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-xl text-[#087F5B] dark:text-[#25C993]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">WhatsApp Linked Session</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5D7168] dark:text-[#8A9A91] mb-5">
            <div className="p-3 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="block text-[10px] uppercase font-semibold text-[#788980]">Session User ID</span>
              <span className="font-mono text-[#16231F] dark:text-[#F2F7F4] text-xs">
                {status.user?.id || 'Unknown'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="block text-[10px] uppercase font-semibold text-[#788980]">User Display Name</span>
              <span className="font-semibold text-[#16231F] dark:text-[#F2F7F4] text-xs">
                {status.user?.name || 'WhatsSchedule Client'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#DCE7E1] dark:border-[#2D3D35]">
            <span className="text-xs text-[#788980] dark:text-[#8A9A91]">
              Unlinking terminates the encrypted socket session immediately.
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] dark:text-[#FF938B] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink WhatsApp Session</span>
            </button>
          </div>
        </div>

        {/* Engine & Queue Performance Card */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-xl text-[#087F5B] dark:text-[#25C993]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">Scheduler Queue Status</h3>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Persistent SQLite queue engine with automatic worker polling
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] block">{stats.total}</span>
              <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] uppercase font-semibold">Total</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="text-xl font-bold text-[#087F5B] dark:text-[#25C993] block">{stats.pending}</span>
              <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] uppercase font-semibold">Pending</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="text-xl font-bold text-[#087F5B] dark:text-[#25C993] block">{stats.sent}</span>
              <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] uppercase font-semibold">Sent</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]">
              <span className="text-xl font-bold text-[#B42318] dark:text-[#FF938B] block">{stats.failed}</span>
              <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] uppercase font-semibold">Failed</span>
            </div>
          </div>
        </div>

        {/* Ownership & Legal IP Card */}
        <div className="bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#E5F5EF] dark:bg-[#1D3830] rounded-xl text-[#087F5B] dark:text-[#25C993]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#16231F] dark:text-[#F2F7F4]">Proprietary Property & License</h3>
              <p className="text-xs text-[#5D7168] dark:text-[#8A9A91]">
                Author, Intellectual Property & Legal Attribution
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#5D7168] dark:text-[#8A9A91] leading-relaxed">
            <div className="p-4 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#16231F] dark:text-[#F2F7F4]">Sole Creator & Copyright Holder:</span>
                <span className="font-semibold text-[#087F5B] dark:text-[#25C993]">Aroon Kumar</span>
              </div>
              <p>
                © 2026 Aroon Kumar. All Rights Reserved. WhatsSchedule is an independent open-source productivity solution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35] text-[11px] space-y-1">
              <span className="font-bold text-[#16231F] dark:text-[#F2F7F4] block">Platform Non-Affiliation Notice:</span>
              <p>
                WhatsSchedule is not affiliated with, endorsed by, or sponsored by WhatsApp LLC, Meta Platforms, Inc., or any of their affiliates. WhatsApp is a registered trademark of Meta Platforms, Inc.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
