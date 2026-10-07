import React from 'react';
import { 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLiveMarketTicks, MarketAssetTick } from '../services/liveMarketFeed';
import { ScrollReveal } from './common/ScrollReveal';

interface AssetConfig {
  sym: string;
  name: string;
  badge: string;
  color: string;
  fallbackPrice: number;
  fallbackChange: number;
  volume24h: string;
}

export const MarketsSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { ticks } = useLiveMarketTicks();

  // Curated assets distributed across 4 background marquee rows (compact uniform size, BTC standard size)
  const row1Assets: AssetConfig[] = [
    { sym: 'BTC/USDT', name: 'Bitcoin', badge: '₿', color: '#f59e0b', fallbackPrice: 84310.20, fallbackChange: 3.82, volume24h: '$28.4B' },
    { sym: 'ETH/USDT', name: 'Ethereum', badge: 'Ξ', color: '#8b5cf6', fallbackPrice: 2728.50, fallbackChange: 2.15, volume24h: '$12.1B' },
    { sym: 'SOL/USDT', name: 'Solana', badge: '◎', color: '#14f195', fallbackPrice: 186.40, fallbackChange: 7.24, volume24h: '$4.8B' },
    { sym: 'BNB/USDT', name: 'BNB Chain', badge: 'BNB', color: '#eab308', fallbackPrice: 642.80, fallbackChange: 1.45, volume24h: '$1.9B' },
    { sym: 'XRP/USDT', name: 'Ripple', badge: '✕', color: '#38bdf8', fallbackPrice: 2.18, fallbackChange: 4.12, volume24h: '$3.5B' },
    { sym: 'DOGE/USDT', name: 'Dogecoin', badge: 'Ð', color: '#f59e0b', fallbackPrice: 0.245, fallbackChange: 6.85, volume24h: '$2.7B' }
  ];

  const row2Assets: AssetConfig[] = [
    { sym: 'ADA/USDT', name: 'Cardano', badge: '₳', color: '#60a5fa', fallbackPrice: 0.784, fallbackChange: -1.82, volume24h: '$850M' },
    { sym: 'AVAX/USDT', name: 'Avalanche', badge: '▲', color: '#f43f5e', fallbackPrice: 34.20, fallbackChange: -2.10, volume24h: '$620M' },
    { sym: 'LINK/USDT', name: 'Chainlink', badge: '⬡', color: '#3b82f6', fallbackPrice: 18.90, fallbackChange: 5.45, volume24h: '$480M' },
    { sym: 'SUI/USDT', name: 'Sui Network', badge: '💧', color: '#06b6d4', fallbackPrice: 3.25, fallbackChange: -1.35, volume24h: '$740M' },
    { sym: 'PEPE/USDT', name: 'Pepe', badge: '🐸', color: '#10b981', fallbackPrice: 0.0000104, fallbackChange: 12.80, volume24h: '$1.1B' },
    { sym: 'NEAR/USDT', name: 'NEAR Protocol', badge: 'Ⓝ', color: '#10b981', fallbackPrice: 4.85, fallbackChange: 4.60, volume24h: '$390M' }
  ];

  const row3Assets: AssetConfig[] = [
    { sym: 'DOT/USDT', name: 'Polkadot', badge: '●', color: '#ec4899', fallbackPrice: 6.20, fallbackChange: -2.45, volume24h: '$310M' },
    { sym: 'SHIB/USDT', name: 'Shiba Inu', badge: 'SHIB', color: '#f97316', fallbackPrice: 0.0000215, fallbackChange: 3.20, volume24h: '$480M' },
    { sym: 'ARB/USDT', name: 'Arbitrum', badge: 'ARB', color: '#38bdf8', fallbackPrice: 0.72, fallbackChange: -3.15, volume24h: '$290M' },
    { sym: 'OP/USDT', name: 'Optimism', badge: 'OP', color: '#ef4444', fallbackPrice: 1.45, fallbackChange: -1.40, volume24h: '$220M' },
    { sym: 'TIA/USDT', name: 'Celestia', badge: 'TIA', color: '#a855f7', fallbackPrice: 5.80, fallbackChange: 2.90, volume24h: '$180M' },
    { sym: 'RENDER/USDT', name: 'Render', badge: 'RNDR', color: '#f43f5e', fallbackPrice: 6.10, fallbackChange: 5.15, volume24h: '$260M' }
  ];

  const row4Assets: AssetConfig[] = [
    { sym: 'INJ/USDT', name: 'Injective', badge: 'INJ', color: '#06b6d4', fallbackPrice: 21.40, fallbackChange: 4.30, volume24h: '$310M' },
    { sym: 'APT/USDT', name: 'Aptos', badge: 'APT', color: '#2dd4bf', fallbackPrice: 8.90, fallbackChange: -2.05, volume24h: '$240M' },
    { sym: 'SOL/USDT', name: 'Solana', badge: '◎', color: '#14f195', fallbackPrice: 186.40, fallbackChange: 7.24, volume24h: '$4.8B' },
    { sym: 'BTC/USDT', name: 'Bitcoin', badge: '₿', color: '#f59e0b', fallbackPrice: 84310.20, fallbackChange: 3.82, volume24h: '$28.4B' },
    { sym: 'ETH/USDT', name: 'Ethereum', badge: 'Ξ', color: '#8b5cf6', fallbackPrice: 2728.50, fallbackChange: 2.15, volume24h: '$12.1B' },
    { sym: 'AVAX/USDT', name: 'Avalanche', badge: '▲', color: '#f43f5e', fallbackPrice: 34.20, fallbackChange: -2.10, volume24h: '$620M' }
  ];

  const getTick = (config: AssetConfig): MarketAssetTick => {
    const live = ticks.find(t => t.symbol === config.sym);
    if (live) return live;

    return {
      symbol: config.sym,
      name: config.name,
      price: config.fallbackPrice,
      change24h: config.fallbackChange,
      volume24h: config.volume24h,
      category: 'crypto',
      venues: 'Binance · Bybit'
    };
  };

  const handleScrollToPrograms = () => {
    const el = document.getElementById('programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render a single sleek asset card in the moving background wall with square edges
  const renderAssetCard = (item: AssetConfig, key: string | number) => {
    const data = getTick(item);
    const isPositive = data.change24h >= 0;

    return (
      <div
        key={key}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`w-48 sm:w-56 shrink-0 p-3 sm:p-3.5 rounded-sm border backdrop-blur-md transition-all duration-200 select-none cursor-default group hover:scale-[1.03] hover:z-30 hover:brightness-125 ${
          isPositive
            ? 'bg-gradient-to-b from-emerald-950/30 via-[#070A10]/95 to-[#040609] border-emerald-500/30 hover:border-emerald-400/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-b from-rose-950/30 via-[#070A10]/95 to-[#040609] border-rose-500/30 hover:border-rose-400/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
        }`}
      >
        {/* Top: Badge + Symbol + 24h Change Pill */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span 
              className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded-none border border-white/10 bg-white/5"
              style={{ color: item.color }}
            >
              {item.badge}
            </span>
            <span className="font-mono font-bold text-xs text-slate-200 group-hover:text-white transition-colors">
              {item.sym.split('/')[0]}
            </span>
          </div>

          <span className={`font-mono font-bold text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-none border ${
            isPositive 
              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' 
              : 'text-rose-400 bg-rose-500/15 border-rose-500/30'
          }`}>
            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" /> : <ArrowDownRight className="w-2.5 h-2.5 stroke-[2.5]" />}
            <span>{isPositive ? '+' : ''}{data.change24h.toFixed(2)}%</span>
          </span>
        </div>

        {/* Center: Live Price */}
        <div className="my-1">
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
            {data.name}
          </div>
          <div className={`font-mono font-black text-base sm:text-lg tracking-tight transition-colors ${
            isPositive ? 'text-emerald-200 group-hover:text-emerald-300' : 'text-rose-200 group-hover:text-rose-300'
          }`}>
            ${data.price < 0.01 
              ? data.price.toFixed(6) 
              : data.price < 1 
                ? data.price.toFixed(4) 
                : data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Bottom Row: Volume + Leverage */}
        <div className="pt-1.5 mt-1 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-slate-400">
          <span>Vol <strong className="text-slate-300 font-semibold">{data.volume24h}</strong></span>
          <span className={`font-semibold px-1 py-0.2 rounded-none border text-[8px] ${
            isPositive 
              ? 'text-emerald-400/90 border-emerald-500/25 bg-emerald-500/10' 
              : 'text-rose-400/90 border-rose-500/25 bg-rose-500/10'
          }`}>
            100x
          </span>
        </div>
      </div>
    );
  };

  return (
    <section 
      id="markets"
      className="relative min-h-screen h-screen max-h-screen w-full flex flex-col justify-center items-center overflow-hidden select-none bg-[#05070B]"
    >
      {/* 1. SEAMLESS MOVING ASSETS BACKGROUND WALL (Dense Tighter Grid, Continuous Non-Stopping Marquee) */}
      <div className="absolute inset-0 z-0 w-full h-full flex flex-col justify-center gap-1.5 sm:gap-2 py-1 overflow-hidden pointer-events-none">
        
        {/* Row 1: Flowing Left */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee-left flex gap-1.5 sm:gap-2 py-0.5">
            {row1Assets.map((item, idx) => renderAssetCard(item, `r1-a-${idx}`))}
            {row1Assets.map((item, idx) => renderAssetCard(item, `r1-b-${idx}`))}
          </div>
        </div>

        {/* Row 2: Flowing Right */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee-right flex gap-1.5 sm:gap-2 py-0.5">
            {row2Assets.map((item, idx) => renderAssetCard(item, `r2-a-${idx}`))}
            {row2Assets.map((item, idx) => renderAssetCard(item, `r2-b-${idx}`))}
          </div>
        </div>

        {/* Row 3: Flowing Left */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee-left flex gap-1.5 sm:gap-2 py-0.5">
            {row3Assets.map((item, idx) => renderAssetCard(item, `r3-a-${idx}`))}
            {row3Assets.map((item, idx) => renderAssetCard(item, `r3-b-${idx}`))}
          </div>
        </div>

        {/* Row 4: Flowing Right */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee-right flex gap-1.5 sm:gap-2 py-0.5">
            {row4Assets.map((item, idx) => renderAssetCard(item, `r4-a-${idx}`))}
            {row4Assets.map((item, idx) => renderAssetCard(item, `r4-b-${idx}`))}
          </div>
        </div>

      </div>

      {/* 2. CINEMATIC VIGNETTE OVERLAY (Guarantees foreground text readability while leaving background cards glowing & visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070B] via-transparent to-[#05070B] pointer-events-none z-10 opacity-85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,11,0.85)_0%,rgba(5,7,11,0.50)_55%,rgba(5,7,11,0.92)_100%)] pointer-events-none z-10" />

      {/* Edge Fades for Smooth Side Transitions */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#05070B] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#05070B] to-transparent z-10" />

      {/* 3. FOREGROUND HERO FLOATING CONTENT */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8 pointer-events-none">
        
        <ScrollReveal animation="fade-up">
          <div className="space-y-4 sm:space-y-6 flex flex-col items-center">
            
            {/* Minimalist Floating Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-md font-mono text-[11px] font-bold text-amber-300 uppercase tracking-widest shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isEn ? 'CRYPTO DERIVATIVES · 24/7 LIVE FEED' : 'FUTUROS CRIPTO · DATOS EN VIVO 24/7'}</span>
            </div>

            {/* Giant Hero Headline with Gradient */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-[0_6px_35px_rgba(0,0,0,0.95)]">
              <span className="block">
                {isEn ? 'Trade the market that' : 'Opera el mercado que'}
              </span>
              <span className="inline-block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                {isEn ? 'never sleeps.' : 'nunca duerme.'}
              </span>
            </h2>

            {/* Floating Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200/90 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]">
              {isEn 
                ? 'High-liquidity cryptocurrency futures streaming in real time. Direct execution on corporate order books with zero artificial spreads.' 
                : 'Futuros cripto de alta liquidez transmitiendo en tiempo real. Ejecución directa en libros de órdenes institucionales sin spreads artificiales.'}
            </p>

            {/* Single Centered Action Button */}
            <div className="pt-2 sm:pt-4 pointer-events-auto">
              <button
                onClick={handleScrollToPrograms}
                className="px-10 sm:px-14 py-4 sm:py-5 text-xs sm:text-sm font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl border border-amber-200/80 shadow-[0_0_35px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] hover:scale-[1.02] group"
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:scale-125 transition-transform" />
                <span>{isEn ? 'Get Funded On Crypto' : 'Comenzar a Operar Cripto'}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950/80 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

          </div>
        </ScrollReveal>

      </div>

    </section>
  );
};
