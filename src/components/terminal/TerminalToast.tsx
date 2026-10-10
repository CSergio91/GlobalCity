import React, { useEffect, useState } from 'react';
import { Target, ShieldAlert, X, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { playTakeProfitSound, playStopLossSound } from '../../utils/audioAlerts';

export interface ToastNotification {
  id: string;
  type: 'tp' | 'sl' | 'buy' | 'sell' | 'info' | 'success' | 'warning';
  title: string;
  message?: string;
  symbol?: string;
  pnlUsdt?: number;
  pnlPercent?: number;
  price?: number;
  duration?: number;
}

interface TerminalToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  isEs: boolean;
}

export const TerminalToast: React.FC<TerminalToastProps> = ({
  toasts,
  onDismiss,
  isEs
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 sm:top-16 right-2 sm:right-6 z-50 flex flex-col gap-2 max-w-[94vw] sm:max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          isEs={isEs}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  isEs: boolean;
}> = ({ toast, onDismiss, isEs }) => {
  const duration = toast.duration ?? 4500;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Reproducir sonido correspondiente según tipo de evento
    if (toast.type === 'tp') {
      playTakeProfitSound();
    } else if (toast.type === 'sl') {
      playStopLossSound();
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.id, toast.type, duration, onDismiss]);

  const isBuy = toast.type === 'buy';
  const isSell = toast.type === 'sell';
  const isTP = toast.type === 'tp';
  const isSL = toast.type === 'sl';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';
  const isSuccess = toast.type === 'success';

  // Identificación de color sólido: Compra / Ganancia (Verde Esmeralda sólido) vs Venta / Pérdida (Rojo Carmesí sólido)
  const isGreen = isBuy || isTP || (toast.pnlUsdt !== undefined && toast.pnlUsdt >= 0) || isSuccess;
  const isRed = isSell || isSL || (toast.pnlUsdt !== undefined && toast.pnlUsdt < 0);

  const containerBgClass = isWarning
    ? 'bg-amber-600 border-amber-500 shadow-amber-950/30'
    : isInfo
    ? 'bg-slate-900 border-slate-700 shadow-black/40'
    : isGreen
    ? 'bg-emerald-600 border-emerald-500 shadow-emerald-950/40'
    : isRed
    ? 'bg-rose-600 border-rose-500 shadow-rose-950/40'
    : 'bg-slate-900 border-slate-700 shadow-black/40';

  const hasPnL = toast.pnlUsdt !== undefined;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-xl p-2.5 sm:p-3 text-white transition-all duration-300 animate-slide-in-right ${containerBgClass}`}
    >
      <div className="flex items-start gap-2.5">
        {/* ICONO COMPACTO EN PASTILLA BLANCA SEMITRANSPARENTE */}
        <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0 mt-0.5 backdrop-blur-xs flex items-center justify-center">
          {isTP && <Target className="w-4 h-4 animate-pulse" />}
          {isSL && <ShieldAlert className="w-4 h-4" />}
          {isBuy && <TrendingUp className="w-4 h-4" />}
          {isSell && <TrendingDown className="w-4 h-4" />}
          {isWarning && <AlertTriangle className="w-4 h-4 animate-bounce" />}
          {isSuccess && !isBuy && <CheckCircle2 className="w-4 h-4" />}
          {isInfo && <Info className="w-4 h-4 text-sky-200" />}
        </div>

        {/* CONTENIDO ESTRUCTURADO Y COMPACTO */}
        <div className="flex-1 min-w-0">
          {/* CABECERA: TÍTULO + SÍMBOLO + BOTÓN CERRAR */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-black uppercase tracking-wide text-white truncate">
                {toast.title}
              </span>
              {toast.symbol && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-black/25 text-white border border-white/20 shrink-0">
                  {toast.symbol}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/20 transition-colors cursor-pointer shrink-0 -mr-0.5"
              title={isEs ? 'Cerrar' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CASO 1: CIERRE CON PNL (MANUAL, TP O SL) -> PNL DESTACADO Y MÁS GRANDE */}
          {hasPnL && (
            <div className="mt-1.5 flex items-baseline justify-between gap-2 border-t border-white/20 pt-1.5">
              <div className="flex items-baseline gap-1.5 text-white">
                <span className="text-xl sm:text-2xl font-black font-mono leading-none tracking-tight">
                  {toast.pnlUsdt! >= 0 ? '+' : ''}${toast.pnlUsdt!.toFixed(2)} USDT
                </span>
                {toast.pnlPercent !== undefined && (
                  <span className="text-xs sm:text-sm font-mono font-black text-white/95">
                    ({toast.pnlPercent >= 0 ? '+' : ''}{toast.pnlPercent.toFixed(1)}%)
                  </span>
                )}
              </div>
              {toast.price !== undefined && (
                <span className="text-xs font-mono font-bold text-white/90 shrink-0">
                  @${toast.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}

          {/* CASO 2: APERTURA COMPRA / VENTA (SIN PNL) -> PRECIO Y DETALLES EN UNA SOLA LÍNEA COMPACTA */}
          {!hasPnL && (isBuy || isSell) && (
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-white/20 pt-1.5 text-xs font-mono text-white">
              {toast.price !== undefined && (
                <span className="font-bold text-sm">
                  ${toast.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
              {toast.message && (
                <span className="text-[11px] font-bold text-white/95 truncate ml-auto text-right">
                  {toast.message}
                </span>
              )}
            </div>
          )}

          {/* CASO 3: TOAST GENERAL (INFO, WARNING, SUCCESS) */}
          {!hasPnL && !isBuy && !isSell && toast.message && (
            <p className="mt-1 text-[11px] text-white/95 font-medium leading-snug">
              {toast.message}
            </p>
          )}

          {/* CASO 4: MENSAJE SECUNDARIO EN CIERRE CON PNL SI APLICA (EJ. CIERRE TOTAL) */}
          {hasPnL && toast.message && (
            <p className="mt-1 text-[10px] text-white/85 font-medium leading-tight">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      {/* BARRA DE PROGRESO DE AUTO-DISMISS */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
        <div
          className="h-full bg-white/90 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
