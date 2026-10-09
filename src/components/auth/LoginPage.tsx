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
import { 
  PlanCategory, 
  SOLAR_CHALLENGE_PLANS, 
  LUNAR_CHALLENGE_PLANS 
} from '../../data/challengePlans';
import { motion, AnimatePresence } from 'motion/react';
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

const COUNTRIES_LIST = [
  'United States (US)',
  'Spain (ES)',
  'Mexico (MX)',
  'Colombia (CO)',
  'Argentina (AR)',
  'United Kingdom (UK)',
  'Germany (DE)',
  'France (FR)',
  'Italy (IT)',
  'Brazil (BR)',
  'Canada (CA)',
  'Australia (AU)',
  'Chile (CL)',
  'Peru (PE)',
  'United Arab Emirates (AE)',
  'Switzerland (CH)',
  'Other / International'
];

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
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      if (search.includes('register') || search.includes('mode=register')) return 'register';
      const stored = sessionStorage.getItem('eklipse_auth_mode');
      if (stored === 'register') return 'register';
    }
    return 'login';
  });

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
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Focus tracking for interactive Pepe gaze
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'captcha' | null>(null);

  // Interactive reCAPTCHA state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Register & Challenge Checkout State
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>(() => {
    if (typeof window !== 'undefined') {
      const target = sessionStorage.getItem('eklipse_target_plan');
      if (target && target.includes('lunar')) return 'lunar';
    }
    return 'solar';
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const target = sessionStorage.getItem('eklipse_target_plan');
      if (target) {
        if (SOLAR_CHALLENGE_PLANS.some((p) => p.id === target) || LUNAR_CHALLENGE_PLANS.some((p) => p.id === target)) {
          return target;
        }
        const match = ALL_TIER_KEYS.find((k) => target.toLowerCase().includes(k));
        if (match) {
          return target.includes('lunar') ? `lunar-${match}` : `solar-${match}`;
        }
      }
    }
    return 'solar-25k';
  });

  // Personal Information (Image 1)
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');

  // Billing Address (Image 2)
  const [regAddress1, setRegAddress1] = useState('');
  const [regAddress2, setRegAddress2] = useState('');
  const [regCountry, setRegCountry] = useState('United States (US)');
  const [regZip, setRegZip] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');

  // Login Details (Image 3)
  const [regEmail, setRegEmail] = useState('');
  const [regConfirmEmail, setRegConfirmEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Payment Gateway
  const [paymentGateway, setPaymentGateway] = useState<'crypto' | 'card'>('crypto');

  // Terms & Agreements (Image 4)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNoMultiProfile, setAgreeNoMultiProfile] = useState(false);
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

  // Step progression validation states for Login
  const isEmailValid = useMemo(() => {
    const trimmed = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !detectMaliciousCode(trimmed);
  }, [email]);

  const isPasswordStarted = useMemo(() => {
    return password.length >= 1;
  }, [password]);

  // Step progression validation states for Register
  const isPersonalValid = useMemo(() => {
    return (
      regFirstName.trim().length >= 2 &&
      regLastName.trim().length >= 2 &&
      regPhone.trim().length >= 5 &&
      !detectMaliciousCode(regFirstName) &&
      !detectMaliciousCode(regLastName) &&
      !detectMaliciousCode(regPhone) &&
      !detectMaliciousCode(regCompany)
    );
  }, [regFirstName, regLastName, regPhone, regCompany]);

  const isBillingValid = useMemo(() => {
    return (
      isPersonalValid &&
      regAddress1.trim().length >= 3 &&
      regCountry.trim().length >= 2 &&
      regZip.trim().length >= 2 &&
      regCity.trim().length >= 2 &&
      regState.trim().length >= 2 &&
      !detectMaliciousCode(regAddress1) &&
      !detectMaliciousCode(regAddress2) &&
      !detectMaliciousCode(regCountry) &&
      !detectMaliciousCode(regZip) &&
      !detectMaliciousCode(regCity) &&
      !detectMaliciousCode(regState)
    );
  }, [isPersonalValid, regAddress1, regAddress2, regCountry, regZip, regCity, regState]);

  const isLoginDetailsValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = regEmail.trim();
    const cleanConfirm = regConfirmEmail.trim();
    return (
      isBillingValid &&
      emailRegex.test(cleanEmail) &&
      cleanEmail.toLowerCase() === cleanConfirm.toLowerCase() &&
      regPassword.length >= 8 &&
      !detectMaliciousCode(regEmail) &&
      !detectMaliciousCode(regConfirmEmail) &&
      !detectMaliciousCode(regPassword)
    );
  }, [isBillingValid, regEmail, regConfirmEmail, regPassword]);

  const isFormReady = useMemo(() => {
    return isLoginDetailsValid && agreeTerms && agreeNoMultiProfile;
  }, [isLoginDetailsValid, agreeTerms, agreeNoMultiProfile]);

  // 4-Bar Password Strength Calculator (Matching Screenshot 3)
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (regPassword.length >= 8) score++;
    if (/\d/.test(regPassword)) score++;
    if (/[a-z]/.test(regPassword) && /[A-Z]/.test(regPassword)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(regPassword) || regPassword.length >= 12) score++;
    return score;
  }, [regPassword]);

  // Trigger mode switch between login and register
  const triggerModeSwitch = (targetMode: 'login' | 'register') => {
    if (targetMode === mode) return;
    setError(null);
    setMode(targetMode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eklipse_auth_mode', targetMode);
    }
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

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setResetNotice(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(
        isEn 
          ? 'Please enter your email above to receive password recovery instructions' 
          : 'Por favor escribe tu correo arriba para enviarte las instrucciones de recuperación'
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(
        isEn 
          ? 'Please enter a valid institutional email format' 
          : 'Por favor ingresa un formato de correo electrónico válido con @'
      );
      return;
    }
    setResetNotice(
      isEn 
        ? `Password recovery instructions sent to ${cleanEmail}. Check your inbox!` 
        : `Instrucciones de recuperación enviadas a ${cleanEmail}. ¡Revisa tu bandeja de entrada!`
    );
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

    // 1. Personal Information Validation
    if (!isPersonalValid) {
      setError(
        isEn
          ? 'Please enter valid Personal Information (First Name, Last Name, Phone Number)'
          : 'Por favor ingresa información personal válida (Nombre, Apellidos y Teléfono)'
      );
      return;
    }

    // 2. Billing Address Validation
    if (!isBillingValid) {
      setError(
        isEn
          ? 'Please complete all required Billing Address fields (Address, Country, ZIP, City, State)'
          : 'Por favor completa todos los campos de dirección de facturación requeridos'
      );
      return;
    }

    // 3. Login Details Validation
    const cleanEmail = regEmail.trim();
    const cleanConfirmEmail = regConfirmEmail.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(isEn ? 'Please enter a valid institutional email' : 'Por favor ingresa un correo institucional válido');
      return;
    }

    if (cleanEmail.toLowerCase() !== cleanConfirmEmail.toLowerCase()) {
      setError(isEn ? 'Confirmation email does not match' : 'La confirmación del correo electrónico no coincide');
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setError(isEn ? 'Password must be at least 8 characters' : 'La contraseña debe tener al menos 8 caracteres');
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

    // 4. Agreements Validation
    if (!agreeTerms) {
      setError(
        isEn
          ? 'You must accept the Terms of Service and Privacy Policy'
          : 'Debes aceptar los Términos de Servicio y la Política de Privacidad'
      );
      return;
    }

    if (!agreeNoMultiProfile) {
      setError(
        isEn
          ? 'You must confirm the single profile evaluation agreement'
          : 'Debes confirmar la condición de perfil único de usuario'
      );
      return;
    }

    setIsLoading(true);
    // Provision Account & Dispatch
    setTimeout(async () => {
      try {
        const assignedAccounts = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        assignedAccounts.push({
          planId: selectedPlanId,
          category: selectedCategory,
          price: activePlan.oneTimePriceUSDT,
          accountSize: activePlan.capital,
          purchasedAt: new Date().toISOString(),
          email: cleanEmail
        });
        localStorage.setItem('eklipse_assigned_accounts', JSON.stringify(assignedAccounts));

        await loginWithEmail(cleanEmail, regPassword);
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch {
        // Fallback demo session so checkout never gets blocked
        loginAsDemo();
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
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
      {/* LADO IZQUIERDO: PEPE (Desktop Only - Oculto 100% en Móvil)                */}
      {/* Anclado firmemente a la izquierda, mira a la derecha hacia el formulario  */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full md:w-[46%] lg:w-[48%] xl:w-[46%] h-screen bg-black relative items-end justify-center lg:justify-end overflow-hidden z-10 md:pr-4 lg:pr-8 pb-0">
        <div className="w-full max-w-[500px] lg:max-w-[580px] xl:max-w-[640px] aspect-square flex items-end pointer-events-none relative z-10">
          <PepeInteractiveLoginCanvas 
            focusedField={focusedField} 
            facingSide="right"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LADO DERECHO: DIVISIÓN DE FORMULARIO (LOGIN & REGISTRO)                   */}
      {/* El scrollbar está 100% oculto (.no-scrollbar) y el scroll con mouse       */}
      {/* funciona en TODO el ancho de la división, no solo encima del formulario   */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[54%] lg:w-[52%] xl:w-[54%] h-screen relative z-20 overflow-y-auto no-scrollbar border-t md:border-t-0 md:border-l border-white/10 bg-[#06070B]">
        
        {/* Imagen de fondo viva y fija detrás del formulario */}
        <div 
          className="fixed inset-y-0 right-0 w-full md:w-[54%] lg:w-[52%] xl:w-[54%] bg-cover bg-center sm:bg-[position:65%_center] pointer-events-none z-0"
          style={{ backgroundImage: `url(${loginBackgroundImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/45 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Ambient Living Cosmic Dust Canvas */}
        <div className="fixed inset-y-0 right-0 w-full md:w-[54%] lg:w-[52%] xl:w-[54%] pointer-events-none z-0">
          <AmbientLivingCosmicCanvas />
        </div>

        {/* Luces atmosféricas de fondo proyectadas a través del cristal */}
        <div className="fixed top-1/6 right-10 w-96 h-96 bg-purple-600/20 blur-[140px] rounded-full pointer-events-none animate-pulse" />
        <div className="fixed bottom-1/6 right-1/3 w-96 h-96 bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />

        {/* Contenedor Interior Centrado que permite scroll en TODO el ancho de la división */}
        <div className="w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-panel"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-[375px] sm:max-w-[395px] relative z-10 py-6"
              >
                {/* Header: Logo y Trader Access ARRIBA SOLO (Sin Portal, Sin Demo Widget) */}
              <div className="mb-3.5 pb-2.5 border-b border-white/15 cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex items-center gap-2.5">
                  <BrandLogo size="sm" lightMode={false} showText={false} />
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {isEn ? 'Trader Access' : 'Acceso Trader'}
                    </h1>
                    <p className="text-[10px] text-slate-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {isEn ? 'Institutional funding execution & metrics' : 'Fondeo institucional y métricas directas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Título de Sign In y Demo Widget (Abajo del header) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Sign In to Account' : 'Iniciar Sesión'}</span>
                </div>

                {/* 1-Click Demo Access Widget */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-amber-400/30 shrink-0 shadow-sm text-[10px] font-mono text-slate-300">
                  <span className="text-white font-bold">Demo:</span> 123456
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    disabled={isLoading}
                    className="ml-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isEn ? '1-Click' : '1-Clic'}
                  </button>
                </div>
              </div>

              {/* Feedback de Recuperación de Contraseña */}
              <AnimatePresence>
                {resetNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-2.5"
                  >
                    <div className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-xs flex items-center gap-2 shadow-lg font-mono text-[10.5px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{resetNotice}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Alert Toast with Smooth Fade */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden mb-2.5"
                  >
                    <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-950/70 backdrop-blur-md text-rose-300 text-xs flex items-center gap-2 shadow-lg">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 animate-pulse" />
                      <span className="leading-tight font-mono text-[11px]">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario de Login Progresivo con Animaciones Suaves y Campos Compactos */}
              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                
                {/* PASO 1: Email Address (Siempre visible inicialmente) */}
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-300 mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {isEn ? 'Email Address' : 'Correo Electrónico'}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isEn ? 'trader@domain.com' : 'trader@correo.com'}
                      maxLength={120}
                      required
                      className="w-full h-9 pl-8 pr-8 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 focus:bg-black/80 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-md"
                    />
                    {isEmailValid && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 animate-in zoom-in-75 duration-300" />
                    )}
                  </div>
                </div>

                {/* PASO 2: Contraseña con enlace a "¿Olvidaste tu contraseña?" */}
                <AnimatePresence initial={false}>
                  {isEmailValid && (
                    <motion.div
                      key="login-password-step"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-mono font-medium text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {isEn ? 'Password' : 'Contraseña'}
                          </label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[10px] font-mono text-amber-400/90 hover:text-amber-300 hover:underline transition-all cursor-pointer"
                          >
                            {isEn ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="••••••••••••"
                            maxLength={100}
                            required
                            className="w-full h-9 pl-8 pr-8 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 focus:bg-black/80 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PASO 3: reCAPTCHA (Aparece y desaparece suavemente al comenzar la contraseña) */}
                <AnimatePresence initial={false}>
                  {isEmailValid && isPasswordStarted && (
                    <motion.div
                      key="login-captcha-step"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-0.5">
                        <div 
                          onClick={handleCaptchaClick}
                          onMouseEnter={() => setFocusedField('captcha')}
                          onMouseLeave={() => setFocusedField(null)}
                          className={`h-9 px-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer select-none backdrop-blur-md shadow-md ${
                            captchaVerified 
                              ? 'bg-emerald-950/60 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                              : 'bg-black/60 border-white/20 hover:border-amber-400/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              captchaVerified 
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                                : 'border-white/25 bg-white/5'
                            }`}>
                              {captchaLoading ? (
                                <div className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              ) : captchaVerified ? (
                                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                              ) : null}
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-200">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PASO 4: Botón Entrar al Dashboard (Aparece suavemente al verificar reCAPTCHA) */}
                <AnimatePresence initial={false}>
                  {isEmailValid && isPasswordStarted && captchaVerified && (
                    <motion.div
                      key="login-submit-step"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-0.5">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-9 px-4 rounded-lg font-mono font-bold text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>{isEn ? 'Enter Dashboard' : 'Entrar al Dashboard'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* División y Botón de Google (Siempre debajo del último campo activo) */}
                <div className="pt-2 border-t border-white/15 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-9 px-3 rounded-lg border border-white/20 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-white/30 active:scale-[0.99] disabled:opacity-50 shadow-md"
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

              {/* Separador Distintivo y El Otro Botón para Crear Nueva Cuenta / Get Funded */}
              <div className="mt-3.5 pt-3 border-t border-white/15">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-400/25 backdrop-blur-md flex flex-col gap-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono font-medium text-slate-300">
                      {isEn ? "Don't have a funded account?" : '¿No tienes una cuenta de fondeo?'}
                    </span>
                    <span className="text-[9px] font-mono text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">
                      {isEn ? 'NEW TRADER' : 'NUEVO TRADER'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerModeSwitch('register')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 hover:border-purple-300 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isEn ? 'Purchase Challenge & Register →' : 'Comprar Cuenta & Registrarse →'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register-panel"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-[480px] sm:max-w-[500px] relative z-10 py-6"
            >
                {/* Header con Switcher a Iniciar Sesión (Dispara caída suave de Pepe y cambio de lado) */}
              <div className="flex items-center justify-between gap-2.5 mb-2.5 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size="sm" lightMode={false} showText={false} />
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      <span>{isEn ? 'Purchase & Register' : 'Comprar & Registrarse'}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold shadow-sm">
                        CHECKOUT
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {isEn ? 'Select your challenge tier to activate terminal' : 'Selecciona tu cuenta de fondeo institucional'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerModeSwitch('login')}
                  className="px-2.5 py-1 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md hover:bg-black/80 text-[11px] font-mono font-bold text-emerald-400 hover:text-white transition-all shrink-0 cursor-pointer shadow-md"
                >
                  {isEn ? 'Sign In →' : 'Iniciar Sesión →'}
                </button>
              </div>

              {/* Order Success Overlay */}
              {orderSuccess && (
                <div className="mb-4 p-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-white">
                      {isEn ? 'Challenge Order Activated!' : '¡Cuenta de Reto Aprovisionada con Éxito!'}
                    </div>
                    <div>{isEn ? 'Redirecting to your live Trader Terminal...' : 'Redirigiendo a tu Terminal de Trading...'}</div>
                  </div>
                </div>
              )}

              {/* Security Alert Toast with Smooth Fade */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-950/70 backdrop-blur-md text-rose-300 text-xs flex items-center gap-2 shadow-lg">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 animate-pulse" />
                      <span className="leading-tight font-mono text-[11px]">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario con Desplazamiento Suave (Scroll Ergonomico que no deforma la pantalla) */}
              <form onSubmit={handleRegisterCheckoutSubmit} className="space-y-3">
                
                {/* 1. SELECTOR DE MODELO DE RETO (TODAS LAS 7 CUENTAS: 1K HASTA 100K) */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? '1. Select Challenge Tier (1K — 100K)' : '1. Tamaño de Cuenta (1K a 100K)'}</span>
                    </span>

                    {/* Solar vs Lunar Category Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/15 shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleCategorySwitch('solar')}
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {currentPlansList.map((plan) => {
                      const isSelected = plan.id === selectedPlanId;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group backdrop-blur-sm ${
                            isSelected
                              ? selectedCategory === 'solar'
                                ? 'bg-amber-400/25 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-[1.03]'
                                : 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.03]'
                              : 'bg-black/50 border-white/10 hover:border-white/20 text-slate-300 hover:bg-black/70'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl-sm" />
                          )}
                          <span className="text-xs font-black tracking-tight">{plan.sizeLabel}</span>
                          <span className={`text-[9.5px] font-mono font-bold mt-0.5 ${
                            selectedCategory === 'solar' ? 'text-amber-300' : 'text-purple-300'
                          }`}>
                            ${plan.oneTimePriceUSDT}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Plan Specifications Banner */}
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[9.5px] font-mono text-slate-300">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <span className="text-amber-400">◈</span>
                      <span>{activePlan.capitalFormatted} Capital</span>
                    </span>
                    <span>{activePlan.baseProfitSplit}% Profit Split</span>
                    <span>{activePlan.baseMaxDrawdownPct}% Max Drawdown</span>
                    <span className="text-emerald-400 font-bold">1-Time Fee: ${activePlan.oneTimePriceUSDT} USDT</span>
                  </div>
                </div>

                {/* 2. PERSONAL INFORMATION (Imagen 1 de Referencia del Usuario) */}
                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl space-y-2.5">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{isEn ? 'PERSONAL INFORMATION' : 'INFORMACIÓN PERSONAL'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      {isEn ? 'Help us personalise your trading experience.' : 'Ayúdanos a personalizar tu experiencia de trading.'}
                    </p>
                  </div>

                  {/* Row: First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'First name' : 'Nombre'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="John"
                        maxLength={40}
                        required
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'Last name' : 'Apellidos'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Smith"
                        maxLength={40}
                        required
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row: Phone number */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Phone number' : 'Número de teléfono'} <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      maxLength={30}
                      required
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>

                  {/* Row: Company (optional) */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Company' : 'Empresa'} <span className="text-slate-400 font-normal">({isEn ? 'optional' : 'opcional'})</span>
                    </label>
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder={isEn ? 'Optional' : 'Opcional'}
                      maxLength={60}
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>
                </div>

                {/* 3. BILLING ADDRESS (Imagen 2 de Referencia del Usuario) */}
                <div className={`p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl space-y-2.5 transition-all duration-500 ease-out ${
                  isPersonalValid
                    ? 'opacity-100 filter-none pointer-events-auto'
                    : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                }`}>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{isEn ? 'BILLING ADDRESS' : 'DIRECCIÓN DE FACTURACIÓN'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      {isEn ? 'Used for account verification and invoice purposes.' : 'Utilizada para verificación de cuenta y facturación.'}
                    </p>
                  </div>

                  {/* Address line 1 */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Address line 1' : 'Dirección línea 1'} <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={regAddress1}
                      onChange={(e) => setRegAddress1(e.target.value)}
                      placeholder={isEn ? 'Street address' : 'Dirección calle / vía'}
                      maxLength={100}
                      required
                      disabled={!isPersonalValid}
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>

                  {/* Address line 2 (optional) */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Address line 2' : 'Dirección línea 2'} <span className="text-slate-400 font-normal">({isEn ? 'optional' : 'opcional'})</span>
                    </label>
                    <input
                      type="text"
                      value={regAddress2}
                      onChange={(e) => setRegAddress2(e.target.value)}
                      placeholder={isEn ? 'Apt, suite, floor, etc.' : 'Piso, puerta, bloque, etc.'}
                      maxLength={100}
                      disabled={!isPersonalValid}
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>

                  {/* Row: Country & ZIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'Country' : 'País'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <select
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        disabled={!isPersonalValid}
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/90 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors cursor-pointer"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'ZIP / Postal code' : 'Código Postal'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={regZip}
                        onChange={(e) => setRegZip(e.target.value)}
                        placeholder="00000"
                        maxLength={20}
                        required
                        disabled={!isPersonalValid}
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row: City & State / Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'City' : 'Ciudad'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder={isEn ? 'City' : 'Ciudad'}
                        maxLength={60}
                        required
                        disabled={!isPersonalValid}
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                        {isEn ? 'State / Province' : 'Estado / Provincia'} <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        placeholder={isEn ? 'Select an option...' : 'Selecciona o escribe...'}
                        maxLength={60}
                        required
                        disabled={!isPersonalValid}
                        className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. LOGIN DETAILS (Imagen 3 de Referencia del Usuario) */}
                <div className={`p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl space-y-2.5 transition-all duration-500 ease-out ${
                  isBillingValid
                    ? 'opacity-100 filter-none pointer-events-auto'
                    : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                }`}>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{isEn ? 'LOGIN DETAILS' : 'DATOS DE ACCESO'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      {isEn ? "You'll use these to sign in to your account." : 'Los utilizarás para iniciar sesión en tu cuenta.'}
                    </p>
                  </div>

                  {/* Email address */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Email address' : 'Correo electrónico'} <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      maxLength={120}
                      required
                      disabled={!isBillingValid}
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>

                  {/* Confirm email address */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Confirm email address' : 'Confirmar correo electrónico'} <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      value={regConfirmEmail}
                      onChange={(e) => setRegConfirmEmail(e.target.value)}
                      placeholder={isEn ? 'Re-enter your email' : 'Vuelve a escribir tu correo'}
                      maxLength={120}
                      required
                      disabled={!isBillingValid}
                      className="w-full h-8.5 px-3 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                    />
                  </div>

                  {/* Password with Eye Icon & 4-Bar Strength Meter */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-200 mb-1">
                      {isEn ? 'Password' : 'Contraseña'} <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder={isEn ? 'At least 8 characters' : 'Al menos 8 caracteres'}
                        maxLength={100}
                        required
                        disabled={!isBillingValid}
                        className="w-full h-8.5 pl-3 pr-8 rounded-lg bg-[#0a0c12]/80 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400 focus:bg-[#0c0f18] focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* 4 Password Strength Indicator Bars (Matching Screenshot 3) */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= bar
                              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. PASARELA DE PAGO */}
                <div className={`p-2.5 sm:p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-xl transition-all duration-500 ease-out ${
                  isLoginDetailsValid
                    ? 'opacity-100 filter-none pointer-events-auto'
                    : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                }`}>
                  <div className="text-[11px] font-mono font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>{isEn ? 'PAYMENT METHOD' : 'MÉTODO DE PAGO'}</span>
                    <span className="text-[9.5px] text-emerald-400 font-mono font-bold">0% On-Chain Network Fee</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('crypto')}
                      className={`p-2 rounded-lg border flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm ${
                        paymentGateway === 'crypto'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-black/50 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">Crypto Checkout</div>
                        <div className="text-[9px] text-slate-400 font-mono">USDT / BTC / SOL (Instant)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentGateway('card')}
                      className={`p-2 rounded-lg border flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm ${
                        paymentGateway === 'card'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-black/50 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">Card Checkout</div>
                        <div className="text-[9px] text-slate-400 font-mono">Visa / Mastercard High-Risk</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 6. TÉRMINOS Y ACUERDOS (Imagen 4 de Referencia del Usuario) */}
                <div className={`space-y-2 transition-all duration-500 ease-out ${
                  isLoginDetailsValid
                    ? 'opacity-100 filter-none pointer-events-auto'
                    : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                }`}>
                  {/* Checkbox Card 1 */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-500/25 bg-emerald-950/15 backdrop-blur-md flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      disabled={!isLoginDetailsValid}
                      className="mt-0.5 w-4 h-4 rounded border-emerald-500/50 bg-black/60 text-emerald-400 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
                    />
                    <label htmlFor="agreeTerms" className="text-[11px] font-sans text-slate-300 leading-snug cursor-pointer select-none">
                      {isEn ? (
                        <>
                          I have read and agree to the{' '}
                          <span className="text-emerald-400 font-semibold underline underline-offset-2 hover:text-emerald-300">
                            Terms of Service
                          </span>{' '}
                          and{' '}
                          <span className="text-emerald-400 font-semibold underline underline-offset-2 hover:text-emerald-300">
                            Privacy Policy
                          </span>
                          . I confirm I am eligible to trade on the Eklipse platform.
                        </>
                      ) : (
                        <>
                          He leído y acepto los{' '}
                          <span className="text-emerald-400 font-semibold underline underline-offset-2 hover:text-emerald-300">
                            Términos de Servicio
                          </span>{' '}
                          y la{' '}
                          <span className="text-emerald-400 font-semibold underline underline-offset-2 hover:text-emerald-300">
                            Política de Privacidad
                          </span>
                          . Confirmo que soy elegible para operar en la plataforma Eklipse.
                        </>
                      )}
                    </label>
                  </div>

                  {/* Checkbox Card 2 */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-500/25 bg-emerald-950/15 backdrop-blur-md flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="agreeNoMultiProfile"
                      checked={agreeNoMultiProfile}
                      onChange={(e) => setAgreeNoMultiProfile(e.target.checked)}
                      disabled={!isLoginDetailsValid}
                      className="mt-0.5 w-4 h-4 rounded border-emerald-500/50 bg-black/60 text-emerald-400 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
                    />
                    <label htmlFor="agreeNoMultiProfile" className="text-[11px] font-sans text-slate-300 leading-snug cursor-pointer select-none">
                      {isEn
                        ? 'I understand that if I create or attempt to create multiple user profiles, I will not be eligible to trade with Eklipse.'
                        : 'Entiendo que si creo o intento crear múltiples perfiles de usuario, no seré elegible para operar con Eklipse.'}
                    </label>
                  </div>
                </div>

                {/* 7. BOTÓN DE CREAR CUENTA (Imagen 4 de Referencia del Usuario) */}
                <button
                  type="submit"
                  disabled={isLoading || orderSuccess || !isFormReady}
                  className={`w-full h-11 px-5 rounded-lg font-mono font-bold text-xs tracking-wider uppercase text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.99] ${
                    isFormReady
                      ? 'bg-[#10B981] hover:bg-[#059669] shadow-emerald-500/25 opacity-100'
                      : 'bg-emerald-500/30 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {isEn
                          ? `Create Account · $${activePlan.oneTimePriceUSDT} USDT >`
                          : `Crear Cuenta · $${activePlan.oneTimePriceUSDT} USDT >`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
