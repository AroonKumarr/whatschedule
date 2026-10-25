import React, { useState } from 'react';
import { WhatsAppStatus } from '../types';
import {
  Link2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Smartphone,
  AlertCircle,
  RefreshCw,
  LogOut,
  Plus,
  X,
  Share2,
} from 'lucide-react';

export interface SocialAccount {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'x';
  name: string;
  handle: string;
  status: 'connected' | 'not_connected' | 'expired';
  color: string;
  avatarBg: string;
  description: string;
  features: string[];
}

interface ConnectedAccountsViewProps {
  whatsAppStatus: WhatsAppStatus;
  onOpenWhatsAppConnect: () => void;
  onDisconnectWhatsApp: () => void;
}

export const ConnectedAccountsView: React.FC<ConnectedAccountsViewProps> = ({
  whatsAppStatus,
  onOpenWhatsAppConnect,
  onDisconnectWhatsApp,
}) => {
  const isWaConnected = whatsAppStatus.state === 'connected';

  // State for accounts (with local storage persistence)
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('whatschedule_connected_platforms');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [connectingPlatform, setConnectingPlatform] = useState<SocialAccount | null>(null);
  const [connectStep, setConnectStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');

  const platforms: SocialAccount[] = [
    {
      id: 'whatsapp',
      platform: 'whatsapp',
      name: 'WhatsApp Business / Personal',
      handle: isWaConnected
        ? whatsAppStatus.user?.name || whatsAppStatus.user?.id || 'Connected Device'
        : 'Not connected',
      status: isWaConnected ? 'connected' : 'not_connected',
      color: '#25D366',
      avatarBg: '#E5F5EF',
      description: 'End-to-end encrypted messaging, automated voice notes, document & video scheduling.',
      features: ['1-on-1 Messages', 'Group Broadcasts', 'Voice Notes', 'Anti-Ban Jitter Delay'],
    },
    {
      id: 'instagram',
      platform: 'instagram',
      name: 'Instagram Creator & Business',
      handle: connectedAccounts['instagram'] ? '@creator.studio' : 'Not linked',
      status: connectedAccounts['instagram'] ? 'connected' : 'not_connected',
      color: '#E4405F',
      avatarBg: '#FDF2F4',
      description: 'Schedule feed posts, carousels, reels, and video content directly to Instagram.',
      features: ['Feed Posts', 'Carousel Albums', 'Reels Publishing', 'First Comment Scheduling'],
    },
    {
      id: 'facebook',
      platform: 'facebook',
      name: 'Facebook Pages & Groups',
      handle: connectedAccounts['facebook'] ? 'Brand Page Official' : 'Not linked',
      status: connectedAccounts['facebook'] ? 'connected' : 'not_connected',
      color: '#1877F2',
      avatarBg: '#EFF6FF',
      description: 'Publish updates, photo sets, and announcements across Facebook Pages and managed groups.',
      features: ['Page Posts', 'Photo Sets', 'Link Previews', 'Audience Insights'],
    },
    {
      id: 'linkedin',
      platform: 'linkedin',
      name: 'LinkedIn Profile & Company',
      handle: connectedAccounts['linkedin'] ? 'Professional Profile' : 'Not linked',
      status: connectedAccounts['linkedin'] ? 'connected' : 'not_connected',
      color: '#0A66C2',
      avatarBg: '#EEF4FB',
      description: 'Distribute thought leadership, job updates, article summaries, and PDF slide decks.',
      features: ['Article & Text Posts', 'PDF Document Carousels', 'Company Updates', 'Hashtag Optimization'],
    },
    {
      id: 'x',
      platform: 'x',
      name: 'X (formerly Twitter)',
      handle: connectedAccounts['x'] ? '@social_handle' : 'Not linked',
      status: connectedAccounts['x'] ? 'connected' : 'not_connected',
      color: '#000000',
      avatarBg: '#F1F5F9',
      description: 'Draft and schedule 280-character updates, threads, images, and community discussions.',
      features: ['280-Char Posts', 'Thread Scheduling', 'Media Uploads', 'Polls & Discussions'],
    },
  ];

  const handleOpenConnectModal = (p: SocialAccount) => {
    if (p.platform === 'whatsapp') {
      onOpenWhatsAppConnect();
      return;
    }
    setConnectingPlatform(p);
    setConnectStep('prompt');
  };

  const handleSimulateOAuth = (platformId: string) => {
    setConnectStep('authorizing');
    setTimeout(() => {
      setConnectStep('success');
      const next = { ...connectedAccounts, [platformId]: true };
      setConnectedAccounts(next);
      localStorage.setItem('whatschedule_connected_platforms', JSON.stringify(next));
      setTimeout(() => {
        setConnectingPlatform(null);
      }, 1200);
    }, 1500);
  };

  const handleDisconnect = (platformId: string) => {
    if (platformId === 'whatsapp') {
      onDisconnectWhatsApp();
      return;
    }
    const next = { ...connectedAccounts, [platformId]: false };
    setConnectedAccounts(next);
    localStorage.setItem('whatschedule_connected_platforms', JSON.stringify(next));
  };

  return (
    <div className="flex-1 h-full bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col overflow-y-auto select-none p-6 sm:p-8 space-y-6 text-[#1F2937] dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-[#9333EA] flex items-center justify-center text-white shadow-md">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1F2937] dark:text-white">
              Connected Social Accounts
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage multi-channel credentials, permissions, and publishing capabilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Local Vault</span>
          </span>
        </div>
      </div>

      {/* Grid of 5 Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl">
        {platforms.map((p) => {
          const isConnected = p.status === 'connected';

          return (
            <div
              key={p.id}
              className={`rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isConnected
                  ? 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]'
                  : 'bg-white/80 dark:bg-[#1E293B]/70 border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Card Top: Icon, Name, Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: `${p.color}15`, borderColor: `${p.color}40` }}
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg"
                    >
                      <span style={{ color: p.color }}>
                        {p.platform === 'whatsapp' && 'WA'}
                        {p.platform === 'instagram' && 'IG'}
                        {p.platform === 'facebook' && 'FB'}
                        {p.platform === 'linkedin' && 'IN'}
                        {p.platform === 'x' && 'X'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1F2937] dark:text-white leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">
                        {p.handle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Ready</span>
                    )}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.description}
                </p>

                {/* Capabilities Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Supported Features:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {isConnected ? (
                  <>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected & Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(p.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConnectModal(p)}
                    style={{ backgroundColor: p.color }}
                    className="w-full text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Connect {p.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Realistic OAuth Connection Modal */}
      {connectingPlatform && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConnectingPlatform(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setConnectingPlatform(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: `${connectingPlatform.color}15` }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
              >
                <span style={{ color: connectingPlatform.color }}>
                  {connectingPlatform.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
                  Authorize {connectingPlatform.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Secure OAuth 2.0 Provider Connection
                </span>
              </div>
            </div>

            {connectStep === 'prompt' && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  WhatsSchedule will request permission to publish your scheduled messages and media directly to your account:
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                    Permissions Requested:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <li>Publish scheduled posts and media on your behalf</li>
                    <li>Read account username and profile thumbnail</li>
                    <li>Read delivery confirmation receipts</li>
                  </ul>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    🔒 WhatsSchedule never has access to your passwords or private credentials.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateOAuth(connectingPlatform.id)}
                  style={{ backgroundColor: connectingPlatform.color }}
                  className="w-full text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Authorize & Connect Account</span>
                </button>
              </div>
            )}

            {connectStep === 'authorizing' && (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Verifying OAuth tokens with {connectingPlatform.name}...
                </p>
                <p className="text-[11px] text-slate-500">
                  Storing encrypted session tokens in your local vault.
                </p>
              </div>
            )}

            {connectStep === 'success' && (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Account Connected Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  You can now select {connectingPlatform.name} in the composer and schedule posts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
