import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'horizontal' | 'stacked' | 'favicon' | 'monochrome';
  showSubtitle?: boolean;
  subtitle?: string;
  inverted?: boolean; // For forced dark or light overrides
}

/**
 * WhatsSchedule Official Brand Logo
 * 
 * Faithfully implements the approved visual identity:
 * - Deep forest green conversation bubble silhouette (#0D3027) with emerald shading (#087F5B).
 * - Crisp white clock dial outline and hands indicating scheduled delivery.
 * - Center hub accent in mint emerald (#25C993).
 * - Three rounded mint speed/schedule lines on the lower-right perimeter (#25C993).
 * - Wordmark: "Whats" in deep green / primary text, "Schedule" in vibrant emerald (#087F5B / #25C993).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 36,
  variant = 'symbol',
  showSubtitle = false,
  subtitle = 'Message scheduling, made simple.',
  inverted = false,
}) => {
  // SVG Graphic Symbol
  const renderSymbol = (iconSize: number) => {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="WhatsSchedule Logo"
        className="shrink-0 transition-transform duration-150 hover:scale-[1.02]"
      >
        <defs>
          {/* Subtle gradient for deep forest green bubble with emerald sheen on top-right */}
          <linearGradient id="wsBubbleGrad" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0D3027" />
            <stop offset="45%" stopColor="#0B382D" />
            <stop offset="100%" stopColor="#087F5B" />
          </linearGradient>

          {/* Mint highlight for speed bars */}
          <linearGradient id="wsMintGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#25C993" />
            <stop offset="100%" stopColor="#3DD39C" />
          </linearGradient>

          <filter id="wsSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0D3027" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* 1. Main Conversation Bubble in Forest Green with smooth tail */}
        <path
          d="M50 10C27.909 10 10 27.909 10 50C10 57.8 12.2 65.1 16 71.3L11 89L29.4 84.2C35.5 87.8 42.5 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10Z"
          fill="url(#wsBubbleGrad)"
          filter="url(#wsSoftGlow)"
        />

        {/* 2. Inner White Circular Clock Dial */}
        <circle
          cx="50"
          cy="48"
          r="26"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 3. Clock Hands (Indicating scheduled dispatch) */}
        {/* Hour Hand pointing straight up to 12 */}
        <line
          x1="50"
          y1="48"
          x2="50"
          y2="31"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Minute Hand pointing down-right to ~4:20 */}
        <line
          x1="50"
          y1="48"
          x2="66"
          y2="59"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* 4. Center Hub Pivot (Mint Emerald Accent) */}
        <circle cx="50" cy="48" r="4.5" fill="#25C993" />

        {/* 5. Three Rounded Speed/Schedule Hash Lines on Lower-Right */}
        {/* Top speed line */}
        <rect
          x="67"
          y="58"
          width="18"
          height="4.5"
          rx="2.25"
          fill="url(#wsMintGrad)"
        />
        {/* Middle speed line */}
        <rect
          x="67"
          y="66"
          width="15"
          height="4.5"
          rx="2.25"
          fill="url(#wsMintGrad)"
        />
        {/* Bottom speed line */}
        <rect
          x="67"
          y="74"
          width="10"
          height="4.5"
          rx="2.25"
          fill="url(#wsMintGrad)"
        />
      </svg>
    );
  };

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderSymbol(size)}</div>;
  }

  if (variant === 'favicon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="32" height="32" rx="7" fill="#0D3027" />
        <circle cx="15" cy="15" r="9" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="15" y1="15" x2="15" y2="9" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="15" y1="15" x2="20" y2="19" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="15" cy="15" r="1.5" fill="#25C993" />
        <rect x="22" y="19" width="7" height="1.8" rx="0.9" fill="#25C993" />
        <rect x="22" y="22" width="5" height="1.8" rx="0.9" fill="#25C993" />
      </svg>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {renderSymbol(size)}
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight leading-none">
            <span
              className={`text-xl sm:text-2xl font-bold ${
                inverted
                  ? 'text-[#F2F7F4]'
                  : 'text-[#0D3027] dark:text-[#F2F7F4]'
              }`}
            >
              Whats
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold ${
                inverted
                  ? 'text-[#25C993]'
                  : 'text-[#087F5B] dark:text-[#25C993]'
              }`}
            >
              Schedule
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`text-xs mt-1 font-normal ${
                inverted
                  ? 'text-[#B2C1B8]'
                  : 'text-[#5D7168] dark:text-[#8A9A91]'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {renderSymbol(size)}
        <div className="mt-3">
          <div className="flex items-center justify-center tracking-tight leading-none">
            <span
              className={`text-2xl font-bold ${
                inverted
                  ? 'text-[#F2F7F4]'
                  : 'text-[#0D3027] dark:text-[#F2F7F4]'
              }`}
            >
              Whats
            </span>
            <span
              className={`text-2xl font-bold ${
                inverted
                  ? 'text-[#25C993]'
                  : 'text-[#087F5B] dark:text-[#25C993]'
              }`}
            >
              Schedule
            </span>
          </div>
          {showSubtitle && (
            <p
              className={`text-xs mt-1 font-normal ${
                inverted
                  ? 'text-[#B2C1B8]'
                  : 'text-[#5D7168] dark:text-[#8A9A91]'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return renderSymbol(size);
};
