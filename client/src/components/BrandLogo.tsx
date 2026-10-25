import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'horizontal' | 'stacked' | 'app-icon' | 'monochrome';
  showSubtitle?: boolean;
  subtitle?: string;
  inverted?: boolean;
}

/**
 * WhatsSchedule Official Brand Identity
 * Faithfully matches the approved brand specification:
 * - Rounded Calendar with gradient frame (#06B6D4 Cyan -> #1877F2 Blue -> #9333EA Purple)
 * - 5 Supported Platform Icons: WhatsApp (#25D366), Instagram (#E4405F), Facebook (#1877F2), LinkedIn (#0A66C2), X (#000000 / #FFFFFF)
 * - Clock dial accent in lower-right with vibrant gradient ring
 * - Wordmark: "Whats" in bold + "Schedule" in vibrant brand gradient (#1877F2 -> #E4405F -> #9333EA)
 * - Subtitle: "Connect • Create • Schedule • Grow"
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 40,
  variant = 'symbol',
  showSubtitle = false,
  subtitle = 'Connect • Create • Schedule • Grow',
  inverted = false,
}) => {
  // Render Official Calendar + Social Icons + Clock Symbol
  const renderSymbol = (iconSize: number) => {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="WhatsSchedule Brand Icon"
        className="shrink-0 transition-transform duration-150 hover:scale-[1.03]"
      >
        <defs>
          {/* Main Calendar Frame Gradient (Cyan -> Blue -> Purple) */}
          <linearGradient id="wsCalendarBorder" x1="10" y1="15" x2="110" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="35%" stopColor="#1877F2" />
            <stop offset="70%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#E4405F" />
          </linearGradient>

          {/* Clock Ring Gradient */}
          <linearGradient id="wsClockRing" x1="65" y1="65" x2="115" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E4405F" />
            <stop offset="60%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Instagram Icon Gradient */}
          <linearGradient id="wsInstaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#833AB4" />
            <stop offset="50%" stopColor="#FD1D1D" />
            <stop offset="100%" stopColor="#FCB045" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id="wsLogoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Calendar Frame Outer Border */}
        <rect
          x="12"
          y="18"
          width="82"
          height="82"
          rx="24"
          fill="none"
          stroke="url(#wsCalendarBorder)"
          strokeWidth="6"
          filter="url(#wsLogoShadow)"
        />

        {/* Calendar Card Background */}
        <rect
          x="15"
          y="21"
          width="76"
          height="76"
          rx="21"
          className="fill-white dark:fill-[#1E293B]"
        />

        {/* Calendar Top Binder Rings */}
        <rect x="28" y="10" width="6" height="14" rx="3" fill="#9333EA" />
        <rect x="72" y="10" width="6" height="14" rx="3" fill="#06B6D4" />

        {/* Row 1 Social Icons: WhatsApp (#25D366), Instagram (#E4405F), Facebook (#1877F2) */}
        {/* WhatsApp Icon */}
        <g transform="translate(24, 30)">
          <rect width="16" height="16" rx="4.5" fill="#25D366" />
          <path
            d="M8 3.5C5.515 3.5 3.5 5.515 3.5 8C3.5 8.85 3.738 9.646 4.15 10.325L3.6 12.4L5.75 11.838C6.4 12.235 7.17 12.5 8 12.5C10.485 12.5 12.5 10.485 12.5 8C12.5 5.515 10.485 3.5 8 3.5ZM6.5 6.2C6.6 6.2 6.7 6.2 6.8 6.4C6.9 6.6 7.2 7.3 7.2 7.4C7.25 7.5 7.25 7.6 7.2 7.7C7.15 7.8 7.1 7.85 7 7.95C6.9 8.05 6.85 8.12 6.75 8.22C6.65 8.32 6.55 8.42 6.67 8.62C6.8 8.82 7.25 9.55 7.9 10.12C8.75 10.87 9.45 11.1 9.65 11.2C9.85 11.3 9.95 11.28 10.05 11.16C10.15 11.04 10.5 10.6 10.6 10.4C10.7 10.2 10.8 10.25 10.95 10.3C11.1 10.35 12 10.8 12 10.8"
            stroke="white"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Instagram Icon */}
        <g transform="translate(45, 30)">
          <rect width="16" height="16" rx="4.5" fill="url(#wsInstaGrad)" />
          <rect x="4" y="4" width="8" height="8" rx="2.5" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="8" cy="8" r="2.2" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="10.4" cy="5.6" r="0.6" fill="white" />
        </g>

        {/* Facebook Icon */}
        <g transform="translate(66, 30)">
          <rect width="16" height="16" rx="4.5" fill="#1877F2" />
          <path
            d="M9.8 14V9.2H11.4L11.6 7.3H9.8V6.1C9.8 5.55 10 5.2 10.8 5.2H11.7V3.5C11.5 3.47 10.9 3.4 10.2 3.4C8.7 3.4 7.65 4.3 7.65 6V7.3H6V9.2H7.65V14H9.8Z"
            fill="white"
          />
        </g>

        {/* Row 2 Social Icons: LinkedIn (#0A66C2), X (#000000 / White in Dark) */}
        {/* LinkedIn Icon */}
        <g transform="translate(24, 52)">
          <rect width="16" height="16" rx="4.5" fill="#0A66C2" />
          <path
            d="M5 6.2C5.5 6.2 5.9 5.8 5.9 5.3C5.9 4.8 5.5 4.4 5 4.4C4.5 4.4 4.1 4.8 4.1 5.3C4.1 5.8 4.5 6.2 5 6.2ZM4.2 12H5.8V7.2H4.2V12ZM9.8 7.1C8.8 7.1 8.3 7.6 8 8V7.2H6.5V12H8.1V9.4C8.1 8.7 8.3 8 9.2 8C10.1 8 10.2 8.7 10.2 9.4V12H11.8V9.1C11.8 7.7 11.5 7.1 9.8 7.1Z"
            fill="white"
          />
        </g>

        {/* X Icon */}
        <g transform="translate(45, 52)">
          <rect width="16" height="16" rx="4.5" className="fill-black dark:fill-[#0F172A]" />
          <path
            d="M11.5 4.2H12.9L9.8 7.7L13.5 12.6H10.6L8.4 9.6L5.7 12.6H4.3L7.6 8.8L4 4.2H7L9 6.8L11.5 4.2ZM11 11.8H11.8L6.5 5H5.7L11 11.8Z"
            fill="white"
          />
        </g>

        {/* Clock Dial Badge (Lower-Right) with Pink/Purple/Cyan Ring */}
        <g transform="translate(66, 66)">
          <circle cx="20" cy="20" r="19" fill="url(#wsClockRing)" filter="url(#wsLogoShadow)" />
          <circle cx="20" cy="20" r="14.5" className="fill-white dark:fill-[#0F172A]" />
          {/* Clock Hands in Cyan/Blue */}
          <line x1="20" y1="20" x2="20" y2="12" stroke="#1877F2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="20" x2="26" y2="20" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="1.8" fill="#9333EA" />
        </g>
      </svg>
    );
  };

  // 1. Symbol Only
  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderSymbol(size)}
      </div>
    );
  }

  // 2. App Icon View (Light/Dark Container Tile)
  if (variant === 'app-icon') {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-3xl p-2 flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] ${
          inverted
            ? 'bg-[#1F2937] border border-[#374151]'
            : 'bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151]'
        } ${className}`}
      >
        {renderSymbol(size * 0.85)}
      </div>
    );
  }

  // 3. Stacked Presentation
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 select-none ${className}`}>
        {renderSymbol(size)}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#1F2937] dark:text-white">Whats</span>
            <span className="bg-gradient-to-r from-[#1877F2] via-[#E4405F] to-[#9333EA] bg-clip-text text-transparent font-extrabold">
              Schedule
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Horizontal Presentation (Default Brand Header)
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {renderSymbol(size)}
      <div className="flex flex-col min-w-0">
        <div className="text-lg font-bold tracking-tight leading-none flex items-center">
          <span className="text-[#1F2937] dark:text-white">Whats</span>
          <span className="bg-gradient-to-r from-[#1877F2] via-[#E4405F] to-[#9333EA] bg-clip-text text-transparent font-extrabold ml-0.5">
            Schedule
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-wider uppercase truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
