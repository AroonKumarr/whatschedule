import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'horizontal' | 'stacked' | 'favicon' | 'monochrome' | 'light';
  showBadge?: boolean;
  badgeText?: string;
}

/**
 * WhatsSchedule Official Brand Identity & Mark
 * 
 * Concept: The Chrono-Dial Chat Mark (9:00 Precision Edition)
 * Fusion of a contemporary fluid messaging bubble with a high-precision schedule dial.
 * 100% original geometry — zero phone handset elements, completely free of Meta/WhatsApp trademark conflicts.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  variant = 'symbol',
  showBadge = false,
  badgeText = 'v1.0',
}) => {
  // Gradients and color tokens
  const primaryTeal = '#05A985';
  const primaryGreen = '#25D366';
  const darkCard = '#111B21';

  // Standalone Symbol Component
  const renderSymbol = (iconSize: number, mono: boolean = false, lightBg: boolean = false) => {
    const strokeColor = mono ? '#FFFFFF' : lightBg ? '#0A3323' : '#FFFFFF';
    const dialFill = mono ? '#FFFFFF' : lightBg ? '#0A3323' : '#FFFFFF';

    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="WhatsSchedule Symbol"
        className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
      >
        <defs>
          <linearGradient id="chronoGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor={primaryTeal} />
            <stop offset="1" stopColor={primaryGreen} />
          </linearGradient>
          <filter id="markGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#25D366" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Dynamic Messaging Glyph Base with Smooth Chat Pointer */}
        <path
          d="M24 4.5C13.23 4.5 4.5 13.23 4.5 24C4.5 27.68 5.53 31.13 7.31 34.08L4.85 42.65C4.64 43.39 5.26 44.01 6.00 43.80L14.57 41.34C17.47 43.07 20.87 44.05 24.5 44.05C35.27 44.05 44 35.32 44 24.55C44 13.78 35.27 4.5 24.5 4.5H24Z"
          fill={mono ? '#2A3942' : 'url(#chronoGradient)'}
          filter="url(#markGlow)"
        />

        {/* Chrono-Dial Outer Track Ring */}
        <circle
          cx="24.5"
          cy="23.5"
          r="10.5"
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeOpacity={mono ? 0.9 : 0.95}
        />

        {/* Precision 9:00 Time Dial Hands (9:00 HR salary & reminder benchmark) */}
        <path
          d="M24.5 16.5V23.5H18"
          stroke={dialFill}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Escapement Hub */}
        <circle cx="24.5" cy="23.5" r="1.8" fill={dialFill} />

        {/* Minute Index Accent Ticks at 12, 3, 6 */}
        <circle cx="24.5" cy="14.2" r="0.75" fill={dialFill} fillOpacity="0.8" />
        <circle cx="33.8" cy="23.5" r="0.75" fill={dialFill} fillOpacity="0.8" />
        <circle cx="24.5" cy="32.8" r="0.75" fill={dialFill} fillOpacity="0.8" />
      </svg>
    );
  };

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderSymbol(size)}</div>;
  }

  if (variant === 'monochrome') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderSymbol(size, true)}</div>;
  }

  if (variant === 'light') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderSymbol(size, false, true)}</div>;
  }

  if (variant === 'favicon') {
    // Ultra-crisp, high-contrast 16-32px mark
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="32" height="32" rx="7" fill={primaryTeal} />
        <circle cx="16" cy="15" r="8" stroke="#FFFFFF" strokeWidth="2.2" />
        <path d="M16 10V15H11.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="15" r="1.3" fill="#FFFFFF" />
      </svg>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {renderSymbol(size)}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[#E9EDEF]">
              Whats<span className="text-[#25D366]">Schedule</span>
            </span>
            {showBadge && (
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-[#05A985]/20 text-[#25D366] border border-[#05A985]/30">
                {badgeText}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-[#8696A0] tracking-wide">
            Automated Message & Media Scheduler
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {renderSymbol(size)}
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-[#E9EDEF] block">
            Whats<span className="text-[#25D366]">Schedule</span>
          </span>
          <p className="text-xs text-[#8696A0] mt-1 font-medium">Your Messages. Your Time.</p>
        </div>
      </div>
    );
  }

  return renderSymbol(size);
};
