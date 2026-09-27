import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Trophy, 
  Compass,
  CheckCircle2,
  Cpu,
  Zap,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HeroProps {
  onOpenTerminal?: () => void;
  onExploreModules?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTerminal, onExploreModules }) => {
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

  const handleStartChallenge = () => {
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      navigate('/login');
    }
  };

  const handleScrollToModules = () => {
    if (onExploreModules) {
      onExploreModules();
    } else {
      const el = document.getElementById('horizontal-showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero"
      className="min-h-screen w-full flex flex-col justify-center items-start pt-28 sm:pt-36 pb-16 sm:pb-24 relative select-none bg-transparent"
    >
      {/* Container with Frosted Luminous Plate for Supreme Contrast and Luxury Feel */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 max-w-[1360px] mx-auto flex flex-col items-start text-left my-auto">
        
        {/* Floating Transparent Glass Cockpit Plaque (Real Glass Simulation + Retro-Brutalist Shadow) */}
        <div className="max-w-3xl backdrop-blur-2xl bg-slate-950/45 sm:bg-slate-950/50 p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl border-2 border-white/20 shadow-[6px_6px_0px_rgba(124,58,237,0.35),0_25px_60px_rgba(0,0,0,0.6)]">
          
          {/* Retro Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/70 border border-purple-400/40 mb-5 sm:mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
              [● GLOBAL CITY FUNDING // TERMINAL PROPIA]
            </span>
          </div>

          {/* Refined Headline: Crisp White + Retro Neon Violet/Amethyst Gradient */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] sm:leading-[1.10] text-balance drop-shadow-md">
            <span className="block">{t.hero.headlineStart}</span>
            <span className="block min-h-[1.2em] mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C084FC] to-[#818CF8] drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] whitespace-nowrap">
              <span>{displayWord || '\u00A0'}</span>
              <span className="inline-block w-1 sm:w-1.5 h-[0.75em] bg-[#A78BFA] animate-pulse ml-1.5 align-middle shadow-[0_0_10px_#A78BFA]" />
            </span>
          </h1>

          {/* Subtitle: High Legibility Slate-200 */}
          <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
            {t.hero.subheadline}
          </p>

          {/* Action Buttons: Retro-Brutalist Tactile Buttons */}
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-start gap-4 w-full sm:w-auto">
            <button
              onClick={handleStartChallenge}
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 text-xs sm:text-sm font-mono font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:brightness-110 rounded-xl border border-purple-300/50 shadow-[3px_3px_0px_#090A10,0_0_20px_rgba(124,58,237,0.45)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group"
            >
              <Trophy className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span>{t.hero.openTerminalBtn}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleScrollToModules}
              className="w-full sm:w-auto px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-white hover:text-purple-200 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-white/20 shadow-[3px_3px_0px_rgba(0,0,0,0.4)] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-purple-300" />
              <span>{t.hero.exploreModulesBtn}</span>
            </button>
          </div>

          {/* The Bottom Telemetry Panel (Simulación de Vidrio con Blur + Retro Brutalism) */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/15 shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
              <span className="text-[9px] font-mono text-[#A78BFA] uppercase tracking-wider mb-1 font-bold">[ 01 // OMS ]</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{t.hero.telemetry.t1Title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">{t.hero.telemetry.t1Desc}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
              <span className="text-[9px] font-mono text-[#A78BFA] uppercase tracking-wider mb-1 font-bold">[ 02 // SPLIT ]</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{t.hero.telemetry.t2Title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">{t.hero.telemetry.t2Desc}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
              <span className="text-[9px] font-mono text-[#A78BFA] uppercase tracking-wider mb-1 font-bold">[ 03 // CEX ]</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Share2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{t.hero.telemetry.t3Title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">{t.hero.telemetry.t3Desc}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
              <span className="text-[9px] font-mono text-[#A78BFA] uppercase tracking-wider mb-1 font-bold">[ 04 // RISK ]</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{t.hero.telemetry.t4Title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">{t.hero.telemetry.t4Desc}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
