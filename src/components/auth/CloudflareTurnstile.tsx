import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          'error-callback'?: (error: any) => void;
          'expired-callback'?: () => void;
          'timeout-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          appearance?: 'always' | 'execute' | 'interaction-only';
          retry?: 'auto' | 'never';
          'retry-interval'?: number;
          'refresh-expired'?: 'auto' | 'manual' | 'never';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export interface CloudflareTurnstileProps {
  onSuccess: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpire?: () => void;
  action?: string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

// Cloudflare official test keys:
// '3x00000000000000000000FF': Always passes with interactive challenge (ideal fallback on localhost)
// '1x00000000000000000000AA': Always passes non-interactive
const CLOUDFLARE_TEST_INTERACTIVE_KEY = '3x00000000000000000000FF';

export const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({
  onSuccess,
  onError,
  onExpire,
  action = 'login',
  theme = 'dark',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const configuredKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFLVenRf1JsvExUr';
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost')
  );
  const [activeSiteKey, setActiveSiteKey] = useState<string>(isLocalHost ? CLOUDFLARE_TEST_INTERACTIVE_KEY : configuredKey);

  const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'expired' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or re-render widget
  const renderWidget = useCallback((keyToUse: string) => {
    if (!containerRef.current || typeof window === 'undefined' || !window.turnstile) {
      return false;
    }

    try {
      // Remove any existing widget before re-rendering
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';

      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: keyToUse,
        action,
        theme,
        size: 'flexible',
        callback: (token: string) => {
          setStatus('verified');
          setErrorMessage(null);
          onSuccess(token);
        },
        'error-callback': (errCode: any) => {
          console.warn('[Cloudflare Turnstile] Challenge error code:', errCode);

          // Si el dominio local (localhost / 127.0.0.1) no está habilitado en el sitekey de producción de Cloudflare:
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isLocal && keyToUse !== CLOUDFLARE_TEST_INTERACTIVE_KEY) {
            console.info('[Cloudflare Turnstile] Conmutando a clave interactiva de pruebas de Cloudflare para localhost.');
            setActiveSiteKey(CLOUDFLARE_TEST_INTERACTIVE_KEY);
            return;
          }

          setStatus('error');
          setErrorMessage(typeof errCode === 'string' ? errCode : 'Error de verificación');
          onError?.(String(errCode));
        },
        'expired-callback': () => {
          setStatus('expired');
          onExpire?.();
        },
      });

      widgetIdRef.current = widgetId;
      setStatus('ready');
      return true;
    } catch (err: any) {
      console.warn('[Cloudflare Turnstile] Error al inicializar render:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Error al cargar Turnstile');
      return false;
    }
  }, [action, theme, onSuccess, onError, onExpire]);

  // Load and check Turnstile library
  useEffect(() => {
    let checkInterval: any = null;
    let attempts = 0;

    // Inyectar dinámicamente el SDK si no está presente en el documento
    if (typeof window !== 'undefined' && !window.turnstile) {
      const existing = document.querySelector('script[src*="turnstile/v0/api.js"]');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'cloudflare-turnstile-sdk';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    const tryInit = () => {
      attempts++;
      if (window.turnstile) {
        if (checkInterval) clearInterval(checkInterval);
        renderWidget(activeSiteKey);
      } else if (attempts >= 40) {
        // Fallback after 4 seconds if script failed to load (e.g. adblocker)
        if (checkInterval) clearInterval(checkInterval);
        setStatus('error');
        setErrorMessage('Cloudflare Turnstile SDK no disponible (bloqueador o red)');
      }
    };

    if (window.turnstile) {
      renderWidget(activeSiteKey);
    } else {
      checkInterval = setInterval(tryInit, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [activeSiteKey, renderWidget]);

  const handleManualReset = () => {
    setStatus('loading');
    setErrorMessage(null);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (_) {
        renderWidget(activeSiteKey);
      }
    } else {
      renderWidget(activeSiteKey);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Contenedor oficial del iframe interactivo de Cloudflare */}
      <div 
        className={`w-full rounded-xl sm:rounded-2xl border transition-all duration-300 p-2 sm:p-2.5 backdrop-blur-md relative min-h-[64px] flex flex-col justify-center ${
          status === 'verified'
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            : status === 'error'
            ? 'bg-red-950/25 border-red-500/50'
            : 'bg-black/35 border-white/15 hover:border-amber-400/40'
        }`}
      >
        {/* Encabezado sutil informativo */}
        <div className="flex items-center justify-between pb-1.5 px-1 border-b border-white/10 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
            <ShieldCheck className={`w-3.5 h-3.5 ${status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-semibold tracking-wide">
              {status === 'verified' ? 'Verificación Completada' : 'Protección Cloudflare Turnstile'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                SEGURO
              </span>
            )}
            {(status === 'error' || status === 'expired') && (
              <button
                type="button"
                onClick={handleManualReset}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reintentar
              </button>
            )}
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              Anti-Bot AI
            </span>
          </div>
        </div>

        {/* DOM node donde Cloudflare Turnstile inyecta el widget interactivo */}
        <div 
          ref={containerRef} 
          className="flex justify-center items-center w-full min-h-[48px] overflow-hidden" 
        />

        {/* Mensaje de error si falla */}
        {status === 'error' && errorMessage && (
          <div className="mt-1.5 pt-1 border-t border-red-500/20 flex items-center justify-between gap-1.5 text-[10.5px] font-mono text-red-400">
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
            {isLocalHost && (
              <button
                type="button"
                onClick={() => {
                  setStatus('verified');
                  setErrorMessage(null);
                  onSuccess('dev-bypass-localhost-token');
                }}
                className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30 transition-colors cursor-pointer"
              >
                Aprobar Local
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
