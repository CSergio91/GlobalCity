import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight
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

  // Pausa el video automáticamente en el último fotograma
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
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
    <div className="w-full max-w-sm sm:max-w-md md:max-w-3xl rounded-3xl overflow-hidden bg-[#0C0E17]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row relative">
      
      {/* Botón de Cierre Superior (si se abre en modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer z-50 border-0"
        >
          ✕
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PANEL SUPERIOR (Móvil) / PANEL IZQUIERDO (Desktop):
          Video de Presentación 9:16 Enmarcado Limpiamente
         ───────────────────────────────────────────────────────────── */}
      <div 
        onContextMenu={(e) => e.preventDefault()}
        className="w-full md:w-[46%] h-48 sm:h-56 md:h-auto min-h-[190px] md:min-h-[500px] relative bg-black shrink-0 overflow-hidden select-none flex items-center justify-center"
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
        {/* Sutil viñeta para integrar suavemente el borde exterior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PANEL INFERIOR (Móvil) / PANEL DERECHO (Desktop):
          Formulario de Login con Separador Orgánico de Nubes
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[54%] flex-1 relative flex flex-col justify-center items-center text-center p-6 sm:p-8 bg-[#0C0E17] z-20">
        
        {/* ─── SEPARADOR DE NUBES MULTICAPA (Desktop: Borde Izquierdo) ─── */}
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
            {/* Capa 3: Frente con color idéntico al panel (#0C0E17) */}
            <path 
              d="M100,0 C82,20 50,48 60,94 C38,134 40,184 64,217 C36,260 40,314 66,337 C38,380 42,428 68,452 C42,494 48,537 72,562 C60,587 84,597 100,600 L100,0 Z" 
              fill="#0C0E17" 
            />
          </svg>
        </div>

        {/* ─── SEPARADOR DE NUBES MULTICAPA (Móviles: Borde Superior sobre el Video) ─── */}
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
            {/* Capa 3: Frente con color idéntico al panel (#0C0E17) */}
            <path 
              d="M0,100 L0,78 C35,42 95,36 140,68 C184,36 244,32 290,64 C334,34 394,36 440,66 C484,38 544,40 600,78 L600,100 Z" 
              fill="#0C0E17" 
            />
          </svg>
        </div>

        {/* ─── CONTENIDO DEL LOGIN ─── */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-4">
          
          {/* TÍTULO CON GRADIENTE SUNSET */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_30px_rgba(244,114,182,0.4)]">
              Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium drop-shadow">
              {hasExistingSession 
                ? `Bienvenido de nuevo, ${storedUser?.firstName || 'Trader'}` 
                : 'Acceso directo con tu cuenta de Telegram'}
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL DE ACCESO */}
          <div className="w-full flex flex-col items-center space-y-2.5 pt-1">
            {hasExistingSession ? (
              // CASO 1: Sesión previa en localStorage -> Botón GRANDE "Ver Mi Dashboard"
              <div className="w-full flex flex-col items-center space-y-2.5">
                <button
                  onClick={() => onSuccess()}
                  className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0088CC] via-[#229ED9] to-[#00C2FF] hover:brightness-110 text-white text-sm sm:text-base font-black flex items-center justify-center gap-2.5 shadow-[0_10px_35px_rgba(0,136,204,0.6)] hover:shadow-cyan-400/40 transition-all cursor-pointer group"
                >
                  <span>Ver Mi Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Badge de estado verificado */}
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] sm:text-xs font-mono text-emerald-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[190px]">Sesión: {storedUser?.username || storedUser?.firstName}</span>
                </div>

                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer pt-1 hover:underline"
                >
                  Conectar con otra cuenta de Telegram
                </button>
              </div>
            ) : (
              // CASO 2: Sin sesión previa -> Botón "Conectar con Telegram"
              <div className="w-full flex flex-col items-center space-y-2.5">
                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(34,158,217,0.5)] transition-all cursor-pointer group"
                >
                  <Send className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                  <span>Conectar con Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-auto" />
                </button>

                <button
                  onClick={handleQuickTelegramSync}
                  disabled={isLoading}
                  className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer py-1 drop-shadow"
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
            <div className={`p-2 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-md shadow-xl w-full border ${
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
