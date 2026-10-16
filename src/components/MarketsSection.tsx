import React, { useRef } from 'react';
import { 
  ArrowRight, 
  Coins, 
  Zap, 
  Gauge, 
  Globe 
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import bgMarketImg from '../assets/images/background_market.webp';
import pepeMarketImg from '../assets/images/pepe_market.webp';

interface MarketsSectionProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const MarketsSection: React.FC<MarketsSectionProps> = ({ onNavigateSection }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Mouse Tracking para Parallax Cinemático Holográfico (sin recálculos React)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 90, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Desplazamiento por capas (Mouse)
  const bgMouseX = useTransform(smoothX, [-1, 1], [18, -18]);
  const bgMouseY = useTransform(smoothY, [-1, 1], [12, -12]);

  const pepeMouseX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const pepeMouseY = useTransform(smoothY, [-1, 1], [-15, 15]);

  const textMouseX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const textMouseY = useTransform(smoothY, [-1, 1], [-6, 6]);

  // 2. Scroll Parallax Vertical suave
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const bgScrollY = useTransform(scrollYProgress, [0, 1], [-35, 35]);
  const pepeScrollY = useTransform(scrollYProgress, [0, 1], [35, -35]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el usuario prefiere movimiento reducido, desactivar parallax
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(Math.max(-1, Math.min(1, x)));
    mouseY.set(Math.max(-1, Math.min(1, y)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleScrollToPrograms = () => {
    if (onNavigateSection) {
      onNavigateSection('programs');
      return;
    }
    const container = document.getElementById('hero-experience');
    if (container) {
      const scrollable = container.offsetHeight - window.innerHeight;
      const targetScroll = container.offsetTop + scrollable * 0.35;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      const el = document.getElementById('programs');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      id="markets"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[660px] sm:min-h-[740px] lg:min-h-[840px] xl:min-h-[880px] overflow-hidden select-none bg-[#06070B] border-t border-b border-white/10 flex items-center"
    >
      {/* ========================================================================= */}
      {/* CAPA 0: FONDO CINEMÁTICO COMPLETO (Sin overlays oscuros, el arte destaca) */}
      {/* ========================================================================= */}
      <motion.div 
        style={{ 
          x: bgMouseX, 
          y: bgScrollY 
        }} 
        className="absolute inset-[-40px] pointer-events-none overflow-hidden"
      >
        <img 
          src={bgMarketImg} 
          alt="Eklipse Funded Futuristic Trading Skyline" 
          decoding="async"
          loading="lazy"
          className="w-full h-full object-cover object-center scale-[1.04]"
        />
      </motion.div>

      {/* ========================================================================= */}
      {/* CAPA 1: PEPE TRADER EN SU SETUP MULTI-MONITOR (Anclado a la derecha)       */}
      {/* ========================================================================= */}
      <motion.div 
        style={{ 
          x: pepeMouseX, 
          y: pepeScrollY 
        }} 
        className="absolute bottom-0 right-0 lg:right-[-2%] xl:right-0 w-[85%] sm:w-[70%] lg:w-[54%] xl:w-[50%] max-w-[1180px] pointer-events-none z-10 flex items-end justify-end"
      >
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex items-end justify-end"
        >
          <img 
            src={pepeMarketImg} 
            alt="Pepe The Funded Trader" 
            decoding="async"
            loading="lazy"
            className="w-full h-auto object-contain max-h-[82vh] sm:max-h-[88vh] drop-shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
          />
        </motion.div>
      </motion.div>

      {/* ========================================================================= */}
      {/* CAPA 2: CONTENIDO EDITORIAL A LA IZQUIERDA (Animación In-View al Scroll)   */}
      {/* ========================================================================= */}
      <motion.div 
        style={{ 
          x: textMouseX, 
          y: textMouseY 
        }}
        className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-18 lg:py-24 flex flex-col items-start text-left pointer-events-auto"
      >
        {/* 1. Titular Principal Gigante: Entrada suave con scroll */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.06] text-white drop-shadow-[0_6px_35px_rgba(0,0,0,0.95)] max-w-2xl">
            <span className="block drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
              {isEn ? 'Get funded up to' : 'Fondeate hasta'}
            </span>
            <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.65)]">
              $500,000 USD
            </span>
          </h2>
        </motion.div>

        {/* 2. Subtítulo: Revelación progresiva */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-100/90 font-normal max-w-md sm:max-w-lg leading-relaxed drop-shadow-[0_3px_15px_rgba(0,0,0,0.95)]">
            {isEn 
              ? 'Trade crypto futures, forex, and commodities. Raw spreads from 0.0 pips, sub-15ms execution, and reliable payouts.' 
              : 'Opera futuros cripto, forex y materias primas. Spreads puros desde 0.0 pips, ejecución rápida a <15ms y retiros de beneficios.'}
          </p>
        </motion.div>

        {/* 3. Cuadrícula 2x2 de Características de Mercado con entrada escalonada */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-xl"
        >
          {/* Badge 1: $500,000 Capital */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-black/45 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-black/60">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-mono font-bold text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                $500,000 USD
              </span>
              <span className="text-slate-300 text-[11px] sm:text-xs font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'Available funding' : 'Capital de fondeo'}
              </span>
            </div>
          </div>

          {/* Badge 2: Spreads Raw 0.0 */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-black/45 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-black/60">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-mono font-bold text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'Raw Spreads 0.0' : 'Spreads Raw 0.0'}
              </span>
              <span className="text-slate-300 text-[11px] sm:text-xs font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'Zero artificial markup' : 'Cero sobrecostes ocultos'}
              </span>
            </div>
          </div>

          {/* Badge 3: Ejecución Sub-15ms */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-black/45 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-black/60">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-mono font-bold text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'Execution < 15ms' : 'Ejecución < 15ms'}
              </span>
              <span className="text-slate-300 text-[11px] sm:text-xs font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'High-speed order feed' : 'Feed de alta velocidad'}
              </span>
            </div>
          </div>

          {/* Badge 4: Cripto 24/7 & Multiactivo */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-black/45 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-black/60">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-mono font-bold text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? 'Crypto 24/7 & FX' : 'Cripto 24/7 & FX'}
              </span>
              <span className="text-slate-300 text-[11px] sm:text-xs font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {isEn ? '+100 live instruments' : '+100 activos en vivo'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 4. Botón de Acción Principal Dorado: Entrada con pop */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-10"
        >
          <button
            onClick={handleScrollToPrograms}
            className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-amber-200/90 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <span>{isEn ? 'EXPLORE ACCOUNTS' : 'EXPLORAR CUENTAS'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
          </button>
        </motion.div>

      </motion.div>
    </section>
  );
};
