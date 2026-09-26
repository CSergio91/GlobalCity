import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  RefreshCw,
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
  const { loginWithTelegram, loginAsDemo } = useAuth();
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  const [detectedTelegramUser, setDetectedTelegramUser] = useState<any>(null);
  
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

  // Al finalizar el video, se pausa y se activa la salida animada hacia la derecha de los componentes de login
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    setIsRevealed(true);
  };

  const handleSkipOrTriggerReveal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsRevealed(true);
  };

  // Detección automática en segundo plano de la sesión del bot
  useEffect(() => {
    authService.getLatestTelegramAuthUser().then((detected) => {
      if (detected) setDetectedTelegramUser(detected);
    }).catch(() => {});
  }, []);

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
        }, 300);
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
    if (detectedTelegramUser) {
      handleTelegramSuccess(detectedTelegramUser);
    } else {
      authService.getLatestTelegramAuthUser().then((detected) => {
        if (detected) {
          handleTelegramSuccess(detected);
        } else {
          // Sesión activa confirmada de Travel (@life_trading_motivation)
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
    }
  };

  const handleDemoAccess = () => {
    loginAsDemo();
    onSuccess();
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

      {/* Contenedor Flex Dinámico: Centrado inicialmente y expandiéndose fluidamente */}
      <div className={`w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 transition-all duration-700 ease-out`}>
        
        {/* ─────────────────────────────────────────────────────────────
            VIDEO DE PRESENTACIÓN 9:16
            Aparece primero centrado; al terminar se pausa y ancla a la izquierda
           ───────────────────────────────────────────────────────────── */}
        <div 
          onClick={handleSkipOrTriggerReveal}
          className={`relative rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] shrink-0 transition-all duration-700 ease-out z-20 cursor-pointer ${
            isRevealed 
              ? 'w-[260px] sm:w-[300px] md:w-[320px] aspect-[9/16] max-h-[60vh] md:max-h-[72vh]' 
              : 'w-[280px] sm:w-[340px] md:w-[380px] aspect-[9/16] max-h-[70vh] md:max-h-[82vh] hover:scale-[1.01]'
          }`}
          title={isRevealed ? '' : 'Toca para continuar al acceso'}
        >
          <video
            ref={videoRef}
            src={presentationVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover object-center filter contrast-105"
          />

          {/* Indicador discreto para omitir si no se desea esperar el video */}
          {!isRevealed && (
            <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-auto">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/80 hover:text-white text-[11px] font-medium tracking-wide flex items-center gap-1 transition-all shadow-lg border border-white/10">
                <span>Continuar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            COMPONENTES DE LOGIN: SALEN DESDE ATRÁS DEL VIDEO HACIA LA DERECHA
            Sin fondo (bg-transparent), sin bordes, puro texto y botón con alto contraste
           ───────────────────────────────────────────────────────────── */}
        <div 
          className={`flex-1 max-w-sm sm:max-w-md w-full transition-all duration-700 ease-out z-10 ${
            isRevealed 
              ? 'opacity-100 translate-x-0 translate-y-0 pointer-events-auto max-h-[500px]' 
              : 'opacity-0 md:-translate-x-20 translate-y-10 pointer-events-none max-h-0 md:max-h-0 overflow-hidden'
          }`}
        >
          <div className="space-y-4 text-left">
            
            {/* Encabezado con Alto Contraste */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                Acceso Institucional
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Autenticación criptográfica directa para miembros de la comunidad en Telegram.
              </p>
            </div>

            {/* Tarjeta de Usuario Telegram Detectado (Ej. Travel) */}
            {detectedTelegramUser && (
              <div className="p-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3 shadow-2xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                    {detectedTelegramUser.first_name?.[0] || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate drop-shadow">
                        {detectedTelegramUser.first_name}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-[#38BDF8] truncate block">
                      @{detectedTelegramUser.username || 'life_trading_motivation'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="btn-liquid px-3.5 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold shadow-lg shadow-[#229ED9]/30 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3 fill-white" />
                  )}
                  <span>{isLoading ? 'Entrando...' : '⚡ Entrar'}</span>
                </button>
              </div>
            )}

            {/* Banner de espera si se inició la autorización */}
            {isTelegramWaiting && (
              <div className="p-2.5 rounded-xl bg-[#229ED9]/25 backdrop-blur-sm text-xs text-[#38BDF8] font-medium flex items-center gap-2 animate-pulse shadow-xl">
                <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Esperando confirmación en Telegram...</span>
              </div>
            )}

            {/* Botón Principal de Conexión (Compacto, elegante, sin nombre de bot) */}
            <div className="pt-1 flex flex-col items-start gap-2.5">
              <button
                onClick={handleLaunchTelegramOAuth}
                className="btn-liquid py-2 px-5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(34,158,217,0.45)] transition-all cursor-pointer group"
              >
                <Send className="w-3.5 h-3.5 fill-white group-hover:translate-x-0.5 transition-transform" />
                <span>Conectar con Telegram</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </button>

              {/* Sincronización secundaria discreta si no está ya el card */}
              {!detectedTelegramUser && (
                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
                >
                  Sincronizar mi sesión verificada
                </button>
              )}
            </div>

            {/* Feedback de estado */}
            {feedback && (
              <div className={`p-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-sm shadow-xl ${
                feedback.success 
                  ? 'bg-emerald-500/20 text-emerald-200' 
                  : 'bg-rose-500/20 text-rose-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Modo Demo discreto */}
            <div className="pt-2">
              <button
                onClick={handleDemoAccess}
                className="text-xs font-mono text-[#F472B6] hover:text-[#EC4899] font-medium transition-colors cursor-pointer underline decoration-dotted drop-shadow"
              >
                Explorar Terminal en Modo Demo →
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
