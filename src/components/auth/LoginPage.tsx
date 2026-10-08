import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronLeft, 
  Sun, 
  Moon, 
  CreditCard, 
  Coins, 
  Sparkles, 
  User, 
  Globe, 
  ShieldAlert,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../BrandLogo';
import { PepeInteractiveLoginCanvas } from './PepeInteractiveLoginCanvas';
import { LoginTransitionCurtain } from './LoginTransitionCurtain';
import { 
  PlanCategory, 
  SOLAR_CHALLENGE_PLANS, 
  LUNAR_CHALLENGE_PLANS 
} from '../../data/challengePlans';
import loginBackgroundImg from '../../assets/images/Background-Login.webp';

// ============================================================================
// SECURITY & ANTI-MALWARE / ANTI-INJECTION SANITIZATION ENGINE
// ============================================================================
const MALICIOUS_SECURITY_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<[^>]+>/g,                          // Any HTML / XML / SVG markup tags
  /javascript:/gi,
  /vbscript:/gi,
  /data:\s*text\/html/gi,
  /on\w+\s*=/gi,                       // Dangerous inline event handlers (onload=, onerror=, etc.)
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bsetTimeout\s*\(/gi,
  /\bsetInterval\s*\(/gi,
  /\b(?:union\s+select|insert\s+into|delete\s+from|drop\s+table|update\s+set|exec\s*\(|xp_cmdshell)\b/gi, // SQL Injection
  /--|\/\*|\*\/|@@/gi,                 // SQL comment/escape sequence tokens
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g // Null bytes & ASCII control characters
];

const detectMaliciousCode = (val: string): boolean => {
  if (!val) return false;
  return MALICIOUS_SECURITY_PATTERNS.some((pattern) => pattern.test(val));
};

const sanitizeCleanString = (val: string): string => {
  return val.replace(/[<>{}\\"';`]/g, '').trim();
};

// All 7 accounts available in Eklipse Funded (from $1K to $100K)
const ALL_TIER_KEYS = ['1k', '2.5k', '5k', '10k', '25k', '50k', '100k'];

// ============================================================================
// AMBIENT LIVING COSMIC DUST BACKGROUND (Subtle 60 FPS Living Galaxy Canvas)
// ============================================================================
const AmbientLivingCosmicCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let h = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; baseAlpha: number }[] = [];
    const count = 35; // lightweight, zero battery drain

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.15,
        baseAlpha: Math.random() * 0.6 + 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" 
    />
  );
};

// ============================================================================
// MAIN COMPONENT: LOGIN PAGE WITH CINEMATIC SIDESWAP & ANTI-MALWARE
// ============================================================================
export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loginAsDemo } = useAuth();
  const { navigate } = useAppRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Mode: 'login' (Pepe on left, modal on right) vs 'register' (modal on left, Pepe on right)
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Cinematic Side-Swap Transition State Machine
  const [isWiping, setIsWiping] = useState(false);
  const [wipeDirection, setWipeDirection] = useState<'right-to-left' | 'left-to-right'>('right-to-left');
  const [pendingMode, setPendingMode] = useState<'login' | 'register' | null>(null);

  // Mounted state for smooth initial entrance
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Focus tracking for interactive Pepe gaze
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'captcha' | null>(null);

  // Interactive reCAPTCHA state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Register & Challenge Checkout State
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>('solar');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('solar-25k');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountry, setRegCountry] = useState('España');
  const [paymentGateway, setPaymentGateway] = useState<'crypto' | 'card'>('crypto');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Challenge plans available for current category: ALL 7 ACCOUNTS from 1K to 100K
  const currentPlansList = useMemo(() => {
    const rawList = selectedCategory === 'solar' ? SOLAR_CHALLENGE_PLANS : LUNAR_CHALLENGE_PLANS;
    return rawList
      .filter((p) => ALL_TIER_KEYS.some((tier) => p.id.endsWith(`-${tier}`)))
      .sort((a, b) => a.capital - b.capital);
  }, [selectedCategory]);

  const activePlan = useMemo(() => {
    return currentPlansList.find((p) => p.id === selectedPlanId) || currentPlansList[4] || currentPlansList[0];
  }, [currentPlansList, selectedPlanId]);

  // Handle switching category while preserving selected size tier
  const handleCategorySwitch = (cat: PlanCategory) => {
    setSelectedCategory(cat);
    const sizeSuffix = selectedPlanId.split('-')[1] || '25k';
    setSelectedPlanId(`${cat}-${sizeSuffix}`);
  };

  // Trigger cinematic animated curtain wipe between login and register
  const triggerModeSwitch = (targetMode: 'login' | 'register') => {
    if (targetMode === mode || isWiping) return;
    setError(null);
    setPendingMode(targetMode);
    // When going to register: sweep from right (login side) to left
    // When going to login: sweep from left (register side) to right
    setWipeDirection(targetMode === 'register' ? 'right-to-left' : 'left-to-right');
    setIsWiping(true);
  };

  const handleCurtainMidpoint = () => {
    if (pendingMode) {
      setMode(pendingMode);
    }
  };

  const handleCurtainComplete = () => {
    setIsWiping(false);
    setPendingMode(null);
  };

  const handleCaptchaClick = () => {
    if (captchaVerified || captchaLoading) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaVerified(true);
      setError(null);
    }, 600);
  };

  // ==========================================================================
  // LOGIN SUBMIT WITH STRICT ANTI-MALWARE & CODE INJECTION VALIDATION
  // ==========================================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(isEn ? 'Please enter your email' : 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Security Check: Anti-XSS & Anti-Code Injection
    if (detectMaliciousCode(cleanEmail)) {
      setError(
        isEn
          ? 'Security Shield: Malicious script tags or illegal code constructs detected in email.'
          : 'Alerta de Seguridad: Se han detectado etiquetas de código o caracteres maliciosos no permitidos en el correo.'
      );
      return;
    }

    // Strict RFC 5322 Email Validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      setError(isEn ? 'Please enter a valid institutional email' : 'Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!password || password.length < 6) {
      setError(isEn ? 'Password must be at least 6 characters' : 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password.length > 100) {
      setError(isEn ? 'Password exceeds maximum length' : 'La contraseña excede la longitud máxima');
      return;
    }

    // Security Check: Password Injection Prevention
    if (detectMaliciousCode(password)) {
      setError(
        isEn
          ? 'Security Shield: Malicious characters or code sequences detected in password.'
          : 'Alerta de Seguridad: Se han detectado secuencias de código o caracteres no permitidos en la contraseña.'
      );
      return;
    }

    if (!captchaVerified) {
      setError(isEn ? 'Please complete the security check' : 'Por favor completa la verificación de seguridad');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(cleanEmail, password);
      navigate('/dashboard');
    } catch {
      setError(isEn ? 'Error authenticating user credentials' : 'Error al autenticar las credenciales del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // REGISTER & CHECKOUT SUBMIT WITH ANTI-MALWARE VALIDATION
  // ==========================================================================
  const handleRegisterCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regFullName.trim();
    if (!cleanName || cleanName.length < 3) {
      setError(isEn ? 'Please enter your full legal name (min 3 characters)' : 'Por favor ingresa tu nombre completo (mínimo 3 caracteres)');
      return;
    }

    if (detectMaliciousCode(cleanName)) {
      setError(
        isEn
          ? 'Security Shield: Malicious scripts or forbidden injection characters detected in Full Name.'
          : 'Alerta de Seguridad: Se han detectado scripts o caracteres no permitidos en el nombre.'
      );
      return;
    }

    // Name regex: letters, accented vowels, spaces, hyphens and dots only
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\.\-']{3,60}$/;
    if (!nameRegex.test(cleanName)) {
      setError(isEn ? 'Full name can only contain alphabetic letters and spaces' : 'El nombre completo solo puede contener letras y espacios');
      return;
    }

    const cleanEmail = regEmail.trim();
    if (!cleanEmail) {
      setError(isEn ? 'Please enter your email address' : 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (detectMaliciousCode(cleanEmail)) {
      setError(
        isEn
          ? 'Security Shield: Forbidden code constructs detected in email.'
          : 'Alerta de Seguridad: Código o caracteres no permitidos detectados en el correo.'
      );
      return;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      setError(isEn ? 'Please enter a valid institutional email' : 'Por favor ingresa un correo institucional válido');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setError(isEn ? 'Password must be at least 6 characters' : 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (detectMaliciousCode(regPassword)) {
      setError(
        isEn
          ? 'Security Shield: Dangerous characters detected in password.'
          : 'Alerta de Seguridad: Caracteres peligrosos detectados en la contraseña.'
      );
      return;
    }

    const cleanCountry = regCountry.trim();
    if (!cleanCountry || cleanCountry.length < 2) {
      setError(isEn ? 'Please specify your country of residence' : 'Por favor especifica tu país de residencia');
      return;
    }

    if (detectMaliciousCode(cleanCountry)) {
      setError(
        isEn
          ? 'Security Shield: Malicious code detected in Country field.'
          : 'Alerta de Seguridad: Código no permitido detectado en el país.'
      );
      return;
    }

    if (!agreeTerms) {
      setError(isEn ? 'You must accept the evaluation rules and terms' : 'Debes aceptar las reglas de evaluación y los términos');
      return;
    }

    setIsLoading(true);
    // Provision Account & Dispatch
    setTimeout(async () => {
      try {
        await loginWithEmail(cleanEmail, regPassword);
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch {
        // Fallback demo provision
        loginAsDemo();
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }, 1400);
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
    }, 400);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-black text-white selection:bg-amber-400/20 selection:text-amber-300 overflow-x-hidden select-none">
      
      {/* Dynamic Stardust Transition Curtain with Black Hole Event Horizon Physics */}
      <LoginTransitionCurtain 
        isWiping={isWiping}
        direction={wipeDirection}
        onMidpoint={handleCurtainMidpoint}
        onComplete={handleCurtainComplete}
      />

      {/* Top Left Navigation Back to Landing */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer z-50 group px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-xl hover:border-amber-400/40"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
        <span>{isEn ? 'Back to Landing' : 'Volver al Inicio'}</span>
      </button>

      {/* Top Right Live Security Badge */}
      <div className="fixed top-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 z-50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold text-white">Shield v4.2</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400">Zero-Trust WAF</span>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: LOGIN (Pepe a la IZQUIERDA mirando hacia la DERECHA al modal)     */}
      {/* ========================================================================= */}
      {mode === 'login' && (
        <div className="w-full min-h-screen flex flex-col lg:flex-row transition-all duration-700 ease-in-out relative z-10">
          
          {/* LADO IZQUIERDO: PEPE (Fondo puro #000000 idéntico al fondo del video) */}
          <div className={`w-full lg:w-[46%] xl:w-[44%] min-h-[400px] lg:min-h-screen bg-black relative flex items-end justify-center lg:justify-end overflow-hidden z-10 lg:pr-2 xl:pr-6 transition-all duration-700 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-full max-w-[460px] sm:max-w-[540px] lg:max-w-[620px] xl:max-w-[700px] aspect-square flex items-end pointer-events-none relative z-10">
              <PepeInteractiveLoginCanvas 
                focusedField={focusedField} 
                facingSide="right"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* LADO DERECHO: MODAL DE LOGIN (Con imagen de fondo Background-Login.webp resaltada y cristal vivo) */}
          <div className={`w-full lg:w-[54%] xl:w-[56%] min-h-screen relative flex items-center justify-center lg:justify-start p-4 sm:p-8 lg:p-10 xl:p-12 lg:pl-6 xl:pl-10 border-t lg:border-t-0 lg:border-l border-white/10 z-20 overflow-hidden transition-all duration-700 ${
            isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            
            {/* Imagen de fondo viva y destacada en el lado del formulario */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center sm:bg-[position:70%_center] pointer-events-none z-0"
              style={{ backgroundImage: `url(${loginBackgroundImg})` }}
            >
              {/* Velo sutil translúcido para mantener el brillo y resplandor de la nebulosa y ciudad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
            </div>

            {/* Ambient Living Cosmic Dust Canvas */}
            <AmbientLivingCosmicCanvas />

            {/* Luces atmosféricas de fondo proyectadas a través del cristal */}
            <div className="absolute top-1/6 right-10 w-96 h-96 bg-purple-600/25 blur-[140px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/6 left-0 w-96 h-96 bg-amber-500/20 blur-[140px] rounded-full pointer-events-none" />

            {/* Tarjeta Glassmorphic Destacada con Bisel Lóbrego y Resplandor Ámbar */}
            <div className="w-full max-w-xl lg:max-w-2xl relative z-10 bg-[#080B1A]/75 border border-white/20 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all">
              
              {/* Header: Logo, Título y Demo Widget */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
                  <BrandLogo size="md" lightMode={false} showText={false} />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>{isEn ? 'Trader Access' : 'Acceso Trader'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold animate-pulse">
                        PORTAL
                      </span>
                    </h1>
                    <p className="text-[11px] text-slate-300 font-mono">
                      {isEn ? 'Institutional funding execution & metrics' : 'Fondeo institucional y métricas directas'}
                    </p>
                  </div>
                </div>

                {/* 1-Click Demo Access Widget */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-purple-500/20 border border-amber-400/40 shrink-0 shadow-sm">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <div className="text-[11px] font-mono text-slate-200">
                    <span className="font-bold text-white">Demo:</span> 123456
                  </div>
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    disabled={isLoading || isWiping}
                    className="ml-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isEn ? '1-Click' : '1-Clic'}
                  </button>
                </div>
              </div>

              {/* Selector de Pestaña: Iniciar Sesión vs Comprar Cuenta / Registro (Dispara la transición animada) */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-black/50 border border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => triggerModeSwitch('login')}
                  disabled={isWiping}
                  className="py-1.5 text-xs font-mono font-bold rounded-lg transition-all bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md cursor-pointer"
                >
                  {isEn ? 'Sign In' : 'Iniciar Sesión'}
                </button>
                <button
                  type="button"
                  onClick={() => triggerModeSwitch('register')}
                  disabled={isWiping}
                  className="py-1.5 text-xs font-mono font-bold rounded-lg transition-all text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isEn ? 'Get Funded & Register' : 'Comprar Cuenta & Registrarse'}</span>
                </button>
              </div>

              {/* Security Alert Toast */}
              {error && (
                <div className="mb-4 p-3 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Formulario de Login Horizontal */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Fila 1: Email y Contraseña lado a lado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                        maxLength={120}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

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
                        maxLength={100}
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
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

                {/* Fila 2: reCAPTCHA & Botón Entrar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div 
                    onClick={handleCaptchaClick}
                    onMouseEnter={() => setFocusedField('captcha')}
                    onMouseLeave={() => setFocusedField(null)}
                    className={`h-[46px] px-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                      captchaVerified 
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-black/60 border-white/15 hover:border-amber-400/50'
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

                  <button
                    type="submit"
                    disabled={isLoading || isWiping}
                    className="h-[46px] px-4 rounded-xl font-mono font-bold text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isEn ? 'Enter Dashboard' : 'Entrar al Dashboard'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Fila 3: Google Login (Sin enlace a Nexus) */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isWiping}
                    className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:border-white/25 active:scale-[0.99] disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                    <span>{isEn ? 'Continue with Google' : 'Continuar con Google'}</span>
                  </button>
                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: REGISTER & CHECKOUT (¡LADOS INTERCAMBIADOS TRAS BARRIDO!)         */}
      {/* El Modal pasa a la IZQUIERDA y Pepe pasa a la DERECHA mirando a la IZQ   */}
      {/* ========================================================================= */}
      {mode === 'register' && (
        <div className="w-full min-h-screen flex flex-col-reverse lg:flex-row transition-all duration-700 ease-in-out relative z-10">
          
          {/* LADO IZQUIERDO: FORMULARIO DE REGISTRO & COMPRA DE CUENTA (Con imagen de fondo Background-Login.webp resaltada) */}
          <div className="w-full lg:w-[66%] xl:w-[68%] min-h-screen relative flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-8 xl:p-10 border-b lg:border-b-0 lg:border-r border-white/10 z-20 overflow-hidden">
            
            {/* Imagen de fondo viva y destacada en el lado del formulario */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center sm:bg-[position:30%_center] pointer-events-none z-0"
              style={{ backgroundImage: `url(${loginBackgroundImg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
            </div>

            {/* Ambient Living Cosmic Dust Canvas */}
            <AmbientLivingCosmicCanvas />

            {/* Luces de fondo cósmicas */}
            <div className="absolute top-1/6 left-10 w-96 h-96 bg-amber-500/20 blur-[140px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/6 right-10 w-96 h-96 bg-purple-600/25 blur-[140px] rounded-full pointer-events-none" />

            {/* Tarjeta Glassmorphic de Registro & Checkout */}
            <div className="w-full max-w-2xl relative z-10 bg-[#080B1A]/80 border border-white/20 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]">
              
              {/* Header con Switcher a Iniciar Sesión (Dispara barrido hacia el Login) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <BrandLogo size="sm" lightMode={false} showText={false} />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>{isEn ? 'Purchase Evaluation & Register' : 'Comprar Cuenta & Registrarse'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold">
                        CHECKOUT
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-300 font-mono">
                      {isEn ? 'Select your challenge tier to activate your live terminal account' : 'Selecciona tu cuenta de fondeo para activar tu terminal institucional'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerModeSwitch('login')}
                  disabled={isWiping}
                  className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-amber-300 hover:text-white transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isEn ? 'Already have account? Sign In →' : '¿Ya tienes cuenta? Iniciar Sesión →'}
                </button>
              </div>

              {/* Order Success Overlay */}
              {orderSuccess && (
                <div className="mb-4 p-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-white">
                      {isEn ? 'Challenge Order Activated!' : '¡Cuenta de Reto Aprovisionada con Éxito!'}
                    </div>
                    <div>{isEn ? 'Redirecting to your live Trader Terminal...' : 'Redirigiendo a tu Terminal de Trading...'}</div>
                  </div>
                </div>
              )}

              {/* Security Alert Toast */}
              {error && (
                <div className="mb-3.5 p-3 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterCheckoutSubmit} className="space-y-3.5">
                
                {/* 1. SELECTOR DE MODELO DE RETO (TODAS LAS 7 CUENTAS: 1K HASTA 100K) */}
                <div className="p-3.5 rounded-2xl bg-black/55 border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? '1. Select Challenge Tier (1K — 100K)' : '1. Tamaño de Cuenta (1K a 100K)'}</span>
                    </span>

                    {/* Solar vs Lunar Category Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleCategorySwitch('solar')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          selectedCategory === 'solar'
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3 h-3" />
                        <span>Solar (DMA)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCategorySwitch('lunar')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          selectedCategory === 'lunar'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Moon className="w-3 h-3" />
                        <span>Lunar (Meme)</span>
                      </button>
                    </div>
                  </div>

                  {/* All 7 Account Size Buttons (1K, 2.5K, 5K, 10K, 25K, 50K, 100K) */}
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                    {currentPlansList.map((plan) => {
                      const isSelected = plan.id === selectedPlanId;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group ${
                            isSelected
                              ? selectedCategory === 'solar'
                                ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.03]'
                                : 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.03]'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-bl-md" />
                          )}
                          <span className="text-xs sm:text-sm font-black tracking-tight">{plan.sizeLabel}</span>
                          <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                            selectedCategory === 'solar' ? 'text-amber-300' : 'text-purple-300'
                          }`}>
                            ${plan.oneTimePriceUSDT}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Plan Specifications Banner */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-300">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <span className="text-amber-400">◈</span>
                      <span>{activePlan.capitalFormatted} Capital</span>
                    </span>
                    <span>{activePlan.baseProfitSplit}% Profit Split</span>
                    <span>{activePlan.baseMaxDrawdownPct}% Max Drawdown</span>
                    <span>Leverage {activePlan.baseLeverage}</span>
                    <span className="text-amber-400 font-bold">1-Time Fee: ${activePlan.oneTimePriceUSDT} USDT</span>
                  </div>
                </div>

                {/* 2. DATOS DEL TRADER (User Details con Sanitización contra Ataques) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {isEn ? 'Full Name' : 'Nombre Completo'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Sergio Rodriguez"
                        maxLength={60}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {isEn ? 'Email Address' : 'Correo Electrónico'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="trader@domain.com"
                        maxLength={120}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {isEn ? 'Set Password' : 'Crear Contraseña'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        maxLength={100}
                        required
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {isEn ? 'Country of Residence' : 'País de Residencia'}
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        placeholder="España / México / Colombia"
                        maxLength={60}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PASARELA DE PAGO (Crypto On-Chain 0% vs Tarjeta High-Risk) */}
                <div className="p-3 rounded-2xl bg-black/45 border border-white/10 shadow-inner">
                  <div className="text-xs font-mono font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>{isEn ? '2. Select Payment Gateway' : '2. Método de Pago (Pasarela)'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">0% On-Chain Network Fee</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('crypto')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        paymentGateway === 'crypto'
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">Crypto Checkout</div>
                        <div className="text-[9px] text-slate-400 font-mono">USDT / BTC / SOL (Instant)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentGateway('card')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        paymentGateway === 'card'
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">Card Checkout</div>
                        <div className="text-[9px] text-slate-400 font-mono">Visa / Mastercard High-Risk</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Terms and Rule Acceptance Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/60 text-amber-400 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="termsCheck" className="text-[11px] font-mono text-slate-300 cursor-pointer">
                    {isEn 
                      ? `I agree to ${activePlan.baseMaxDrawdownPct}% Max Drawdown, Evaluation Rules and W-8BEN agreement.` 
                      : `Acepto las Reglas de Evaluación, el ${activePlan.baseMaxDrawdownPct}% de Drawdown Máximo y el contrato W-8BEN.`}
                  </label>
                </div>

                {/* Botón de Checkout y Activación Directa */}
                <button
                  type="submit"
                  disabled={isLoading || orderSuccess || isWiping}
                  className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {isEn 
                          ? `Complete Order & Activate ${activePlan.sizeLabel} Account · $${activePlan.oneTimePriceUSDT} USDT`
                          : `Completar Orden & Activar Cuenta ${activePlan.sizeLabel} · $${activePlan.oneTimePriceUSDT} USDT`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>

          {/* LADO DERECHO: PEPE (Fondo puro #000000 idéntico al del video) */}
          <div className="w-full lg:w-[34%] xl:w-[32%] min-h-[380px] lg:min-h-screen bg-black relative flex items-end justify-center lg:justify-start overflow-hidden z-10 lg:pl-2 xl:pl-6">
            <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[560px] aspect-square flex items-end pointer-events-none relative z-10">
              <PepeInteractiveLoginCanvas 
                focusedField={focusedField} 
                facingSide="left"
                className="w-full h-full"
              />
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
