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
      className="min-h-[100dvh] w-full relative flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-[#EC4899]/30 selection:text-white overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${nightSkylineBg})` }}
    >
      {/* Dynamic Interactive Liquid Follower (Iluminación interactiva del ratón de la landing) */}
      <LiquidFollower />

      {/* Capa de viñeta oscura para contraste profesional */}
      <div className="absolute inset-0 bg-[#06070B]/80 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Luces Ambientales de Fondo */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#EC4899]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#229ED9]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Tarjeta Central sin bordes y con entrada animada fluida */}
      <main className="w-full max-w-4xl lg:max-w-5xl z-20 my-auto flex items-center justify-center px-4">
        <AuthCard 
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </main>
    </div>
  );
};
