import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  TrendingUp,
  Sparkles,
  Check
} from 'lucide-react';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  language: string;
  onToggleLanguage: () => void;
  isEn?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
  language,
  onToggleLanguage,
  isEn = false
}) => {
  const [showNotificationsToast, setShowNotificationsToast] = useState(false);

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#07090E]/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all select-none">
      
      {/* Left: Mobile Toggle & Minimal Institutional Indicator */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/8 transition-colors cursor-pointer"
          title={isEn ? 'Open navigation' : 'Abrir navegación'}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold tracking-wider">EKLIPSE OS</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400/90 font-medium">{isEn ? 'Trader Cockpit' : 'Panel de Operaciones'}</span>
        </div>
      </div>

      {/* Right Controls: BTC Ticker Pill, Notification Bell, Language Toggle */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        
        {/* Live BTC Ticker Pill matching screenshot */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            BTC <span className="text-slate-300">$64,382.21</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            +2.43%
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsToast(!showNotificationsToast)}
            className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={isEn ? 'Notifications' : 'Notificaciones'}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          </button>

          {/* Simple Dropdown Toast */}
          {showNotificationsToast && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#090C14]/95 border border-white/15 backdrop-blur-2xl p-3 shadow-2xl z-50 text-xs font-mono space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white">{isEn ? 'System Notifications' : 'Notificaciones'}</span>
                <span className="text-[10px] text-amber-400 font-bold">1 {isEn ? 'New' : 'Nueva'}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-bold text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{isEn ? 'Evaluation Active' : 'Evaluación Activa'}</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  {isEn ? 'All risk limits configured: EOD DD 5%, Max DD 10%.' : 'Reglas sincronizadas: Drawdown EOD 5% y Max DD 10%.'}
                </p>
                <div className="text-[9px] text-slate-500">12m {isEn ? 'ago' : 'atrás'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher (ES / EN) */}
        <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 p-0.5 text-xs font-mono font-bold">
          <button
            onClick={() => language !== 'es' && onToggleLanguage()}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'es'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => language !== 'en' && onToggleLanguage()}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

      </div>

    </header>
  );
};
