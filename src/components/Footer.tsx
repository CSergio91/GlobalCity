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

            {/* Clean Navigation Links (Unboxed, Pure Typography - Crawlable <a> Tags) */}
            <nav className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-2 font-mono text-xs sm:text-sm text-slate-300 font-medium">
              <a 
                href="#hero" 
                title={isEn ? "Eklipse Funded Home" : "Inicio Eklipse Funded"}
                onClick={(e) => { e.preventDefault(); scrollTo('hero'); }} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Home' : 'Inicio'}
              </a>
              <a 
                href="#programs" 
                title={isEn ? "Instant Funding & Challenge Programs" : "Programas de Fondeo Inmediato y Retos"}
                onClick={(e) => { e.preventDefault(); scrollTo('programs'); }} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Programs' : 'Planes'}
              </a>
              <a 
                href="/operations" 
                title={isEn ? "Institutional 60 FPS GPU Trading Terminal" : "Terminal Institucional de Trading a 60 FPS"}
                onClick={(e) => { e.preventDefault(); scrollTo('terminal'); }} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Terminal' : 'Terminal'}
              </a>
              <a 
                href="#markets" 
                title={isEn ? "Crypto DMA Order Books & Liquidity" : "Mercados Cripto DMA y Libros de Órdenes"}
                onClick={(e) => { e.preventDefault(); scrollTo('markets'); }} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'Markets' : 'Mercados'}
              </a>
              <a 
                href="#faq" 
                title={isEn ? "Trading Rules, Drawdown & FAQ" : "Reglas de Trading, Drawdown y Preguntas Frecuentes"}
                onClick={(e) => { e.preventDefault(); scrollTo('faq'); }} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isEn ? 'FAQ' : 'FAQ'}
              </a>
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
        {/* DIRECTORY & SEO INTERNAL LINKING CLUSTER                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 pb-4 border-b border-white/5 text-left text-xs font-mono">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              {isEn ? 'Funding Programs' : 'Programas de Fondeo'}
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>
                <a 
                  href="#programs" 
                  onClick={(e) => { e.preventDefault(); scrollTo('programs'); }}
                  className="hover:text-white transition-colors"
                  title="Fondeo Inmediato Cripto $1K a $100K"
                >
                  {isEn ? 'Instant Funding ($1K - $100K)' : 'Fondeo Inmediato ($1K - $100K)'}
                </a>
              </li>
              <li>
                <a 
                  href="#programs" 
                  onClick={(e) => { e.preventDefault(); scrollTo('programs'); }}
                  className="hover:text-white transition-colors"
                  title="Chispa Solar $1,000"
                >
                  Chispa Solar $1,000
                </a>
              </li>
              <li>
                <a 
                  href="#programs" 
                  onClick={(e) => { e.preventDefault(); scrollTo('programs'); }}
                  className="hover:text-white transition-colors"
                  title="Corona Solar $10,000"
                >
                  Corona Solar $10,000
                </a>
              </li>
              <li>
                <a 
                  href="#programs" 
                  onClick={(e) => { e.preventDefault(); scrollTo('programs'); }}
                  className="hover:text-white transition-colors"
                  title="Eclipse Solar $100,000"
                >
                  Eclipse Solar $100,000
                </a>
              </li>
              <li>
                <a 
                  href="#programs" 
                  onClick={(e) => { e.preventDefault(); scrollTo('programs'); }}
                  className="hover:text-white transition-colors"
                  title="Reto 2 Fases Luna Creciente"
                >
                  {isEn ? '2-Step Evaluation (Luna Creciente)' : 'Reto 2 Fases (Luna Creciente)'}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              {isEn ? 'Trading & Tech' : 'Tecnología & Trading'}
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>
                <a 
                  href="/operations" 
                  onClick={(e) => { e.preventDefault(); scrollTo('terminal'); }}
                  className="hover:text-white transition-colors"
                  title="Terminal Web GPU a 60 FPS"
                >
                  {isEn ? '60 FPS GPU Web Terminal' : 'Terminal Web GPU 60 FPS'}
                </a>
              </li>
              <li>
                <a 
                  href="#markets" 
                  onClick={(e) => { e.preventDefault(); scrollTo('markets'); }}
                  className="hover:text-white transition-colors"
                  title="Mercados Cripto DMA Futuros"
                >
                  {isEn ? 'Crypto DMA Futures Liquidity' : 'Futuros Cripto DMA en Vivo'}
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="hover:text-white transition-colors"
                  title="Portal del Trader Eklipse"
                >
                  {isEn ? 'Trader Dashboard Portal' : 'Portal del Trader'}
                </a>
              </li>
              <li>
                <a 
                  href="#payout" 
                  onClick={(e) => { e.preventDefault(); scrollTo('payout'); }}
                  className="hover:text-white transition-colors"
                  title="Retiros de Ganancias en USDT"
                >
                  {isEn ? 'USDT On-Chain Payouts (<8h)' : 'Retiros On-Chain USDT (<8h)'}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              {isEn ? 'Rules & Governance' : 'Reglas & Gobernanza'}
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}
                  className="hover:text-white transition-colors"
                  title="Regla de Pérdida Diaria 2% a 4%"
                >
                  {isEn ? 'Daily Loss Limit (2% - 4%)' : 'Límite de Pérdida Diaria (2%-4%)'}
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}
                  className="hover:text-white transition-colors"
                  title="Regla de Drawdown Total 8% a 10%"
                >
                  {isEn ? 'Max Total Drawdown (8% - 10%)' : 'Drawdown Total Máximo (8%-10%)'}
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}
                  className="hover:text-white transition-colors"
                  title="Regla de Consistencia y Scalping"
                >
                  {isEn ? 'Consistency & Holding Rules' : 'Regla de Consistencia y Operativa'}
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}
                  className="hover:text-white transition-colors"
                  title="Reparto de Beneficios 80% a 90%"
                >
                  {isEn ? '80% to 90% Profit Split' : 'Reparto de Ganancias 80% a 90%'}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEn ? 'Market Context' : 'Contexto de Mercado'}
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              {isEn 
                ? 'Eklipse Funded is an institutional crypto prop firm offering direct exchange DMA execution, instant funding, and on-chain USDT rewards. A modern alternative to traditional forex/CFD prop firms such as FTMO, FundedNext, The 5%ers, Funding Pips, and Moneta Markets.'
                : 'Eklipse Funded es la empresa institucional de fondeo cripto con ejecución DMA en libros reales, fondeo inmediato y pagos on-chain en USDT. Una alternativa de última generación frente a prop firms tradicionales de forex y CFDs como FTMO, FundedNext, The 5%ers, Funding Pips y Moneta Markets.'}
            </p>
          </div>
        </div>

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
      {/* ========================================================================= */}
      {/* GRAND FINALE AT THE BOTTOM OF THE PAGE:                                   */}
      {/* Pepe emerging flush from the bottom floor with giant "EKLIPSE" behind him */}
      {/* ========================================================================= */}
      <div className="relative w-full flex flex-col items-center justify-end overflow-hidden pt-10 sm:pt-16 mt-4">
        
        {/* Monumental Background Typography: "EKLIPSE" (Elevated & High Contrast on Mobile) */}
        <div className="absolute inset-x-0 bottom-8 sm:bottom-4 md:bottom-0 flex items-center justify-center pointer-events-none select-none z-10 leading-none">
          <span className="text-[24vw] sm:text-[22vw] md:text-[23vw] lg:text-[24vw] font-black tracking-[-0.04em] uppercase leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white/40 via-purple-300/25 to-white/5 font-sans drop-shadow-[0_0_80px_rgba(168,85,247,0.35)] filter">
            EKLIPSE
          </span>
        </div>

        {/* Centered Pepe Mascot Emerging from the Bottom of the Page */}
        <div className="relative z-20 flex justify-center items-end leading-none">
          {/* Cosmic Nebula Halo behind animated Pepe */}
          <div className="absolute -inset-10 bg-gradient-to-t from-purple-600/35 via-amber-500/20 to-transparent blur-3xl rounded-full scale-90 pointer-events-none -z-10" />

          <img 
            src={pepeFooterImg} 
            alt="Eklipse Mascot Pepe" 
            className="w-[190px] sm:w-[340px] md:w-[460px] lg:w-[560px] max-w-[70vw] h-auto object-contain block select-none pointer-events-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
            loading="lazy"
          />
        </div>

      </div>

    </footer>
  );
};
