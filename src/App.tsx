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
import { LiquidFollower } from './components/LiquidFollower';
import { ScrollReveal } from './components/ScrollReveal';
import { ArrowRight, Terminal } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function MainApp() {
  const [view, setView] = useState<'landing' | 'terminal'>('landing');
  const { t } = useLanguage();

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
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col selection:bg-[#EC4899]/30 selection:text-white relative">
      
      {/* Interactive Liquid Water Follower */}
      <LiquidFollower />

      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
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
        <section className="min-h-[75vh] sm:min-h-[85vh] w-full flex flex-col justify-center py-20 sm:py-32 bg-gradient-to-b from-[#07080D] via-[#0D101A] to-[#05060A] border-t border-white/10 relative overflow-hidden text-center select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-[#60A5FA]/15 via-[#F472B6]/20 to-[#FBBF24]/15 blur-[120px] pointer-events-none opacity-70" />

          <ScrollReveal direction="up" delay={100} className="max-w-5xl mx-auto px-4 sm:px-10 relative z-10">
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] sm:leading-[1.05] text-balance text-shadow-hero">
              {t.cta.titleStart}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                {t.cta.titleEnd}
              </span>
            </h2>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed text-balance text-shadow-subtle text-illuminate">
              {t.cta.subtitle}
            </p>

            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md sm:max-w-none mx-auto">
              <button
                onClick={handleOpenTerminal}
                className="btn-liquid w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] hover:brightness-110 rounded-2xl shadow-[0_10px_40px_rgba(236,72,153,0.45)] flex items-center justify-center gap-3 cursor-pointer border border-white/30"
              >
                <Terminal className="w-5 h-5 text-white" />
                <span>{t.cta.accessTerminalBtn}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => handleNavigateSection('multi-venue')}
                className="btn-liquid w-full sm:w-auto px-8 sm:px-9 py-4 sm:py-5 text-xs sm:text-sm font-semibold text-white bg-black/40 hover:bg-black/60 rounded-2xl cursor-pointer border border-white/20 backdrop-blur-xl"
              >
                <span>{t.cta.exploreGatewaysBtn}</span>
              </button>
            </div>
          </ScrollReveal>
        </section>

      </main>

      {/* Institutional Quiet Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
