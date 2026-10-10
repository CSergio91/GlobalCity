import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ShieldAlert, Award, RotateCcw, ShieldCheck, Layers, Clock } from 'lucide-react';
import { PropFirmAccount } from '../../lib/supabase';

interface DemoAccountBalanceSelectorProps {
  currentBalance: number;
  unrealizedPnL: number;
  isEs: boolean;
  accounts?: PropFirmAccount[];
  activeAccountId?: string;
  dailyStartEquity?: number;
  tradingDaysCount?: number;
  onSelectAmount?: (amount: number) => void;
  onSelectAccount?: (account: PropFirmAccount | null) => void;
  onResetToCurrent: () => void;
}

export const DemoAccountBalanceSelector: React.FC<DemoAccountBalanceSelectorProps> = ({
  currentBalance,
  unrealizedPnL,
  isEs,
  accounts = [],
  activeAccountId,
  dailyStartEquity,
  tradingDaysCount,
  onSelectAccount,
  onResetToCurrent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reloj y Cuenta Regresiva de Cambio de Día UTC (00:00:00 UTC Rollover)
  const [utcCountdown, setUtcCountdown] = useState<string>('');
  const [utcClock, setUtcClock] = useState<string>('');

  useEffect(() => {
    const updateUtcTimer = () => {
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();

      setUtcClock(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

      const nextMidnightUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = Math.max(0, nextMidnightUtc.getTime() - now.getTime());
      const remHours = Math.floor(diffMs / 3600000);
      const remMins = Math.floor((diffMs % 3600000) / 60000);
      setUtcCountdown(`${String(remHours).padStart(2, '0')}h ${String(remMins).padStart(2, '0')}m`);
    };

    updateUtcTimer();
    const interval = setInterval(updateUtcTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const equity = currentBalance + unrealizedPnL;
  const activePropAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];
  const isBreached = activePropAccount?.status === 'BREACHED';
  const initialSize = activePropAccount?.initialBalance || 100000;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* BADGE CLICABLE DE CUENTA ACTIVA / SELECTOR MULTI-CUENTA */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border shadow-xs font-mono font-bold transition-all cursor-pointer select-none group shrink-0 ${
          isBreached
            ? 'bg-rose-50 border-rose-400 text-rose-950 hover:bg-rose-100 ring-1 ring-rose-300'
            : activePropAccount 
              ? 'bg-amber-500/15 border-amber-400 text-amber-950 hover:bg-amber-500/25'
              : 'bg-amber-100/70 border-amber-200/90 hover:border-amber-400 text-amber-950'
        }`}
        title={isEs ? 'Cambiar entre tus cuentas y retos de trading' : 'Switch between your accounts and trading challenges'}
      >
        {isBreached ? (
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
        ) : (
          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <div className="flex flex-col text-left leading-none max-w-[95px] sm:max-w-[190px]">
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] sm:text-[8px] uppercase font-bold text-amber-900 truncate">
              {activePropAccount ? `${activePropAccount.firmName}` : (isEs ? 'Cuenta Demo' : 'Demo Account')}
            </span>
            {isBreached && (
              <span className="text-[7px] uppercase font-black px-1 py-0.2 rounded bg-rose-600 text-white">
                BREACH
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-black transition-colors ${
              isBreached 
                ? 'text-rose-700' 
                : unrealizedPnL > 0 
                  ? 'text-emerald-700' 
                  : unrealizedPnL < 0 
                    ? 'text-red-700' 
                    : 'text-amber-950'
            }`}
          >
            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <ChevronDown
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700/70 transition-transform group-hover:text-amber-900 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN SELECTOR DE CUENTAS INDEPENDIENTES DEL TRADER */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-1.5 w-80 sm:w-92 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 px-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            
            {/* Cabecera del Gestor de Cuentas */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A]">
                    {isEs ? 'Tus Cuentas & Retos' : 'Your Accounts & Challenges'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isEs ? 'Selecciona una cuenta para operarla' : 'Select an account to operate independently'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {accounts.length} {accounts.length === 1 ? (isEs ? 'cuenta' : 'account') : (isEs ? 'cuentas' : 'accounts')}
              </span>
            </div>

            {/* BARRA INFORMATIVA DE CAMBIO DE DÍA UTC (00:00 UTC ROLLOVER) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 mb-2.5 rounded-xl bg-amber-500/10 border border-amber-300/80 text-[10px] font-mono select-none">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>UTC {utcClock}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[9px]">{isEs ? 'Reset diario en: ' : 'Daily reset in: '}</span>
                <strong className="text-amber-900 font-extrabold">{utcCountdown}</strong>
              </div>
            </div>

            {/* LISTADO DE CUENTAS DISPONIBLES PARA EL TRADER */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
              {accounts.length > 0 ? (
                accounts.map((acc) => {
                  const isSelected = acc.id === (activeAccountId || accounts[0]?.id);
                  const accBreached = acc.status === 'BREACHED';
                  const accWarning = acc.status === 'WARNING';
                  const accBalance = acc.currentBalance ?? acc.initialBalance ?? 100000;
                  const accInitial = acc.initialBalance ?? 100000;

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        if (onSelectAccount) onSelectAccount(acc);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                        isSelected
                          ? accBreached
                            ? 'bg-rose-50/70 border-rose-400 ring-1 ring-rose-400'
                            : 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-400/80'
                          : 'bg-[#fbf9f5] hover:bg-slate-100 border-[#e5dfd3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">
                              {acc.firmName || 'Challenge ZYTI'}
                            </span>
                            {accBreached ? (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                {isEs ? 'INFRACCIÓN' : 'BREACHED'}
                              </span>
                            ) : accWarning ? (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                {isEs ? 'ALERTA' : 'WARNING'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {isEs ? 'ACTIVA' : 'ACTIVE'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 block mt-0.5">
                            {acc.accountNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block leading-none">
                            {isEs ? 'Balance Actual' : 'Current Balance'}
                          </span>
                          <span className={`font-mono font-extrabold text-xs mt-0.5 block ${
                            accBreached ? 'text-rose-700' : 'text-[#0F172A]'
                          }`}>
                            ${accBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block leading-none">
                            {isEs ? 'Tamaño Inicial' : 'Initial Size'}
                          </span>
                          <span className="font-mono font-bold text-slate-700 text-xs mt-0.5 block">
                            ${accInitial.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                /* Fallback cuando opera como sesión única */
                <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#e5dfd3]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900">
                        {isEs ? 'Cuenta Principal' : 'Primary Account'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {activePropAccount?.accountNumber || 'ZYTI-DEMO-01'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-slate-900">
                      ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PIE DEL DROPDOWN: ESTADO DEL CENTINELA Y ACCIÓN DE RESTABLECER */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {isBreached ? (
                  <div className="flex items-center gap-1 text-rose-700 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isEs ? 'Infracción de Reglas' : 'Breach Detected'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sentinel 24/7 Activo</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onResetToCurrent();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  isBreached
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 shadow-xs'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80 shadow-xs'
                }`}
                title={isEs ? 'Restablecer saldo al valor inicial' : 'Reset balance to initial value'}
              >
                <RotateCcw className="w-3 h-3 text-current" />
                <span>
                  {isEs 
                    ? `Restablecer (${Math.round(initialSize / 1000)}K)` 
                    : `Reset (${Math.round(initialSize / 1000)}K)`}
                </span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
