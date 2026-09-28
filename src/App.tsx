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
import { CelestialOrbit } from './components/CelestialOrbit';
import { FundingPlans } from './components/FundingPlans';
import panoramicSkylineVisual from './assets/images/global_city_panoramic_skyline_1790347023744.webp';

function MainAppContent() {
  const { currentPath, navigate } = useAppRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [themeLightness, setThemeLightness] = useState<number>(0);
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
    <div className="min-h-screen bg-[#090A10] text-white flex flex-col selection:bg-[#7C3AED]/20 selection:text-[#5B21B6] relative transition-colors duration-500">
      
      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      {/* Realistic Celestial Sun / Moon Orbital System & Dynamic Atmospheric Transition */}
      <CelestialOrbit onThemeLightnessChange={setThemeLightness} />

      {/* Main Content Layer (Cards inside have relative z-10 so astros at z-[5] pass behind cards but in front of section) */}
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

        {/* Section 3: Instant Funding Plans (Crypto & Forex $2.5K to $100K) & Tools Subscriptions */}
        <FundingPlans onSelectPlan={(plan) => navigate('/login')} />

        {/* Section 4: Horizontal Interactive Showcase (Sticky Drag Scroller) */}
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
        <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-transparent border-t border-white/10 select-none">
          {/* Ambient Purple Lighting Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#7C3AED]/20 via-[#9333EA]/15 to-[#6366F1]/15 blur-[150px] pointer-events-none" />

          {/* Panoramic Skyline Parallax Backdrop (Vivid & Crisp) */}
          <ParallaxBackground 
            imageSrc={panoramicSkylineVisual} 
            alt="Eklipse Panoramic Skyline Backdrop" 
            opacity={0.32}
            speed={0.14}
          />

          <ScrollReveal direction="up" delay={50}>
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                {t.cta.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                  {t.cta.titleEnd}
                </span>
              </h2>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
                {t.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={handleOpenTerminal}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-mono font-black tracking-widest uppercase text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:brightness-110 shadow-[4px_4px_0px_#000,0_0_25px_rgba(124,58,237,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 group active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Terminal className="w-4 h-4 text-white" />
                  <span>{t.cta.accessTerminalBtn}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <a 
                  href="#multi-venue"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-white hover:text-purple-300 bg-slate-900/80 hover:bg-slate-800 border border-white/15 shadow-[3px_3px_0px_#000] transition-all text-center active:translate-x-0.5 active:translate-y-0.5"
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
