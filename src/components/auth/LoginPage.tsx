import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthCard } from './AuthCard';
import { useAppRouter } from '../../context/RouterContext';
import { BrandLogo } from '../BrandLogo';

export const LoginPage: React.FC = () => {
  const { navigate } = useAppRouter();

  const handleAuthSuccess = () => {
    // Redirige directamente a la sala de operaciones con sesión activa
    navigate('/operaciones');
  };

  return (
    <div className="min-h-screen w-full bg-[#06070B] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-[#EC4899]/30 selection:text-white overflow-x-hidden">
      
      {/* Luces de Fondo Ambientales / Cyber Ambient Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#EC4899]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#818CF8]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#229ED9]/08 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Navbar minimalista de la pantalla de login */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-20 pb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10 backdrop-blur-md group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#EC4899]/15 border border-[#EC4899]/30 text-[#F472B6]">
            TERMINAL ACCESS
          </span>
        </div>
      </header>

      {/* Tarjeta Central Dual-Split */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 z-20">
        <AuthCard 
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </main>

      {/* Footer minimalista institucional */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[11px] font-mono text-slate-400 z-20 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 pt-4">
          <span>Global City Trading Ecosystem &copy; 2026</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Nodos de Arbitraje En Línea
            </span>
            <span className="text-slate-400">Soporte Telegram: @globalcity_auth_bot</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
