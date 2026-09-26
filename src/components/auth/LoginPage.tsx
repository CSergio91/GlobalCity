import React from 'react';
import { AuthCard } from './AuthCard';
import { useAppRouter } from '../../context/RouterContext';

export const LoginPage: React.FC = () => {
  const { navigate } = useAppRouter();

  const handleAuthSuccess = () => {
    // Redirige directamente a la sala de operaciones con sesión activa
    navigate('/operations');
  };

  return (
    <div className="h-[100dvh] w-full relative flex items-center justify-center p-0 md:p-6 lg:p-8 bg-black selection:bg-[#EC4899]/30 selection:text-white overflow-hidden select-none">
      {/* Contenedor central sin bordes y perfectamente integrado */}
      <main className="w-full h-full max-w-full md:max-w-4xl lg:max-w-5xl z-20 flex flex-col items-center justify-center overflow-hidden my-auto">
        <AuthCard 
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </main>
    </div>
  );
};
