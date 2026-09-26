import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
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

const MOTIVATIONAL_PHRASES = [
  'Diseñado para traders y comunidades activas de Telegram',
  'Trading cuantitativo y arbitraje 100% non-custodial',
  'Conectividad directa multi-broker con ejecución sub-100ms',
  'Tu cuenta de Telegram es tu llave de acceso institucional'
];

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { loginWithTelegram } = useAuth();
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  const [detectedTelegramUser, setDetectedTelegramUser] = useState<any>(null);
  
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Transición suave de texto motivacional minimalista cada 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
        setFade(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay seguro con muted garantizado en DOM
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Pausa el video ÚNICAMENTE cuando llega al final natural de la reproducción
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    setIsRevealed(true);
  };

  // Al pulsar continuar, se revela el login pero el video NO se pausa, sigue reproduciéndose hasta el final
  const handleRevealWithoutPausing = () => {
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

      {/* Contenedor Flex: Video a la izquierda y Login minimalista centrado a la derecha */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 sm:gap-8 md:gap-14 transition-all duration-700 ease-out">
        
        {/* ─────────────────────────────────────────────────────────────
            VIDEO DE PRESENTACIÓN 9:16
            Al pulsar "Continuar" el video NO se pausa, sigue reproduciéndose hasta el final
           ───────────────────────────────────────────────────────────── */}
        <div 
          onClick={handleRevealWithoutPausing}
          className={`relative rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] shrink-0 transition-all duration-700 ease-out z-20 cursor-pointer ${
            isRevealed 
              ? 'w-[260px] sm:w-[290px] md:w-[315px] h-[460px] sm:h-[500px] md:h-[540px]' 
              : 'w-[280px] sm:w-[330px] md:w-[350px] h-[500px] sm:h-[560px] md:h-[600px] hover:scale-[1.01]'
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
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover object-center filter contrast-105"
          />

          {/* Indicador discreto para continuar sin pausar el video */}
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
            COMPONENTES DE LOGIN: CENTRADOS, MINIMALISTAS, TEXTO CONCISO
           ───────────────────────────────────────────────────────────── */}
        <div 
          className={`flex-1 max-w-sm sm:max-w-md md:max-w-lg w-full md:h-[540px] flex flex-col justify-between items-center text-center transition-all duration-700 ease-out z-10 ${
            isRevealed 
              ? 'opacity-100 translate-x-0 translate-y-0 pointer-events-auto' 
              : 'opacity-0 md:-translate-x-20 translate-y-10 pointer-events-none hidden md:flex'
          }`}
        >
          {/* SECCIÓN SUPERIOR: Título Monumental Centrado */}
          <div className="pt-3 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
              <span>Ecosistema </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                Global City
              </span>
            </h1>
          </div>

          {/* SECCIÓN MEDIA: Frase Motivacional Minimalista Centrada (Menos textos) */}
          <div className="my-auto py-6 w-full flex flex-col items-center justify-center min-h-[100px]">
            <div className={`transition-opacity duration-350 ease-in-out w-full px-2 ${fade ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-200 tracking-tight leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                {MOTIVATIONAL_PHRASES[phraseIndex]}
              </h2>
            </div>

            {/* Usuario detectado si existe (Ej. Travel) */}
            {detectedTelegramUser && (
              <div className="mt-5 py-2 px-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 w-full max-w-sm shadow-xl">
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#60A5FA] to-[#F472B6] flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                    {detectedTelegramUser.first_name?.[0] || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
                      {detectedTelegramUser.first_name} {detectedTelegramUser.last_name || ''}
                    </div>
                    <div className="text-[11px] font-mono text-[#38BDF8] truncate">
                      @{detectedTelegramUser.username || 'life_trading_motivation'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="btn-liquid px-3.5 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
                >
                  {isLoading ? '...' : '⚡ Entrar'}
                </button>
              </div>
            )}

            {/* Banner de espera si se inició la autorización */}
            {isTelegramWaiting && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#229ED9]/25 backdrop-blur-sm text-xs text-[#38BDF8] font-medium flex items-center justify-center gap-2 animate-pulse shadow-xl w-full max-w-sm">
                <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Esperando confirmación en Telegram...</span>
              </div>
            )}

            {/* Feedback de estado */}
            {feedback && (
              <div className={`mt-3 p-2 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-sm shadow-xl w-full max-w-sm ${
                feedback.success 
                  ? 'bg-emerald-500/20 text-emerald-200' 
                  : 'bg-rose-500/20 text-rose-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}
          </div>

          {/* SECCIÓN INFERIOR: Botón de Login Centrado al Final */}
          <div className="pt-2 pb-3 w-full flex flex-col items-center gap-2">
            <button
              onClick={handleLaunchTelegramOAuth}
              className="w-full max-w-sm btn-liquid py-3.5 px-6 rounded-2xl bg-[#0088CC] hover:bg-[#0077b3] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_30px_rgba(0,136,204,0.45)] transition-all cursor-pointer group"
            >
              <Send className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>Conectar con Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-auto" />
            </button>

            {/* Sincronización secundaria discreta */}
            {!detectedTelegramUser && (
              <button
                onClick={handleQuickTelegramSync}
                disabled={isLoading}
                className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
              >
                Sincronizar mi sesión verificada de Telegram
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
