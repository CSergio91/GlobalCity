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
      className="min-h-screen w-full flex flex-col justify-center items-start pt-32 sm:pt-40 pb-20 sm:pb-28 relative select-none bg-transparent"
    >
      {/* Left-Aligned Display: Spacious, Balanced, Framing the Cyberpunk City on the Right */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 max-w-[1360px] mx-auto flex flex-col items-start text-left my-auto">
          
        {/* Refined Headline: Sleek, Balanced, Left-Aligned with Zero Layout Shift */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] sm:leading-[1.10] max-w-2xl lg:max-w-3xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
          <span className="block">{t.hero.headlineStart}</span>
          <span className="block min-h-[1.25em] mt-2 sm:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_35px_rgba(244,114,182,0.45)] whitespace-nowrap">
            <span>{displayWord || '\u00A0'}</span>
            <span className="inline-block w-0.5 sm:w-1 h-[0.75em] bg-[#F472B6] animate-pulse ml-1.5 align-middle" />
          </span>
        </h1>

        {/* Subtitle: Left Aligned with Generous Breathing Room */}
        <p className="mt-5 sm:mt-8 text-sm sm:text-base md:text-lg text-slate-300/90 max-w-xl leading-relaxed font-light drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
          {t.hero.subheadline}
        </p>

        {/* Action Buttons: Left Aligned with Spacious Padding */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-5 w-full sm:w-auto">
          <button
            onClick={handleLoginClick}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_10px_35px_rgba(244,114,182,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Login</span>
            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleScrollToModules}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200 hover:text-white bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center gap-2 cursor-pointer border border-white/20 backdrop-blur-xl transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-slate-300" />
            <span>Explorar Ecosistema</span>
          </button>
        </div>

      </div>
    </section>
  );
};
