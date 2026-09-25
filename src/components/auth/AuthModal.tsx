import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Zap,
  Globe2,
  Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithCustomTelegram, loginAsDemo } = useAuth();
  
  const [telegramHandle, setTelegramHandle] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [activeMode, setActiveMode] = useState<'telegram' | 'demo' | 'email'>('telegram');
  const [emailInput, setEmailInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTelegramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramHandle.trim()) {
      setErrorMsg('Por favor ingresa tu @usuario de Telegram');
      return;
    }

    setIsConnecting(true);
    setErrorMsg(null);

    setTimeout(() => {
      loginWithCustomTelegram(telegramHandle, telegramId);
      setIsConnecting(false);
      onSuccess();
    }, 600);
  };

  const handleInstantDemo = () => {
    setIsConnecting(true);
    setTimeout(() => {
      loginAsDemo();
      setIsConnecting(false);
      onSuccess();
    }, 400);
  };

  const handleQuickTelegramSample = (sampleHandle: string) => {
    setTelegramHandle(sampleHandle);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06070B]/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E06D8A]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#12131A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#229ED9] via-[#E06D8A] to-[#818CF8]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#E06D8A]/15 border border-[#E06D8A]/30 text-[#F472B6]">
              ACCESO AL TERMINAL
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Header Title & Reason */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Inicia Sesión en Global City
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Conecta tu identidad operativa. Para el control no custodial y la telemetría en tiempo real, 
              <span className="text-[#38BDF8] font-medium"> Telegram es el canal troncal</span> de alertas y verificación de órdenes.
            </p>
          </div>

          {/* Telegram Ecosystem Benefit Banner */}
          <div className="bg-[#1A1C26] border border-[#229ED9]/25 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center shrink-0 text-[#229ED9]">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Nodo Telegram Integrado</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  2FA & Alertas
                </span>
              </div>
              <p className="text-slate-400 leading-normal">
                Al vincular tu Telegram, recibirás avisos de ejecución en sub-100ms, cortes de drawdown del Risk Guardian y comandos directos con el Bot institucional.
              </p>
            </div>
          </div>

          {/* Tabs Selector: Telegram vs Demo vs Email */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#0A0B0F] p-1.5 rounded-2xl border border-white/5 text-xs font-semibold">
            <button
              onClick={() => { setActiveMode('telegram'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'telegram'
                  ? 'bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={() => { setActiveMode('demo'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'demo'
                  ? 'bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] text-white shadow-lg shadow-[#E06D8A]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Rápida</span>
            </button>

            <button
              onClick={() => { setActiveMode('email'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'email'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>

          {/* Mode 1: Telegram Auth */}
          {activeMode === 'telegram' && (
            <form onSubmit={handleTelegramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Usuario de Telegram (Handle)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono">
                    @
                  </div>
                  <input
                    type="text"
                    value={telegramHandle.replace(/^@/, '')}
                    onChange={(e) => {
                      setTelegramHandle(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="ej. satoshi_trader"
                    className="w-full pl-8 pr-4 py-2.5 bg-[#1A1C26] border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#229ED9] transition-colors font-mono"
                    autoFocus
                  />
                </div>
                
                {/* Quick select pills */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500">Ejemplos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickTelegramSample('@carlos_globalcity')}
                    className="text-[11px] text-[#229ED9] hover:underline cursor-pointer font-mono"
                  >
                    @carlos_globalcity
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => handleQuickTelegramSample('@quant_trader_pro')}
                    className="text-[11px] text-[#229ED9] hover:underline cursor-pointer font-mono"
                  >
                    @quant_trader_pro
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>ID Numérico de Telegram (Opcional)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Para vincular bot privado</span>
                </label>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="ej. 748192045 (generado auto si se omite)"
                  className="w-full px-3.5 py-2.5 bg-[#1A1C26] border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#229ED9] transition-colors font-mono text-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 px-4 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#229ED9]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando con nodo Telegram...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Conectar e Ingresar al Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Instant Demo */}
          {activeMode === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Terminal className="w-4 h-4 text-[#E06D8A]" />
                  <span>Modo Cuantitativo Institucional (Sandbox)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Accede de inmediato sin registro para probar la gestión de cuentas en LocalStorage, las simulaciones de arbitraje L2 y el motor de ejecución.
                </p>
                <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3 Cuentas Precargadas
                  </span>
                  <span className="flex items-center gap-1 text-[#38BDF8]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> WebSockets Activos
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantDemo}
                disabled={isConnecting}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] hover:brightness-110 text-white rounded-xl font-bold text-sm shadow-lg shadow-[#E06D8A]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión demo...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Entrar como Invitado Institucional (1 Clic)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 3: Traditional Email */}
          {activeMode === 'email' && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!emailInput) {
                  setErrorMsg('Ingresa un correo institucional');
                  return;
                }
                const handle = emailInput.split('@')[0];
                loginWithCustomTelegram(handle);
                onSuccess();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo Corporativo / Personal
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="trader@institucion.com"
                  className="w-full px-3.5 py-2.5 bg-[#1A1C26] border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#E06D8A] transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Continuar con Email</span>
              </button>
            </form>
          )}

          {/* Security & Non-Custodial Footer Guarantee */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Arquitectura No Custodial en LocalStorage</span>
            </div>
            <span>Global City v2.0</span>
          </div>

        </div>

      </div>

    </div>
  );
};
