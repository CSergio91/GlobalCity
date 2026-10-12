import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import pepeHeroImg from '../assets/images/pepeHero.webp';
import cosmicDebrisImg from '../assets/images/cosmic-debris-overlay.webp';

interface HeroProps {
  onOpenTerminal?: () => void;
  onNavigateToPlans?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPlans }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  // ============================================================================
  // 1. MOUSE PARALLAX (Resortes físicos elásticos de alta fidelidad)
  // ============================================================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 110, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Pepe (Movimiento en contraposición al cursor con sutil inclinación 3D)
  const pepeMouseX = useTransform(smoothX, [-1, 1], [-26, 26]);
  const pepeMouseY = useTransform(smoothY, [-1, 1], [-18, 18]);
  const pepeRotate = useTransform(smoothX, [-1, 1], [-1.6, 1.6]);
  const glowX = useTransform(smoothX, [-1, 1], [-35, 35]);
  const glowY = useTransform(smoothY, [-1, 1], [-25, 25]);

  // Texto (Movimiento en profundidad complementaria para crear 2.5D)
  const textMouseX = useTransform(smoothX, [-1, 1], [10, -10]);
  const textMouseY = useTransform(smoothY, [-1, 1], [8, -8]);

  // Capa Frontal Cósmica de Escombros / Debris (Mayor velocidad focal 2.5D)
  const debrisMouseX = useTransform(smoothX, [-1, 1], [-48, 48]);
  const debrisMouseY = useTransform(smoothY, [-1, 1], [-32, 32]);
  const debrisRotate = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);

  // ============================================================================
  // 2. SCROLL PARALLAX (Al hacer scroll se hunde hacia la derecha/abajo)
  // ============================================================================
  const { scrollY } = useScroll();
  const scrollPepeX = useTransform(scrollY, [0, 500], [0, 90]);
  const scrollPepeY = useTransform(scrollY, [0, 500], [0, 110]);
  const scrollPepeScale = useTransform(scrollY, [0, 500], [1, 0.94]);
  const scrollPepeOpacity = useTransform(scrollY, [0, 450], [1, 0.2]);

  const scrollDebrisY = useTransform(scrollY, [0, 500], [0, 130]);
  const scrollDebrisOpacity = useTransform(scrollY, [0, 450], [1, 0.15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((e.clientX - centerX) / centerX);
      mouseY.set((e.clientY - centerY) / centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleGetFunded = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else navigate('/login');
    }
  };

  const handleViewPlans = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else navigate('/login');
    }
  };

  return (
    <section 
      id="hero"
      className="relative w-full h-full text-white select-none flex items-center justify-start px-4 sm:px-8 lg:px-14 xl:px-20 py-4 sm:py-12 overflow-hidden pointer-events-auto"
    >
      <div className="w-full max-w-7xl mx-auto relative z-10 flex items-center justify-between my-auto">
        
        {/* ========================================================================= */}
        {/* LADO IZQUIERDO: HERO HEADLINE, SUBTITLE Y CTAs                            */}
        {/* ========================================================================= */}
        <motion.div 
          style={{ x: textMouseX, y: textMouseY }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:max-w-xl xl:max-w-2xl flex flex-col justify-center items-start text-left space-y-4 sm:space-y-6 pt-12 sm:pt-0 z-30 will-change-transform"
        >
          
          {/* Overline Pre-title */}
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
            {isEn ? 'TRADE YOUR SKILLS. GROW YOUR CAPITAL.' : 'OPERA TU TALENTO. CRECE TU CAPITAL.'}
          </div>

          {/* Master Visual Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] font-black tracking-[-0.03em] leading-[1.06] text-white">
            <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              {isEn ? 'Your Trading' : 'Tu Trading'}
            </span>
            <span className="block mt-0.5 sm:mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#C084FC] to-[#A855F7] drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]">
              {isEn ? 'Next Level' : 'Siguiente Nivel'}
            </span>
          </h1>

          {/* Clean Subtitle Paragraph */}
          <p className="text-xs sm:text-base md:text-lg text-slate-300/85 font-normal leading-relaxed max-w-lg drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            {isEn 
              ? 'Eklipse Funded gives you real capital, clear rules and the right conditions to trade without limits.'
              : 'Eklipse Funded te da capital real, reglas claras y las mejores condiciones para operar sin límites.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Primary Pill Button */}
            <button
              onClick={handleGetFunded}
              className="px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-semibold text-white bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:brightness-110 shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.65)] transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 group"
            >
              <span>{isEn ? 'Get Funded' : 'Obtener Fondeo'}</span>
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Glass Pill Button */}
            <button
              onClick={handleViewPlans}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-medium text-white/95 bg-white/[0.04] hover:bg-white/[0.09] border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <span>{isEn ? 'View Plans' : 'Ver Planes'}</span>
            </button>
          </div>

          {/* Bottom 3 Minimalist Features */}
          <div className="pt-3 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-5 max-w-xl border-t border-white/10 mt-2 sm:mt-4 w-full">
            
            {/* Feature 1: Instant Funding */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2.5">
              <div className="p-1 sm:p-1.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Instant Funding' : 'Fondeo Inmediato'}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-slate-400 hidden sm:block">
                  {isEn ? 'Start trading today' : 'Comienza hoy'}
                </div>
              </div>
            </div>

            {/* Feature 2: Transparent Rules */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2.5">
              <div className="p-1 sm:p-1.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Transparent Rules' : 'Reglas Claras'}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-slate-400 hidden sm:block">
                  {isEn ? 'No hidden traps' : 'Sin trampas'}
                </div>
              </div>
            </div>

            {/* Feature 3: Global Access */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-2.5">
              <div className="p-1 sm:p-1.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Global Access' : 'Acceso Global'}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-slate-400 hidden sm:block">
                  {isEn ? 'Trade anywhere' : 'Opera 24/7'}
                </div>
              </div>
            </div>

          </div>

        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* LADO DERECHO: PEPE HERO ANCLADO AL BORDE DERECHO E INFERIOR               */}
      {/* (Borde derecho escondido en lateral, borde inferior debajo de pantalla)    */}
      {/* ========================================================================= */}
      <motion.div 
        style={{ 
          x: scrollPepeX, 
          y: scrollPepeY, 
          scale: scrollPepeScale, 
          opacity: scrollPepeOpacity 
        }}
        className="absolute -right-6 sm:-right-8 md:-right-10 lg:-right-6 xl:-right-4 -bottom-4 sm:-bottom-6 lg:-bottom-8 xl:-bottom-10 z-10 pointer-events-none select-none will-change-transform"
      >
        {/* Contenedor con Mouse Parallax reactivo */}
        <motion.div
          style={{ x: pepeMouseX, y: pepeMouseY, rotateZ: pepeRotate }}
          initial={{ opacity: 0, x: 60, y: 40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative flex items-end justify-end"
        >
          {/* Halo de luz atmosférica cósmica detrás del Battlestation */}
          <motion.div 
            style={{ x: glowX, y: glowY }}
            className="absolute -inset-10 bg-gradient-to-tl from-[#6366F1]/20 via-[#A855F7]/15 to-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none -z-10"
          />

          {/* Imagen de Pepe Battlestation anclada al lateral e inferior */}
          <img 
            src={pepeHeroImg} 
            alt="Eklipse Funded Pro Trader Pepe Battlestation" 
            className="w-[320px] sm:w-[440px] md:w-[540px] lg:w-[640px] xl:w-[780px] 2xl:w-[880px] max-h-[82vh] object-contain object-right-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
            loading="eager"
          />
        </motion.div>
      </motion.div>

      {/* ========================================================================= */}
      {/* CAPA SUPERIOR: COSMIC DEBRIS OVERLAY (PARALLAX + REPOSO FLOTANTE 2.5D)    */}
      {/* Capa que cubre a todo lo ancho por encima de Pepe y el fondo en 16:9      */}
      {/* ========================================================================= */}
      <motion.div 
        style={{ 
          y: scrollDebrisY,
          opacity: scrollDebrisOpacity 
        }}
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-20 overflow-hidden"
      >
        {/* Parallax conducido por el cursor (con escala adaptativa y margen de seguridad por dispositivo) */}
        <motion.div
          style={{ 
            x: debrisMouseX, 
            y: debrisMouseY, 
            rotateZ: debrisRotate 
          }}
          className="w-full h-full flex items-center justify-center scale-105 sm:scale-108 md:scale-110 will-change-transform"
        >
          {/* Animación continua de levitación cósmica en reposo (idle floating) */}
          <motion.div
            animate={{
              x: [0, 10, -8, 0],
              y: [0, -10, 10, 0],
              rotate: [0, 0.4, -0.4, 0]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Capa de Escombros Cósmicos Adaptativa: Mantiene los asteroides visibles y sin cortes en móviles, tablets y monitores */}
            <div className="relative w-full h-full overflow-hidden pointer-events-none select-none">
              {/* Cúmulo de asteroides izquierdo: estirado y con sangrado negativo a la izquierda para que nunca se vea el corte al oscilar a la derecha */}
              <img 
                src={cosmicDebrisImg} 
                alt="Cosmic Debris Left Cluster" 
                className="absolute inset-y-0 -left-12 sm:-left-8 md:-left-4 lg:left-0 h-full w-[220vw] sm:w-[170vw] md:w-[135vw] lg:w-full max-w-none object-cover object-left pointer-events-none select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                loading="eager"
              />
              {/* Cúmulo de asteroides derecho: estirado y con sangrado a la derecha sobre Pepe */}
              <img 
                src={cosmicDebrisImg} 
                alt="Cosmic Debris Right Cluster" 
                className="absolute inset-y-0 -right-12 sm:-right-8 md:-right-4 lg:right-0 h-full w-[220vw] sm:w-[170vw] md:w-[135vw] lg:w-full max-w-none object-cover object-right pointer-events-none select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                loading="eager"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

    </section>
  );
};
