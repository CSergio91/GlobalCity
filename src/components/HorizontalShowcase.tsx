import React, { useRef, useState, useEffect } from 'react';
import footerBg from '../assets/images/footer.webp';
import eklipseEmblemImg from '../assets/images/eklipse_sol_luna_emblem_transparent.png';
import { 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Zap, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HorizontalShowcaseProps {
  onOpenTerminal?: () => void;
}

export const HorizontalShowcase: React.FC<HorizontalShowcaseProps> = ({ onOpenTerminal }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active pair in mini preview
  const [activePreviewPair, setActivePreviewPair] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');

  const pairPrices = {
    BTC: { price: '$64,820.50', change: '+3.42%' },
    ETH: { price: '$3,485.20', change: '+2.18%' },
    SOL: { price: '$152.40', change: '+5.74%' },
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;
      
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = () => {
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      navigate('/operations');
    }
  };

  const slides = [
    {
      index: '01',
      tag: isEn ? 'PROPRIETARY TERMINAL' : 'TERMINAL PROPIA',
      title: isEn ? 'Built Exclusively for Crypto Futures' : 'Diseñada para Futuros Cripto',
      desc: isEn 
        ? 'Trade your funded account directly in our web terminal. Real-time candlestick charts, order books, and positions tracker in a fast, clean interface with zero downloads.'
        : 'Opera tus cuentas de fondeo directamente en nuestra terminal web. Gráficos de velas en tiempo real, libro de órdenes y panel de posiciones en una interfaz limpia y sin descargas.',
      features: [
        { label: isEn ? 'Available Pairs' : 'Pares Disponibles', value: 'BTC · ETH · SOL' },
        { label: isEn ? 'Platform Access' : 'Acceso', value: isEn ? '100% Web Terminal' : 'Terminal 100% Web' },
        { label: isEn ? 'Trading Hours' : 'Horario', value: isEn ? '24/7 Continuous' : '24/7 Continuo' },
      ],
      type: 'chart-preview'
    },
    {
      index: '02',
      tag: isEn ? 'ORDER EXECUTION' : 'GESTIÓN DE ÓRDENES',
      title: isEn ? 'Direct Execution with Stop Loss & Take Profit' : 'Ejecución Directa con Stop Loss y Take Profit',
      desc: isEn 
        ? 'Place market and limit orders with built-in protection brackets. Set your exact Stop Loss and Take Profit levels to safeguard your equity automatically on every position.'
        : 'Abre órdenes a mercado o límite con protección integrada. Define tus niveles exactos de Stop Loss y Take Profit para proteger tu capital de forma automática en cada operación.',
      features: [
        { label: isEn ? 'Protection' : 'Protección', value: 'SL & TP Automático' },
        { label: isEn ? 'Order Types' : 'Tipos de Orden', value: 'Market & Limit' },
        { label: isEn ? 'Profit Tracking' : 'Seguimiento', value: isEn ? 'Live Unrealized PnL' : 'PnL en Tiempo Real' },
      ],
      type: 'orders'
    },
    {
      index: '03',
      tag: isEn ? 'RISK ENGINE' : 'CONTROL DE RIESGO',
      title: isEn ? 'Clear Rules Visible at All Times' : 'Reglas Claras y Visibles en Todo Momento',
      desc: isEn 
        ? 'Know your exact risk limits with continuous monitoring. Track your 2% maximum daily loss and 8% overall drawdown openly so you trade with clarity and discipline.'
        : 'Conoce tus límites exactos con monitoreo continuo. Consulta tu pérdida máxima diaria del 2% y drawdown del 8% de forma abierta para operar con disciplina y sin sorpresas.',
      features: [
        { label: isEn ? 'Daily Loss Limit' : 'Pérdida Diaria', value: '2% por Sesión' },
        { label: isEn ? 'Max Drawdown' : 'Drawdown Máximo', value: '8% de Capital' },
        { label: isEn ? 'Account Status' : 'Auditoría', value: isEn ? 'Real-Time Equity Sync' : 'Balance en Directo' },
      ],
      type: 'risk'
    },
    {
      index: '04',
      tag: isEn ? 'CRYPTO PAYOUTS' : 'RETIROS EN USDT',
      title: isEn ? 'Keep Your Profits. Paid On-Chain in USDT.' : 'Conserva tus Ganancias. Pagos en USDT.',
      desc: isEn 
        ? 'Complete 5 profitable trading days and request bi-weekly withdrawals. Profits are sent directly to your crypto wallet in USDT with zero waiting and zero hidden clauses.'
        : 'Cumple 5 días rentables y solicita retiros cada 14 días. Las ganancias se envían directamente a tu billetera en USDT, sin esperas ni cláusulas ocultas.',
      features: [
        { label: isEn ? 'Profit Split' : 'Reparto de Ganancias', value: '35% → 50% → 80% → 90%' },
        { label: isEn ? 'Payout Frequency' : 'Frecuencia', value: isEn ? 'Every 14 Days' : 'Cada 14 Días' },
        { label: isEn ? 'Billing' : 'Suscripción', value: isEn ? 'Zero Monthly Fees' : 'Sin Mensualidades' },
      ],
      type: 'payouts'
    }
  ];

  const totalSlides = slides.length;
  const translateX = scrollProgress * (totalSlides - 1) * 100;
  const bgTranslateX = scrollProgress * 20;
  const currentSlideIndex = Math.min(totalSlides, Math.floor(scrollProgress * (totalSlides - 0.05)) + 1);

  return (
    <section 
      id="terminal" 
      ref={containerRef} 
      className="relative h-[380vh] bg-transparent select-none"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas with Atmospheric Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={footerBg} 
            alt="Eklipse Horizon Parallax" 
            className="w-[145vw] h-full object-cover object-top filter brightness-[1.05] contrast-[1.25] saturate-[1.25] opacity-85 sm:opacity-90 transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.08) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06070B] via-transparent to-[#06070B] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)] pointer-events-none" />
        </div>

        {/* Minimal Monospace Navigation Counter with Eklipse Branding */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Section Indicator */}
          <div className="flex items-center gap-2.5 font-mono text-xs text-amber-300 font-bold bg-slate-950/80 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/10">
            <img src={eklipseEmblemImg} alt="Eklipse" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <span className="uppercase tracking-widest">{isEn ? 'Terminal Overview' : 'Nuestra Terminal'}</span>
          </div>

          {/* Slide Counter */}
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-slate-950/85 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
            <span className="text-amber-400 font-black tracking-wider">[ 0{currentSlideIndex}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-bold">0{totalSlides} ]</span>
          </div>
        </div>

        {/* Horizontal Moving Content Strip */}
        <div className="relative z-10 w-full flex-1 flex items-center overflow-hidden">
          <div 
            className="flex h-full items-center transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translateX(-${translateX}vw)`,
              width: `${totalSlides * 100}vw`
            }}
          >
            {slides.map((slide, idx) => (
              <div 
                key={idx} 
                className="w-screen h-full flex flex-col justify-center px-4 sm:px-10 lg:px-20 xl:px-28 flex-shrink-0 py-6 sm:py-0"
              >
                {/* Eklipse Dark Glass Console Box - High Readability & Contrast */}
                <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-950/80 border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] my-auto relative z-10 overflow-hidden text-white">
                  
                  {/* Top Bar: Tag & Index */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-300">
                        {slide.tag}
                      </span>
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-black text-white/30 tracking-tight">
                      {slide.index}
                    </span>
                  </div>

                  {/* Main Grid: Info (Left) + Visual Preview (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Text & Features (7 cols) */}
                    <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                        {slide.title}
                      </h2>

                      <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                        {slide.desc}
                      </p>

                      {/* 3 Clear Feature Metric Cells */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        {slide.features.map((f, fIdx) => (
                          <div 
                            key={fIdx} 
                            className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md"
                          >
                            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                              {f.label}
                            </div>
                            <div className="text-sm font-mono font-bold text-amber-300 mt-1 truncate">
                              {f.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <button
                          onClick={handleAction}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                        >
                          <Terminal className="w-4 h-4 text-slate-950" />
                          <span>{isEn ? 'Explore Terminal' : 'Explorar la Terminal'}</span>
                          <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Visual Component Preview (5 cols) */}
                    <div className="lg:col-span-5">
                      {slide.type === 'chart-preview' && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                          {/* Pair Switcher */}
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-1.5">
                              {(['BTC', 'ETH', 'SOL'] as const).map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setActivePreviewPair(p)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                    activePreviewPair === p
                                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                                      : 'bg-white/5 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              {pairPrices[activePreviewPair].price}
                            </div>
                          </div>

                          {/* Simplified Candlestick Graph Graphic */}
                          <div className="h-36 w-full bg-slate-950/80 rounded-xl p-3 flex items-end gap-2 border border-white/5">
                            {[30, 45, 25, 55, 70, 50, 85, 65, 95, 80, 110, 120].map((h, bIdx) => (
                              <div key={bIdx} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div className={`w-full rounded-sm ${bIdx % 3 === 1 ? 'bg-rose-500/80' : 'bg-emerald-400/80'}`} style={{ height: `${h}%` }} />
                              </div>
                            ))}
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                            <span>{isEn ? 'Mark Price' : 'Precio de Marca'}</span>
                            <span className="text-white font-bold">{pairPrices[activePreviewPair].price}</span>
                          </div>
                        </div>
                      )}

                      {slide.type === 'orders' && (
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3 font-mono text-xs">
                          <div className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10 pb-2">
                            {isEn ? 'Active Order Safeguard' : 'Protección de Orden'}
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400">
                            <span>Take Profit (TP)</span>
                            <span className="font-bold">+15% Objetivo (90% Payout)</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-white">
                            <span>{isEn ? 'Leverage' : 'Apalancamiento'}</span>
                            <span className="font-bold text-amber-300">20x – 100x</span>
                          </div>
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400">
                            <span>Stop Loss (SL)</span>
                            <span className="font-bold">-2% Límite</span>
                          </div>
                        </div>
                      )}

                      {slide.type === 'risk' && (
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3 font-mono text-xs">
                          <div className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10 pb-2">
                            {isEn ? 'Risk Monitor Status' : 'Panel de Control de Riesgo'}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">{isEn ? 'Daily Loss' : 'Pérdida Diaria'}</span>
                              <span className="text-rose-400 font-bold">2.00% Max</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                              <div className="h-full bg-rose-500 rounded-full" style={{ width: '25%' }} />
                            </div>
                          </div>
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">{isEn ? 'Max Drawdown' : 'Drawdown Total'}</span>
                              <span className="text-amber-400 font-bold">8.00% Max</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: '15%' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {slide.type === 'payouts' && (
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3 font-mono text-xs">
                          <div className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10 pb-2">
                            {isEn ? 'Reward Distribution' : 'Distribución de Pagos'}
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5">
                            <span className="text-slate-300">{isEn ? 'Currency' : 'Moneda'}</span>
                            <span className="text-emerald-400 font-bold">USDT On-Chain</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5">
                            <span className="text-slate-300">{isEn ? 'Scale Progression' : 'Escala'}</span>
                            <span className="text-amber-400 font-bold">35% → 50% → 80% → 90%</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-emerald-300">{isEn ? 'Billing' : 'Cobro'}</span>
                            <span className="text-emerald-400 font-bold">{isEn ? 'One-time only' : 'Pago único'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Line at Bottom with Eklipse Amber Glow */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-6 sm:pb-8 flex items-center gap-6">
          <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 transition-all duration-100 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]"
              style={{ width: `${Math.max(8, scrollProgress * 100)}%` }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};

