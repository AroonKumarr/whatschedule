import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * 100% Original WhatsSchedule Brand Mark
 * Combines a sleek curved chat bubble with a minimalist scheduler clock dial.
 * Distinct from Meta/WhatsApp's phone handset logo to eliminate trademark risk.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brandGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00a884" />
          <stop offset="1" stopColor="#25D366" />
        </linearGradient>
      </defs>

      {/* Modern Curved Chat Bubble Background */}
      <path
        d="M24 4C12.954 4 4 12.954 4 24c0 3.79 1.054 7.336 2.88 10.368L4 44l9.888-2.825A19.86 19.86 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4z"
        fill="url(#brandGradient)"
      />

      {/* Clock Outer Ring (White/Translucent) */}
      <circle cx="24" cy="23" r="11" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.95" />

      {/* Clock Hands (Indicating 9:00 Schedule Time) */}
      <path
        d="M24 16v7h-6"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Clock Center Hub */}
      <circle cx="24" cy="23" r="1.75" fill="#ffffff" />
    </svg>
  );
};
