import React, { useRef, useState, useEffect } from 'react';
import footerBg from '../assets/images/footer.webp';
import eklipseEmblemImg from '../assets/images/eklipse_sol_luna_emblem_transparent.png';
import terminalExecutionImg from '../assets/images/terminal/terminal_execution_chart.png';
import terminalBracketsImg from '../assets/images/terminal/terminal_risk_reward_brackets.png';
import terminalCurveImg from '../assets/images/terminal/terminal_equity_curve.png';
import terminalDepthImg from '../assets/images/terminal/terminal_orderbook_l2_depth.png';
import { 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Zap, 
  CheckCircle2, 
  SlidersHorizontal,
  Maximize2,
  ExternalLink
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
      tag: isEn ? 'PROPRIETARY TERMINAL · TRADER COMFORT' : 'TERMINAL PROPIA · COMODIDAD TOTAL',
      title: isEn ? 'Built for Trader Comfort & Peak Precision' : 'Diseñada para la Comodidad del Trader',
      desc: isEn 
        ? 'A dedicated, fluid trading environment engineered from scratch. High-FPS candlestick charts, integrated order ticket on the right, and interactive position tags on chart with zero lag.'
        : 'Un entorno de trading dedicado y fluido creado desde cero. Gráficos de velas de alta tasa de refresco a 60 FPS, panel de órdenes lateral integrado y posiciones interactivas en pantalla sin demoras.',
      features: [
        { label: isEn ? 'Chart Engine' : 'Motor Gráfico', value: 'KLineCharts GPU (60 FPS)' },
        { label: isEn ? 'Data Feed' : 'Conexión en Vivo', value: 'WebSocket (< 15ms)' },
        { label: isEn ? 'Zero Downloads' : 'Sin Instalación', value: isEn ? '100% Web Terminal' : 'Terminal 100% Web' },
      ],
      image: terminalExecutionImg,
      windowTitle: 'EKLIPSE OS · Execution Terminal (BTC/USDT 5m)',
      highlightBadge: '60 FPS GPU'
    },
    {
      index: '02',
      tag: isEn ? 'VISUAL RISK/REWARD · PRE-TRADE BRACKETS' : 'PROYECCIÓN VISUAL · BRACKETS R:B',
      title: isEn ? 'Project R:R Brackets Directly on Candlesticks' : 'Proyecta Tu Ratio R:B en el Gráfico',
      desc: isEn 
        ? 'Plan and visualize your Take Profit (green) and Stop Loss (red) target zones directly on the candles before executing. Quick buttons for 1:1 to 1:4 ratios with instant automatic margin calculation.'
        : 'Visualiza tus zonas de Take Profit (área verde) y Stop Loss (área roja) directamente sobre las velas antes de disparar al mercado. Ratios rápidos de 1:1 a 1:4 con cálculo de margen automático.',
      features: [
        { label: isEn ? 'R:R Projection' : 'Proyección R:B', value: '1:1 · 1:1.5 · 1:2 · 1:3 · 1:4' },
        { label: isEn ? 'Order Types' : 'Tipos de Orden', value: 'Market & Limit Brackets' },
        { label: isEn ? 'Protection' : 'Protección', value: isEn ? 'Auto SL/TP Calculation' : 'Cálculo Automático SL/TP' },
      ],
      image: terminalBracketsImg,
      windowTitle: 'EKLIPSE OS · Visual R:R Bracket Engine',
      highlightBadge: isEn ? 'Visual Brackets' : 'Brackets Visuales'
    },
    {
      index: '03',
      tag: isEn ? 'EQUITY CURVE · DETERMINISTIC SAFETY' : 'CURVA DE RENDIMIENTO · CONTROL TOTAL',
      title: isEn ? 'Real-Time Equity Curve with Safety Buffers' : 'Curva de Rendimiento y Umbrales en Vivo',
      desc: isEn 
        ? 'Keep total control without external spreadsheets. See your exact real-time distance to TP Target ($106K), Break-Even Base ($100K), Daily Loss Limit (2%), and Max Drawdown (8%) plotted continuously.'
        : 'Control total de tu cuenta sin hojas de cálculo externas. Visualiza en vivo tu distancia exacta al TP Target ($106K), Break-Even ($100K), Pérdida Diaria (2%) y Drawdown Máximo (8%).',
      features: [
        { label: isEn ? 'Daily Loss Limit' : 'Límite Diario', value: '2% Fijo (00:00 UTC)' },
        { label: isEn ? 'Max Drawdown' : 'Drawdown Máximo', value: '8% de Capital Inicial' },
        { label: isEn ? 'In-RAM Telemetry' : 'Auditoría en RAM', value: isEn ? '< 1ms Synchronous' : '< 1ms Síncrono' },
      ],
      image: terminalCurveImg,
      windowTitle: 'EKLIPSE OS · Performance Curve & Risk Thresholds',
      highlightBadge: isEn ? 'Dynamic Safety Buffers' : 'Colchón de Seguridad'
    },
    {
      index: '04',
      tag: isEn ? 'L2 DEPTH & BREAK-EVEN SHIELD' : 'PROFUNDIDAD L2 · PROTECCIÓN BREAK-EVEN',
      title: isEn ? 'L2 Order Book Depth & 1-Click Break-Even' : 'Profundidad L2 y Protección con 1 Clic',
      desc: isEn 
        ? 'Inspect live bids and asks depth with ultra-tight spreads ($0.01). When in profit, lock in capital instantly with our 1-click Break-Even button, eliminating trade risk effortlessly.'
        : 'Supervisa la profundidad del libro L2 con micro-spreads de $0.01. Cuando tu trade esté en positivo, asegura tu capital al instante con el botón de Break-Even en 1 clic para eliminar el riesgo.',
      features: [
        { label: isEn ? 'L2 Order Book' : 'Libro de Órdenes L2', value: isEn ? 'Live Micro-Spread ($0.01)' : 'Micro-Spread ($0.01)' },
        { label: isEn ? 'Safety Trigger' : 'Gatillo de Seguridad', value: isEn ? '1-Click Trailing BE' : 'Trailing BE en 1 Clic' },
        { label: isEn ? 'Settlement' : 'Cobro de Retiros', value: isEn ? 'USDT On-Chain (< 24h)' : 'USDT On-Chain (< 24h)' },
      ],
      image: terminalDepthImg,
      windowTitle: 'EKLIPSE OS · L2 Order Book & Trailing Break-Even',
      highlightBadge: isEn ? 'Spread $0.01 · 1-Click BE' : 'Spread $0.01 · BE en 1 Clic'
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
                className="w-screen h-full flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 flex-shrink-0 py-6 sm:py-0"
              >
                {/* Eklipse Dark Glass Console Box - High Readability & Contrast */}
                <div className="max-w-6xl mx-auto w-full p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-950/85 border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] my-auto relative z-10 overflow-hidden text-white">
                  
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

                  {/* Main Grid: Info (Left 5 cols) + Visual Framed Terminal Screenshot (Right 7 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                    
                    {/* Left Column: Text & Features (5 cols) */}
                    <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                        {slide.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                        {slide.desc}
                      </p>

                      {/* 3 Clear Feature Metric Cells */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {slide.features.map((f, fIdx) => (
                          <div 
                            key={fIdx} 
                            className="p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md"
                          >
                            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                              {f.label}
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-300 mt-1 truncate">
                              {f.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <button
                          onClick={handleAction}
                          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                        >
                          <Terminal className="w-4 h-4 text-slate-950" />
                          <span>{isEn ? 'Open Web Terminal' : 'Abrir Terminal Web'}</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Framed High-Resolution Terminal Screenshot (7 cols) */}
                    <div className="lg:col-span-7">
                      <div 
                        onClick={handleAction}
                        className="relative group/window rounded-2xl bg-slate-950/90 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 hover:border-amber-400/50 cursor-pointer"
                      >
                        {/* macOS / Obsidian Style Window Titlebar */}
                        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between font-mono text-[11px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
                            <span className="text-slate-300 font-semibold ml-2 truncate text-[10px] sm:text-[11px]">
                              {slide.windowTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{slide.highlightBadge}</span>
                            </span>
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover/window:text-amber-300 transition-colors hidden sm:inline" />
                          </div>
                        </div>

                        {/* High-Resolution Screenshot with Smooth Ambient Zoom */}
                        <div className="relative overflow-hidden bg-slate-950/80 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/window:scale-[1.03] filter brightness-[1.03] contrast-[1.08]"
                            loading="lazy"
                          />
                          
                          {/* Ambient Glass Vignette & Hover Sheen */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute inset-0 opacity-0 group-hover/window:opacity-100 transition-opacity duration-300 bg-amber-400/[0.03] pointer-events-none" />
                        </div>

                        {/* Interactive Click Hint Bar */}
                        <div className="px-4 py-1.5 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="truncate">{isEn ? 'Interactive Institutional Workspace' : 'Espacio de Trabajo Institucional'}</span>
                          <span className="text-amber-300 font-bold flex items-center gap-1 shrink-0">
                            <span>{isEn ? 'Click to Launch' : 'Clic para Explorar'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
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

