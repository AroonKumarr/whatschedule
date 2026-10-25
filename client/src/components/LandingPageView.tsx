import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import {
  Calendar,
  Clock,
  Send,
  ShieldCheck,
  TrendingUp,
  Share2,
  CheckCircle2,
  ArrowRight,
  Github,
  Zap,
  Globe,
  Lock,
  ChevronDown,
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterDashboard: () => void;
  themeMode: 'light' | 'dark' | 'auto';
  onToggleTheme: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterDashboard,
  themeMode,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#334155] px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size={36} showSubtitle={false} />

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-[#1877F2] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1877F2] transition-colors">
              How It Works
            </a>
            <a href="#platforms" className="hover:text-[#1877F2] transition-colors">
              Platforms
            </a>
            <a href="#faq" className="hover:text-[#1877F2] transition-colors">
              FAQ
            </a>
            <a
              href="https://github.com/AroonKumarr/whatschedule"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Right Action & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle
              themeMode={themeMode}
              onToggleTheme={onToggleTheme}
              className="p-1.5"
            />
            <button
              type="button"
              onClick={onEnterDashboard}
              className="px-4 py-2 bg-gradient-to-r from-[#1877F2] via-[#E4405F] to-[#9333EA] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-5xl mx-auto text-center space-y-6">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
          <span>v1.0 Pro — Multi-Platform Scheduling Platform</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1F2937] dark:text-white leading-[1.12]">
          One App. All Your Social Media.{' '}
          <span className="bg-gradient-to-r from-[#1877F2] via-[#E4405F] to-[#9333EA] bg-clip-text text-transparent">
            Scheduled.
          </span>
        </h1>

        {/* Subhead */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Easily connect your WhatsApp, Instagram, Facebook, LinkedIn, X and more.
          Create your content, set the time, and let WhatsSchedule do the rest.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-7 py-3 bg-[#1877F2] hover:bg-[#1664D9] text-white text-xs font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Free Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/AroonKumarr/whatschedule"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" />
            <span>Explore on GitHub</span>
          </a>
        </div>

        {/* Platform Indicator Chips */}
        <div id="platforms" className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { label: 'WhatsApp', color: '#25D366', bg: '#25D36615' },
            { label: 'Instagram', color: '#E4405F', bg: '#E4405F15' },
            { label: 'Facebook', color: '#1877F2', bg: '#1877F215' },
            { label: 'LinkedIn', color: '#0A66C2', bg: '#0A66C215' },
            { label: 'X (Twitter)', color: '#000000', bg: '#00000015' },
          ].map((item) => (
            <span
              key={item.label}
              style={{ borderColor: `${item.color}35`, color: item.color }}
              className="text-[11px] font-bold px-3 py-1 rounded-full border bg-white dark:bg-[#1E293B] shadow-2xs"
            >
              ● {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* 6 Key Pillars from Approved Brand Asset Board */}
      <section id="features" className="px-6 py-16 bg-white dark:bg-[#1E293B]/40 border-y border-slate-200 dark:border-[#334155]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937] dark:text-white">
              Engineered for Creators, Freelancers & Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to orchestrate multi-platform messaging without manual reminders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Schedule Posts */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#1877F2] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Schedule Posts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Plan and queue your content for the exact right moment across timezones with atomic database locks.
              </p>
            </div>

            {/* Feature 2: Send Messages */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-[#25D366] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Send Messages
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Reach your audience effortlessly with 1-on-1 texts, documents, media attachments, and voice notes.
              </p>
            </div>

            {/* Feature 3: Track Performance */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950 text-[#E4405F] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Track Performance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspect real delivery receipts, failed retry diagnostics, and scheduling timeline breakdowns.
              </p>
            </div>

            {/* Feature 4: Multiple Platforms */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-[#9333EA] flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multiple Platforms
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Manage WhatsApp, Instagram, Facebook, LinkedIn, X and future channels from a single unified workspace.
              </p>
            </div>

            {/* Feature 5: Secure & Reliable */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-[#06B6D4] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Secure & Reliable
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Local-first architecture. Your contacts and private session keys remain strictly on your machine.
              </p>
            </div>

            {/* Feature 6: Simple & Easy */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simple & Easy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No complex bot configurations or developer approvals required. Link with QR or phone number in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-16 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#1877F2] uppercase tracking-wider">
            Three Simple Steps
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937] dark:text-white">
            Connect. Create. Schedule. Grow.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Connect Channels
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pair your WhatsApp companion session using QR code or 8-digit phone pairing, and authorize social accounts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E4405F] text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Draft & Customize
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compose targeted messages, choose occasion templates in 7 languages, and attach video or document media.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#9333EA] text-white flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Dispatch
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our scheduling engine polls due jobs with mutex serialization, anti-ban typing simulation, and error classification.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-16 bg-white dark:bg-[#1E293B]/40 border-t border-slate-200 dark:border-[#334155]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#1F2937] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear, transparent answers about privacy and platform policies.
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            <div className="py-4 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Does WhatsSchedule store my contacts or chat history on external servers?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                No. WhatsSchedule is a local-first application. All message contents, contacts, and authentication session keys remain stored securely in your local SQLite database on your own machine.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Is WhatsSchedule officially affiliated with WhatsApp, Meta, or X?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                WhatsSchedule is an independent open-source project. WhatsApp, Instagram, Facebook, LinkedIn, and X are registered trademarks of their respective owners.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                How does the Anti-Ban Protection work?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Messages to the same recipient are serialized through per-recipient mutex locks with random human typing delays (jitter) to prevent concurrent flooding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-200 dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size={28} showSubtitle={false} />
          <div>
            © {new Date().getFullYear()} Aroon Kumar. Open Source MIT License.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/AroonKumarr/whatschedule" target="_blank" rel="noreferrer" className="hover:underline">
              GitHub
            </a>
            <button type="button" onClick={onEnterDashboard} className="hover:underline font-semibold text-[#1877F2]">
              Launch Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
