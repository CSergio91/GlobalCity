import React from 'react';
import { PieChart, Layers, Wallet, Plus } from 'lucide-react';
import { StoredExchangeAccount, SUPPORTED_VENUES } from '../types/exchange';

interface PortfolioAllocationRingProps {
  accounts: StoredExchangeAccount[];
  totalEquity: number;
  onOpenConnectModal?: () => void;
}

export const PortfolioAllocationRing: React.FC<PortfolioAllocationRingProps> = ({
  accounts,
  totalEquity,
  onOpenConnectModal
}) => {
  const activeAccounts = accounts.filter(a => a.status === 'CONNECTED');
  const validTotal = totalEquity > 0 ? totalEquity : 0;

  // Compute segments safely
  const segments = activeAccounts.map(acc => {
    const venue = SUPPORTED_VENUES.find(v => v.id === acc?.venueId);
    const balance = Number(acc?.balanceUsd) || 0;
    const pct = validTotal > 0 ? (balance / validTotal) * 100 : 0;
    return {
      id: acc.id,
      name: acc.venueName || venue?.name || 'Exchange',
      label: acc.label || '',
      color: venue?.color || '#EC4899',
      balanceUsd: balance,
      pct: isNaN(pct) ? 0 : pct
    };
  });

  // Calculate SVG strokeDasharray for donut ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  let accumulatedPct = 0;

  return (
    <div className="bg-[#0D0F17]/90 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Distribución de Cartera por Exchange</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {activeAccounts.length} {activeAccounts.length === 1 ? 'Venue' : 'Venues'}
        </span>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
            <PieChart className="w-6 h-6 text-slate-400" />
          </div>
          <div className="text-xs font-bold text-white">0% Asignado</div>
          <p className="text-[10px] text-slate-400 max-w-[200px] leading-tight">
            Conecta tus exchanges para visualizar la partición de tu liquidez.
          </p>
          {onOpenConnectModal && (
            <button
              onClick={onOpenConnectModal}
              className="mt-1 text-[11px] font-bold text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Conectar Exchange</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Donut Graphic */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-white/10"
                strokeWidth="10"
                fill="none"
              />

              {/* Segments */}
              {segments.map((seg) => {
                const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                accumulatedPct += seg.pct;

                return (
                  <circle
                    key={seg.id}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
              <span className="text-[10px] text-slate-400 leading-none">TOTAL</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5">
                ${validTotal >= 1000 ? `${(validTotal / 1000).toFixed(1)}k` : validTotal.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="flex-1 w-full space-y-1.5 font-mono text-xs">
            {segments.map((seg) => (
              <div 
                key={seg.id} 
                className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-white font-bold truncate max-w-[100px]">
                    {seg.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-[10px]">{(seg.pct || 0).toFixed(1)}%</span>
                  <span className="font-bold text-slate-200">
                    ${(seg.balanceUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
