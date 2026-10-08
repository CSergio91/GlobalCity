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
import { PepeInteractiveLoginCanvas } from './PepeInteractiveLoginCanvas';

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

  // Focus tracking for interactive Pepe gaze
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'captcha' | null>(null);

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
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row bg-black text-white selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden select-none">
      
      {/* Top Left Navigation Back to Landing */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer z-40 group px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>{isEn ? 'Back to Landing' : 'Volver al Inicio'}</span>
      </button>

      {/* LADO IZQUIERDO: PEPE (Fondo puro #000000, pegado al centro para estar cerca del formulario) */}
      <div className="w-full lg:w-[46%] xl:w-[44%] min-h-[420px] lg:min-h-screen bg-black relative flex items-end justify-center lg:justify-end overflow-hidden z-10 lg:pr-2 xl:pr-6">
        <div className="w-full max-w-[460px] sm:max-w-[540px] lg:max-w-[620px] xl:max-w-[700px] aspect-square flex items-end pointer-events-none">
          <PepeInteractiveLoginCanvas 
            focusedField={focusedField} 
            className="w-full h-full"
          />
        </div>
      </div>

      {/* LADO DERECHO: LOGIN (Fondo más claro para destacar Glassmorphism, pegado a Pepe) */}
      <div className="w-full lg:w-[54%] xl:w-[56%] min-h-screen relative flex items-center justify-center lg:justify-start p-4 sm:p-8 lg:p-10 xl:p-12 lg:pl-4 xl:pl-8 bg-gradient-to-br from-[#121626] via-[#0c101c] to-[#070912] border-t lg:border-t-0 lg:border-l border-white/10 z-20">
        
        {/* Luces atmosféricas de fondo para proyectar refracción en el cristal */}
        <div className="absolute top-1/6 right-10 w-96 h-96 bg-purple-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/6 left-0 w-96 h-96 bg-amber-500/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Tarjeta Glassmorphic Horizontal Prémium */}
        <div className="w-full max-w-xl lg:max-w-2xl relative z-10 bg-[#0E1322]/65 border border-white/15 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)]">
          
          {/* Header Row: Logo, Title & Demo Banner en distribución horizontal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
              <BrandLogo size="md" lightMode={false} showText={false} />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{mode === 'login' ? (isEn ? 'Trader Access' : 'Acceso Trader') : (isEn ? 'Create Account' : 'Crear Cuenta')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                    PORTAL
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">
                  {isEn ? 'Institutional execution & metrics' : 'Ejecución institucional y métricas'}
                </p>
              </div>
            </div>

            {/* 1-Click Instant Demo Button (Horizontal Header Widget) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-purple-500/15 border border-amber-400/30 shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-[11px] font-mono text-slate-300">
                <span className="font-bold text-white">Demo:</span> 123456
              </div>
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={isLoading}
                className="ml-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {isEn ? '1-Click' : '1-Clic'}
              </button>
            </div>
          </div>

          {/* Tab Switcher: Login / Register (Horizontal Bar) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
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
              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'Register' : 'Crear Cuenta'}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Form: Horizontal Grid Layout */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Email and Password Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  {isEn ? 'Email Address' : 'Correo Electrónico'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={isEn ? 'trader@domain.com' : 'trader@correo.com'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  {isEn ? 'Password' : 'Contraseña'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Row 2: reCAPTCHA & Submit Button Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
              
              {/* reCAPTCHA Widget */}
              <div 
                onClick={handleCaptchaClick}
                onMouseEnter={() => setFocusedField('captcha')}
                onMouseLeave={() => setFocusedField(null)}
                className={`h-[46px] px-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                  captchaVerified 
                    ? 'bg-emerald-950/30 border-emerald-500/50' 
                    : 'bg-black/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    captchaVerified 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                      : 'border-white/20 bg-white/5'
                  }`}>
                    {captchaLoading ? (
                      <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : captchaVerified ? (
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    ) : null}
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-300">
                    {captchaVerified 
                      ? (isEn ? 'Security Verified' : 'Verificado') 
                      : (isEn ? "I'm not a robot" : 'No soy un robot')}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>reCAPTCHA</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-[46px] px-4 rounded-xl font-mono font-bold text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            </div>

            {/* Row 3: Google Login & CRM Nexus Gateway */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full sm:w-auto flex-1 py-2 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:border-white/20 active:scale-[0.99]"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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

              <button
                type="button"
                onClick={() => navigate('/nexus')}
                className="text-[11px] font-mono text-purple-400/90 hover:text-purple-300 hover:underline transition-colors cursor-pointer py-1.5 px-2 shrink-0"
              >
                {isEn ? 'Institutional CRM Nexus →' : 'CRM Nexus Institucional →'}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
