import React from 'react';
import { 
  Flame, 
  ChevronRight, 
  ShieldCheck,
  Terminal,
  Zap,
  TrendingUp,
  Award,
  Clock
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
    }, 2600);
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

  const handleTerminalAction = () => {
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      navigate('/operations');
    }
  };

  const currentDynamicWord = isEn ? englishWords[wordIndex] : spanishWords[wordIndex];

  const heroMetrics = [
    {
      label: isEn ? 'Max Capital Scaling' : 'Escalado Máximo',
      value: '$2,000,000',
      sub: isEn ? '+25% every 3 payouts' : '+25% cada 3 retiros',
      icon: TrendingUp,
      accent: 'text-amber-400'
    },
    {
      label: isEn ? 'Max Profit Split' : 'Reparto de Beneficios',
      value: '90%',
      sub: isEn ? 'Progressive 35/50/80/90' : 'Progresivo 35/50/80/90',
      icon: Award,
      accent: 'text-purple-400'
    },
    {
      label: isEn ? 'Payout Speed' : 'Frecuencia de Retiro',
      value: isEn ? 'Bi-Weekly' : 'Quincenal',
      sub: isEn ? 'Direct USDT On-Chain' : 'Directo en USDT On-Chain',
      icon: Clock,
      accent: 'text-emerald-400'
    },
    {
      label: isEn ? 'Execution Engine' : 'Motor de Ejecución',
      value: '< 1ms RAM',
      sub: isEn ? 'Zero artificial slippage' : 'Cero deslizamientos simulados',
      icon: Zap,
      accent: 'text-amber-300'
    }
  ];

  return (
    <section 
      id="hero"
      className="min-h-screen w-full flex flex-col justify-center items-center py-24 sm:py-32 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        
        {/* 1. Institutional Trust Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-2xl shadow-[0_0_25px_rgba(245,158,11,0.15)] group hover:border-amber-400/40 transition-all cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
            {isEn 
              ? 'Next-Gen Crypto Prop Firm · Proprietary 60 FPS GPU Terminal' 
              : 'Empresa de Fondeo Cripto · Terminal Propia GPU a 60 FPS'}
          </span>
          <span className="text-amber-400 text-xs hidden sm:inline">★</span>
        </div>

        {/* 2. Main Headline with Centered Word Switcher */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl mx-auto">
          <span className="block whitespace-normal sm:whitespace-nowrap">
            {isEn ? 'Instant Crypto Funding.' : 'Fondeo Cripto Inmediato.'}
          </span>
          
          <div className="grid grid-cols-2 items-baseline mt-2 sm:mt-3 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-snug w-full max-w-2xl mx-auto">
            <span className="text-right pr-2 sm:pr-4 text-white/90 select-none">
              {isEn ? 'Zero' : 'Sin'}
            </span>
            <span className="text-left pl-2 sm:pl-4 whitespace-nowrap overflow-visible">
              <span 
                className={`inline-block pb-3 pt-1 transition-all duration-300 ease-out text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-200 to-amber-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.7)] ${
                  isFlipping ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
                }`}
              >
                {currentDynamicWord}.
              </span>
            </span>
          </div>
        </h1>

        {/* 3. Persuasive Institutional Subheadline */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal max-w-2xl sm:max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          {isEn ? (
            <>
              Trade crypto futures with up to <strong className="text-white font-bold">$100,000 USDT</strong> in corporate capital. Zero artificial challenge traps, up to <strong className="text-amber-300 font-bold">90% profit split</strong>, and guaranteed bi-weekly payouts direct to your wallet.
            </>
          ) : (
            <>
              Opera derivados cripto con hasta <strong className="text-white font-bold">$100,000 USDT</strong> de capital corporativo asignado. Sin fases de examen artificiales, con reparto de hasta el <strong className="text-amber-300 font-bold">90% de beneficios</strong> y retiros quincenales garantizados en USDT.
            </>
          )}
        </p>

        {/* 4. Balanced Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
          {/* Primary CTA */}
          <button
            onClick={handleScrollToPrograms}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-4.5 text-xs sm:text-sm font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-xl border border-amber-200/60 shadow-[0_0_35px_rgba(245,158,11,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] group hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4 text-slate-950 group-hover:scale-125 transition-transform" />
            <span>{isEn ? 'Get Instant Funding' : 'Obtener Fondeo Inmediato'}</span>
            <ChevronRight className="w-4 h-4 text-slate-950/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA: Open Live Demo Terminal */}
          <button
            onClick={handleTerminalAction}
            className="w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-4.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/15 hover:border-white/30 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>{isEn ? 'Explore Demo Terminal' : 'Explorar Terminal Demo'}</span>
          </button>
        </div>

        {/* 5. Key Metrics Glass Cockpit Bar */}
        <div className="w-full pt-6 sm:pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_40px_rgba(0,0,0,0.6)]">
            {heroMetrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div 
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col items-center sm:items-start text-center sm:text-left space-y-1 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    <Icon className={`w-3.5 h-3.5 ${m.accent}`} />
                    <span>{m.label}</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-mono font-black text-white tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {m.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

