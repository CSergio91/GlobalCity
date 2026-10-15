import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  User, 
  ShieldAlert, 
  Layers, 
  DollarSign, 
  Building2, 
  Cpu, 
  Activity, 
  ArrowRight,
  Command,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CrmModuleId, RiskRuleConfigEntity, TraderClientEntity, PayoutRequestEntity } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { extractBaseName, getModelKey, formatAccountSizeTag } from './ChallengesManagementView';

export interface NexusHeaderSearchProps {
  lang?: CrmLang;
  traders?: TraderClientEntity[];
  riskRules?: RiskRuleConfigEntity[];
  payouts?: PayoutRequestEntity[];
  onSelectModule: (module: CrmModuleId) => void;
  onSelectTraderForAudit?: (trader: TraderClientEntity) => void;
  onSelectRule?: (ruleId: string) => void;
  className?: string;
  autoOpen?: boolean;
}

interface SearchItem {
  id: string;
  type: 'module' | 'trader' | 'challenge' | 'payout';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export const NexusHeaderSearch: React.FC<NexusHeaderSearchProps> = ({
  lang = 'es',
  traders = [],
  riskRules = [],
  payouts = [],
  onSelectModule,
  onSelectTraderForAudit,
  onSelectRule,
  className = '',
  autoOpen = false
}) => {
  const isEs = lang === 'es';
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [autoOpen]);

  // Módulos ERP Principales
  const moduleDefs = useMemo(() => [
    { 
      id: 'hub' as CrmModuleId, 
      title: isEs ? 'Panel Principal (Hub ERP)' : 'Main Dashboard (ERP Hub)', 
      subtitle: isEs ? 'Vista general de traders, capital y telemetría de trading' : 'Traders overview, capital, and trading telemetry', 
      icon: Activity,
      badge: isEs ? 'General' : 'Core'
    },
    { 
      id: 'risk_engine' as CrmModuleId, 
      title: isEs ? 'Motor de Riesgo (Risk Sentinel)' : 'Risk Engine (Risk Sentinel)', 
      subtitle: isEs ? 'Centinela 0ms en RAM, auditoría forense y control de drawdown' : '0ms RAM sentinel, forensic audit & drawdown guard', 
      icon: ShieldAlert,
      badge: '0ms RAM'
    },
    { 
      id: 'challenges' as CrmModuleId, 
      title: isEs ? 'Modelos de Challenge & Retos' : 'Challenge Models & Rules', 
      subtitle: isEs ? 'Gestión de retos (Solar/Lunar), tamaños, precios y reglas de fondeo' : 'Solar/Lunar challenge setup, sizes, pricing & funding rules', 
      icon: Layers,
      badge: isEs ? 'Modelos' : 'Models'
    },
    { 
      id: 'payouts' as CrmModuleId, 
      title: isEs ? 'Finanzas & Payouts' : 'Finance & Payouts', 
      subtitle: isEs ? 'Gestión de retiros de traders, órdenes USDT/USDC y aprobaciones' : 'Trader withdrawal requests, USDT/USDC orders & approvals', 
      icon: DollarSign,
      badge: isEs ? 'Tesorería' : 'Treasury'
    },
    { 
      id: 'company_identity' as CrmModuleId, 
      title: isEs ? 'Identidad de Empresa & Nomenclatura' : 'Company Identity & Nomenclatures', 
      subtitle: isEs ? 'Configuración legal, prefijo EKL-, webhooks y branding' : 'Legal setup, EKL- prefix, webhooks & brand config', 
      icon: Building2,
      badge: isEs ? 'Empresa' : 'Firm'
    },
    { 
      id: 'deployment' as CrmModuleId, 
      title: isEs ? 'Eklipse Engine (Telemetría & Servidores)' : 'Eklipse Engine (Telemetry & Servers)', 
      subtitle: isEs ? 'Estado de infraestructura Docker, tacómetros de latencia y WebSocket' : 'Docker infrastructure health, latency gauges & WebSocket gateway', 
      icon: Cpu,
      badge: isEs ? 'Servidores' : 'Engine'
    },
    { 
      id: 'apis' as CrmModuleId, 
      title: isEs ? 'APIs & Agentes IA' : 'Developer APIs & AI Agents', 
      subtitle: isEs ? 'Llaves maestras de API y conectividad para agentes institucionales' : 'Master API keys and institutional AI agent connectivity', 
      icon: Command,
      badge: 'B2B API'
    }
  ], [isEs]);

