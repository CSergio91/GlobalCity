import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTelegramAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!telegramHandle.trim()) {
      setShowTelegramInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      loginWithCustomTelegram(telegramHandle);
      setIsLoading(false);
      onSuccess();
    }, 400);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Introduce tu usuario o email');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const handle = email.includes('@') ? email.split('@')[0] : email;
      loginWithCustomTelegram(`@${handle}`);
      setIsLoading(false);
      onSuccess();
    }, 400);
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsDemo();
      setIsLoading(false);
      onSuccess();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[420px] bg-[#10121A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Subtle Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E06D8A] to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <BrandLogo size="md" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Iniciar Sesión
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Accede a tu terminal de trading institucional
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Telegram Direct Action Button */}
        <div className="space-y-3">
          {!showTelegramInput ? (
            <button
              type="button"
              onClick={() => setShowTelegramInput(true)}
              className="w-full py-2.5 px-4 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#229ED9]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white text-[#229ED9]" />
              <span>Continuar con Telegram</span>
            </button>
          ) : (
            <form onSubmit={handleTelegramAuth} className="space-y-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-xs font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={telegramHandle.replace(/^@/, '')}
                  onChange={(e) => {
                    setTelegramHandle(e.target.value);
                    setError(null);
                  }}
                  placeholder="tu_usuario_telegram"
                  autoFocus
                  className="w-full pl-7 pr-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#229ED9]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Conectando...' : 'Entrar con Telegram'}</span>
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#10121A] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
              o con email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleStandardLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Email o Usuario
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="usuario@globalcity.com"
                className="w-full px-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E06D8A]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#181A24] border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#E06D8A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E06D8A]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Access Link */}
          <div className="pt-3 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E06D8A]" />
              <span>¿Sin cuenta? </span>
              <span className="text-[#E06D8A] hover:underline font-semibold">Entrar en Modo Demo</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
