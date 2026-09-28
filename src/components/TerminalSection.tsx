import React, { useState } from 'react';
import { 
  Cpu, 
  TrendingUp, 
  MousePointerClick, 
  ListOrdered, 
  BarChart2, 
  ShieldAlert, 
  Coins, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { ScrollReveal } from './common/ScrollReveal';

interface TerminalSectionProps {
  onOpenTerminal?: () => void;
}

export const TerminalSection: React.FC<TerminalSectionProps> = ({ onOpenTerminal }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const [activePair, setActivePair] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');

  const pairData = {
    BTC: { price: '$64,820.50', change: '+3.42%', vol: '$4.2B' },
    ETH: { price: '$3,485.20', change: '+2.18%', vol: '$2.1B' },
    SOL: { price: '$152.40', change: '+5.74%', vol: '$980M' }
  };

  const currentPair = pairData[activePair];

  const features = [
    {
      icon: TrendingUp,
      title: isEn ? 'Real-time crypto futures data' : 'Datos de futuros cripto en tiempo real',
      desc: isEn ? 'Sub-millisecond WebSocket streaming direct from major perpetual orderbooks.' : 'Streaming WebSocket sub-milisegundo directo desde los principales libros perpetuos.'
    },
    {
      icon: BarChart2,
      title: isEn ? 'Advanced charts' : 'Gráficos avanzados',
      desc: isEn ? 'Powered by KLineChart v10 engine with multi-timeframe overlays and technical tools.' : 'Motor KLineChart v10 con superposiciones multitemporales y herramientas técnicas.'
    },
    {
      icon: MousePointerClick,
      title: isEn ? 'One-click execution' : 'Ejecución en un clic',
      desc: isEn ? 'Instant market and limit fills with automated SL/TP brackets directly from the chart.' : 'Órdenes market y limit instantáneas con brackets SL/TP automáticos desde el gráfico.'
    },
    {
      icon: ListOrdered,
      title: isEn ? 'Positions & orders' : 'Posiciones y órdenes',
      desc: isEn ? 'Live open positions tracker with liquidation buffer and tick-by-tick mark price sync.' : 'Seguimiento de posiciones vivas con colchón de liquidación y sincronización de mark price.'
    },
    {
      icon: Coins,
      title: isEn ? 'Real-time PnL' : 'PnL en tiempo real',
      desc: isEn ? 'Continuous mark-to-market equity calculations with zero delay.' : 'Cálculo continuo de patrimonio mark-to-market sin retraso.'
    },
    {
      icon: ShieldAlert,
      title: isEn ? 'Risk monitoring' : 'Monitorización de riesgo',
      desc: isEn ? 'Real-time automated safeguards alerting you before approaching daily or max loss limits.' : 'Protección automatizada que te avisa antes de acercarte a los límites de pérdida.'
    },
    {
      icon: Cpu,
      title: 'BTC / ETH / SOL',
      desc: isEn ? 'Deep simulated liquidity on high-volume crypto futures contracts 24/7.' : 'Profunda liquidez simulada en contratos de futuros de alto volumen 24/7.'
    }
  ];

  const handleExploreTerminal = () => {
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      navigate('/operations');
    }
  };

  return (
    <section 
      id="terminal"
      className="w-full py-20 sm:py-32 relative select-none bg-slate-950/70 border-t border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {isEn ? 'Your trading. Our technology.' : 'Tu trading. Nuestra tecnología.'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'No clunky generic MT5 bridges. EKLIPSE runs on a proprietary, GPU-accelerated web terminal built exclusively for Crypto Futures traders.' 
                : 'Sin pasarelas lentas de MT5. EKLIPSE funciona sobre una terminal web propia acelerada por GPU, construida exclusivamente para traders de futuros.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 2-Column Split: Terminal Screenshot Mockup + Features List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left / Top: Terminal Large Screenshot / Interactive Mockup (7 cols) */}
          <div className="lg:col-span-7">
            <ScrollReveal animation="blur-reveal" delay={120} duration={850}>
              <div className="rounded-2xl border border-white/15 bg-slate-900/90 shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.1)] overflow-hidden">
                {/* Header tab switcher */}
                <div className="px-4 py-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(['BTC', 'ETH', 'SOL'] as const).map((pair) => (
                      <button
                        key={pair}
                        onClick={() => setActivePair(pair)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          activePair === pair
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {pair}/USDT.P
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-white font-bold">{currentPair.price}</span>
                    <span className="text-emerald-400">{currentPair.change}</span>
                  </div>
                </div>

                {/* Terminal Main Canvas Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Order Book & Quick Action Toolbar */}
                  <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">24h Volume</div>
                      <div className="text-white font-bold mt-0.5">{currentPair.vol}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Execution Latency</div>
                      <div className="text-cyan-400 font-bold mt-0.5">0.8 ms</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Slippage</div>
                      <div className="text-emerald-400 font-bold mt-0.5">0.00% Sim</div>
                    </div>
                  </div>

                  {/* Realistic Chart Preview */}
                  <div className="h-64 sm:h-80 w-full bg-slate-950/90 rounded-xl border border-white/10 p-3 relative flex flex-col justify-between overflow-hidden">
                    {/* Simulated Order Execution Lines */}
                    <div className="absolute top-12 left-4 right-4 flex items-center gap-2 z-20 pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        TP Limit: $66,200.00 (+$1,380)
                      </span>
                      <div className="flex-1 border-b border-dashed border-rose-500/50" />
                    </div>

                    <div className="absolute top-28 left-4 right-4 flex items-center gap-2 z-20 pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        LONG 1.5 BTC @ $64,200.00
                      </span>
                      <div className="flex-1 border-b border-cyan-400/60" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        +$930.75
                      </span>
                    </div>

                    <div className="absolute bottom-14 left-4 right-4 flex items-center gap-2 z-20 pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        SL Stop: $63,600.00 (-$900)
                      </span>
                      <div className="flex-1 border-b border-dashed border-amber-500/50" />
                    </div>

                    {/* SVG Candlestick Bars Wave */}
                    <div className="w-full h-full flex items-end gap-1.5 sm:gap-2.5 pt-8 opacity-80">
                      {[45, 30, 60, 80, 50, 95, 70, 110, 85, 125, 100, 140, 160, 130, 175, 190].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="w-[1px] bg-emerald-400 h-2" />
                          <div 
                            className={`w-full rounded-[1px] ${i % 3 === 1 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ height: `${h}px` }} 
                          />
                          <div className="w-[1px] bg-emerald-400 h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Bottom Active Order Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono z-20 bg-slate-950/80 px-2 rounded-lg">
                      <span className="text-slate-400">Position: <strong className="text-white">Long 1.5 BTC</strong></span>
                      <span className="text-slate-400">Mark: <strong className="text-white">{currentPair.price}</strong></span>
                      <span className="text-emerald-400 font-bold">Unrealized: +$930.75</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right / Bottom: Feature List & CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3.5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <ScrollReveal key={i} animation="slide-left" delay={180 + i * 65} duration={550}>
                    <div className="flex items-start gap-3.5 group p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 group-hover:text-yellow-300 group-hover:bg-amber-400/10 transition-colors shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {f.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Direct CTA Button with Scale Pop */}
            <ScrollReveal animation="scale-pop" delay={180 + features.length * 65} duration={600}>
              <div className="pt-2">
                <button
                  onClick={handleExploreTerminal}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs sm:text-sm font-mono font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{isEn ? 'Explore the Terminal' : 'Explorar la Terminal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
};
