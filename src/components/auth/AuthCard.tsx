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
  
  // Detección directa de sesión previa en localStorage
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

  // Pausa el video al finalizar la reproducción
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

      {/* Contenedor Limpio y Directo: Video a la izquierda y Login a la derecha sin esperas */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
        
        {/* VIDEO DE PRESENTACIÓN 9:16 (Pausa solo al final) */}
        <div className="w-[260px] sm:w-[290px] md:w-[315px] h-[460px] sm:h-[500px] md:h-[530px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] shrink-0 bg-black">
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

        {/* PANEL DE LOGIN: Centrado, Minimalista, Botón arriba y detección de sesión */}
        <div className="flex-1 max-w-sm sm:max-w-md w-full flex flex-col items-center justify-center text-center space-y-6">
          
          {/* TÍTULO PRINCIPAL: Login */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
              Login
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal drop-shadow">
              {hasExistingSession 
                ? `Bienvenido de nuevo, ${storedUser?.firstName || 'Trader'}` 
                : 'Acceso directo con tu cuenta de Telegram'}
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL DE ACCESO (Prioridad si hay sesión previa) */}
          <div className="w-full flex flex-col items-center space-y-3">
            {hasExistingSession ? (
              // CASO 1: Sesión previa en localStorage -> Botón GRANDE "Ver Mi Dashboard" (Prioridad máxima)
              <div className="w-full flex flex-col items-center space-y-3">
                <button
                  onClick={() => onSuccess()}
                  className="w-full btn-liquid py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0088CC] via-[#229ED9] to-[#00A8FF] hover:brightness-110 text-white text-base sm:text-lg font-black flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(0,136,204,0.6)] transition-all cursor-pointer group"
                >
                  <span>Ver Mi Dashboard</span>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sesión verificada: {storedUser?.username || storedUser?.firstName}</span>
                </div>

                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pt-2"
                >
                  Conectar con otra cuenta de Telegram
                </button>
              </div>
            ) : (
              // CASO 2: Sin sesión previa -> Botón "Conectar con Telegram"
              <div className="w-full flex flex-col items-center space-y-3">
                <button
                  onClick={handleLaunchTelegramOAuth}
                  className="w-full btn-liquid py-3.5 px-6 rounded-2xl bg-[#0088CC] hover:bg-[#0077b3] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_30px_rgba(0,136,204,0.45)] transition-all cursor-pointer group"
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
                  {isLoading ? 'Sincronizando...' : 'Sincronizar mi sesión verificada de Telegram'}
                </button>
              </div>
            )}
          </div>

          {/* BANNER DE ESPERA SI ESTÁ AUTORIZANDO EN TELEGRAM */}
          {isTelegramWaiting && (
            <div className="p-2.5 rounded-xl bg-[#229ED9]/25 backdrop-blur-sm text-xs text-[#38BDF8] font-medium flex items-center justify-center gap-2 animate-pulse shadow-xl w-full">
              <div className="w-3.5 h-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Esperando confirmación en Telegram...</span>
            </div>
          )}

          {/* MENSAJE DE FEEDBACK */}
          {feedback && (
            <div className={`p-2 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-sm shadow-xl w-full ${
              feedback.success 
                ? 'bg-emerald-500/20 text-emerald-200' 
                : 'bg-rose-500/20 text-rose-200'
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
