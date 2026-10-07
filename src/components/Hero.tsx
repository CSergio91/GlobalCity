import React from 'react';
import { 
  Flame, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HeroProps {
  onOpenTerminal?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
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
      }, 240);
    }, 2800);
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
      className="min-h-screen w-full flex flex-col justify-center items-center py-24 sm:py-36 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center space-y-8 sm:space-y-12">
        
        {/* Main Balanced Headline - 100% Mathematically & Visually Centered */}
        <div className="w-full text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_6px_35px_rgba(0,0,0,0.95)]">
            <span className="block">
              {isEn ? 'Instant Crypto Funding' : 'Fondeo Cripto Inmediato'}
            </span>
            
            {/* Rock-solid anchored split line: 'Sin' / 'Zero' is pinned to center and never jitters or moves */}
            <div className="grid grid-cols-2 items-baseline mt-2 sm:mt-4 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black w-full max-w-xl sm:max-w-2xl mx-auto">
              <div className="text-right pr-2 sm:pr-3">
                <span className="text-white/95 select-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
                  {isEn ? 'Zero' : 'Sin'}
                </span>
              </div>
              <div className="text-left pl-2 sm:pl-3 whitespace-nowrap overflow-visible">
                <span 
                  className={`inline-block pb-1 pt-0.5 transition-all duration-300 ease-out text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] ${
                    isFlipping ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
                  }`}
                >
                  {currentDynamicWord}.
                </span>
              </div>
            </div>
          </h1>
        </div>

        {/* Persuasive Floating Subheadline (Zero background containers, generous breathing room) */}
        <p className="text-sm sm:text-base md:text-lg text-slate-200/90 font-normal max-w-2xl sm:max-w-3xl mx-auto leading-relaxed sm:leading-loose drop-shadow-[0_3px_20px_rgba(0,0,0,0.95)]">
          {isEn ? (
            <>
              Trade crypto futures with up to <strong className="text-white font-bold drop-shadow-md">$100,000 USDT</strong> in corporate capital. Zero evaluation traps, up to <strong className="text-amber-300 font-bold drop-shadow-md">90% profit split</strong>, and guaranteed bi-weekly payouts direct to your wallet.
            </>
          ) : (
            <>
              Opera futuros cripto con hasta <strong className="text-white font-bold drop-shadow-md">$100,000 USDT</strong> de capital asignado. Sin fases de examen, hasta <strong className="text-amber-300 font-bold drop-shadow-md">90% de reparto de ganancias</strong> y retiros quincenales directos a tu billetera.
            </>
          )}
        </p>

        {/* Primary CTA Area with Generous Spacing */}
        <div className="pt-4 sm:pt-8 flex flex-col items-center gap-8 sm:gap-10 w-full">
          <div className="relative group">
            {/* Ambient amber glow behind button */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/50 via-yellow-300/40 to-amber-600/50 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            
            <button
              onClick={handleScrollToPrograms}
              className="relative px-9 sm:px-14 py-4 sm:py-5 text-xs sm:text-sm font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl border border-amber-200/80 shadow-[0_0_35px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] hover:scale-[1.02]"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:scale-125 transition-transform" />
              <span>{isEn ? 'Get Instant Funding' : 'Obtener Fondeo Inmediato'}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950/80 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Institutional Micro-Labels (No generic icons, pure glowing micro-dots & editorial typography) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-xs sm:text-sm text-slate-300/85 font-mono tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              <span>{isEn ? 'Instant Account Setup' : 'Activación Inmediata'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              <span>{isEn ? 'Up to 90% Profit Split' : 'Hasta 90% de Reparto'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              <span>{isEn ? 'Direct USDT Payouts' : 'Retiros Directos en USDT'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Scroll Cue */}
      <button 
        onClick={handleScrollToPrograms}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400/80 hover:text-amber-400 transition-colors cursor-pointer group"
        aria-label="Scroll to programs"
      >
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {isEn ? 'Explore Accounts' : 'Explorar Cuentas'}
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce text-amber-400/80 group-hover:text-amber-300" />
      </button>
    </section>
  );
};


