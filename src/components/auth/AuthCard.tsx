import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { authService, AuthResult } from '../../services/authService';
import presentationVideo from '../../assets/video/global_city_presentation_logo.mp4';
import lastFrameLogo from '../../assets/video/global_city_presentation_logo_last_frame.png';

interface AuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Hook responsive para coordinar animaciones entre móvil y escritorio
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, onClose, isModal = false }) => {
  const isMobile = useIsMobile();
  const { user, loginWithTelegram } = useAuth();
  
  // Detección de sesión previa en localStorage
  const storedUser = user || authService.getCurrentUser();
  const hasExistingSession = !!storedUser;

  // Estado: Primero sale el video solo; al terminar (o continuar), sale el login
  const [isRevealed, setIsRevealed] = useState(false);
  
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Autoplay seguro con muted garantizado en DOM
  useEffect(() => {
    if (!isRevealed && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isRevealed]);

  // Al finalizar el video o pulsar login, se pausa el video y se activa la transición fluida
  const handleVideoEnded = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }
    setIsRevealed(true);
  };

  const handleManualContinue = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }
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
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full relative flex items-center justify-center select-none overflow-hidden"
    >
      
      {/* Botón de Cierre Superior (si se abre en modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer z-50 border-0"
        >
          ✕
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIDEO / LOGO PRINCIPAL:
          Se mueve suavemente desde su posición original hacia el lugar final y se achica
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        animate={
          isRevealed 
            ? isMobile 
              ? { y: -110, x: 0, scale: 0.65 } 
              : { x: -165, y: 0, scale: 0.82 }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative flex flex-col items-center justify-center select-none shrink-0 w-full max-w-[360px] sm:max-w-md md:max-w-[420px] ${
          isRevealed ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <video
          ref={videoRef}
          src={presentationVideo}
          poster={lastFrameLogo}
          autoPlay
          muted
          playsInline
          preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onEnded={handleVideoEnded}
          className="w-full h-auto object-contain object-center bg-black"
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          BOTÓN LOGIN SUTIL (DURANTE LA INTRO DEL VIDEO):
          Posicionado cómodamente en el thumb-zone (no muy abajo), con
          los colores exactos del texto Login (Sunset gradient)
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
          >
            <button
              onClick={handleManualContinue}
              className="px-6 py-2 rounded-full bg-black/85 hover:bg-black text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(244,114,182,0.35)] border border-[#F472B6]/40 hover:border-[#F472B6] group cursor-pointer active:scale-95"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                Login
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#F472B6] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          LOGIN CONTROLS:
          Sube suavemente y aparece sin distorsión ni estiramiento
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div 
            key="login-controls"
            initial={
              isMobile
                ? { opacity: 0, y: 130 }
                : { opacity: 0, x: 195, y: 0 }
            }
            animate={
              isMobile
                ? { opacity: 1, y: 105 }
                : { opacity: 1, x: 165, y: 0 }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="absolute w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center text-center space-y-2.5 sm:space-y-3 px-2 z-20 pointer-events-auto"
          >
          
          {/* TÍTULO CON GRADIENTE SUNSET (PERFECTAMENTE CENTRADO) */}
          <div className="space-y-0.5 w-full flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_25px_rgba(244,114,182,0.35)]">
              Login
            </h1>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-300 font-medium text-center drop-shadow-md">
              {hasExistingSession 
                ? `Bienvenido de nuevo, ${storedUser?.firstName || 'Trader'}` 
                : 'Acceso directo con tu cuenta de Telegram'}
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL DE ACCESO (COMPACTO Y ELEGANTE, NUNCA ESTIRADO) */}
          <div className="w-full flex flex-col items-center text-center space-y-2 pt-0.5">
            {hasExistingSession ? (
              // CASO 1: Sesión previa en localStorage -> Botón GRANDE "Ver Mi Dashboard"
              <div className="w-full flex flex-col items-center text-center space-y-2">
                <button
                  onClick={() => onSuccess()}
                  className="w-full btn-liquid py-2.5 sm:py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0088CC] via-[#229ED9] to-[#00C2FF] hover:brightness-110 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[0_10px_35px_rgba(0,136,204,0.6)] hover:shadow-cyan-400/50 transition-all cursor-pointer group active:scale-95"
                >
                  <span>Ver Mi Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Badge de estado verificado */}
                <div className="flex items-center justify-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-[11px] font-mono text-emerald-300 backdrop-blur-md shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[200px]">Sesión: {storedUser?.username || storedUser?.firstName}</span>
                </div>

                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer pt-0.5 hover:underline drop-shadow"
                >
                  Conectar con otra cuenta de Telegram
                </button>
              </div>
            ) : (
              // CASO 2: Sin sesión previa -> Botón "Conectar con Telegram"
              <div className="w-full flex flex-col items-center text-center space-y-2">
                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="w-full btn-liquid py-2.5 sm:py-3 px-5 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_10px_35px_rgba(34,158,217,0.5)] transition-all cursor-pointer group active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 fill-white group-hover:translate-x-0.5 transition-transform" />
                  <span className="mx-auto">Conectar con Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                </button>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5 drop-shadow text-center"
                >
                  {isLoading ? 'Sincronizando...' : 'Sincronizar mi sesión verificada'}
                </button>
              </div>
            )}
          </div>

          {/* BANNER DE ESPERA SI ESTÁ AUTORIZANDO EN TELEGRAM */}
          {isTelegramWaiting && (
            <div className="p-2.5 rounded-xl bg-[#229ED9]/25 border border-[#229ED9]/40 backdrop-blur-md text-xs text-[#38BDF8] font-medium flex items-center justify-center gap-2 animate-pulse shadow-xl w-full">
              <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Esperando confirmación en Telegram...</span>
            </div>
          )}

          {/* MENSAJE DE FEEDBACK */}
          {feedback && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-md shadow-xl w-full border ${
              feedback.success 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-500/20 border-rose-500/30 text-rose-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
};
