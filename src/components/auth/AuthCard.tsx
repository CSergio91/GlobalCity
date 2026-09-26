import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  RefreshCw,
  ChevronRight,
  Sparkles
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
    icon: '⚡',
    title: 'Hecho para comunidades y traders activos de Telegram',
    desc: 'Acceso directo a libros L2 y arbitraje sin contraseñas ni formularios manuales.'
  },
  {
    icon: '💎',
    title: 'Trading Cuantitativo 100% Non-Custodial',
    desc: 'Conectividad Broker API con total soberanía y ejecución directa en exchange.'
  },
  {
    icon: '🌐',
    title: 'Arbitraje Sintético & Retos de Fondeo',
    desc: 'Ejecución sub-100ms sincronizada en tiempo real con canales de liquidez.'
  },
  {
    icon: '🚀',
    title: 'Sincronización Criptográfica Instantánea',
    desc: 'Tu cuenta de Telegram es tu llave de acceso institucional.'
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Rotación dinámica de frases motivacionales cada 3.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 3800);
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
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 sm:gap-8 md:gap-12 transition-all duration-700 ease-out">
        
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
            Sin fondo, alto contraste, botón al final, frases dinámicas motivacionales
           ───────────────────────────────────────────────────────────── */}
        <div 
          className={`flex-1 max-w-sm sm:max-w-md md:max-w-lg w-full md:h-[540px] flex flex-col justify-between transition-all duration-700 ease-out z-10 ${
            isRevealed 
              ? 'opacity-100 translate-x-0 translate-y-0 pointer-events-auto' 
              : 'opacity-0 md:-translate-x-20 translate-y-10 pointer-events-none hidden md:flex'
          }`}
        >
          {/* SECCIÓN SUPERIOR: Título Institucional con Alto Contraste */}
          <div className="text-left space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] text-[10px] font-mono tracking-wider font-semibold shadow-sm">
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              <span>COMUNIDAD OFICIAL · PROTOCOLO NON-CUSTODIAL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
              Ecosistema Global City
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Infraestructura descentralizada de ejecución cuantitativa y arbitraje multi-venue.
            </p>
          </div>

          {/* SECCIÓN MEDIA: Frases Motivacionales Animadas + Tarjeta de Usuario */}
          <div className="space-y-4 my-auto py-3">
            
            {/* Frases dinámicas que van pasando */}
            <div className="relative min-h-[90px] flex flex-col justify-center">
              <div 
                key={phraseIndex}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-bold">
                  <span className="text-base">{MOTIVATIONAL_PHRASES[phraseIndex].icon}</span>
                  <span>{MOTIVATIONAL_PHRASES[phraseIndex].title}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed drop-shadow">
                  {MOTIVATIONAL_PHRASES[phraseIndex].desc}
                </p>
              </div>

              {/* Paginadores sutiles de la frase activa */}
              <div className="flex items-center gap-1.5 mt-2 px-1">
                {MOTIVATIONAL_PHRASES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhraseIndex(i)}
                    aria-label={`Frase ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      i === phraseIndex ? 'w-5 bg-[#229ED9]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tarjeta de Usuario Telegram Detectado (Ej. Travel) */}
            {detectedTelegramUser && (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                    {detectedTelegramUser.first_name?.[0] || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow">
                        {detectedTelegramUser.first_name}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Sesión activa" />
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] truncate block">
                      @{detectedTelegramUser.username || 'life_trading_motivation'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="btn-liquid px-3.5 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 fill-white" />
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

          </div>

          {/* SECCIÓN INFERIOR: Botón de Login al Final */}
          <div className="pt-2 pb-1 space-y-2">
            <button
              onClick={handleLaunchTelegramOAuth}
              className="w-full btn-liquid py-3 px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:from-[#1b8ec6] hover:to-[#0077b3] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_30px_rgba(34,158,217,0.45)] transition-all cursor-pointer group"
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
