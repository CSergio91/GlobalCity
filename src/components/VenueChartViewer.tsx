import React, { useState } from 'react';
import { 
  BarChart2, 
  X, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  TrendingUp, 
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface VenueChartViewerProps {
  venueId: string;
  venueName: string;
  venueColor?: string;
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
  onClose: () => void;
  livePrice?: number;
}

const POPULAR_PAIRS = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'XRP/USDT',
  'DOGE/USDT',
  'ADA/USDT',
  'AVAX/USDT',
  'LINK/USDT',
  'SUI/USDT'
];

export const VenueChartViewer: React.FC<VenueChartViewerProps> = ({
  venueId,
  venueName,
  venueColor = '#38BDF8',
  selectedSymbol,
  onSymbolChange,
  onClose,
  livePrice
}) => {
  const [currentPair, setCurrentPair] = useState(selectedSymbol || 'BTC/USDT');
  const [interval, setInterval] = useState('15');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePairSelect = (pair: string) => {
    setCurrentPair(pair);
    if (onSymbolChange) {
      onSymbolChange(pair);
    }
  };

  // Build TradingView format symbol
  const cleanSymbol = currentPair.replace('/', '');
  let tvPrefix = 'KUCOIN';
  if (venueId === 'binance') tvPrefix = 'BINANCE';
  else if (venueId === 'bybit') tvPrefix = 'BYBIT';
  else if (venueId === 'okx') tvPrefix = 'OKX';
  else if (venueId === 'gateio') tvPrefix = 'GATEIO';
  else if (venueId === 'coinbase') tvPrefix = 'COINBASE';
  else if (venueId === 'kraken') tvPrefix = 'KRAKEN';

  const tvSymbol = `${tvPrefix}:${cleanSymbol}`;

  const tvWidgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${venueId}&symbol=${encodeURIComponent(tvSymbol)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0D0F17&theme=dark&style=1&timezone=exchange&withdateranges=1&studies=[]&hide_side_toolbar=false&allow_symbol_change=1`;

  return (
    <div className={`rounded-2xl border border-white/15 bg-[#08090E]/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-4 z-50 flex flex-col' 
        : 'mt-3 mb-2 flex flex-col'
    }`}>
      {/* Chart Top Header & Controls */}
      <div className="p-3 sm:px-4 bg-[#0D0F17] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Venue Emblem & Current Pair */}
        <div className="flex items-center gap-3">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 border"
            style={{ 
              backgroundColor: venueColor + '25', 
              borderColor: venueColor + '50', 
              color: venueColor 
            }}
          >
            {venueName.substring(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Gráfico Oficial {venueName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#38BDF8] border border-white/10">
                {currentPair}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Feed Directo: <strong className="text-white">{tvSymbol}</strong></span>
              {livePrice && (
                <span className="text-emerald-400 font-mono font-bold">
                  ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Pair Switcher Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {POPULAR_PAIRS.map(pair => {
            const isActive = currentPair === pair;
            return (
              <button
                key={pair}
                type="button"
                onClick={() => handlePairSelect(pair)}
                className={`py-1 px-2.5 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-sky-500/20 text-white border-[#38BDF8]/60 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
                }`}
              >
                {pair.replace('/USDT', '')}
              </button>
            );
          })}
        </div>

        {/* Right: Timeframe & View Mode Controls */}
        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono">
            {['1', '5', '15', '60', '240', 'D'].map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setInterval(tf)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  interval === tf ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '60' ? '1h' : tf === '240' ? '4h' : tf === 'D' ? '1D' : `${tf}m`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
            title={isFullscreen ? "Minimizar" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 cursor-pointer transition-colors"
            title="Cerrar gráfico"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Chart Canvas */}
      <div className={`w-full bg-[#08090E] relative ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[440px]'}`}>
        <iframe
          key={`${tvSymbol}_${interval}`}
          src={tvWidgetUrl}
          className="w-full h-full border-0"
          title={`${venueName} ${currentPair} Chart`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
