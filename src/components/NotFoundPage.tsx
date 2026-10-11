import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useAppRouter } from '../context/RouterContext';
import { BrandLogo } from './BrandLogo';
import loginBackgroundImg from '../assets/images/Background-Login.webp';
import pepe404Img from '../assets/images/404error.webp';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useAppRouter();
  const [countdown, setCountdown] = useState(10);
  const isPausedRef = useRef(false);

  // Coordenadas normalizadas del mouse (-1 a 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Suavizado elástico con resortes cinemáticos
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformaciones Parallax por capas
  const bgX = useTransform(smoothX, [-1, 1], [25, -25]);
  const bgY = useTransform(smoothY, [-1, 1], [20, -20]);

  const textX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const textY = useTransform(smoothY, [-1, 1], [-8, 8]);

  const pepeX = useTransform(smoothX, [-1, 1], [35, -35]);
  const pepeY = useTransform(smoothY, [-1, 1], [15, -15]);
  const pepeRotate = useTransform(smoothX, [-1, 1], [1.5, -1.5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((e.clientX - centerX) / centerX);
      mouseY.set((e.clientY - centerY) / centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Temporizador de auto-redirección
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06070B] text-white select-none flex flex-col justify-between items-center">
      
      {/* Capa 1: Fondo Parallax con micro-zoom */}
      <motion.div 
        style={{ 
          x: bgX, 
          y: bgY, 
          backgroundImage: `url(${loginBackgroundImg})` 
        }}
        className="absolute -inset-10 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-radial-vignette from-transparent via-[#06070B]/40 to-[#06070B]/90" />
      </motion.div>

      {/* Capa 2: Textos Directos Flotantes (Sin contenedor / caja) */}
      <motion.header 
        style={{ x: textX, y: textY }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl pt-8 sm:pt-12 px-6 flex flex-col items-center text-center"
      >
        {/* Logo Oficial */}
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer mb-4 drop-shadow-[0_8px_25px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform"
        >
          <BrandLogo size="md" lightMode={true} />
        </div>

        {/* Badge Minimalista */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-bold tracking-wider uppercase mb-3 backdrop-blur-md shadow-[0_4px_15px_rgba(239,68,68,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
          <span>Stop Loss • Error 404</span>
        </div>

        {/* Título de Alto Impacto */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-2 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          ¡Ups! Has tocado un <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
            Stop Loss Inesperado
          </span>
        </h1>

        {/* Subtítulo limpio y conciso */}
        <p className="text-slate-300 text-sm sm:text-base font-normal max-w-md mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Esta página ha sido liquidada o no existe en el mercado.
        </p>

        {/* Botón Flotante */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.55)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>Volver al Mercado Principal</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <span className="text-xs font-mono text-slate-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Volviendo a la plataforma en <span className="text-amber-400 font-bold">{countdown}</span>s
          </span>
        </div>
      </motion.header>

      {/* Capa 3: Pepe 404 Durmiendo en el Sofá (Carga desde abajo con Parallax 3D) */}
      <motion.div
        style={{ 
          x: pepeX, 
          y: pepeY,
          rotateZ: pepeRotate 
        }}
        initial={{ y: 180, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative z-20 w-full max-w-4xl flex justify-center pointer-events-none pb-0"
      >
        <img 
          src={pepe404Img} 
          alt="404 Pepe Stop Loss" 
          className="w-full max-w-[420px] sm:max-w-[620px] lg:max-w-[760px] h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)]"
          loading="eager"
        />
      </motion.div>

    </div>
  );
};
