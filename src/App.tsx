import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MultiVenueHub } from './components/MultiVenueHub';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { ArbitrageCalculator } from './components/ArbitrageCalculator';
import { AutoRebalancing } from './components/AutoRebalancing';
import { CrossCopyTrading } from './components/CrossCopyTrading';
import { TelegramOperations } from './components/TelegramOperations';
import { Footer } from './components/Footer';
import { DemoTerminal } from './components/DemoTerminal';
import { ArrowRight, Terminal, Layers, Zap, Bot, RefreshCw } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'terminal'>('landing');

  const handleOpenTerminal = () => {
    setView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (view === 'terminal') {
      setView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (view === 'terminal') {
    return <DemoTerminal onBackToLanding={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col selection:bg-[#E06D8A]/30 selection:text-white">
      
      {/* Dynamic Immersive Navbar with Full-Width Visual Alignment */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-1">
        
        {/* Section 1: Hero Command Deck with Parallax City Skyline Background */}
        <Hero 
          onOpenTerminal={handleOpenTerminal}
          onExploreModules={() => handleNavigateSection('horizontal-showcase')}
        />

        {/* Section 2: Unified Multi-Venue Portfolio & Live Streaming Quotes */}
        <MultiVenueHub onOpenTerminal={handleOpenTerminal} />

        {/* Section 3: Horizontal Panoramic Scroll Showcase (Ecosystem Modules) */}
        <HorizontalShowcase onOpenTerminal={handleOpenTerminal} />

        {/* Section 4: Quantitative Live L2 VWAP Arbitrage Calculator */}
        <div id="arbitrage">
          <ArbitrageCalculator />
        </div>

        {/* Section 5: Cross Copy Trading: Crypto to Forex CFDs & CME Futures */}
        <CrossCopyTrading />

        {/* Section 6: Smart Auto-Rebalancing Engine & Gas Tank */}
        <AutoRebalancing />

        {/* Section 7: Mobile Telegram Bot Control & Emergency Telemetry */}
        <TelegramOperations />

        {/* Section 8: High-Conversion Panoramic CTA */}
        <section className="py-24 bg-gradient-to-b from-[#06070B] via-[#11131E] to-[#06070B] border-t border-white/[0.08] relative overflow-hidden text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] ambient-glow-rose pointer-events-none opacity-40" />

          <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Unifica Hoy Mismo Todos tus Exchanges y Terminales en Global City
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Conecta tus claves con permisos exclusivos <strong className="text-white">Read & Trade</strong> en Bybit, OKX, cTrader, MetaTrader 5 o pasarelas FIX. Comanda todo desde un solo panel con arbitraje sintético y control por Telegram.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleOpenTerminal}
                className="w-full sm:w-auto px-9 py-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E06D8A] via-[#ED7D9A] to-[#E06D8A] hover:brightness-110 transition-all rounded-xl shadow-2xl shadow-[#E06D8A]/35 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group border border-white/15"
              >
                <Terminal className="w-4 h-4 text-white" />
                <span>Acceder al Terminal de Trading</span>
                <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => handleNavigateSection('multi-venue')}
                className="w-full sm:w-auto px-8 py-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white glass-panel hover:bg-white/10 transition-all rounded-xl cursor-pointer border border-white/15"
              >
                <span>Explorar Conectores y Venues</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Institutional Quiet Footer */}
      <Footer />

    </div>
  );
}
