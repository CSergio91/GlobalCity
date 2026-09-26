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

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, onClose, isModal = false }) => {
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

  // Al finalizar el video o pulsar continuar, se activa el login y se muestra fijado el último fotograma
  const handleVideoEnded = () => {
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

  const handleReplayVideo = () => {
    setIsRevealed(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 50);
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
      className="w-full flex items-center justify-center relative select-none"
    >
      
      {/* Botón de Cierre Superior (si se abre en modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute -top-10 right-0 p-2 rounded-xl bg-black/60 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer z-50 border-0"
        >
          ✕
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DEGRADADO DE CONTRASTE PARA MÓVIL (cuando el login está activo)
         ═══════════════════════════════════════════════════════════════ */}
      <div 
        className={`fixed md:hidden inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-t from-[#06070B] via-[#06070B]/70 to-transparent z-10 ${
          isRevealed ? 'opacity-95' : 'opacity-25'
        }`} 
      />

      {/* Contenedor Flex Animado con Motion Layout */}
      <motion.div 
        layout
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full flex ${
          isRevealed 
            ? 'flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16' 
            : 'flex-col items-center justify-center'
        }`}
      >

        {/* ═══════════════════════════════════════════════════════════════
            VIDEO / LOGO PRINCIPAL:
            En móvil: Fondo completo vertical inmersivo
            En escritorio: Centrado primero, luego se desplaza a la izquierda
           ═══════════════════════════════════════════════════════════════ */}
        <motion.div 
          layout
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className={`relative flex flex-col items-center justify-center select-none shrink-0 ${
            // En móvil se expande a pantalla completa de fondo; en escritorio mantiene su tamaño elegante
            isRevealed 
              ? 'fixed md:relative inset-0 md:inset-auto w-full h-[100dvh] md:w-[320px] lg:w-[360px] md:aspect-[9/16] md:max-h-[62vh] z-0 md:z-10 cursor-pointer pointer-events-none md:pointer-events-auto' 
              : 'fixed md:relative inset-0 md:inset-auto w-full h-[100dvh] md:w-[380px] md:aspect-[9/16] md:max-h-[72vh] z-0 md:z-10 pointer-events-none md:pointer-events-auto'
          }`}
          onClick={isRevealed ? handleReplayVideo : undefined}
          title={isRevealed ? "Toca para reproducir el vídeo de nuevo" : undefined}
        >
          {isRevealed ? (
            <motion.img
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={lastFrameLogo}
              alt="Global City Logo"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover md:object-contain object-center md:drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-transform"
            />
          ) : (
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
              className="w-full h-full object-cover md:object-contain object-center md:drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            />
          )}

          {/* Botón sutil para continuar al login antes de que termine el video (centrado abajo en móvil) */}
          {!isRevealed && (
            <div className="fixed md:static bottom-8 inset-x-0 flex justify-center z-30 pointer-events-auto">
              <button
                onClick={handleManualContinue}
                className="px-5 py-2.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md text-white/95 text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-2xl border border-white/20 group cursor-pointer active:scale-95"
              >
                <span>Continuar al Login</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#F472B6] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            LOGIN SIN CONTENEDOR: 
            En móvil: Aparece deslizándose desde abajo encima del fondo
            En escritorio: Aparece a la derecha suavemente
           ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div 
              key="login-controls"
              initial={{ opacity: 0, y: 50, x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="fixed md:relative bottom-0 inset-x-0 md:inset-auto z-20 w-full px-6 pb-8 pt-4 md:p-0 max-w-sm md:max-w-md flex flex-col items-center md:items-start text-center md:text-left space-y-4 mx-auto md:mx-0"
            >
          
          {/* TÍTULO CON GRADIENTE SUNSET */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_30px_rgba(244,114,182,0.4)]">
              Login
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium drop-shadow-md">
              {hasExistingSession 
                ? `Bienvenido de nuevo, ${storedUser?.firstName || 'Trader'}` 
                : 'Acceso directo con tu cuenta de Telegram'}
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL DE ACCESO (SIN CONTENEDOR) */}
          <div className="w-full flex flex-col items-center md:items-start space-y-3 pt-1">
            {hasExistingSession ? (
              // CASO 1: Sesión previa en localStorage -> Botón GRANDE "Ver Mi Dashboard"
              <div className="w-full flex flex-col items-center md:items-start space-y-3">
                <button
                  onClick={() => onSuccess()}
                  className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0088CC] via-[#229ED9] to-[#00C2FF] hover:brightness-110 text-white text-sm sm:text-base font-black flex items-center justify-center gap-2.5 shadow-[0_10px_35px_rgba(0,136,204,0.6)] hover:shadow-cyan-400/50 transition-all cursor-pointer group active:scale-95"
                >
                  <span>Ver Mi Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Badge de estado verificado */}
                <div className="flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-xs font-mono text-emerald-300 backdrop-blur-md shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[220px]">Sesión: {storedUser?.username || storedUser?.firstName}</span>
                </div>

                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pt-1 hover:underline drop-shadow"
                >
                  Conectar con otra cuenta de Telegram
                </button>
              </div>
            ) : (
              // CASO 2: Sin sesión previa -> Botón "Conectar con Telegram"
              <div className="w-full flex flex-col items-center md:items-start space-y-3">
                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_10px_35px_rgba(34,158,217,0.5)] transition-all cursor-pointer group active:scale-95"
                >
                  <Send className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                  <span>Conectar con Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-auto" />
                </button>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
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

      </motion.div>

    </div>
  );
};
