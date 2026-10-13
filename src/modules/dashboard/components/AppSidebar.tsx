import React from 'react';
import { 
  Home,
  LayoutDashboard,
  BookOpen,
  Layers,
  Zap,
  Calendar,
  Users,
  Info,
  Award,
  Headphones,
  ChevronRight,
  ChevronLeft,
  X,
  TrendingUp,
  LogOut,
  ArrowRight,
  Gift,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BrandLogo } from '../../../components/BrandLogo';
import { PEPE_AVATARS, getPepeAvatarUrl } from '../../../data/pepeAvatars';

export type DashboardNavTab = 
  | 'accounts'
  | 'dashboard'
  | 'journal'
  | 'stats'
  | 'challenges'
  | 'programs'
  | 'addons'
  | 'markets'
  | 'calendar'
  | 'billing'
  | 'affiliates'
  | 'certificates'
  | 'help'
  | 'support';

interface NavItemDef {
  id: DashboardNavTab;
  labelEn: string;
  labelEs: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'yellow' | 'blue' | 'amber' | 'emerald';
  hasRedDot?: boolean;
}

interface AppSidebarProps {
  activeTab: DashboardNavTab;
  onTabChange: (tab: DashboardNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalCapital: number;
  accountsCount: number;
  isEn: boolean;
  onLogout: () => void;
  onGoToLanding?: () => void;
  selectedAvatarId?: string;
  onOpenAvatarModal?: () => void;
  userDisplayName?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  totalCapital,
  accountsCount,
  isEn,
  onLogout,
  onGoToLanding,
  selectedAvatarId = 'pepe_golden_bull',
  onOpenAvatarModal,
  userDisplayName = 'Trader Pepe'
}) => {
  // Lista unificada y limpia con fidelidad 1:1 a la captura de pantalla (Cero etiquetas ruidosas de grupo)
  const navItems: NavItemDef[] = [
    {
      id: 'accounts',
      labelEn: 'My Accounts',
      labelEs: 'Mis Cuentas',
      icon: Home,
      badge: String(accountsCount || 1),
      badgeType: 'yellow'
    },
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelEs: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'journal',
      labelEn: 'Trading Journal',
      labelEs: 'Diario Trading',
      icon: BookOpen,
      badge: 'PRO',
      badgeType: 'blue'
    },
    {
      id: 'challenges',
      labelEn: 'Challenges',
      labelEs: 'Challenges',
      icon: Layers,
      badge: '1 / 2',
      badgeType: 'amber'
    },
    {
      id: 'addons',
      labelEn: 'Add-ons',
      labelEs: 'Add-ons',
      icon: Zap,
      badge: 'BOOST',
      badgeType: 'amber'
    },
    {
      id: 'calendar',
      labelEn: 'Calendar',
      labelEs: 'Calendario',
      icon: Calendar,
      hasRedDot: true
    },
    {
      id: 'affiliates',
      labelEn: 'Affiliates',
      labelEs: 'Afiliados',
      icon: Users,
      badge: '10-20%',
      badgeType: 'emerald'
    },
    {
      id: 'billing',
      labelEn: 'Billing',
      labelEs: 'Facturación',
      icon: Info
    },
    {
      id: 'certificates',
      labelEn: 'Certificates',
      labelEs: 'Certificados',
      icon: Award
    },
    {
      id: 'support',
      labelEn: 'Support 24/7',
      labelEs: 'Soporte 24/7',
      icon: Headphones
    }
  ];

  const activeAvatar = PEPE_AVATARS.find(a => a.id === selectedAvatarId) || PEPE_AVATARS[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container con Opacidad y Glassmorphism Editorial */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#07090E]/85 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 select-none shadow-[0_10px_40px_rgba(0,0,0,0.7)] ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {/* Top Section: BrandLogo & Collapse / Expand Controls */}
        <div>
          <div className={`h-16 flex items-center border-b border-white/[0.08] transition-all duration-300 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}>
            <div 
              onClick={onGoToLanding}
              className="cursor-pointer overflow-hidden transition-all duration-300 flex items-center gap-2"
            >
              <BrandLogo 
                size={isCollapsed ? "sm" : "md"} 
                lightMode={false} 
                showText={!isCollapsed} 
              />
            </div>

            {/* Desktop Collapse / Expand Toggle Button (Replegar / Desplegar) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm"
              title={isCollapsed ? (isEn ? 'Expand sidebar' : 'Desplegar barra') : (isEn ? 'Collapse sidebar' : 'Replegar barra')}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400 hover:text-amber-400" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Single Clean Vertical Flow, matching screenshot) */}
          <nav className="p-2.5 space-y-1.5 font-medium overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-none transition-all duration-300">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComponent = item.icon;
              const label = isEn ? item.labelEn : item.labelEs;

              // Badge styling
              let badgeClasses = 'bg-amber-400 text-slate-950 font-black';
              if (item.badgeType === 'blue') {
                badgeClasses = 'bg-blue-500/20 text-blue-300 border border-blue-500/35 font-bold';
              } else if (item.badgeType === 'amber') {
                badgeClasses = 'bg-amber-400/20 text-amber-300 border border-amber-400/35 font-bold';
              } else if (item.badgeType === 'emerald') {
                badgeClasses = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-bold';
              } else if (item.badgeType === 'yellow') {
                badgeClasses = 'bg-amber-400 text-slate-950 font-black';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`group relative w-full flex items-center transition-all duration-200 cursor-pointer rounded-2xl ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-black/50 border border-amber-400/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] font-semibold'
                      : 'hover:bg-white/[0.04] border border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 transition-transform ${
                    isActive ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Label & Optional Badges (Expanded) */}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left min-w-0">
                      <span className={`text-xs truncate tracking-wide ${isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                        {label}
                      </span>

                      {/* Pill Badge */}
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shadow-sm ${badgeClasses}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Red Dot (Calendario) */}
                      {item.hasRedDot && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)] ml-auto" />
                      )}
                    </div>
                  )}

                  {/* Floating Tooltip when Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#0E1322]/98 border border-white/15 backdrop-blur-2xl text-white font-mono text-xs font-bold shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 flex items-center gap-2">
                      <span>{label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 rounded-full ${badgeClasses}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.hasRedDot && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Pepe Avatar Pod Prominente + Cuentas Fondeadas + Plan */}
        <div className="p-3 border-t border-white/[0.08] bg-[#06080E]/90 space-y-2.5">
          
          {/* ========================================================================= */}
          {/* PEPE AVATAR POD DESTACADO (ENCIMA DEL CAPITAL TOTAL, CON TRIGGER A MODAL) */}
          {/* ========================================================================= */}
          {onOpenAvatarModal && (
            <div
              onClick={onOpenAvatarModal}
              className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                isCollapsed 
                  ? 'p-1.5 flex justify-center bg-white/[0.03] border-white/10 hover:border-amber-400/50' 
                  : 'p-2.5 bg-gradient-to-r from-amber-500/[0.09] via-purple-600/[0.06] to-black/60 border-amber-400/30 hover:border-amber-400/70 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
              }`}
              title={isEn ? 'Change Avatar' : 'Cambiar Avatar de Pepe'}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Glowing Pepe Circular Medallion */}
                <div className="relative w-10 h-10 rounded-full shrink-0 p-0.5 bg-gradient-to-tr from-amber-400 via-amber-500 to-purple-500 shadow-[0_0_15px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img 
                      src={getPepeAvatarUrl(activeAvatar)} 
                      alt={activeAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online Dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm" />
                </div>

                {/* Avatar Info (Expanded) */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {userDisplayName}
                      </div>
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0 opacity-70 group-hover:opacity-100" />
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-mono truncate flex items-center gap-1">
                      <span>{activeAvatar.name}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <span className="text-amber-400 hover:underline">{isEn ? 'Change Avatar →' : 'Cambiar Avatar →'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CARD 1: Cuentas Fondeadas - Hasta $200k capital (matching screenshot) */}
          {!isCollapsed ? (
            <button
              onClick={() => onTabChange('challenges')}
              className="w-full p-2.5 rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-amber-400/40 flex items-center justify-between gap-2 transition-all cursor-pointer text-left shadow-sm group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                    {isEn ? 'Funded Accounts' : 'Cuentas Fondeadas'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono truncate">
                    {isEn ? 'Up to $200k capital' : 'Hasta $200k capital'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => onTabChange('challenges')}
              className="w-full flex items-center justify-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-amber-400 border border-white/10 transition-all cursor-pointer"
              title={isEn ? 'Funded Accounts (Up to $200k)' : 'Cuentas Fondeadas (Hasta $200k)'}
            >
              <Gift className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* CARD 2: Plan Actual Solar 2/3 (matching screenshot) */}
          {!isCollapsed ? (
            <div className="p-2.5 rounded-2xl border border-white/8 bg-black/30 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400">{isEn ? 'Current Plan' : 'Plan Actual'}</span>
                <span className="text-amber-400 font-bold">2/3</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-bold text-white">Solar</span>
                <span className="text-[10px] text-slate-400">${totalCapital.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-2/3 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
            </div>
          ) : (
            <div className="p-1 rounded-xl bg-black/30 border border-white/5 text-center">
              <span className="text-[9px] font-mono font-bold text-amber-400">2/3</span>
            </div>
          )}

          {/* Footer Controls: Logout & Collapse */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 px-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3 text-amber-400" /> : <ChevronLeft className="w-3 h-3" />}
              {!isCollapsed && <span>{isEn ? 'Collapse' : 'Plegar'}</span>}
            </button>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
              title={isEn ? 'Logout' : 'Cerrar Sesión'}
            >
              <LogOut className="w-3 h-3" />
              {!isCollapsed && <span>{isEn ? 'Exit' : 'Salir'}</span>}
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
