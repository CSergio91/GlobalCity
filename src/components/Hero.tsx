import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  LogIn, 
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

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
      className="min-h-screen w-full flex flex-col justify-between items-center pt-24 sm:pt-32 pb-6 sm:pb-8 relative select-none bg-transparent"
    >
      {/* Left-Aligned Display: Framing the Cyberpunk City on the Right */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 max-w-[1360px] mx-auto flex flex-col items-start text-left my-auto">
          
          {/* Refined Headline: Sleek, Balanced, Left-Aligned with Zero Layout Shift */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] sm:leading-[1.10] max-w-2xl lg:max-w-3xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
            <span className="block">{t.hero.headlineStart}</span>
            <span className="block min-h-[1.2em] mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_35px_rgba(244,114,182,0.45)] whitespace-nowrap">
              <span>{displayWord || '\u00A0'}</span>
              <span className="inline-block w-0.5 sm:w-1 h-[0.75em] bg-[#F472B6] animate-pulse ml-1.5 align-middle" />
            </span>
          </h1>

          {/* Subtitle: Left Aligned */}
          <p className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base text-slate-300 max-w-lg leading-relaxed font-light drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
            {t.hero.subheadline}
          </p>

          {/* Action Buttons: Left Aligned */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleLoginClick}
              className="w-full sm:w-auto px-7 sm:px-9 py-3 text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_10px_35px_rgba(244,114,182,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleScrollToModules}
              className="w-full sm:w-auto px-6 sm:px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200 hover:text-white bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center gap-2 cursor-pointer border border-white/20 backdrop-blur-xl transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-slate-300" />
              <span>Explorar Ecosistema</span>
            </button>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            BOTTOM METRICS BAR (ESTILO EXACTO NUORBIT REFERENCIA):
            Separado por divisores verticales sutiles, flotando sobre fondo de cristal
           ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-20 max-w-[1360px] mx-auto">
          <div className="w-full py-3.5 sm:py-4 px-6 sm:px-10 rounded-2xl sm:rounded-full bg-black/40 border-t border-white/15 backdrop-blur-2xl grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center justify-between text-center lg:text-left shadow-2xl">
            
            {/* Stat 1 */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-2.5">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black font-mono-nums text-white tracking-tight drop-shadow-md">
                $140M+
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-300 font-medium">
                24h Volume
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-2.5 lg:border-l lg:border-white/10 lg:pl-6">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black font-mono-nums text-[#10B981] tracking-tight drop-shadow-md">
                &lt; 1.2 ms
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-300 font-medium">
                L2 Latency
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-2.5 lg:border-l lg:border-white/10 lg:pl-6">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black font-mono-nums text-white tracking-tight drop-shadow-md">
                6 Venues
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-300 font-medium">
                Gateways DMA
              </span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-1 sm:gap-2.5 lg:border-l lg:border-white/10 lg:pl-6">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black font-mono-nums text-[#FBBF24] tracking-tight drop-shadow-md">
                99.98%
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-300 font-medium">
                Uptime SLA
              </span>
            </div>

          </div>
        </div>

    </section>
  );
};
