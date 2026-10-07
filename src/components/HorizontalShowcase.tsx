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
  Maximize2
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

  const handleGetFunded = () => {
    const el = document.getElementById('programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const slides = [
    {
      index: '01',
      tag: isEn ? 'DEDICATED INTERFACE · INSTANT EXECUTION' : 'INTERFAZ DEDICADA · EJECUCIÓN INSTANTÁNEA',
      title: isEn ? 'Built for Trader Comfort & Instant Execution' : 'Diseñada para la Comodidad y Ejecución Instantánea',
      desc: isEn 
        ? 'A dedicated, distraction-free trading environment. Lightning-fast instant market execution, integrated order ticket on the right, and interactive positions on chart with zero lag.'
        : 'Una interfaz limpia, intuitiva y sin distracciones. Ejecución instantánea de órdenes al mercado, panel de trading integrado a la derecha y seguimiento de posiciones en pantalla sin demoras ni instalaciones.',
      features: [
        { label: isEn ? 'Order Execution' : 'Ejecución de Órdenes', value: isEn ? 'Instant to Market' : 'Instantánea al Mercado' },
        { label: isEn ? 'Order Panel' : 'Panel de Órdenes', value: isEn ? 'Integrated on Right' : 'Integrado a la Derecha' },
        { label: isEn ? 'Platform Access' : 'Acceso', value: isEn ? '100% Web Terminal' : 'Terminal 100% Web' },
      ],
      image: terminalExecutionImg,
      windowTitle: isEn ? 'BTC/USDT · Operations Terminal' : 'BTC/USDT · Terminal de Operaciones',
      highlightBadge: isEn ? 'Instant Execution' : 'Ejecución Instantánea'
    },
    {
      index: '02',
      tag: isEn ? 'VISUAL BRACKETS · PRE-TRADE R:R' : 'BRACKETS VISUALES · R:B EN PANTALLA',
      title: isEn ? 'Project Risk/Reward Brackets Directly on Candles' : 'Proyecta Tu Ratio R:B en el Gráfico',
      desc: isEn 
        ? 'Visualize your Take Profit (green zone) and Stop Loss (red zone) directly on the candles before executing. Quick buttons for 1:1 to 1:4 ratios with automatic margin calculation.'
        : 'Define y visualiza tus zonas de Take Profit (área verde) y Stop Loss (área roja) directamente sobre las velas antes de disparar al mercado. Ratios rápidos de 1:1 a 1:4 con cálculo de margen automático.',
      features: [
        { label: isEn ? 'R:R Projection' : 'Proyección R:B', value: '1:1 · 1:1.5 · 1:2 · 1:3 · 1:4' },
        { label: isEn ? 'Order Types' : 'Tipos de Orden', value: isEn ? 'Market & Limit Brackets' : 'Órdenes Límite & Mercado' },
        { label: isEn ? 'Protection' : 'Protección', value: isEn ? 'Automatic SL & TP' : 'SL y TP Automático' },
      ],
      image: terminalBracketsImg,
      windowTitle: isEn ? 'BTC/USDT · Visual R:R Projection' : 'BTC/USDT · Proyección Visual SL / TP',
      highlightBadge: isEn ? 'Visual Brackets' : 'Brackets Visuales'
    },
    {
      index: '03',
      tag: isEn ? 'PERFORMANCE CURVE · REAL-TIME PROGRESS' : 'CURVA DE RENDIMIENTO · PROGRESO EN VIVO',
      title: isEn ? 'Real-Time Account Progress & Risk Thresholds' : 'Progreso y Límites de la Cuenta en Vivo',
      desc: isEn 
        ? 'Keep total control without spreadsheets. View your live account curve alongside clear targets: Take Profit target ($106K), starting point, and daily loss (2%) and max drawdown (8%) thresholds.'
        : 'Control total de tu cuenta sin hojas de cálculo externas. Visualiza en vivo tu curva de rendimiento con metas claras: Take Profit ($106K), punto de inicio y límites de pérdida diaria (2%) y total (8%).',
      features: [
        { label: isEn ? 'Daily Loss Limit' : 'Límite Diario', value: isEn ? '2% Max (00:00 UTC)' : '2% Máx (00:00 UTC)' },
        { label: isEn ? 'Max Drawdown' : 'Drawdown Total', value: isEn ? '8% from Starting Balance' : '8% de Balance Inicial' },
        { label: isEn ? 'Account Status' : 'Auditoría', value: isEn ? 'Live Real-Time Sync' : 'Balance en Directo' },
      ],
      image: terminalCurveImg,
      windowTitle: isEn ? 'Account Performance Curve & Limits' : 'Curva de Rendimiento de la Cuenta',
      highlightBadge: isEn ? 'Live Equity Progress' : 'Progreso en Directo'
    },
    {
      index: '04',
      tag: isEn ? '1-CLICK SHIELD · BE ON EVERY POSITION' : 'BREAK-EVEN EN CADA POSICIÓN · CERO RIESGO',
      title: isEn ? 'Built-In Break-Even on Every Position & L2 Depth' : 'Break-Even en Cada Posición y Libro L2',
      desc: isEn 
        ? 'Eliminate trade risk instantly. Every open position has a built-in Break-Even (BE) button to slide your Stop Loss to entry price in a single tap, plus live high-precision L2 order book depth.'
        : 'Elimina el riesgo de tu operativa al instante. Cada posición abierta incluye su propio botón de Break-Even (BE) para mover el Stop Loss a precio de entrada en un solo clic, junto al libro de órdenes L2 en tiempo real.',
      features: [
        { label: isEn ? 'Break-Even (BE)' : 'Break-Even (BE)', value: isEn ? 'Built-In on Every Position' : 'Incorporado en Cada Posición' },
        { label: isEn ? 'Safety Trigger' : 'Protección Rápida', value: isEn ? '1-Click Zero Risk' : '1 Clic a Precio Entrada' },
        { label: isEn ? 'L2 Order Book' : 'Libro de Órdenes', value: isEn ? 'Live Market Depth' : 'Profundidad en Vivo' },
      ],
      image: terminalDepthImg,
      windowTitle: isEn ? 'Order Book & 1-Click Break-Even Shield' : 'Libro de Órdenes & Protección BE',
      highlightBadge: isEn ? '1-Click Break-Even' : 'BE en Cada Posición'
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

        {/* Minimal Navigation Bar with Counter & Single Section Action Button */}
        <div className="relative z-10 w-full px-4 sm:px-10 lg:px-16 pt-5 sm:pt-7 flex items-center justify-between">
          {/* Section Indicator */}
          <div className="flex items-center gap-2.5 font-mono text-xs text-amber-300 font-bold bg-slate-950/80 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/10">
            <img src={eklipseEmblemImg} alt="Eklipse" className="w-4 h-4 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <span className="uppercase tracking-widest">{isEn ? 'Terminal Overview' : 'Nuestra Terminal'}</span>
          </div>

          {/* Right Controls: Slide Counter + Single Section Action Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Slide Counter */}
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm bg-slate-950/85 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              <span className="text-amber-400 font-black tracking-wider">[ 0{currentSlideIndex}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 font-bold">0{totalSlides} ]</span>
            </div>

            {/* Single Section CTA Button: Get Funded / Comenzar Ahora */}
            <button
              type="button"
              onClick={handleGetFunded}
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <span>{isEn ? 'Get Funded' : 'Comenzar Ahora'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
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
                className="w-screen h-full flex flex-col justify-center px-3 sm:px-8 lg:px-14 xl:px-20 flex-shrink-0 py-4 sm:py-0"
              >
                {/* Console Box with Maximum Prominence for Images */}
                <div className="max-w-6xl mx-auto w-full p-5 sm:p-7 lg:p-8 rounded-3xl bg-slate-950/90 border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] my-auto relative z-10 overflow-hidden text-white">
                  
                  {/* Top Bar: Tag & Index */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-amber-300">
                        {slide.tag}
                      </span>
                    </div>
                    <span className="font-mono text-lg sm:text-xl font-black text-white/30 tracking-tight">
                      {slide.index}
                    </span>
                  </div>

                  {/* Main Grid: Info (Left 4.5 cols) + Framed Protagonist Screenshot (Right 7.5 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
                    
                    {/* Left Column: Focused Text & Clear Features */}
                    <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                        {slide.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                        {slide.desc}
                      </p>

                      {/* 3 Clear Feature Metric Cells (No tech jargon) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {slide.features.map((f, fIdx) => (
                          <div 
                            key={fIdx} 
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md"
                          >
                            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
                              {f.label}
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-300 mt-0.5 truncate">
                              {f.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Hero Framed High-Resolution Terminal Screenshot */}
                    <div className="lg:col-span-7">
                      <div className="relative group/window rounded-2xl bg-slate-950/95 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 hover:border-amber-400/50">
                        {/* Clean Window Titlebar */}
                        <div className="px-3.5 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
                            <span className="text-slate-300 font-semibold ml-2 truncate text-[10px] sm:text-[11px]">
                              {slide.windowTitle}
                            </span>
                          </div>

                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{slide.highlightBadge}</span>
                          </span>
                        </div>

                        {/* High-Resolution Protagonist Screenshot */}
                        <div className="relative overflow-hidden bg-slate-950/90 aspect-[16/9.5] flex items-center justify-center">
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/window:scale-[1.02] filter brightness-[1.03] contrast-[1.06]"
                            loading="lazy"
                          />
                          
                          {/* Ambient Glass Vignette Sheen */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
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
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-5 sm:pb-7 flex items-center gap-6">
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

