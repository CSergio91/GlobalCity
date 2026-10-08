import React from 'react';
import { 
  Send, 
  Instagram, 
  Mail
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';
import pepeFooterImg from '../assets/images/pepe_footer.webp';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  const scrollTo = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'programs') {
      const container = document.getElementById('hero-experience');
      if (container) {
        const scrollable = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: container.offsetTop + scrollable * 0.35, behavior: 'smooth' });
        return;
      }
    }
    if (id === 'terminal') {
      const container = document.getElementById('hero-experience');
      if (container) {
        const scrollable = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: container.offsetTop + scrollable * 0.75, behavior: 'smooth' });
        return;
      }
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#06070B] text-slate-300 text-xs overflow-hidden select-none border-t border-white/10">
      
      {/* 1. Pure Dark Obsidian Atmosphere with Subtle Cosmic Nebula Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(124,58,237,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.03),transparent_60%)] pointer-events-none" />

      {/* 2. Top & Middle Content Container: Brand Identity, Navigation, Socials, Risk & Legal */}
      <div className="relative z-20 w-full px-3.5 sm:px-10 lg:px-16 max-w-7xl mx-auto pt-10 sm:pt-20 pb-6 sm:pb-8 flex flex-col gap-8 sm:gap-10">
        
        {/* ========================================================================= */}
        {/* TOP ROW: Brand Identity + Navigation + Social Icons                       */}
        {/* ========================================================================= */}
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-white/10">
            
            {/* Brand Logo & Mission */}
            <div className="space-y-2.5 max-w-md text-left">
              <BrandLogo size="lg" lightMode={false} />
              <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
                {isEn 
                  ? 'Institutional crypto futures prop firm. Trade corporate capital with clear risk rules, real order books, and bi-weekly payouts in USDT.' 
                  : 'Empresa institucional de fondeo cripto. Opera capital corporativo con reglas claras de riesgo, libros reales y retiros quincenales en USDT.'}
              </p>
            </div>

            {/* Clean Navigation Links (Unboxed, Pure Typography) */}
            <nav className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-2 font-mono text-xs sm:text-sm text-slate-300 font-medium">
              <button 
                onClick={() => scrollTo('hero')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Home' : 'Inicio'}
              </button>
              <button 
                onClick={() => scrollTo('programs')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Programs' : 'Planes'}
              </button>
              <button 
                onClick={() => scrollTo('terminal')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Terminal' : 'Terminal'}
              </button>
              <button 
                onClick={() => scrollTo('markets')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Markets' : 'Mercados'}
              </button>
              <button 
                onClick={() => scrollTo('payout')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Payouts' : 'Retiros'}
              </button>
              <button 
                onClick={() => scrollTo('faq')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'FAQ' : 'FAQ'}
              </button>
            </nav>

            {/* Social Icons (Telegram, Instagram, Email) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <a 
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
                aria-label="Telegram"
                title="Telegram"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
              </a>

              <a 
                href="https://instagram.com/eklipsefunded"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-amber-500/30 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
              </a>

              <a 
                href="mailto:support@eklipsefunded.com"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-emerald-500/30 border border-white/10 hover:border-emerald-400/50 text-slate-300 hover:text-emerald-300 flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
                aria-label="Support Email"
                title="Support Email"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
              </a>
            </div>

          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* MIDDLE ROW: Institutional Risk Disclaimer + Copyright & Legal Links       */}
        {/* ========================================================================= */}
        <div className="space-y-3.5 max-w-5xl mx-auto w-full text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed break-words px-1">
            {isEn 
              ? 'Trading digital assets and crypto derivatives involves substantial market risk. All accounts provided by EKLIPSE are conducted in an institutional simulated trading environment with live market data. Performance rewards are settled directly in USDT according to program parameters.'
              : 'La operativa con derivados de criptomonedas conlleva un riesgo sustancial de mercado. Todas las cuentas facilitadas por EKLIPSE operan en un entorno institucional simulado con cotizaciones en tiempo real. Los beneficios de rendimiento se liquidan directamente en USDT conforme a los términos del programa.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[10.5px] sm:text-xs font-mono pt-3 border-t border-white/5">
            <div>
              © {new Date().getFullYear()} <strong className="text-slate-300 font-bold">EKLIPSE FUNDED</strong>. {isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}
            </div>
            <div className="flex items-center gap-3 sm:gap-6 text-[10.5px] sm:text-xs flex-wrap justify-center">
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Terms of Service' : 'Términos de Servicio'}</a>
              <span>·</span>
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Privacy Policy' : 'Política de Privacidad'}</a>
              <span>·</span>
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Risk Disclosure' : 'Aviso de Riesgo'}</a>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* GRAND FINALE AT THE BOTTOM OF THE PAGE:                                   */}
      {/* Pepe emerging flush from the bottom floor with giant "EKLIPSE" behind him */}
      {/* ========================================================================= */}
      <div className="relative w-full flex flex-col items-center justify-end overflow-hidden pt-6 sm:pt-14">
        
        {/* Monumental Background Typography: "EKLIPSE" */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none select-none z-10 leading-none">
          <span className="text-[18vw] sm:text-[21vw] md:text-[22vw] lg:text-[23vw] font-black tracking-[-0.03em] uppercase leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.18] via-white/[0.06] to-transparent font-sans drop-shadow-[0_0_90px_rgba(124,58,237,0.14)]">
            EKLIPSE
          </span>
        </div>

        {/* Centered Pepe Mascot Emerging from the Bottom of the Page */}
        <div className="relative z-20 flex justify-center items-end leading-none">
          <img 
            src={pepeFooterImg} 
            alt="Eklipse Mascot" 
            className="w-[240px] sm:w-[380px] md:w-[480px] lg:w-[540px] max-w-[85vw] h-auto object-contain block select-none pointer-events-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
          />
        </div>

      </div>

    </footer>
  );
};
