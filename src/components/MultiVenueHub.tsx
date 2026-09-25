import React, { useState } from 'react';
import { 
  MULTI_ASSET_MARKET_TICKS, 
  INITIAL_CONNECTED_ACCOUNTS,
  ConnectedAccount,
  LiveMarketTick 
} from '../data/mockData';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const MultiVenueHub: React.FC<{ onOpenTerminal: () => void }> = ({ onOpenTerminal }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');

  const filteredTicks = activeCategory === 'all' 
    ? MULTI_ASSET_MARKET_TICKS 
    : MULTI_ASSET_MARKET_TICKS.filter(t => t.category === activeCategory);

  const totalAggregatedEquity = INITIAL_CONNECTED_ACCOUNTS.reduce((acc, c) => acc + c.balanceUsd, 0);

  return (
    <section id="multi-venue" className="py-24 bg-[#08090C] relative">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2DD4BF] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
              <span>Conectividad de Grado Institucional</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Todos tus Exchanges y Brokers en un Solo Panel
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Visualiza saldos consolidados, libros de órdenes Nivel 2 y latencias en tiempo real sin salir de Global City.
            </p>
          </div>

          {/* Aggregated Stat Pill */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-6 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Equidad Consolidada Agregada</div>
              <div className="text-2xl font-extrabold font-mono-nums text-white mt-0.5">
                ${totalAggregatedEquity.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <div className="text-[11px] text-emerald-400 font-medium">Estado Conectores</div>
              <div className="text-xs font-mono-nums font-bold text-white flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>6 Venues Sincronizados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Venues Grid (6 Protocols & Venues) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {INITIAL_CONNECTED_ACCOUNTS.map((venue) => (
            <div 
              key={venue.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">{venue.venueName}</span>
                  <span className="text-[10px] font-mono-nums px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{venue.status}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-[#E06D8A] font-semibold">{venue.assetClass}</span>
                  <span className="text-white/20">·</span>
                  <span className="font-mono-nums text-slate-400">{venue.protocol}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Balance Cartera</div>
                    <div className="text-xl font-bold font-mono-nums text-white mt-0.5">
                      ${venue.balanceUsd.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Latencia Socket</div>
                    <div className="text-xs font-mono-nums font-bold text-[#2DD4BF] mt-1">
                      {venue.pingMs} ms
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] text-slate-400">
                <span>Margen libre: <strong className="text-slate-200 font-mono-nums">${venue.freeMarginUsd.toLocaleString()}</strong></span>
                <span>{venue.openOrdersCount} órdenes activas</span>
              </div>
            </div>
          ))}
        </div>

        {/* Realtime Streaming Quotes Section with Category Tabs */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Cotizaciones L2 en Tiempo Real</h3>
              <p className="text-xs text-slate-400 mt-1">Sincronización simultánea de precios y spreads entre cripto, forex y futuros.</p>
            </div>

            {/* Segmented Filter Control */}
            <div className="inline-flex p-1 rounded-xl bg-[#141622] border border-white/10 self-start sm:self-auto">
              {(['all', 'crypto', 'forex', 'futures'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-[#E06D8A] text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Todos los Activos' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3 px-4 font-semibold uppercase text-[11px]">Instrumento</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-[11px]">Último Precio</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-[11px]">Variación 24h</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-[11px]">Volumen 24h</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-[11px]">Venues Sincronizados</th>
                  <th className="pb-3 px-4 text-right font-semibold uppercase text-[11px]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-nums">
                {filteredTicks.map((tick) => (
                  <tr key={tick.symbol} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{tick.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-sans font-normal hidden sm:inline">({tick.name})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white font-bold">
                      ${tick.price.toLocaleString(undefined, { minimumFractionDigits: tick.price < 2 ? 4 : 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-bold flex items-center gap-1 ${tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tick.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{tick.change24h >= 0 ? `+${tick.change24h}%` : `${tick.change24h}%`}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{tick.volume24h}</td>
                    <td className="py-4 px-4 text-slate-400 font-sans text-xs">{tick.venues}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={onOpenTerminal}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#E06D8A] text-slate-200 hover:text-white text-xs font-sans font-semibold transition-all cursor-pointer"
                      >
                        Operar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
