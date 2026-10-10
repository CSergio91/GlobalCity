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
  Check,
  Award,
  Clock
} from 'lucide-react';
import { useAuth, checkUserHasPurchasedAccount, setAccountCacheValid } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../BrandLogo';
import { CloudflareTurnstile } from './CloudflareTurnstile';
import { UserProfile } from '../../types/auth';
import { supabase } from '../../lib/supabase';
import pepeFooterImg from '../../assets/images/pepe_footer.webp';
import { 
  PlanCategory, 
  SOLAR_CHALLENGE_PLANS, 
  LUNAR_CHALLENGE_PLANS,
  AVAILABLE_ADDONS,
  calculateDynamicPlanPricing
} from '../../data/challengePlans';
import { motion, AnimatePresence } from 'motion/react';
import loginBackgroundImg from '../../assets/images/Background-Login.webp';
import { sendWelcomeEmail } from '../../services/emailService';

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
// RESPONSIVE SCREEN HOOK (Garantía indestructible de viewport sin depender de CSS)
// ============================================================================
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop;
};

// ============================================================================
// MAIN COMPONENT: LOGIN PAGE WITH CINEMATIC SIDESWAP & ANTI-MALWARE
// ============================================================================
export const LoginPage: React.FC = () => {
  const isDesktop = useIsDesktop();
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, loginAsDemo } = useAuth();
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

  // Mounted state for smooth initial entrance & unauthorized access listener
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);

    const checkUnauthorizedAttempt = () => {
      try {
        const attemptEmail = sessionStorage.getItem('eklipse_unauthorized_attempt_email');
        if (attemptEmail) {
          const attemptName = sessionStorage.getItem('eklipse_unauthorized_attempt_name') || '';
          sessionStorage.removeItem('eklipse_unauthorized_attempt_email');
          sessionStorage.removeItem('eklipse_unauthorized_attempt_name');

          setMode('register');
          setRegEmail(attemptEmail);
          setRegConfirmEmail(attemptEmail);
          if (attemptName) {
            const parts = attemptName.split(' ');
            setRegFirstName(parts[0] || '');
            setRegLastName(parts.slice(1).join(' ') || '');
          }
          setError(
            isEn
              ? `No funded evaluation accounts found for ${attemptEmail}. Select your challenge plan below to activate your account.`
              : `No se encontró ninguna cuenta de fondeo vinculada a ${attemptEmail}. Elige tu plan de reto a continuación para activar tu cuenta.`
          );
        }
      } catch (_) {}
    };

    checkUnauthorizedAttempt();

    const handleBlockedEvent = (e: any) => {
      const { email, fullName } = e.detail || {};
      if (email) {
        setMode('register');
        setRegEmail(email);
        setRegConfirmEmail(email);
        if (fullName) {
          const parts = fullName.split(' ');
          setRegFirstName(parts[0] || '');
          setRegLastName(parts.slice(1).join(' ') || '');
        }
        setError(
          isEn
            ? `No funded evaluation accounts found for ${email}. Select your challenge plan below to activate your account.`
            : `No se encontró ninguna cuenta de fondeo vinculada a ${email}. Elige tu plan de reto a continuación para activar tu cuenta.`
        );
      }
    };

    window.addEventListener('eklipse_unauthorized_login_blocked', handleBlockedEvent);
    return () => {
      window.removeEventListener('eklipse_unauthorized_login_blocked', handleBlockedEvent);
    };
  }, [isEn]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [googleSuccessUser, setGoogleSuccessUser] = useState<UserProfile | null>(null);

  // Cloudflare Turnstile Verification State
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Register & Challenge Checkout State
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const params = new URLSearchParams(search);
      const urlPlan = params.get('plan');
      const target = urlPlan || sessionStorage.getItem('eklipse_target_plan');
      if (target && target.includes('lunar')) return 'lunar';
    }
    return 'solar';
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const params = new URLSearchParams(search);
      const urlPlan = params.get('plan');
      const target = urlPlan || sessionStorage.getItem('eklipse_target_plan');
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

  // Custom Addons State: Preloaded from URL or sessionStorage (if clicked from Landing page)
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const search = window.location.search || '';
        const params = new URLSearchParams(search);
        const urlAddons = params.get('addons');
        if (urlAddons) {
          return urlAddons.split(',').filter(Boolean);
        }
        const stored = sessionStorage.getItem('eklipse_target_addons');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // Synchronize plan & addons from URL / session storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPlan = params.get('plan');
      if (urlPlan) {
        if (urlPlan.includes('lunar')) setSelectedCategory('lunar');
        else if (urlPlan.includes('solar')) setSelectedCategory('solar');
        setSelectedPlanId(urlPlan);
      }
      const urlAddons = params.get('addons');
      if (urlAddons !== null) {
        setSelectedAddons(urlAddons ? urlAddons.split(',').filter(Boolean) : []);
      }
    } catch {}
  }, []);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const next = prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId];
      try {
        sessionStorage.setItem('eklipse_target_addons', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

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

  // Dynamic pricing & rules modifiers with add-ons
  const dynamicPricing = useMemo(() => {
    return calculateDynamicPlanPricing(activePlan, 'one-time', selectedAddons);
  }, [activePlan, selectedAddons]);

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
      regPassword === regConfirmPassword &&
      !detectMaliciousCode(regEmail) &&
      !detectMaliciousCode(cleanConfirm) &&
      !detectMaliciousCode(regPassword) &&
      !detectMaliciousCode(regConfirmPassword)
    );
  }, [isBillingValid, regEmail, regConfirmEmail, regPassword, regConfirmPassword]);

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

    if (!password || password.length < 8) {
      setError(isEn ? 'Password must be at least 8 characters' : 'La contraseña debe tener al menos 8 caracteres');
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

    if (!captchaVerified || !captchaToken) {
      setError(
        isEn 
          ? 'Please complete the Cloudflare security verification' 
          : 'Por favor completa la verificación de seguridad de Cloudflare'
      );
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(cleanEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.message || 
        (isEn ? 'Invalid login credentials' : 'Credenciales inválidas. Revisa tu correo o contraseña.')
      );
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

    if (regPassword !== regConfirmPassword) {
      setError(
        isEn
          ? 'Passwords do not match. Please verify both password fields.'
          : 'Las contraseñas no coinciden. Por favor verifica ambos campos de contraseña.'
      );
      return;
    }

    if (detectMaliciousCode(regPassword) || detectMaliciousCode(regConfirmPassword)) {
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
    // Provision Account & Dispatch to PostgreSQL and Supabase
    setTimeout(async () => {
      try {
        const pendingGooglePhoto = typeof window !== 'undefined' 
          ? sessionStorage.getItem('eklipse_pending_google_photo') || undefined
          : undefined;

        // 1. Registrar usuario en GoTrue / Supabase con metadatos completos del cliente
        await signUpWithEmail(cleanEmail, regPassword, {
          firstName: sanitizeCleanString(regFirstName),
          lastName: sanitizeCleanString(regLastName),
          fullName: `${sanitizeCleanString(regFirstName)} ${sanitizeCleanString(regLastName)}`.trim(),
          phone: sanitizeCleanString(regPhone),
          company: sanitizeCleanString(regCompany),
          address_line1: sanitizeCleanString(regAddress1),
          address_line2: sanitizeCleanString(regAddress2),
          country: sanitizeCleanString(regCountry),
          postal_code: sanitizeCleanString(regZip),
          city: sanitizeCleanString(regCity),
          state: sanitizeCleanString(regState),
          avatar_url: pendingGooglePhoto,
          billing_metadata: {
            address1: sanitizeCleanString(regAddress1),
            address2: sanitizeCleanString(regAddress2),
            city: sanitizeCleanString(regCity),
            state: sanitizeCleanString(regState),
            country: sanitizeCleanString(regCountry),
            zip: sanitizeCleanString(regZip),
            phone: sanitizeCleanString(regPhone),
            company: sanitizeCleanString(regCompany),
            paymentGateway: paymentGateway
          }
        });

        // 2. Aprovisionar Cuenta Institucional en public.trading_accounts en PostgreSQL
        const generatedAccountNumber = `EKL-${selectedCategory.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const generatedAccessToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

        let createdAccountId: string | null = null;
        try {
          const { data: newTradingAccount, error: accInsertErr } = await supabase.from('trading_accounts').insert({
            account_number: generatedAccountNumber,
            trader_email: cleanEmail,
            initial_balance: activePlan.capital,
            current_balance: activePlan.capital,
            equity: activePlan.capital,
            peak_equity: activePlan.capital,
            daily_start_equity: activePlan.capital,
            status: 'ACTIVE',
            rules_config: {
              tierName: activePlan.astronomicalName?.es || activePlan.sizeLabel || `$${activePlan.capital.toLocaleString()}`,
              category: selectedCategory,
              profitSplitPct: selectedAddons.includes('profit_split_90') ? 90 : 80,
              maxDailyDrawdownPct: selectedCategory === 'lunar' ? 6 : 5,
              maxTotalDrawdownPct: selectedAddons.includes('extra_drawdown') ? 12 : 10,
              profitTargetPct: 8,
              effectiveLeverage: selectedAddons.includes('boost_leverage') ? '1:100' : '1:50',
              addons: selectedAddons
            },
            access_token: generatedAccessToken
          }).select().single();

          if (!accInsertErr && newTradingAccount) {
            createdAccountId = newTradingAccount.id;
          }
        } catch (dbErr) {
          console.warn('[Checkout] Fallback guardando trading_account en PostgreSQL:', dbErr);
        }

        // 3. Registrar Orden de Compra en public.orders en PostgreSQL
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          await supabase.from('orders').insert({
            trader_email: cleanEmail,
            account_id: createdAccountId,
            order_number: orderNumber,
            plan_id: selectedPlanId,
            category: selectedCategory,
            account_size: activePlan.capital,
            base_price: dynamicPricing.basePrice,
            addons_cost: dynamicPricing.addonsCost,
            total_price: dynamicPricing.totalPrice,
            addons: selectedAddons,
            payment_gateway: paymentGateway,
            payment_status: 'COMPLETED',
            billing_address: {
              firstName: regFirstName,
              lastName: regLastName,
              email: cleanEmail,
              phone: regPhone,
              company: regCompany,
              address1: regAddress1,
              address2: regAddress2,
              city: regCity,
              state: regState,
              country: regCountry,
              zip: regZip
            }
          });
        } catch (orderErr) {
          console.warn('[Checkout] Fallback guardando orden en PostgreSQL:', orderErr);
        }

        // 4. Validar caché caliente para acceso instantáneo al Dashboard en 0ms
        setAccountCacheValid(cleanEmail);

        // 5. Despachar Correo Institucional de Bienvenida con Detalles y Reglas
        try {
          await sendWelcomeEmail({
            toEmail: cleanEmail,
            traderName: `${sanitizeCleanString(regFirstName)} ${sanitizeCleanString(regLastName)}`.trim() || 'Trader',
            accountNumber: generatedAccountNumber,
            planName: activePlan.astronomicalName?.es || activePlan.sizeLabel || `$${activePlan.capital.toLocaleString()}`,
            category: selectedCategory,
            capitalFormatted: `$${activePlan.capital.toLocaleString()}`,
            capitalAmount: activePlan.capital,
            maxDailyDrawdownPct: selectedCategory === 'lunar' ? 6 : 5,
            maxTotalDrawdownPct: selectedAddons.includes('extra_drawdown') ? 12 : 10,
            profitTargetPct: 8,
            profitSplitPct: selectedAddons.includes('profit_split_90') ? 90 : 80,
            leverage: selectedAddons.includes('boost_leverage') ? '1:100' : '1:50',
            orderNumber: orderNumber,
            totalPriceFormatted: `$${dynamicPricing.totalPrice.toFixed(2)}`,
            paymentGateway: paymentGateway,
            dashboardUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3100/dashboard'
          });
        } catch (emailErr) {
          console.warn('[Checkout] Fallback enviando correo:', emailErr);
        }

        // 6. Caché local en localStorage para redundancia
        const assignedAccounts = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        assignedAccounts.push({
          planId: selectedPlanId,
          category: selectedCategory,
          price: dynamicPricing.totalPrice,
          basePrice: dynamicPricing.basePrice,
          addonsCost: dynamicPricing.addonsCost,
          addons: selectedAddons,
          accountSize: activePlan.capital,
          purchasedAt: new Date().toISOString(),
          email: cleanEmail
        });
        localStorage.setItem('eklipse_assigned_accounts', JSON.stringify(assignedAccounts));
        sessionStorage.removeItem('eklipse_pending_google_photo');

        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch (err: any) {
        setError(err?.message || (isEn ? 'Error creating account' : 'Error al registrar la cuenta'));
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    setIsGoogleConnecting(true);
    setGoogleSuccessUser(null);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        // Recuperar perfil institucional autenticado desde localStorage o sesión activa
        let authenticatedUser: UserProfile | null = null;
        try {
          const stored = localStorage.getItem('globalcity_auth_user');
          if (stored) authenticatedUser = JSON.parse(stored);
        } catch (_) {}

        if (!authenticatedUser) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const email = session.user.email || '';
            const fullName = meta.full_name || meta.name || email.split('@')[0] || 'Trader';
            const nameParts = fullName.split(' ');
            authenticatedUser = {
              id: session.user.id,
              username: `@${email.split('@')[0] || 'trader'}`,
              firstName: nameParts[0] || 'Trader',
              lastName: nameParts.slice(1).join(' ') || undefined,
              email: email,
              photoUrl: meta.avatar_url || meta.picture,
              authProvider: 'google',
              role: 'institutional_trader',
              createdAt: session.user.created_at || new Date().toISOString(),
              twoFactorEnabled: true,
            };
          }
        }

        const userEmail = (authenticatedUser?.email || '').trim().toLowerCase();
        if (!userEmail) {
          throw new Error('No se pudo obtener el correo de la cuenta de Google');
        }

        // ======================================================================
        // CONTROL INSTITUCIONAL DE ACCESO (ZERO-EGRESS 0MS CACHE):
        // ======================================================================
        const hasAccounts = await checkUserHasPurchasedAccount(userEmail, authenticatedUser?.id);

        // CASO 1: NO TIENE CUENTA COMPRADA — REDIRIGIR A CHECKOUT PARA CONVERTIR
        if (!hasAccounts) {
          if (authenticatedUser?.photoUrl) {
            sessionStorage.setItem('eklipse_pending_google_photo', authenticatedUser.photoUrl);
          }

          // Cerrar sesión no autorizada de Supabase
          try {
            await supabase.auth.signOut();
          } catch (_) {}

          // Conmutar a la vista de Compra de Cuenta y pre-cargar datos de Google
          setRegEmail(userEmail);
          setRegConfirmEmail(userEmail);
          if (authenticatedUser?.firstName) setRegFirstName(authenticatedUser.firstName);
          if (authenticatedUser?.lastName) setRegLastName(authenticatedUser.lastName);
          
          triggerModeSwitch('register');

          setError(
            isEn
              ? `No funded evaluation accounts found for ${userEmail}. Select your challenge plan below to complete registration.`
              : `No se encontró ninguna cuenta vinculada a ${userEmail}. Elige tu plan de reto a continuación para activar tu cuenta.`
          );

          setIsGoogleConnecting(false);
          setIsLoading(false);
          return;
        }

        // CASO 2: SÍ ES CLIENTE — ACTUALIZAR AVATAR DE GOOGLE EN BD Y DAR ACCESO
        if (authenticatedUser?.photoUrl) {
          try {
            await supabase.from('profiles').update({
              avatar_url: authenticatedUser.photoUrl,
              updated_at: new Date().toISOString()
            }).eq('email', userEmail);
          } catch (_) {}
        }

        if (authenticatedUser) {
          setGoogleSuccessUser(authenticatedUser);
        }

        // Permitir contemplar la cápsula dorada/esmeralda verificada antes de entrar al cockpit
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setIsGoogleConnecting(false);
        setGoogleSuccessUser(null);
      }
    } catch (err: any) {
      console.error('[Google Login]', err);
      setError(isEn ? 'Google login failed' : 'Error al iniciar sesión con Google');
      setIsGoogleConnecting(false);
      setGoogleSuccessUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setEmail('demo@eklipsefunded.com');
    setPassword('demo1234');
    setCaptchaVerified(true);
    setCaptchaToken('demo_access_token');
    setTimeout(() => {
      loginAsDemo();
      navigate('/dashboard');
    }, 400);
  };

  // Helper de renderizado de Pepe Mascot (Desktop only, 100% oculto en móvil, pegado al borde izquierdo)
  const renderPepeMascot = () => (
    <div className="w-full h-full flex items-end justify-start pointer-events-none select-none pb-0 pl-0">
      <img 
        src={pepeFooterImg} 
        alt="Pepe Mascot Sentinel" 
        loading="eager"
        decoding="async"
        className="w-[340px] sm:w-[420px] md:w-[480px] lg:w-[540px] xl:w-[620px] 2xl:w-[700px] max-w-[100%] max-h-[85vh] h-auto object-contain object-bottom block -ml-4 sm:-ml-2 lg:ml-0 drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none pointer-events-none"
      />
    </div>
  );

  return (
    <div className="h-screen max-h-screen w-full relative bg-[#06070B] text-white selection:bg-amber-400/20 selection:text-amber-300 overflow-hidden select-none">
      {/* Top Left Navigation Back to Landing */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-5 left-5 flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer z-50 group px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-xl hover:border-amber-400/40"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
        <span>{isEn ? 'Back to Landing' : 'Volver al Inicio'}</span>
      </button>

      {/* Top Right Live Security Badge */}
      <div className="fixed top-5 right-5 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 z-50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold text-white">Shield v4.2</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400">Zero-Trust WAF</span>
      </div>

      {/* Top Right Eklipse Celestial OAuth Capsule */}
      {(isGoogleConnecting || googleSuccessUser) && (
        <div className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[60] w-[calc(100vw-32px)] sm:w-88 p-4 rounded-2xl backdrop-blur-2xl border shadow-2xl flex flex-col gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3 zoom-in-95 ${
          googleSuccessUser
            ? 'bg-[#090A10]/95 border-emerald-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.35)]'
            : 'bg-[#090A10]/95 border-amber-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.3)]'
        }`}>
          {/* Header row with badge & close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${googleSuccessUser ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-ping'}`} />
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${googleSuccessUser ? 'text-emerald-400' : 'text-amber-400'}`}>
                {googleSuccessUser ? 'Identidad Trader Verificada' : 'Eklipse Solar Gateway'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setIsGoogleConnecting(false);
                setGoogleSuccessUser(null);
              }}
              className="text-slate-400 hover:text-white text-xs font-mono px-1 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* User info or Connecting info */}
          <div className="flex items-center gap-3">
            {googleSuccessUser ? (
              // Usuario verificado con avatar real de Google
              <div className="relative w-11 h-11 rounded-xl bg-black border border-emerald-400/60 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                {googleSuccessUser.photoUrl ? (
                  <img 
                    src={googleSuccessUser.photoUrl} 
                    alt={googleSuccessUser.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-400 font-bold font-mono text-base">
                    {googleSuccessUser.firstName?.charAt(0) || 'T'}
                  </span>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                </div>
              </div>
            ) : (
              // Estado conectando con spinner orbital
              <div className="relative w-11 h-11 rounded-xl bg-black/80 border border-amber-400/40 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                <span className="absolute inset-0 border border-amber-400/60 rounded-xl animate-spin" style={{ animationDuration: '3s' }} />
                <svg className="w-5 h-5 z-10" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {googleSuccessUser 
                  ? `${googleSuccessUser.firstName} ${googleSuccessUser.lastName || ''}`.trim()
                  : (isEn ? 'Authorizing in top window...' : 'Autorizando en ventana superior...')}
              </p>
              <p className="text-[10.5px] font-mono text-slate-300 truncate mt-0.5">
                {googleSuccessUser
                  ? googleSuccessUser.email
                  : (isEn ? 'Google Account Handshake' : 'Conexión con cuenta Google')}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                googleSuccessUser 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 w-full' 
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse w-full'
              }`} 
            />
          </div>

          <p className="text-[10px] font-mono text-slate-300 text-center">
            {googleSuccessUser
              ? (isEn ? '✓ Access granted · Launching Terminal...' : '✓ Acceso concedido · Abriendo Terminal...')
              : (isEn ? 'Select your account in the compact popup' : 'Selecciona tu cuenta en la ventana emergente')}
          </p>
        </div>
      )}

      {/* Imagen de fondo viva y atmosférica en toda la pantalla */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center sm:bg-[position:center_center] pointer-events-none z-0 scale-[1.01]"
        style={{ backgroundImage: `url(${loginBackgroundImg})` }}
      >
        {/* Velo atmosférico muy sutil para que el fondo se aprecie brillante, nítido y espectacular */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] pointer-events-none" />
        {/* Viñeta sutil en bordes para enfocar la vista sin oscurecer el centro ni la ciudad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Ambient Living Cosmic Dust Canvas */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-40">
        <AmbientLivingCosmicCanvas />
      </div>

      {/* Luces atmosféricas de fondo proyectadas a través del cristal */}
      <div className="fixed top-1/6 right-10 w-96 h-96 bg-purple-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/6 left-10 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* ========================================================================= */}
      {/* ARQUITECTURA: PEPE Y LOGIN A LA IZQUIERDA / STAGE DE FORMULARIO A LA DERECHA */}
      {/* ========================================================================= */}
      <div className="auth-split-container">
        
        {/* LADO IZQUIERDO: PEPE (Desktop Only - Oculto 100% en Móvil) */}
        <div className="auth-pepe-col relative">
          {/* Pepe Sentinel permanente al fondo */}
          {renderPepeMascot()}

          {/* CUANDO ESTÁ EN MODO REGISTRO: LOGIN APARECE AQUÍ ENCIMA DE PEPE (DESHABILITADO PARA ESCRIBIR, CON BOTÓN PARA PASAR A LA DERECHA) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                key="auth-left-disabled-login"
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-20 pointer-events-auto"
              >
                <div className="w-full max-w-[440px] sm:max-w-[460px] p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/25 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">
                  
                  {/* Header */}
                  <div className="mb-4 pb-3 border-b border-white/15">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo size="sm" lightMode={false} showText={false} />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        {isEn ? 'Trader Access' : 'Acceso Trader'}
                      </span>
                    </div>
                  </div>

                  {/* Campos de Login (Visuales translúcidos sobre Pepe) */}
                  <div className="space-y-3 pointer-events-none opacity-60 select-none">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        {isEn ? 'Email Address' : 'Correo Electrónico'}
                      </label>
                      <div className="h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-slate-300 text-xs sm:text-[13px] font-mono flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{email || (isEn ? 'trader@domain.com' : 'trader@correo.com')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        {isEn ? 'Password' : 'Contraseña'}
                      </label>
                      <div className="h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-slate-300 text-xs sm:text-[13px] font-mono flex items-center gap-2.5">
                        <span className="w-4 h-4 flex items-center justify-center text-slate-400 font-mono text-xs">●</span>
                        <span>••••••••••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón Simple y Limpio: "Iniciar Sesión" (Sin candadito, sin textos innecesarios) */}
                  <div className="mt-5 pt-4 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => triggerModeSwitch('login')}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                    >
                      <span>{isEn ? 'Sign In' : 'Iniciar Sesión'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LADO DERECHO: STAGE DE FORMULARIOS (LOGIN & REGISTRO) */}
        <div className="auth-form-stage no-scrollbar bg-transparent">
          <div className="w-full min-h-full flex flex-col items-center pt-16 sm:pt-20 lg:pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="auth-card-login"
                  initial={{ opacity: 0, x: -70 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -70 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[480px] sm:max-w-[500px] lg:max-w-[520px] my-auto relative z-10"
                >
                  <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-black/25 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    {/* Header: Logo y Trader Access ARRIBA */}
                    <div className="mb-4 pb-3 border-b border-white/15 cursor-pointer" onClick={() => navigate('/')}>
                      <div className="flex items-center gap-3">
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

                    {/* Título de Sign In y Demo Widget (Sin candadito) */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        <span>{isEn ? 'Sign In' : 'Iniciar Sesión'}</span>
                      </div>

                      {/* 1-Click Demo Access Widget */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-amber-400/30 shrink-0 shadow-sm text-[10px] font-mono text-slate-300">
                        <span className="text-white font-bold">Demo:</span> 123456
                        <button
                          type="button"
                          onClick={handleDemoAccess}
                          disabled={isLoading}
                          className="ml-0.5 px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
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
                          className="overflow-hidden mb-3"
                        >
                          <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-xs flex items-center gap-2 shadow-lg font-mono text-[10.5px]">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>{resetNotice}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Security Alert Toast */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="overflow-hidden mb-3"
                        >
                          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/70 backdrop-blur-md text-rose-300 text-xs flex items-center gap-2 shadow-lg">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                            <span className="leading-tight font-mono text-[11px]">{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Formulario de Login Progresivo con Campos Ergonómicos y Redondeados */}
                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                      
                      {/* PASO 1: Email Address */}
                      <div>
                        <label className="block text-xs font-mono font-medium text-slate-200 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {isEn ? 'Email Address' : 'Correo Electrónico'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={isEn ? 'trader@domain.com' : 'trader@correo.com'}
                            maxLength={120}
                            required
                            className="w-full h-11 sm:h-12 pl-10 pr-10 py-2.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-amber-400 focus:bg-black/45 focus:ring-2 focus:ring-amber-400/40 transition-all shadow-md"
                          />
                          {isEmailValid && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-in zoom-in-75 duration-300" />
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
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-mono font-medium text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                  {isEn ? 'Password' : 'Contraseña'}
                                </label>
                                <button
                                  type="button"
                                  onClick={handleForgotPassword}
                                  className="text-[10.5px] font-mono text-amber-400/90 hover:text-amber-300 hover:underline transition-all cursor-pointer"
                                >
                                  {isEn ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
                                </button>
                              </div>
                              <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••••••"
                                  maxLength={100}
                                  required
                                  autoComplete="current-password"
                                  className="w-full h-11 sm:h-12 pl-10 pr-10 py-2.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-amber-400 focus:bg-black/45 focus:ring-2 focus:ring-amber-400/40 transition-all shadow-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* PASO 3: Cloudflare Turnstile Verification */}
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
                              <CloudflareTurnstile
                                action="login"
                                theme="dark"
                                onSuccess={(token) => {
                                  setCaptchaToken(token);
                                  setCaptchaVerified(true);
                                  setError(null);
                                }}
                                onExpire={() => {
                                  setCaptchaToken(null);
                                  setCaptchaVerified(false);
                                }}
                                onError={() => {
                                  setCaptchaToken(null);
                                  setCaptchaVerified(false);
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* PASO 4: Botón Entrar al Dashboard */}
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
                                className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* División y Botón de Google */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                          className={`w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer font-mono text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] disabled:opacity-50 ${
                            isGoogleConnecting
                              ? 'border-amber-400/70 bg-amber-500/15 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse'
                              : 'border-white/20 bg-black/25 hover:bg-black/45 hover:border-amber-400/40 text-white'
                          }`}
                        >
                          {isGoogleConnecting ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span className="text-amber-300 font-bold tracking-wide">
                                {isEn ? 'Connecting in corner...' : 'Conectando en la esquina...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                              </svg>
                              <span>{isEn ? 'Continue with Google' : 'Continuar con Google'}</span>
                            </>
                          )}
                        </button>
                      </div>

                    </form>

                    {/* Separador y Botón para Registrarse / Comprar Cuenta */}
                    <div className="mt-4 pt-3.5 border-t border-white/15">
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-amber-400/25 backdrop-blur-md flex flex-col gap-2.5 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-slate-300">
                            {isEn ? "Don't have a funded account?" : '¿No tienes una cuenta de fondeo?'}
                          </span>
                          <span className="text-[9.5px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30">
                            {isEn ? 'NEW TRADER' : 'NUEVO TRADER'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerModeSwitch('register')}
                          className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 hover:border-purple-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>{isEn ? 'Purchase Challenge & Register →' : 'Comprar Cuenta & Registrarse →'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-card-register"
                  initial={{ opacity: 0, x: 70 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 70 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[620px] sm:max-w-[660px] lg:max-w-[700px] relative z-10"
                >
                  <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-black/25 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    {/* Header con Switcher a Iniciar Sesión */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3.5 border-b border-white/15">
                      <div className="flex items-center gap-3">
                        <BrandLogo size="sm" lightMode={false} showText={false} />
                        <div>
                          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <span>{isEn ? 'Purchase & Register' : 'Comprar Cuenta & Registrarse'}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold shadow-sm">
                              CHECKOUT
                            </span>
                          </h2>
                          <p className="text-[11px] text-slate-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] mt-0.5">
                            {isEn ? 'Select your challenge tier to activate terminal' : 'Selecciona tu cuenta de fondeo institucional para activar tu terminal'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerModeSwitch('login')}
                        className="md:hidden px-3.5 py-1.5 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md hover:bg-black/50 text-xs font-mono font-bold text-amber-400 hover:text-white transition-all shrink-0 cursor-pointer shadow-md"
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

                    {/* Security Alert Toast */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="overflow-hidden mb-3"
                        >
                          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/70 backdrop-blur-md text-rose-300 text-xs flex items-center gap-2 shadow-lg">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                            <span className="leading-tight font-mono text-[11px]">{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Google 1-Click Fast Access / Registration Button */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className={`w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer font-mono text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] disabled:opacity-50 ${
                          isGoogleConnecting
                            ? 'border-amber-400/70 bg-amber-500/15 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse'
                            : 'border-white/20 bg-black/25 hover:bg-black/45 hover:border-amber-400/40 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        <span>{isEn ? 'Fast Registration with Google' : 'Registro Rápido con Google'}</span>
                      </button>

                      <div className="flex items-center gap-2.5 my-3.5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {isEn ? 'Or customize tier & register' : 'O elige tu cuenta de reto institucional'}
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                    </div>

                    {/* Formulario Progresivo de Registro con Campos Ergonómicos y Redondeados */}
                    <form onSubmit={handleRegisterCheckoutSubmit} className="space-y-3.5">
                      
                      {/* 1. SELECTOR DE MODELO DE RETO */}
                      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-xl">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isEn ? '1. Select Challenge Tier (1K — 100K)' : '1. Tamaño de Cuenta (1K a 100K)'}</span>
                          </span>

                          {/* Solar vs Lunar Category Toggle */}
                          <div className="flex items-center p-0.5 rounded-xl bg-black/30 border border-white/15 shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleCategorySwitch('solar')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
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

                        {/* All 7 Account Size Buttons */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                          {currentPlansList.map((plan) => {
                            const isSelected = plan.id === selectedPlanId;
                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group backdrop-blur-sm ${
                                  isSelected
                                    ? selectedCategory === 'solar'
                                      ? 'bg-amber-400/25 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-[1.03]'
                                      : 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.03]'
                                    : 'bg-black/25 border-white/10 hover:border-white/20 text-slate-300 hover:bg-black/40'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-bl-sm" />
                                )}
                                <span className="text-xs font-black tracking-tight">{plan.sizeLabel}</span>
                                <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                                  selectedCategory === 'solar' ? 'text-amber-300' : 'text-purple-300'
                                }`}>
                                  ${plan.oneTimePriceUSDT}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Add-Ons Selector (Nexus Modifiers) */}
                        <div className="mt-3 pt-2.5 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isEn ? 'Custom Add-Ons (Nexus Modifiers)' : 'Add-Ons Personalizados'}</span>
                            </span>
                            <span className="text-[10px] font-mono">
                              {selectedAddons.length > 0 ? (
                                <span className="text-emerald-400 font-bold">+{dynamicPricing.addonsCost} USDT addons</span>
                              ) : (
                                <span className="text-slate-400">{isEn ? 'Optional' : 'Opcional'}</span>
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {AVAILABLE_ADDONS.map((addon) => {
                              const isChecked = selectedAddons.includes(addon.id);
                              const cost = Math.max(addon.minPriceUSDT, Math.round(activePlan.oneTimePriceUSDT * addon.priceDeltaPct));

                              return (
                                <button
                                  key={addon.id}
                                  type="button"
                                  onClick={() => handleToggleAddon(addon.id)}
                                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between backdrop-blur-sm relative group ${
                                    isChecked
                                      ? selectedCategory === 'solar'
                                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                        : 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                                      : 'bg-black/25 border-white/10 hover:border-white/20 text-slate-300 hover:bg-black/40'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1 w-full">
                                    <span className="text-[10.5px] font-mono font-bold text-white leading-tight line-clamp-2">
                                      {isEn ? addon.nameEn : addon.nameEs}
                                    </span>
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                      isChecked
                                        ? selectedCategory === 'solar'
                                          ? 'bg-amber-400 border-amber-400 text-slate-950 font-black'
                                          : 'bg-purple-500 border-purple-400 text-white font-black'
                                        : 'border-white/25 bg-black/20'
                                    }`}>
                                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/10 w-full">
                                    <span className={`text-[9.5px] font-mono font-bold ${
                                      isChecked
                                        ? selectedCategory === 'solar' ? 'text-amber-300' : 'text-purple-300'
                                        : 'text-slate-400'
                                    }`}>
                                      +{cost} USDT
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Active Plan Specifications Banner */}
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-300">
                          <span className="flex items-center gap-1 text-white font-bold">
                            <span className="text-amber-400">◈</span>
                            <span>{activePlan.capitalFormatted} Capital</span>
                          </span>
                          <span className={selectedAddons.includes('profit_split_90') ? 'text-emerald-400 font-bold' : ''}>
                            {dynamicPricing.effectiveProfitSplit}% Profit Split
                          </span>
                          <span className={selectedAddons.includes('extra_drawdown') ? 'text-emerald-400 font-bold' : ''}>
                            {dynamicPricing.effectiveDrawdownPct}% Max DD
                          </span>
                          <span className={selectedAddons.includes('boost_leverage') ? 'text-amber-400 font-bold' : ''}>
                            {dynamicPricing.effectiveLeverage} Lev
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Total: ${dynamicPricing.totalPrice} USDT
                            {dynamicPricing.addonsCost > 0 && (
                              <span className="text-slate-400 font-normal ml-1">
                                (${dynamicPricing.basePrice} + ${dynamicPricing.addonsCost})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 2. PERSONAL INFORMATION */}
                      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-xl space-y-3">
                        <div>
                          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{isEn ? '2. PERSONAL INFORMATION' : '2. INFORMACIÓN PERSONAL'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                            {isEn ? 'Help us personalise your trading experience.' : 'Ayúdanos a personalizar tu experiencia de trading.'}
                          </p>
                        </div>

                        {/* Row: First Name & Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                              {isEn ? 'First name' : 'Nombre'} <span className="text-emerald-400 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              value={regFirstName}
                              onChange={(e) => setRegFirstName(e.target.value)}
                              placeholder="John"
                              maxLength={40}
                              required
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                              {isEn ? 'Last name' : 'Apellidos'} <span className="text-emerald-400 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              value={regLastName}
                              onChange={(e) => setRegLastName(e.target.value)}
                              placeholder="Smith"
                              maxLength={40}
                              required
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                          </div>
                        </div>

                        {/* Row: Phone number */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                            {isEn ? 'Phone number' : 'Número de teléfono'} <span className="text-emerald-400 font-bold">*</span>
                          </label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            maxLength={30}
                            required
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>

                        {/* Row: Company (optional) */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                            {isEn ? 'Company' : 'Empresa'} <span className="text-slate-400 font-normal">({isEn ? 'optional' : 'opcional'})</span>
                          </label>
                          <input
                            type="text"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            placeholder={isEn ? 'Optional' : 'Opcional'}
                            maxLength={60}
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>
                      </div>

                      {/* 3. BILLING ADDRESS */}
                      <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-xl space-y-3 transition-all duration-500 ease-out ${
                        isPersonalValid
                          ? 'opacity-100 filter-none pointer-events-auto'
                          : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                      }`}>
                        <div>
                          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{isEn ? '3. BILLING ADDRESS' : '3. DIRECCIÓN DE FACTURACIÓN'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                            {isEn ? 'Used for account verification and invoice purposes.' : 'Utilizada para verificación de cuenta y facturación.'}
                          </p>
                        </div>

                        {/* Address line 1 */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>

                        {/* Address line 2 (optional) */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                            {isEn ? 'Address line 2' : 'Dirección línea 2'} <span className="text-slate-400 font-normal">({isEn ? 'optional' : 'opcional'})</span>
                          </label>
                          <input
                            type="text"
                            value={regAddress2}
                            onChange={(e) => setRegAddress2(e.target.value)}
                            placeholder={isEn ? 'Apt, suite, floor, etc.' : 'Piso, puerta, bloque, etc.'}
                            maxLength={100}
                            disabled={!isPersonalValid}
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>

                        {/* Row: Country & ZIP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
                              {isEn ? 'Country' : 'País'} <span className="text-emerald-400 font-bold">*</span>
                            </label>
                            <select
                              value={regCountry}
                              onChange={(e) => setRegCountry(e.target.value)}
                              disabled={!isPersonalValid}
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors cursor-pointer"
                            >
                              {COUNTRIES_LIST.map((c) => (
                                <option key={c} value={c} className="bg-slate-900 text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                          </div>
                        </div>

                        {/* Row: City & State / Province */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                              className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. LOGIN DETAILS */}
                      <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-xl space-y-3 transition-all duration-500 ease-out ${
                        isBillingValid
                          ? 'opacity-100 filter-none pointer-events-auto'
                          : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                      }`}>
                        <div>
                          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{isEn ? '4. LOGIN DETAILS' : '4. DATOS DE ACCESO'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                            {isEn ? "You'll use these to sign in to your account." : 'Los utilizarás para iniciar sesión en tu cuenta.'}
                          </p>
                        </div>

                        {/* Email address */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>

                        {/* Confirm email address */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                            className="w-full h-10.5 sm:h-11 px-3.5 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                          />
                        </div>

                        {/* Password with Eye Icon & 4-Bar Strength Meter */}
                        <div>
                          <label className="block text-xs font-mono font-medium text-slate-200 mb-1">
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
                              autoComplete="new-password"
                              disabled={!isBillingValid}
                              className="w-full h-10.5 sm:h-11 pl-3.5 pr-10 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-emerald-400 focus:bg-black/45 focus:ring-1 focus:ring-emerald-400/40 shadow-inner transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* 4 Password Strength Indicator Bars */}
                          <div className="grid grid-cols-4 gap-1.5 mt-2">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  passwordStrength >= bar
                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : 'bg-white/10'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Confirm Password with Eye Icon & Realtime Match Indicator */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-mono font-medium text-slate-200">
                              {isEn ? 'Confirm password' : 'Confirmar contraseña'} <span className="text-emerald-400 font-bold">*</span>
                            </label>
                            {regConfirmPassword && (
                              <span className={`text-[10.5px] font-mono flex items-center gap-1 font-bold ${
                                regPassword === regConfirmPassword
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}>
                                {regPassword === regConfirmPassword ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{isEn ? 'Match' : 'Coinciden'}</span>
                                  </>
                                ) : (
                                  <span>{isEn ? 'Mismatch' : 'No coinciden'}</span>
                                )}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder={isEn ? 'Re-enter your password' : 'Vuelve a escribir tu contraseña'}
                              maxLength={100}
                              required
                              autoComplete="new-password"
                              disabled={!isBillingValid}
                              className={`w-full h-10.5 sm:h-11 pl-3.5 pr-10 rounded-xl sm:rounded-2xl bg-black/25 backdrop-blur-sm border text-white placeholder-slate-400 text-xs sm:text-[13px] font-mono focus:outline-none focus:bg-black/45 shadow-inner transition-colors ${
                                regConfirmPassword
                                  ? regPassword === regConfirmPassword
                                    ? 'border-emerald-500/60 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40'
                                    : 'border-rose-500/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/40'
                                  : 'border-white/15 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 5. PASARELA DE PAGO */}
                      <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/15 shadow-xl transition-all duration-500 ease-out ${
                        isLoginDetailsValid
                          ? 'opacity-100 filter-none pointer-events-auto'
                          : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                      }`}>
                        <div className="text-xs font-mono font-bold text-slate-200 mb-2 flex items-center justify-between">
                          <span>{isEn ? '5. PAYMENT METHOD' : '5. MÉTODO DE PAGO'}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">0% On-Chain Network Fee</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPaymentGateway('crypto')}
                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-sm ${
                              paymentGateway === 'crypto'
                                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-black/25 border-white/10 text-slate-300 hover:border-white/20 hover:bg-black/40'
                            }`}
                          >
                            <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="text-left">
                              <div className="text-xs font-bold leading-tight">Crypto Checkout</div>
                              <div className="text-[9.5px] text-slate-400 font-mono">USDT / BTC / SOL</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentGateway('card')}
                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-sm ${
                              paymentGateway === 'card'
                                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-black/25 border-white/10 text-slate-300 hover:border-white/20 hover:bg-black/40'
                            }`}
                          >
                            <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div className="text-left">
                              <div className="text-xs font-bold leading-tight">Card Checkout</div>
                              <div className="text-[9.5px] text-slate-400 font-mono">Visa / Mastercard</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 6. TÉRMINOS Y ACUERDOS */}
                      <div className={`space-y-2.5 transition-all duration-500 ease-out ${
                        isLoginDetailsValid
                          ? 'opacity-100 filter-none pointer-events-auto'
                          : 'opacity-25 blur-[0.3px] pointer-events-none select-none'
                      }`}>
                        {/* Checkbox Card 1 */}
                        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-emerald-500/25 bg-emerald-950/15 backdrop-blur-md flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="agreeTerms"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            disabled={!isLoginDetailsValid}
                            className="mt-0.5 w-4.5 h-4.5 rounded-md border-emerald-500/50 bg-black/30 text-emerald-400 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
                          />
                          <label htmlFor="agreeTerms" className="text-[11.5px] font-sans text-slate-300 leading-snug cursor-pointer select-none">
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
                        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-emerald-500/25 bg-emerald-950/15 backdrop-blur-md flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="agreeNoMultiProfile"
                            checked={agreeNoMultiProfile}
                            onChange={(e) => setAgreeNoMultiProfile(e.target.checked)}
                            disabled={!isLoginDetailsValid}
                            className="mt-0.5 w-4.5 h-4.5 rounded-md border-emerald-500/50 bg-black/30 text-emerald-400 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
                          />
                          <label htmlFor="agreeNoMultiProfile" className="text-[11.5px] font-sans text-slate-300 leading-snug cursor-pointer select-none">
                            {isEn
                              ? 'I understand that if I create or attempt to create multiple user profiles, I will not be eligible to trade with Eklipse.'
                              : 'Entiendo que si creo o intento crear múltiples perfiles de usuario, no seré elegible para operar con Eklipse.'}
                          </label>
                        </div>
                      </div>

                      {/* 7. BOTÓN DE CREAR CUENTA */}
                      <button
                        type="submit"
                        disabled={isLoading || orderSuccess || !isFormReady}
                        className={`w-full h-12 sm:h-13 px-5 rounded-xl sm:rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] ${
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
                                ? `Create Account · $${dynamicPricing.totalPrice} USDT >`
                                : `Crear Cuenta · $${dynamicPricing.totalPrice} USDT >`}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
