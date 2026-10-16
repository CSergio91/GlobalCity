import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroExperienceStage } from './components/HeroExperienceStage';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { MarketsSection } from './components/MarketsSection';
import { PayoutRoadmapSection } from './components/PayoutRoadmapSection';
import { WhyEklipseSection } from './components/WhyEklipseSection';
import { CommunitySection } from './components/CommunitySection';
import { FAQSection } from './components/FAQSection';
import { ParallaxFaqFooterStage } from './components/ParallaxFaqFooterStage';
import { TradingTerminal } from './components/TradingTerminal';
import { UserSession } from './lib/supabase';
import { CelestialCursor } from './components/CelestialCursor';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './context/RouterContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { TraderDashboardApp } from './modules/dashboard/TraderDashboardApp';
import { InstitutionalCrmApp } from './modules/crm/InstitutionalCrmApp';
import { CrmAccessDeniedScreen } from './modules/crm/components/CrmAccessDeniedScreen';
import { NotFoundPage } from './components/NotFoundPage';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

function MainAppContent() {
  const { currentPath, subdomain, navigate } = useAppRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isStaff, logout } = useAuth();

  const normalizedPath = currentPath.replace(/^\/(es|en)/, '');
  const isCrmRoute = 
    normalizedPath === '/nexus' || 
    normalizedPath === '/crm' || 
    normalizedPath === '/nexuscrm' || 
    normalizedPath.startsWith('/nexus') || 
    normalizedPath.startsWith('/crm') || 
    normalizedPath.startsWith('/nexuscrm') || 
    subdomain === 'nexus';
  const isDashboardRoute = 
    normalizedPath === '/dashboard' || 
    normalizedPath === '/dashapp' || 
    normalizedPath.startsWith('/dashboard') || 
    normalizedPath.startsWith('/dashapp') || 
    normalizedPath.startsWith('/trader') ||
    subdomain === 'dashboard' || 
    subdomain === 'dashapp';
  const isLoginRoute = currentPath === '/login' || currentPath.startsWith('/login?') || currentPath.startsWith('/login/');
  const isCheckoutRoute = 
    normalizedPath === '/checkout' || 
    normalizedPath.startsWith('/checkout') || 
    currentPath === '/checkout' || 
    currentPath.startsWith('/checkout');
  const isResetPasswordRoute = 
    currentPath === '/reset-password' || 
    currentPath.startsWith('/reset-password?') || 
    currentPath.startsWith('/reset-password#') ||
    (typeof window !== 'undefined' && window.location.hash.includes('type=recovery'));
  const isTerminalRoute = 
    currentPath === '/terminal' || 
    currentPath === '/operaciones' || 
    currentPath === '/operations';

  const handleOpenTerminal = () => {
    navigate('/operations');
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate('/dashboard');
  };

  const handleNavigateSection = (sectionId: string) => {
    const doScroll = () => {
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (sectionId === 'programs') {
        const container = document.getElementById('hero-experience');
        if (container) {
          const scrollable = container.offsetHeight - window.innerHeight;
          const targetScroll = container.offsetTop + scrollable * 0.35;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          return;
        }
      }
      if (sectionId === 'terminal') {
        const container = document.getElementById('hero-experience');
        if (container) {
          const scrollable = container.offsetHeight - window.innerHeight;
          const targetScroll = container.offsetTop + scrollable * 0.75;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          return;
        }
      }
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (isTerminalRoute || isLoginRoute || isDashboardRoute || isCrmRoute || isResetPasswordRoute) {
      navigate('/');
      setTimeout(doScroll, 100);
    } else {
      doScroll();
    }
  };

  // 1. If on /operaciones, /terminal or /operations route, render the real Institutional Trading Platform
  if (isTerminalRoute) {
    const terminalUser: UserSession | null = user ? {
      id: user.id,
      email: (user as any).email || `${user.username || 'trader'}@eklipsefunded.com`,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
      avatarUrl: user.photoUrl,
      isDemo: false,
      provider: (user.authProvider as any) || 'email',
      role: 'trader',
      isVerified: true
    } : null;

    return (
      <TradingTerminal 
        currentLang={language}
        user={terminalUser}
        onExit={() => {
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }}
        onOpenAuth={() => navigate('/login')}
        onLanguageChange={(newLang) => setLanguage(newLang)}
      />
    );
  }

  // 2. If on /nexus route or nexus.* / nexuscrm.* subdomain, render the Institutional CRM Nexus
  if (isCrmRoute) {
    if (!isAuthenticated) {
      return <LoginPage />;
    }

    if (!isStaff) {
      return (
        <CrmAccessDeniedScreen 
          onBackToDashboard={() => {
            if (subdomain === 'nexus') {
              window.location.href = 'https://dashapp.eklipsefunded.com';
            } else {
              navigate('/dashboard');
            }
          }}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
        />
      );
    }

    return (
      <InstitutionalCrmApp 
        user={user as any}
        onBackToTerminal={() => {
          if (subdomain === 'nexus') {
            window.location.href = 'https://dashapp.eklipsefunded.com';
          } else {
            navigate('/dashboard');
          }
        }} 
        onLogout={() => {
          logout();
          navigate('/login');
        }} 
      />
    );
  }

  // 3. If on /dashboard route or dashboard.* subdomain, render the Trader Dashboard (or Trader Login if unauthenticated)
  if (isDashboardRoute) {
    if (!isAuthenticated) {
      return <LoginPage />;
    }
    return (
      <TraderDashboardApp 
        onBackToLanding={() => {
          if (subdomain === 'dashapp' || subdomain === 'dashboard') {
            window.location.href = 'https://eklipsefunded.com';
          } else {
            navigate('/');
          }
        }} 
        onLogout={() => {
          logout();
          navigate('/dashboard');
        }}
        onGoToTerminal={() => navigate('/operations')}
      />
    );
  }

  // 4. If on /login or /checkout route, render the full-screen LoginPage (with Checkout)
  if (isLoginRoute || isCheckoutRoute) {
    return <LoginPage />;
  }

  // 5. If on /reset-password route, render the ResetPasswordPage
  if (isResetPasswordRoute) {
    return <ResetPasswordPage />;
  }

  // 6. Si la ruta no es Home ni ninguna de las rutas registradas, mostrar la página 404 de Eklipse
  const isHomeRoute = 
    currentPath === '/' || 
    currentPath === '' || 
    currentPath.startsWith('/?') || 
    currentPath.startsWith('/#');

  if (!isHomeRoute) {
    return <NotFoundPage />;
  }

  // Otherwise, render the Landing Page with the 11-section master architecture
  return (
    <div className="min-h-screen bg-[#06070B] text-white flex flex-col selection:bg-amber-400/20 selection:text-amber-300 relative transition-colors duration-500">
      
      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      {/* Main Content Layer: Hero Experience + Markets Marquee */}
      <main className="flex-1">
        
        {/* Single Page Pinned Viewport Stage (Hero + ProgramsSection over continuous 240-frame eclipse) */}
        <HeroExperienceStage 
          onOpenTerminal={handleOpenTerminal} 
          onNavigateSection={handleNavigateSection} 
        />

        {/* Real-time Crypto DMA Markets Marquee Wall */}
        <MarketsSection />

      </main>

      {/* Parallax Stage: FAQs in background layer, Footer sliding over like a curtain */}
      <ParallaxFaqFooterStage />

      {/* High-Performance Celestial Cursor with orbital ring and core star */}
      <CelestialCursor />

      {/* Auth Modal for Quick Login / Registration */}
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
    <GlobalErrorBoundary>
      <RouterProvider>
        <LanguageProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </LanguageProvider>
      </RouterProvider>
    </GlobalErrorBoundary>
  );
}