  // Lista unificada de todos los elementos buscables
  const allItems: SearchItem[] = useMemo(() => {
    const list: SearchItem[] = [];

    // 1. Módulos ERP
    moduleDefs.forEach(m => {
      list.push({
        id: `mod-${m.id}`,
        type: 'module',
        categoryLabel: isEs ? 'Módulos ERP' : 'ERP Modules',
        title: m.title,
        subtitle: m.subtitle,
        badge: m.badge,
        badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
        icon: m.icon,
        onSelect: () => {
          onSelectModule(m.id);
          setIsOpen(false);
          setQuery('');
        }
      });
    });

    // 2. Traders / Cuentas
    traders.forEach(t => {
      list.push({
        id: `trader-${t.id}`,
        type: 'trader',
        categoryLabel: isEs ? 'Traders & Cuentas' : 'Traders & Accounts',
        title: t.fullName || t.email,
        subtitle: `${t.email} • Cuenta: ${t.accountNumber} • ${t.role.toUpperCase()}`,
        badge: isEs ? 'Trader' : 'Trader',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: User,
        onSelect: () => {
          if (onSelectTraderForAudit) {
            onSelectTraderForAudit(t);
          }
          onSelectModule('risk_engine');
          setIsOpen(false);
          setQuery('');
        }
      });
    });

    // 3. Modelos de Challenge (Unificados por Modelo base)
    const seenModelKeys = new Set<string>();
    riskRules.forEach(r => {
      const key = getModelKey(r);
      if (seenModelKeys.has(key)) return;
      seenModelKeys.add(key);

      const bName = extractBaseName(r.name);
      const cat = r.category || 'solar';
      const mType = r.model_type || 'ONE_PHASE';
      const siblingTiers = riskRules.filter(sibling => getModelKey(sibling) === key);
      const minB = Math.min(...siblingTiers.map(s => Number(s.default_account_balance || 100000)));
      const maxB = Math.max(...siblingTiers.map(s => Number(s.default_account_balance || 100000)));
      const minTag = formatAccountSizeTag(minB);
      const maxTag = formatAccountSizeTag(maxB);
      const rangeTag = minB === maxB ? `$${minTag}` : `$${minTag} - $${maxTag}`;

      list.push({
        id: `model-${key}`,
        type: 'challenge',
        categoryLabel: isEs ? 'Modelos de Challenge' : 'Challenge Models',
        title: bName,
        subtitle: `${siblingTiers.length} ${siblingTiers.length === 1 ? (isEs ? 'Tamaño' : 'Size') : (isEs ? 'Tamaños' : 'Sizes')} (${rangeTag}) • ${mType === 'INSTANT_FUNDING' ? (isEs ? 'Fondeo Directo' : 'Instant') : mType === 'TWO_PHASE' ? (isEs ? '2 Fases' : '2 Phases') : (isEs ? '1 Fase' : '1 Phase')} • ${cat.toUpperCase()}`,
        badge: isEs ? 'Reto' : 'Plan',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Layers,
        onSelect: () => {
          if (onSelectRule) onSelectRule(r.id);
          onSelectModule('challenges');
          setIsOpen(false);
          setQuery('');
        }
      });
    });

    // 4. Payouts
    payouts.forEach(p => {
      list.push({
        id: `payout-${p.id}`,
        type: 'payout',
        categoryLabel: isEs ? 'Finanzas & Payouts' : 'Finance & Payouts',
        title: `Payout #${p.payout_number || 1} • $${Number(p.amount || 0).toLocaleString()} USDT`,
        subtitle: `${p.trader_email} • ${p.status} • Destino: ${p.destination_address.slice(0, 12)}...`,
        badge: p.status,
        badgeColor: p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200',
        icon: DollarSign,
        onSelect: () => {
          onSelectModule('payouts');
          setIsOpen(false);
          setQuery('');
        }
      });
    });

    return list;
  }, [moduleDefs, traders, riskRules, payouts, isEs, onSelectModule, onSelectTraderForAudit, onSelectRule]);

