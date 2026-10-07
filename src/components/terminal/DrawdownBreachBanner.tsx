import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface DrawdownBreachBannerProps {
  isEs: boolean;
  isAccountBreached: boolean;
  breachReason: string;
  onResetEvaluation: () => void;
}

/**
 * Banner de advertencia e infracción de Drawdown de Prop Firm (5% diario o 10% total)
 */
export const DrawdownBreachBanner: React.FC<DrawdownBreachBannerProps> = ({
  isEs,
  isAccountBreached,
  breachReason,
  onResetEvaluation
}) => {
  if (!isAccountBreached) return null;

  return (
    <div className="absolute top-2 left-4 right-4 z-40 bg-red-950/95 border border-red-500/90 text-red-100 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-900/80 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
        </div>
        <div>
          <div className="font-black text-xs text-red-200 uppercase tracking-wider">
            {isEs ? 'Infracción de Reglas de Prop Firm' : 'Prop Firm Rule Breach'}
          </div>
          <div className="text-[11px] text-red-300 font-mono">
            {breachReason}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onResetEvaluation}
        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{isEs ? 'Reiniciar Evaluación' : 'Reset Evaluation'}</span>
      </button>
    </div>
  );
};
