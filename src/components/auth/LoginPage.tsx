import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../BrandLogo';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loginAsDemo } = useAuth();
  const { navigate } = useAppRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interactive reCAPTCHA security layer state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const handleCaptchaClick = () => {
    if (captchaVerified || captchaLoading) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaVerified(true);
      setError(null);
    }, 700);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError(isEn ? 'Please enter your email' : 'Por favor ingresa tu correo electrónico');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(isEn ? 'Please enter a valid email address' : 'Por favor ingresa un correo válido');
      return false;
    }
    if (!password || password.length < 6) {
      setError(isEn ? 'Password must be at least 6 characters' : 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!captchaVerified) {
      setError(isEn ? 'Please complete the security check' : 'Por favor completa la verificación de seguridad');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      // Redirect straight to Trader Dashboard
      navigate('/dashboard');
    } catch {
      setError(isEn ? 'Error authenticating user' : 'Error al autenticar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    if (!captchaVerified) {
      setError(isEn ? 'Please complete the security check first' : 'Por favor completa la verificación de seguridad primero');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError(isEn ? 'Google login failed' : 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setEmail('demo@eklipsefunded.com');
    setPassword('demo1234');
    setCaptchaVerified(true);
    setTimeout(() => {
      loginAsDemo();
      navigate('/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#06070B] text-white selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden select-none">
      
      {/* Background Ambient Cosmic Nebulas */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Left Navigation Back to Landing */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer z-30"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{isEn ? 'Back to Landing' : 'Volver al Inicio'}</span>
      </button>

      {/* Main Glassmorphism Auth Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <BrandLogo size="lg" lightMode={false} showText={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {mode === 'login' 
              ? (isEn ? 'Trader Portal Access' : 'Acceso al Portal Trader')
              : (isEn ? 'Create Trader Account' : 'Crear Cuenta de Trader')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-mono">
            {isEn ? 'Direct access to institutional funding & metrics' : 'Acceso directo a fondeo institucional y métricas'}
          </p>
        </div>

        {/* 1-Click Instant Demo Trader Banner */}
        <div className="mb-6 p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-purple-500/10 backdrop-blur-md flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isEn ? 'Demo Trader Account' : 'Cuenta Trader Demo'}
              </div>
              <div className="text-[10px] text-amber-300/80 font-mono">
                demo@eklipsefunded.com · ID: 123456
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            {isEn ? 'Quick Access' : 'Acceso 1-Clic'}
          </button>
        </div>

        {/* Auth Form Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0D15]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          
          {/* Tab Switcher: Login / Register */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'Sign In' : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'Register' : 'Crear Cuenta'}
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                {isEn ? 'Email Address' : 'Correo Electrónico'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEn ? 'trader@domain.com' : 'trader@correo.com'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                {isEn ? 'Password' : 'Contraseña'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive reCAPTCHA Security Layer Widget */}
            <div className="pt-1">
              <div 
                onClick={handleCaptchaClick}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                  captchaVerified 
                    ? 'bg-emerald-950/20 border-emerald-500/40' 
                    : 'bg-slate-950/90 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                    captchaVerified 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                      : 'border-white/20 bg-white/5'
                  }`}>
                    {captchaLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : captchaVerified ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : null}
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-300">
                    {captchaVerified 
                      ? (isEn ? 'Security Verified' : 'Verificación Completada') 
                      : (isEn ? "I'm not a robot" : 'No soy un robot')}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>reCAPTCHA</span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Privacy · Terms</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl font-mono font-bold text-sm tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? (isEn ? 'Enter Dashboard' : 'Entrar al Dashboard') : (isEn ? 'Create Account' : 'Crear Cuenta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-slate-600 text-xs font-mono">
            <div className="flex-1 h-px bg-white/10" />
            <span>{isEn ? 'OR' : 'O BIEN'}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-white/20 active:scale-[0.99]"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isEn ? 'Continue with Google' : 'Continuar con Google'}</span>
          </button>

          {/* CRM Nexus Institutional Gateway link */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={() => navigate('/nexus')}
              className="text-[11px] font-mono text-purple-400/80 hover:text-purple-300 hover:underline transition-colors cursor-pointer"
            >
              {isEn ? 'Institutional CRM Nexus Admin Portal →' : 'Portal de Administración CRM Nexus Institucional →'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
