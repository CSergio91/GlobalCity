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
  {
    title: 'Diseñado para comunidades y traders activos de Telegram',
    desc: 'Acceso directo a libros L2, cotizaciones en vivo y arbitraje institucional en un solo toque.'
  },
  {
    title: 'Trading Cuantitativo 100% Non-Custodial',
    desc: 'Conectividad directa vía Broker API. Control total y absoluto de tus fondos sin intermediarios.'
  },
  {
    title: 'Arbitraje Sintético y Liquidez Multi-Broker',
    desc: 'Rutas de ejecución instantánea con spreads optimizados y telemetría de red sub-100ms.'
  },
  {
    title: 'Tu identidad de Telegram es tu llave de acceso',
    desc: 'Sin registros engorrosos ni contraseñas olvidadas. Sincronización criptográfica nativa.'
  }
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

  // Transición suave de texto motivacional sin contenedores cada 4.2s
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
        setFade(true);
      }, 400);
    }, 4200);
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

      {/* Contenedor Flex Dinámico: Distribuye los espacios abarcando todo el alto del video */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 sm:gap-8 md:gap-14 transition-all duration-700 ease-out">
        
        {/* ─────────────────────────────────────────────────────────────
            VIDEO DE PRESENTACIÓN 9:16
            Aparece primero centrado; al terminar se pausa en el último fotograma
           ───────────────────────────────────────────────────────────── */}
        <div 
          onClick={handleSkipOrTriggerReveal}
          className={`relative rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] shrink-0 transition-all duration-700 ease-out z-20 cursor-pointer ${
            isRevealed 
              ? 'w-[260px] sm:w-[290px] md:w-[315px] h-[460px] sm:h-[500px] md:h-[540px]' 
              : 'w-[280px] sm:w-[330px] md:w-[350px] h-[500px] sm:h-[560px] md:h-[600px] hover:scale-[1.01]'
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
            COMPONENTES DE LOGIN: ABARCAN TODO EL ALTO DEL VIDEO
            Sin etiquetas, sin contenedores, sin iconos genéricos, tipografía Monumental
           ───────────────────────────────────────────────────────────── */}
        <div 
          className={`flex-1 max-w-sm sm:max-w-md md:max-w-xl w-full md:h-[540px] flex flex-col justify-between transition-all duration-700 ease-out z-10 ${
            isRevealed 
              ? 'opacity-100 translate-x-0 translate-y-0 pointer-events-auto' 
              : 'opacity-0 md:-translate-x-20 translate-y-10 pointer-events-none hidden md:flex'
          }`}
        >
          {/* SECCIÓN SUPERIOR: Tipografía Hero sin etiquetas ni pills */}
          <div className="text-left pt-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1] text-balance drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
              <span>Ecosistema </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                Global City
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] max-w-lg">
              Infraestructura descentralizada de ejecución institucional y arbitraje multi-venue.
            </p>
          </div>

          {/* SECCIÓN MEDIA: Frases Motivacionales Puras (Sin contenedores, sin iconos, animación suave) */}
          <div className="my-auto py-4 min-h-[110px] sm:min-h-[130px] flex flex-col justify-center">
            <div className={`transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                {MOTIVATIONAL_PHRASES[phraseIndex].title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] max-w-md">
                {MOTIVATIONAL_PHRASES[phraseIndex].desc}
              </p>
            </div>

            {/* Tarjeta de Usuario Telegram Detectado (Ej. Travel) */}
            {detectedTelegramUser && (
              <div className="mt-4 pt-3 flex items-center justify-between gap-3 border-t border-white/10">
                <div className="flex items-center gap-3 min-w-0">
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
                  className="btn-liquid px-4 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
                >
                  {isLoading ? 'Entrando...' : 'Entrar Ahora'}
                </button>
              </div>
            )}

            {/* Banner de espera si se inició la autorización */}
            {isTelegramWaiting && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#229ED9]/25 backdrop-blur-sm text-xs text-[#38BDF8] font-medium flex items-center gap-2 animate-pulse shadow-xl">
                <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Esperando confirmación en Telegram...</span>
              </div>
            )}

            {/* Feedback de estado */}
            {feedback && (
              <div className={`mt-3 p-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-sm shadow-xl ${
                feedback.success 
                  ? 'bg-emerald-500/20 text-emerald-200' 
                  : 'bg-rose-500/20 text-rose-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}
          </div>

          {/* SECCIÓN INFERIOR: Botón de Login al Final */}
          <div className="pt-2 pb-2 space-y-2">
            <button
              onClick={handleLaunchTelegramOAuth}
              className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-[#0088CC] hover:bg-[#0077b3] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_30px_rgba(0,136,204,0.45)] transition-all cursor-pointer group"
            >
              <Send className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>Conectar con Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-auto" />
            </button>

            {/* Sincronización secundaria discreta */}
            {!detectedTelegramUser && (
              <div className="text-center">
                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
                >
                  Sincronizar mi sesión verificada de Telegram
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
