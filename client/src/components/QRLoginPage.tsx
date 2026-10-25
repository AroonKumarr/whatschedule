import React, { useState, useEffect } from 'react';
import { WhatsAppStatus } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
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
  themeMode?: 'light' | 'dark' | 'auto';
  onToggleTheme?: () => void;
}

export const QRLoginPage: React.FC<QRLoginPageProps> = ({
  status,
  onRefresh,
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
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

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
    }
  }, [status.state]);

  const handlePhonePairingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setPhonePairingError(null);
    setPhonePairingLoading(true);

    try {
      const res = await api.requestPairingCode(phoneNumber.trim(), countryCode.trim());
      setPhonePairingCode(res.formattedCode || res.code);
      setPhonePairingStep('code');
    } catch (err: any) {
      setPhonePairingError(err.message || 'Failed to request pairing code. Please verify the phone number.');
    } finally {
      setPhonePairingLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!phonePairingCode) return;
    const clean = phonePairingCode.replace(/[^A-Za-z0-9]/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6F9F7] dark:bg-[#101815] text-[#16231F] dark:text-[#F2F7F4] flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-[#25C993] selection:text-[#0D3027] relative overflow-x-hidden">
      
      {/* Subtle Ambient Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E5F5EF]/60 dark:bg-[#1D3830]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E5F5EF]/60 dark:bg-[#1D3830]/20 blur-3xl"
      />

      {/* ========================================================= */}
      {/* 1. TOP HEADER                                             */}
      {/* ========================================================= */}
      <header
        role="banner"
        className="max-w-[960px] mx-auto w-full flex items-center justify-between pb-6 sm:pb-8 relative z-10"
      >
        {/* Brand Lockup: Logo + Wordmark + Open Source Pill */}
        <div className="flex items-center gap-3">
          <BrandLogo size={42} />
          <div>
            <div className="flex items-center gap-2 tracking-tight leading-none">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold text-[#0D3027] dark:text-[#F2F7F4]">
                  Whats
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#087F5B] dark:text-[#25C993]">
                  Schedule
                </span>
              </div>
              <a
                href="https://github.com/AroonKumarr/whatschedule"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] px-2.5 py-0.5 rounded-full border border-[#DCE7E1] dark:border-[#2D3D35] hover:opacity-85 transition-opacity"
              >
                <span>Open Source</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] mt-1 font-normal">
              Message scheduling, made simple.
            </p>
          </div>
        </div>

        {/* Header Right Controls: Device Indicator + Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Runs Locally on your device pill */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#16231F] dark:text-[#F2F7F4] bg-[#E5F5EF] dark:bg-[#1E2B25] px-3 py-1.5 rounded-full border border-[#DCE7E1] dark:border-[#2D3D35] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#25C993] dark:bg-[#25C993] animate-pulse motion-reduce:animate-none" />
            <span className="hidden sm:inline">Runs locally on your device</span>
            <span className="sm:hidden">Local</span>
          </div>

          {/* Animated Smooth Sun / Moon Theme Toggle */}
          <ThemeToggle
            themeMode={themeMode}
            onToggleTheme={onToggleTheme}
          />
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CENTERED CARD                                     */}
      {/* ========================================================= */}
      <main
        role="main"
        className="max-w-[960px] mx-auto w-full my-auto relative z-10"
      >
        <div className="bg-white dark:bg-[#17211D] rounded-2xl sm:rounded-3xl shadow-sm border border-[#DCE7E1] dark:border-[#2D3D35] p-6 sm:p-10 transition-colors duration-150">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* ----------------------------------------------------- */}
            {/* LEFT COLUMN: Connection Instructions & Values         */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-7 flex flex-col justify-between">
              
              <div>
                {/* Category Tracking Label */}
                <span className="text-[11px] font-bold tracking-widest text-[#087F5B] dark:text-[#25C993] uppercase block">
                  Connect your WhatsApp
                </span>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-[32px] font-bold text-[#16231F] dark:text-[#F2F7F4] tracking-tight leading-snug mt-1.5">
                  Link your WhatsApp to start scheduling
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-[#5D7168] dark:text-[#B2C1B8] mt-2 leading-relaxed">
                  Link your WhatsApp account using your phone camera. Takes about 30 seconds.
                </p>

                {/* Subheading: Connect in three steps */}
                <div className="text-[11px] font-semibold tracking-wider text-[#788980] dark:text-[#8A9A91] uppercase mt-7 mb-3.5">
                  Connect in three steps
                </div>

                {/* 3 Numbered Steps with clean pill circles */}
                <nav aria-label="WhatsApp Connection Steps">
                  <ol className="space-y-4">
                    {/* Step 01 */}
                    <li className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#DCE7E1]/80 dark:border-[#2D3D35]"
                      >
                        01
                      </span>
                      <div className="pt-0.5">
                        <strong className="block text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                          Open WhatsApp
                        </strong>
                        <span className="text-xs text-[#5D7168] dark:text-[#8A9A91] block mt-0.5">
                          Use WhatsApp on your phone.
                        </span>
                      </div>
                    </li>

                    {/* Step 02 */}
                    <li className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#DCE7E1]/80 dark:border-[#2D3D35]"
                      >
                        02
                      </span>
                      <div className="pt-0.5">
                        <strong className="block text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                          Open Linked devices
                        </strong>
                        <span className="text-xs text-[#5D7168] dark:text-[#8A9A91] block mt-0.5">
                          Find it in Menu or Settings.
                        </span>
                      </div>
                    </li>

                    {/* Step 03 */}
                    <li className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#DCE7E1]/80 dark:border-[#2D3D35]"
                      >
                        03
                      </span>
                      <div className="pt-0.5">
                        <strong className="block text-sm font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                          Link a device
                        </strong>
                        <span className="text-xs text-[#5D7168] dark:text-[#8A9A91] block mt-0.5">
                          Scan the code to connect.
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Bottom Supporting Row: Session Stays & Scheduling Control */}
              <div className="mt-8 pt-6 border-t border-[#DCE7E1] dark:border-[#2D3D35] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Group 1: Local Session */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#E5F5EF] dark:bg-[#1D3830] flex items-center justify-center text-[#087F5B] dark:text-[#25C993] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                      Your session stays on your device
                    </h2>
                    <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] leading-relaxed mt-0.5">
                      Your messages and media remain private and secure.
                    </p>
                  </div>
                </div>

                {/* Group 2: Scheduling Control */}
                <div className="flex items-start gap-3 sm:border-l sm:border-[#DCE7E1] sm:dark:border-[#2D3D35] sm:pl-4">
                  <div className="w-7 h-7 rounded-lg bg-[#E5F5EF] dark:bg-[#1D3830] flex items-center justify-center text-[#087F5B] dark:text-[#25C993] shrink-0 mt-0.5">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-[#16231F] dark:text-[#F2F7F4]">
                      Schedule with control
                    </h2>
                    <p className="text-[11px] text-[#5D7168] dark:text-[#8A9A91] leading-relaxed mt-0.5">
                      Send messages and media at your preferred time, all from your device.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------- */}
            {/* RIGHT COLUMN: Real Live QR Pairing Surface            */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-5 flex flex-col items-center">
              
              {/* Pale Mint / Slate Box Container */}
              <div className="w-full max-w-[340px] bg-[#F0F5F2] dark:bg-[#1E2B25] rounded-2xl p-6 sm:p-7 border border-[#DCE7E1]/80 dark:border-[#2D3D35] flex flex-col items-center justify-center text-center shadow-xs">
                
                {/* Real White QR Code Surface */}
                <div
                  className="relative w-[230px] h-[230px] bg-white p-3.5 rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] shadow-xs flex items-center justify-center overflow-hidden"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {/* STATE 1: CONNECTED */}
                  {status.state === 'connected' ? (
                    <div className="flex flex-col items-center gap-2.5 text-center p-2">
                      <div className="w-14 h-14 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] flex items-center justify-center text-[#087F5B] dark:text-[#25C993] animate-bounce motion-reduce:animate-none">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#16231F] block">
                          Linked Successfully!
                        </span>
                        <span className="text-xs text-[#5D7168] font-mono mt-1 block">
                          {status.user?.id ? `ID: ${status.user.id}` : 'WhatsApp Session Active'}
                        </span>
                      </div>
                    </div>
                  ) : status.state === 'error' ? (
                    /* STATE 2: ERROR */
                    <div className="flex flex-col items-center gap-2 text-center p-2">
                      <AlertCircle className="w-9 h-9 text-[#B42318] dark:text-[#FF938B]" />
                      <span className="text-xs font-semibold text-[#16231F]">
                        Connection Interrupted
                      </span>
                      <p className="text-[11px] text-[#5D7168] leading-tight">
                        Check your device connection and click reload.
                      </p>
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="mt-1 bg-[#087F5B] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#06684B] transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  ) : status.qrCodeUrl ? (
                    /* STATE 3: REAL QR CODE (Active or Expired) */
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={status.qrCodeUrl}
                        alt="WhatsApp Pairing QR Code. Scan using WhatsApp Linked Devices on your phone."
                        className={`w-full h-full object-contain transition-all duration-300 ${
                          isExpired ? 'blur-[4px] opacity-20 scale-95' : 'opacity-100 scale-100'
                        }`}
                      />

                      {/* EXPIRED OVERLAY */}
                      {isExpired && (
                        <div className="absolute inset-0 bg-white/90 dark:bg-[#17211D]/90 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center p-3 text-center">
                          <Clock className="w-7 h-7 text-[#9A6700] dark:text-[#F3C969] mb-1" />
                          <span className="text-xs font-bold text-[#16231F] dark:text-[#F2F7F4] block">
                            Code Expired
                          </span>
                          <span className="text-[10px] text-[#788980] dark:text-[#8A9A91] mb-2.5 block">
                            Codes refresh for your security
                          </span>
                          <button
                            type="button"
                            onClick={handleManualRefresh}
                            className="bg-[#087F5B] dark:bg-[#25C993] hover:bg-[#06684B] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-transform duration-150 hover:scale-105 active:scale-95"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Reload Code</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : status.state === 'connecting' ? (
                    /* STATE 4: LOADING / INITIALIZING SHIMMER */
                    <div className="flex flex-col items-center justify-center gap-2.5 p-3 text-center">
                      <RefreshCw className="w-7 h-7 text-[#087F5B] dark:text-[#25C993] animate-spin motion-reduce:animate-none" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-[#16231F] block">
                          Generating pairing code...
                        </span>
                        <span className="text-[10px] text-[#5D7168] block">
                          Connecting to WhatsApp multi-device
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* STATE 5: STANDBY */
                    <div className="flex flex-col items-center gap-2 text-[#788980] text-center p-2">
                      <QrCode className="w-10 h-10 text-[#788980]" />
                      <span className="text-xs font-medium">Ready to Pair</span>
                    </div>
                  )}
                </div>

                {/* Below QR: Countdown Timer */}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[#087F5B] dark:text-[#25C993] font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {status.state === 'qr_ready' && !isExpired
                      ? `Code expires in ${secondsLeft} seconds`
                      : isExpired
                      ? 'Code expired'
                      : 'Session connecting'}
                  </span>
                </div>

                {/* Below QR: Refresh Control Button */}
                <div className="mt-2.5 w-full">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="w-full bg-[#E5F5EF] hover:bg-[#D4ECE2] dark:bg-[#1D3830] dark:hover:bg-[#254A40] text-[#087F5B] dark:text-[#25C993] text-xs font-semibold py-2 px-4 rounded-xl transition-colors duration-150 shadow-2xs flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#25C993] focus-visible:outline-none disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Small Helper Text */}
                <span className="text-[11px] text-[#788980] dark:text-[#8A9A91] mt-2 block">
                  Scan with WhatsApp
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================= */}
        {/* 3. BOTTOM BAR BELOW THE CARD                            */}
        {/* ======================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#788980] dark:text-[#8A9A91] mt-5 px-3">
          {/* Left: GitHub Link & Disclaimer */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <a
              href="https://github.com/AroonKumarr/whatschedule"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#087F5B] dark:hover:text-[#25C993] transition-colors focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded"
              aria-label="View source code on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
              <span>Independent open-source software. Not affiliated with or endorsed by WhatsApp or Meta.</span>
            </a>
          </div>

          {/* Right: Phone Number Pairing Option */}
          <div>
            <button
              type="button"
              onClick={() => setShowPhonePairing(true)}
              className="text-[#087F5B] dark:text-[#25C993] hover:underline font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#087F5B] rounded px-1 focus-visible:outline-none"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Link with phone number instead</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. EXPANDABLE PHONE PAIRING MODAL                         */}
      {/* ========================================================= */}
      {showPhonePairing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#17211D] rounded-2xl border border-[#DCE7E1] dark:border-[#2D3D35] p-6 max-w-md w-full shadow-xl space-y-4 relative">
            <button
              type="button"
              onClick={() => {
                setShowPhonePairing(false);
                setPhonePairingStep('input');
              }}
              className="absolute top-4 right-4 text-[#788980] hover:text-[#16231F] dark:hover:text-[#F2F7F4] p-1 rounded-lg"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E5F5EF] dark:bg-[#1D3830] flex items-center justify-center text-[#087F5B] dark:text-[#25C993]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 id="phone-modal-title" className="text-sm font-bold text-[#16231F] dark:text-[#F2F7F4]">
                  Link with Phone Number
                </h3>
                <span className="text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
                  Alternative multi-device verification
                </span>
              </div>
            </div>

            {phonePairingStep === 'input' ? (
              <form onSubmit={handlePhonePairingSubmit} className="space-y-3 pt-2">
                <p className="text-xs text-[#5D7168] dark:text-[#B2C1B8] leading-relaxed">
                  Enter your international WhatsApp phone number to generate an official 8-character verification code:
                </p>

                {phonePairingError && (
                  <div className="p-2.5 rounded-xl bg-[#FEF3F2] dark:bg-[#2D1615] border border-[#FECDCA] dark:border-[#5B2321] text-xs text-[#B42318] dark:text-[#FF938B] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-tight">{phonePairingError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Country Code"
                    className="w-18 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-2.5 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] text-center font-mono font-medium focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#25C993] focus-visible:outline-none"
                    placeholder="+92"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    aria-label="Phone Number"
                    className="flex-1 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-xl px-3 py-2 text-xs text-[#16231F] dark:text-[#F2F7F4] font-mono focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#25C993] focus-visible:outline-none placeholder-[#788980]"
                    placeholder="e.g. 0331 0390837 or 331 0390837"
                    required
                  />
                </div>

                <p className="text-[11px] text-[#788980] dark:text-[#8A9A91]">
                  Tip: Supports local numbers starting with 0 (e.g. 0331...) or international numbers directly.
                </p>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={phonePairingLoading}
                    className="w-full bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] text-white dark:text-[#0D3027] text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {phonePairingLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Requesting code from WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-[#5D7168] dark:text-[#B2C1B8]">
                  Enter this official code on your phone in WhatsApp:
                </p>

                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-mono font-bold tracking-widest text-[#087F5B] dark:text-[#25C993] bg-[#E5F5EF] dark:bg-[#1D3830] py-3 px-5 rounded-xl border border-[#087F5B]/30 dark:border-[#25C993]/30 select-all">
                    {phonePairingCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-3 bg-[#F0F5F2] dark:bg-[#1E2B25] hover:bg-[#E5F5EF] dark:hover:bg-[#254A40] text-[#16231F] dark:text-[#F2F7F4] rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] transition-colors flex items-center justify-center"
                    title="Copy Pairing Code"
                    aria-label="Copy Pairing Code"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-[#087F5B] dark:text-[#25C993]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#5D7168] dark:text-[#B2C1B8]" />
                    )}
                  </button>
                </div>

                <div className="bg-[#F0F5F2] dark:bg-[#1E2B25] p-3 rounded-xl border border-[#DCE7E1] dark:border-[#2D3D35] text-left text-xs text-[#5D7168] dark:text-[#B2C1B8] space-y-1.5">
                  <div className="font-semibold text-[#16231F] dark:text-[#F2F7F4]">How to enter this code:</div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Open WhatsApp on your phone</li>
                    <li>Tap <strong>Settings</strong> (iOS) or <strong>⋮ More options</strong> (Android) &gt; <strong>Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong> &gt; <strong>Link with phone number instead</strong></li>
                    <li>Type the code shown above</li>
                  </ol>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#087F5B] dark:text-[#25C993] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#25C993] animate-ping" />
                  <span>Waiting for your phone to confirm connection...</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPhonePairingStep('input');
                    setPhonePairingError(null);
                  }}
                  className="text-xs text-[#5D7168] dark:text-[#8A9A91] hover:underline pt-1 block mx-auto"
                >
                  Change phone number
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer spacer */}
      <footer className="w-full text-center text-[11px] text-[#788980] dark:text-[#8A9A91] pt-4">
        © {new Date().getFullYear()} Aroon Kumar. All rights reserved.
      </footer>
    </div>
  );
};
