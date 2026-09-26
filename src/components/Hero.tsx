import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  LogIn, 
  Compass,
  Cpu
} from 'lucide-react';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { HeroScrollCanvas } from './HeroScrollCanvas';

interface HeroProps {
  onOpenTerminal?: () => void;
  onExploreModules?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreModules }) => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const rotatingWords = t.hero.rotatingWords;

  const [wordIndex, setWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(90);

  useEffect(() => {
    const targetWord = rotatingWords[wordIndex] || rotatingWords[0];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayWord(targetWord.substring(0, displayWord.length + 1));
        setTypingSpeed(85);

        if (displayWord.length + 1 === targetWord.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayWord(targetWord.substring(0, displayWord.length - 1));
        setTypingSpeed(50);

        if (displayWord.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayWord, isDeleting, wordIndex, typingSpeed, rotatingWords]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleScrollToModules = () => {
    if (onExploreModules) {
      onExploreModules();
    } else {
      const el = document.getElementById('multi-venue');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[105vh] w-full flex flex-col justify-between items-center pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          GPU SCROLL-DRIVEN VIDEO SEQUENCE CANVAS:
          Scrubea los 80 frames del video al hacer scroll en el viewport
         ═══════════════════════════════════════════════════════════════ */}
      <HeroScrollCanvas totalFrames={80} />

      {/* Main Central Hero Content */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 max-w-[1360px] mx-auto flex flex-col items-center my-auto">
        
        {/* Monumental Headline: Futuristic, Wide Tracking, Zero Layout Shift */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
            
            {/* Subtle Brand Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-widest uppercase text-slate-300">
                Institutional Execution Node · v5.0
              </span>
            </div>

            {/* Massive Display Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.08] sm:leading-[1.03] text-balance drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
              <span>{t.hero.headlineStart} </span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_35px_rgba(244,114,182,0.4)] whitespace-nowrap">
                {displayWord}
                <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-11 md:h-14 lg:h-16 bg-[#F472B6] animate-pulse ml-1 align-middle" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance font-light drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {t.hero.subheadline}
            </p>

            {/* Futuristic Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
              <button
                onClick={handleLoginClick}
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_10px_35px_rgba(244,114,182,0.45)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 group"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleScrollToModules}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-full flex items-center justify-center gap-2 cursor-pointer border border-white/15 backdrop-blur-xl transition-all active:scale-95"
              >
                <Compass className="w-4 h-4 text-slate-300" />
                <span>Explorar Ecosistema</span>
              </button>
            </div>

          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════
            HIGH RESOLUTION TERMINAL MOCKUP (BORDERLESS CINEMATIC FINISH):
            Sin bordes blancos genéricos de IA, con iluminación ambiental
           ═══════════════════════════════════════════════════════════════ */}
        <ScrollReveal direction="up" delay={200} className="w-full mt-12 sm:mt-16">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95)] bg-[#07090F]">
            {/* Ambient backlight glow */}
            <div className="absolute -inset-1 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl sm:rounded-3xl" />
            
            <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[560px] w-full overflow-hidden">
              <img 
                src={commandDeckVisualPath} 
                alt="Global City Holographic Command Deck"
                className="w-full h-full object-cover object-center filter contrast-110 brightness-100 saturate-[1.1]"
                referrerPolicy="no-referrer"
              />
              
              {/* Live Telemetry Floating Micro-Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-[#07090F]/90 backdrop-blur-2xl p-3 sm:p-4 rounded-2xl max-w-sm border border-white/10 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FBBF24] via-[#F472B6] to-[#60A5FA] flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span>{t.hero.liveTelemetry.title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  </div>
                  <div className="text-slate-300 mt-0.5 leading-snug text-[11px]">
                    {t.hero.liveTelemetry.desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM METRICS BAR (ESTILO NUORBIT REFERENCIA):
          Separado por divisores verticales sutiles, flotando sobre fondo oscuro
         ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-8 lg:px-12 relative z-20 mt-10 sm:mt-14 max-w-[1360px] mx-auto">
        <div className="w-full py-4 sm:py-5 px-6 sm:px-10 rounded-2xl sm:rounded-full bg-white/[0.02] border-t border-white/10 backdrop-blur-xl grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center justify-between text-center lg:text-left">
          
          {/* Stat 1 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-3">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono-nums text-white tracking-tight">
              $140M+
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">
              24h Volume
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-3 lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono-nums text-[#10B981] tracking-tight">
              &lt; 1.2 ms
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">
              L2 Latency
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-3 lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono-nums text-white tracking-tight">
              6 Venues
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">
              DMA Gateways
            </span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-3 lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono-nums text-[#FBBF24] tracking-tight">
              99.98%
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">
              Uptime SLA
            </span>
          </div>

        </div>
      </div>

    </section>
  );
};
