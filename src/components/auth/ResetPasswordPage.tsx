import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Sparkles,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useAppRouter } from '../../context/RouterContext';

export const ResetPasswordPage: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLinkExpired, setIsLinkExpired] = useState(false);

  // Parse recovery tokens and detect errors from URL on mount
  useEffect(() => {
    async function initRecovery() {
      if (typeof window === 'undefined') return;

      const hashStr = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
      const searchStr = window.location.search ? window.location.search.replace(/^\?/, '') : '';

      const hashParams = new URLSearchParams(hashStr);
      const searchParams = new URLSearchParams(searchStr);

      const err = hashParams.get('error') || searchParams.get('error');
      const errCode = hashParams.get('error_code') || searchParams.get('error_code');

      // 1. Detectar si el enlace ya expiró o fue usado
      if (err || errCode === 'otp_expired' || err === 'access_denied') {
        setIsLinkExpired(true);
        setError(
          isEn 
            ? 'This recovery link has expired or has already been used. Please request a new one.' 
            : 'Este enlace de recuperación ha expirado o ya fue utilizado. Por favor solicita un nuevo correo.'
        );
        return;
      }

      // 2. Extraer access_token y refresh_token del hash
      const tokenFromHash = hashParams.get('access_token');
      const refreshFromHash = hashParams.get('refresh_token');

      if (tokenFromHash) {
        setAccessToken(tokenFromHash);
        if (refreshFromHash) setRefreshToken(refreshFromHash);

        try {
          // Establecer la sesión explícitamente en el cliente Supabase
          const { data: sessionData } = await supabase.auth.setSession({
            access_token: tokenFromHash,
            refresh_token: refreshFromHash || ''
          });

          if (sessionData?.session?.user) {
            setUserEmail(sessionData.session.user.email || null);
          }
        } catch (e) {
          console.warn('[ResetPassword] Error setting session from hash token:', e);
        }
      }

      // 3. Revisar si ya existe una sesión en almacenamiento
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        if (session.access_token && !tokenFromHash) {
          setAccessToken(session.access_token);
        }
        if (session.refresh_token && !refreshFromHash) {
          setRefreshToken(session.refresh_token);
        }
      }

      // 4. Suscriptor reactivo de eventos de auth
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'PASSWORD_RECOVERY' || newSession?.user) {
          if (newSession?.user?.email) {
            setUserEmail(newSession.user.email);
          }
          if (newSession?.access_token) {
            setAccessToken(newSession.access_token);
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    initRecovery();
  }, [isEn]);

  // Password strength evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = isEn 
    ? ['Too weak', 'Weak', 'Medium', 'Strong', 'Ultra secure']
    : ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Ultra segura'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(
        isEn 
          ? 'Password must be at least 8 characters long.' 
          : 'La contraseña debe tener al menos 8 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isEn 
          ? 'Passwords do not match. Please verify.' 
          : 'Las contraseñas no coinciden. Por favor verifica ambos campos.'
      );
      return;
    }

    setIsLoading(true);

    try {
      let updateSucceeded = false;

      // 1. Intento primario: Actualizar vía cliente de Supabase
      try {
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (!updateError) {
          updateSucceeded = true;
        } else if (!updateError.message.includes('Auth session missing')) {
          throw updateError;
        }
      } catch (clientErr: any) {
        if (!clientErr?.message?.includes('Auth session missing')) {
          throw clientErr;
        }
        console.warn('[ResetPassword] Client session missing, invoking backend recovery fallback...');
      }

      // 2. Fallback blindado de backend: Invocar /api/auth/reset-password-confirm
      if (!updateSucceeded) {
        const backendUrl = (import.meta as any).env?.VITE_WS_GATEWAY_URL?.replace('ws://', 'http://').replace('wss://', 'https://') || 'http://localhost:8088';
        
        const response = await fetch(`${backendUrl}/api/auth/reset-password-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: accessToken,
            newPassword: password,
            email: userEmail
          })
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData?.error || 'Error al actualizar contraseña en el servidor.');
        }

        updateSucceeded = true;
      }

      setIsSuccess(true);
      // Auto-redirect to login after 3.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3500);

    } catch (err: any) {
      console.error('[ResetPassword] Error updating password:', err);
      const rawMsg = err?.message || '';
      if (rawMsg.includes('Auth session missing') || rawMsg.includes('expired')) {
        setIsLinkExpired(true);
        setError(
          isEn 
            ? 'The recovery session has expired or is invalid. Please request a new reset email.' 
            : 'La sesión de recuperación ha expirado o es inválida. Por favor solicita un nuevo correo.'
        );
      } else {
        setError(
          rawMsg || (
            isEn 
              ? 'Error updating password. The recovery link may have expired.' 
              : 'Error al actualizar contraseña. El enlace de recuperación puede haber expirado.'
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Cosmic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md bg-[#090A10]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              <KeyRound className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white uppercase font-mono">EKLIPSE</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">FUNDED</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide">
                {isEn ? 'Security & Identity Shield' : 'Seguridad y Blindaje de Identidad'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title={isEn ? 'Back to Sign In' : 'Volver a Iniciar Sesión'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS VIEW */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {isEn ? 'Password Updated!' : '¡Contraseña Actualizada!'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                {isEn 
                  ? 'Your institutional account password has been safely updated. Redirecting you to login...' 
                  : 'La contraseña de tu cuenta institucional ha sido actualizada de forma segura. Redirigiendo al inicio de sesión...'}
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'Sign In Now' : 'Iniciar Sesión Ahora'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isEn ? 'Set New Password' : 'Crear Nueva Contraseña'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {userEmail 
                  ? (isEn 
                      ? `Resetting credentials for ${userEmail}.` 
                      : `Restableciendo credenciales para ${userEmail}.`)
                  : (isEn 
                      ? 'Enter your new institutional password to regain access.' 
                      : 'Introduce tu nueva contraseña institucional para recuperar el acceso.')
                }
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-mono">{error}</span>
                </div>
                {isLinkExpired && (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-1 py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Request New Reset Email' : 'Solicitar Nuevo Correo de Recuperación'}</span>
                  </button>
                )}
              </div>
            )}

            {!isLinkExpired && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>{isEn ? 'New Password' : 'Nueva Contraseña'}</span>
                    <span className="text-[10px] text-slate-400 lowercase">{isEn ? 'min 8 chars' : 'mín 8 car.'}</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-black/40 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((step) => (
                          <div 
                            key={step} 
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              step <= strengthScore - 1 ? strengthColors[strengthScore] : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">{isEn ? 'Security:' : 'Seguridad:'}</span>
                        <span className="font-bold text-amber-300">{strengthLabels[strengthScore]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {isEn ? 'Confirm Password' : 'Confirmar Contraseña'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-black/40 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] font-mono text-rose-400 pt-0.5">
                      {isEn ? 'Passwords do not match' : 'Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isEn ? 'Update Password' : 'Actualizar Contraseña'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{isEn ? '← Back to Sign In' : '← Volver a Iniciar Sesión'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
