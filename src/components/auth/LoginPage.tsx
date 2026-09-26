import React from 'react';
import { AuthCard } from './AuthCard';
import { useAppRouter } from '../../context/RouterContext';
import { LiquidFollower } from '../LiquidFollower';
import nightSkylineBg from '../../assets/images/global_city_night_skyline.jpg';

export const LoginPage: React.FC = () => {
  const { navigate } = useAppRouter();

  const handleAuthSuccess = () => {
    // Redirige directamente a la sala de operaciones con sesión activa
    navigate('/operaciones');
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between items-center p-3 sm:p-6 lg:p-8 selection:bg-[#EC4899]/30 selection:text-white overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${nightSkylineBg})` }}
    >
      {/* Dynamic Interactive Liquid Follower (Efecto iluminación del ratón de la landing) */}
      <LiquidFollower />

      {/* Capas de oscuridad y viñeta para que la ciudad nocturna brille con profundidad y legibilidad */}
      <div className="absolute inset-0 bg-[#06070B]/75 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-transparent to-[#06070B]/80 pointer-events-none" />
      
      {/* Luces Ambientales / Cyber Ambient Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#EC4899]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#229ED9]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#229ED9]/08 rounded-full blur-[180px] pointer-events-none" />

      {/* Tarjeta Central Glassmórfica Transparente */}
      <main className="w-full flex-1 flex items-center justify-center z-20 py-2 sm:py-4">
        <AuthCard 
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </main>

      {/* Footer minimalista discreto */}
      <footer className="w-full max-w-3xl mx-auto text-center text-[10px] font-mono text-slate-400/90 z-20 pt-2 pb-1">
        <div className="flex items-center justify-between border-t border-white/10 pt-2 px-1">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span>← Volver al Portal Global City</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bot @globalcity_auth_bot Activo
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
