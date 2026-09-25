import React, { useState } from 'react';
import { 
  MULTI_ASSET_MARKET_TICKS, 
  INITIAL_CONNECTED_ACCOUNTS,
  LiveMarketTick 
} from '../data/mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ArrowUpRight,
  Terminal,
  Activity
} from 'lucide-react';

export const MultiVenueHub: React.FC<{ onOpenTerminal: () => void }> = ({ onOpenTerminal }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>("Bybit");

  const filteredTicks = activeCategory === 'all' 
    ? MULTI_ASSET_MARKET_TICKS 
    : MULTI_ASSET_MARKET_TICKS.filter(t => t.category === activeCategory);

  const totalAggregatedEquity = INITIAL_CONNECTED_ACCOUNTS.reduce((acc, c) => acc + c.balanceUsd, 0);

  const venues = [
    { name: "Bybit", protocol: "API v5 Direct WebSocket", latency: "2.1 ms", type: "CEX Cripto", status: "Connected", depth: "$14.2M" },
    { name: "OKX", protocol: "Non-Disclosed DMA FIX", latency: "1.9 ms", type: "CEX Cripto", status: "Connected", depth: "$11.8M" },
    { name: "cTrader", protocol: "Open API Protobuf TLS", latency: "4.3 ms", type: "Forex & CFDs", status: "Connected", depth: "$45.0M" },
    { name: "MetaTrader 5", protocol: "Windows Native Gateway", latency: "5.1 ms", type: "Forex & Commodities", status: "Connected", depth: "$32.5M" },
    { name: "Hyperliquid", protocol: "L1 High Throughput", latency: "0.8 ms", type: "DEX Perps", status: "Connected", depth: "$8.4M" },
    { name: "CME Group", protocol: "QuickFIX 4.4 Financial", latency: "3.7 ms", type: "Futuros Regulados", status: "Connected", depth: "$90.0M" }
  ];

  return (
    <section id="multi-venue" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#07080D] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header: Monumental & Clean */}
        <div className="mb-14">
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-mono text-[#D4AF37] mb-3">
            <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
            <span>ARQUITECTURA DE ENRUTAMIENTO SMART</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] text-balance">
                Un Único Mando.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#E06D8A]">
                  Todas las Sedes del Mundo.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
                Consolida liquidez, libros de órdenes Nivel 2 y ejecución simultánea entre los mayores centros de negociación sin fragmentar tu tesorería ni dispersar tus garantías.
              </p>
            </div>

            {/* Consolidated Equity Telemetry - Hairline layout, no boxy card */}
            <div className="border-l-2 border-[#D4AF37] pl-6 py-2 shrink-0">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">Equidad Consolidada en Tiempo Real</div>
              <div className="text-3xl sm:text-5xl font-black font-mono-nums text-white mt-1 drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                ${totalAggregatedEquity.toLocaleString()} <span className="text-sm font-light text-slate-400 font-sans">USD</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#10B981]">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>6 SEDES INTERCONECTADAS EN PARALELO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Control Layout: Two Integrated Panoramic Panels (No generic cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Real-Time Quotes Feed */}
          <div className="lg:col-span-7 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {/* Filter Navigation (Clean text links, no pill buttons) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Feed de Precios en Streaming</span>
              
              <div className="flex items-center gap-6 text-xs font-semibold">
                {(['all', 'crypto', 'forex', 'futures'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative py-1 capitalize transition-colors cursor-pointer ${
                      activeCategory === cat ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{cat === 'all' ? 'Todos los Activos' : cat}</span>
                    {activeCategory === cat && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#E06D8A] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hairline Quotes Table */}
            <div className="space-y-3">
              {filteredTicks.map((tick) => (
                <div 
                  key={tick.symbol}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]/50 group-hover:bg-[#D4AF37] group-hover:scale-125 transition-all" />
                    <div>
                      <div className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                        <span>{tick.symbol}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-normal">
                          {tick.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-light mt-0.5">
                        {tick.venues}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono-nums font-bold text-white text-base">
                      ${tick.price.toLocaleString(undefined, { minimumFractionDigits: tick.category === 'forex' ? 4 : 2 })}
                    </div>
                    <div className={`text-xs font-mono font-semibold flex items-center justify-end gap-1 mt-0.5 ${
                      tick.change24h >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                    }`}>
                      {tick.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{tick.change24h >= 0 ? '+' : ''}{tick.change24h}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Latencia de difusión WebSocket: sub-2ms</span>
              <button 
                onClick={onOpenTerminal}
                className="text-white hover:text-[#D4AF37] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ejecutar Split-Order en Vivo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Connected Institutional Venues Cockpit */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Pasarelas de Conexión Activas</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Protocolos nativos sin intermediarios web</p>
                </div>
                <Cpu className="w-5 h-5 text-[#D4AF37]" />
              </div>

              <div className="space-y-4">
                {venues.map((v) => (
                  <div 
                    key={v.name}
                    onClick={() => setSelectedVenue(v.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedVenue === v.name 
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="font-bold text-white text-sm">{v.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{v.type}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#10B981]">{v.latency}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{v.protocol}</span>
                      <span className="text-slate-300">Profundidad: {v.depth}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <button
                  onClick={onOpenTerminal}
                  className="w-full py-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  <span>Gestionar Credenciales en Terminal</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
