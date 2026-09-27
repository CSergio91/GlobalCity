import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ArrowUpRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { AssetBadge, PlatformLogo } from './MarketIcons';

export const MultiVenueHub: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>("Binance");
  
  // Real-time WebSocket prices directly from Binance + live macro baseline
  const { ticks, isConnected } = useLiveMarketTicks();

  const filteredTicks = activeCategory === 'all' 
    ? ticks 
    : ticks.filter(t => t.category === activeCategory);

  const venues = [
    { name: "Binance", protocol: "Spot & Futures API v3/dapi", latency: "1.2 ms", type: "Crypto & Perps", status: "Disponible", depth: "$42.8M" },
    { name: "Bybit", protocol: "API v5 Direct WebSocket", latency: "1.9 ms", type: "Crypto & Perps", status: "Disponible", depth: "$28.4M" },
    { name: "OKX", protocol: "v5 DMA FIX Protocol", latency: "1.8 ms", type: "Crypto & Spreads", status: "Disponible", depth: "$22.1M" },
    { name: "Coinbase", protocol: "Advanced Trade FIX / REST", latency: "2.6 ms", type: "Spot Institutional", status: "Disponible", depth: "$18.5M" },
    { name: "cTrader", protocol: "Open API 2.0 Protobuf TLS", latency: "3.4 ms", type: "Forex & Metales", status: "Disponible", depth: "$65.0M" },
    { name: "MetaTrader 5", protocol: "Windows Native DLL Gateway", latency: "4.1 ms", type: "Forex & Índices", status: "Disponible", depth: "$50.0M" },
    { name: "Hyperliquid", protocol: "L1 High-Throughput DEX", latency: "0.8 ms", type: "DEX Perpetuals", status: "Disponible", depth: "$14.6M" }
  ];

  return (
    <section id="multi-venue" className="w-full py-20 sm:py-28 bg-[#F8F9FE] border-t border-purple-100 relative select-none overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-[#9333EA]/5 to-transparent blur-[120px] pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[11px] font-mono font-bold text-[#6D28D9] tracking-wider uppercase mb-3 shadow-sm">
                <span>CONECTIVIDAD AGREGADA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                <span>EXCHANGES & DMA</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#090A10] tracking-tight leading-tight">
                {t.multiVenue.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1]">
                  {t.multiVenue.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-600 font-normal leading-relaxed">
                {t.multiVenue.subtitle}
              </p>
            </div>

            {/* Live Streaming WebSockets Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 border border-purple-200/80 backdrop-blur-xl shrink-0 shadow-sm">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-[#059669] animate-pulse' : 'text-amber-500'}`} />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-mono font-bold text-[#090A10] uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#059669]' : 'bg-amber-500'}`} />
                  Binance WS {isConnected ? 'En Vivo' : 'Conectando'}
                </span>
                <span className="text-[9px] font-mono text-slate-500">Ticks en tiempo real &lt; 5ms</span>
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
            className="lg:col-span-7 rounded-3xl p-5 sm:p-7 bg-white/95 border border-purple-200/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(124,58,237,0.08)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4 mb-5">
              <span className="text-xs uppercase font-mono tracking-wider text-[#090A10] font-bold">{t.multiVenue.feedTitle}</span>
              
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
                {(['all', 'crypto', 'forex', 'futures'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-[#7C3AED] text-white font-bold shadow-sm' 
                        : 'text-slate-500 hover:text-[#090A10]'
                    }`}
                  >
                    <span>{cat === 'all' ? t.multiVenue.allAssets : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Table: Live real-time prices with asset icons and micro-tick flashes */}
            <div className="space-y-2.5">
              {filteredTicks.map((tick) => (
                <div 
                  key={tick.symbol}
                  className={`p-3 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-purple-50/50 transition-all flex items-center justify-between group cursor-pointer border border-slate-100 hover:border-purple-200 ${
                    tick.direction === 'up' 
                      ? 'border-emerald-500/30 bg-emerald-50/30' 
                      : tick.direction === 'down' 
                      ? 'border-rose-500/30 bg-rose-50/30' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <AssetBadge symbol={tick.symbol} className="w-8 h-8 rounded-full shadow-sm shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#090A10] text-sm sm:text-base tracking-tight flex items-center gap-2 truncate">
                        <span>{tick.symbol}</span>
                        <span className="text-[10px] font-mono text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-widest font-normal">
                          {tick.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                        {tick.venues}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className={`font-mono-nums font-bold text-sm sm:text-base transition-colors duration-200 ${
                      tick.direction === 'up' ? 'text-emerald-600' : tick.direction === 'down' ? 'text-rose-600' : 'text-[#090A10]'
                    }`}>
                      ${tick.price.toLocaleString(undefined, { 
                        minimumFractionDigits: tick.category === 'forex' && !tick.symbol.includes('XAU') ? 5 : 2,
                        maximumFractionDigits: tick.category === 'forex' && !tick.symbol.includes('XAU') ? 5 : 2
                      })}
                    </div>
                    <div className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-1 mt-0.5 ${
                      tick.change24h >= 0 ? 'text-[#059669]' : 'text-rose-600'
                    }`}>
                      {tick.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{tick.change24h >= 0 ? '+' : ''}{tick.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px] sm:text-xs truncate">{t.multiVenue.latencyText}</span>
              <button 
                onClick={() => navigate('/login')}
                className="text-[#7C3AED] hover:text-[#5B21B6] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <span>{t.multiVenue.splitOrderBtn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right: Institutional Venues & Gateways Cockpit */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="rounded-3xl p-5 sm:p-7 bg-white/95 border border-purple-200/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
              <div className="flex items-center justify-between border-b border-purple-100 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#090A10] tracking-tight">{t.multiVenue.gatewaysTitle}</h3>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">Pasarelas de Conexión y Protocolos DMA</p>
                </div>
                <Cpu className="w-5 h-5 text-[#7C3AED]" />
              </div>

              {/* Platforms List with Official Brand Logos and 'Disponible' Status */}
              <div className="space-y-3">
                {venues.map((v) => (
                  <div 
                    key={v.name}
                    onClick={() => setSelectedVenue(v.name)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                      selectedVenue === v.name 
                        ? 'bg-purple-50/80 border-l-4 border-[#7C3AED] border border-purple-200/80 shadow-sm' 
                        : 'bg-slate-50/80 hover:bg-purple-50/40 border border-slate-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlatformLogo name={v.name} className="w-8 h-8 rounded-lg shadow-sm shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#090A10] text-xs sm:text-sm">{v.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{v.type}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate max-w-[160px] sm:max-w-[190px]">
                          {v.protocol}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2 flex flex-col items-end">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {v.status}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 mt-1">
                        Profundidad: {v.depth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-purple-100">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:brightness-105 active:scale-95"
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
