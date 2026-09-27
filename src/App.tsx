import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HeroScrollCanvas } from './components/HeroScrollCanvas';
import { MultiVenueHub } from './components/MultiVenueHub';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { ArbitrageCalculator } from './components/ArbitrageCalculator';
import { AutoRebalancing } from './components/AutoRebalancing';
import { CrossCopyTrading } from './components/CrossCopyTrading';
import { TelegramOperations } from './components/TelegramOperations';
import { Footer } from './components/Footer';
import { DemoTerminal } from './components/DemoTerminal';
import { CandlestickCursor } from './components/CandlestickCursor';
import { ScrollReveal } from './components/ScrollReveal';
import { Terminal, ArrowRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './context/RouterContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { ParallaxBackground } from './components/ParallaxBackground';
import panoramicSkylineVisual from './assets/images/global_city_panoramic_skyline_1790347023744.jpg';

function MainAppContent() {
  const { currentPath, navigate } = useAppRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const isLoginRoute = currentPath === '/login';
  const isTerminalRoute = 
    currentPath === '/terminal' || 
    currentPath === '/operaciones' || 
    currentPath === '/operations';

  const handleOpenTerminal = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/operations');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate('/operations');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (isTerminalRoute || isLoginRoute) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If on /login route, render the full-screen split LoginPage
  if (isLoginRoute) {
    return <LoginPage />;
  }

  // If on /operaciones, /terminal or /operations route, render the Trading & Operations Terminal
  if (isTerminalRoute) {
    return (
      <>
        <DemoTerminal 
          onBackToLanding={() => navigate('/')} 
          onOpenAuth={() => navigate('/login')}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={handleAuthSuccess} 
        />
      </>
    );
  }

  // Otherwise, render the Landing Page
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#090A10] flex flex-col selection:bg-[#7C3AED]/20 selection:text-[#5B21B6] relative">
      
      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      <main className="flex-1">
        
        {/* Unified Hero + Multi-Venue Cinematic Scrub Experience */}
        <div id="hero-experience" className="relative w-full">
          {/* Pinned Video Canvas */}
          <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
            <HeroScrollCanvas totalFrames={80} containerId="hero-experience" />
          </div>

          {/* Content Layer (Hero then MultiVenue rising on top of the scrolling video) */}
          <div className="relative z-10 -mt-[100vh]">
            {/* Section 1: Hero Deck */}
            <Hero onOpenTerminal={handleOpenTerminal} />

            {/* Section 2: Multi-Venue Liquidity Node rising directly over the scrubbing video */}
            <MultiVenueHub />
          </div>
        </div>

        {/* Section 3: Horizontal Interactive Showcase (Sticky Drag Scroller) */}
        <section id="horizontal-showcase">
          <HorizontalShowcase />
        </section>

        {/* Section 4: Real-time Multi-Exchange Synthetic Arbitrage Engine */}
        <section id="arbitrage">
          <ArbitrageCalculator />
        </section>

        {/* Section 5: Automated Portfolio Rebalancing */}
        <section id="rebalance">
          <AutoRebalancing />
        </section>

        {/* Section 6: Cross-Broker Synchronized Copy Trading */}
        <section id="copy-trading">
          <CrossCopyTrading />
        </section>

        {/* Section 7: Telegram Webhook Automated Operations */}
        <section id="telegram">
          <TelegramOperations />
        </section>

        {/* Section 8: Final Call to Action */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#F8F9FE] via-white to-[#F3F4FB] border-t border-purple-100 select-none">
          {/* Ambient Purple Lighting Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#7C3AED]/10 via-[#9333EA]/10 to-[#6366F1]/10 blur-[130px] pointer-events-none" />

          {/* Panoramic Skyline Parallax Backdrop */}
          <ParallaxBackground 
            imageSrc={panoramicSkylineVisual} 
            alt="Global City Panoramic Skyline Backdrop" 
            opacity={0.12}
            speed={0.14}
          />

          <ScrollReveal direction="up" delay={50}>
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-[11px] font-mono font-bold text-[#6D28D9] tracking-wider uppercase shadow-sm">
                <span>GLOBAL CITY FUNDING</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                <span>TERMINAL PROPIA V10</span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#090A10] tracking-tight leading-[1.12]">
                {t.cta.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1]">
                  {t.cta.titleEnd}
                </span>
              </h2>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
                {t.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={handleOpenTerminal}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-black tracking-widest uppercase text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:brightness-105 shadow-[0_10px_30px_rgba(124,58,237,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-95"
                >
                  <Terminal className="w-4 h-4 text-white" />
                  <span>{t.cta.accessTerminalBtn}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <a 
                  href="#multi-venue"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#090A10] hover:text-[#7C3AED] bg-white hover:bg-purple-50 border border-purple-200/80 shadow-sm transition-all text-center"
                >
                  {t.cta.exploreGatewaysBtn}
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </main>

      {/* Institutional Quiet Footer */}
      <Footer />

      {/* Telegram & Institutional Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider>
          {/* Global Japanese Candlestick Cursor for the Entire Project */}
          <CandlestickCursor />
          <MainAppContent />
        </RouterProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
