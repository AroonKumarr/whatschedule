import React, { useState, useEffect } from 'react';
import { WhatsAppStatus } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { CountryCodePicker } from './CountryCodePicker';
import { api } from '../services/api';
import {
  RefreshCw,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Code2,
  ExternalLink,
  AlertCircle,
  Smartphone,
  ArrowRight,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface QRLoginPageProps {
  status: WhatsAppStatus;
  onRefresh: () => void;
  onStatusUpdate?: (status: WhatsAppStatus) => void;
  themeMode?: 'light' | 'dark' | 'auto';
  onToggleTheme?: () => void;
}

export const QRLoginPage: React.FC<QRLoginPageProps> = ({
  status,
  onRefresh,
  onStatusUpdate,
  themeMode = 'auto',
  onToggleTheme,
}) => {
  // Expiry countdown timer (WhatsApp pairing QR codes expire after ~60s)
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Phone pairing modal state
  const [showPhonePairing, setShowPhonePairing] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('+92');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phonePairingStep, setPhonePairingStep] = useState<'input' | 'code'>('input');
  const [phonePairingCode, setPhonePairingCode] = useState<string>('');
  const [phonePairingLoading, setPhonePairingLoading] = useState<boolean>(false);
  const [phonePairingError, setPhonePairingError] = useState<string | null>(null);
  const [phoneLinkStatus, setPhoneLinkStatus] = useState<'idle' | 'code_ready' | 'connected' | 'expired' | 'error'>('idle');
  const [phoneSecondsLeft, setPhoneSecondsLeft] = useState<number>(180);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const userId = 'local_user';

  // Reset countdown whenever a fresh QR code arrives
  useEffect(() => {
    if (status.qrCodeUrl) {
      setSecondsLeft(60);
      setIsExpired(false);
      setIsRefreshing(false);
    }
  }, [status.qrCodeUrl]);

  // Countdown timer effect
  useEffect(() => {
    if (status.state !== 'qr_ready' || isExpired) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status.state, isExpired]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setIsExpired(false);
    setSecondsLeft(60);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Automatically close phone pairing modal when WhatsApp connects
  useEffect(() => {
    if (status.state === 'connected') {
      setShowPhonePairing(false);
      setPhonePairingStep('input');
      setPhonePairingCode('');
      setPhoneLinkStatus('connected');
    }
  }, [status.state]);

  // Live Status Polling & Countdown for Phone Pairing
  useEffect(() => {
    if (!showPhonePairing || phonePairingStep !== 'code' || phoneLinkStatus === 'connected') {
      return;
    }

    const secondTimer = setInterval(() => {
      setPhoneSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhoneLinkStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const pollTimer = setInterval(async () => {
      try {
        const res = await api.getLinkStatus(userId);
        if (res.status === 'connected') {
          setPhoneLinkStatus('connected');
          try {
            const latest = await api.getStatus();
            if (onStatusUpdate) {
              onStatusUpdate(latest);
            }
          } catch (e) {}
          setTimeout(() => {
            setShowPhonePairing(false);
          }, 800);
        } else if (res.status === 'expired') {
          setPhoneLinkStatus('expired');
        } else if (res.status === 'error' && res.error) {
          setPhoneLinkStatus('error');
          setPhonePairingError(res.error);
        } else if (res.status === 'code_ready' && res.secondsLeft) {
          setPhoneSecondsLeft(res.secondsLeft);
        }
      } catch (err) {}
    }, 600);

    return () => {
      clearInterval(secondTimer);
      clearInterval(pollTimer);
    };
  }, [showPhonePairing, phonePairingStep, phoneLinkStatus]);

  const handlePhonePairingSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhonePairingError(null);

    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (!digitsOnly || digitsOnly.length < 7) {
      setPhonePairingError('Please enter a valid phone number.');
      return;
    }

    const fullInternational = `${countryCode.replace(/[^0-9]/g, '')}${digitsOnly.replace(/^0+/, '')}`;

    setPhonePairingLoading(true);
    try {
      const res = await api.linkPhone(userId, fullInternational);
      setPhonePairingCode(res.formattedCode || res.code);
      setPhoneSecondsLeft(res.expiresInSec || 180);
      setPhonePairingStep('code');
      setPhoneLinkStatus('code_ready');
    } catch (err: any) {
      setPhonePairingError(err?.message || 'Failed to request pairing code. Please try again.');
    } finally {
      setPhonePairingLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!phonePairingCode) return;
    navigator.clipboard.writeText(phonePairingCode.replace(/[^A-Za-z0-9]/g, ''));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancelPhonePairing = async () => {
    try {
      await api.cancelLink(userId);
    } catch (e) {}
    setShowPhonePairing(false);
    setPhonePairingStep('input');
    setPhonePairingCode('');
    setPhonePairingError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F9FA] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-200 relative overflow-hidden select-none">
      
      {/* Subtle Background Glows matching mockups */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. TOP HEADER                                             */}
      {/* ========================================================= */}
      <header className="max-w-[1040px] mx-auto w-full flex items-center justify-between z-10 pt-1 pb-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BrandLogo size={38} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Whats<span className="text-blue-500 dark:text-blue-400">Schedule</span>
              </span>
              <a
                href="https://github.com/AroonKumarr/whatschedule"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-200/60 dark:border-cyan-800/60 hover:opacity-85 transition-opacity"
              >
                <span>Open Source</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Message scheduling, made simple.
            </p>
          </div>
        </div>

        {/* Right Controls: Runs Locally Pill + Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-[#0D1D2C]/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Runs locally on your device</span>
            <span className="sm:hidden">Local</span>
          </div>

          <ThemeToggle themeMode={themeMode} onToggleTheme={onToggleTheme} />
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CENTERED CARD (Redesigned per Mockup)             */}
      {/* ========================================================= */}
      <main className="max-w-[1040px] mx-auto w-full my-auto z-10 py-2 sm:py-4">
        <div className="bg-white/95 dark:bg-[#0C1A27]/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/70 dark:border-slate-800/80 p-6 sm:p-10 lg:p-12 transition-all">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* ----------------------------------------------------- */}
            {/* LEFT COLUMN: Connection Instructions                  */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Category Tracking Label */}
                <span className="text-[11px] font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase block">
                  Connect your WhatsApp
                </span>

                {/* Main Heading with Gradient "scheduling" */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mt-2">
                  Link your WhatsApp to start{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                    scheduling
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                  Link your WhatsApp account using your phone camera. Takes about 30 seconds.
                </p>

                {/* Steps Section Heading */}
                <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-7 mb-4">
                  Connect in three steps
                </div>

                {/* 3 Numbered Steps with matching gradient badge circles */}
                <ol className="space-y-4">
                  {/* Step 01 */}
                  <li className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      01
                    </span>
                    <div className="pt-0.5">
                      <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                        Open WhatsApp
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        Use WhatsApp on your phone.
                      </span>
                    </div>
                  </li>

                  {/* Step 02 */}
                  <li className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      02
                    </span>
                    <div className="pt-0.5">
                      <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                        Open Linked devices
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        Find it in Menu or Settings.
                      </span>
                    </div>
                  </li>

                  {/* Step 03 */}
                  <li className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      03
                    </span>
                    <div className="pt-0.5">
                      <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                        Link a device
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        Scan the code to connect.
                      </span>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Bottom Supporting Info Boxes */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Security Box */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                      Your session stays on your device
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Your messages and media remain private and secure.
                    </p>
                  </div>
                </div>

                {/* Control Box */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                      Schedule with control
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Send messages and media at your preferred time, all from your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* RIGHT COLUMN: Real Live QR Box Container              */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-5 flex flex-col items-center">
              
              {/* Box Container matching Mockup */}
              <div className="w-full max-w-[340px] bg-slate-50/90 dark:bg-[#07131F]/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center shadow-sm">
                
                {/* White QR Code Card with border */}
                <div className="relative w-[230px] h-[230px] bg-white p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                  
                  {/* Connected State */}
                  {status.state === 'connected' ? (
                    <div className="flex flex-col items-center gap-2 text-center p-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Linked Successfully!
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {status.user?.id ? `ID: ${status.user.id}` : 'WhatsApp Session Active'}
                      </span>
                    </div>
                  ) : status.state === 'error' ? (
                    <div className="flex flex-col items-center gap-2 text-center p-2">
                      <AlertCircle className="w-9 h-9 text-rose-500" />
                      <span className="text-xs font-bold text-slate-900">
                        Connection Interrupted
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Check your device connection and reload.
                      </p>
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="mt-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Retry
                      </button>
                    </div>
                  ) : status.qrCodeUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={status.qrCodeUrl}
                        alt="WhatsApp Pairing QR Code"
                        className={`w-full h-full object-contain transition-all duration-300 ${
                          isExpired ? 'blur-[4px] opacity-20 scale-95' : 'opacity-100 scale-100'
                        }`}
                      />

                      {/* Expired Overlay */}
                      {isExpired && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-3 text-center">
                          <Clock className="w-7 h-7 text-amber-500 mb-1" />
                          <span className="text-xs font-bold text-slate-900 block">
                            Code Expired
                          </span>
                          <span className="text-[10px] text-slate-500 mb-2.5 block">
                            Codes refresh for security
                          </span>
                          <button
                            type="button"
                            onClick={handleManualRefresh}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Reload Code</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : status.state === 'connecting' ? (
                    <div className="flex flex-col items-center justify-center gap-2.5 p-3 text-center">
                      <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
                      <span className="text-xs font-semibold text-slate-800">
                        Generating pairing code...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 text-center p-2">
                      <QrCode className="w-10 h-10" />
                      <span className="text-xs font-medium">Ready to Pair</span>
                    </div>
                  )}
                </div>

                {/* Expiry Text */}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {status.state === 'qr_ready' && !isExpired
                      ? `Code expires in ${secondsLeft} seconds`
                      : isExpired
                      ? 'Code expired'
                      : 'Session connecting'}
                  </span>
                </div>

                {/* Refresh CTA Button (Gradient Blue-to-Purple matching mockup) */}
                <div className="mt-3 w-full">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:opacity-95 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Scan with WhatsApp text */}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 block font-medium">
                  Scan with WhatsApp
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================= */}
        {/* 3. BOTTOM FOOTER                                        */}
        {/* ======================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mt-5 px-3">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <a
              href="https://github.com/AroonKumarr/whatschedule"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
              <span>Independent open-source software. Not affiliated with or endorsed by WhatsApp or Meta.</span>
            </a>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowPhonePairing(true)}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Link with phone number instead</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3">
          © 2026 Aroon Kumar. All rights reserved.
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. PHONE NUMBER PAIRING MODAL                             */}
      {/* ========================================================= */}
      {showPhonePairing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#0C1A27] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Link with Phone Number</h3>
                  <p className="text-[11px] text-slate-500">Pair without camera using an 8-character code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelPhonePairing}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {phonePairingError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {phonePairingError}
              </div>
            )}

            {phonePairingStep === 'input' ? (
              <form onSubmit={handlePhonePairingSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <CountryCodePicker value={countryCode} onChange={setCountryCode} />
                    <input
                      type="tel"
                      placeholder="300 1234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phonePairingLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {phonePairingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>Get Pairing Code</span>
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-center">
                <p className="text-xs text-slate-500">
                  Enter this code in WhatsApp on your phone (Linked Devices &gt; Link with phone number):
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black tracking-widest text-blue-600 dark:text-blue-400">
                    {phonePairingCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 border border-slate-200 dark:border-slate-700"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires in {phoneSecondsLeft}s</span>
                </div>

                <button
                  type="button"
                  onClick={() => setPhonePairingStep('input')}
                  className="text-xs text-blue-500 hover:underline font-semibold"
                >
                  Use a different phone number
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
