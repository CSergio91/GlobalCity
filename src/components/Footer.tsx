import React from 'react';
import { 
  Send, 
  Instagram, 
  Mail
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';
import footerBg from '../assets/images/footer.webp';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#06070B] text-slate-300 text-xs overflow-hidden select-none">
      
      {/* 1. The Majestic Eclipse Background - 100% Unobstructed, Spectacular & Cinematic */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat pointer-events-none opacity-95 filter contrast-125 saturate-125"
        style={{ backgroundImage: `url(${footerBg})` }}
      />
      
      {/* 2. Seamless Top Fade from previous section into the Solar Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06070B] via-transparent to-black/90 pointer-events-none" />

      {/* 3. Footer Content - Placed gracefully on the lower dark horizon with zero clunky boxes */}
      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto pt-64 sm:pt-80 pb-12 flex flex-col justify-end space-y-12">
        
        {/* Main Clean Row: Brand + Navigation + Social Icons with ScrollReveal */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-8 border-b border-white/15">
            
            {/* Brand Identity & Mission */}
            <div className="space-y-4 max-w-md">
              <BrandLogo size="lg" lightMode={false} />
              <p className="text-slate-200 text-sm font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {isEn 
                  ? 'Institutional crypto futures funding platform. Proprietary web terminal, clear risk limits, and bi-weekly payouts in USDT.' 
                  : 'Plataforma institucional de fondeo cripto. Terminal propia web, reglas claras de riesgo y retiros quincenales en USDT.'}
              </p>
            </div>

            {/* Clean Navigation Links - Unboxed & Minimalist */}
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-sm text-slate-200 font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <button 
                onClick={() => scrollTo('programs')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Programs' : 'Fondeo'}
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

            {/* Social Icons ONLY (No Names, Instagram Included, No Discord) */}
            <div className="flex items-center gap-3">
              {/* Telegram */}
              <a 
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 hover:border-purple-400 text-purple-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer backdrop-blur-md"
                aria-label="Telegram"
                title="Telegram"
              >
                <Send className="w-5 h-5 stroke-[2.2]" />
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/eklipsefunded"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-amber-500 border border-white/20 hover:border-amber-400 text-amber-300 hover:text-slate-950 flex items-center justify-center transition-all hover:scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer backdrop-blur-md"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5 stroke-[2.2]" />
              </a>

              {/* Support Email */}
              <a 
                href="mailto:support@eklipsefunded.com"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-emerald-500 border border-white/20 hover:border-emerald-400 text-emerald-300 hover:text-slate-950 flex items-center justify-center transition-all hover:scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer backdrop-blur-md"
                aria-label="Support Email"
                title="Support Email"
              >
                <Mail className="w-5 h-5 stroke-[2.2]" />
              </a>
            </div>

          </div>
        </ScrollReveal>

        {/* Institutional Risk Disclaimer - Clean Minimal Text (No Heavy Boxes) */}
        <ScrollReveal animation="blur-reveal" delay={120} duration={700}>
          <p className="text-[11px] text-slate-400 max-w-4xl mx-auto text-center leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {isEn 
              ? 'Trading digital assets and crypto derivatives involves substantial market risk. All accounts provided by EKLIPSE are conducted in an institutional simulated trading environment with live market data. Performance rewards are settled directly in USDT according to program parameters.'
              : 'La operativa con derivados de criptomonedas conlleva un riesgo sustancial de mercado. Todas las cuentas facilitadas por EKLIPSE operan en un entorno institucional simulado con cotizaciones en tiempo real. Los beneficios de rendimiento se liquidan directamente en USDT conforme a los términos del programa.'}
          </p>
        </ScrollReveal>

        {/* Bottom Bar: Copyright & Legal Links */}
        <ScrollReveal animation="fade-up" delay={200} duration={700}>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-mono">
            <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              © {new Date().getFullYear()} <strong className="text-white font-bold">EKLIPSE FUNDED</strong>. {isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}
            </div>
            <div className="flex items-center gap-6 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Terms of Service' : 'Términos de Servicio'}</a>
              <span>·</span>
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Privacy Policy' : 'Política de Privacidad'}</a>
              <span>·</span>
              <a href="#faq" className="hover:text-amber-300 transition-colors">{isEn ? 'Risk Disclosure' : 'Aviso de Riesgo'}</a>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </footer>
  );
};