  // Filtrado reactivo en tiempo real
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Si no hay búsqueda, mostramos todos los módulos primero
      return allItems.filter(item => item.type === 'module');
    }
    const q = query.toLowerCase().trim();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [allItems, query]);

  // Reiniciar índice al cambiar resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Click outside para cerrar el desplegable
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atajo global Ctrl+K / Cmd+K: Desliza y enfoca el buscador en la barra superior SIN modal
  useEffect(() => {
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K' || e.code === 'KeyK';
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 30);
      }
    };
    window.addEventListener('keydown', handleKeyDownCapture, true);
    return () => window.removeEventListener('keydown', handleKeyDownCapture, true);
  }, []);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleOpenSearch = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative transition-all duration-300 ease-out ${
        isOpen ? 'w-full max-w-xl' : 'w-72 sm:w-80 md:w-96'
      } ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Barra de Búsqueda Deslizable Integrada en el Header */}
      <div 
        onClick={handleOpenSearch}
        className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border transition-all duration-300 shadow-2xs cursor-text ${
          isOpen
            ? 'bg-white border-amber-500/70 ring-3 ring-amber-500/15 shadow-md'
            : 'bg-[#fcfbf9] border-[#ded5c5] hover:bg-white hover:border-[#cfc4b0] text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Search className={`w-3.5 h-3.5 shrink-0 transition-colors ${isOpen ? 'text-amber-600' : 'text-slate-400'}`} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              isEs 
                ? 'Buscar módulos, traders, cuentas, retos... (Ctrl K)' 
                : 'Search modules, traders, accounts, rules... (Ctrl K)'
            }
            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {query ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isEs ? 'Limpiar búsqueda' : 'Clear search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200 shadow-2xs">
              <span className="text-[9px]">Ctrl</span> K
            </kbd>
          )}
        </div>
      </div>

      {/* Desplegable Flotante Anclado Directamente Debajo del Buscador (Sin Modal de Fondo) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white/98 backdrop-blur-2xl rounded-2xl border border-[#ded5c5] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-[#0F172A]">
          {/* Header del desplegable */}
          <div className="px-3.5 py-2.5 border-b border-[#e5dfd3] bg-[#faf8f5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                {!query.trim() 
                  ? (isEs ? 'Módulos de Eklipse Nexus' : 'Eklipse Nexus Modules') 
                  : (isEs ? `Resultados (${filteredItems.length})` : `Results (${filteredItems.length})`)}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {!query.trim() ? (isEs ? 'Navegación Rápida' : 'Quick Access') : (isEs ? 'Búsqueda en Vivo' : 'Live Search')}
            </span>
          </div>

          {/* Lista de Resultados / Módulos Desplegados */}
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-400">
                <Search className="w-7 h-7 mx-auto mb-2 opacity-40 text-amber-600" />
                <p className="text-xs font-bold text-slate-600">
                  {isEs ? `No se encontraron resultados para "${query}"` : `No results found for "${query}"`}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEs ? 'Intenta buscar por módulo, email de trader o tipo de reto.' : 'Try searching by module, trader email, or challenge type.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={item.onSelect}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-slate-950 shadow-2xs' 
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected 
                          ? 'bg-amber-500 text-slate-950 border-amber-600' 
                          : 'bg-[#f4efe4] text-slate-700 border-[#ded5c5]'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold truncate text-slate-900">{item.title}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-all ${
                      isSelected ? 'translate-x-1 text-amber-600 opacity-100' : 'opacity-20 text-slate-400'
                    }`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer de Ayuda con Atajos */}
          <div className="px-3.5 py-2 border-t border-[#e5dfd3] bg-[#faf8f5] text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span><kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-bold">↑↓</kbd> {isEs ? 'Navegar' : 'Navigate'}</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-bold">↵</kbd> {isEs ? 'Abrir' : 'Select'}</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-bold">ESC</kbd> {isEs ? 'Cerrar' : 'Close'}</span>
            </div>
            <span className="font-bold text-amber-700 text-[10px]">Eklipse Nexus</span>
          </div>
        </div>
      )}
    </div>
  );
};
