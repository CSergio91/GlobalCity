import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  Menu, 
  X,
  Send,
  UserCheck
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenTerminal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal, onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#07080C]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-3.5" 
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark & Isotype */}
        <div 
          onClick={() => onNavigateSection("hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <BrandLogo size="md" />
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className="relative py-1 hover:text-white transition-colors cursor-pointer group"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#F472B6] to-[#60A5FA] group-hover:w-full transition-all duration-300 rounded-full" />
            </button>
          ))}
        </nav>

        {/* Zone 3: Candlestick Language Selector & Direct Action */}
        <div className="hidden sm:flex items-center gap-3">
          <CandlestickLanguageSelector />

          {isAuthenticated && user && (
            <button
              onClick={onOpenTerminal}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-white hover:bg-[#229ED9]/25 transition-colors cursor-pointer group"
              title="Sesión de Telegram Activa"
            >
              <div className="w-5 h-5 rounded-md bg-[#229ED9]/30 flex items-center justify-center text-[#229ED9] group-hover:scale-105 transition-transform">
                <Send className="w-3 h-3" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">{user.username}</span>
            </button>
          )}

          <button
            onClick={onOpenTerminal}
            className="btn-liquid px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] hover:brightness-110 rounded-xl shadow-lg shadow-[#EC4899]/30 flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <Terminal className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>{isAuthenticated ? 'Ir al Terminal' : t.nav.openTerminal}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle & Selector */}
        <div className="xl:hidden flex items-center gap-2.5">
          <CandlestickLanguageSelector />

          <button
            onClick={onOpenTerminal}
            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#F472B6] to-[#818CF8] rounded-xl shadow"
          >
            {t.nav.terminalBtn}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0C0E14]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex flex-col gap-4 animate-reveal">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateSection(item.id);
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-1.5 font-medium text-slate-300 hover:text-[#F472B6] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTerminal();
            }}
            className="w-full py-3 text-center text-xs font-bold text-white bg-gradient-to-r from-[#F472B6] to-[#818CF8] rounded-xl mt-2 shadow-lg"
          >
            {t.nav.openTerminal}
          </button>
        </div>
      )}
    </header>
  );
};
