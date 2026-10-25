import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const POPULAR_COUNTRIES: CountryInfo[] = [
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
];

interface CountryCodePickerProps {
  value: string; // e.g. "+92" or "92"
  onChange: (dialCode: string) => void;
  className?: string;
}

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cleanVal = value.startsWith('+') ? value : `+${value}`;
  const selectedCountry =
    POPULAR_COUNTRIES.find((c) => c.dialCode === cleanVal) ||
    POPULAR_COUNTRIES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = POPULAR_COUNTRIES.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 px-3 bg-[#F6F9F7] dark:bg-[#101815] border border-[#DCE7E1] dark:border-[#2D3D35] hover:border-[#087F5B] dark:hover:border-[#25C993] rounded-xl flex items-center gap-2 text-xs text-[#16231F] dark:text-[#F2F7F4] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25C993]"
        title="Select Country Code"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono font-semibold">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#5D7168] dark:text-[#8A9A91] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Field */}
          <div className="p-2 border-b border-[#DCE7E1] dark:border-[#2D3D35] bg-[#F0F5F2] dark:bg-[#1E2B25]/60 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#5D7168] dark:text-[#8A9A91] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full bg-transparent text-xs text-[#16231F] dark:text-[#F2F7F4] placeholder-[#788980] focus:outline-none"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-[#DCE7E1]/40 dark:divide-[#2D3D35]/40" role="listbox">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#788980] dark:text-[#8A9A91]">
                No country found
              </div>
            ) : (
              filtered.map((country) => {
                const isSelected = country.dialCode === cleanVal;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => {
                      onChange(country.dialCode);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-[#E5F5EF] dark:bg-[#1D3830] text-[#087F5B] dark:text-[#25C993] font-semibold'
                        : 'text-[#16231F] dark:text-[#F2F7F4] hover:bg-[#F0F5F2] dark:hover:bg-[#1E2B25]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono text-[11px] text-[#5D7168] dark:text-[#8A9A91]">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
