import React from 'react';

// Platform Brand Logos (SVG)
export const PlatformLogo: React.FC<{ name: string; className?: string; size?: number }> = ({ 
  name, 
  className = "w-5 h-5",
  size
}) => {
  const n = (name || '').toLowerCase().trim();
  const inlineStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  // 1. Binance
  if (n.includes('binance')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#181A20" />
        <path d="M16 6.5L20.5 11L18.25 13.25L16 11L13.75 13.25L11.5 11L16 6.5Z" fill="#F0B90B" />
        <path d="M10 12.5L12.25 14.75L10 17L7.75 14.75L10 12.5Z" fill="#F0B90B" />
        <path d="M22 12.5L24.25 14.75L22 17L19.75 14.75L22 12.5Z" fill="#F0B90B" />
        <path d="M16 13.25L18.75 16L16 18.75L13.25 16L16 13.25Z" fill="#F0B90B" />
        <path d="M16 21L18.25 18.75L20.5 21L16 25.5L11.5 21L13.75 18.75L16 21Z" fill="#F0B90B" />
      </svg>
    );
  }

  // 2. Bybit
  if (n.includes('bybit')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#121214" />
        <path d="M8 8H14.5C17 8 18.5 9.5 18.5 11.5C18.5 12.8 17.8 13.8 16.7 14.3C18.2 14.8 19.2 16 19.2 17.8C19.2 20.2 17.2 22 14.5 22H8V8ZM11.5 10.5V13.8H14C15.2 13.8 16 13 16 12.1C16 11.2 15.2 10.5 14 10.5H11.5ZM11.5 16.2V19.5H14.2C15.5 19.5 16.5 18.6 16.5 17.8C16.5 17 15.5 16.2 14.2 16.2H11.5Z" fill="#FFFFFF" />
        <path d="M20.5 8H24V14.5H20.5V8Z" fill="#F7A600" />
        <path d="M20.5 15.5H24V22H20.5V15.5Z" fill="#F7A600" />
      </svg>
    );
  }

  // 3. OKX
  if (n.includes('okx')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#000000" />
        <rect x="7" y="7" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="18" y="7" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="12.5" y="12.5" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="7" y="18" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="18" y="18" width="7" height="7" rx="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // 4. KuCoin
  if (n.includes('kucoin')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0E1E1C" />
        <path d="M10 8H14.5V14.5L19.5 8H24L17.5 15.5L24 24H19.5L14.5 17V24H10V8Z" fill="#24AE8F" />
      </svg>
    );
  }

  // 5. Bitget
  if (n.includes('bitget')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0D1F2D" />
        <path d="M9 16L15 10L17 12L13 16L17 20L15 22L9 16Z" fill="#00F0FF" />
        <path d="M23 16L17 10L15 12L19 16L15 20L17 22L23 16Z" fill="#0080FF" />
      </svg>
    );
  }

  // 6. Gate.io
  if (n.includes('gate.io') || n.includes('gateio') || n.includes('gate')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#151A2E" />
        <circle cx="16" cy="16" r="8" stroke="#2354E6" strokeWidth="2.5" />
        <path d="M16 12V20M12 16H20" stroke="#00D092" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. Deribit
  if (n.includes('deribit')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1A24" />
        <circle cx="16" cy="16" r="7" stroke="#00D09C" strokeWidth="2.5" />
        <path d="M16 11V16L19 19" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. MEXC
  if (n.includes('mexc')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0D1A38" />
        <path d="M8 22V10L12 15L16 10L20 15L24 10V22H21V15L18 19H14L11 15V22H8Z" fill="#2862FF" />
      </svg>
    );
  }

  // 9. HTX / Huobi
  if (n.includes('htx') || n.includes('huobi')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1C33" />
        <path d="M16 7C16 7 21 13 21 18C21 20.76 18.76 23 16 23C13.24 23 11 20.76 11 18C11 13 16 7 16 7Z" fill="#0066ED" />
        <circle cx="16" cy="17" r="3" fill="#00E5FF" />
      </svg>
    );
  }

  // 10. BingX
  if (n.includes('bingx')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0E1535" />
        <path d="M9 9L15 16L9 23H13L16 19.5L19 23H23L17 16L23 9H19L16 12.5L13 9H9Z" fill="#2354E6" />
      </svg>
    );
  }

  // 11. Phemex
  if (n.includes('phemex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1F1A0E" />
        <path d="M10 8H18C20.5 8 22 9.5 22 12C22 14.5 20.5 16 18 16H14V24H10V8ZM14 11.5V13H17.5C18.3 13 18.8 12.5 18.8 12C18.8 11.5 18.3 11.5 17.5 11.5H14Z" fill="#E5A93C" />
      </svg>
    );
  }

  // 12. BitMEX
  if (n.includes('bitmex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#141414" />
        <rect x="8" y="8" width="16" height="16" rx="3" fill="#ED1B24" />
        <path d="M11 20V12L13.5 16L16 12V20H14.5V15L13.5 17L12.5 15V20H11Z" fill="#FFFFFF" />
        <path d="M18 20V12H20.5C21.3 12 22 12.7 22 13.5C22 14.3 21.3 15 20.5 15H19.5V20H18Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 13. WOO X
  if (n.includes('woo')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1F18" />
        <circle cx="12" cy="16" r="4.5" stroke="#00E19B" strokeWidth="2.5" />
        <circle cx="20" cy="16" r="4.5" stroke="#00E19B" strokeWidth="2.5" />
      </svg>
    );
  }

  // 14. Bitfinex
  if (n.includes('bitfinex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0A1F16" />
        <path d="M10 23L22 9M10 9L15 16L10 23M22 23L17 16L22 9" stroke="#14C882" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 15. CoinEx
  if (n.includes('coinex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1E19" />
        <circle cx="16" cy="16" r="7" stroke="#00C988" strokeWidth="2" />
        <path d="M12 16L15 19L20 13" stroke="#00C988" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 16. LBank
  if (n.includes('lbank')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1F1A0B" />
        <path d="M11 9V22H21" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 17. AscendEX
  if (n.includes('ascendex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#220F0D" />
        <path d="M16 8L23 23H9L16 8Z" fill="#E9523C" />
        <path d="M16 14L19.5 21.5H12.5L16 14Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 18. Blofin
  if (n.includes('blofin')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B152A" />
        <path d="M10 8H17C19.5 8 21 9.5 21 11.5C21 12.8 20 14 19 14.5C20.5 15 21.5 16.5 21.5 18.5C21.5 21 19.5 23 17 23H10V8Z" fill="#0066FF" />
        <circle cx="15" cy="12" r="1.5" fill="#FFFFFF" />
        <circle cx="15.5" cy="18" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // 19. Zoomex
  if (n.includes('zoomex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1F16" />
        <path d="M9 10H23L13 22H23" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 20. Hyperliquid L1
  if (n.includes('hyperliquid')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0A1E1E" />
        <path d="M10 8V24M22 8V24M10 16H22" stroke="#52F1B0" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 21. dYdX Chain
  if (n.includes('dydx')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#14132B" />
        <path d="M10 9L15 16L10 23H13.5L16.5 18.5L19.5 23H23L18 16L23 9H19.5L16.5 13.5L13.5 9H10Z" fill="#6966FF" />
      </svg>
    );
  }

  // 22. Vertex Protocol
  if (n.includes('vertex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1A122E" />
        <path d="M9 10L16 23L23 10H19L16 17L13 10H9Z" fill="#8B5CF6" />
      </svg>
    );
  }

  // 23. Aevo
  if (n.includes('aevo')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#260B14" />
        <circle cx="16" cy="16" r="7" stroke="#E11D48" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="3" fill="#E11D48" />
      </svg>
    );
  }

  // 24. Paradex
  if (n.includes('paradex')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#081E24" />
        <circle cx="16" cy="16" r="7" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="16" cy="16" r="3" fill="#06B6D4" />
      </svg>
    );
  }

  // 25. ApeX Pro
  if (n.includes('apex') || n.includes('apexpro')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0C1833" />
        <path d="M16 8L23 22H18.5L16 16.5L13.5 22H9L16 8Z" fill="#3B82F6" />
      </svg>
    );
  }

  // 26. Drift Protocol
  if (n.includes('drift')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1D0E30" />
        <path d="M11 9H16C19.5 9 22 12 22 16C22 20 19.5 23 16 23H11V9ZM14 12V20H16C17.8 20 19 18.2 19 16C19 13.8 17.8 12 16 12H14Z" fill="#9333EA" />
      </svg>
    );
  }

  // 27. GMX
  if (n.includes('gmx')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0F1A36" />
        <circle cx="13" cy="14" r="4" fill="#2563EB" />
        <circle cx="19" cy="14" r="4" fill="#38BDF8" />
        <circle cx="16" cy="20" r="4" fill="#1D4ED8" />
      </svg>
    );
  }

  // 28. Coinbase
  if (n.includes('coinbase')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0052FF" />
        <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
        <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF" />
      </svg>
    );
  }

  // 29. Kraken
  if (n.includes('kraken')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#181335" />
        <path d="M11 9H21C22.6569 9 24 10.3431 24 12V18C24 20.2091 22.2091 22 20 22C18.8954 22 18 21.1046 18 20V14H14V20C14 21.1046 13.1046 22 12 22C9.79086 22 8 20.2091 8 18V12C8 10.3431 9.34315 9 11 9Z" fill="#5741D9" />
      </svg>
    );
  }

  // 30. Bitstamp
  if (n.includes('bitstamp')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0A1F13" />
        <rect x="9" y="10" width="4" height="12" rx="1.5" fill="#00A859" />
        <rect x="15" y="7" width="4" height="18" rx="1.5" fill="#00A859" />
        <rect x="21" y="13" width="4" height="9" rx="1.5" fill="#00A859" />
      </svg>
    );
  }

  // 31. Gemini
  if (n.includes('gemini')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#081E26" />
        <rect x="9" y="10" width="4" height="12" rx="2" fill="#00DCFA" />
        <rect x="19" y="10" width="4" height="12" rx="2" fill="#00DCFA" />
        <rect x="9" y="14.5" width="14" height="3" fill="#00DCFA" />
      </svg>
    );
  }

  // 32. WhiteBIT
  if (n.includes('whitebit')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#260E1D" />
        <path d="M9 11L13 22L16 14L19 22L23 11" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 33. Crypto.com
  if (n.includes('crypto.com') || n.includes('cryptocom')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#09152B" />
        <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="#002D74" strokeWidth="2" fill="#0D2459" />
        <circle cx="16" cy="16" r="3.5" fill="#38BDF8" />
      </svg>
    );
  }

  // 34. Upbit
  if (n.includes('upbit')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0B1833" />
        <path d="M11 9V17C11 19.8 13.2 22 16 22C18.8 22 21 19.8 21 17V9H18V17C18 18.1 17.1 19 16 19C14.9 19 14 18.1 14 17V9H11Z" fill="#093687" />
        <path d="M18 9H21V12H18V9Z" fill="#00E5FF" />
      </svg>
    );
  }

  // 35. Bithumb
  if (n.includes('bithumb')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#24140A" />
        <circle cx="16" cy="16" r="8" fill="#F37321" />
        <path d="M13 11H16C17.5 11 18.5 12 18.5 13.5C18.5 14.5 18 15.2 17 15.5C18.2 16 19 17 19 18.5C19 20 17.5 21 16 21H13V11Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 36. Bitso
  if (n.includes('bitso')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#091F16" />
        <circle cx="12" cy="16" r="3.5" fill="#00E885" />
        <circle cx="20" cy="16" r="3.5" fill="#00E885" />
      </svg>
    );
  }

  // 37. Mercado Bitcoin
  if (n.includes('mercadobitcoin') || n.includes('mercado bitcoin')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#241708" />
        <circle cx="16" cy="16" r="8" fill="#F7931A" />
        <path d="M13 12H16.5C17.8 12 18.8 12.8 18.8 14C18.8 14.8 18.2 15.5 17.5 15.8C18.5 16.2 19.2 17 19.2 18.2C19.2 19.5 18 20.5 16.5 20.5H13V12Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 38. Bitvavo
  if (n.includes('bitvavo')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0A1633" />
        <path d="M10 9H17C19.8 9 22 11.2 22 14C22 15.5 21.2 16.8 20 17.5C21.5 18.2 22.5 19.8 22.5 21.5C22.5 24.5 20 27 17 27H10V9ZM14 13V16H16.5C17.3 16 18 15.3 18 14.5C18 13.7 17.3 13 16.5 13H14Z" fill="#0062FF" />
      </svg>
    );
  }

  // 39. MetaTrader 5
  if (n.includes('metatrader 5') || n.includes('mt5') || n.includes('metatrader5')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0E1E2E" />
        <circle cx="16" cy="11" r="3.5" fill="#E65100" />
        <circle cx="11" cy="21" r="3.5" fill="#0288D1" />
        <circle cx="21" cy="21" r="3.5" fill="#2E7D32" />
        <path d="M16 11L11 21M16 11L21 21M11 21H21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 40. MetaTrader 4
  if (n.includes('metatrader 4') || n.includes('mt4') || n.includes('metatrader4')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1C180A" />
        <circle cx="16" cy="11" r="3.5" fill="#F59E0B" />
        <circle cx="11" cy="21" r="3.5" fill="#EAB308" />
        <circle cx="21" cy="21" r="3.5" fill="#D97706" />
        <path d="M16 11L11 21M16 11L21 21M11 21H21" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 41. cTrader
  if (n.includes('ctrader')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#151922" />
        <path d="M16 6L25 21H20.5L16 13.5L11.5 21H7L16 6Z" fill="#00B060" />
        <path d="M16 18L19 23H13L16 18Z" fill="#00E575" />
      </svg>
    );
  }

  // 42. QuickFIX DMA Gateway
  if (n.includes('quickfix') || n.includes('fix')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#13142E" />
        <circle cx="10" cy="16" r="3" fill="#6366F1" />
        <circle cx="22" cy="10" r="3" fill="#38BDF8" />
        <circle cx="22" cy="22" r="3" fill="#A855F7" />
        <path d="M10 16L22 10M10 16L22 22" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // 43. Interactive Brokers TWS
  if (n.includes('interactive') || n.includes('interactivebrokers') || n.includes('ib') || n.includes('tws')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#240B0B" />
        <path d="M16 6L24 10V22L16 26L8 22V10L16 6Z" fill="#D92D20" />
        <text x="16" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">IB</text>
      </svg>
    );
  }

  // 44. Pepperstone
  if (n.includes('pepperstone')) {
    return (
      <svg style={inlineStyle} className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#240B12" />
        <circle cx="16" cy="16" r="8" fill="#E11D48" />
        <path d="M13 10H17C18.5 10 19.5 11 19.5 12.5C19.5 14 18.5 15 17 15H15V22H13V10ZM15 12V13.5H17C17.3 13.5 17.5 13.2 17.5 12.8C17.5 12.4 17.3 12 17 12H15Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Default fallback for custom or unlisted tokens
  return (
    <div 
      style={inlineStyle} 
      className={`${className} rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/5`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
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
