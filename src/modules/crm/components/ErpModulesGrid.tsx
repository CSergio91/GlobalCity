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
    // 0. Eklipse Engine (Infraestructura Visual & Telemetría) - EXCLUSIVO ADMIN (Dark Obsidian)
    {
      id: 'deployment',
      headerType: 'obsidian',
      tag: isEs ? 'ARQUITECTURA CENTRAL' : 'CORE ARCHITECTURE',
      brandName: 'EKLIPSE ENGINE',
      brandSub: isEs ? 'Telemetría & Servidores' : 'Live Telemetry & Infra',
      description: isEs 
        ? 'Arquitectura visual del ecosistema Eklipse en gráficos en vivo, tacómetros radiales de servidores y configuración Docker.' 
        : 'Live visual architecture of the Eklipse ecosystem, radial server gauges and Docker deployment.'
    },

    // 1. Motor de Riesgo (Risk Sentinel) - ROJO SÓLIDO
    {
      id: 'risk_engine',
      headerType: 'solid_red',
      tag: isEs ? 'CENTINELA DE RIESGO' : 'EKLIPSE SENTINEL',
      brandName: isEs ? 'MOTOR DE RIESGO' : 'RISK SENTINEL',
      brandSub: isEs ? 'Supervisión 0ms en RAM' : '0ms Pre-Trade Guard',
      description: isEs 
        ? 'Supervisión en RAM de cuentas demo y funded, detección de drawdown en tiempo real y liquidación forzada.' 
        : 'In-RAM supervision of demo & funded accounts, real-time drawdown sentinel and hard liquidation.'
    },

    // 2. Retos de Evaluación & Modelos (Challenges) - Azul Sólido Eléctrico
    {
      id: 'challenges',
      headerType: 'solid_blue',
      tag: isEs ? 'LABORATORIO DE RETOS' : 'CHALLENGE MODELS',
      brandName: isEs ? 'MODELOS Y RETOS' : 'CHALLENGE MODELS',
      brandSub: isEs ? 'Reglas · Tamaños · Escalado' : 'Rules · Multi-Size · Tiers',
      description: isEs 
        ? 'Gestión modular de retos (Solar/Lunar), pestañas de tamaños, precios y motor de simulación 24/7.' 
        : 'Modular challenge management (Solar/Lunar), account size tabs, pricing and 24/7 rule sandbox.'
    },

    // 3. Finanzas & Payouts - VERDE SÓLIDO
    {
      id: 'payouts',
      headerType: 'solid_green',
      tag: isEs ? 'FINANZAS Y TESORERÍA' : 'FINANCE & TREASURY',
      brandName: isEs ? 'FINANZAS & PAYOUTS' : 'FINANCE & PAYOUTS',
      brandSub: isEs ? 'Retiros · Tiers 35/50/80/90 · TX' : 'Withdrawals · Split Tiers · TX',
      description: isEs 
        ? 'Aprobación de retiros de traders, cálculo automático de retención según payout #1 (35%), #2 (50%), #3 (80%) y pago USDT.' 
        : 'Trader withdrawal approval, automated payout scale deduction (35%, 50%, 80%, 90%), and blockchain tx hash.'
    },

    // 4. Identidad de Empresa & Nomenclatura - MANTECADO
    {
      id: 'company_identity',
      headerType: 'mantecado',
      tag: isEs ? 'IDENTIDAD INSTITUCIONAL' : 'PROP FIRM IDENTITY',
      brandName: isEs ? 'IDENTIDAD EMPRESA' : 'COMPANY IDENTITY',
      brandSub: isEs ? 'Prefijo EKL- · Marca · Webhooks' : 'EKL- Prefix · Brand · Hooks',
      description: isEs 
        ? 'Identidad institucional de Eklipse Funded, nomenclatura de cuentas (ej: EKL-100K-...), branding y webhooks.' 
        : 'Institutional identity of Eklipse Funded, account nomenclatures (e.g. EKL-100K-...), branding and webhooks.'
    },

    // 5. APIs (Developers) - MANTECADO / GRIS CÁLIDO
    {
      id: 'apis',
      headerType: 'white',
      tag: isEs ? 'PASARELA DE APIS' : 'DEVELOPER GATEWAY',
      brandName: isEs ? 'APIs & AGENTES IA' : 'APIS & AI AGENTS',
      brandSub: isEs ? 'Pasarela REST & WebSockets' : 'REST & WebSockets Gateway',
      description: isEs 
        ? 'Aprovisionamiento B2B para socios institucionales y credenciales de trading de ultra-baja latencia.' 
        : 'B2B provisioning for institutional partners and ultra-low latency trading credentials.'
    },

    // 6. Soporte - Blanco Minimalista
    {
      id: 'support',
      headerType: 'white',
      tag: isEs ? 'MESA DE SOPORTE' : 'SUPPORT DESK',
      brandName: isEs ? 'MESA DE SOPORTE' : 'SUPPORT DESK',
      brandSub: isEs ? 'Mesa de Ayuda & Clientes' : 'Trader Helpdesk & Staff',
      description: isEs 
        ? 'Mesa de ayuda institucional y auditoría técnica de consultas de traders.' 
        : 'Institutional customer helpdesk and technical audit of trader tickets.'
    },

    // 7. Crecimiento & SEO - Índigo Profundo
    {
      id: 'marketing',
      headerType: 'solid_indigo',
      tag: isEs ? 'CRECIMIENTO Y SEO' : 'GROWTH & SEO',
      brandName: isEs ? 'CRECIMIENTO & SEO' : 'GROWTH & SEO',
      brandSub: isEs ? 'Indexación IA & Canónicas' : 'Canonical AI Search',
      description: isEs 
        ? 'Control de campañas de captación de traders, tráfico orgánico y páginas canónicas para motores IA.' 
        : 'Trader acquisition campaigns, organic search metrics and canonical landing pages for AI engines.'
    }
  ];

  return (
    <div className="w-full space-y-3 mb-6 notranslate" translate="no">
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
