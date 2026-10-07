import React from 'react';
import { CrmModuleId, CrmStaffRole, ROLE_CARD_PERMISSIONS } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface ErpModulesGridProps {
  lang?: CrmLang;
  activeModule: CrmModuleId;
  onSelectModule: (module: CrmModuleId) => void;
  userRole?: CrmStaffRole;
}

export const ErpModulesGrid: React.FC<ErpModulesGridProps> = ({
  lang = 'es',
  onSelectModule,
  userRole = 'admin'
}) => {
  const isEs = lang === 'es';
  const effectiveRole: CrmStaffRole = userRole || 'admin';
  const allowedIds = ROLE_CARD_PERMISSIONS[effectiveRole] || ROLE_CARD_PERMISSIONS.admin;

  const modules: {
    id: CrmModuleId;
    headerType: 'solid_red' | 'mantecado' | 'solid_blue' | 'white' | 'solid_green' | 'solid_indigo' | 'obsidian';
    tag: string;
    brandName: string;
    brandSub: string;
    description: string;
  }[] = [
    // 0. ZYTI Engine (Infraestructura Visual & Telemetría) - EXCLUSIVO ADMIN (Dark Obsidian)
    {
      id: 'deployment',
      headerType: 'obsidian',
      tag: 'CORE ARCHITECTURE',
      brandName: 'ZYTI ENGINE',
      brandSub: isEs ? 'Telemetría & Servidores' : 'Live Telemetry & Infra',
      description: isEs 
        ? 'Arquitectura visual del ecosistema ZYTI en gráficos en vivo, tacómetros radiales de servidores y configuración Docker.' 
        : 'Live visual architecture of the ZYTI ecosystem, radial server gauges and Docker deployment.'
    },

    // 1. Motor de Riesgo (Risk Sentinel) - ROJO SÓLIDO (solicitado: debe ser roja)
    {
      id: 'risk_engine',
      headerType: 'solid_red',
      tag: 'ZYTI SENTINEL',
      brandName: isEs ? 'MOTOR DE RIESGO' : 'RISK SENTINEL',
      brandSub: isEs ? 'Supervisión 0ms en RAM' : '0ms Pre-Trade Guard',
      description: isEs 
        ? 'Supervisión en RAM de cuentas demo y funded, detección de drawdown en tiempo real y liquidación forzada.' 
        : 'In-RAM supervision of demo & funded accounts, real-time drawdown sentinel and hard liquidation.'
    },

    // 2. APIs (Developers) - MANTECADO / GRIS CÁLIDO (solicitado: gris o mantecado)
    {
      id: 'apis',
      headerType: 'mantecado',
      tag: 'ZYTI DEVELOPER',
      brandName: isEs ? 'APIs DESARROLLADOR' : 'DEVELOPER APIS',
      brandSub: isEs ? 'Pasarela REST & WebSockets' : 'REST & WebSockets Gateway',
      description: isEs 
        ? 'Aprovisionamiento B2B para Empresas de Fondeo y credenciales de trading para Agentes de IA.' 
        : 'B2B provisioning for Prop Firms and institutional access keys for autonomous AI Agents.'
    },

    // 3. Retos de Evaluación (Challenges) - Azul Sólido Eléctrico (estilo Business Insider)
    {
      id: 'challenges',
      headerType: 'solid_blue',
      tag: 'EVALUATION LAB',
      brandName: isEs ? 'RETOS EVALUACIÓN' : 'CHALLENGES',
      brandSub: 'Tiers 10K · 50K · 100K',
      description: isEs 
        ? 'Gestión de retos de evaluación, fases 1 y 2, objetivos de beneficio y reglas de escalamiento.' 
        : 'Evaluation challenge tiers, Phase 1 & 2 profit targets, consistency rules and scaling plans.'
    },

    // 4. Planes SaaS - Blanco Minimalista
    {
      id: 'plans',
      headerType: 'white',
      tag: 'ZYTI TIERS',
      brandName: isEs ? 'PLANES PLATAFORMA' : 'PLATFORM PLANS',
      brandSub: isEs ? 'Suscripciones SaaS & MRR' : 'SaaS & Memberships',
      description: isEs 
        ? 'Control de precios de la plataforma ZYTI: Plan Gratuito, Pro (29 €/m) e Institucional (79 €/m).' 
        : 'Platform subscription tiers: Free, Pro (29 €/mo) and Institutional (79 €/mo) access.'
    },

    // 5. Exchanges - Indigo Profundo
    {
      id: 'exchanges',
      headerType: 'solid_indigo',
      tag: 'VENUE NETWORK',
      brandName: '16 EXCHANGES',
      brandSub: 'Binance · Bybit · OKX · 13+',
      description: isEs 
        ? 'Administra los enlaces de afiliado, rebates de comisiones y estado de los 16 exchanges.' 
        : 'Manage affiliate links, commission rebates and connectivity status for all 16 supported venues.'
    },

    // 6. Prop Firms - Blanco Minimalista
    {
      id: 'prop_firms',
      headerType: 'white',
      tag: 'PROP PARTNERS',
      brandName: isEs ? 'EMPRESAS FONDEO' : 'PROP FIRMS',
      brandSub: isEs ? 'Directorio Auditado & Cupones' : 'Audited Directory & Splits',
      description: isEs 
        ? 'Directorio de empresas de fondeo aliadas, cupones de descuento y reparto de beneficios.' 
        : 'Audited directory of allied Prop Firms, partner discount codes and profit share splits.'
    },

    // 7. Soporte - Blanco Minimalista
    {
      id: 'support',
      headerType: 'white',
      tag: 'ZYTI CONCIERGE',
      brandName: isEs ? 'MESA DE SOPORTE' : 'SUPPORT DESK',
      brandSub: isEs ? 'Mesa de Ayuda & Agentes' : 'Trader Helpdesk & Staff',
      description: isEs 
        ? 'Mesa de ayuda institucional y asignación de usuarios del equipo de soporte técnico.' 
        : 'Institutional customer helpdesk and assignment of support staff members.'
    },

    // 8. Crecimiento & SEO - VERDE SÓLIDO (solicitado: SEO y Crecimiento Verde, como HackerNoon)
    {
      id: 'marketing',
      headerType: 'solid_green',
      tag: 'GROWTH & SEO',
      brandName: isEs ? 'CRECIMIENTO & SEO' : 'GROWTH & SEO',
      brandSub: isEs ? 'Páginas Canónicas para IA' : 'Canonical AI Search',
      description: isEs 
        ? 'Control de campañas de captación de traders, tráfico orgánico y páginas canónicas para motores IA.' 
        : 'Trader acquisition campaigns, organic search metrics and canonical landing pages for AI engines.'
    }
  ];

  return (
    <div className="w-full space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#0F172A] tracking-tight font-sans">
            {isEs ? 'Módulos del Sistema ERP' : 'ERP System Modules'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isEs 
              ? 'Accede directamente a cada área operativa de la plataforma y de la empresa de fondeo.' 
              : 'Select any operational module of the platform and funding firm.'
            }
          </p>
        </div>
      </div>

      {/* Grid de Cards compactas y estilizadas idénticas a la referencia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {modules.filter(m => allowedIds.includes(m.id)).map(mod => {
          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* 1. BLOQUE SUPERIOR (CABECERA DE MARCA LIMPIA SIN ICONOS GENÉRICOS - ALTERNANDO COLORES SÓLIDOS Y BLANCO) */}
              {mod.headerType === 'solid_red' && (
                <div className="w-full h-22 bg-[#DC2626] px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all">
                  <span className="text-[9.5px] font-mono tracking-widest text-rose-200 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-white tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-100 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'mantecado' && (
                <div className="w-full h-22 bg-[#f4efe4] border-b border-[#ded7c8] px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all group-hover:bg-[#eee7d8]">
                  <span className="text-[9.5px] font-mono tracking-widest text-amber-800 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-slate-950 tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'solid_blue' && (
                <div className="w-full h-22 bg-[#0038FF] px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all">
                  <span className="text-[9.5px] font-mono tracking-widest text-blue-200 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-white tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-100 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'solid_green' && (
                <div className="w-full h-22 bg-[#00E676] px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all">
                  <span className="text-[9.5px] font-mono tracking-widest text-emerald-950 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-slate-950 tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-900 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'obsidian' && (
                <div className="w-full h-22 bg-[#0A0D14] border-b border-slate-800 px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all group-hover:bg-[#121620]">
                  <span className="text-[9.5px] font-mono tracking-widest text-amber-400 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-white tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'solid_indigo' && (
                <div className="w-full h-22 bg-[#4F46E5] px-3.5 py-3 flex flex-col items-center justify-center text-center transition-all">
                  <span className="text-[9.5px] font-mono tracking-widest text-indigo-200 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-white tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-100 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {mod.headerType === 'white' && (
                <div className="w-full h-22 bg-white px-3.5 py-3 flex flex-col items-center justify-center text-center border-b border-slate-100 transition-colors group-hover:bg-[#faf8f4]">
                  <span className="text-[9.5px] font-mono tracking-widest text-slate-400 uppercase font-black">
                    {mod.tag}
                  </span>
                  <span className="text-[14px] font-black text-slate-950 tracking-tight uppercase leading-tight mt-0.5">
                    {mod.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {mod.brandSub}
                  </span>
                </div>
              )}

              {/* 2. BLOQUE CENTRAL (DESCRIPCIÓN TEXTUAL NÍTIDA Y COMPACTA) */}
              <div className="p-3.5 flex-1 bg-white transition-colors flex items-center">
                <p className="text-[11.5px] text-slate-500 font-normal leading-relaxed line-clamp-3">
                  {mod.description}
                </p>
              </div>

              {/* 3. BLOQUE INFERIOR (HOVER TOTALMENTE AL RAS DE LA BASE, SIN MARCO) */}
              <div className="w-full px-4 py-2.5 bg-transparent border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 transition-colors duration-150 group-hover:bg-[#0A0D14] group-hover:border-[#0A0D14] group-hover:text-white">
                <span>
                  {isEs ? 'Ver detalles' : 'View details'}
                </span>
                <div>
                  <ArrowRight className="w-3.5 h-3.5 block group-hover:hidden text-slate-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 hidden group-hover:block text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
