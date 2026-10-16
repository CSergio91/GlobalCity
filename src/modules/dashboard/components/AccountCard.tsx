import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  MoreHorizontal, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Monitor, 
  ExternalLink 
} from 'lucide-react';
import { UserTradingAccount } from '../TraderDashboardApp';
import { AccountArtwork, AccountArtworkTheme } from './AccountArtwork';

interface AccountCardProps {
  account: UserTradingAccount;
  theme: AccountArtworkTheme;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDashboard: () => void;
  onOpenTerminal: () => void;
  onSignContract: () => void;
  isEn?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  theme,
  isSelected,
  onSelect,
  onOpenDashboard,
  onOpenTerminal,
  onSignContract,
  isEn = false
}) => {
  const [copied, setCopied] = useState(false);

  const initial = account.initialBalance || 25000;
  const current = account.currentBalance || initial;
  const pnl = current - initial;
  const pnlPct = initial > 0 ? (pnl / initial) * 100 : 0;
  const isPositive = pnl >= 0;

  const isInstant = account.isInstantFunding || account.modelType === 'INSTANT_FUNDING' || account.profitTargetPct === 0;

  // Calculate target progress (for evaluation challenges) or capital health for instant funding
  const targetPct = isInstant ? 0 : (account.profitTargetPct || 8);
  const targetAmount = initial * (targetPct / 100);
  const progressPct = targetAmount > 0 
    ? Math.min(100, Math.max(0, (Math.max(0, pnl) / targetAmount) * 100))
    : (isInstant ? (pnl >= 0 ? 100 : Math.max(10, 100 + (pnl / initial) * 100)) : 0);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  // Border & Glow Accents matching user screenshot
  const getCardStyle = () => {
    if (isSelected || theme === 'solar_gold') {
      return {
        cardBorder: 'border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/30',
        btnBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-400/30',
        progressFill: 'from-amber-400 to-yellow-300'
      };
    }
    return {
      cardBorder: 'border-white/10 hover:border-white/25 shadow-[0_12px_35px_rgba(0,0,0,0.5)]',
      btnBg: 'bg-white/[0.04] hover:bg-white/10 text-white border border-white/10 font-bold',
      progressFill: 'from-slate-400 to-slate-200'
    };
  };

  const style = getCardStyle();

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-3xl p-5 border bg-[#080B13]/85 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer ${style.cardBorder}`}
    >
      {/* Top Card Controls & Artwork */}
      <div className="space-y-3">
        
        {/* Top Header Row: Status, Title, Copy & Menu */}
        <div className="flex items-center justify-between">
          
          {/* Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isEn ? 'ACTIVE' : 'ACTIVA'}</span>
          </div>

          {/* Dots Menu */}
          <div className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Account Title + Copy Button + Badges */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black font-mono text-white tracking-wide">
              {account.accountNumber}
            </h3>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
              title={isEn ? 'Copy Account Number' : 'Copiar número de cuenta'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Badge */}
            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              {account.category.toUpperCase()}
            </span>

            {/* Direct Funding / Challenge Badge */}
            {isInstant && (
              <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/35 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider">
                {isEn ? 'INSTANT FUNDED' : 'FONDEO DIRECTO'}
              </span>
            )}

            {/* Contract Sign Badge */}
            {account.contractSigned ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[10px] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isEn ? 'Signed' : 'Firmado'}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSignContract();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/35 text-amber-300 font-mono text-[10px] font-bold hover:bg-amber-400/25 transition-all cursor-pointer animate-pulse"
                title={isEn ? 'Sign Agreement' : 'Firmar Acuerdo'}
              >
                <FileText className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'Sign' : 'FIRMAR'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Space Artwork Banner */}
        <AccountArtwork theme={theme} className="mt-2" />

      </div>

      {/* Capital Inicial y Balance Actual */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {isEn ? 'Initial Capital' : 'Capital Inicial'}
            </div>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">
              ${initial.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1.5">
              <span>{isEn ? 'Current Balance' : 'Balance Actual'}</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{pnlPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">
              ${current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-900/90 border border-white/5 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${style.progressFill} rounded-full transition-all duration-500 shadow-sm`}
            style={{ width: `${Math.max(4, Math.min(100, progressPct))}%` }}
          />
        </div>
      </div>

      {/* Reglas de la cuenta: Split, Max DD, Daily DD */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.07] font-mono text-center">
        <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[9.5px] text-slate-400">Split</div>
          <div className="text-xs font-black text-white mt-0.5">
            {account.payoutSplitMode === 'TIERED' ? '35%–90%' : `${account.profitSplit}%`}
          </div>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[9.5px] text-slate-400">Max DD</div>
          <div className="text-xs font-black text-amber-400 mt-0.5">{account.maxTotalDrawdownPct}%</div>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[9.5px] text-slate-400">Daily DD</div>
          <div className="text-xs font-black text-amber-400 mt-0.5">{account.maxDailyDrawdownPct}%</div>
        </div>
      </div>

      {/* Botones de acción: Ver Dashboard y Terminal */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDashboard();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${style.btnBg}`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isEn ? 'View Dashboard →' : 'Ver Dashboard →'}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenTerminal();
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title={isEn ? 'Open Web Trading Terminal' : 'Abrir Terminal de Trading'}
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
