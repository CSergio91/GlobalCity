import React, { useState } from 'react';
import { 
  MULTI_ASSET_MARKET_TICKS, 
  INITIAL_CONNECTED_ACCOUNTS,
} from '../data/mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

export const MultiVenueHub: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>("Bybit");

  const filteredTicks = activeCategory === 'all' 
    ? MULTI_ASSET_MARKET_TICKS 
    : MULTI_ASSET_MARKET_TICKS.filter(t => t.category === activeCategory);

  const totalAggregatedEquity = INITIAL_CONNECTED_ACCOUNTS.reduce((acc, c) => acc + c.balanceUsd, 0);

  const venues = [
    { name: "Bybit", protocol: "API v5 Direct WebSocket", latency: "2.1 ms", type: "CEX Crypto", status: "Connected", depth: "$14.2M" },
    { name: "OKX", protocol: "Non-Disclosed DMA FIX", latency: "1.9 ms", type: "CEX Crypto", status: "Connected", depth: "$11.8M" },
    { name: "cTrader", protocol: "Open API Protobuf TLS", latency: "4.3 ms", type: "Forex & CFDs", status: "Connected", depth: "$45.0M" },
    { name: "MetaTrader 5", protocol: "Windows Native Gateway", latency: "5.1 ms", type: "Forex & Commodities", status: "Connected", depth: "$32.5M" },
    { name: "Hyperliquid", protocol: "L1 High Throughput", latency: "0.8 ms", type: "DEX Perps", status: "Connected", depth: "$8.4M" },
    { name: "CME Group", protocol: "QuickFIX 4.4 Financial", latency: "3.7 ms", type: "Regulated Futures", status: "Connected", depth: "$90.0M" }
  ];

  return (
    <section id="multi-venue" className="w-full py-20 sm:py-28 bg-gradient-to-b from-transparent via-[#06070B]/70 to-[#06070B] relative select-none overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#38BDF8]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header: Minimalist, Bold & Clean */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {t.multiVenue.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                  {t.multiVenue.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-light leading-relaxed">
                {t.multiVenue.subtitle}
              </p>
            </div>

            {/* Consolidated Equity Pill (No harsh box border) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border-t border-white/10 backdrop-blur-xl shrink-0">
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-semibold">{t.multiVenue.equityLabel}</div>
              <div className="text-xl sm:text-3xl font-black font-mono-nums text-white mt-1 drop-shadow-[0_0_25px_rgba(244,114,182,0.3)]">
                ${totalAggregatedEquity.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">USD</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Master Control Layout: Atmospheric Borderless Glass Surfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left: Real-Time Quotes Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-3xl p-5 sm:p-7 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">{t.multiVenue.feedTitle}</span>
              
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
                {(['all', 'crypto', 'forex', 'futures'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs capitalize transition-all cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-white/10 text-white font-bold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat === 'all' ? t.multiVenue.allAssets : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Table: Clean, responsive rows without clipped prices */}
            <div className="space-y-2.5">
              {filteredTicks.map((tick) => (
                <div 
                  key={tick.symbol}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#38BDF8] group-hover:scale-125 transition-all shadow-[0_0_8px_#38BDF8] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm sm:text-base tracking-tight flex items-center gap-2 truncate">
                        <span>{tick.symbol}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-normal">
                          {tick.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-light mt-0.5 truncate">
                        {tick.venues}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="font-mono-nums font-bold text-white text-sm sm:text-base">
                      ${tick.price.toLocaleString(undefined, { minimumFractionDigits: tick.category === 'forex' ? 4 : 2 })}
                    </div>
                    <div className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-1 mt-0.5 ${
                      tick.change24h >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                    }`}>
                      {tick.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{tick.change24h >= 0 ? '+' : ''}{tick.change24h}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] sm:text-xs truncate">{t.multiVenue.latencyText}</span>
              <button 
                onClick={() => navigate('/login')}
                className="text-white hover:text-[#F472B6] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <span>{t.multiVenue.splitOrderBtn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right: Connected Institutional Venues Cockpit */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="rounded-3xl p-5 sm:p-7 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.multiVenue.gatewaysTitle}</h3>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">{t.multiVenue.gatewaysSubtitle}</p>
                </div>
                <Cpu className="w-5 h-5 text-[#38BDF8]" />
              </div>

              <div className="space-y-3">
                {venues.map((v) => (
                  <div 
                    key={v.name}
                    onClick={() => setSelectedVenue(v.name)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                      selectedVenue === v.name 
                        ? 'bg-gradient-to-r from-[#38BDF8]/15 to-[#F472B6]/15 border-l-2 border-[#38BDF8] shadow-lg' 
                        : 'bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="font-bold text-white text-xs sm:text-sm">{v.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{v.type}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#10B981]">{v.latency}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="truncate max-w-[170px]">{v.protocol}</span>
                      <span className="text-white shrink-0 ml-2">{v.depth}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Conectar Gateway Institucional</span>
                </button>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
