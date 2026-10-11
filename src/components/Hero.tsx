import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import pepeHeroImg from '../assets/images/pepeHero.webp';

interface HeroProps {
  onOpenTerminal?: () => void;
  onNavigateToPlans?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPlans }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  // Coordenadas normalizadas del mouse (-1 a 1) para efecto Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Suavizado elástico con física de resortes cinemáticos
  const springConfig = { damping: 26, stiffness: 110, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformaciones Parallax de capas (profundidad 2.5D)
  // Pepe (Capa frontal izquierda con inclinación 3D)
  const pepeX = useTransform(smoothX, [-1, 1], [-22, 22]);
  const pepeY = useTransform(smoothY, [-1, 1], [-16, 16]);
  const pepeRotate = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);
  const glowX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const glowY = useTransform(smoothY, [-1, 1], [-25, 25]);

  // Texto (Capa derecha con movimiento en profundidad complementaria)
  const textX = useTransform(smoothX, [-1, 1], [8, -8]);
  const textY = useTransform(smoothY, [-1, 1], [6, -6]);

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
      className="relative w-full h-full text-white select-none flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-12 overflow-hidden pointer-events-auto"
    >
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-14 pt-12 sm:pt-4 my-auto">
        
        {/* ========================================================================= */}
        {/* LADO IZQUIERDO: PEPE HERO CON EFECTO PARALLAX INTERACTIVO                 */}
        {/* ========================================================================= */}
        <motion.div 
          style={{ x: pepeX, y: pepeY, rotateZ: pepeRotate }}
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[48%] xl:w-[50%] flex items-center justify-center order-2 lg:order-1 relative select-none will-change-transform"
        >
          {/* Halo sutil de luz atmosférica violeta/ámbar detrás de Pepe */}
          <motion.div 
            style={{ x: glowX, y: glowY }}
            className="absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-[#6366F1]/20 via-[#A855F7]/15 to-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none -z-10"
          />

          {/* Imagen de Pepe Trader en su Setup */}
          <img 
            src={pepeHeroImg} 
            alt="Eklipse Funded Pro Trader Pepe" 
            className="w-full max-w-[340px] sm:max-w-[460px] md:max-w-[520px] lg:max-w-[560px] xl:max-w-[620px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.92)] transition-transform duration-300 pointer-events-none"
            loading="eager"
          />
        </motion.div>

        {/* ========================================================================= */}
        {/* LADO DERECHO: HERO HEADLINE, SUBTITLE Y CTAs                              */}
        {/* ========================================================================= */}
        <motion.div 
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[52%] xl:w-[50%] flex flex-col justify-center items-start text-left space-y-3.5 sm:space-y-5 order-1 lg:order-2 will-change-transform"
        >
          
          {/* Overline Pre-title */}
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
            {isEn ? 'TRADE YOUR SKILLS. GROW YOUR CAPITAL.' : 'OPERA TU TALENTO. CRECE TU CAPITAL.'}
          </div>

          {/* Master Visual Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] font-black tracking-[-0.03em] leading-[1.06] text-white">
            <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
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
    </section>
  );
};
