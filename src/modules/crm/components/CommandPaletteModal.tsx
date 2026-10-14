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
  Command
} from 'lucide-react';
import { CrmModuleId, RiskRuleConfigEntity, TraderClientEntity, PayoutRequestEntity } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { extractBaseName, getModelKey, formatAccountSizeTag } from './ChallengesManagementView';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: CrmLang;
  traders?: TraderClientEntity[];
  riskRules?: RiskRuleConfigEntity[];
  payouts?: PayoutRequestEntity[];
  onSelectModule: (module: CrmModuleId) => void;
  onSelectTraderForAudit?: (trader: TraderClientEntity) => void;
  onSelectRule?: (ruleId: string) => void;
}

interface SearchItem {
  id: string;
  type: 'module' | 'trader' | 'challenge' | 'payout';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  lang = 'es',
  traders = [],
  riskRules = [],
  payouts = [],
  onSelectModule,
  onSelectTraderForAudit,
  onSelectRule
}) => {
  const isEs = lang === 'es';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: SearchItem[] = useMemo(() => {
    const list: SearchItem[] = [];

    // 1. Módulos ERP
    const moduleDefs: { id: CrmModuleId; title: string; subtitle: string; icon: any }[] = [
      { id: 'hub', title: isEs ? 'Panel Principal (Hub ERP)' : 'Main Dashboard (ERP Hub)', subtitle: isEs ? 'Vista general de traders y telemetría' : 'Traders overview and telemetry', icon: Activity },
      { id: 'risk_engine', title: isEs ? 'Motor de Riesgo (Risk Sentinel)' : 'Risk Engine (Risk Sentinel)', subtitle: isEs ? 'Centinela 0ms en RAM y control de drawdown' : '0ms RAM sentinel and drawdown guard', icon: ShieldAlert },
      { id: 'challenges', title: isEs ? 'Modelos de Challenge & Retos' : 'Challenge Models & Rules', subtitle: isEs ? 'Configuración de reglas, tamaños y precios' : 'Rule configuration, sizes, and pricing', icon: Layers },
      { id: 'payouts', title: isEs ? 'Finanzas & Payouts' : 'Finance & Payouts', subtitle: isEs ? 'Gestión de retiros de traders y registro de pagos' : 'Trader withdrawal requests & payments', icon: DollarSign },
      { id: 'company_identity', title: isEs ? 'Identidad de Empresa & Nomenclatura' : 'Company Identity & Nomenclatures', subtitle: isEs ? 'Configuración legal, prefijo EKL- y webhooks' : 'Legal setup, EKL- prefix and webhooks', icon: Building2 },
      { id: 'deployment', title: isEs ? 'Eklipse Engine (Telemetría & Servidores)' : 'Eklipse Engine (Telemetry & Servers)', subtitle: isEs ? 'Estado de servidores, tacómetros y WebSocket' : 'Server health, radial gauges and WebSocket', icon: Cpu },
      { id: 'apis', title: isEs ? 'APIs & Agentes IA' : 'Developer APIs & AI Agents', subtitle: isEs ? 'Llaves maestras y credenciales institucionales' : 'Master keys and institutional credentials', icon: Command }
    ];

    moduleDefs.forEach(m => {
      list.push({
        id: `mod-${m.id}`,
        type: 'module',
        title: m.title,
        subtitle: m.subtitle,
        badge: isEs ? 'Módulo' : 'Module',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: m.icon,
        onSelect: () => {
          onSelectModule(m.id);
          onClose();
        }
      });
    });

    // 2. Traders / Cuentas
    traders.forEach(t => {
      list.push({
        id: `trader-${t.id}`,
        type: 'trader',
        title: t.fullName || t.email,
        subtitle: `${t.email} • Cuenta: ${t.accountNumber} • ${t.role.toUpperCase()}`,
        badge: isEs ? 'Trader' : 'Trader',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: User,
        onSelect: () => {
          onSelectTraderForAudit(t);
          onClose();
        }
      });
    });

    // 3. Modelos de Challenge (Unificados por Modelo de Challenge)
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
        title: bName,
        subtitle: `${siblingTiers.length} ${siblingTiers.length === 1 ? (isEs ? 'Tamaño' : 'Size') : (isEs ? 'Tamaños' : 'Sizes')} (${rangeTag}) • ${mType === 'INSTANT_FUNDING' ? (isEs ? 'Fondeo Directo' : 'Instant') : mType === 'TWO_PHASE' ? (isEs ? '2 Fases' : '2 Phases') : (isEs ? '1 Fase' : '1 Phase')} • ${cat.toUpperCase()}`,
        badge: isEs ? 'Modelo' : 'Plan',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Layers,
        onSelect: () => {
          if (onSelectRule) onSelectRule(r.id);
          onSelectModule('challenges');
          onClose();
        }
      });
    });

    // 4. Solicitudes de Payout
    payouts.forEach(p => {
      list.push({
        id: `payout-${p.id}`,
        type: 'payout',
        title: `Payout #${p.payout_number || 1} • $${Number(p.amount || 0).toLocaleString()} USDT`,
        subtitle: `${p.trader_email} • ${p.status} • Destino: ${p.destination_address.slice(0, 12)}...`,
        badge: p.status,
        badgeColor: p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : p.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200',
        icon: DollarSign,
        onSelect: () => {
          onSelectModule('payouts');
          onClose();
        }
      });
    });

    return list;
  }, [traders, riskRules, payouts, isEs, onSelectModule, onSelectTraderForAudit, onSelectRule, onClose]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 15);
    }
    const q = query.toLowerCase().trim();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

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
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Barra de Entrada Superior con Teclado */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isEs ? 'Buscar traders, cuentas, payouts, retos o módulos... (Ctrl+K)' : 'Search traders, accounts, payouts, challenges or modules... (Ctrl+K)'}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">
                {isEs ? 'No se encontraron resultados para tu búsqueda.' : 'No results found for your search.'}
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
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-slate-950' 
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold truncate">{item.title}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-amber-600' : 'opacity-20'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer con Atajos */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold">↓</kbd> {isEs ? 'Navegar' : 'Navigate'}</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold">↵</kbd> {isEs ? 'Seleccionar' : 'Select'}</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-bold">ESC</kbd> {isEs ? 'Cerrar' : 'Close'}</span>
          </div>
          <span className="font-bold text-slate-400">Eklipse Nexus Search</span>
        </div>
      </div>
    </div>
  );
};
