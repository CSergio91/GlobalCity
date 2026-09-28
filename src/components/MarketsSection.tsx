import React from 'react';
import { Clock, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { ScrollReveal } from './common/ScrollReveal';

export const MarketsSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { ticks } = useLiveMarketTicks();

  // Find BTC, ETH, SOL from live feed or fallbacks
  const getTick = (symbol: string, fallbackPrice: string, fallbackChange: string) => {
    const found = ticks.find(t => t.symbol.toUpperCase().includes(symbol));
    return {
      price: found ? `$${found.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : fallbackPrice,
      change: found ? `${found.change24h >= 0 ? '+' : ''}${found.change24h.toFixed(2)}%` : fallbackChange,
      isPositive: found ? found.change24h >= 0 : true
    };
  };

  const btc = getTick('BTC', '$64,820.50', '+3.42%');
  const eth = getTick('ETH', '$3,485.20', '+2.18%');
  const sol = getTick('SOL', '$152.40', '+5.74%');

  const markets = [
    {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Perpetual',
      price: btc.price,
      change: btc.change,
      isPositive: btc.isPositive,
      leverage: '10x Max',
      status: isEn ? 'Live' : 'Activo'
    },
    {
      symbol: 'ETH/USDT',
      name: 'Ethereum Perpetual',
      price: eth.price,
      change: eth.change,
      isPositive: eth.isPositive,
      leverage: '10x Max',
      status: isEn ? 'Live' : 'Activo'
    },
    {
      symbol: 'SOL/USDT',
      name: 'Solana Perpetual',
      price: sol.price,
      change: sol.change,
      isPositive: sol.isPositive,
      leverage: '10x Max',
      status: isEn ? 'Live' : 'Activo'
    }
  ];

  return (
    <section 
      id="markets"
      className="w-full py-16 sm:py-24 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {isEn ? 'Trade the market that never sleeps.' : 'Opera el mercado que nunca duerme.'}
            </h2>

            {/* Sub-line */}
            <div className="pt-2 flex items-center justify-center gap-2 font-mono text-xs sm:text-sm text-amber-300 font-bold">
              <span>
                24/7 · {isEn ? 'Crypto Futures' : 'Futuros Cripto'} · {isEn ? 'Real-time market data' : 'Datos en tiempo real'}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Active Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {markets.map((m, i) => (
            <ScrollReveal key={i} animation="scale-pop" delay={i * 130} duration={650}>
              <div 
                className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-lg transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-black text-lg text-white">
                      {m.symbol}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {m.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-4">{m.name}</div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {m.price}
                    </span>
                    <span className={`text-sm font-mono font-bold ${m.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.change}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{isEn ? 'Max Leverage' : 'Apalancamiento'}</span>
                  <span className="text-cyan-300 font-semibold">{m.leverage}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Pipeline expansion tag */}
        <div className="mt-8 text-center text-xs font-mono text-slate-400">
          <span>{isEn ? '+ Additional high-liquidity crypto futures pairs launching soon.' : '+ Nuevos pares de futuros cripto de alta liquidez disponibles próximamente.'}</span>
        </div>

      </div>
    </section>
  );
};
