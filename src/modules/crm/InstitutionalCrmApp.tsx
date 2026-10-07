import React, { useState, useEffect, useRef } from 'react';
import { useCrmDashboard } from './hooks/useCrmDashboard';
import { KpiHeader } from './components/KpiHeader';
import { ErpModulesGrid } from './components/ErpModulesGrid';
import { TradersClientsTable } from './components/TradersClientsTable';
import { ApiGatewayCard } from './components/ApiGatewayCard';
import { RiskEngineCard } from './components/RiskEngineCard';
import { RiskForensicAuditConsole } from './components/RiskForensicAuditConsole';
import { AffiliatesManagerCard } from './components/AffiliatesManagerCard';
import { DynamicRulesModal } from './components/DynamicRulesModal';
import { CreateApiKeyModal } from './components/CreateApiKeyModal';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { ChallengesManagementView } from './components/ChallengesManagementView';
import { CrmLang, crmTranslations } from './types/i18n';
import { CrmModuleId, CrmStaffRole, CRM_ALLOWED_ROLES } from './types/crm.types';
import { UserSession } from '../../lib/supabase';
import { 
  Globe, 
  ChevronDown, 
  LogOut, 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  Server, 
  LayoutGrid, 
  CreditCard, 
  Trophy, 
  Headphones, 
  Megaphone,
  Check,
  ShieldAlert,
  Plus,
  Sliders,
  Star
} from 'lucide-react';

interface InstitutionalCrmAppProps {
  user?: UserSession | null;
  initialLang?: CrmLang;
  onBackToTerminal?: () => void;
  onLogout?: () => void;
}

