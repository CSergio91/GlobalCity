import React from 'react';

// Platform Brand Logos (SVG)
export const PlatformLogo: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  switch (name.toLowerCase()) {
    case 'binance':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#181A20" />
          <path d="M16 6.5L20.5 11L18.25 13.25L16 11L13.75 13.25L11.5 11L16 6.5Z" fill="#F0B90B" />
          <path d="M10 12.5L12.25 14.75L10 17L7.75 14.75L10 12.5Z" fill="#F0B90B" />
          <path d="M22 12.5L24.25 14.75L22 17L19.75 14.75L22 12.5Z" fill="#F0B90B" />
          <path d="M16 13.25L18.75 16L16 18.75L13.25 16L16 13.25Z" fill="#F0B90B" />
          <path d="M16 21L18.25 18.75L20.5 21L16 25.5L11.5 21L13.75 18.75L16 21Z" fill="#F0B90B" />
        </svg>
      );
    case 'bybit':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#121214" />
          <path d="M8 8H14.5C17 8 18.5 9.5 18.5 11.5C18.5 12.8 17.8 13.8 16.7 14.3C18.2 14.8 19.2 16 19.2 17.8C19.2 20.2 17.2 22 14.5 22H8V8ZM11.5 10.5V13.8H14C15.2 13.8 16 13 16 12.1C16 11.2 15.2 10.5 14 10.5H11.5ZM11.5 16.2V19.5H14.2C15.5 19.5 16.5 18.6 16.5 17.8C16.5 17 15.5 16.2 14.2 16.2H11.5Z" fill="#FFFFFF" />
          <path d="M20.5 8H24V14.5H20.5V8Z" fill="#F7A600" />
          <path d="M20.5 15.5H24V22H20.5V15.5Z" fill="#F7A600" />
        </svg>
      );
    case 'okx':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#000000" />
          <rect x="7" y="7" width="7" height="7" fill="#FFFFFF" />
          <rect x="18" y="7" width="7" height="7" fill="#FFFFFF" />
          <rect x="12.5" y="12.5" width="7" height="7" fill="#FFFFFF" />
          <rect x="7" y="18" width="7" height="7" fill="#FFFFFF" />
          <rect x="18" y="18" width="7" height="7" fill="#FFFFFF" />
        </svg>
      );
    case 'coinbase':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0052FF" />
          <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
          <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF" />
        </svg>
      );
    case 'ctrader':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#151922" />
          <path d="M16 6L25 21H20.5L16 13.5L11.5 21H7L16 6Z" fill="#00B060" />
          <path d="M16 18L19 23H13L16 18Z" fill="#00E575" />
        </svg>
      );
    case 'metatrader 5':
    case 'mt5':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0E1E2E" />
          <circle cx="16" cy="11" r="4" fill="#E65100" />
          <circle cx="11" cy="20" r="4" fill="#0288D1" />
          <circle cx="21" cy="20" r="4" fill="#2E7D32" />
          <path d="M16 11L11 20M16 11L21 20M11 20H21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'hyperliquid':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0A1E1E" />
          <path d="M10 8V24M22 8V24M10 16H22" stroke="#52F1B0" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <div className={`${className} rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-white`}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      );
  }
};

