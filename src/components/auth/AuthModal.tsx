import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, AuthResult } from '../../services/authService';
import { BrandLogo } from '../BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithTelegram, loginAsDemo } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);

  const telegramContainerRef = useRef<HTMLDivElement>(null);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'GlobalCityTradingBot';

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setIsTelegramWaiting(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Load official Telegram Login Widget if container exists
  useEffect(() => {
    if (isOpen && telegramContainerRef.current) {
      telegramContainerRef.current.innerHTML = '';
      
      // Expose globally for Telegram Widget callback
      (window as any).onTelegramAuth = (user: any) => {
        handleTelegramSuccess(user);
      };

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.async = true;
      telegramContainerRef.current.appendChild(script);
    }
  }, [isOpen, botUsername]);

  if (!isOpen) return null;

  const handleTelegramSuccess = (telegramUser: any) => {
    authService.loginWithTelegram(telegramUser).then((result) => {
      setFeedback(result);
      if (result.success && result.user) {
        loginWithTelegram(telegramUser);
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    });
  };

  const [authSessionNonce, setAuthSessionNonce] = useState('');

  // Polling automático para detectar cuando el usuario pulsa START en el bot oficial de Telegram
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

  /**
   * Abre Telegram OAuth real con el bot de la plataforma
   */
  const handleLaunchTelegramOAuth = () => {
    const nonce = `auth_${Date.now()}`;
    setAuthSessionNonce(nonce);
    setIsTelegramWaiting(true);
    setFeedback({
      success: true,
      type: 'TAKE_PROFIT',
      message: `Abriendo Telegram... Pulsa "INICIAR" en @${botUsername} para autorizar tu acceso.`
    });

    const telegramOAuthUrl = `https://t.me/${botUsername}?start=${nonce}`;
    window.open(telegramOAuthUrl, '_blank');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    let result: AuthResult;
    if (tab === 'login') {
      result = await authService.loginWithEmail(email, password);
    } else {
      result = await authService.registerWithEmail(email, password, confirmPassword);
    }

    setFeedback(result);
    setIsLoading(false);

    if (result.success && result.user) {
      setTimeout(() => {
        onSuccess();
      }, 700);
    }
  };

  const handleDemoLogin = () => {
    const result = authService.loginAsDemo();
    setFeedback(result);
    loginAsDemo();
    setTimeout(() => {
      onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Container */}
      <div className="relative w-full max-w-[420px] bg-[#10121A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E06D8A] to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heading */}
        <div className="text-center mb-5">
          <div className="inline-flex justify-center mb-2">
            <BrandLogo size="sm" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {tab === 'login' ? 'Acceso Institucional' : 'Crear Cuenta'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Global City Trading Terminal
          </p>
        </div>

        {/* Trading Feedback Banner: TAKE PROFIT vs STOP LOSS vs MARGIN CALL */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-xl border text-xs leading-relaxed animate-in slide-in-from-top-1 duration-150 ${
            feedback.type === 'TAKE_PROFIT'
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : feedback.type === 'MARGIN_CALL'
              ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
              : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider text-[11px] mb-0.5">
              {feedback.type === 'TAKE_PROFIT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {feedback.type === 'MARGIN_CALL' && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
              {feedback.type === 'STOP_LOSS' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
              <span>{feedback.type.replace('_', ' ')}</span>
            </div>
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Section 1: Telegram OAuth 2.0 */}
        <div className="space-y-3">
          
          {/* Telegram OAuth Trigger Button */}
          {!isTelegramWaiting ? (
            <button
              type="button"
              onClick={handleLaunchTelegramOAuth}
              className="w-full py-2.5 px-4 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#229ED9]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white text-[#229ED9]" />
              <span>Autorizar con Telegram</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#161924] border border-[#229ED9]/40 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9] animate-ping" />
                  Esperando confirmación en Telegram...
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Hemos abierto Telegram para que autorices el acceso en el bot oficial <strong className="text-white">@{botUsername}</strong>.
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSimulateTelegramAccept}
                  disabled={isLoading}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Confirmar Autorización</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTelegramWaiting(false)}
                  className="py-1.5 px-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Official Telegram Widget Container */}
          <div ref={telegramContainerRef} className="flex justify-center my-1" />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3.5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#10121A] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              o con email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Section 2: Standard Form (Supabase Ready) */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Email Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFeedback(null);
                }}
                placeholder="trader@institucion.com"
                required
                className="w-full px-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E06D8A]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFeedback(null);
                }}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full px-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#E06D8A]"
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full px-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#E06D8A]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E06D8A]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Verificando...' : tab === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle Tab Login / Register */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => {
                setTab(tab === 'login' ? 'register' : 'login');
                setFeedback(null);
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {tab === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[#E06D8A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Modo Demo</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
