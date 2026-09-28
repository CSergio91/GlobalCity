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
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'forex'>('all');
  
  // Real-time WebSocket prices
  const { ticks, isConnected } = useLiveMarketTicks();

  const filteredTicks = activeCategory === 'all' 
    ? ticks 
    : ticks.filter(t => t.category === activeCategory);

  // Clean, focused 4 major exchange gateways
  const venues = [
    { name: "Binance", protocol: "API v3 Spot & Perpetuals", latency: "1.2 ms", status: "Conectado" },
    { name: "Bybit", protocol: "API v5 Direct WebSocket", latency: "1.9 ms", status: "Conectado" },
    { name: "OKX", protocol: "v5 DMA FIX Protocol", latency: "1.8 ms", status: "Conectado" },
    { name: "BingX", protocol: "Standard & Perpetual API", latency: "2.1 ms", status: "Conectado" }
  ];

  return (
    <section 
      id="multi-venue" 
      className="w-full py-16 sm:py-24 bg-transparent relative select-none overflow-hidden"
    >
      {/* 
        NO HEAVY BOXES: 
        Lightweight translucent glass styling allowing the animated video canvas 
        in the background to shine through clearly.
      */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1240px] mx-auto relative z-10">
        
        {/* Section Header: Minimalist & Clean */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-5 text-center lg:text-left"
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Conectividad con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                Exchanges Principales
              </span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-300 font-normal leading-relaxed drop-shadow-sm">
              Conexión directa mediante API keys cifradas para tus operaciones de Copy Trading y Terminal Propia.
            </p>
          </div>

          {/* Live Telemetry Indicator */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/50 border border-white/15 backdrop-blur-md shrink-0 shadow-sm mx-auto lg:mx-0">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              WebSocket en vivo &lt; 2ms
            </span>
          </div>
        </motion.div>

        {/* Master Two-Column Grid: Clean & Translucent (Open space for the video) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: 4 Benchmark Quotes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-2xl p-4 sm:p-6 bg-slate-950/35 border border-white/15 backdrop-blur-md shadow-[4px_4px_0px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Precios de Referencia en Tiempo Real
              </span>
              
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                {(['all', 'crypto', 'forex'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all cursor-pointer font-mono ${
                      activeCategory === cat 
                        ? 'bg-[#7C3AED] text-white font-bold' 
                        : 'text-slate-400 hover:text-white bg-slate-900/40 border border-white/10'
                    }`}
                  >
                    <span>{cat === 'all' ? 'Todos' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Benchmark Quotes Table */}
            <div className="space-y-2">
              {filteredTicks.slice(0, 4).map((tick) => (
                <div 
                  key={tick.symbol}
                  className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 transition-all flex items-center justify-between border border-white/10 hover:border-purple-400/30"
                >
                  <div className="flex items-center gap-3">
                    <AssetBadge symbol={tick.symbol} className="w-8 h-8 rounded-full shadow-sm shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                        <span>{tick.symbol}</span>
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-400/30 uppercase">
                          {tick.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tick.venues}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm sm:text-base ${
                      tick.direction === 'up' ? 'text-emerald-400' : tick.direction === 'down' ? 'text-rose-400' : 'text-white'
                    }`}>
                      ${tick.price.toLocaleString(undefined, { 
                        minimumFractionDigits: tick.category === 'forex' && !tick.symbol.includes('XAU') ? 5 : 2,
                        maximumFractionDigits: tick.category === 'forex' && !tick.symbol.includes('XAU') ? 5 : 2
                      })}
                    </div>
                    <div className={`text-[10px] font-mono flex items-center justify-end gap-1 mt-0.5 ${
                      tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tick.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{tick.change24h >= 0 ? '+' : ''}{tick.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[10px] text-slate-400">Latencia institucional ultrabaja FIX/API</span>
              <button 
                onClick={() => navigate('/login')}
                className="text-purple-300 hover:text-white font-mono font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Conectar APIs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right: 4 Direct Exchange Integrations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-2xl p-4 sm:p-6 bg-slate-950/35 border border-white/15 backdrop-blur-md shadow-[4px_4px_0px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Gateways de Conexión
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Integración nativa vía API</p>
              </div>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-2.5">
              {venues.map((v) => (
                <div 
                  key={v.name}
                  className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 transition-all flex items-center justify-between border border-white/10 hover:border-purple-400/30"
                >
                  <div className="flex items-center gap-3">
                    <PlatformLogo name={v.name} className="w-7 h-7 rounded-lg shadow-sm shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm">{v.name}</span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {v.protocol}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {v.latency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span>Gestionar Conexiones API</span>
              </button>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
