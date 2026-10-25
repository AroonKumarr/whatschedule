import React from 'react';
import { WhatsAppStatus } from '../types';
import {
  RefreshCw,
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  EyeOff,
  Zap,
  Check,
} from 'lucide-react';

interface QRLoginPageProps {
  status: WhatsAppStatus;
  onRefresh: () => void;
}

export const QRLoginPage: React.FC<QRLoginPageProps> = ({ status, onRefresh }) => {
  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col justify-between text-[#e9edef] select-none">
      {/* Top Header */}
      <header className="h-[210px] bg-[#00a884] px-6 pt-7 flex items-start justify-between shadow-md">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 fill-[#00a884]" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                WhatsSchedule
                <span className="text-xs bg-[#005c4b] text-[#25D366] px-2.5 py-0.5 rounded-full font-medium">
                  Verified Safe
                </span>
              </h1>
              <p className="text-xs text-white/90">Autonomous Message & Media Scheduler</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white bg-black/15 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Bank-Grade Local Cryptography</span>
          </div>
        </div>
      </header>

      {/* Main Container Card */}
      <main className="flex-1 max-w-5xl w-full mx-auto -mt-24 px-4 pb-10">
        <div className="bg-[#202c33] rounded-2xl shadow-2xl border border-[#2a3942] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-10">
          
          {/* Instructions Column (Simple for ages 10 to 90) */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-normal text-[#e9edef]">
                Use WhatsSchedule on your computer
              </h2>
              <p className="text-sm text-[#8696a0] mt-1 leading-relaxed">
                Schedule personal reminders, videos, and documents to send automatically at your chosen time.
              </p>
            </div>

            <ol className="space-y-4 text-sm text-[#d1d7db]">
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111b21] text-[#00a884] font-bold flex items-center justify-center shrink-0 border border-[#2a3942] text-xs">
                  1
                </span>
                <span className="pt-0.5">Open <strong>WhatsApp</strong> on your phone</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111b21] text-[#00a884] font-bold flex items-center justify-center shrink-0 border border-[#2a3942] text-xs">
                  2
                </span>
                <span className="pt-0.5">
                  Tap <strong>Menu</strong> (three dots ⠇ on Android) or <strong>Settings</strong> (⚙ on iPhone)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111b21] text-[#00a884] font-bold flex items-center justify-center shrink-0 border border-[#2a3942] text-xs">
                  3
                </span>
                <span className="pt-0.5">
                  Tap <strong>Linked devices</strong> and then <strong>Link a device</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111b21] text-[#00a884] font-bold flex items-center justify-center shrink-0 border border-[#2a3942] text-xs">
                  4
                </span>
                <span className="pt-0.5">Point your phone at this screen to scan the QR code</span>
              </li>
            </ol>

            {/* Privacy & Anti-Ban Highlights (Overcoming User Hesitation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#2a3942]/80">
              <div className="bg-[#111b21] p-3 rounded-xl border border-[#2a3942] flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Zero Chat History Downloads</span>
                  <span className="text-[#8696a0] text-[11px] leading-tight block mt-0.5">
                    We never download, view, or store your private past messages.
                  </span>
                </div>
              </div>

              <div className="bg-[#111b21] p-3 rounded-xl border border-[#2a3942] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Anti-Ban Protection</span>
                  <span className="text-[#8696a0] text-[11px] leading-tight block mt-0.5">
                    Emulates natural human typing delays to ensure total account safety.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#111b21] rounded-2xl border border-[#2a3942] w-full md:w-[320px] shrink-0 shadow-lg">
            <div className="relative w-64 h-64 bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
              {status.qrCodeUrl ? (
                <img
                  src={status.qrCodeUrl}
                  alt="WhatsApp Pairing QR Code"
                  className="w-full h-full object-contain"
                />
              ) : status.state === 'connecting' ? (
                <div className="flex flex-col items-center gap-3 text-[#111b21]">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#00a884]" />
                  <span className="text-xs font-semibold">Generating secure QR code...</span>
                </div>
              ) : status.state === 'connected' ? (
                <div className="flex flex-col items-center gap-2 text-[#00a884]">
                  <CheckCircle2 className="w-12 h-12" />
                  <span className="text-sm font-semibold">Linked Successfully!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#111b21]">
                  <QrCode className="w-12 h-12 text-[#8696a0]" />
                  <span className="text-xs text-center text-[#667781]">Connecting to WhatsApp...</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between w-full text-xs">
              <span className="text-[#8696a0] flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status.state === 'qr_ready' ? 'bg-[#25D366] animate-pulse' : 'bg-[#e5a800]'
                  }`}
                />
                {status.state === 'qr_ready' ? 'Point Phone Camera Here' : 'Syncing Engine...'}
              </span>

              <button
                onClick={onRefresh}
                className="flex items-center gap-1 text-[#00a884] hover:text-[#02bd94] transition-colors font-medium"
                title="Reload QR Code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[#8696a0] space-y-1">
          <p>© 2026 Aroon Kumar. All rights reserved.</p>
          <p className="text-[11px] text-[#667781]">
            Independent open-source productivity software. Not affiliated with WhatsApp LLC or Meta Platforms, Inc.
          </p>
        </div>
      </main>
    </div>
  );
};
