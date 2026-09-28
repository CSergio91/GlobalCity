import React from 'react';
import { 
  Flame, 
  ChevronRight, 
  ShieldCheck,
  Coins,
  Zap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HeroProps {
  onOpenTerminal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTerminal }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const [wordIndex, setWordIndex] = React.useState(0);
  const [isFlipping, setIsFlipping] = React.useState(false);

  const spanishWords = ['Challenge', 'Reglas Ocultas', 'Estrés', 'Presión', 'Miedo'];
  const englishWords = ['Challenges', 'Hidden Rules', 'Stress', 'Pressure', 'Fear'];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % spanishWords.length);
        setIsFlipping(false);
      }, 250);
    }, 2500);
    return () => clearInterval(interval);
  }, [spanishWords.length]);

  const handleScrollToPrograms = () => {
    const el = document.getElementById('programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const currentDynamicWord = isEn ? englishWords[wordIndex] : spanishWords[wordIndex];

  return (
    <section 
      id="hero"
      className="min-h-screen w-full flex flex-col justify-center items-center py-28 sm:py-36 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center space-y-10 sm:space-y-12">
        
        {/* 1. Main Headline with Centered Word Switcher and No Top Tags */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          <span className="block whitespace-normal sm:whitespace-nowrap">
            {isEn ? 'Instant Crypto Funding.' : 'Fondeo Cripto Inmediato.'}
          </span>
          
          <div className="grid grid-cols-2 items-baseline mt-3 sm:mt-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-snug w-full max-w-2xl mx-auto">
            <span className="text-right pr-2 sm:pr-4 text-white/90 select-none">
              {isEn ? 'Zero' : 'Sin'}
            </span>
            <span className="text-left pl-2 sm:pl-4 whitespace-nowrap overflow-visible">
              <span 
                className={`inline-block pb-3 pt-1 transition-all duration-300 ease-out text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-200 to-amber-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.65)] ${
                  isFlipping ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
                }`}
              >
                {currentDynamicWord}.
              </span>
            </span>
          </div>
        </h1>

        {/* 2. Action Button: Single Centered Primary CTA */}
        <div className="flex items-center justify-center w-full pt-2">
          <button
            onClick={handleScrollToPrograms}
            className="w-full sm:w-auto px-12 sm:px-16 py-4 sm:py-5 text-sm sm:text-base font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl border border-amber-200/60 shadow-[4px_4px_0px_#000000,0_0_40px_rgba(245,158,11,0.45)] flex items-center justify-center gap-3 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group hover:scale-[1.02]"
          >
            <Flame className="w-5 h-5 text-slate-950 group-hover:scale-125 transition-transform" />
            <span>{isEn ? 'Get Instant Funding' : 'Obtener Fondeo Inmediato'}</span>
            <ChevronRight className="w-5 h-5 text-slate-950/80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