export const InstitutionalCrmApp: React.FC<InstitutionalCrmAppProps> = ({
  user,
  initialLang = 'es',
  onBackToTerminal,
  onLogout
}) => {
  const [lang, setLang] = useState<CrmLang>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.startsWith('/en')) return 'en';
      if (pathname.startsWith('/es')) return 'es';
      const stored = localStorage.getItem('zyti_lang') as CrmLang;
      if (stored === 'es' || stored === 'en') return stored;
    }
    return initialLang;
  });

  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  // Cerrar dropdown de idioma al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = crmTranslations[lang] || crmTranslations.es;
  const isEs = lang === 'es';

  const {
    activeModule,
    setActiveModule,
    kpis,
    traders,
    selectedTraderForAudit,
    setSelectedTraderForAudit,
    riskRules,
    selectedRuleId,
    setSelectedRuleId,
    activeRule,
    apiCredentials,
    monitoredPositions,
    isLoading,
    isRuleModalOpen,
    setIsRuleModalOpen,
    editingRule,
    setEditingRule,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    newlyCreatedKey,
    setNewlyCreatedKey,
    handleUpdateTraderAccountSize,
    handleUpdateTraderRole,
    handleUpdateTraderStatus,
    handleResetTraderBalance,
    handleSaveRule,
    handleDeleteRule,
    handleCreateApiKey,
    handleToggleApiKey,
    handleDeleteApiKey,
    handleEmergencyLiquidation,
    refreshData
  } = useCrmDashboard();

  // Sincronización Bidireccional de URL por Sección
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();

    if (path.includes('/deployment')) setActiveModule('deployment');
    else if (path.includes('/risk-engine')) setActiveModule('risk_engine');
    else if (path.includes('/apis')) setActiveModule('apis');
    else if (path.includes('/challenges')) setActiveModule('challenges');
    else if (path.includes('/plans')) setActiveModule('plans');
    else if (path.includes('/exchanges')) setActiveModule('exchanges');
    else if (path.includes('/prop-firms')) setActiveModule('prop_firms');
    else if (path.includes('/support')) setActiveModule('support');
    else if (path.includes('/marketing')) setActiveModule('marketing');
    else setActiveModule('hub');
  }, []);

  // Desbloqueo nativo del scroll de html y body al montar el CRM
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
    };
  }, []);

  const handleSelectModuleWithUrl = (mod: CrmModuleId) => {
    setActiveModule(mod);
    if (typeof window === 'undefined') return;

    const moduleSlugMap: Record<CrmModuleId, string> = {
      hub: '',
      deployment: '/deployment',
      risk_engine: '/risk-engine',
      apis: '/apis',
      challenges: '/challenges',
      plans: '/plans',
      exchanges: '/exchanges',
      prop_firms: '/prop-firms',
      support: '/support',
      marketing: '/marketing'
    };

    const targetUrl = `/${lang}/nexus${moduleSlugMap[mod]}`;
    if (window.location.pathname.toLowerCase() !== targetUrl.toLowerCase()) {
      window.history.pushState({ module: mod }, '', targetUrl);
    }
  };

  const moduleTitles: Record<CrmModuleId, { es: string; en: string }> = {
    hub: { es: 'Panel Principal', en: 'ERP Hub' },
    deployment: { es: 'Despliegue & Docker', en: 'Deployment & Docker' },
    risk_engine: { es: 'Motor de Riesgo', en: 'Risk Engine' },
    apis: { es: 'APIs & Agentes IA', en: 'Developer APIs' },
    challenges: { es: 'Retos de Fondeo', en: 'Challenges' },
    plans: { es: 'Planes SaaS', en: 'SaaS Plans' },
    exchanges: { es: '16 Exchanges', en: '16 Exchanges' },
    prop_firms: { es: 'Empresas de Fondeo', en: 'Prop Firms' },
    support: { es: 'Soporte Técnico', en: 'Support Desk' },
    marketing: { es: 'Marketing & SEO', en: 'Marketing & SEO' }
  };

  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = (newLang: CrmLang) => {
    setLang(newLang);
    localStorage.setItem('zyti_lang', newLang);
    setLangOpen(false);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const stripped = currentPath.replace(/^\/(es|en)/, '');
      const newPath = `/${newLang}${stripped || '/nexus'}`;
      window.history.replaceState(null, '', newPath);
    }
  };

  // Rol del staff activo en el CRM (solo admin, soporte y marketing tienen acceso; trader bloqueado)
  const [currentStaffRole, setCurrentStaffRole] = useState<CrmStaffRole>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('zyti_staff_role') as CrmStaffRole;
      if (cached && CRM_ALLOWED_ROLES.includes(cached)) return cached;
    }
    const roleCandidate = user?.role as CrmStaffRole;
    if (roleCandidate && CRM_ALLOWED_ROLES.includes(roleCandidate)) {
      return roleCandidate;
    }
    return 'admin';
  });

  const onTraderRoleChange = async (traderId: string, newRole: any) => {
    await handleUpdateTraderRole(traderId, newRole);
    if (traderId === user?.id || traderId === user?.email) {
      if (CRM_ALLOWED_ROLES.includes(newRole)) {
        setCurrentStaffRole(newRole);
        localStorage.setItem('zyti_staff_role', newRole);
      }
    }
  };

  // Bloqueo estricto para cuentas de rol 'trader'
  if (user?.role === 'trader' && !localStorage.getItem('zyti_staff_role')) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FBF9F4] p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {isEs ? 'Acceso Restringido al CRM ERP' : 'Restricted ERP CRM Access'}
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-md mt-2 leading-relaxed">
          {isEs 
            ? 'Esta sección está reservada exclusivamente para los roles de Administración, Soporte y Marketing. Las cuentas con rol de Trader no tienen acceso al CRM institucional.'
            : 'This section is strictly reserved for Administration, Support, and Marketing roles. Trader accounts do not have access to the institutional ERP CRM.'
          }
        </p>
        <button
          onClick={() => {
            if (onBackToTerminal) onBackToTerminal();
            else window.location.href = `/${lang}/zytiterminal/BTCUSDT`;
          }}
          className="mt-6 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {isEs ? '← Volver a la Terminal de Trading' : '← Back to Trading Terminal'}
        </button>
      </div>
    );
  }

  // Datos del admin/staff logueado dinámicos sin emails hardcodeados
  const staffName = user?.name || (user?.email ? user.email.split('@')[0] : 'Carlos');
  const staffEmail = user?.email || `${currentStaffRole}@zytitrade.com`;
  const staffAvatar = user?.avatarUrl;

  return (
    <div 
      className="min-h-screen w-full overflow-y-auto overflow-x-hidden custom-scrollbar text-[#0F172A] flex flex-col font-sans selection:bg-[#EAB308]/30 selection:text-[#020617] relative z-30"
      style={{
        backgroundColor: '#FBF9F4',
        backgroundImage: `
          linear-gradient(to right, rgba(220, 214, 202, 0.45) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(220, 214, 202, 0.45) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px'
      }}
    >
      {/* Barra de Navegación Superior ERP Ultra-Limpia */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur-xl border-b border-[#e5dfd3] shadow-xs flex items-center justify-between gap-4">
        {/* Logo Oficial de ZYTI & Título Nexus */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSelectModuleWithUrl('hub')} 
            className="flex items-center gap-2.5 bg-transparent border-none p-0 cursor-pointer text-left"
          >
            <img 
              src="/logo-zyti.png" 
              alt="ZYTI Trade Logo" 
              className="w-8 h-8 object-contain transition-transform duration-200 hover:scale-105" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-lg font-black tracking-tight text-slate-950 font-sans">
                  ZYTI <span className="font-light text-slate-500">Nexus</span>
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#f4efe4] border border-[#ded7c8] text-slate-800">
                  {isEs ? 'ERP Central' : 'ERP Core'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
                {isEs ? 'Pasarela de Fondeo & Riesgo' : 'Prop Firm & Risk Gateway'}
              </span>
            </div>
          </button>
        </div>

        {/* Telemetría, Datos del Staff y Controles */}
        <div className="flex items-center gap-2.5">
          {/* Identidad del Usuario Logueado (Staff) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white overflow-hidden shrink-0">
              {staffAvatar ? (
                <img src={staffAvatar} alt={staffName} className="w-full h-full object-cover" />
              ) : (
                staffName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="text-left min-w-0 max-w-[150px]">
              <div className="text-xs font-black text-slate-900 leading-tight truncate">
                {staffName}
              </div>
              <div className="text-[9px] font-bold text-amber-700 leading-tight uppercase tracking-wider">
                {currentStaffRole}
              </div>
            </div>
          </div>

          {/* Selector de Idioma */}
          <div className="relative" ref={langDropdownRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#ded5c5] bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-900 shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {langOpen && (
              <div className="absolute top-full mt-2 w-36 rounded-2xl p-1.5 z-50 right-0 bg-white/98 backdrop-blur-md shadow-2xl border border-slate-200 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => toggleLanguage('es')}
                  className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    lang === 'es' 
                      ? 'bg-[#EAB308]/20 text-[#854D0E] border border-[#EAB308]/30 shadow-xs' 
                      : 'hover:bg-[#ede5d6] text-slate-900'
                  }`}
                >
                  <span>Español</span>
                  {lang === 'es' && <Check className="w-3.5 h-3.5 text-[#854D0E]" />}
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    lang === 'en' 
                      ? 'bg-[#EAB308]/20 text-[#854D0E] border border-[#EAB308]/30 shadow-xs' 
                      : 'hover:bg-[#ede5d6] text-slate-900'
                  }`}
                >
                  <span>English</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-[#854D0E]" />}
                </button>
              </div>
            )}
          </div>

          {/* Botón Ir a Terminal */}
          {onBackToTerminal && (
            <button
              onClick={onBackToTerminal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ded5c5] bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-xs cursor-pointer"
              title={t.backToTerminal}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.backToTerminal}</span>
            </button>
          )}

          {/* Botón de Logout Claro y Visible */}
          <button
            onClick={() => {
              if (onLogout) onLogout();
              else {
                localStorage.removeItem('zyti_user_session');
                window.location.href = `/${lang}`;
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 hover:text-rose-900 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-xs cursor-pointer"
            title={isEs ? 'Cerrar Sesión' : 'Sign Out'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEs ? 'Salir' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal Aprovechando Todo el Ancho y con Scroll Fluido */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6 pb-36">
        
        {/* Barra de navegación de retorno si estamos en un submódulo */}
        {activeModule !== 'hub' && (
          <div className="flex items-center justify-between pb-3 border-b border-[#ece7dc]">
            <button
              onClick={() => handleSelectModuleWithUrl('hub')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#dcd6ca] text-xs font-black text-[#0F172A] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isEs ? '← Volver al Hub ERP' : '← Back to ERP Hub'}</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              <span>NEXUS</span>
              <span>/</span>
              <span className="text-[#0F172A]">{moduleTitles[activeModule]?.[lang] || activeModule}</span>
            </div>
          </div>
        )}

        {/* 1. Vista Principal (HUB ERP): Barra de KPIs + Grid de Cards + Tabla de Traders/Clientes */}
        {activeModule === 'hub' && (
          <>
            {/* Barra Compacta de KPIs */}
            <KpiHeader kpis={kpis} lang={lang} onRefresh={refreshData} />

            {/* Grid de Cards Limpias de cada Sección del ERP Filtradas por Rol */}
            <ErpModulesGrid
              lang={lang}
              activeModule={activeModule}
              onSelectModule={handleSelectModuleWithUrl}
              userRole={currentStaffRole}
            />

            {/* Listado de Traders & Clientes con Buscador y Cuenta Demo */}
            <TradersClientsTable
              traders={traders}
              lang={lang}
              onUpdateAccountSize={handleUpdateTraderAccountSize}
              onUpdateTraderRole={onTraderRoleChange}
              onUpdateTraderStatus={handleUpdateTraderStatus}
              onResetBalance={handleResetTraderBalance}
              onOpenRiskEngineForTrader={(trader) => {
                setSelectedTraderForAudit(trader);
                handleSelectModuleWithUrl('risk_engine');
              }}
            />
          </>
        )}

        {/* 1. Vista Dedicada: Guía de Despliegue & DevOps (Exclusiva Admin) */}
        {activeModule === 'deployment' && (
          <DeploymentGuideView lang={lang} />
        )}

        {/* 2. Vista Dedicada: Motor de Riesgo & Auditoría Forense Institucional */}
        {activeModule === 'risk_engine' && (
          <RiskForensicAuditConsole
            traders={traders}
            selectedTrader={selectedTraderForAudit}
            onSelectTrader={setSelectedTraderForAudit}
            lang={lang}
            rules={riskRules}
            onOpenRulesModal={() => {
              if (activeRule?.id) setSelectedRuleId(activeRule.id);
              handleSelectModuleWithUrl('challenges');
            }}
            onResetAccount={handleResetTraderBalance}
          />
        )}

        {/* 3. Vista Dedicada: API Gateway & Developers */}
        {activeModule === 'apis' && (
          <ApiGatewayCard
            apiKeys={apiCredentials}
            lang={lang}
            onOpenCreateModal={() => setIsApiKeyModalOpen(true)}
            onToggleStatus={handleToggleApiKey}
            onDeleteKey={handleDeleteApiKey}
          />
        )}

        {/* 4. Vista Dedicada: Exchanges & Enlaces de Afiliado */}
        {activeModule === 'exchanges' && (
          <AffiliatesManagerCard type="exchanges" lang={lang} />
        )}

        {/* 5. Vista Dedicada: Prop Firms & B2B Partners */}
        {activeModule === 'prop_firms' && (
          <AffiliatesManagerCard type="prop_firms" lang={lang} />
        )}

        {/* 6. Vista: Gestión Integral de Challenges, Reglas y Probador en Vivo (Sin Modales) */}
        {activeModule === 'challenges' && (
          <ChallengesManagementView
            rules={riskRules}
            activeRuleId={selectedRuleId}
            lang={lang}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onSelectRule={(id) => setSelectedRuleId(id)}
          />
        )}

        {/* 7. Vista: Planes SaaS */}
        {activeModule === 'plans' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {isEs ? 'Planes y Suscripciones SaaS' : 'SaaS Plans and Subscriptions'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isEs ? 'Control de precios de la plataforma ZYTI Trade.' : 'Manage pricing tiers for ZYTI Trade.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e5dfd3]">
                <div className="font-extrabold text-sm text-[#0F172A]">{isEs ? 'Plan Gratuito' : 'Free Plan'}</div>
                <div className="text-lg font-black text-slate-800 mt-1">{isEs ? '0 € / mes' : '$0 / mo'}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {isEs ? '1 cuenta conectada, datos L2 básicos.' : '1 connected account, core L2 data.'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200">
                <div className="font-extrabold text-sm text-purple-900">{isEs ? 'Plan Pro' : 'Pro Plan'}</div>
                <div className="text-lg font-black text-purple-900 mt-1">{isEs ? '29 € / mes' : '$29 / mo'}</div>
                <div className="text-xs text-purple-700 mt-2">
                  {isEs ? 'Cuentas ilimitadas, Risk Guardian y split de órdenes.' : 'Unlimited accounts, Risk Guardian and order splitting.'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200">
                <div className="font-extrabold text-sm text-amber-900">{isEs ? 'Plan Institucional' : 'Institutional Plan'}</div>
                <div className="text-lg font-black text-amber-900 mt-1">{isEs ? '79 € / mes' : '$79 / mo'}</div>
                <div className="text-xs text-amber-700 mt-2">
                  {isEs ? 'APIs dedicadas, acceso a motor de arbitraje sub-100ms.' : 'Dedicated APIs, sub-100ms arbitrage access.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Vista: Soporte */}
        {activeModule === 'support' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="w-6 h-6 text-rose-600" />
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {isEs ? 'Mesa de Ayuda & Agentes de Soporte' : 'Help Desk & Support Agents'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isEs ? 'Asigna usuarios de soporte y supervisa tickets de traders.' : 'Assign support staff and monitor trader tickets.'}
                </p>
              </div>
            </div>
            <div className="p-8 text-center text-slate-400 font-medium text-xs bg-white/60 rounded-xl border border-dashed border-[#dcd6ca]">
              {isEs ? '0 tickets pendientes. Todos los canales de Telegram y correo están al día.' : '0 pending tickets. All Telegram and email channels clear.'}
            </div>
          </div>
        )}

        {/* 9. Vista: Marketing */}
        {activeModule === 'marketing' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {isEs ? 'Marketing & Captación de Traders' : 'Marketing & Growth'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isEs ? 'Tráfico por activo, conversiones y analítica SEO.' : 'Traffic by instrument, conversions and SEO analytics.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e5dfd3]">
                <div className="text-xs text-slate-500">
                  {isEs ? 'Páginas Canónicas Activas' : 'Active Canonical Pages'}
                </div>
                <div className="text-xl font-black text-[#0F172A] mt-1">
                  {isEs ? '16 Pares Cripto' : '16 Crypto Pairs'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e5dfd3]">
                <div className="text-xs text-slate-500">
                  {isEs ? 'Indexación para Motores IA' : 'AI Engine Indexation'}
                </div>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  ChatGPT / Perplexity 100%
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modales */}
      <DynamicRulesModal
        isOpen={isRuleModalOpen}
        lang={lang}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        ruleToEdit={editingRule}
        availableRules={riskRules}
        onNavigateToChallenges={() => {
          setIsRuleModalOpen(false);
          handleSelectModuleWithUrl('challenges');
        }}
        onSaveRule={handleSaveRule}
      />

      <CreateApiKeyModal
        isOpen={isApiKeyModalOpen}
        lang={lang}
        onClose={() => setIsApiKeyModalOpen(false)}
        onCreateKey={handleCreateApiKey}
        newlyCreatedKey={newlyCreatedKey}
        onDismissCreatedKey={() => {
          setNewlyCreatedKey(null);
          setIsApiKeyModalOpen(false);
        }}
      />
    </div>
  );
};
