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
        
        {/* Floating Luminous Institutional Plaque */}
        <div className="max-w-3xl backdrop-blur-xl bg-white/85 p-6 sm:p-10 lg:p-12 rounded-3xl border border-purple-200/70 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.12)]">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-300/60 mb-5 sm:mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#5B21B6]">
              Global City Funding · Prop Firm con Terminal Propia
            </span>
          </div>

          {/* Refined Headline: High-Contrast Obsidian Black + Luminous Purple Gradient */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#090A10] leading-[1.15] sm:leading-[1.10] text-balance">
            <span className="block">{t.hero.headlineStart}</span>
            <span className="block min-h-[1.2em] mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#4F46E5] drop-shadow-[0_4px_20px_rgba(124,58,237,0.25)] whitespace-nowrap">
              <span>{displayWord || '\u00A0'}</span>
              <span className="inline-block w-1 sm:w-1.5 h-[0.75em] bg-[#7C3AED] animate-pulse ml-1.5 align-middle" />
            </span>
          </h1>

          {/* Subtitle: High Legibility Slate */}
          <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl">
            {t.hero.subheadline}
          </p>

          {/* Action Buttons: Obsidian Black & Electric Purple */}
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-start gap-4 w-full sm:w-auto">
            <button
              onClick={handleStartChallenge}
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#090A10] via-[#1E1B4B] to-[#7C3AED] hover:brightness-110 rounded-full shadow-[0_10px_35px_rgba(124,58,237,0.30)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 group"
            >
              <Trophy className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform" />
              <span>{t.hero.openTerminalBtn}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleScrollToModules}
              className="w-full sm:w-auto px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 hover:text-[#5B21B6] bg-white hover:bg-purple-50 rounded-full flex items-center justify-center gap-2 cursor-pointer border border-purple-200/80 shadow-sm transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#7C3AED]" />
              <span>{t.hero.exploreModulesBtn}</span>
            </button>
          </div>

          {/* 4 Feature Telemetry Pillars in Clean White Frosted Cards */}
          <div className="mt-8 pt-7 border-t border-purple-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{t.hero.telemetry.t1Title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{t.hero.telemetry.t1Desc}</p>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{t.hero.telemetry.t2Title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{t.hero.telemetry.t2Desc}</p>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Share2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{t.hero.telemetry.t3Title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{t.hero.telemetry.t3Desc}</p>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{t.hero.telemetry.t4Title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{t.hero.telemetry.t4Desc}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