// Asset Currency & Token Badges (SVG)
export const AssetBadge: React.FC<{ symbol: string; className?: string }> = ({ symbol, className = "w-7 h-7" }) => {
  const cleanSymbol = symbol.split('/')[0].split(' ')[0].toUpperCase();

  switch (cleanSymbol) {
    case 'BTC':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path d="M21.5 13.8C21.9 12.2 20.8 11.2 19 10.7L19.6 8.3L18.1 7.9L17.5 10.3C17.1 10.2 16.7 10.1 16.3 10L16.9 7.6L15.4 7.2L14.8 9.6C14.5 9.5 14.1 9.4 13.8 9.4L13.8 9.3L11.7 8.8L11.3 10.4C11.3 10.4 12.4 10.7 12.4 10.7C13 10.8 13.1 11.2 13 11.6L11.5 17.6C11.5 17.8 11.3 18 10.9 17.9C10.9 17.9 9.8 17.6 9.8 17.6L9.1 19.3L11.1 19.8C11.5 19.9 11.8 20 12.2 20.1L11.6 22.5L13.1 22.9L13.7 20.5C14.1 20.6 14.5 20.7 14.9 20.8L14.3 23.2L15.8 23.6L16.4 21.2C19 21.7 21 21.4 21.7 19.2C22.3 17.5 21.7 16.4 20.5 15.7C21.4 15.4 22 14.6 21.5 13.8ZM18.9 18.2C18.4 20.2 15 19.1 14 18.8L14.7 16C15.7 16.3 19.4 16.2 18.9 18.2ZM19.4 13.6C19 15.3 16.2 14.4 15.4 14.2L16 11.8C16.8 12 19.8 11.8 19.4 13.6Z" fill="#FFFFFF" />
        </svg>
      );
    case 'ETH':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16 5L15.8 5.7V20.2L16 20.4L22.6 16.5L16 5Z" fill="#FFFFFF" fillOpacity="0.6" />
          <path d="M16 5L9.4 16.5L16 20.4V5Z" fill="#FFFFFF" />
          <path d="M16 21.6L15.9 21.8V26.8L16 27L22.6 17.7L16 21.6Z" fill="#FFFFFF" fillOpacity="0.6" />
          <path d="M16 27V21.6L9.4 17.7L16 27Z" fill="#FFFFFF" />
          <path d="M16 20.4L22.6 16.5L16 13.6V20.4Z" fill="#FFFFFF" fillOpacity="0.2" />
          <path d="M9.4 16.5L16 20.4V13.6L9.4 16.5Z" fill="#FFFFFF" fillOpacity="0.6" />
        </svg>
      );
    case 'SOL':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <path d="M8 21.8C8.2 21.6 8.5 21.5 8.7 21.5H22.5C22.8 21.5 23.2 21.7 23.4 22L24 22.7C24.1 22.9 24 23.2 23.8 23.4C23.6 23.6 23.3 23.7 23.1 23.7H9.3C9 23.7 8.6 23.5 8.4 23.2L7.8 22.5C7.7 22.3 7.8 22 8 21.8Z" fill="url(#sol_g1)" />
          <path d="M8 15.3C8.2 15.5 8.5 15.6 8.7 15.6H22.5C22.8 15.6 23.2 15.4 23.4 15.1L24 14.4C24.1 14.2 24 13.9 23.8 13.7C23.6 13.5 23.3 13.4 23.1 13.4H9.3C9 13.4 8.6 13.6 8.4 13.9L7.8 14.6C7.7 14.8 7.8 15.1 8 15.3Z" fill="url(#sol_g2)" />
          <path d="M8 8.8C8.2 8.6 8.5 8.5 8.7 8.5H22.5C22.8 8.5 23.2 8.7 23.4 9L24 9.7C24.1 9.9 24 10.2 23.8 10.4C23.6 10.6 23.3 10.7 23.1 10.7H9.3C9 10.7 8.6 10.5 8.4 10.2L7.8 9.5C7.7 9.3 7.8 9 8 8.8Z" fill="url(#sol_g3)" />
          <defs>
            <linearGradient id="sol_g1" x1="8" y1="22.6" x2="24" y2="22.6" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3" />
              <stop offset="1" stopColor="#DC1FFF" />
            </linearGradient>
            <linearGradient id="sol_g2" x1="24" y1="14.5" x2="8" y2="14.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3" />
              <stop offset="1" stopColor="#DC1FFF" />
            </linearGradient>
            <linearGradient id="sol_g3" x1="8" y1="9.6" x2="24" y2="9.6" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3" />
              <stop offset="1" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'BNB':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path d="M16 8L19.5 11.5L17.7 13.3L16 11.6L14.3 13.3L12.5 11.5L16 8Z" fill="#FFFFFF" />
          <path d="M11.5 12.5L13.3 14.3L11.5 16.1L9.7 14.3L11.5 12.5Z" fill="#FFFFFF" />
          <path d="M20.5 12.5L22.3 14.3L20.5 16.1L18.7 14.3L20.5 12.5Z" fill="#FFFFFF" />
          <path d="M16 13.7L18.3 16L16 18.3L13.7 16L16 13.7Z" fill="#FFFFFF" />
          <path d="M16 19.8L17.7 18.1L19.5 19.9L16 23.4L12.5 19.9L14.3 18.1L16 19.8Z" fill="#FFFFFF" />
        </svg>
      );
    case 'EUR':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#003399" />
          <path d="M21 12.5C20.2 11.2 18.7 10.5 17 10.5C14 10.5 11.8 12.7 11.5 15H16V16.2H11.3C11.3 16.6 11.3 17.1 11.3 17.5H16V18.7H11.5C11.8 21 14 23.2 17 23.2C18.7 23.2 20.2 22.5 21 21.2L22.2 22.1C21 23.8 19.1 24.8 17 24.8C12.8 24.8 9.8 21.8 9.5 18.7H8V17.5H9.5C9.5 17.1 9.5 16.6 9.5 16.2H8V15H9.5C9.8 11.9 12.8 8.9 17 8.9C19.1 8.9 21 9.9 22.2 11.6L21 12.5Z" fill="#FFCC00" />
        </svg>
      );
    case 'GBP':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#C8102E" />
          <path d="M19.5 11.5C19.5 10 18.2 9 16.5 9C14.8 9 13.5 10.2 13.5 12C13.5 15.5 19 16.5 19 20C19 22.2 17.2 23.5 15 23.5C13 23.5 11.5 22.5 10.5 21L11.8 19.8C12.5 21 13.6 21.8 15 21.8C16.2 21.8 17.2 21 17.2 20C17.2 17 11.8 15.8 11.8 12C11.8 9.2 13.8 7.5 16.5 7.5C19.2 7.5 21.2 9.2 21.2 11.5H19.5ZM10 16H18V17.5H10V16Z" fill="#FFFFFF" />
        </svg>
      );
    case 'XAU':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#D4AF37" />
          <path d="M11 13L16 8L21 13L16 18L11 13Z" fill="#FFF5C0" />
          <path d="M16 18L21 13L19 23L16 25L13 23L11 13L16 18Z" fill="#AA820A" />
        </svg>
      );
    case 'ES1!':
    case 'NQ1!':
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#1E293B" />
          <path d="M8 22L13 16L17 19L24 10" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 10H24V15" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <div className={`${className} rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-white border border-white/10`}>
          {cleanSymbol.slice(0, 3)}
        </div>
      );
  }
};
