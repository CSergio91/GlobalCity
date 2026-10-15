import React, { useState, useEffect, useRef } from 'react';
import { useCrmDashboard } from './hooks/useCrmDashboard';
import { KpiHeader } from './components/KpiHeader';
import { ErpModulesGrid } from './components/ErpModulesGrid';
import { TradersClientsTable } from './components/TradersClientsTable';
import { ApiGatewayCard } from './components/ApiGatewayCard';
import { RiskForensicAuditConsole } from './components/RiskForensicAuditConsole';
import { DynamicRulesModal } from './components/DynamicRulesModal';
import { CreateApiKeyModal } from './components/CreateApiKeyModal';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { ChallengesManagementView } from './components/ChallengesManagementView';
import { FinancePayoutsView } from './components/FinancePayoutsView';
import { CompanyIdentityView } from './components/CompanyIdentityView';
import { NexusHeaderSearch } from './components/NexusHeaderSearch';
import { CrmAccessDeniedScreen } from './components/CrmAccessDeniedScreen';
import { BrandLogo } from '../../components/BrandLogo';
import { CrmLang, crmTranslations } from './types/i18n';
import { CrmModuleId, CrmStaffRole, CRM_ALLOWED_ROLES } from './types/crm.types';
import { UserSession } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { isStaffRole } from '../../lib/roles';
import { 
  Globe, 
  ChevronDown, 
  LogOut, 
  ArrowLeft, 
  LayoutGrid, 
  Search,
  Headphones, 
  Megaphone,
  Check,
  X
} from 'lucide-react';

interface InstitutionalCrmAppProps {
  user?: UserSession | any;
  initialLang?: CrmLang;
  onBackToTerminal?: () => void;
  onLogout?: () => void;
}

