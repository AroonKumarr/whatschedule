import React, { useState } from 'react';
import { OCCASION_TEMPLATES, MessageTemplate } from '../services/templates';
import {
  FileCode,
  Search,
  Copy,
  Check,
  Send,
  Calendar,
  Sparkles,
  Globe,
} from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (text: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'birthday', label: 'Birthdays' },
    { id: 'meeting', label: 'Meetings' },
    { id: 'payment', label: 'Payment Reminders' },
    { id: 'followup', label: 'Follow-ups' },
    { id: 'hr_salary', label: 'HR & Work' },
  ];

  const languages = [
    { code: 'all', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'Urdu (اردو)' },
    { code: 'ar', label: 'Arabic (العربية)' },
    { code: 'es', label: 'Spanish' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
  ];

  const filtered = OCCASION_TEMPLATES.filter((tpl) => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (selectedLanguage !== 'all' && tpl.language !== selectedLanguage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 h-full bg-[#0B0F0D] flex flex-col overflow-hidden select-none text-[#F2F7F4]">
      {/* Header Bar */}
      <div className="p-5 border-b border-[#242424] bg-[#111111] space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1D3830] text-[#2DD4A7]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Message Templates Library
              </h2>
              <p className="text-xs text-[#8A9A91]">
                Pre-composed occasion greetings, business follow-ups, and reminders in 7 languages
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#787878] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full h-8 pl-8 pr-3 bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#2DD4A7] rounded-xl text-xs text-white placeholder-[#787878] focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1D3830] text-[#2DD4A7] border border-[#2DD4A7]/30'
                  : 'bg-[#171717] text-[#8A9A91] hover:text-white hover:bg-[#202020] border border-[#262626]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-[#2E2E2E] mx-1 hidden sm:block" />

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 ml-auto text-xs text-[#8A9A91]">
            <Globe className="w-3.5 h-3.5" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              aria-label="Filter by language"
              className="bg-[#171717] border border-[#262626] rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-[#787878] text-xs">
            <FileCode className="w-10 h-10 opacity-30 text-[#2DD4A7] mb-2" />
            <p>No templates found matching your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filtered.map((tpl) => {
              const isCopied = copiedId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className="bg-[#141C18] border border-[#23332B] hover:border-[#2DD4A7]/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 group shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4A7] bg-[#1D3830] px-2 py-0.5 rounded-md border border-[#2DD4A7]/20">
                        {tpl.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#787878]">
                        {tpl.language}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-[#2DD4A7] transition-colors">
                      {tpl.title}
                    </h4>

                    <p className="text-xs text-[#B2C1B8] leading-relaxed line-clamp-4 font-normal">
                      {tpl.text}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 mt-2 border-t border-[#1F2C25]">
                    <button
                      type="button"
                      onClick={() => handleCopy(tpl.id, tpl.text)}
                      className="flex-1 py-1.5 px-3 bg-[#19241F] hover:bg-[#203029] text-[#B2C1B8] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy text"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2DD4A7]" />
                          <span className="text-[#2DD4A7]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUseTemplate(tpl.text)}
                      className="flex-1 py-1.5 px-3 bg-[#2DD4A7] hover:bg-[#25C993] text-[#0D3027] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Use in Composer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Use</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
