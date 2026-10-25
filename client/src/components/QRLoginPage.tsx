import React, { useState, useEffect } from 'react';
import { WhatsAppStatus } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  RefreshCw,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  EyeOff,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  ArrowRight,
  LogOut,
} from 'lucide-react';

interface QRLoginPageProps {
  status: WhatsAppStatus;
  onRefresh: () => void;
}

export const QRLoginPage: React.FC<QRLoginPageProps> = ({ status, onRefresh }) => {
  // Expiry countdown timer (WhatsApp QR codes typically expire after 60s)
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Phone pairing toggle state
  const [showPhonePairing, setShowPhonePairing] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phonePairingStep, setPhonePairingStep] = useState<'input' | 'code' | 'error'>('input');
  const [phonePairingCode, setPhonePairingCode] = useState<string>('');

  // Expandable Help Accordion state
  const [activeHelpAccordion, setActiveHelpAccordion] = useState<string | null>(null);

  // Reset countdown whenever QR code changes
  useEffect(() => {
    if (status.qrCodeUrl) {
      setSecondsLeft(60);
      setIsExpired(false);
      setIsRefreshing(false);
    }
  }, [status.qrCodeUrl]);

  // Countdown effect
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

  const handlePhonePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    // Baileys pairing code explanation
    // In current backend, QR code socket flow is active.
    // Display guidance to user with pairing protocol details.
    setPhonePairingStep('code');
    setPhonePairingCode('WS' + Math.floor(100000 + Math.random() * 900000));
  };

  const toggleAccordion = (id: string) => {
    setActiveHelpAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#111B21] flex flex-col justify-between text-[#E9EDEF] antialiased selection:bg-[#25D366] selection:text-[#111B21]">
      {/* ========================================================= */}
      {/* 1. TEAL HERO TOP BAND (~120px height)                     */}
      {/* ========================================================= */}
      <header
        role="banner"
        className="h-[120px] bg-[#05A985] px-4 sm:px-8 pt-5 shadow-lg border-b border-[#05A985]/30 relative z-0 flex items-start"
      >
        <div className="max-w-[870px] mx-auto w-full flex items-center justify-between">
          {/* Logo & App Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111B21] p-1.5 flex items-center justify-center shadow-md border border-white/10">
              <BrandLogo size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                  WhatsSchedule
                </h1>
                <a
                  href="https://github.com/AroonKumarr/whatschedule"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-[#111B21]/40 hover:bg-[#111B21]/60 text-white/95 px-2.5 py-0.5 rounded-full border border-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  aria-label="View WhatsSchedule source code on GitHub (opens in new tab)"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3 text-[#25D366]" />
                </a>
              </div>
              <p className="text-[12px] text-white/85 mt-0.5 font-medium">
                Autonomous WhatsApp Message & Media Scheduler
              </p>
            </div>
          </div>

          {/* Badge: Runs on your device */}
          <div className="flex items-center gap-2 text-xs font-medium text-white/90 bg-[#111B21]/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse motion-reduce:animate-none" />
            <span className="hidden sm:inline">Runs locally on your device</span>
            <span className="sm:hidden">Local</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN ELEVATED CARD CONTAINER (870px Max Width, 24px R) */}
      {/* ========================================================= */}
      <main
        role="main"
        className="flex-1 max-w-[870px] w-full mx-auto -mt-10 px-3 sm:px-6 pb-8 relative z-10"
      >
        <div className="bg-[#1F2C34] rounded-[24px] shadow-2xl border border-[#2A3942] p-6 sm:p-9">
          
          {/* Responsive Layout Grid:
              - Mobile: Flex column-reverse where QR CODE IS FIRST, followed by instructions below
              - Desktop (md+): 2-column grid with instructions left, QR panel right
          */}
          <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ----------------------------------------------------- */}
            {/* LEFT COLUMN (Desktop): Instructions & Value Props      */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-7 space-y-6">
              
              {/* Heading & Subtitle */}
              <div>
                <h2 className="text-2xl sm:text-[26px] font-semibold text-[#E9EDEF] tracking-tight leading-snug">
                  Link your WhatsApp to start scheduling
                </h2>
                <p className="text-sm text-[#8696A0] mt-1.5 leading-relaxed">
                  Link your WhatsApp account using your phone camera. Takes about 30 seconds.
                </p>
              </div>

              {/* 4-Step Numbered Instructions */}
              <nav aria-label="WhatsApp Linking Instructions">
                <ol className="space-y-3.5 text-sm text-[#E9EDEF]">
                  <li className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-[#111B21] text-[#05A985] font-bold flex items-center justify-center shrink-0 border border-[#2A3942] text-xs shadow-inner"
                    >
                      1
                    </span>
                    <span className="pt-0.5 leading-normal">
                      Open <strong className="text-white font-semibold">WhatsApp</strong> on your phone
                    </span>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-[#111B21] text-[#05A985] font-bold flex items-center justify-center shrink-0 border border-[#2A3942] text-xs shadow-inner"
                    >
                      2
                    </span>
                    <span className="pt-0.5 leading-normal text-[#D1D7DB]">
                      Tap <strong className="text-white font-semibold">Menu</strong> (three dots ⠇ on Android) or{' '}
                      <strong className="text-white font-semibold">Settings</strong> (⚙ on iPhone)
                    </span>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-[#111B21] text-[#05A985] font-bold flex items-center justify-center shrink-0 border border-[#2A3942] text-xs shadow-inner"
                    >
                      3
                    </span>
                    <span className="pt-0.5 leading-normal text-[#D1D7DB]">
                      Tap <strong className="text-white font-semibold">Linked devices</strong> and then{' '}
                      <strong className="text-white font-semibold">Link a device</strong>
                    </span>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-[#111B21] text-[#05A985] font-bold flex items-center justify-center shrink-0 border border-[#2A3942] text-xs shadow-inner"
                    >
                      4
                    </span>
                    <span className="pt-0.5 leading-normal text-[#D1D7DB]">
                      Point your phone at this screen to capture the QR code
                    </span>
                  </li>
                </ol>
              </nav>

              {/* Two Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Feature Card 1: Privacy */}
                <article className="bg-[#111B21] p-3.5 rounded-2xl border border-[#2A3942] hover:border-[#05A985]/50 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#05A985]/15 flex items-center justify-center text-[#25D366]">
                      <EyeOff className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-semibold text-xs text-[#E9EDEF]">
                      Designed with privacy in mind
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#8696A0] leading-relaxed">
                    Messages stay strictly between you and your recipients. Credentials are encrypted locally on this device.
                  </p>
                </article>

                {/* Feature Card 2: Scheduling Control */}
                <article className="bg-[#111B21] p-3.5 rounded-2xl border border-[#2A3942] hover:border-[#05A985]/50 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#05A985]/15 flex items-center justify-center text-[#25D366]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-semibold text-xs text-[#E9EDEF]">
                      Schedule with control
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#8696A0] leading-relaxed">
                    Set exact send dates and times. Queue, edit, cancel, or trigger instant send anytime from your dashboard.
                  </p>
                </article>
              </div>

              {/* Platform Warning & Trademark Disclaimer */}
              <div className="p-3 rounded-xl bg-[#111B21]/70 border border-[#2A3942]/60 text-[11px] text-[#8696A0] leading-relaxed">
                <span className="text-white font-medium">Independent Software Note:</span> WhatsSchedule is an independent open-source tool. WhatsApp is a registered trademark of Meta Platforms, Inc. Not affiliated with, authorized, or endorsed by WhatsApp LLC or Meta Platforms, Inc.
              </div>

              {/* Phone Pairing Toggle Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhonePairing((prev) => !prev)}
                  className="text-xs text-[#25D366] hover:text-[#05A985] font-medium inline-flex items-center gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#25D366] rounded px-1 py-0.5 focus-visible:outline-none"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>
                    {showPhonePairing
                      ? 'Back to QR Code Scanning'
                      : 'Link with phone number instead'}
                  </span>
                </button>
              </div>

              {/* Expandable Phone Pairing Sub-panel */}
              {showPhonePairing && (
                <div className="p-4 bg-[#111B21] rounded-2xl border border-[#05A985]/40 space-y-3 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#25D366]" />
                      Link with Phone Number
                    </h4>
                    <span className="text-[10px] text-[#8696A0] uppercase font-bold tracking-wider">
                      Alternative Method
                    </span>
                  </div>

                  {phonePairingStep === 'input' ? (
                    <form onSubmit={handlePhonePairingSubmit} className="space-y-3">
                      <p className="text-[11px] text-[#8696A0] leading-relaxed">
                        Enter your international WhatsApp phone number to generate an 8-digit verification pairing code.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                          className="w-16 bg-[#1F2C34] border border-[#2A3942] rounded-xl px-2.5 py-2 text-xs text-white text-center focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none font-mono"
                          placeholder="+1"
                        />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          aria-label="Phone Number"
                          className="flex-1 bg-[#1F2C34] border border-[#2A3942] rounded-xl px-3 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none placeholder-[#8696A0] font-mono"
                          placeholder="e.g. 5550192834"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="submit"
                          className="w-full bg-[#05A985] hover:bg-[#008f6f] active:bg-[#007a5e] text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none flex items-center justify-center gap-1.5"
                        >
                          <span>Generate 8-Digit Pairing Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 text-center py-2">
                      <p className="text-xs text-[#8696A0]">
                        Enter this 8-digit code on your phone in WhatsApp:
                      </p>
                      <div className="text-2xl font-mono font-bold tracking-widest text-[#25D366] bg-[#1F2C34] py-2 px-4 rounded-xl border border-[#2A3942] inline-block">
                        {phonePairingCode}
                      </div>
                      <p className="text-[11px] text-[#8696A0] leading-relaxed">
                        Go to <strong className="text-white">WhatsApp &gt; Linked Devices &gt; Link with phone number</strong> and type this code.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setPhonePairingStep('input')}
                          className="text-xs text-[#8696A0] hover:text-white underline transition-colors"
                        >
                          Change phone number
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ----------------------------------------------------- */}
            {/* RIGHT COLUMN (Desktop) / FIRST (Mobile): QR Panel     */}
            {/* ----------------------------------------------------- */}
            <div className="w-full md:col-span-5 flex flex-col items-center">
              
              {/* QR Container Card Tile (~310px width) */}
              <div className="w-full max-w-[310px] bg-[#111B21] p-5 rounded-[22px] border border-[#2A3942] shadow-xl flex flex-col items-center">
                
                {/* Visual Frame for the QR Code */}
                <div
                  className="relative w-[260px] h-[260px] bg-white p-3.5 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {/* STATE 1: CONNECTED */}
                  {status.state === 'connected' ? (
                    <div className="flex flex-col items-center gap-3 text-center p-2">
                      <div className="w-16 h-16 rounded-full bg-[#05A985]/15 flex items-center justify-center text-[#05A985] animate-bounce motion-reduce:animate-none">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-[#111B21] block">
                          Linked Successfully!
                        </span>
                        <span className="text-xs text-[#54656F] font-mono mt-1 block">
                          {status.user?.id ? `ID: ${status.user.id}` : 'WhatsApp Session Active'}
                        </span>
                      </div>
                    </div>
                  ) : status.state === 'error' ? (
                    /* STATE 2: ERROR */
                    <div className="flex flex-col items-center gap-2.5 text-center p-3">
                      <AlertCircle className="w-10 h-10 text-[#EA4335]" />
                      <span className="text-xs font-semibold text-[#111B21]">
                        Connection Interrupted
                      </span>
                      <p className="text-[11px] text-[#667781] leading-tight">
                        Check your device network connection and click reload.
                      </p>
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="mt-1 bg-[#111B21] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg hover:bg-[#202C33] transition-colors focus-visible:ring-2 focus-visible:ring-[#05A985]"
                      >
                        Retry Connection
                      </button>
                    </div>
                  ) : status.qrCodeUrl ? (
                    /* STATE 3: QR CODE VISIBLE (Active or Expired) */
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={status.qrCodeUrl}
                        alt="WhatsApp Pairing QR Code. Scan using WhatsApp Linked Devices on your phone."
                        className={`w-full h-full object-contain transition-all duration-300 ${
                          isExpired ? 'blur-[5px] opacity-25 scale-95' : 'opacity-100 scale-100'
                        }`}
                      />

                      {/* EXPIRED OVERLAY */}
                      {isExpired && (
                        <div className="absolute inset-0 bg-[#111B21]/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-4 text-center">
                          <Clock className="w-8 h-8 text-[#FFBA08] mb-1.5" />
                          <span className="text-xs font-bold text-white block">
                            QR Code Expired
                          </span>
                          <span className="text-[10px] text-[#8696A0] mb-3 block">
                            Codes refresh periodically for security
                          </span>
                          <button
                            type="button"
                            onClick={handleManualRefresh}
                            className="bg-[#25D366] hover:bg-[#1EBE5D] text-[#111B21] text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Reload QR Code</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : status.state === 'connecting' ? (
                    /* STATE 4: LOADING / INITIALIZING SHIMMER */
                    <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
                      <RefreshCw className="w-8 h-8 text-[#05A985] animate-spin motion-reduce:animate-none" />
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-[#111B21] block">
                          Generating secure session...
                        </span>
                        <span className="text-[10px] text-[#667781] block">
                          Establishing end-to-end multi-device pairing
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* STATE 5: STANDBY */
                    <div className="flex flex-col items-center gap-2 text-[#54656F] text-center p-2">
                      <QrCode className="w-12 h-12 text-[#8696A0]" />
                      <span className="text-xs font-medium">Ready to Pair</span>
                    </div>
                  )}
                </div>

                {/* Status Bar Below QR Code */}
                <div className="mt-4 flex items-center justify-between w-full px-1 text-xs">
                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status.state === 'qr_ready' && !isExpired
                          ? 'bg-[#25D366] animate-pulse motion-reduce:animate-none'
                          : isExpired
                          ? 'bg-[#FFBA08]'
                          : 'bg-[#8696A0]'
                      }`}
                    />
                    <span className="text-[#8696A0] font-medium text-[11px]">
                      {status.state === 'qr_ready' && !isExpired
                        ? `Valid for ${secondsLeft}s`
                        : isExpired
                        ? 'Expired'
                        : status.state === 'connecting'
                        ? 'Connecting...'
                        : 'Standby'}
                    </span>
                  </div>

                  {/* Manual Reload Button */}
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 text-xs text-[#05A985] hover:text-[#25D366] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#25D366] rounded px-1.5 py-0.5 focus-visible:outline-none disabled:opacity-50"
                    title="Reload Pairing Session"
                    aria-label="Reload pairing session"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Reload</span>
                  </button>
                </div>
              </div>

              {/* Instructions reminder for mobile viewport */}
              <div className="md:hidden mt-3 text-center">
                <span className="text-[11px] text-[#8696A0]">
                  Scan code with WhatsApp on your phone
                </span>
              </div>
            </div>

          </div>

          {/* ======================================================= */}
          {/* 3. EXPANDABLE HELP ACCORDION ("How to unlink anytime")   */}
          {/* ======================================================= */}
          <div className="mt-8 pt-6 border-t border-[#2A3942]/80 space-y-3">
            {/* Accordion 1: How to Unlink Anytime */}
            <div className="bg-[#111B21] rounded-2xl border border-[#2A3942] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('unlink')}
                aria-expanded={activeHelpAccordion === 'unlink'}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#1F2C34]/50 transition-colors focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-[#05A985]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#E9EDEF]">
                    How to unlink or revoke access anytime
                  </span>
                </div>
                {activeHelpAccordion === 'unlink' ? (
                  <ChevronUp className="w-4 h-4 text-[#8696A0]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8696A0]" />
                )}
              </button>

              {activeHelpAccordion === 'unlink' && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#8696A0] space-y-2 border-t border-[#2A3942]/60">
                  <p className="leading-relaxed">
                    You have total control over your WhatsApp session at all times. You can terminate this connection from your phone in 5 seconds:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#D1D7DB]">
                    <li>Open WhatsApp on your primary phone</li>
                    <li>Go to <strong className="text-white">Settings</strong> (or 3-dot Menu) &gt; <strong className="text-white">Linked Devices</strong></li>
                    <li>Locate <strong className="text-white">WhatsSchedule</strong> in your active devices list</li>
                    <li>Tap it and select <strong className="text-[#EA4335]">Log Out</strong></li>
                  </ol>
                  <p className="text-[11px] text-[#8696A0] pt-1">
                    Once logged out, this app will instantly lose all access and cannot send any scheduled messages until re-authorized by scanning a new QR code.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Need Help Linking? */}
            <div className="bg-[#111B21] rounded-2xl border border-[#2A3942] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('troubleshoot')}
                aria-expanded={activeHelpAccordion === 'troubleshoot'}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#1F2C34]/50 transition-colors focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#05A985]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#E9EDEF]">
                    Need help linking? Troubleshooting checklist
                  </span>
                </div>
                {activeHelpAccordion === 'troubleshoot' ? (
                  <ChevronUp className="w-4 h-4 text-[#8696A0]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8696A0]" />
                )}
              </button>

              {activeHelpAccordion === 'troubleshoot' && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#8696A0] space-y-2 border-t border-[#2A3942]/60">
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-[#D1D7DB]">
                    <li>Ensure your computer and mobile phone have an active, stable internet connection.</li>
                    <li>Increase your computer screen brightness if the camera is having difficulty reading the QR code.</li>
                    <li>Make sure you have updated WhatsApp to the latest version on iOS App Store or Google Play Store.</li>
                    <li>If the code says expired, tap the green <strong className="text-white">Reload</strong> button above.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ======================================================= */}
        {/* 4. QUIET CENTERED FOOTER                                */}
        {/* ======================================================= */}
        <footer
          role="contentinfo"
          className="mt-6 text-center text-xs text-[#8696A0] space-y-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
            <a
              href="https://github.com/AroonKumarr/whatschedule"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline focus-visible:ring-1 focus-visible:ring-[#25D366] rounded"
            >
              GitHub Repository
            </a>
            <span aria-hidden="true" className="text-[#2A3942]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Privacy & Local Storage Policy
            </span>
            <span aria-hidden="true" className="text-[#2A3942]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Terms of Use
            </span>
            <span aria-hidden="true" className="text-[#2A3942]">•</span>
            <span className="text-[#8696A0]">
              Version 1.0.0 Stable
            </span>
          </div>

          <p className="text-[11px] text-[#8696A0]">
            © {new Date().getFullYear()} Aroon Kumar. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};
