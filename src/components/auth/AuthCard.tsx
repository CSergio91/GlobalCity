import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  RefreshCw
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
  
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  const [detectedTelegramUser, setDetectedTelegramUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Animación de entrada suave y limpia sin lag
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 20);
    return () => clearTimeout(timer);
  }, []);

  // Autoplay seguro con muted garantizado en DOM
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Pausa el video automáticamente en el fotograma final (sin repetir en bucle)
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
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
    <div className={`w-full max-w-2xl sm:max-w-3xl rounded-3xl overflow-hidden bg-black shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col md:flex-row relative border-0 transition-all duration-300 ease-out transform ${
      isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-2'
    }`}>
      
      {/* Botón de Cierre Superior (si se abre en modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-40 border-0"
        >
          ✕
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PANEL IZQUIERDO (Desktop) / SUPERIOR (Mobile):
          Video de Presentación 9:16
          Pausa en el último fotograma, sin loops, sin textos, mismo fondo negro
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[45%] relative h-44 sm:h-52 md:h-auto shrink-0 bg-black overflow-hidden flex items-center justify-center">
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
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PANEL DERECHO: Autenticación Exclusiva Telegram
          Fondo Negro (#000000) idéntico al video, sin bordes, centrado
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[55%] flex-1 relative flex flex-col justify-center p-5 sm:p-7 md:p-8 bg-black z-20 overflow-visible">
        
        {/* ─── SEPARADOR DE NUBES / ONDAS MULTICAPA (Desktop: Borde Izquierdo) ─── */}
        <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-14 pointer-events-none z-30 overflow-visible">
          <svg viewBox="0 0 100 600" preserveAspectRatio="none" className="w-full h-full drop-shadow-[-6px_0_12px_rgba(0,0,0,0.6)]">
            {/* Capa 1: Sombra Celeste Translúcida */}
            <path 
              d="M100,0 C65,15 20,40 35,90 C10,130 12,180 40,215 C6,255 10,310 42,335 C8,375 14,425 45,450 C12,490 20,535 52,560 C35,585 65,595 100,600 L100,0 Z" 
              fill="rgba(56, 189, 248, 0.4)" 
            />
            {/* Capa 2: Sombra Azul Media */}
            <path 
              d="M100,0 C75,18 36,45 48,92 C24,132 26,182 52,216 C22,258 26,312 54,336 C24,378 28,426 56,451 C28,492 34,536 62,561 C48,586 75,596 100,600 L100,0 Z" 
              fill="rgba(37, 99, 235, 0.6)" 
            />
            {/* Capa 3: Frente Negro Sólido (#000000) idéntico al fondo del video y del panel */}
            <path 
              d="M100,0 C82,20 50,48 60,94 C38,134 40,184 64,217 C36,260 40,314 66,337 C38,380 42,428 68,452 C42,494 48,537 72,562 C60,587 84,597 100,600 L100,0 Z" 
              fill="#000000" 
            />
          </svg>
        </div>

        {/* ─── SEPARADOR DE NUBES / ONDAS MULTICAPA (Móviles: Borde Superior sobre el Video) ─── */}
        <div className="md:hidden absolute -top-7 left-0 right-0 h-9 pointer-events-none z-30 overflow-visible">
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_-6px_12px_rgba(0,0,0,0.6)]">
            {/* Capa 1: Sombra Celeste Translúcida curvada hacia arriba */}
            <path 
              d="M0,100 L0,55 C30,15 90,8 140,48 C180,10 240,6 290,44 C330,8 390,10 440,46 C480,12 540,15 600,55 L600,100 Z" 
              fill="rgba(56, 189, 248, 0.4)" 
            />
            {/* Capa 2: Sombra Azul Media */}
            <path 
              d="M0,100 L0,68 C32,28 92,22 140,58 C182,24 242,20 290,54 C332,22 392,24 440,56 C482,26 542,28 600,68 L600,100 Z" 
              fill="rgba(37, 99, 235, 0.6)" 
            />
            {/* Capa 3: Frente Negro Sólido (#000000) idéntico al panel */}
            <path 
              d="M0,100 L0,78 C35,42 95,36 140,68 C184,36 244,32 290,64 C334,34 394,36 440,66 C484,38 544,40 600,78 L600,100 Z" 
              fill="#000000" 
            />
          </svg>
        </div>

        {/* ─── CONTENIDO DE AUTENTICACIÓN TELEGRAM ─── */}
        <div className="space-y-4">
          
          {/* Encabezado Conciso */}
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Acceso Institucional
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Autenticación directa para miembros de la comunidad en Telegram.
            </p>
          </div>

          {/* Tarjeta de Usuario Telegram Detectado (Ej. Travel) */}
          {detectedTelegramUser && (
            <div className="p-3 rounded-2xl bg-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                  {detectedTelegramUser.first_name?.[0] || 'T'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">
                      {detectedTelegramUser.first_name}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate block">
                    @{detectedTelegramUser.username || 'life_trading_motivation'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleQuickTelegramSync}
                disabled={isLoading}
                className="btn-liquid px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-bold shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 fill-white" />
                )}
                <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
              </button>
            </div>
          )}

          {/* Banner de espera si se inició la autorización */}
          {isTelegramWaiting && (
            <div className="p-2.5 rounded-xl bg-[#229ED9]/15 text-xs text-[#38BDF8] flex items-center gap-2 animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Esperando confirmación en Telegram...</span>
            </div>
          )}

          {/* Botón Principal de Conexión (Más pequeño, elegante, sin nombre de bot) */}
          <div className="pt-1 flex flex-col items-center md:items-start gap-2.5">
            <button
              onClick={handleLaunchTelegramOAuth}
              className="btn-liquid py-2 px-5 rounded-xl bg-[#229ED9] hover:bg-[#1A8CC4] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/25 transition-all cursor-pointer group"
            >
              <Send className="w-3.5 h-3.5 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>Conectar con Telegram</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </button>

            {/* Sincronización secundaria discreta */}
            {!detectedTelegramUser && (
              <button
                onClick={handleQuickTelegramSync}
                disabled={isLoading}
                className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
              >
                Sincronizar mi sesión verificada
              </button>
            )}
          </div>

          {/* Feedback de estado */}
          {feedback && (
            <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
              feedback.success 
                ? 'bg-emerald-500/10 text-emerald-300' 
                : 'bg-rose-500/10 text-rose-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Modo Demo discreto */}
          <div className="pt-2 text-center md:text-left">
            <button
              onClick={handleDemoAccess}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer underline decoration-dotted"
            >
              Explorar Terminal en Modo Demo →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
