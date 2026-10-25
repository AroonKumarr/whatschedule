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
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-6 flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#00a884]" />
          <div>
            <h2 className="text-sm font-semibold text-[#e9edef]">Settings & System Configuration</h2>
            <p className="text-[11px] text-[#8696a0]">
              Multi-Device session, background engine health, and license ownership
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        
        {/* Connection & Linked Device Card */}
        <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#00a884]/20 rounded-xl text-[#00a884]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#e9edef]">WhatsApp Linked Session</h3>
                <p className="text-xs text-[#8696a0]">
                  Connected via WhatsApp Multi-Device Protocol
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                status.state === 'connected'
                  ? 'bg-[#005c4b] text-[#25D366]'
                  : 'bg-[#e5a800]/20 text-[#e5a800]'
              }`}
            >
              {status.state === 'connected' ? 'ONLINE & ACTIVE' : 'CONNECTING...'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#d1d7db] bg-[#182229] p-4 rounded-xl border border-[#222d34]">
            <div>
              <span className="text-[#8696a0] block mb-0.5">Account / JID:</span>
              <span className="font-mono">{status.user?.id || 'Not linked'}</span>
            </div>
            <div>
              <span className="text-[#8696a0] block mb-0.5">User Profile:</span>
              <span>{status.user?.name || 'Local WhatsApp Session'}</span>
            </div>
            <div>
              <span className="text-[#8696a0] block mb-0.5">Last Sync:</span>
              <span>
                {status.lastConnectedAt
                  ? new Date(status.lastConnectedAt).toLocaleString()
                  : 'Active session'}
              </span>
            </div>
            <div>
              <span className="text-[#8696a0] block mb-0.5">Execution State:</span>
              <span className="text-[#00a884] font-medium">
                Silent Background Worker Active
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#ea4335]/20 hover:bg-[#ea4335]/30 border border-[#ea4335]/40 text-[#ea4335] text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink & Re-scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Engine Performance & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#202c33] rounded-xl text-[#00a884]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#e9edef]">Performance & Speed</h4>
                <p className="text-[11px] text-[#8696a0]">Zero-delay local execution</p>
              </div>
            </div>
            <ul className="text-xs text-[#8696a0] space-y-2.5 leading-relaxed">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                <span>Binary WebSocket connection (no heavy browser overhead)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                <span>Embedded SQLite storage with microsecond query responses</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                <span>Runs continuously even when phone or Mac display is off</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#202c33] rounded-xl text-[#00a884]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#e9edef]">Queue Statistics</h4>
                <p className="text-[11px] text-[#8696a0]">Persistent job database</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#182229] p-3 rounded-lg border border-[#222d34]">
                <span className="text-[#8696a0] block">Pending Queue:</span>
                <span className="text-lg font-bold text-[#e5a800]">{stats.pending}</span>
              </div>
              <div className="bg-[#182229] p-3 rounded-lg border border-[#222d34]">
                <span className="text-[#8696a0] block">Sent Messages:</span>
                <span className="text-lg font-bold text-[#00a884]">{stats.sent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intellectual Property & Trademark Protection */}
        <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#202c33] rounded-xl text-[#00a884]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#e9edef]">Intellectual Property & Ownership</h4>
              <p className="text-[11px] text-[#8696a0]">Copyright & Legal Attribution</p>
            </div>
          </div>

          <div className="text-xs text-[#d1d7db] bg-[#182229] p-4 rounded-xl border border-[#222d34] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Project Creator & Owner:</span>
              <span className="font-bold text-[#00a884]">Aroon Kumar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">License:</span>
              <span className="font-mono">MIT License (Copyright (c) 2026 Aroon Kumar)</span>
            </div>
            <p className="text-[11px] text-[#8696a0] pt-2 border-t border-[#222d34]">
              All intellectual property rights and authorship belong to <strong>Aroon Kumar</strong>.
              Code modifications and open-source contributions must maintain original author copyright attribution.
            </p>
          </div>

          <div className="p-4 bg-[#111b21] rounded-xl border border-[#2a3942]/60 text-[11px] text-[#8696a0] space-y-1">
            <div className="flex items-center gap-1.5 text-[#d1d7db] font-semibold mb-1">
              <Scale className="w-3.5 h-3.5 text-[#00a884]" />
              <span>Trademark & Non-Affiliation Protection Notice</span>
            </div>
            <p>
              WhatsApp is a registered trademark of <strong>Meta Platforms, Inc.</strong>
            </p>
            <p>
              This open-source scheduler is an independent project and is <strong>not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp LLC, Meta Platforms, Inc., or any of their affiliates</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
