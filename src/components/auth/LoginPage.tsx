import React from 'react';
import { AuthCard } from './AuthCard';
import { useAppRouter } from '../../context/RouterContext';

export const LoginPage: React.FC = () => {
  const { navigate } = useAppRouter();

  const handleAuthSuccess = () => {
    // Redirige directamente a la sala de operaciones con sesión activa
    navigate('/operaciones');
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex items-center justify-center p-0 md:p-6 lg:p-8 bg-black selection:bg-[#EC4899]/30 selection:text-white overflow-x-hidden overflow-y-auto">
      {/* Contenedor central sin bordes y perfectamente integrado */}
      <main className="w-full max-w-full md:max-w-4xl lg:max-w-5xl z-20 my-auto flex flex-col items-center justify-center">
        <AuthCard 
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </main>
    </div>
  );
};
