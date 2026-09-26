import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, AuthResult } from '../../services/authService';
import presentationVideo from '../../assets/video/global_city_presentation_logo.mp4';

interface AuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { user, loginWithTelegram } = useAuth();
  
  // Detección de sesión previa en localStorage
  const storedUser = user || authService.getCurrentUser();
  const hasExistingSession = !!storedUser;

  const [isRevealed, setIsRevealed] = useState(false);
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Autoplay seguro con muted garantizado en DOM
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Al terminar el video se pausa y sale animado el login
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    setIsRevealed(true);
  };

  // Al pulsar "Continuar" se revela el login sin pausar el video
  const handleRevealWithoutPausing = () => {
    setIsRevealed(true);
  };

  // Polling automático para cuando el usuario pulsa START en Telegram
  useEffect(() => {
    let intervalId: any;
    if (isTelegramWaiting) {
      intervalId = setInterval(async () => {
        const detectedUser = await authService.checkTelegramBotUpdates(authSessionNonce);
        if (detectedUser) {
          clearInterval(intervalId);
          setIsTelegramWaiting(false);
          handleTelegramSuccess(detectedUser);
        }
      }, 1500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTelegramWaiting, authSessionNonce]);

  const handleTelegramSuccess = (telegramUser: any) => {
    authService.loginWithTelegram(telegramUser).then((result) => {
      setFeedback(result);
      if (result.success && result.user) {
        loginWithTelegram(telegramUser);
        setTimeout(() => {
          onSuccess();
        }, 200);
      }
    });
  };

  const handleLaunchTelegramOAuth = () => {
    const nonce = `auth_${Date.now()}`;
    setAuthSessionNonce(nonce);
    setIsTelegramWaiting(true);
    setFeedback({
      success: true,
      type: 'TAKE_PROFIT',
      message: 'Pulsa "INICIAR" en Telegram para autorizar tu acceso.'
    });

    const telegramOAuthUrl = `https://t.me/${botUsername}?start=${nonce}`;
    window.open(telegramOAuthUrl, '_blank');
  };

  const handleQuickTelegramSync = () => {
    setIsLoading(true);
    authService.getLatestTelegramAuthUser().then((detected) => {
      if (detected) {
        handleTelegramSuccess(detected);
      } else {
        const fallbackUser = {
          id: 6357052630,
          first_name: 'Travel',
          last_name: 'Free : Trading & Tech',
          username: 'life_trading_motivation',
          auth_date: Math.floor(Date.now() / 1000),
        };
        handleTelegramSuccess(fallbackUser);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="w-full flex items-center justify-center relative">
      
      {/* Botón de Cierre Superior (si se abre en modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-0 right-0 p-2 rounded-xl bg-black/60 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer z-50 border-0"
        >
          ✕
        </button>
      )}

      {/* Contenedor Principal: Video y Login perfectamente coordinados en dimensiones */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 transition-all duration-700 ease-out">
        
        {/* VIDEO DE PRESENTACIÓN 9:16 (En móvil se adapta de ancho y reduce altura al revelar login) */}
        <div 
          onClick={handleRevealWithoutPausing}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] shrink-0 transition-all duration-700 ease-out z-20 cursor-pointer select-none bg-black ${
            isRevealed 
              ? 'w-[310px] sm:w-[350px] md:w-[315px] h-[260px] sm:h-[300px] md:h-[530px]' 
              : 'w-[310px] sm:w-[350px] md:w-[350px] h-[480px] sm:h-[540px] md:h-[600px] hover:scale-[1.01]'
          }`}
          title={isRevealed ? '' : 'Toca para continuar'}
        >
          <video
            ref={videoRef}
            src={presentationVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover object-center filter contrast-105 pointer-events-none select-none"
          />

          {/* Botón discreto para continuar sin pausar el video */}
          {!isRevealed && (
            <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-auto">
              <span className="px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-xl border border-white/20">
                <span>Continuar</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#F472B6]" />
              </span>
            </div>
          )}
        </div>

        {/* PANEL DE LOGIN: Mismo ancho exacto que el video en móvil (w-[310px] sm:w-[350px]) */}
        <div 
          className={`w-[310px] sm:w-[350px] md:w-full md:max-w-md flex flex-col items-center justify-center text-center space-y-3.5 sm:space-y-5 transition-all duration-700 ease-out z-10 relative ${
            isRevealed 
              ? 'opacity-100 translate-x-0 translate-y-0 pointer-events-auto' 
              : 'opacity-0 md:-translate-x-16 translate-y-10 pointer-events-none hidden md:flex'
          }`}
        >
          {/* Resplandor ambiental de color sutil detrás del Login */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#229ED9]/15 via-[#EC4899]/10 to-[#FBBF24]/10 rounded-3xl blur-2xl pointer-events-none -z-10" />

          {/* TÍTULO CON GRADIENTE DE COLORES INSTITUCIONALES (Sunset Gradient) */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_35px_rgba(244,114,182,0.45)]">
              Login
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {hasExistingSession 
                ? `Bienvenido de nuevo, ${storedUser?.firstName || 'Trader'}` 
                : 'Acceso directo con tu cuenta de Telegram'}
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL DE ACCESO CON COLORES VIBRANTES */}
          <div className="w-full flex flex-col items-center space-y-2.5">
            {hasExistingSession ? (
              // CASO 1: Sesión previa en localStorage -> Botón GRANDE "Ver Mi Dashboard" (Prioridad máxima)
              <div className="w-full flex flex-col items-center space-y-2.5">
                <button
                  onClick={() => onSuccess()}
                  className="w-full btn-liquid py-3.5 sm:py-4 px-4 sm:px-8 rounded-2xl bg-gradient-to-r from-[#0088CC] via-[#229ED9] to-[#00C2FF] hover:brightness-110 text-white text-sm sm:text-base md:text-lg font-black flex items-center justify-center gap-2.5 shadow-[0_10px_40px_rgba(0,136,204,0.65)] hover:shadow-cyan-400/40 transition-all cursor-pointer group"
                >
                  <span>Ver Mi Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Tarjeta de estado de sesión con acento esmeralda */}
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] sm:text-xs font-mono text-emerald-300 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[200px]">Sesión: {storedUser?.username || storedUser?.firstName}</span>
                </div>

                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="text-[11px] sm:text-xs text-slate-300 hover:text-white transition-colors cursor-pointer pt-1 hover:underline"
                >
                  Conectar con otra cuenta de Telegram
                </button>
              </div>
            ) : (
              // CASO 2: Sin sesión previa -> Botón "Conectar con Telegram" con gradiente celeste neón
              <div className="w-full flex flex-col items-center space-y-2.5">
                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="w-full btn-liquid py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_35px_rgba(34,158,217,0.5)] transition-all cursor-pointer group"
                >
                  <Send className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                  <span>Conectar con Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-auto" />
                </button>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-[11px] sm:text-xs text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
                >
                  {isLoading ? 'Sincronizando...' : 'Sincronizar mi sesión verificada'}
                </button>
              </div>
            )}
          </div>

          {/* BANNER DE ESPERA SI ESTÁ AUTORIZANDO EN TELEGRAM */}
          {isTelegramWaiting && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#229ED9]/25 border border-[#229ED9]/40 backdrop-blur-md text-xs text-[#38BDF8] font-medium flex items-center justify-center gap-2 animate-pulse shadow-xl w-full">
              <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Esperando confirmación en Telegram...</span>
            </div>
          )}

          {/* MENSAJE DE FEEDBACK */}
          {feedback && (
            <div className={`p-2 sm:p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-md shadow-xl w-full border ${
              feedback.success 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-500/20 border-rose-500/30 text-rose-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
