import React from 'react';

/**
 * 100% Original Scheduling Wallpaper
 * Features hand-drawn style vector scheduling icons:
 * Clock, Calendar, Paper Plane, Bell, Hourglass, Checkmark, Envelope.
 * Base color: #0B0F0D with ~5% opacity line-art pattern (400x400 tile).
 */
export const SchedulingWallpaper: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#0B0F0D] ${className}`}
      style={{
        backgroundColor: '#0B0F0D',
      }}
    >
      {/* SVG Background Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="wsSchedulingPattern"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            {/* 1. Clock (top-left) */}
            <g transform="translate(40, 40)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="20" cy="20" r="16" />
              <polyline points="20 10 20 20 26 23" />
            </g>

            {/* 2. Paper Plane (top-center) */}
            <g transform="translate(180, 30)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18 L24 4 L14 26 L10 18 Z" />
              <line x1="10" y1="18" x2="24" y2="4" />
            </g>

            {/* 3. Calendar (top-right) */}
            <g transform="translate(310, 50)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="26" height="22" rx="4" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="22" y1="2" x2="22" y2="6" />
              <line x1="2" y1="11" x2="28" y2="11" />
              <circle cx="9" cy="17" r="1.5" fill="#FFFFFF" fillOpacity="0.08" />
              <circle cx="15" cy="17" r="1.5" fill="#FFFFFF" fillOpacity="0.08" />
              <circle cx="21" cy="17" r="1.5" fill="#FFFFFF" fillOpacity="0.08" />
            </g>

            {/* 4. Hourglass (center-left) */}
            <g transform="translate(60, 160)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4 L23 4 M5 28 L23 28 M7 4 C7 14 21 16 21 28 M21 4 C21 14 7 16 7 28" />
              <circle cx="14" cy="22" r="1.5" fill="#FFFFFF" fillOpacity="0.08" />
            </g>

            {/* 5. Checkmark Badge (center) */}
            <g transform="translate(190, 150)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="16" cy="16" r="14" />
              <polyline points="10 16 14 20 22 11" />
            </g>

            {/* 6. Notification Bell (center-right) */}
            <g transform="translate(320, 170)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4 C9 4 6 8 6 15 L4 18 L24 18 L22 15 C22 8 19 4 14 4 Z" />
              <path d="M11 21 C11 23 12.5 24 14 24 C15.5 24 17 23 17 21" />
            </g>

            {/* 7. Envelope / Message (bottom-left) */}
            <g transform="translate(50, 290)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="28" height="20" rx="3" />
              <polyline points="3 6 16 16 29 6" />
            </g>

            {/* 8. Mini Clock with Speed Dashes (bottom-center) */}
            <g transform="translate(180, 290)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="14" cy="14" r="11" />
              <polyline points="14 7 14 14 18 16" />
              <line x1="26" y1="10" x2="31" y2="10" />
              <line x1="26" y1="14" x2="33" y2="14" />
              <line x1="26" y1="18" x2="29" y2="18" />
            </g>

            {/* 9. Calendar with Checkmark (bottom-right) */}
            <g transform="translate(310, 290)" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="6" width="24" height="20" rx="3" />
              <line x1="4" y1="12" x2="28" y2="12" />
              <polyline points="10 18 14 22 22 15" strokeWidth="1.8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wsSchedulingPattern)" />
      </svg>

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
};
