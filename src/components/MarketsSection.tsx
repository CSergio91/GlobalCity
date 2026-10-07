import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLiveMarketTicks, MarketAssetTick } from '../services/liveMarketFeed';
import { useAppRouter } from '../context/RouterContext';
import { ScrollReveal } from './common/ScrollReveal';

export const MarketsSection: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const { ticks } = useLiveMarketTicks();

  // Curated list of 18 high-velocity crypto assets for the background mosaic
  const assetSymbols = [
    { sym: 'BTC/USDT', name: 'Bitcoin', colSpan: 'col-span-2 row-span-2', isHero: true, badge: '₿', color: '#f59e0b' },
    { sym: 'ETH/USDT', name: 'Ethereum', colSpan: 'col-span-2', isHero: true, badge: 'Ξ', color: '#8b5cf6' },
    { sym: 'SOL/USDT', name: 'Solana', colSpan: 'col-span-2', isHero: true, badge: '◎', color: '#14f195' },
    { sym: 'BNB/USDT', name: 'BNB Chain', colSpan: 'col-span-1', isHero: false, badge: 'BNB', color: '#eab308' },
    { sym: 'XRP/USDT', name: 'Ripple', colSpan: 'col-span-1', isHero: false, badge: '✕', color: '#38bdf8' },
    { sym: 'DOGE/USDT', name: 'Dogecoin', colSpan: 'col-span-1', isHero: false, badge: 'Ð', color: '#f59e0b' },
    { sym: 'SUI/USDT', name: 'Sui Network', colSpan: 'col-span-1', isHero: false, badge: '💧', color: '#06b6d4' },
    { sym: 'AVAX/USDT', name: 'Avalanche', colSpan: 'col-span-1', isHero: false, badge: '▲', color: '#f43f5e' },
    { sym: 'LINK/USDT', name: 'Chainlink', colSpan: 'col-span-1', isHero: false, badge: '⬡', color: '#3b82f6' },
    { sym: 'NEAR/USDT', name: 'NEAR Protocol', colSpan: 'col-span-1', isHero: false, badge: 'Ⓝ', color: '#10b981' },
    { sym: 'ADA/USDT', name: 'Cardano', colSpan: 'col-span-1', isHero: false, badge: '₳', color: '#60a5fa' },
    { sym: 'DOT/USDT', name: 'Polkadot', colSpan: 'col-span-1', isHero: false, badge: '●', color: '#ec4899' },
    { sym: 'PEPE/USDT', name: 'Pepe', colSpan: 'col-span-1', isHero: false, badge: '🐸', color: '#10b981' },
    { sym: 'SHIB/USDT', name: 'Shiba Inu', colSpan: 'col-span-1', isHero: false, badge: 'SHIB', color: '#f97316' },
    { sym: 'ARB/USDT', name: 'Arbitrum', colSpan: 'col-span-1', isHero: false, badge: 'ARB', color: '#38bdf8' },
    { sym: 'OP/USDT', name: 'Optimism', colSpan: 'col-span-1', isHero: false, badge: 'OP', color: '#ef4444' },
    { sym: 'TIA/USDT', name: 'Celestia', colSpan: 'col-span-1', isHero: false, badge: 'TIA', color: '#a855f7' },
    { sym: 'RENDER/USDT', name: 'Render', colSpan: 'col-span-1', isHero: false, badge: 'RNDR', color: '#f43f5e' },
  ];

  const getTick = (symbol: string): MarketAssetTick => {
    return ticks.find(t => t.symbol === symbol) || {
      symbol,
      name: symbol.split('/')[0],
      price: symbol.includes('BTC') ? 84310.2 : symbol.includes('ETH') ? 2728.5 : symbol.includes('SOL') ? 186.4 : 1.25,
      change24h: 3.42,
      volume24h: '$1.2B',
      category: 'crypto',
      venues: 'Binance · Bybit'
    };
  };

  const handleOpenTerminal = () => {
    navigate('/operations');
  };

  return (
    <section 
      id="markets"
      className="relative h-screen min-h-screen max-h-screen w-full flex flex-col justify-center items-center overflow-hidden select-none bg-[#05070B]"
    >
      {/* 1. SEAMLESS BACKGROUND CRYPTO HEATMAP MOSAIC (Full Screen Wall) */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        
        {/* Continuous Grid with subtle 1px dividers & Sharp corners */}
        <div className="w-full h-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 auto-rows-fr gap-px bg-white/[0.04]">
          {assetSymbols.map((item, idx) => {
            const data = getTick(item.sym);
            const isPositive = data.change24h >= 0;

            return (
              <div
                key={idx}
                onClick={handleOpenTerminal}
                className={`${item.colSpan} relative p-3 sm:p-4 lg:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out group overflow-hidden bg-[#06080F]/95 hover:bg-white/[0.06] hover:border-white/20 hover:z-20`}
              >
                {/* Subtle base mood tint */}
                <div 
                  className={`absolute inset-0 opacity-15 group-hover:opacity-40 transition-opacity pointer-events-none ${
                    isPositive 
                      ? 'bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent' 
                      : 'bg-gradient-to-br from-rose-500/[0.06] via-transparent to-transparent'
                  }`} 
                />

                {/* Top: Badge + Symbol + Change % */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-none border border-white/10 bg-white/5 group-hover:border-white/25 transition-colors"
                      style={{ color: item.color }}
                    >
                      {item.badge}
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-400 group-hover:text-white transition-colors">
                      {item.sym.split('/')[0]}
                    </span>
                  </div>

                  <span className={`font-mono font-bold text-[10px] sm:text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-none border transition-colors ${
                    isPositive 
                      ? 'text-emerald-400/90 bg-emerald-500/10 border-emerald-500/20 group-hover:text-emerald-300 group-hover:border-emerald-500/40' 
                      : 'text-rose-400/90 bg-rose-500/10 border-rose-500/20 group-hover:text-rose-300 group-hover:border-rose-500/40'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" /> : <ArrowDownRight className="w-2.5 h-2.5 stroke-[2.5]" />}
                    <span>{isPositive ? '+' : ''}{data.change24h.toFixed(2)}%</span>
                  </span>
                </div>

                {/* Center / Body: Live Price */}
                <div className="relative z-10 my-auto py-1">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
                    {data.name}
                  </div>
                  <div className={`font-mono font-black tracking-tight text-slate-300 group-hover:text-amber-200 transition-colors ${
                    item.isHero ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-sm sm:text-lg'
                  }`}>
                    ${data.price < 0.01 
                      ? data.price.toFixed(6) 
                      : data.price < 1 
                        ? data.price.toFixed(4) 
                        : data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Bottom Row: Volume + Leverage Tag */}
                <div className="relative z-10 pt-1.5 border-t border-white/5 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>Vol <strong className="text-slate-400 group-hover:text-white">{data.volume24h}</strong></span>
                  <span className="text-slate-400 font-semibold group-hover:text-amber-300 transition-colors">
                    {item.isHero ? '100x' : '50x'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Cinematic Vignette Overlay to ensure Hero text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070B] via-transparent to-[#05070B] pointer-events-none z-10 opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,11,0.72)_0%,rgba(5,7,11,0.35)_55%,rgba(5,7,11,0.85)_100%)] pointer-events-none z-10" />
      </div>

      {/* 2. FOREGROUND HERO-STYLE FLOATING CONTENT (No heavy solid box, pure typography) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8 pointer-events-none">
        
        <ScrollReveal animation="fade-up">
          <div className="space-y-4 sm:space-y-6 flex flex-col items-center">
            
            {/* Minimalist Floating Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md font-mono text-[11px] font-bold text-amber-300 uppercase tracking-widest shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isEn ? 'CRYPTO DERIVATIVES · 24/7 LIVE FEED' : 'FUTUROS CRIPTO · DATOS EN VIVO 24/7'}</span>
            </div>

            {/* Giant Hero Style Headline with Gradient */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              <span className="block">
                {isEn ? 'Trade the market that' : 'Opera el mercado que'}
              </span>
              <span className="inline-block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                {isEn ? 'never sleeps.' : 'nunca duerme.'}
              </span>
            </h2>

            {/* Floating Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300/90 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
              {isEn 
                ? 'High-liquidity cryptocurrency futures streaming in real time. Direct execution on our proprietary web terminal with zero slippage.' 
                : 'Futuros cripto de alta liquidez transmitiendo en tiempo real. Ejecución directa en nuestra terminal web sin deslizamientos.'}
            </p>

            {/* Single Centered Hero Action Button */}
            <div className="pt-2 sm:pt-4 pointer-events-auto">
              <button
                onClick={handleOpenTerminal}
                className="w-full sm:w-auto px-12 sm:px-16 py-4 sm:py-5 text-sm sm:text-base font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl border border-amber-200/60 shadow-[4px_4px_0px_#000000,0_0_40px_rgba(245,158,11,0.45)] flex items-center justify-center gap-3 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group hover:scale-[1.02]"
              >
                <Terminal className="w-5 h-5 text-slate-950" />
                <span>{isEn ? 'Open Web Terminal' : 'Abrir Terminal Web'}</span>
                <ChevronRight className="w-5 h-5 text-slate-950/80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </ScrollReveal>

      </div>

    </section>
  );
};