export const InstitutionalCrmApp: React.FC<InstitutionalCrmAppProps> = ({
  user: propUser,
  initialLang = 'es',
  onBackToTerminal,
  onLogout
}) => {
  const { user: authUser, logout: authLogout } = useAuth();
  const user = propUser || authUser;
  const handleLogout = onLogout || authLogout;
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
    handleSaveRules,
    handleDeleteRule,
    handleDeleteRules,
    handleCreateApiKey,
    handleToggleApiKey,
    handleDeleteApiKey,
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
    else if (path.includes('/payouts') || path.includes('/finances')) setActiveModule('payouts');
    else if (path.includes('/identity') || path.includes('/company')) setActiveModule('company_identity');
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
      payouts: '/payouts',
      company_identity: '/identity',
      support: '/support',
      marketing: '/marketing'
    };

    const targetUrl = `/${lang}/nexus${moduleSlugMap[mod] || ''}`;
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
    payouts: { es: 'Finanzas & Payouts', en: 'Finance & Payouts' },
    company_identity: { es: 'Identidad de Empresa & Nomenclatura', en: 'Company Identity & Naming' },
    support: { es: 'Soporte Técnico', en: 'Support Desk' },
    marketing: { es: 'Marketing & SEO', en: 'Marketing & SEO' }
  };

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

  // Rol del staff activo en el CRM (admin, soporte y marketing tienen acceso estricto)
  const userRole = (user?.role || '').trim().toLowerCase();
  const isAuthorizedStaff = isStaffRole(userRole);

  const [currentStaffRole, setCurrentStaffRole] = useState<CrmStaffRole>(() => {
    if (isAuthorizedStaff && CRM_ALLOWED_ROLES.includes(userRole as any)) {
      return userRole as CrmStaffRole;
    }
    return 'admin';
  });

  const onTraderRoleChange = async (traderId: string, newRole: any) => {
    await handleUpdateTraderRole(traderId, newRole);
    if (traderId === user?.id || traderId === user?.email) {
      if (CRM_ALLOWED_ROLES.includes(newRole)) {
        setCurrentStaffRole(newRole);
      }
    }
  };

  // Bloqueo estricto e inquebrantable si el usuario no tiene rol administrativo
  if (!user || !isAuthorizedStaff) {
    return (
      <CrmAccessDeniedScreen 
        onBackToDashboard={onBackToTerminal}
        onLogout={handleLogout}
      />
    );
  }

  // Datos del admin/staff logueado dinámicos sin emails hardcodeados
  const staffName = user?.name || (user?.email ? user.email.split('@')[0] : 'Carlos');
  const staffAvatar = user?.avatarUrl;

  return (
    <div 
      translate="no"
      className="notranslate min-h-screen w-full overflow-y-auto overflow-x-hidden custom-scrollbar text-[#0F172A] flex flex-col font-sans selection:bg-[#EAB308]/30 selection:text-[#020617] relative z-30"
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
        {/* Logo Oficial de Eklipse & Título Nexus */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSelectModuleWithUrl('hub')} 
            className="flex items-center gap-2.5 bg-transparent border-none p-0 cursor-pointer text-left group"
          >
            <BrandLogo size="sm" showText={false} className="transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-lg font-black tracking-tight text-slate-950 font-sans">
                  EKLIPSE <span className="font-light text-slate-500">Nexus</span>
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#f4efe4] border border-[#ded7c8] text-amber-800">
                  {isEs ? 'ERP Central' : 'ERP Core'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
                {isEs ? 'Prop Firm & Motor de Riesgo' : 'Prop Firm & Risk Gateway'}
              </span>
            </div>
          </button>
        </div>

        {/* Buscador General Global Deslizable en Header (Sin Modal) */}
        <div className="flex items-center justify-center flex-1 mx-2 sm:mx-6 min-w-[200px] max-w-xl">
          <NexusHeaderSearch
            lang={lang}
            traders={traders}
            riskRules={riskRules}
            onSelectModule={handleSelectModuleWithUrl}
            onSelectTraderForAudit={(trader) => {
              setSelectedTraderForAudit(trader);
              handleSelectModuleWithUrl('risk_engine');
            }}
            onSelectRule={(ruleId) => {
              setSelectedRuleId(ruleId);
              handleSelectModuleWithUrl('challenges');
            }}
          />
        </div>

        {/* Telemetría, Datos del Staff y Controles */}
        <div className="flex items-center gap-2.5">
          {/* Botón de Búsqueda para Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(prev => !prev)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-xl border border-[#ded5c5] bg-white text-slate-700 shadow-2xs cursor-pointer"
            title={isEs ? 'Buscar módulos y traders' : 'Search modules and traders'}
          >
            {isMobileSearchOpen ? <X className="w-4 h-4 text-rose-600" /> : <Search className="w-4 h-4" />}
          </button>

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

          {/* Botón de Logout */}
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

      {/* Buscador Deslizable para Móvil (Sin Modal) */}
      {isMobileSearchOpen && (
        <div className="sm:hidden sticky top-[53px] z-39 px-4 py-2 bg-white/98 backdrop-blur-xl border-b border-[#e5dfd3] shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
          <NexusHeaderSearch
            autoOpen={true}
            lang={lang}
            traders={traders}
            riskRules={riskRules}
            className="w-full"
            onSelectModule={(mod) => {
              handleSelectModuleWithUrl(mod);
              setIsMobileSearchOpen(false);
            }}
            onSelectTraderForAudit={(trader) => {
              setSelectedTraderForAudit(trader);
              handleSelectModuleWithUrl('risk_engine');
              setIsMobileSearchOpen(false);
            }}
            onSelectRule={(ruleId) => {
              setSelectedRuleId(ruleId);
              handleSelectModuleWithUrl('challenges');
              setIsMobileSearchOpen(false);
            }}
          />
        </div>
      )}

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
            {/* Barra Compacta de KPIs Reales */}
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

        {/* 2. Vista Dedicada: Guía de Despliegue & DevOps (Exclusiva Admin) */}
        {activeModule === 'deployment' && (
          <DeploymentGuideView lang={lang} />
        )}

        {/* 3. Vista Dedicada: Motor de Riesgo & Auditoría Forense Institucional */}
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

        {/* 4. Vista Dedicada: API Gateway & Developers */}
        {activeModule === 'apis' && (
          <ApiGatewayCard
            apiKeys={apiCredentials}
            lang={lang}
            onOpenCreateModal={() => setIsApiKeyModalOpen(true)}
            onToggleStatus={handleToggleApiKey}
            onDeleteKey={handleDeleteApiKey}
          />
        )}

        {/* 5. Vista: Gestión Integral de Challenges, Reglas y Probador en Vivo */}
        {activeModule === 'challenges' && (
          <ChallengesManagementView
            rules={riskRules}
            activeRuleId={selectedRuleId}
            lang={lang}
            onSaveRule={handleSaveRule}
            onSaveRules={handleSaveRules}
            onDeleteRule={handleDeleteRule}
            onDeleteRules={handleDeleteRules}
            onSelectRule={(id) => setSelectedRuleId(id)}
          />
        )}

        {/* 6. Vista Dedicada: Finanzas & Gestión de Payouts */}
        {activeModule === 'payouts' && (
          <FinancePayoutsView lang={lang} />
        )}

        {/* 7. Vista Dedicada: Identidad de Empresa & Nomenclatura */}
        {activeModule === 'company_identity' && (
          <CompanyIdentityView lang={lang} />
        )}

        {/* 8. Vista: Soporte Técnico */}
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
