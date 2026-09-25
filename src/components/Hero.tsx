import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Cpu
} from 'lucide-react';
import skylineVisualPath from '../assets/images/global_city_panoramic_skyline_1790347023744.jpg';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import officialLogoImg from '../assets/images/global_city_official_exact_logo_1790349385972.jpg';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onOpenTerminal: () => void;
  onExploreModules: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTerminal, onExploreModules }) => {
  const { t } = useLanguage();
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

  return (
    <section id="hero" className="relative min-h-screen w-full flex flex-col justify-center items-center pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden">
      {/* Immersive Panoramic City Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={skylineVisualPath} 
          alt="Global City Panoramic Horizon" 
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.2] saturate-[1.25] scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft atmospheric gradient masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070B]/60 via-transparent to-[#06070B]/60" />
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 max-w-[1440px] mx-auto flex flex-col items-center">
        
        {/* GC Intertwined Monogram Circular Crest */}
        <ScrollReveal direction="down" delay={50}>
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group cursor-pointer">
              {/* Neon Sunset Glow */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-[#3B82F6]/50 via-[#EC4899]/50 to-[#F59E0B]/40 blur-2xl opacity-85 group-hover:opacity-100 transition-opacity" />
              
              {/* Circular Medallion featuring G on left & mirrored C on right */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[2.5px] bg-gradient-to-tr from-[#60A5FA] via-[#F472B6] to-[#FBBF24] shadow-[0_0_50px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img 
                  src={officialLogoImg} 
                  alt="Global City Official Emblem" 
                  className="w-full h-full object-cover rounded-full filter contrast-125 brightness-110 scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Monumental Headline: Stable, Zero Layout-Shift, Clean Single-Word Animation */}
        <ScrollReveal direction="up" delay={150}>
          <div className="text-center max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] font-black tracking-tight text-white leading-[1.12] sm:leading-[1.08] text-balance text-shadow-hero drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
              <span>{t.hero.headlineStart} </span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_30px_rgba(244,114,182,0.45)] min-w-[130px] sm:min-w-[200px] md:min-w-[260px] lg:min-w-[320px] text-left align-baseline whitespace-nowrap">
                {displayWord}
                <span className="inline-block w-1 sm:w-1.5 h-6 sm:h-9 md:h-12 bg-[#F472B6] animate-pulse ml-1 align-middle" />
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto leading-normal text-balance font-normal text-shadow-subtle drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] text-illuminate">
              {t.hero.subheadline}
            </p>

            {/* Liquid Stretch Decision Buttons */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md sm:max-w-none mx-auto">
              <button
                onClick={onOpenTerminal}
                className="btn-liquid w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] hover:brightness-110 rounded-2xl shadow-[0_10px_40px_rgba(236,72,153,0.45)] flex items-center justify-center gap-3 cursor-pointer border border-white/30"
              >
                <Terminal className="w-5 h-5 text-white" />
                <span>{t.hero.openTerminalBtn}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onExploreModules}
                className="btn-liquid w-full sm:w-auto px-8 sm:px-9 py-4 sm:py-5 text-xs sm:text-sm font-semibold text-white bg-black/40 hover:bg-black/60 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer border border-white/25 backdrop-blur-xl shadow-xl"
              >
                <span>{t.hero.exploreModulesBtn}</span>
              </button>
            </div>

            {/* Architectural Floating Telemetry Line */}
            <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/20 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-left">
              <div className="relative pl-4 border-l-2 border-[#FBBF24]/70 group">
                <div className="text-xs uppercase font-mono tracking-widest text-[#FBBF24] font-bold">Protocol</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 text-shadow-subtle text-illuminate">{t.hero.telemetry.t1Title}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium group-hover:text-white transition-colors">{t.hero.telemetry.t1Desc}</div>
              </div>

              <div className="relative pl-4 border-l-2 border-[#60A5FA]/70 group">
                <div className="text-xs uppercase font-mono tracking-widest text-[#60A5FA] font-bold">Execution</div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono-nums mt-1 text-shadow-subtle text-illuminate">{t.hero.telemetry.t2Title}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium group-hover:text-white transition-colors">{t.hero.telemetry.t2Desc}</div>
              </div>

              <div className="relative pl-4 border-l-2 border-[#F472B6]/70 group">
                <div className="text-xs uppercase font-mono tracking-widest text-[#F472B6] font-bold">Mobile Link</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 text-shadow-subtle text-illuminate">{t.hero.telemetry.t3Title}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium group-hover:text-white transition-colors">{t.hero.telemetry.t3Desc}</div>
              </div>

              <div className="relative pl-4 border-l-2 border-white/50 group">
                <div className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">Cross-Asset</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 text-shadow-subtle text-illuminate">{t.hero.telemetry.t4Title}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium group-hover:text-white transition-colors">{t.hero.telemetry.t4Desc}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* High-Resolution Terminal Command Deck Feature Mockup */}
        <ScrollReveal direction="up" delay={250} className="w-full">
          <div className="mt-14 sm:mt-20 w-full rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-white/30 via-white/10 to-transparent border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="relative rounded-[18px] sm:rounded-[22px] overflow-hidden aspect-[16/10] sm:aspect-[16/9] max-h-[640px] w-full bg-[#090A0F]">
              <img 
                src={commandDeckVisualPath} 
                alt="Global City Holographic Command Deck"
                className="w-full h-full object-cover object-center filter contrast-115 brightness-105 saturate-[1.1]"
                referrerPolicy="no-referrer"
              />
              
              {/* Live Telemetry Floating Bar */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-[#07090F]/90 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl max-w-lg border border-white/20 shadow-2xl flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FBBF24] via-[#F472B6] to-[#818CF8] flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span>{t.hero.liveTelemetry.title}</span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  </div>
                  <div className="text-slate-200 mt-0.5 sm:mt-1 leading-snug text-[11px] sm:text-xs">
                    {t.hero.liveTelemetry.desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
