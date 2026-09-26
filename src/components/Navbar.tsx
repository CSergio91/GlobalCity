import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X,
  Send,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAppRouter } from '../context/RouterContext';

interface NavbarProps {
  onOpenTerminal?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useAppRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/operaciones');
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    { id: "multi-venue", label: t.nav.multiVenue },
    { id: "arbitrage", label: t.nav.arbitrage },
    { id: "horizontal-showcase", label: t.nav.modules },
    { id: "rebalance", label: t.nav.rebalance },
    { id: "copy-trading", label: t.nav.copyTrading },
    { id: "calculator", label: t.nav.calculator }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        scrolled 
          ? "bg-[#06070B]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl py-3" 
          : "bg-transparent border-b border-transparent py-4 sm:py-5"
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* Zone 1: Sleek Brand Logo */}
        <div 
          onClick={() => onNavigateSection("hero")}
          className="flex items-center cursor-pointer group"
        >
          <BrandLogo size="md" />
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className="relative py-1 hover:text-white transition-colors cursor-pointer group"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] group-hover:w-full transition-all duration-300 rounded-full" />
            </button>
          ))}
        </nav>

        {/* Zone 3: Language Selector & Login Action */}
        <div className="hidden sm:flex items-center gap-3">
          <CandlestickLanguageSelector />

          {isAuthenticated && user ? (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088CC]/20 border border-[#0088CC]/40 text-white hover:bg-[#0088CC]/30 transition-all cursor-pointer group shadow-lg shadow-[#0088CC]/20"
              title="Sesión de Telegram Activa"
            >
              <div className="w-5 h-5 rounded-full bg-[#0088CC] flex items-center justify-center text-white">
                <Send className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-white">{user.firstName || user.username}</span>
                <span className="text-[10px] font-mono text-emerald-400">En Línea</span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="px-5 py-2 rounded-full bg-black/70 hover:bg-black text-xs font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] border border-white/20 hover:border-[#F472B6]/60 shadow-[0_0_20px_rgba(244,114,182,0.25)] hover:shadow-[0_0_25px_rgba(244,114,182,0.4)] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group"
            >
              <LogIn className="w-3.5 h-3.5 text-[#F472B6] group-hover:translate-x-0.5 transition-transform" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                Login
              </span>
              <ArrowRight className="w-3 h-3 text-[#60A5FA] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Mobile Controls: Compact Selector + Login Pill + Hamburger */}
        <div className="xl:hidden flex items-center gap-2">
          <CandlestickLanguageSelector />

          <button
            onClick={handleLoginClick}
            className="px-3.5 py-1.5 rounded-full bg-black/80 text-xs font-bold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] border border-white/20 active:scale-95 shadow-sm"
          >
            Login
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            aria-label="Abrir Menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#07090F]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 animate-reveal">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateSection(item.id);
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-2 font-semibold tracking-wide uppercase text-slate-300 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLoginClick();
            }}
            className="w-full py-3 text-center text-xs font-black tracking-widest uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] rounded-full mt-2 shadow-lg cursor-pointer"
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
};
