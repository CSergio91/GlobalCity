import React from 'react';
import { ShieldAlert, LogOut, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BrandLogo } from '../../../components/BrandLogo';

interface CrmAccessDeniedScreenProps {
  onBackToDashboard?: () => void;
  onLogout?: () => void;
}

export const CrmAccessDeniedScreen: React.FC<CrmAccessDeniedScreenProps> = ({
  onBackToDashboard,
  onLogout
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      window.location.href = '/login';
    }
  };

  const handleGoToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = 'https://dashapp.eklipsefunded.com';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06070B] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-[#0A0D15]/90 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col items-center text-center space-y-6">
        
        {/* Brand Logo */}
        <div className="mb-2">
          <BrandLogo size="md" lightMode={false} showText={true} />
        </div>

        {/* Shield Alert Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#06070B] border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Security Warning */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span>Área Restringida</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Nivel Staff</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Acceso Administrativo Denegado
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            El portal <strong className="text-white">Nexus CRM & Risk Backoffice</strong> es de uso estrictamente interno para la administración y control de riesgos de Eklipse Funded. Las cuentas con rol de Trader no tienen autorización de acceso.
          </p>
        </div>

        {/* User Identity Details Pill */}
        {user && (
          <div className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-left font-mono text-xs">
            <div className="min-w-0 pr-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cuenta Actual</div>
              <div className="text-slate-200 font-bold truncate">{user.email || user.username}</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[10px] uppercase shrink-0">
              Rol: {user.role || 'Trader'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ir a mi Trader Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer Audit Code */}
        <div className="text-[10px] font-mono text-slate-600">
          SEC-ID: EKL-NEXUS-AUTH-403 · IP Audit Registrada
        </div>

      </div>

    </div>
  );
};
