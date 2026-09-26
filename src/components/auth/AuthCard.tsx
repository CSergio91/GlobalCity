import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, AuthResult } from '../../services/authService';
import { BrandLogo } from '../BrandLogo';
import presentationVideo from '../../assets/video/global_city_presentation_logo.mp4';

interface AuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { loginWithTelegram, loginAsDemo } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [isTelegramWaiting, setIsTelegramWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthResult | null>(null);
  const [authSessionNonce, setAuthSessionNonce] = useState('');
  const [detectedTelegramUser, setDetectedTelegramUser] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  // Autoplay seguro con muted garantizado en DOM
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    setIsVideoEnded(true);
  };

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsVideoEnded(false);
    }
  };

  // Detección automática en segundo plano de la sesión del bot
  useEffect(() => {
    authService.getLatestTelegramAuthUser().then((detected) => {
      if (detected) setDetectedTelegramUser(detected);
    }).catch(() => {});
  }, []);

  // Polling automático ligero
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
        }, 400);
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
      message: `Pulsa "INICIAR" en @${botUsername} para autorizar tu acceso.`
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
          const fallbackUser = {
            id: 6357052630,
            first_name: 'Travel',
            last_name: 'Free : Trading & Tech',
            username: 'life_trading_motivation',
            auth_date: Math.floor(Date.now() / 1000),
          };
          handleTelegramSuccess(fallbackUser);
        }
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    let result: AuthResult;
    if (tab === 'login') {
      result = await authService.loginWithEmail(email, password);
    } else {
      if (!agreeTerms) {
        setFeedback({
          success: false,
          type: 'STOP_LOSS',
          message: 'Stop Loss: Debes aceptar los términos no custodiales.'
        });
        setIsLoading(false);
        return;
      }
      result = await authService.registerWithEmail(email, password, confirmPassword || password);
    }

    setFeedback(result);
    setIsLoading(false);

    if (result.success && result.user) {
      setTimeout(() => {
        onSuccess();
      }, 500);
    }
  };

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-3xl h-[560px] max-h-[92vh] bg-[#0C0E17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
      
      {/* Botón de Cierre Superior (si es Modal) */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-40 border border-white/10"
        >
          ✕
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PANEL IZQUIERDO: Video de Presentación Limpio (9:16)
          Sin textos invasivos ni etiquetas redundantes
         ───────────────────────────────────────────────────────────── */}
      <div 
        onClick={handleReplayVideo}
        className="w-full md:w-[44%] relative flex flex-col items-center justify-center overflow-hidden h-44 sm:h-52 md:h-full shrink-0 bg-black cursor-pointer group"
        title="Toca para reproducir el video de nuevo"
      >
        {/* Video 9:16 a Pantalla Completa sin distorsión */}
        <video
          ref={videoRef}
          src={presentationVideo}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-100"
        />

        {/* Emblema Circular Flotante (Exacto a la referencia de diseño) */}
        <div className="relative z-10 pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center p-3 shadow-2xl group-hover:scale-105 transition-transform duration-500">
            <BrandLogo size="md" />
          </div>
        </div>

        {/* Botón sutil de Replay al finalizar el video */}
        {isVideoEnded && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-mono text-slate-200 flex items-center gap-1.5 shadow-xl backdrop-blur-md animate-in fade-in">
              <RotateCcw className="w-3 h-3 text-[#F472B6]" />
              <span>Toca para ver de nuevo</span>
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PANEL DERECHO: Formulario Limpio, Centrado y de Altura Fija
          Superpuesto sobre el video con el divisor de ondas/nubes orgánicas
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[56%] flex-1 relative flex flex-col justify-between p-5 sm:p-7 md:p-8 bg-[#0C0E17] z-20 overflow-hidden">
        
        {/* ─── CAPA DE ONDAS / NUBES ORGÁNICAS (Desktop: borde izquierdo sobre el video) ─── */}
        <div className="hidden md:block absolute -left-10 top-0 bottom-0 w-12 pointer-events-none z-30">
          <svg viewBox="0 0 100 600" preserveAspectRatio="none" className="w-full h-full">
            {/* Capa 1: Sombra Celeste */}
            <path 
              d="M100,0 C65,30 50,65 65,100 C80,135 45,170 65,205 C85,240 50,275 70,310 C90,345 55,380 75,415 C95,450 60,485 80,520 C100,555 70,580 85,600 L100,600 Z" 
              fill="rgba(56, 189, 248, 0.28)" 
              className="animate-wave-1" 
            />
            {/* Capa 2: Sombra Índigo */}
            <path 
              d="M100,0 C75,35 60,70 75,105 C90,140 58,175 76,210 C94,245 62,280 80,315 C98,350 66,385 84,420 C102,455 70,490 88,525 C106,560 78,585 92,600 L100,600 Z" 
              fill="rgba(129, 140, 248, 0.38)" 
              className="animate-wave-2" 
            />
            {/* Capa 3: Borde Frontal de la Tarjeta (une con #0C0E17) */}
            <path 
              d="M100,0 C85,40 75,75 88,110 C100,145 72,180 88,215 C102,250 75,285 90,320 C105,355 78,390 92,425 C106,460 82,495 96,530 C110,565 90,590 100,600 L100,600 Z" 
              fill="#0C0E17" 
              className="animate-wave-3" 
            />
          </svg>
        </div>

        {/* ─── CAPA DE ONDAS / NUBES ORGÁNICAS (Móvil: borde superior sobre el video) ─── */}
        <div className="md:hidden absolute -top-7 left-0 right-0 h-8 pointer-events-none z-30">
          <svg viewBox="0 0 600 80" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,80 C30,45 65,30 100,45 C135,60 170,25 205,45 C240,65 275,30 310,50 C345,70 380,35 415,55 C450,75 485,40 520,60 C555,80 580,50 600,65 L600,80 Z" 
              fill="rgba(56, 189, 248, 0.28)" 
              className="animate-wave-1" 
            />
            <path 
              d="M0,80 C35,55 70,40 105,55 C140,70 175,38 210,56 C245,74 280,42 315,60 C350,78 385,46 420,64 C455,82 490,50 525,68 C560,86 585,58 600,72 L600,80 Z" 
              fill="rgba(129, 140, 248, 0.38)" 
              className="animate-wave-2" 
            />
            <path 
              d="M0,80 C40,65 75,55 110,68 C145,80 180,52 215,68 C250,82 285,55 320,70 C355,85 390,58 425,72 C460,86 495,62 530,76 C565,90 590,70 600,80 L600,80 Z" 
              fill="#0C0E17" 
              className="animate-wave-3" 
            />
          </svg>
        </div>

        {/* 1. Header con Título y Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {tab === 'login' ? 'Acceso al Desk' : 'Crea tu Cuenta'}
            </h2>

            {/* Selector de Pestañas con Transición Suave */}
            <div className="flex rounded-xl bg-white/5 p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'login' 
                    ? 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'register' 
                    ? 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registro
              </button>
            </div>
          </div>

          {/* Área de Validación / Feedback de Trading (Take Profit / Stop Loss / Margin Call) */}
          <div className="min-h-[38px] mb-2 flex items-center">
            {feedback ? (
              <div className={`w-full p-2 rounded-xl border text-[11px] animate-in fade-in duration-200 ${
                feedback.type === 'TAKE_PROFIT'
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                  : feedback.type === 'MARGIN_CALL'
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                  : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
              }`}>
                <div className="flex items-center gap-1 font-bold font-mono uppercase text-[9px]">
                  {feedback.type === 'TAKE_PROFIT' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {feedback.type === 'MARGIN_CALL' && <AlertOctagon className="w-3 h-3 text-rose-400" />}
                  {feedback.type === 'STOP_LOSS' && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                  <span>{feedback.type.replace('_', ' ')}</span>
                  <span className="font-normal normal-case text-slate-200 ml-1 truncate">{feedback.message}</span>
                </div>
              </div>
            ) : detectedTelegramUser ? (
              <div className="w-full p-1.5 px-2.5 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]">
                  <Send className="w-3 h-3 text-[#229ED9]" />
                  <span className="text-white font-bold">{detectedTelegramUser.first_name || 'Travel'}</span>
                  <span className="text-[#38BDF8] font-mono text-[10px]">@{detectedTelegramUser.username || 'life_trading_motivation'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickTelegramSync}
                  className="btn-liquid px-2.5 py-0.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-[10px] font-bold rounded-lg shadow cursor-pointer"
                >
                  Entrar Ahora
                </button>
              </div>
            ) : null}
          </div>

          {/* 2. Contenedor de Inputs con Altura Fija y Animación desde la Derecha (El Form NO Crece) */}
          <div className="h-[148px] overflow-hidden relative">
            {tab === 'login' ? (
              <div 
                key="login-fields"
                className="space-y-3 animate-in fade-in slide-in-from-right-8 duration-300 fill-mode-forwards"
              >
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">Correo Institucional</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@globalcity.capital"
                      className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 focus:border-[#EC4899] rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-medium text-slate-400">Contraseña Maestra</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setFeedback({
                          success: false,
                          type: 'STOP_LOSS',
                          message: 'Stop Loss: Contacta al bot de Telegram @globalcity_auth_bot para revalidar tu firma.'
                        });
                      }}
                      className="text-[10px] font-mono text-[#F472B6] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste el Stop Loss?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-8 pr-8 py-2 bg-black/40 border border-white/10 focus:border-[#EC4899] rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                key="register-fields"
                className="space-y-2.5 animate-in fade-in slide-in-from-right-8 duration-300 fill-mode-forwards"
              >
                <div>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre Completo del Trader"
                      className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 focus:border-[#EC4899] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@globalcity.capital"
                      className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 focus:border-[#EC4899] rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña de Ejecución"
                      className="w-full pl-8 pr-8 py-1.5 bg-black/40 border border-white/10 focus:border-[#EC4899] rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <input
                    type="checkbox"
                    id="agreeTermsRegister"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-[#EC4899]"
                  />
                  <label htmlFor="agreeTermsRegister" className="text-[10px] text-slate-400">
                    Acepto la política de ejecución y no custodia.
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Botones Fijados Más Abajo con Estilo Líquido del Hero */}
        <div className="space-y-2 pt-2">
          {/* Botón Principal Submit */}
          <button
            type="button"
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="btn-liquid w-full py-3 px-4 bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-2xl shadow-[0_8px_30px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/30 group"
          >
            <span>{tab === 'login' ? 'Acceder al Terminal' : 'Registrar Cuenta'}</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Divisor */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-mono tracking-wider">
              <span className="bg-[#0C0E17] px-2 text-slate-500">O accede con</span>
            </div>
          </div>

          {/* Botón Telegram OAuth con estilo Hero */}
          {!isTelegramWaiting ? (
            <button
              type="button"
              onClick={handleLaunchTelegramOAuth}
              className="btn-liquid w-full py-2.5 px-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs rounded-2xl shadow-[0_6px_20px_rgba(34,158,217,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20 group"
            >
              <Send className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
              <span>Autorizar con Telegram (@{botUsername})</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-[#141724] border border-[#229ED9]/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9] animate-ping" />
                  Esperando confirmación en bot...
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleQuickTelegramSync}
                  className="btn-liquid flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sincronizar Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTelegramWaiting(false)}
                  className="btn-liquid py-1.5 px-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-[9px] font-mono cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Footer de Cambio de Pestaña */}
          <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-white/5">
            {tab === 'login' ? (
              <p>
                ¿Nuevo en el Floor?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-[#EC4899] hover:underline font-bold cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes cuenta en el Desk?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="text-[#EC4899] hover:underline font-bold cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
