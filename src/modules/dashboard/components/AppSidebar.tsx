import React, { useState } from 'react';
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
  X,
  TrendingUp,
  LogOut,
  Gift,
  Sparkles,
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { BrandLogo } from '../../../components/BrandLogo';
import { PEPE_AVATARS, getPepeAvatarUrl } from '../../../data/pepeAvatars';

export type DashboardNavTab = 
  | 'accounts'
  | 'dashboard'
  | 'journal'
  | 'payouts'
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
  | 'support'
  | 'nexus';

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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isStaff?: boolean;
  onGoToCrm?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  accountsCount,
  isEn,
  onLogout,
  onGoToLanding,
  selectedAvatarId = 'pepe_golden_bull',
  onOpenAvatarModal,
  userDisplayName = 'Trader Pepe',
  isStaff = false,
  onGoToCrm
}) => {
  // Estado de Hover: por defecto REPLEGADA y ESTRECHA (60px). Se despliega a 220px al hover
  // SIN desplazar el contenido principal gracias a su posicionamiento flotante sobre la margen.
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpenMobile || isHovered;

  // Lista limpia y vertical (Cero etiquetas de grupo ruidosas)
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
      id: 'payouts',
      labelEn: 'Payouts',
      labelEs: 'Retiros & Payouts',
      icon: DollarSign,
      badge: 'PROFIT',
      badgeType: 'emerald'
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
      badgeType: 'emerald'
    },
    {
      id: 'markets',
      labelEn: 'Trading Station',
      labelEs: 'Estación Trading',
      icon: TrendingUp
    },
    {
      id: 'calendar',
      labelEn: 'Economic Calendar',
      labelEs: 'Calendario Económico',
      icon: Calendar,
      hasRedDot: true
    },
    {
      id: 'billing',
      labelEn: 'Billing & Invoices',
      labelEs: 'Facturación',
      icon: Info
    },
    {
      id: 'affiliates',
      labelEn: 'Affiliates',
      labelEs: 'Afiliados',
      icon: Users,
      badge: '10-20%',
      badgeType: 'yellow'
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

  if (isStaff && onGoToCrm) {
    navItems.push({
      id: 'nexus',
      labelEn: 'Nexus CRM ERP',
      labelEs: 'Nexus CRM ERP',
      icon: ShieldAlert,
      badge: 'ADMIN',
      badgeType: 'amber'
    });
  }

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

      {/* Main Sidebar: Estrecha (60px en reposo, 220px al hover) sin scrollbar visible */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-[#07090E]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 select-none overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isOpenMobile ? 'translate-x-0 w-[220px]' : '-translate-x-full lg:translate-x-0'
        } ${
          isExpanded 
            ? 'w-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.95)] border-r-amber-400/25' 
            : 'w-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* Top Section: Logo & Mobile Close */}
        <div className="shrink-0">
          <div className={`h-14 flex items-center border-b border-white/[0.08] transition-all duration-300 ${
            !isExpanded ? 'justify-center px-1' : 'justify-between px-3.5'
          }`}>
            <div 
              onClick={onGoToLanding}
              className="cursor-pointer overflow-hidden transition-all duration-300 flex items-center gap-2"
            >
              <BrandLogo 
                size={!isExpanded ? "sm" : "md"} 
                lightMode={false} 
                showText={isExpanded} 
              />
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Sin barras de scroll, espacio optimizado) */}
          <nav className="p-1.5 space-y-1 font-medium overflow-y-auto overflow-x-hidden max-h-[calc(100vh-210px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300">
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
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'nexus' && onGoToCrm) {
                      onGoToCrm();
                    } else {
                      onTabChange(item.id);
                    }
                    onCloseMobile();
                  }}
                  className={`group relative w-full flex items-center transition-all duration-200 cursor-pointer rounded-xl ${
                    !isExpanded ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-black/60 border border-amber-400/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] font-semibold'
                      : 'hover:bg-white/[0.05] border border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 transition-transform ${
                    isActive ? 'text-amber-400 scale-105' : 'text-slate-400 group-hover:text-white'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Label & Optional Badges (Shown when expanded on hover) */}
                  {isExpanded && (
                    <div className="flex-1 flex items-center justify-between text-left min-w-0 transition-opacity duration-200">
                      <span className={`text-[11.5px] truncate tracking-wide ${isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                        {label}
                      </span>

                      {/* Pill Badge */}
                      {item.badge && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full shadow-sm shrink-0 ${badgeClasses}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Red Dot (Calendario) */}
                      {item.hasRedDot && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)] ml-auto shrink-0" />
                      )}
                    </div>
                  )}

                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Pepe Avatar (Sin contenedor) + Regalo Cuentas (Sin contenedor) + Logout */}
        <div className="p-2 border-t border-white/[0.08] bg-[#06080E]/95 space-y-2 shrink-0">
          
          {/* ========================================================================= */}
          {/* 1. PEPE AVATAR: SIN CONTENEDOR (Directo, Medallón circular + Info al hover) */}
          {/* ========================================================================= */}
          {onOpenAvatarModal && (
            <div
              onClick={onOpenAvatarModal}
              className={`flex items-center cursor-pointer group transition-all duration-200 ${
                !isExpanded ? 'justify-center p-1' : 'gap-2 px-1 py-1'
              }`}
              title={isEn ? 'Change Avatar' : 'Cambiar Avatar de Pepe'}
            >
              {/* Circular Medallion */}
              <div className="relative w-8 h-8 rounded-full shrink-0 p-0.5 bg-gradient-to-tr from-amber-400 via-amber-500 to-purple-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img 
                    src={getPepeAvatarUrl(activeAvatar)} 
                    alt={activeAvatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 shadow-sm" />
              </div>

              {/* Avatar Info (Sin caja contenedora, texto directo y limpio) */}
              {isExpanded && (
                <div className="flex-1 min-w-0 transition-opacity duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {userDisplayName}
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="text-[9.5px] text-amber-300/80 font-mono truncate">
                    {activeAvatar.name}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. ICONO DE REGALO: SIN CONTENEDOR (Link directo con icono Gift y texto)    */}
          {/* ========================================================================= */}
          <button
            onClick={() => onTabChange('challenges')}
            className={`w-full flex items-center transition-all duration-200 cursor-pointer group text-slate-400 hover:text-amber-300 ${
              !isExpanded ? 'justify-center p-1.5' : 'gap-2 px-1.5 py-1 text-left'
            }`}
            title={isEn ? 'Funded Accounts (Up to $200k)' : 'Cuentas Fondeadas (Hasta $200k)'}
          >
            <Gift className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 truncate transition-colors">
                  {isEn ? 'Funded Accounts' : 'Cuentas Fondeadas'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate">
                  {isEn ? 'Up to $200k' : 'Hasta $200k'}
                </div>
              </div>
            )}
          </button>

          {/* ========================================================================= */}
          {/* 3. LOGOUT & VERSIÓN                                                       */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 pt-1 px-1 border-t border-white/[0.05]">
            <span className="text-[9px] text-slate-600">
              {isExpanded ? 'v2.4' : ''}
            </span>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
              title={isEn ? 'Logout' : 'Cerrar Sesión'}
            >
              <LogOut className="w-3 h-3" />
              {isExpanded && <span>{isEn ? 'Exit' : 'Salir'}</span>}
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
