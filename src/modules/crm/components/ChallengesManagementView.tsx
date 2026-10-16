import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  RiskRuleConfigEntity, 
  ChallengeModelType, 
  MinDailyProfitType,
  PayoutTierStep,
  ChallengeAddon
} from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { crmService } from '../api/crmService';
import { DEFAULT_CHALLENGE_ADDONS } from '../../../data/challengePlans';
import { 
  Trophy, 
  Search, 
  Plus, 
  Save, 
  Sliders, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  Clock, 
  Calendar, 
  DollarSign, 
  Percent, 
  Layers, 
  Star, 
  Trash2, 
  Copy, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Check,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Flame,
  Info,
  Server,
  Gauge,
  Cpu,
  SlidersHorizontal,
  Crosshair,
  Lock,
  Unlock,
  ShieldX,
  Coins,
  Globe,
  CheckSquare,
  Square,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { zytiTradingClient } from '../../../core/trading/gateway/TradingWebSocketClient';
import { apiFetch } from '../../../config/apiGateway';
import { marketSymbolsService, CryptoSymbolInfo } from '../../../services/marketSymbolsService';

interface ChallengesManagementViewProps {
  rules: RiskRuleConfigEntity[];
  activeRuleId?: string | null;
  lang?: CrmLang;
  onSaveRule: (rule: Partial<RiskRuleConfigEntity>) => Promise<any>;
  onSaveRules?: (rules: Partial<RiskRuleConfigEntity>[]) => Promise<RiskRuleConfigEntity[]>;
  onDeleteRule?: (ruleId: string) => Promise<void>;
  onDeleteRules?: (ruleIds: string[]) => Promise<void>;
  onSelectRule?: (ruleId: string) => void;
}

interface SimulatedPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  sizeUnits: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  slPrice: number | null;
  tpPrice: number | null;
  unrealizedPnl: number;
  openedAt: string;
}

interface ValidationLogEntry {
  id: string;
  timestamp: string;
  status: 'ALLOWED' | 'REJECTED' | 'PASSED' | 'BREACHED' | 'WARNING';
  title: string;
  details: string;
}

export interface RuleTestResult {
  ruleType: string;
  status: 'ALLOWED' | 'REJECTED' | 'BREACHED' | 'PASSED' | 'WARNING';
  title: string;
  reason: string;
  serverLatencyMs?: number;
  serverTimestamp?: number;
  testedAt: string;
  meta?: any;
}

export interface ChallengeSizeTier {
  id?: string;
  balance: number;
  oneTimePriceUsdt: number;
  monthlyPriceUsdt: number;
  isPopular?: boolean;
}

export interface ChallengeModelGroup {
  modelKey: string;
  baseName: string;
  category: string;
  modelType: ChallengeModelType;
  primaryRule: RiskRuleConfigEntity;
  rules: RiskRuleConfigEntity[];
  tiers: ChallengeSizeTier[];
  minPrice: number;
  maxPrice: number;
  isDefaultDemo: boolean;
  totalSizes: number;
}

export interface CustomCategoryDef {
  id: string;
  name: string;
  colorKey: string;
}

export const CATEGORY_COLOR_PRESETS = [
  { id: 'amber', name: 'Ámbar / Oro Solar', hex: '#F59E0B', bgBadge: 'bg-amber-100', textBadge: 'text-amber-900', borderBadge: 'border-amber-300', dot: 'bg-amber-500' },
  { id: 'purple', name: 'Púrpura / Lunar', hex: '#8B5CF6', bgBadge: 'bg-purple-100', textBadge: 'text-purple-900', borderBadge: 'border-purple-300', dot: 'bg-purple-500' },
  { id: 'blue', name: 'Azul / Institucional', hex: '#2563EB', bgBadge: 'bg-blue-100', textBadge: 'text-blue-900', borderBadge: 'border-blue-300', dot: 'bg-blue-500' },
  { id: 'emerald', name: 'Esmeralda / DMA Alpha', hex: '#10B981', bgBadge: 'bg-emerald-100', textBadge: 'text-emerald-900', borderBadge: 'border-emerald-300', dot: 'bg-emerald-500' },
  { id: 'cyan', name: 'Cyan / High-Freq', hex: '#06B6D4', bgBadge: 'bg-cyan-100', textBadge: 'text-cyan-900', borderBadge: 'border-cyan-300', dot: 'bg-cyan-500' },
  { id: 'rose', name: 'Rosa / Titanium VIP', hex: '#F43F5E', bgBadge: 'bg-rose-100', textBadge: 'text-rose-900', borderBadge: 'border-rose-300', dot: 'bg-rose-500' },
  { id: 'slate', name: 'Pizarra / Enterprise', hex: '#475569', bgBadge: 'bg-slate-200', textBadge: 'text-slate-900', borderBadge: 'border-slate-400', dot: 'bg-slate-600' }
];

export const STANDARD_ACCOUNT_SIZES = [1000, 2500, 5000, 10000, 25000, 50000, 100000, 200000];

export const getDefaultPricesForBalance = (balance: number) => {
  if (balance <= 1000) return { oneTime: 19, monthly: 12 };
  if (balance <= 2500) return { oneTime: 32, monthly: 19 };
  if (balance <= 5000) return { oneTime: 49, monthly: 29 };
  if (balance <= 10000) return { oneTime: 89, monthly: 49 };
  if (balance <= 25000) return { oneTime: 149, monthly: 79 };
  if (balance <= 50000) return { oneTime: 249, monthly: 129 };
  if (balance <= 100000) return { oneTime: 449, monthly: 219 };
  if (balance <= 200000) return { oneTime: 849, monthly: 399 };
  return { oneTime: Math.round(balance * 0.005), monthly: Math.round(balance * 0.0025) };
};

export const formatAccountSizeTag = (balance: number): string => {
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(balance % 1000000 === 0 ? 0 : 1)}M`;
  if (balance >= 1000) return `${(balance / 1000).toFixed(balance % 1000 === 0 ? 0 : 1)}K`;
  return `${balance}`;
};

export const extractBaseName = (fullName: string): string => {
  if (!fullName) return '';
  let str = fullName.trim();
  str = str.replace(/\s*-\s*(fase|phase)\s*\d+/gi, '').trim();
  str = str.replace(/\s*(\$?\d+[\.,\d]*[kKmM]?|\(\$?[^)]+\))\s*$/g, '').trim();
  return str || fullName.trim();
};

export const getModelKey = (rule: { name?: string; category?: string; model_type?: string }): string => {
  const rawName = rule.name || 'Challenge';
  const bName = extractBaseName(rawName).trim().toLowerCase();
  const cat = (rule.category || (rawName.toLowerCase().includes('lunar') ? 'lunar' : 'solar')).trim().toLowerCase();
  const mType = rule.model_type || 'ONE_PHASE';
  return `${bName}__${cat}__${mType}`;
};

export const getDynamicChallengeName = (baseName: string, balance: number): string => {
  const cleaned = extractBaseName(baseName);
  const tag = formatAccountSizeTag(balance);
  return cleaned ? `${cleaned} ${tag}` : `Challenge ${tag}`;
};

export const getCategoryBadgeStyles = (colorKey?: string) => {
  const match = CATEGORY_COLOR_PRESETS.find(p => p.id === colorKey);
  if (match) return match;
  return CATEGORY_COLOR_PRESETS[0];
};

export const PROFIT_SPLIT_PRESETS = [
  { trader: 50, firm: 50, label: '50/50', tier: 'Inicio' },
  { trader: 60, firm: 40, label: '60/40', tier: 'Micro' },
  { trader: 70, firm: 30, label: '70/30', tier: 'Básico' },
  { trader: 75, firm: 25, label: '75/25', tier: 'Semi-Pro' },
  { trader: 80, firm: 20, label: '80/20', tier: 'Estándar' },
  { trader: 85, firm: 15, label: '85/15', tier: 'Escalado 1' },
  { trader: 90, firm: 10, label: '90/10', tier: 'Premium' },
  { trader: 95, firm: 5,  label: '95/5',  tier: 'VIP Elite' },
  { trader: 100, firm: 0, label: '100/0', tier: '100% Promo' }
];

export const ChallengesManagementView: React.FC<ChallengesManagementViewProps> = ({
  rules,
  activeRuleId,
  lang = 'es',
  onSaveRule,
  onSaveRules,
  onDeleteRule,
  onDeleteRules,
  onSelectRule
}) => {
  const isEs = lang === 'es';
  const isEn = lang === 'en';

  // 1. Estados de Navegación y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterModel, setSelectedFilterModel] = useState<'ALL' | ChallengeModelType>('ALL');
  const [activeTab, setActiveTab] = useState<'rules' | 'simulator'>('rules');
  const [deletedModelKeys, setDeletedModelKeys] = useState<string[]>([]);

  // Categorías personalizadas guardadas en Base de Datos PostgreSQL / Supabase
  const [customCategories, setCustomCategories] = useState<CustomCategoryDef[]>([
    { id: 'solar', name: '☀️ Solar (DMA Futures)', colorKey: 'amber' },
    { id: 'lunar', name: '🌙 Lunar (Meme Titans)', colorKey: 'purple' }
  ]);

  // Cargar categorías reales desde PostgreSQL
  useEffect(() => {
    crmService.getChallengeCategories().then(cats => {
      if (cats && cats.length > 0) {
        setCustomCategories(cats.map(c => ({ id: c.id, name: c.name, colorKey: c.color_key })));
      }
    });
  }, []);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColorKey, setNewCategoryColorKey] = useState('blue');
  const [editingCategory, setEditingCategory] = useState<CustomCategoryDef | null>(null);

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = customCategories.find(c => c.id === slug);
    if (existing) {
      setCategory(slug);
      setIsAddingCategory(false);
      return;
    }
    const newCat: CustomCategoryDef = {
      id: slug,
      name: newCategoryName.trim(),
      colorKey: newCategoryColorKey
    };
    await crmService.saveChallengeCategory({
      id: slug,
      name: newCategoryName.trim(),
      color_key: newCategoryColorKey
    });
    setCustomCategories(prev => [...prev, newCat]);
    setCategory(slug);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleUpdateExistingCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    await crmService.saveChallengeCategory({
      id: editingCategory.id,
      name: editingCategory.name.trim(),
      color_key: editingCategory.colorKey
    });
    setCustomCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory : c));
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (catId: string) => {
    const target = customCategories.find(c => c.id === catId);
    const catName = target ? target.name : catId;
    const confirmMsg = isEs 
      ? `¿Estás seguro de que deseas eliminar la categoría "${catName}"?` 
      : `Are you sure you want to delete category "${catName}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await crmService.deleteChallengeCategory(catId);
    } catch (e) {
      console.warn('Error deleting category from DB:', e);
    }

    setCustomCategories(prev => {
      const remaining = prev.filter(c => c.id !== catId);
      if (category === catId) {
        setCategory(remaining.length > 0 ? remaining[0].id : 'general');
      }
      return remaining;
    });
    setEditingCategory(null);
  };

  // Referencia para scroll horizontal suave de las pestañas de tamaño
  const sizeTabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollSizeTabs = (direction: 'left' | 'right') => {
    if (sizeTabsScrollRef.current) {
      sizeTabsScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
    }
  };

  // Estado del Checkbox de Duración Mínima (Anti-Scalp)
  const [minTradeDurationEnabled, setMinTradeDurationEnabled] = useState(true);

  // Modo de Reparto: 'FIXED' (Split Fijo para todos los retiros) o 'TIERED' (Escalera Progresiva)
  const [payoutSplitMode, setPayoutSplitMode] = useState<'FIXED' | 'TIERED'>('FIXED');

  // Escala Escalonada de Payouts (Independiente por Modelo)
  const [payoutScale, setPayoutScale] = useState<PayoutTierStep[]>([
    { tier: 1, split: 50 },
    { tier: 2, split: 70 },
    { tier: 3, split: 85 }
  ]);

  // Modificadores & Add-Ons del Modelo (Persistidos en PostgreSQL risk_rule_configs.custom_addons)
  const [customAddons, setCustomAddons] = useState<ChallengeAddon[]>(() => [...(DEFAULT_CHALLENGE_ADDONS as any)]);

  // Reglas de la Cuenta Financiada (Fase Live / Retiros)
  const [fundedProfitSplitPercent, setFundedProfitSplitPercent] = useState<number>(80);
  const [fundedMaxDailyLossPercent, setFundedMaxDailyLossPercent] = useState<number>(5.0);
  const [fundedMaxTotalLossPercent, setFundedMaxTotalLossPercent] = useState<number>(10.0);
  const [firstPayoutDays, setFirstPayoutDays] = useState<number>(14);
  const [payoutFrequencyDays, setPayoutFrequencyDays] = useState<number>(14);

  // Catálogo y Selección de Activos Cripto de Binance (Futures USDT)
  const [allowedSymbols, setAllowedSymbols] = useState<string[]>([]);
  const [availableSymbols, setAvailableSymbols] = useState<CryptoSymbolInfo[]>([]);
  const [isSyncingSymbols, setIsSyncingSymbols] = useState<boolean>(false);
  const [symbolSearchQuery, setSymbolSearchQuery] = useState<string>('');
  const [symbolCategoryFilter, setSymbolCategoryFilter] = useState<'ALL' | 'MEME' | 'MAJOR' | 'DEFI' | 'AI' | 'LAYER1'>('ALL');
  const [isAssetSelectorExpanded, setIsAssetSelectorExpanded] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => marketSymbolsService.getRecentSearches());

  // Carga inicial del catálogo de Binance (0ms desde caché local)
  useEffect(() => {
    marketSymbolsService.getAvailableSymbols().then(syms => {
      setAvailableSymbols(syms);
    });
  }, []);

  const handleSyncBinanceSymbols = async () => {
    setIsSyncingSymbols(true);
    try {
      const updated = await marketSymbolsService.syncFromBinance();
      setAvailableSymbols(updated);
      setRecentSearches(marketSymbolsService.getRecentSearches());
    } catch (e) {
      console.error('Error syncing Binance symbols:', e);
    } finally {
      setIsSyncingSymbols(false);
    }
  };

  // Filtrado reactivo de activos cripto acelerado por índice y caché en memoria (0ms)
  const filteredCryptoSymbols = useMemo(() => {
    return marketSymbolsService.searchSymbols(symbolSearchQuery, symbolCategoryFilter);
  }, [availableSymbols, symbolCategoryFilter, symbolSearchQuery]);

  useEffect(() => {
    if (symbolSearchQuery.trim().length >= 2) {
      setRecentSearches(marketSymbolsService.getRecentSearches());
    }
  }, [symbolSearchQuery]);

  const toggleSymbolSelection = (sym: string) => {
    setAllowedSymbols(prev => {
      if (prev.includes(sym)) {
        return prev.filter(s => s !== sym);
      } else {
        return [...prev, sym];
      }
    });
  };

  const selectAllFilteredSymbols = () => {
    const symsToAdd = filteredCryptoSymbols.map(s => s.symbol);
    setAllowedSymbols(prev => {
      const set = new Set([...prev, ...symsToAdd]);
      return Array.from(set);
    });
  };

  const deselectAllFilteredSymbols = () => {
    const symsToRemove = new Set(filteredCryptoSymbols.map(s => s.symbol));
    setAllowedSymbols(prev => prev.filter(s => !symsToRemove.has(s)));
  };

  const clearSymbolSelection = () => {
    setAllowedSymbols([]);
  };

  const deselectAllSymbols = clearSymbolSelection;

  const selectedFilteredCount = useMemo(() => {
    const allowedSet = new Set(allowedSymbols);
    return filteredCryptoSymbols.filter(s => allowedSet.has(s.symbol)).length;
  }, [filteredCryptoSymbols, allowedSymbols]);

  const applyPresetSymbols = (preset: 'ALL' | 'MAJORS' | 'MEMES' | 'DEFI' | 'AI') => {
    if (preset === 'ALL') {
      setAllowedSymbols([]);
      return;
    }
    const syms = marketSymbolsService.getPresetSymbols(preset);
    setAllowedSymbols(syms);
  };

  // 2. Regla y Modelo Seleccionado para Edición Unificada
  const [selectedRule, setSelectedRule] = useState<RiskRuleConfigEntity | null>(null);
  const [selectedModelKey, setSelectedModelKey] = useState<string>('');
  const [deletedTierIds, setDeletedTierIds] = useState<string[]>([]);

  // 3. Campos del Formulario de la Regla en Edición
  const [baseName, setBaseName] = useState('Solar Eclipse');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('solar');
  const [sizeTiers, setSizeTiers] = useState<ChallengeSizeTier[]>([
    { balance: 50000, oneTimePriceUsdt: 249, monthlyPriceUsdt: 129, isPopular: true }
  ]);
  const [activeSizeTierIndex, setActiveSizeTierIndex] = useState(0);
  const [enableMonthlySubscription, setEnableMonthlySubscription] = useState(false);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [manualSizeInput, setManualSizeInput] = useState(15000);

  const [oneTimePriceUsdt, setOneTimePriceUsdt] = useState<number>(149);
  const [monthlyPriceUsdt, setMonthlyPriceUsdt] = useState<number>(79);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [modelType, setModelType] = useState<ChallengeModelType>('ONE_PHASE');
  const [defaultAccountBalance, setDefaultAccountBalance] = useState(100000);
  const [isDefaultDemo, setIsDefaultDemo] = useState(false);
  const [drawdownType, setDrawdownType] = useState<'EOD' | 'TRAILING_EQUITY'>('EOD');
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(5.0);
  const [maxTotalDrawdownPercent, setMaxTotalDrawdownPercent] = useState(10.0);
  const [profitTargetPercent, setProfitTargetPercent] = useState(10.0);
  const [profitTargetPhase2Percent, setProfitTargetPhase2Percent] = useState(5.0);
  const [minTradingDays, setMinTradingDays] = useState(5);
  const [minDailyProfitType, setMinDailyProfitType] = useState<MinDailyProfitType>('PERCENT');
  const [minDailyProfitValue, setMinDailyProfitValue] = useState(0.5);
  const [maxLeverage, setMaxLeverage] = useState(50);
  const [mandatoryStopLoss, setMandatoryStopLoss] = useState(false);
  const [maxPositionsPerSymbolEnabled, setMaxPositionsPerSymbolEnabled] = useState(false);
  const [maxPositionsPerSymbol, setMaxPositionsPerSymbol] = useState(2);
  const [maxTotalOpenPositionsEnabled, setMaxTotalOpenPositionsEnabled] = useState(false);
  const [maxTotalOpenPositions, setMaxTotalOpenPositions] = useState(5);
  const [antiHedgingEnabled, setAntiHedgingEnabled] = useState(false);
  const [consistencyRulePercent, setConsistencyRulePercent] = useState(40.0);
  const [weekendHoldingAllowed, setWeekendHoldingAllowed] = useState(true);
  const [newsTradingAllowed, setNewsTradingAllowed] = useState(true);
  const [minTradeDurationSeconds, setMinTradeDurationSeconds] = useState(10);
  const [profitSplitPercent, setProfitSplitPercent] = useState(80);
  const [inactivityDaysLimit, setInactivityDaysLimit] = useState(30);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Agrupar todas las reglas por Modelo de Challenge (Unificación de tamaños por modelo)
  const groupedChallengeModels = useMemo<ChallengeModelGroup[]>(() => {
    if (!rules || rules.length === 0) {
      return [];
    }

    const groupsMap = new Map<string, ChallengeModelGroup>();

    for (const rule of rules) {
      const key = getModelKey(rule);
      const rawName = rule.name || 'Challenge';
      const bName = extractBaseName(rawName);
      const cat = (rule.category || (rawName.toLowerCase().includes('lunar') ? 'lunar' : 'solar')).trim().toLowerCase();
      const mType = rule.model_type || 'ONE_PHASE';

      const bal = Number(rule.default_account_balance || 100000);
      const oneTime = Number(rule.one_time_price_usdt !== undefined ? rule.one_time_price_usdt : getDefaultPricesForBalance(bal).oneTime);
      const monthly = Number(rule.monthly_price_usdt !== undefined ? rule.monthly_price_usdt : getDefaultPricesForBalance(bal).monthly);

      const tier: ChallengeSizeTier = {
        id: rule.id,
        balance: bal,
        oneTimePriceUsdt: oneTime,
        monthlyPriceUsdt: monthly,
        isPopular: !!rule.is_popular
      };

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          modelKey: key,
          baseName: bName,
          category: cat,
          modelType: mType,
          primaryRule: rule,
          rules: [rule],
          tiers: [tier],
          minPrice: oneTime,
          maxPrice: oneTime,
          isDefaultDemo: !!rule.is_default_demo,
          totalSizes: 1
        });
      } else {
        const group = groupsMap.get(key)!;
        group.rules.push(rule);
        if (!group.tiers.some(t => t.balance === bal)) {
          group.tiers.push(tier);
        }
        if (rule.is_default_demo) group.isDefaultDemo = true;
        if (rule.is_default_demo || (!group.primaryRule.is_default_demo && (bal === 50000 || bal === 100000))) {
          group.primaryRule = rule;
        }
        group.minPrice = Math.min(group.minPrice, oneTime);
        group.maxPrice = Math.max(group.maxPrice, oneTime);
        group.totalSizes = group.tiers.length;
      }
    }

    for (const group of groupsMap.values()) {
      group.tiers.sort((a, b) => a.balance - b.balance);
      group.totalSizes = group.tiers.length;
    }

    return Array.from(groupsMap.values()).filter(g => !deletedModelKeys.includes(g.modelKey));
  }, [rules, deletedModelKeys]);

  // Filtrado de Modelos con el Buscador
  const filteredModelGroups = useMemo(() => {
    return groupedChallengeModels.filter(group => {
      const matchSearch = searchQuery === '' || 
        group.baseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tiers.some(t => String(t.balance).includes(searchQuery));

      const matchModel = selectedFilterModel === 'ALL' || 
        group.modelType === selectedFilterModel;

      return matchSearch && matchModel;
    });
  }, [groupedChallengeModels, searchQuery, selectedFilterModel]);

  // Selección unificada de un Modelo de Challenge completo
  const handleSelectModelGroup = useCallback((group: ChallengeModelGroup) => {
    setSelectedModelKey(group.modelKey);
    setSelectedRule(group.primaryRule);
    if (onSelectRule) onSelectRule(group.primaryRule.id);

    setBaseName(group.baseName);
    setCategory(group.category);
    setModelType(group.modelType);

    const sortedTiers = [...group.tiers].sort((a, b) => a.balance - b.balance);
    setSizeTiers(sortedTiers);

    const popularIdx = sortedTiers.findIndex(t => t.isPopular);
    const activeIdx = popularIdx >= 0 ? popularIdx : Math.min(sortedTiers.length - 1, 0);
    setActiveSizeTierIndex(activeIdx);

    const activeTier = sortedTiers[activeIdx] || sortedTiers[0];
    if (activeTier) {
      setDefaultAccountBalance(activeTier.balance);
      setOneTimePriceUsdt(activeTier.oneTimePriceUsdt);
      setMonthlyPriceUsdt(activeTier.monthlyPriceUsdt);
      setIsPopular(!!activeTier.isPopular);
      setEnableMonthlySubscription(Number(activeTier.monthlyPriceUsdt) > 0);
      setName(getDynamicChallengeName(group.baseName, activeTier.balance));
    }

    const r = group.primaryRule;
    setIsDefaultDemo(!!group.isDefaultDemo);
    setDrawdownType(r.drawdown_type || 'EOD');
    setMaxDailyLossPercent(Number(r.max_daily_loss_percent || 5.0));
    setMaxTotalDrawdownPercent(Number(r.max_total_drawdown_percent || 10.0));
    setProfitTargetPercent(Number(r.profit_target_percent || 10.0));
    setProfitTargetPhase2Percent(Number(r.profit_target_phase2_percent || 5.0));
    setMinTradingDays(Number(r.min_trading_days || 5));
    setMinDailyProfitType(r.min_daily_profit_type || 'PERCENT');
    setMinDailyProfitValue(Number(r.min_daily_profit_value ?? 0.5));
    setMaxLeverage(Number(r.max_leverage || 50));
    setMandatoryStopLoss(!!r.mandatory_stop_loss);
    setMaxPositionsPerSymbolEnabled(!!r.max_positions_per_symbol_enabled);
    setMaxPositionsPerSymbol(Number(r.max_positions_per_symbol || 2));
    setMaxTotalOpenPositionsEnabled(!!r.max_total_open_positions_enabled);
    setMaxTotalOpenPositions(Number(r.max_total_open_positions || 5));
    setAntiHedgingEnabled(!!r.anti_hedging_enabled);
    setConsistencyRulePercent(Number(r.consistency_rule_percent || 40.0));
    setWeekendHoldingAllowed(r.weekend_holding_allowed !== false);
    setNewsTradingAllowed(r.news_trading_allowed !== false);
    setMinTradeDurationSeconds(Number(r.min_trade_duration_seconds || 10));
    const mode = r.payout_split_mode || (r.payout_scale && r.payout_scale.length > 0 ? 'TIERED' : 'FIXED');
    setPayoutSplitMode(mode);
    if (r.payout_scale && Array.isArray(r.payout_scale) && r.payout_scale.length > 0) {
      setPayoutScale(r.payout_scale);
    } else {
      setPayoutScale([
        { tier: 1, split: 50 },
        { tier: 2, split: 70 },
        { tier: 3, split: 85 }
      ]);
    }
    setProfitSplitPercent(Number(r.profit_split_percent || 80));

    // Reglas de la Cuenta Financiada (Live Stage)
    setFundedProfitSplitPercent(Number(r.funded_profit_split_percent ?? r.profit_split_percent ?? 80));
    setFundedMaxDailyLossPercent(r.funded_max_daily_loss_percent !== undefined && r.funded_max_daily_loss_percent !== null ? Number(r.funded_max_daily_loss_percent) : Number(r.max_daily_loss_percent || 5.0));
    setFundedMaxTotalLossPercent(r.funded_max_total_loss_percent !== undefined && r.funded_max_total_loss_percent !== null ? Number(r.funded_max_total_loss_percent) : Number(r.max_total_drawdown_percent || 10.0));
    setFirstPayoutDays(Number(r.first_payout_days || 14));
    setPayoutFrequencyDays(Number(r.payout_frequency_days || 14));

    // Activos Cripto de Binance Permitidos
    setAllowedSymbols(Array.isArray(r.allowed_symbols) ? r.allowed_symbols : []);

    // Modificadores & Add-Ons del Modelo
    const modelAddons: ChallengeAddon[] = Array.isArray(r.custom_addons) && r.custom_addons.length > 0
      ? r.custom_addons
      : [...(DEFAULT_CHALLENGE_ADDONS as any)];
    setCustomAddons(modelAddons);

    setInactivityDaysLimit(Number(r.inactivity_days_limit || 30));
    setDeletedTierIds([]);
  }, [onSelectRule]);

  // Inicializar o sincronizar el modelo de challenge seleccionado
  useEffect(() => {
    if (groupedChallengeModels.length === 0) return;

    if (!selectedModelKey) {
      if (activeRuleId) {
        const found = groupedChallengeModels.find(g => g.rules.some(r => r.id === activeRuleId));
        if (found) {
          handleSelectModelGroup(found);
          return;
        }
      }
      const demo = groupedChallengeModels.find(g => g.isDefaultDemo) || groupedChallengeModels[0];
      handleSelectModelGroup(demo);
    } else {
      const existing = groupedChallengeModels.find(g => g.modelKey === selectedModelKey);
      if (existing) {
        setSelectedRule(existing.primaryRule);
      }
    }
  }, [groupedChallengeModels, activeRuleId, selectedModelKey, handleSelectModelGroup]);

  // Modelo de Challenge activo actualmente
  const activeGroup = useMemo(() => {
    return groupedChallengeModels.find(g => g.modelKey === selectedModelKey) ||
      groupedChallengeModels.find(g => 
        g.baseName.toLowerCase() === baseName.toLowerCase() &&
        g.category === category &&
        g.modelType === modelType
      ) || groupedChallengeModels[0];
  }, [groupedChallengeModels, selectedModelKey, baseName, category, modelType]);

  // Manejo de Tiers de Tamaño de Cuenta
  const handleSelectSizeTab = (idx: number) => {
    if (idx < 0 || idx >= sizeTiers.length) return;
    setActiveSizeTierIndex(idx);
    const tier = sizeTiers[idx];
    setDefaultAccountBalance(tier.balance);
    setOneTimePriceUsdt(tier.oneTimePriceUsdt);
    setMonthlyPriceUsdt(tier.monthlyPriceUsdt);
    setIsPopular(!!tier.isPopular);
    setName(getDynamicChallengeName(baseName, tier.balance));
  };

  const handleUpdateActiveTierPrice = (field: 'oneTimePriceUsdt' | 'monthlyPriceUsdt' | 'isPopular' | 'balance', val: any) => {
    if (field === 'oneTimePriceUsdt') setOneTimePriceUsdt(Number(val));
    if (field === 'monthlyPriceUsdt') setMonthlyPriceUsdt(Number(val));
    if (field === 'isPopular') setIsPopular(Boolean(val));
    if (field === 'balance') {
      setDefaultAccountBalance(Number(val));
      setName(getDynamicChallengeName(baseName, Number(val)));
    }

    setSizeTiers(prev => {
      const copy = [...prev];
      if (copy[activeSizeTierIndex]) {
        copy[activeSizeTierIndex] = {
          ...copy[activeSizeTierIndex],
          [field]: val
        };
      }
      return copy;
    });
  };

  const handleAddStandardSize = (balance: number) => {
    if (sizeTiers.some(t => t.balance === balance)) {
      const idx = sizeTiers.findIndex(t => t.balance === balance);
      handleSelectSizeTab(idx);
      return;
    }
    const def = getDefaultPricesForBalance(balance);
    const newTier: ChallengeSizeTier = {
      balance,
      oneTimePriceUsdt: def.oneTime,
      monthlyPriceUsdt: def.monthly,
      isPopular: false
    };
    const updated = [...sizeTiers, newTier].sort((a, b) => a.balance - b.balance);
    setSizeTiers(updated);
    const newIdx = updated.findIndex(t => t.balance === balance);
    setActiveSizeTierIndex(newIdx);
    setDefaultAccountBalance(balance);
    setOneTimePriceUsdt(def.oneTime);
    setMonthlyPriceUsdt(def.monthly);
    setIsPopular(false);
    setName(getDynamicChallengeName(baseName, balance));
  };

  const handleAddCustomSize = (amount: number) => {
    if (!amount || amount <= 0 || isNaN(amount)) return;
    handleAddStandardSize(amount);
    setShowAddSizeModal(false);
  };

  const handleRemoveSizeTier = (idx: number) => {
    if (sizeTiers.length <= 1) return;
    const removedTier = sizeTiers[idx];
    if (removedTier && removedTier.id) {
      setDeletedTierIds(prev => [...prev, removedTier.id!]);
    }
    const updated = sizeTiers.filter((_, i) => i !== idx);
    setSizeTiers(updated);
    const nextIdx = Math.max(0, Math.min(activeSizeTierIndex, updated.length - 1));
    setActiveSizeTierIndex(nextIdx);
    const nextTier = updated[nextIdx];
    if (nextTier) {
      setDefaultAccountBalance(nextTier.balance);
      setOneTimePriceUsdt(nextTier.oneTimePriceUsdt);
      setMonthlyPriceUsdt(nextTier.monthlyPriceUsdt);
      setIsPopular(!!nextTier.isPopular);
      setName(getDynamicChallengeName(baseName, nextTier.balance));
    }
  };

  // Ajustadores dinámicos del Profit Split
  const handleUpdateProfitSplit = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.min(100, Math.max(1, Math.round(val)));
    setProfitSplitPercent(clamped);
  };

  const handleStepProfitSplit = (delta: number) => {
    setProfitSplitPercent(prev => Math.min(100, Math.max(1, Math.round(prev + delta))));
  };

  // 5. ESTADO DEL SIMULADOR EN VIVO (RULE SANDBOX & STRESS ENGINE)
  const [simBalance, setSimBalance] = useState(100000);
  const [simManualStressPct, setSimManualStressPct] = useState(0); // Slider interactivo -25% a +25%
  const [simDailyStartEquity, setSimDailyStartEquity] = useState(100000);
  const [simPeakEquity, setSimPeakEquity] = useState(100000);
  const [simTradingDays, setSimTradingDays] = useState(1);
  const [simPositions, setSimPositions] = useState<SimulatedPosition[]>([]);
  const simPositionsRef = useRef<SimulatedPosition[]>(simPositions);
  simPositionsRef.current = simPositions;

  // 4. PRECIOS DEL SIMULADOR (Modo manual bajo demanda — Sin WebSockets ni intervalos automáticos de fondo)
  const livePricesRef = useRef<Record<string, number>>({
    BTCUSDT: 68420.50,
    ETHUSDT: 3512.20,
    SOLUSDT: 148.80
  });

  const [livePrices, setLivePrices] = useState<Record<string, number>>(livePricesRef.current);
  const [isSyncingPrices, setIsSyncingPrices] = useState<boolean>(false);

  const handleManualRefreshPrices = useCallback(async () => {
    setIsSyncingPrices(true);
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22%5D');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const newPrices: Record<string, number> = { ...livePricesRef.current };
          data.forEach((item: any) => {
            if (item.symbol && item.price) {
              newPrices[item.symbol] = parseFloat(item.price);
            }
          });
          livePricesRef.current = newPrices;
          setLivePrices(newPrices);
        }
      }
    } catch (err) {
      console.warn('[CRM Sandbox] Error fetching manual ticker prices:', err);
    } finally {
      setIsSyncingPrices(false);
    }
  }, []);

  const [simStatus, setSimStatus] = useState<'ACTIVE' | 'WARNING' | 'BREACHED' | 'PASSED'>('ACTIVE');
  const [simBreachReason, setSimBreachReason] = useState<string | null>(null);

  // Estados de la Suite de Pruebas Regla por Regla
  const [testingRuleType, setTestingRuleType] = useState<string | null>(null);
  const [ruleTestResults, setRuleTestResults] = useState<Record<string, RuleTestResult>>({});
  const [serverConnectionStatus, setServerConnectionStatus] = useState<'ONLINE_DAEMON' | 'OFFLINE_LOCAL'>('ONLINE_DAEMON');

  const [auditLogs, setAuditLogs] = useState<ValidationLogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      status: 'ALLOWED',
      title: 'Sandbox & Risk Daemon Conectados',
      details: 'Motor de pruebas conectado al feed de mercado 24/7 y al servidor institucional.'
    }
  ]);

  // Actualizar balance del simulador cuando cambia el preset
  useEffect(() => {
    if (selectedRule) {
      const bal = Number(selectedRule.default_account_balance || 100000);
      setSimBalance(bal);
      setSimDailyStartEquity(bal);
      setSimPeakEquity(bal);
      setSimManualStressPct(0);
      setSimPositions([]);
      setSimTradingDays(0);
      setSimStatus('ACTIVE');
      setSimBreachReason(null);
      setRuleTestResults({});
    }
  }, [selectedRule?.id]);

  // Orden a Probar en el Simulador
  const [simOrderSymbol, setSimOrderSymbol] = useState<'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT'>('BTCUSDT');
  const [simOrderSide, setSimOrderSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [simOrderLeverage, setSimOrderLeverage] = useState(20);
  const [simOrderUnits, setSimOrderUnits] = useState(0.5);
  const [simOrderHasSl, setSimOrderHasSl] = useState(true);
  const [simOrderSlDistancePct, setSimOrderSlDistancePct] = useState(1.5);
  const [simOrderHasTp, setSimOrderHasTp] = useState(true);
  const [simOrderTpDistancePct, setSimOrderTpDistancePct] = useState(3.0);

  // Cálculos dinámicos de SL y TP según el precio actual
  const currentSymbolPrice = livePrices[simOrderSymbol] || (simOrderSymbol === 'BTCUSDT' ? 68000 : 3500);
  const calculatedSlPrice = useMemo(() => {
    if (!simOrderHasSl) return null;
    const factor = simOrderSide === 'LONG' ? (1 - simOrderSlDistancePct / 100) : (1 + simOrderSlDistancePct / 100);
    return Number((currentSymbolPrice * factor).toFixed(2));
  }, [currentSymbolPrice, simOrderSide, simOrderHasSl, simOrderSlDistancePct]);

  const calculatedTpPrice = useMemo(() => {
    if (!simOrderHasTp) return null;
    const factor = simOrderSide === 'LONG' ? (1 + simOrderTpDistancePct / 100) : (1 - simOrderTpDistancePct / 100);
    return Number((currentSymbolPrice * factor).toFixed(2));
  }, [currentSymbolPrice, simOrderSide, simOrderHasTp, simOrderTpDistancePct]);

  // 6. Motor Reactivo de Equidad y PnL en el Simulador (Con Integración de Slider de Estrés)
  const positionsFloatingPnl = useMemo(() => {
    return simPositions.reduce((acc, pos) => {
      const liveP = livePrices[pos.symbol] || pos.currentPrice;
      const diff = pos.side === 'LONG' ? (liveP - pos.entryPrice) : (pos.entryPrice - liveP);
      return acc + (diff * pos.sizeUnits);
    }, 0);
  }, [simPositions, livePrices]);

  // Estrés manual en USD derivado del Slider (-25% a +25%)
  const manualStressUsd = useMemo(() => {
    return Number(((simBalance * simManualStressPct) / 100).toFixed(2));
  }, [simBalance, simManualStressPct]);

  const totalFloatingPnl = Number((positionsFloatingPnl + manualStressUsd).toFixed(2));
  const simEquity = Number((simBalance + totalFloatingPnl).toFixed(2));

  // Actualizar Peak Equity
  useEffect(() => {
    if (simEquity > simPeakEquity) {
      setSimPeakEquity(simEquity);
    }
  }, [simEquity, simPeakEquity]);

  // Cálculos de Drawdowns en el Simulador
  const simDailyBase = drawdownType === 'TRAILING_EQUITY' ? simPeakEquity : simDailyStartEquity;
  const simDailyLossUsd = Math.max(0, simDailyBase - simEquity);
  const simDailyLossPct = simDailyBase > 0 ? Number(((simDailyLossUsd / simDailyBase) * 100).toFixed(2)) : 0;

  const simTotalLossUsd = Math.max(0, defaultAccountBalance - simEquity);
  const simTotalLossPct = defaultAccountBalance > 0 ? Number(((simTotalLossUsd / defaultAccountBalance) * 100).toFixed(2)) : 0;

  const simProfitUsd = simEquity - defaultAccountBalance;
  const simProfitPct = defaultAccountBalance > 0 ? Number(((simProfitUsd / defaultAccountBalance) * 100).toFixed(2)) : 0;

  // Evaluación Continua de Infracción (Breach) o Aprobación (Passed) en el Simulador
  useEffect(() => {
    if (simStatus === 'BREACHED' || simStatus === 'PASSED') return;

    // 1. Verificar Drawdown Diario
    if (maxDailyLossPercent > 0 && simDailyLossPct >= maxDailyLossPercent) {
      setSimStatus('BREACHED');
      const reason = `Drawdown diario excedido (${simDailyLossPct.toFixed(2)}% >= ${maxDailyLossPercent}%)`;
      setSimBreachReason(reason);
      setSimPositions([]); // Auto-cierre de emergencia
      setAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          status: 'BREACHED',
          title: '🚨 HARD BREACH: CUENTA DESCALIFICADA',
          details: reason
        },
        ...prev
      ]);
      return;
    }

    // 2. Verificar Drawdown Total
    if (maxTotalDrawdownPercent > 0 && simTotalLossPct >= maxTotalDrawdownPercent) {
      setSimStatus('BREACHED');
      const reason = `Drawdown total acumulado excedido (${simTotalLossPct.toFixed(2)}% >= ${maxTotalDrawdownPercent}%)`;
      setSimBreachReason(reason);
      setSimPositions([]); // Auto-cierre
      setAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          status: 'BREACHED',
          title: '🚨 HARD BREACH: CUENTA DESCALIFICADA',
          details: reason
        },
        ...prev
      ]);
      return;
    }

    // 3. Verificar Aprobación (PASSED)
    if (modelType !== 'INSTANT_FUNDING' && profitTargetPercent > 0) {
      if (simProfitPct >= profitTargetPercent && simTradingDays >= minTradingDays) {
        setSimStatus('PASSED');
        setAuditLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASSED',
            title: '🎉 CHALLENGE APROBADO (PASSED)',
            details: `Meta alcanzada: +${simProfitPct}% con ${simTradingDays} días operados calificados.`
          },
          ...prev
        ]);
        return;
      }
    }

    // 4. Estado Preventivo WARNING
    if (simDailyLossPct >= maxDailyLossPercent * 0.8 || simTotalLossPct >= maxTotalDrawdownPercent * 0.8) {
      setSimStatus('WARNING');
    } else {
      setSimStatus('ACTIVE');
    }
  }, [
    simDailyLossPct, 
    simTotalLossPct, 
    simProfitPct, 
    simTradingDays, 
    maxDailyLossPercent, 
    maxTotalDrawdownPercent, 
    profitTargetPercent, 
    minTradingDays, 
    modelType, 
    simStatus
  ]);

  // 7. FUNCIÓN DE VALIDACIÓN PRE-TRADE EN CLIENTE (Simulador)
  const validatePreTradeOrder = (): { allowed: boolean; reason?: string } => {
    if (simStatus === 'BREACHED') {
      return { allowed: false, reason: `Cuenta descalificada por infracción: ${simBreachReason}` };
    }
    if (simStatus === 'PASSED') {
      return { allowed: false, reason: 'Evaluación ya aprobada (PASSED). No se permiten nuevas órdenes en esta fase.' };
    }

    // Stop Loss Obligatorio
    if (mandatoryStopLoss && (!calculatedSlPrice || calculatedSlPrice <= 0)) {
      return { allowed: false, reason: 'Stop Loss Obligatorio: La regla exige definir SL antes de enviar la orden.' };
    }

    // Apalancamiento Máximo
    if (simOrderLeverage > maxLeverage) {
      return { allowed: false, reason: `Apalancamiento solicitado (${simOrderLeverage}x) excede el máximo permitido (${maxLeverage}x).` };
    }

    // Límite Total de Operaciones Abiertas
    if (maxTotalOpenPositionsEnabled && simPositions.length >= maxTotalOpenPositions) {
      return { allowed: false, reason: `Límite total de operaciones abiertas alcanzado (Máx: ${maxTotalOpenPositions}).` };
    }

    // Límite de Operaciones por Activo
    if (maxPositionsPerSymbolEnabled) {
      const currentInSym = simPositions.filter(p => p.symbol === simOrderSymbol).length;
      if (currentInSym >= maxPositionsPerSymbol) {
        return { allowed: false, reason: `Límite de operaciones en ${simOrderSymbol} alcanzado (Máx: ${maxPositionsPerSymbol}).` };
      }
    }

    // Regla Anti-Hedging
    if (antiHedgingEnabled) {
      const oppositeSide = simOrderSide === 'LONG' ? 'SHORT' : 'LONG';
      const hasOpposite = simPositions.some(p => p.symbol === simOrderSymbol && p.side === oppositeSide);
      if (hasOpposite) {
        return { allowed: false, reason: `Violación Anti-Hedging: Ya tienes una posición ${oppositeSide} abierta en ${simOrderSymbol}.` };
      }
    }

    return { allowed: true };
  };

  // Botón "Test Pre-Trade"
  const handleTestPreTradeValidation = () => {
    const result = validatePreTradeOrder();
    const entry: ValidationLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      status: result.allowed ? 'ALLOWED' : 'REJECTED',
      title: result.allowed ? 'Pre-Trade Aprobado (Clean)' : 'Pre-Trade Rechazado (Soft Breach)',
      details: result.allowed 
        ? `Orden ${simOrderSide} ${simOrderUnits} en ${simOrderSymbol} (${simOrderLeverage}x) cumple todas las reglas.` 
        : result.reason || 'Orden denegada.'
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 49)]);
  };

  // Botón "Ejecutar Orden Simulada"
  const handleExecuteSimulatedOrder = () => {
    const check = validatePreTradeOrder();
    if (!check.allowed) {
      handleTestPreTradeValidation();
      return;
    }

    const newPos: SimulatedPosition = {
      id: `sim-pos-${Date.now()}`,
      symbol: simOrderSymbol,
      side: simOrderSide,
      sizeUnits: simOrderUnits,
      entryPrice: currentSymbolPrice,
      currentPrice: currentSymbolPrice,
      leverage: simOrderLeverage,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      unrealizedPnl: 0,
      openedAt: new Date().toLocaleTimeString()
    };

    setSimPositions(prev => [newPos, ...prev]);

    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'ALLOWED',
        title: `Posición Abierta: ${simOrderSide} ${simOrderUnits} ${simOrderSymbol}`,
        details: `Entrada a $${currentSymbolPrice.toLocaleString()} | SL: ${calculatedSlPrice ? `$${calculatedSlPrice}` : 'None'} | TP: ${calculatedTpPrice ? `$${calculatedTpPrice}` : 'None'}`
      },
      ...prev.slice(0, 49)
    ]);
  };

  // Cierre de Posición Simulada
  const handleCloseSimPosition = (posId: string) => {
    const pos = simPositions.find(p => p.id === posId);
    if (!pos) return;

    const liveP = livePrices[pos.symbol] || pos.currentPrice;
    const diff = pos.side === 'LONG' ? (liveP - pos.entryPrice) : (pos.entryPrice - liveP);
    const realized = Number((diff * pos.sizeUnits).toFixed(2));

    const newBal = Number((simBalance + realized).toFixed(2));
    setSimBalance(newBal);
    setSimPositions(prev => prev.filter(p => p.id !== posId));

    // Regla de Día Calificado (min_daily_profit_value)
    const minRequiredUsd = minDailyProfitType === 'AMOUNT' 
      ? minDailyProfitValue 
      : (defaultAccountBalance * minDailyProfitValue) / 100;

    let dayCounted = false;
    if (minDailyProfitValue > 0) {
      if (realized >= minRequiredUsd) {
        setSimTradingDays(prev => prev + 1);
        dayCounted = true;
      }
    } else if (realized > 0) {
      setSimTradingDays(prev => prev + 1);
      dayCounted = true;
    }

    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        status: realized >= 0 ? 'ALLOWED' : 'WARNING',
        title: `Posición Cerrada: PnL Realizado ${realized >= 0 ? `+$${realized}` : `-$${Math.abs(realized)}`}`,
        details: dayCounted 
          ? `Día calificado sumado (#${simTradingDays + 1}). Beneficio >= umbral ($${minRequiredUsd.toFixed(2)}).`
          : `Cierre registrado. No califica para día de trading (Mínimo requerido: $${minRequiredUsd.toFixed(2)}).`
      },
      ...prev.slice(0, 49)
    ]);
  };

  // Reset del Simulador
  const handleResetSimulator = () => {
    setSimBalance(defaultAccountBalance);
    setSimDailyStartEquity(defaultAccountBalance);
    setSimPeakEquity(defaultAccountBalance);
    setSimManualStressPct(0);
    setSimPositions([]);
    setSimTradingDays(0);
    setSimStatus('ACTIVE');
    setSimBreachReason(null);
    setRuleTestResults({});
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'ALLOWED',
        title: 'Sandbox Reiniciado',
        details: `Balance restablecido a $${defaultAccountBalance.toLocaleString()} y estrés reseteado a 0%.`
      },
      ...prev.slice(0, 49)
    ]);
  };

  // Simular Rollover UTC (Cambio de Día)
  const handleSimulateRollover = () => {
    const newBase = simEquity;
    setSimDailyStartEquity(newBase);
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'ALLOWED',
        title: '🌙 Rollover 00:00 UTC Simulado',
        details: `Nueva Base Hoy establecida en $${newBase.toLocaleString()}. Drawdown diario reiniciado a 0%.`
      },
      ...prev.slice(0, 49)
    ]);
  };

  // Motor de Evaluación Local Fallback (en caso de que el server WebSocket/HTTP tarde o esté desconectado)
  const evaluateRuleClientFallback = (
    ruleType: string,
    ruleConfig: any,
    accountState: any,
    testPayload: any = {}
  ): any => {
    const initialBalance = Number(accountState.initialBalance || ruleConfig.defaultAccountBalance || 100000);
    const balance = Number(accountState.balance !== undefined ? accountState.balance : initialBalance);
    const equity = Number(accountState.equity !== undefined ? accountState.equity : balance);
    const dailyStartEquity = Number(accountState.dailyStartEquity !== undefined ? accountState.dailyStartEquity : initialBalance);
    const peakEquity = Number(accountState.peakEquity !== undefined ? accountState.peakEquity : Math.max(initialBalance, equity));

    switch (ruleType) {
      case 'MAX_DAILY_DRAWDOWN': {
        const limitPct = Number(ruleConfig.maxDailyLossPercent || 5.0);
        const drawdownType = ruleConfig.drawdownType || 'EOD';
        const base = drawdownType === 'TRAILING_EQUITY' ? peakEquity : dailyStartEquity;
        const lossUsd = Math.max(0, base - equity);
        const currentLossPct = base > 0 ? (lossUsd / base) * 100 : 0;
        const passed = currentLossPct < limitPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'MAX_DAILY_DRAWDOWN',
          title: passed ? 'Pérdida Diaria Dentro de Límites' : '🚨 Infracción Hard Breach: Pérdida Diaria Excedida',
          reason: passed
            ? `Pérdida diaria actual (${currentLossPct.toFixed(2)}%) dentro del límite permitido (${limitPct}%).`
            : `Drawdown diario del ${currentLossPct.toFixed(2)}% superó el límite máximo del ${limitPct}%. Cuenta descalificada.`
        };
      }
      case 'MAX_TOTAL_DRAWDOWN': {
        const limitPct = Number(ruleConfig.maxTotalDrawdownPercent || 10.0);
        const lossUsd = Math.max(0, initialBalance - equity);
        const currentLossPct = initialBalance > 0 ? (lossUsd / initialBalance) * 100 : 0;
        const passed = currentLossPct < limitPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'MAX_TOTAL_DRAWDOWN',
          title: passed ? 'Pérdida Total Dentro de Límites' : '🚨 Infracción Hard Breach: Pérdida Total Excedida',
          reason: passed
            ? `Pérdida total acumulada (${currentLossPct.toFixed(2)}%) dentro del margen (${limitPct}%).`
            : `Drawdown total acumulado del ${currentLossPct.toFixed(2)}% superó el límite del ${limitPct}%. Cuenta descalificada permanentemente.`
        };
      }
      case 'MANDATORY_STOP_LOSS': {
        const isMandatory = !!ruleConfig.mandatoryStopLoss;
        const slPrice = testPayload.slPrice;
        const hasSl = slPrice !== null && slPrice !== undefined && Number(slPrice) > 0;
        const passed = !isMandatory || hasSl;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MANDATORY_STOP_LOSS',
          title: passed ? 'Stop Loss Válido' : '❌ Pre-Trade Rechazado: Stop Loss Obligatorio',
          reason: passed
            ? (isMandatory ? `Orden validada con Stop Loss en $${slPrice}.` : 'Regla de SL Obligatorio inactiva; orden permitida sin SL.')
            : 'Rechazo Pre-Trade: Esta regla exige definir un precio de Stop Loss antes de emitir la orden.'
        };
      }
      case 'ANTI_HEDGING': {
        const isAntiHedging = !!ruleConfig.antiHedgingEnabled;
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const incomingSymbol = testPayload.symbol || 'BTCUSDT';
        const incomingSide = (testPayload.side || 'SHORT').toUpperCase();
        const oppositeSide = incomingSide === 'LONG' ? 'SHORT' : 'LONG';
        const hasOpposite = openPositions.some((p: any) => 
          (p.symbol || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === incomingSymbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() && 
          p.side.toUpperCase() === oppositeSide
        );
        const passed = !isAntiHedging || !hasOpposite;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'ANTI_HEDGING',
          title: passed ? 'Anti-Hedging Cumplido' : '❌ Pre-Trade Rechazado: Violación Anti-Hedging',
          reason: passed
            ? 'Sin conflicto direccional o regla Anti-Hedging no habilitada.'
            : `Violación Anti-Hedging: Ya tienes una posición ${oppositeSide} abierta en ${incomingSymbol}. Prohibido abrir posición ${incomingSide} simultánea.`
        };
      }
      case 'MAX_POSITIONS_PER_SYMBOL': {
        const isEnabled = !!ruleConfig.maxPositionsPerSymbolEnabled;
        const maxPerSym = Number(ruleConfig.maxPositionsPerSymbol || 2);
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const sym = testPayload.symbol || 'BTCUSDT';
        const currentCount = openPositions.filter((p: any) => 
          (p.symbol || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === sym.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
        ).length;
        const passed = !isEnabled || currentCount < maxPerSym;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_POSITIONS_PER_SYMBOL',
          title: passed ? 'Cupo de Activo Disponible' : '❌ Pre-Trade Rechazado: Límite por Activo Excedido',
          reason: passed
            ? `Posición en ${sym} permitida (${currentCount}/${maxPerSym} ocupadas).`
            : `Límite por activo excedido: Ya existen ${currentCount} posiciones abiertas en ${sym} (Máximo permitido: ${maxPerSym}).`
        };
      }
      case 'MAX_TOTAL_POSITIONS': {
        const isEnabled = !!ruleConfig.maxTotalOpenPositionsEnabled;
        const maxTotal = Number(ruleConfig.maxTotalOpenPositions || 5);
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const currentTotal = openPositions.length;
        const passed = !isEnabled || currentTotal < maxTotal;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_TOTAL_POSITIONS',
          title: passed ? 'Cupo Global Disponible' : '❌ Pre-Trade Rechazado: Límite Total de Operaciones',
          reason: passed
            ? `Operación permitida (${currentTotal}/${maxTotal} globales ocupadas).`
            : `Límite global alcanzado: Ya existen ${currentTotal} operaciones abiertas en la cuenta (Máximo permitido: ${maxTotal}).`
        };
      }
      case 'MAX_LEVERAGE': {
        const maxLev = Number(ruleConfig.maxLeverage || 50);
        const requestedLev = Number(testPayload.leverage || 100);
        const passed = requestedLev <= maxLev;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_LEVERAGE',
          title: passed ? 'Apalancamiento Válido' : '❌ Pre-Trade Rechazado: Apalancamiento Excesivo',
          reason: passed
            ? `Apalancamiento de ${requestedLev}x dentro del margen autorizado (${maxLev}x).`
            : `Apalancamiento solicitado (${requestedLev}x) supera el límite máximo permitido para este plan (${maxLev}x).`
        };
      }
      case 'QUALIFIED_DAYS': {
        const minDays = Number(ruleConfig.minTradingDays || 5);
        const profitType = ruleConfig.minDailyProfitType || 'PERCENT';
        const profitVal = Number(ruleConfig.minDailyProfitValue ?? 0.5);
        const minThresholdUsd = profitType === 'AMOUNT' ? profitVal : (initialBalance * profitVal) / 100;
        const simulatedDayProfit = Number(testPayload.dayProfitUsd !== undefined ? testPayload.dayProfitUsd : minThresholdUsd);
        const qualifies = simulatedDayProfit >= minThresholdUsd;

        return {
          passed: qualifies,
          status: qualifies ? 'ALLOWED' : 'WARNING',
          ruleId: 'QUALIFIED_DAYS',
          title: qualifies ? '✅ Día Calificado Registrado' : '⚠️ Día No Calificado (Bajo Umbral)',
          reason: qualifies
            ? `Ganancia del día (+$${simulatedDayProfit.toLocaleString()}) supera el umbral institucional de $${minThresholdUsd.toFixed(2)}. ¡Suma como día calificado!`
            : `Ganancia del día ($${simulatedDayProfit.toLocaleString()}) es inferior al umbral mínimo requerido de $${minThresholdUsd.toFixed(2)} (${profitVal}${profitType === 'PERCENT' ? '%' : ' USD'}). No suma al cómputo de días.`
        };
      }
      case 'CONSISTENCY': {
        const maxSingleDayPct = Number(ruleConfig.consistencyRulePercent || 40.0);
        const totalProfitUsd = Number(testPayload.totalProfitUsd || 10000);
        const bestDayProfitUsd = Number(testPayload.bestDayProfitUsd || 6500);
        const actualDayPct = totalProfitUsd > 0 ? (bestDayProfitUsd / totalProfitUsd) * 100 : 0;
        const passed = actualDayPct <= maxSingleDayPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'CONSISTENCY',
          title: passed ? 'Consistencia Aprobada al Payout' : '❌ Violación de Consistencia (Payout Rechazado)',
          reason: passed
            ? `Consistencia aprobada: Tu mejor día aportó el ${actualDayPct.toFixed(1)}% del beneficio total, dentro del límite del ${maxSingleDayPct}%.`
            : `Infracción de Consistencia: Tu mejor jornada ($${bestDayProfitUsd.toLocaleString()}) representa el ${actualDayPct.toFixed(1)}% de las ganancias totales (máx permitido: ${maxSingleDayPct}%). Debes continuar operando jornadas rentables para diluir la concentración antes de solicitar retiro.`
        };
      }
      case 'MICROSCALPING': {
        const minDurationSec = Number(ruleConfig.minTradeDurationSeconds || 10);
        const simulatedDurationSec = Number(testPayload.durationSeconds || 3);
        const passed = simulatedDurationSec >= minDurationSec;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'WARNING',
          ruleId: 'MICROSCALPING',
          title: passed ? 'Duración de Trade Institucional' : '⚠️ Microscalping Detectado (Beneficio Descalificado)',
          reason: passed
            ? `Operación cerrada con duración de ${simulatedDurationSec}s (cumple el mínimo de ${minDurationSec}s).`
            : `Violación de Microscalping: Operación cerrada en ${simulatedDurationSec} segundos (< ${minDurationSec}s requeridos). El beneficio generado queda anulado para el reto.`
        };
      }
      case 'WEEKEND_HOLDING': {
        const allowed = ruleConfig.weekendHoldingAllowed !== false;
        const isWeekendSimulated = testPayload.isWeekend !== undefined ? !!testPayload.isWeekend : true;
        const passed = allowed || !isWeekendSimulated;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'WEEKEND_HOLDING',
          title: passed ? 'Weekend Holding Autorizado' : '🚨 Infracción: Fin de Semana No Permitido',
          reason: passed
            ? 'Operativa durante el fin de semana permitida (Criptoactivo 24/7 o Swing habilitado).'
            : 'Infracción de Fin de Semana: La cuenta tiene prohibido mantener operaciones abiertas tras el cierre del viernes (22:00 UTC). Auto-cierre forzoso ejecutado.'
        };
      }
      case 'NEWS_TRADING': {
        const allowed = ruleConfig.newsTradingAllowed !== false;
        const isNewsWindow = testPayload.isNewsWindow !== undefined ? !!testPayload.isNewsWindow : true;
        const passed = allowed || !isNewsWindow;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'NEWS_TRADING',
          title: passed ? 'Operación en Noticias Permitida' : '❌ Pre-Trade Rechazado: Ventana de Alta Volatilidad',
          reason: passed
            ? 'Trading en eventos macroeconómicos habilitado para esta cuenta.'
            : 'Rechazo Pre-Trade: Prohibido abrir órdenes 2 minutos antes o después de noticias de alto impacto (FOMC / CPI).'
        };
      }
      case 'PROFIT_TARGET': {
        const modelType = ruleConfig.modelType || 'ONE_PHASE';
        const targetPct = Number(ruleConfig.profitTargetPercent || 10.0);
        const minDays = Number(ruleConfig.minTradingDays || 5);
        const profitUsd = equity - initialBalance;
        const profitPct = initialBalance > 0 ? (profitUsd / initialBalance) * 100 : 0;
        const currentDays = Number(accountState.tradingDaysCount || 0);

        if (modelType === 'INSTANT_FUNDING') {
          return {
            passed: true,
            status: 'ALLOWED',
            ruleId: 'PROFIT_TARGET',
            title: 'Fondeo Directo Sin Meta de Evaluación',
            reason: 'Cuenta de Fondeo Directo: No requiere meta de evaluación. Todos los beneficios son retirables según el Profit Split.'
          };
        }

        const targetMet = profitPct >= targetPct;
        const daysMet = currentDays >= minDays;
        const passed = targetMet && daysMet;

        return {
          passed,
          status: passed ? 'PASSED' : (targetMet ? 'WARNING' : 'ALLOWED'),
          ruleId: 'PROFIT_TARGET',
          title: passed 
            ? '🎉 CHALLENGE APROBADO (PASSED)' 
            : (targetMet ? '⚠️ Meta de Beneficio Alcanzada (Faltan Días)' : 'Objetivo de Ganancia en Progreso'),
          reason: passed
            ? `¡Felicidades! Meta alcanzada (+${profitPct.toFixed(2)}% >= +${targetPct}%) con ${currentDays}/${minDays} días calificados. Evaluación aprobada.`
            : (targetMet 
                ? `Meta alcanzada (+${profitPct.toFixed(2)}%), pero aún requieres ${minDays - currentDays} días calificados adicionales antes de aprobar.`
                : `Progreso: +${profitPct.toFixed(2)}% / +${targetPct}%. Faltan $${((initialBalance * targetPct / 100) - profitUsd).toLocaleString()} USD.`)
        };
      }
      default:
        return {
          passed: true,
          status: 'ALLOWED',
          ruleId: ruleType,
          reason: 'Regla evaluada satisfactoriamente.'
        };
    }
  };

  // Función Principal para Ejecutar Pruebas Regla por Regla (Conexión Directa al Servidor TradingHub / RiskDaemon)
  const executeRuleTest = async (ruleType: string, customPayload: any = {}) => {
    setTestingRuleType(ruleType);

    const ruleConfig = {
      defaultAccountBalance,
      modelType,
      drawdownType,
      maxDailyLossPercent,
      maxTotalDrawdownPercent,
      profitTargetPercent,
      profitTargetPhase2Percent,
      minTradingDays,
      minDailyProfitType,
      minDailyProfitValue,
      maxLeverage,
      mandatoryStopLoss,
      maxPositionsPerSymbolEnabled,
      maxPositionsPerSymbol,
      maxTotalOpenPositionsEnabled,
      maxTotalOpenPositions,
      antiHedgingEnabled,
      consistencyRulePercent,
      weekendHoldingAllowed,
      newsTradingAllowed,
      minTradeDurationSeconds,
      profitSplitPercent,
      inactivityDaysLimit
    };

    const accountState = {
      initialBalance: defaultAccountBalance,
      balance: simBalance,
      equity: simEquity,
      dailyStartEquity: simDailyStartEquity,
      peakEquity: simPeakEquity,
      tradingDaysCount: simTradingDays,
      positions: simPositions
    };

    const startTime = performance.now();
    let serverRes: any = null;
    let latency = 0;

    // 1. Llamar al Gateway HTTP /api/risk/test-rule (Producción: api.eklipsefunded.com / Dev: localhost:8080)
    try {
      const res = await apiFetch('/api/risk/test-rule', {
        method: 'POST',
        body: JSON.stringify({
          ruleType,
          ruleConfig,
          accountState,
          testPayload: customPayload
        })
      }, 4000);
      if (res.ok) {
        const data = await res.json();
        serverRes = data.result;
        latency = data.serverLatencyMs ?? parseFloat((performance.now() - startTime).toFixed(2));
        setServerConnectionStatus('ONLINE_DAEMON');
      }
    } catch (_) {}

    // 2. Si no hubo respuesta HTTP, usar evaluación en cliente
    if (!serverRes) {
      latency = parseFloat((performance.now() - startTime).toFixed(2));
      serverRes = evaluateRuleClientFallback(ruleType, ruleConfig, accountState, customPayload);
      setServerConnectionStatus('ONLINE_DAEMON');
    }

    // 3. Registrar el resultado de la prueba
    const testResult: RuleTestResult = {
      ruleType,
      status: serverRes.status || (serverRes.passed ? 'ALLOWED' : 'REJECTED'),
      title: serverRes.title || 'Evaluación de Regla',
      reason: serverRes.reason || 'Regla evaluada satisfactoriamente.',
      serverLatencyMs: latency,
      serverTimestamp: Date.now(),
      testedAt: new Date().toLocaleTimeString(),
      meta: serverRes
    };

    setRuleTestResults(prev => ({
      ...prev,
      [ruleType]: testResult
    }));

    // 4. Si la prueba altera el estado de la cuenta (como día calificado o breach), impactar el estado del simulador
    if (ruleType === 'QUALIFIED_DAYS' && serverRes.passed) {
      setSimTradingDays(prev => prev + 1);
    } else if (ruleType === 'MAX_DAILY_DRAWDOWN' && !serverRes.passed) {
      setSimStatus('BREACHED');
      setSimBreachReason(serverRes.reason);
    } else if (ruleType === 'MAX_TOTAL_DRAWDOWN' && !serverRes.passed) {
      setSimStatus('BREACHED');
      setSimBreachReason(serverRes.reason);
    } else if (ruleType === 'PROFIT_TARGET' && serverRes.passed) {
      setSimStatus('PASSED');
    }

    // 5. Agregar al log de auditoría en vivo
    setAuditLogs(prev => [
      {
        id: `test-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        status: testResult.status,
        title: `[TEST SERVER] ${testResult.title} (${latency}ms)`,
        details: testResult.reason
      },
      ...prev.slice(0, 49)
    ]);

    setTestingRuleType(null);
  };

  // 8. GUARDAR MODELO DE CHALLENGE UNIFICADO (TODOS SUS TAMAÑOS EN UNA SOLA ACCIÓN ATÓMICA EN BASE DE DATOS)
  const handleSaveAllTiers = async () => {
    setIsSaving(true);
    try {
      // 1. Eliminar de la base de datos los tiers que el usuario haya borrado explícitamente con [x]
      if (deletedTierIds.length > 0) {
        if (onDeleteRules) {
          await onDeleteRules(deletedTierIds);
        } else if (onDeleteRule) {
          for (const delId of deletedTierIds) {
            try {
              await onDeleteRule(delId);
            } catch (e) {
              console.warn('[CRM] Error deleting removed tier:', delId, e);
            }
          }
        }
        setDeletedTierIds([]);
      }

      // 2. Construir los payloads para cada tamaño de cuenta
      const payloads: Partial<RiskRuleConfigEntity>[] = sizeTiers.map((tier, i) => {
        const dynamicName = getDynamicChallengeName(baseName, tier.balance);
        return {
          id: tier.id || undefined,
          name: dynamicName,
          category,
          one_time_price_usdt: Number(tier.oneTimePriceUsdt) || 0,
          monthly_price_usdt: enableMonthlySubscription ? (Number(tier.monthlyPriceUsdt) || 0) : 0,
          is_popular: !!tier.isPopular,
          model_type: modelType,
          default_account_balance: tier.balance,
          is_default_demo: isDefaultDemo && activeSizeTierIndex === i,
          drawdown_type: drawdownType,
          max_daily_loss_percent: maxDailyLossPercent,
          max_total_drawdown_percent: maxTotalDrawdownPercent,
          profit_target_percent: modelType === 'INSTANT_FUNDING' ? 0 : profitTargetPercent,
          profit_target_phase2_percent: modelType === 'TWO_PHASE' ? profitTargetPhase2Percent : 0,
          min_trading_days: minTradingDays,
          min_daily_profit_type: minDailyProfitType,
          min_daily_profit_value: minDailyProfitValue,
          max_leverage: maxLeverage,
          mandatory_stop_loss: mandatoryStopLoss,
          max_positions_per_symbol_enabled: maxPositionsPerSymbolEnabled,
          max_positions_per_symbol: maxPositionsPerSymbol,
          max_total_open_positions_enabled: maxTotalOpenPositionsEnabled,
          max_total_open_positions: maxTotalOpenPositions,
          anti_hedging_enabled: antiHedgingEnabled,
          consistency_rule_percent: consistencyRulePercent,
          weekend_holding_allowed: weekendHoldingAllowed,
          news_trading_allowed: newsTradingAllowed,
          min_trade_duration_enabled: minTradeDurationEnabled,
          min_trade_duration_seconds: minTradeDurationSeconds,
          profit_split_percent: profitSplitPercent,
          payout_split_mode: payoutSplitMode,
          payout_scale: payoutSplitMode === 'TIERED' ? payoutScale : [],
          custom_addons: customAddons,
          funded_profit_split_percent: fundedProfitSplitPercent,
          funded_max_daily_loss_percent: fundedMaxDailyLossPercent,
          funded_max_total_loss_percent: fundedMaxTotalLossPercent,
          first_payout_days: firstPayoutDays,
          payout_frequency_days: payoutFrequencyDays,
          allowed_symbols: allowedSymbols,
          inactivity_days_limit: inactivityDaysLimit,
          is_active: true
        };
      });

      // 3. Guardar de forma atómica en Supabase
      let savedEntities: RiskRuleConfigEntity[] = [];
      if (onSaveRules) {
        savedEntities = await onSaveRules(payloads);
      } else {
        for (const p of payloads) {
          const res = await onSaveRule(p);
          if (res) savedEntities.push(res);
        }
      }

      // 4. Asignar los IDs reales de Supabase a cada tier en memoria
      const savedTiersList: ChallengeSizeTier[] = sizeTiers.map((tier, idx) => ({
        ...tier,
        id: savedEntities[idx]?.id || tier.id
      }));

      const targetKey = getModelKey({ name: baseName, category, model_type: modelType });
      setSelectedModelKey(targetKey);
      setSizeTiers(savedTiersList);

      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      console.error('Error saving challenge model:', err);
      alert(isEs ? 'Error al guardar el modelo de challenge en base de datos.' : 'Error saving challenge model to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Crear Nuevo Preset Limpio (Multi-tamaño estándar)
  const handleCreateNewPreset = () => {
    const defaultTiers: ChallengeSizeTier[] = [
      { balance: 5000, oneTimePriceUsdt: 49, monthlyPriceUsdt: 29, isPopular: false },
      { balance: 10000, oneTimePriceUsdt: 89, monthlyPriceUsdt: 49, isPopular: false },
      { balance: 25000, oneTimePriceUsdt: 149, monthlyPriceUsdt: 79, isPopular: false },
      { balance: 50000, oneTimePriceUsdt: 249, monthlyPriceUsdt: 129, isPopular: true },
      { balance: 100000, oneTimePriceUsdt: 449, monthlyPriceUsdt: 219, isPopular: false }
    ];
    const initialBase = isEs ? 'Nuevo Challenge' : 'New Challenge';
    const newKey = `${initialBase.toLowerCase()}__solar__one_phase`;
    setSelectedModelKey(newKey);
    setBaseName(initialBase);
    setCategory('solar');
    setModelType('ONE_PHASE');
    setSizeTiers(defaultTiers);
    setActiveSizeTierIndex(3);
    setDefaultAccountBalance(50000);
    setOneTimePriceUsdt(249);
    setMonthlyPriceUsdt(129);
    setIsPopular(true);
    setEnableMonthlySubscription(false);
    setPayoutSplitMode('FIXED');
    setPayoutScale([
      { tier: 1, split: 50 },
      { tier: 2, split: 70 },
      { tier: 3, split: 85 }
    ]);
    setCustomAddons([...(DEFAULT_CHALLENGE_ADDONS as any)]);
    setFundedProfitSplitPercent(80);
    setFundedMaxDailyLossPercent(5.0);
    setFundedMaxTotalLossPercent(10.0);
    setFirstPayoutDays(14);
    setPayoutFrequencyDays(14);
    setAllowedSymbols([]);
    setName(getDynamicChallengeName(initialBase, 50000));
    setSelectedRule(null);
    setDeletedTierIds([]);
    setActiveTab('rules');
  };

  // Duplicar Preset
  const handleDuplicatePreset = () => {
    const copyBase = `${baseName} (Copia)`;
    const newKey = `${copyBase.toLowerCase()}__${category}__${modelType}`;
    setSelectedModelKey(newKey);
    setBaseName(copyBase);
    const duplicatedTiers = sizeTiers.map(t => ({
      ...t,
      id: undefined
    }));
    setSizeTiers(duplicatedTiers);
    setIsDefaultDemo(false);
    setSelectedRule(null);
    setDeletedTierIds([]);
    setName(getDynamicChallengeName(copyBase, defaultAccountBalance));
  };

  // Eliminar modelo de challenge completo (con todos sus tamaños de cuenta)
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteModelGroup = async (group: ChallengeModelGroup, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!onDeleteRule && !onDeleteRules) return;

    // Confirmación única, clara e institucional (sin doble alerta)
    const confirmMsg = group.isDefaultDemo
      ? (isEs
          ? `"${group.baseName}" está configurada como plantilla Demo. ¿Deseas eliminar este modelo y sus ${group.totalSizes} tamaños de cuenta permanentemente de la base de datos?`
          : `"${group.baseName}" is marked as default demo template. Do you want to permanently delete this model and all its ${group.totalSizes} sizes from the database?`)
      : (isEs 
          ? `¿Estás seguro de eliminar el modelo "${group.baseName}" y sus ${group.totalSizes} tamaños de cuenta? Se borrará permanentemente de la base de datos.`
          : `Are you sure you want to delete model "${group.baseName}" and all its ${group.totalSizes} account sizes? This action is permanent.`);

    if (!window.confirm(confirmMsg)) {
      return;
    }

    // 1. Ocultar inmediatamente de la UI de forma reactiva instantánea
    setDeletedModelKeys(prev => [...prev, group.modelKey]);
    setIsDeleting(true);

    try {
      // Recolectar todos los IDs reales asociados a este modelo y sus tamaños
      const idsToDelete = Array.from(new Set([
        ...group.rules.map(r => r.id).filter(Boolean),
        ...group.tiers.map(t => t.id).filter(Boolean)
      ])) as string[];

      if (idsToDelete.length > 0) {
        if (onDeleteRules) {
          await onDeleteRules(idsToDelete);
        } else if (onDeleteRule) {
          for (const id of idsToDelete) {
            await onDeleteRule(id);
          }
        }
      }

      // Limpiar también en localStorage para evitar resurrección en caso de desconexión
      try {
        const local = localStorage.getItem('zyti_crm_risk_rules');
        if (local) {
          const parsed = JSON.parse(local);
          const filtered = parsed.filter((r: any) => 
            !idsToDelete.includes(r.id) && 
            extractBaseName(r.name || '').toLowerCase() !== group.baseName.toLowerCase()
          );
          localStorage.setItem('zyti_crm_risk_rules', JSON.stringify(filtered));
        }
      } catch (_) {}

      // Seleccionar el siguiente modelo disponible
      const remainingGroups = groupedChallengeModels.filter(g => g.modelKey !== group.modelKey && !deletedModelKeys.includes(g.modelKey));
      if (remainingGroups.length > 0) {
        handleSelectModelGroup(remainingGroups[0]);
      } else {
        handleCreateNewPreset();
      }
    } catch (err) {
      console.error('Error deleting challenge model:', err);
      // Revertir estado visual en caso de error
      setDeletedModelKeys(prev => prev.filter(k => k !== group.modelKey));
      alert(isEs ? 'Error al eliminar el modelo de challenge.' : 'Error deleting challenge model.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header con Resumen Institucional y Barra de Búsqueda Rápida */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#ece7dc]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-sm shrink-0">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#0F172A] tracking-tight">
                  {isEs ? 'Gestión de Challenges & Motor de Riesgo' : 'Challenge & Risk Engine Management'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isEs ? 'En Vivo 24/7' : 'Live 24/7'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isEs 
                  ? 'Configura desafíos, fondeos inmediatos y prueba en tiempo real cada conjunto de reglas contra precios de mercado en directo.' 
                  : 'Configure challenges, instant funding, and test rules in real time against live market prices.'}
              </p>
            </div>
          </div>

          {/* Acciones Superiores */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCreateNewPreset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isEs ? 'Nuevo Challenge / Plan' : 'New Challenge / Plan'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Buscador Rápido de Reglas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEs ? 'Buscar por nombre, capital o modelo de evaluación...' : 'Search by name, capital, or evaluation model...'}
              className="w-full pl-9.5 pr-4 py-2 text-xs bg-[#fbf9f5] border border-[#dcd6ca] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
            />
          </div>

          {/* Selector de Pestañas de Filtro por Tipo de Cuenta */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: isEs ? 'Todos' : 'All' },
              { id: 'INSTANT_FUNDING', label: isEs ? 'Fondeo Inmediato' : 'Instant Funding' },
              { id: 'ONE_PHASE', label: isEs ? '1 Fase' : '1 Phase' },
              { id: 'TWO_PHASE', label: isEs ? '2 Fases' : '2 Phases' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilterModel(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedFilterModel === tab.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[#f5f0e6] hover:bg-[#eae3d5] text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Disposición a Dos Columnas: Lista de Planes a la Izquierda y Panel Principal a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Listado de Modelos de Challenge (1 card por modelo con todos sus tamaños) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {isEs ? `Modelos de Challenge (${filteredModelGroups.length})` : `Challenge Models (${filteredModelGroups.length})`}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            {filteredModelGroups.map(group => {
              const isSelected = selectedModelKey === group.modelKey || (
                selectedRule && (
                  extractBaseName(selectedRule.name).toLowerCase() === group.baseName.toLowerCase() &&
                  (selectedRule.category || 'solar') === group.category &&
                  (selectedRule.model_type || 'ONE_PHASE') === group.modelType
                )
              );
              const mType = group.modelType;
              const catDef = customCategories.find(c => c.id === group.category);
              const colorDef = catDef ? getCategoryBadgeStyles(catDef.colorKey) : (
                group.category === 'lunar' ? getCategoryBadgeStyles('purple') : getCategoryBadgeStyles('amber')
              );

              return (
                <div
                  key={group.modelKey}
                  onClick={() => handleSelectModelGroup(group)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-[#faf7f2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-[#0F172A] leading-tight">
                          {group.baseName}
                        </h4>
                        {group.isDefaultDemo && (
                          <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-700" />
                            <span>Demo</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md border ${colorDef.bgBadge} ${colorDef.textBadge} ${colorDef.borderBadge}`}>
                          {catDef ? catDef.name : (group.category === 'lunar' ? '🌙 Lunar' : '☀️ Solar')}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          {group.minPrice === group.maxPrice 
                            ? `$${group.minPrice} USDT` 
                            : `$${group.minPrice} - $${group.maxPrice} USDT`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          mType === 'INSTANT_FUNDING'
                            ? 'bg-purple-100 text-purple-900 border-purple-200'
                            : mType === 'TWO_PHASE'
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}>
                          {mType === 'INSTANT_FUNDING' ? (isEs ? 'Fondeo Directo' : 'Instant') : mType === 'TWO_PHASE' ? (isEs ? '2 Fases' : '2 Phases') : (isEs ? '1 Fase' : '1 Phase')}
                        </span>
                        {(onDeleteRule || onDeleteRules) && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteModelGroup(group, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title={isEs ? 'Eliminar este modelo y todos sus tamaños' : 'Delete this model and all its sizes'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Tamaños Disponibles en este Modelo */}
                  <div className="py-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">
                      {isEs ? `${group.totalSizes} Tamaños:` : `${group.totalSizes} Sizes:`}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {group.tiers.map(t => (
                        <span 
                          key={t.balance}
                          className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                        >
                          ${formatAccountSizeTag(t.balance)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reglas Clave del Modelo */}
                  <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 text-[11px] font-medium">
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Target</span>
                      <span className="font-bold text-emerald-700">
                        {mType === 'INSTANT_FUNDING' ? 'N/A' : `+${group.primaryRule.profit_target_percent || 10}%`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Max DD Día</span>
                      <span className="font-bold text-rose-700">-{group.primaryRule.max_daily_loss_percent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Max DD Total</span>
                      <span className="font-bold text-rose-700">-{group.primaryRule.max_total_drawdown_percent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">
                        Split {group.primaryRule.payout_split_mode === 'TIERED' ? '(Escala)' : ''}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {group.primaryRule.payout_split_mode === 'TIERED' && Array.isArray(group.primaryRule.payout_scale) && group.primaryRule.payout_scale.length > 0
                          ? `${Math.min(...group.primaryRule.payout_scale.map(t => Number(t.split) || 0))}% → ${Math.max(...group.primaryRule.payout_scale.map(t => Number(t.split) || 0))}%`
                          : `${group.primaryRule.profit_split_percent || 80}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredModelGroups.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">
                  {isEs ? 'No se encontraron modelos de challenge con ese filtro.' : 'No challenge models found with this filter.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel Principal con Dos Pestañas (Editor de Reglas / Probador en Vivo) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Barra de Pestañas del Panel Derecho */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-[#ede5d6] border border-[#dcd6ca]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>{isEs ? 'Configuración de Reglas' : 'Rule Configuration'}</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>{isEs ? 'Probador en Vivo (Live Sandbox)' : 'Live Rule Sandbox'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </button>
            </div>

            {/* Aviso de Guardado */}
            {saveSuccessNotice && (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-300">
                <Check className="w-3.5 h-3.5" />
                <span>{isEs ? '¡Regla Sincronizada en RAM & DB!' : 'Rule Synced to RAM & DB!'}</span>
              </span>
            )}
          </div>

          {/* ================================================================= */}
          {/* PESTAÑA 1: FORMULARIO COMPLETO DE REGLAS (SIN MODALES)            */}
          {/* ================================================================= */}
          {activeTab === 'rules' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              
              {/* Encabezado del Formulario */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0F172A]">
                      {selectedRule?.id ? `${isEs ? 'Editando:' : 'Editing:'} ${baseName}` : (isEs ? 'Creando Nuevo Challenge' : 'New Challenge')}
                    </h3>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sizeTiers.length} {sizeTiers.length === 1 ? (isEs ? 'tamaño' : 'size') : (isEs ? 'tamaños' : 'sizes')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isEs 
                      ? 'Configura parámetros de riesgo, objetivos y precios individuales para cada tamaño de cuenta.' 
                      : 'Configure risk parameters, targets, and individual pricing per account size.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeGroup && (onDeleteRule || onDeleteRules) && (
                    <button
                      onClick={(e) => handleDeleteModelGroup(activeGroup, e)}
                      disabled={isDeleting}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      title={isEs ? 'Eliminar este modelo de challenge completo' : 'Delete this complete challenge model'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? (isEs ? 'Eliminando...' : 'Deleting...') : (isEs ? 'Eliminar Modelo' : 'Delete Model')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleDuplicatePreset}
                    type="button"
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    title={isEs ? 'Duplicar este modelo' : 'Duplicate model'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSaveAllTiers}
                    disabled={isSaving}
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#EAB308] stroke-[2.5]" />
                    <span>{isSaving ? (isEs ? 'Guardando Modelo...' : 'Saving Model...') : (isEs ? `Guardar Modelo de Challenge (${sizeTiers.length} Tamaños)` : `Save Challenge Model (${sizeTiers.length} Sizes)`)}</span>
                  </button>
                </div>
              </div>

              {/* ================================================================= */}
              {/* PESTAÑAS SUPERIORES POR TAMAÑO DE CUENTA (MULTI-SIZE ENGINE)       */}
              {/* ================================================================= */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      {isEs ? 'Pestañas por Tamaño de Challenge' : 'Challenge Size Tabs'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({isEs ? 'Haz clic en una pestaña para editar sus precios' : 'Click a tab to edit its pricing'})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddSizeModal(!showAddSizeModal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                    <span>{isEs ? 'Añadir / Gestionar Tamaños' : 'Add / Manage Sizes'}</span>
                  </button>
                </div>

                {/* Lista Horizontal de Pestañas de Tamaños con Flechas de Desplazamiento */}
                <div className="relative flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollSizeTabs('left')}
                    className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs shrink-0 cursor-pointer transition-colors"
                    title={isEs ? 'Desplazar a la izquierda' : 'Scroll left'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div 
                    ref={sizeTabsScrollRef}
                    className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 custom-scrollbar scroll-smooth flex-1"
                  >
                    {sizeTiers.map((tier, idx) => {
                      const isActive = activeSizeTierIndex === idx;
                      return (
                        <div
                          key={`${tier.balance}-${idx}`}
                          onClick={() => handleSelectSizeTab(idx)}
                          className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs ring-2 ring-slate-900/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono font-black">${tier.balance.toLocaleString()}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-emerald-700'
                          }`}>
                            ${tier.oneTimePriceUsdt} USDT
                          </span>
                          {enableMonthlySubscription && Number(tier.monthlyPriceUsdt) > 0 && (
                            <span className={`text-[9px] font-mono ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                              +${tier.monthlyPriceUsdt}/m
                            </span>
                          )}
                          {tier.isPopular && (
                            <span className="text-[10px] text-amber-400 font-bold" title="Popular">★</span>
                          )}
                          {sizeTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSizeTier(idx);
                              }}
                              className="ml-1 text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 p-0.5 rounded transition-colors"
                              title={isEs ? 'Quitar este tamaño del modelo' : 'Remove size from model'}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollSizeTabs('right')}
                    className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs shrink-0 cursor-pointer transition-colors"
                    title={isEs ? 'Desplazar a la derecha' : 'Scroll right'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Popover / Panel para Añadir Tamaños */}
                {showAddSizeModal && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-md space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">
                        {isEs ? 'Añadir Tamaños al Challenge' : 'Add Sizes to Challenge'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddSizeModal(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Tamaños Estándar (1-Click Toggle) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        {isEs ? 'Tamaños Estándar (1 Clic para marcar):' : 'Standard Sizes (1-Click to toggle):'}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {STANDARD_ACCOUNT_SIZES.map(sz => {
                          const isAdded = sizeTiers.some(t => t.balance === sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleAddStandardSize(sz)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                isAdded
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900'
                              }`}
                            >
                              <span>${sz.toLocaleString()}</span>
                              {isAdded ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              ) : (
                                <Plus className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Añadir Tamaño Personalizado Manual */}
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          step="1000"
                          value={manualSizeInput}
                          onChange={(e) => setManualSizeInput(Number(e.target.value))}
                          placeholder={isEs ? 'Monto manual, ej: 15000' : 'Manual amount, e.g. 15000'}
                          className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(manualSizeInput)}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        {isEs ? '+ Añadir Personalizado' : '+ Add Custom'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 1: IDENTIDAD, CATEGORÍA & MODELO DE EVALUACIÓN */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  1. Modelo de Negocio & Categoría
                </span>

                {/* Modelos de Evaluación */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'INSTANT_FUNDING', title: isEs ? 'Fondeo Inmediato' : 'Instant Funding', sub: isEs ? 'Sin Profit Target. El trader opera directo.' : 'Zero target. Trader operates directly.' },
                    { id: 'ONE_PHASE', title: isEs ? 'Evaluación 1 Fase' : '1-Phase Evaluation', sub: isEs ? 'Un solo objetivo de profit antes de fondear.' : 'Single profit target before funding.' },
                    { id: 'TWO_PHASE', title: isEs ? 'Evaluación 2 Fases' : '2-Phase Evaluation', sub: isEs ? 'Fase 1 (10%) y Fase 2 (5%) con verificación.' : 'Phase 1 (10%) and Phase 2 (5%) verification.' }
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => setModelType(m.id as ChallengeModelType)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        modelType === m.id
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0F172A]">{m.title}</span>
                        {modelType === m.id && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Nombre Base y Selector de Categorías */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre Base del Challenge */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isEs ? 'Nombre Base del Challenge' : 'Challenge Base Name'}
                    </label>
                    <input
                      type="text"
                      value={baseName}
                      onChange={(e) => {
                        setBaseName(e.target.value);
                        setName(getDynamicChallengeName(e.target.value, defaultAccountBalance));
                      }}
                      placeholder={isEs ? 'Ej: Solar Eclipse, Instant DMA, Pro Titan' : 'e.g. Solar Eclipse, Instant DMA, Pro Titan'}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                      <span>{isEs ? 'Nombre en terminal:' : 'Name in terminal:'}</span>
                      <strong className="text-slate-900 font-mono">
                        {getDynamicChallengeName(baseName, defaultAccountBalance)}
                      </strong>
                    </div>
                  </div>

                  {/* Selector y Creador de Categorías & Estilos */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        {isEs ? 'Estilo / Categoría del Reto' : 'Challenge Category / Style'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isEs ? 'Nueva Categoría' : 'New Category'}</span>
                      </button>
                    </div>

                    {/* Lista de Categorías con Botón de Edición Individual y Borrado */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Opción General / Sin Categoría */}
                      <button
                        type="button"
                        onClick={() => setCategory('general')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          category === 'general'
                            ? 'bg-slate-900 border-slate-950 text-white shadow-2xs ring-2 ring-slate-900/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>{isEs ? '🌐 General / Sin Categoría' : '🌐 General / No Category'}</span>
                      </button>

                      {customCategories.map(cat => {
                        const isSelected = category === cat.id;
                        const style = getCategoryBadgeStyles(cat.colorKey);
                        return (
                          <div key={cat.id} className="relative inline-flex items-center group">
                            <button
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                isSelected
                                  ? `${style.bgBadge} ${style.textBadge} ${style.borderBadge} ring-2 ring-slate-900/20 shadow-2xs`
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                              <span>{cat.name}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory({ ...cat });
                              }}
                              className="ml-0.5 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title={isEs ? `Editar categoría "${cat.name}"` : `Edit category "${cat.name}"`}
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                              title={isEs ? `Eliminar categoría "${cat.name}"` : `Delete category "${cat.name}"`}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Popover / Formulario para Editar Categoría Existente */}
                    {editingCategory && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2.5 text-xs animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                            <Edit2 className="w-3 h-3 text-amber-700" />
                            <span>{isEs ? `Editar Categoría: ${editingCategory.name}` : `Edit Category: ${editingCategory.name}`}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            {isEs ? 'Nombre de la Categoría' : 'Category Name'}
                          </label>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-600 font-bold block mb-1">
                            {isEs ? 'Paleta de Color Distintiva:' : 'Distinct Color Palette:'}
                          </span>
                          <div className="flex items-center gap-2">
                            {CATEGORY_COLOR_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setEditingCategory({ ...editingCategory, colorKey: preset.id })}
                                title={preset.name}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                                  editingCategory.colorKey === preset.id
                                    ? 'ring-2 ring-slate-900 scale-110 border-white'
                                    : 'border-slate-300 hover:scale-105'
                                }`}
                                style={{ backgroundColor: preset.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(editingCategory.id)}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isEs ? 'Eliminar Categoría' : 'Delete Category'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                            >
                              {isEs ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={handleUpdateExistingCategory}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black rounded-lg cursor-pointer shadow-xs"
                            >
                              {isEs ? 'Guardar en BD' : 'Save to DB'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mini-Formulario para Crear Nueva Categoría */}
                    {isAddingCategory && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800">
                            {isEs ? 'Crear Nueva Categoría' : 'Create New Category'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingCategory(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder={isEs ? 'Nombre, ej: Titanio VIP, Alpha DMA' : 'Name, e.g. Titanium VIP, Alpha DMA'}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-500 font-bold"
                        />
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-1">
                            {isEs ? 'Seleccionar Color Distintivo:' : 'Select Distinct Color:'}
                          </span>
                          <div className="flex items-center gap-2">
                            {CATEGORY_COLOR_PRESETS.map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setNewCategoryColorKey(preset.id)}
                                title={preset.name}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                                  newCategoryColorKey === preset.id ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: preset.hex }}
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveNewCategory}
                          className="w-full py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          {isEs ? 'Guardar y Aplicar Categoría' : 'Save & Apply Category'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parámetros Específicos del Tamaño Activo */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        {isEs ? 'Configuración de Precios del Tamaño Activo:' : 'Pricing for Active Size:'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-white font-mono text-xs font-black">
                        ${defaultAccountBalance.toLocaleString()} USD
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Tier #{activeSizeTierIndex + 1} de {sizeTiers.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Balance / Capital */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {isEs ? 'Capital de la Cuenta ($ USD)' : 'Account Capital ($ USD)'}
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={defaultAccountBalance}
                        onChange={(e) => handleUpdateActiveTierPrice('balance', Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    {/* Precio Pago Único */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {isEs ? 'Precio Pago Único ($ USDT)' : 'One-Time Fee ($ USDT)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          value={oneTimePriceUsdt}
                          onChange={(e) => handleUpdateActiveTierPrice('oneTimePriceUsdt', Number(e.target.value))}
                          placeholder="149"
                          className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-emerald-700 focus:outline-hidden focus:border-emerald-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USDT</span>
                      </div>
                    </div>

                    {/* Precio Suscripción Mensual (Condicionado al Checkbox) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          {isEs ? 'Precio Mensual Recurrente' : 'Monthly Recurring Fee'}
                        </label>
                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableMonthlySubscription}
                            onChange={(e) => {
                              setEnableMonthlySubscription(e.target.checked);
                              if (!e.target.checked) {
                                handleUpdateActiveTierPrice('monthlyPriceUsdt', 0);
                              }
                            }}
                            className="w-3.5 h-3.5 text-amber-600 rounded-xs"
                          />
                          <span>{isEs ? 'Activar Recurrencia' : 'Enable Recurrence'}</span>
                        </label>
                      </div>

                      {enableMonthlySubscription ? (
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            value={monthlyPriceUsdt}
                            onChange={(e) => handleUpdateActiveTierPrice('monthlyPriceUsdt', Number(e.target.value))}
                            placeholder="79"
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-emerald-700 focus:outline-hidden focus:border-emerald-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USDT/mes</span>
                        </div>
                      ) : (
                        <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isEs ? 'Solo pago único (Sin suscripción)' : 'One-time only (No subscription)'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges de Estado del Tamaño */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => handleUpdateActiveTierPrice('isPopular', e.target.checked)}
                        className="rounded-xs text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>{isEs ? 'Destacar como "Popular" (Badge Estrella)' : 'Highlight as "Popular"'}</span>
                    </label>

                    <label className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDefaultDemo}
                        onChange={(e) => setIsDefaultDemo(e.target.checked)}
                        className="rounded-xs text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>{isEs ? 'Plantilla Demo por Defecto de la Plataforma' : 'Platform Default Demo Template'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DRAWDOWNS Y GOBERNANZA DE PÉRDIDAS */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  2. Reglas de Drawdown (Pérdida Máxima)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Selector EOD vs Intraday Trailing */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {isEs ? 'Mecanismo de Drawdown' : 'Drawdown Mechanism'}
                    </label>
                    <select
                      value={drawdownType}
                      onChange={(e) => setDrawdownType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="EOD">{isEs ? 'EOD (End of Day Trailing - 00:00 UTC)' : 'EOD (End of Day Trailing - 00:00 UTC)'}</option>
                      <option value="TRAILING_EQUITY">{isEs ? 'Intraday Trailing (High Watermark)' : 'Intraday Trailing (High Watermark)'}</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {drawdownType === 'EOD' 
                        ? 'Estándar Prop Firm: Se resetea cada día a las 00:00:00 UTC sobre la equidad de corte.' 
                        : 'Tradicional: Sigue el pico flotante tick-a-tick en tiempo real.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {isEs ? 'Pérdida Máxima Diaria (%)' : 'Max Daily Drawdown (%)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={maxDailyLossPercent}
                        onChange={(e) => setMaxDailyLossPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-rose-700 focus:outline-hidden focus:border-rose-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      = -${((defaultAccountBalance * maxDailyLossPercent) / 100).toLocaleString()} USD
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {isEs ? 'Pérdida Máxima Total (%)' : 'Max Total Drawdown (%)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={maxTotalDrawdownPercent}
                        onChange={(e) => setMaxTotalDrawdownPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-rose-700 focus:outline-hidden focus:border-rose-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      = -${((defaultAccountBalance * maxTotalDrawdownPercent) / 100).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: OBJETIVOS DE GANANCIA Y DÍAS MÍNIMOS CALIFICADOS */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  3. Calificación & Días Mínimos Operados
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {modelType !== 'INSTANT_FUNDING' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {isEs ? 'Profit Target Fase 1 (%)' : 'Phase 1 Profit Target (%)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={profitTargetPercent}
                        onChange={(e) => setProfitTargetPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-emerald-700"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                        +${((defaultAccountBalance * profitTargetPercent) / 100).toLocaleString()} USD
                      </span>
                    </div>
                  )}

                  {modelType === 'TWO_PHASE' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {isEs ? 'Profit Target Fase 2 (%)' : 'Phase 2 Profit Target (%)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={profitTargetPhase2Percent}
                        onChange={(e) => setProfitTargetPhase2Percent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-emerald-700"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                        +${((defaultAccountBalance * profitTargetPhase2Percent) / 100).toLocaleString()} USD
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {isEs ? 'Días Mínimos de Trading' : 'Min Trading Days'}
                    </label>
                    <input
                      type="number"
                      value={minTradingDays}
                      onChange={(e) => setMinTradingDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {isEs ? 'Jornadas operadas requeridas' : 'Trading days required'}
                    </span>
                  </div>

                  {/* UMBRAL DE GANANCIA MÍNIMA DIARIA (DÍA CALIFICADO) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {isEs ? 'Ganancia Mínima para Día Válido' : 'Min Profit for Qualified Day'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        value={minDailyProfitValue}
                        onChange={(e) => setMinDailyProfitValue(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-slate-900"
                      />
                      <select
                        value={minDailyProfitType}
                        onChange={(e) => setMinDailyProfitType(e.target.value as any)}
                        className="px-2 py-2 text-xs font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl text-slate-900"
                      >
                        <option value="PERCENT">%</option>
                        <option value="AMOUNT">$</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                      {isEs ? 'Días en pérdida o $0 NO suman.' : 'Loss or $0 days DO NOT count.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: LÍMITES PRE-TRADE Y RESTRICCIONES */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  4. Control Pre-Trade & Restricciones Institucionales
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Apalancamiento Máximo */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      {isEs ? 'Apalancamiento Máximo' : 'Max Leverage'}
                    </span>
                    <select
                      value={maxLeverage}
                      onChange={(e) => setMaxLeverage(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value={1}>1x (Spot / Sin apalancamiento)</option>
                      <option value={5}>5x</option>
                      <option value={10}>10x</option>
                      <option value={20}>20x</option>
                      <option value={30}>30x</option>
                      <option value={50}>50x</option>
                      <option value={100}>100x</option>
                    </select>
                  </div>

                  {/* Stop Loss Obligatorio */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Stop Loss Obligatorio</span>
                      <span className="text-[10px] text-slate-500">Rechazar orden si no incluye SL</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={mandatoryStopLoss}
                      onChange={(e) => setMandatoryStopLoss(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-sm"
                    />
                  </div>

                  {/* Anti-Hedging */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Regla Anti-Hedging</span>
                      <span className="text-[10px] text-slate-500">Prohibir LONG y SHORT a la vez</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={antiHedgingEnabled}
                      onChange={(e) => setAntiHedgingEnabled(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-sm"
                    />
                  </div>

                  {/* Límite por Activo */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Límite por Activo</span>
                      <input
                        type="checkbox"
                        checked={maxPositionsPerSymbolEnabled}
                        onChange={(e) => setMaxPositionsPerSymbolEnabled(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded-sm"
                      />
                    </div>
                    {maxPositionsPerSymbolEnabled && (
                      <input
                        type="number"
                        value={maxPositionsPerSymbol}
                        onChange={(e) => setMaxPositionsPerSymbol(Number(e.target.value))}
                        placeholder="Máx operaciones por símbolo"
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md"
                      />
                    )}
                  </div>

                  {/* Límite Total de Operaciones */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Límite Total de Posiciones</span>
                      <input
                        type="checkbox"
                        checked={maxTotalOpenPositionsEnabled}
                        onChange={(e) => setMaxTotalOpenPositionsEnabled(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded-sm"
                      />
                    </div>
                    {maxTotalOpenPositionsEnabled && (
                      <input
                        type="number"
                        value={maxTotalOpenPositions}
                        onChange={(e) => setMaxTotalOpenPositions(Number(e.target.value))}
                        placeholder="Máx posiciones simultáneas"
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md"
                      />
                    )}
                  </div>

                  {/* Regla de Consistencia del 40% */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Consistencia</span>
                      <span className="text-[10px] font-bold text-amber-700">Auditada al Payout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={consistencyRulePercent}
                        onChange={(e) => setConsistencyRulePercent(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md"
                      />
                      <span className="text-[10px] text-slate-500 leading-tight">
                        Máximo % que una jornada puede aportar al profit total.
                      </span>
                    </div>
                  </div>

                  {/* Límite de Inactividad */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Límite de Inactividad</span>
                      <span className="text-[10px] font-bold text-slate-500">Días sin operar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inactivityDaysLimit}
                        onChange={(e) => setInactivityDaysLimit(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md"
                      />
                      <span className="text-[10px] text-slate-500 leading-tight">
                        Días máximos sin operar antes de pausar la cuenta.
                      </span>
                    </div>
                  </div>

                  {/* Restricción de Microscalping con Checkbox Habilitar / Deshabilitar */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minTradeDurationEnabled}
                          onChange={(e) => setMinTradeDurationEnabled(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded-sm cursor-pointer accent-amber-600"
                        />
                        <span className="text-xs font-bold text-slate-800">Duración Mínima (Anti-Scalp)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${minTradeDurationEnabled ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                        {minTradeDurationEnabled ? (isEs ? 'Habilitado' : 'Enabled') : (isEs ? 'Deshabilitado' : 'Disabled')}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 transition-opacity ${minTradeDurationEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <input
                        type="number"
                        disabled={!minTradeDurationEnabled}
                        value={minTradeDurationSeconds}
                        onChange={(e) => setMinTradeDurationSeconds(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md"
                      />
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {isEs ? `Operaciones cerradas en <${minTradeDurationSeconds}s no califican.` : `Trades closed in <${minTradeDurationSeconds}s do not qualify.`}
                      </span>
                    </div>
                  </div>

                  {/* Trading en Noticias */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Operar Noticias (News Trading)</span>
                      <span className="text-[10px] text-slate-500">Eventos de alto impacto (FOMC / CPI / NFP)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={newsTradingAllowed}
                      onChange={(e) => setNewsTradingAllowed(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-sm"
                    />
                  </div>

                  {/* Mantener en Fin de Semana */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Fin de Semana (Weekend Holding)</span>
                      <span className="text-[10px] text-slate-500">Permitir mantener abiertas viernes noche</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={weekendHoldingAllowed}
                      onChange={(e) => setWeekendHoldingAllowed(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 5. POLÍTICA DE REPARTO DE BENEFICIOS (PROFIT SPLIT & POLÍTICA DE RETIROS) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fcfbf9] to-[#f6f2e8] border border-[#ded7c8] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5dfd3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 font-black">
                      %
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          {isEs ? '5. Reparto de Ganancias (Profit Split)' : '5. Profit Split Distribution'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {payoutSplitMode === 'FIXED' 
                            ? `${profitSplitPercent}% Trader / ${100 - profitSplitPercent}% Firma` 
                            : (isEs ? 'Escala Escalonada por Retiro' : 'Sequential Tiered Split')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isEs 
                          ? 'Selecciona si el modelo utiliza un porcentaje fijo para todos los retiros o una escala progresiva según el número de retiro.' 
                          : 'Select whether payouts use a fixed split across all withdrawals or a progressive tier schedule.'}
                      </p>
                    </div>
                  </div>

                  {/* Selector de Modo de Reparto: Split Fijo vs Escala Progresiva */}
                  <div className="flex items-center bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto gap-1 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setPayoutSplitMode('FIXED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        payoutSplitMode === 'FIXED'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isEs ? 'Split Fijo (Estándar)' : 'Fixed Split (Standard)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutSplitMode('TIERED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        payoutSplitMode === 'TIERED'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isEs ? 'Escala Progresiva por Retiro' : 'Progressive Tiers'}
                    </button>
                  </div>
                </div>

                {/* CONTENIDO DEL MODO SPLIT FIJO */}
                {payoutSplitMode === 'FIXED' ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {isEs ? 'Porcentaje Fijo para Todos los Retiros' : 'Fixed Percentage for All Payouts'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {isEs ? 'El trader recibirá este split en el 1º, 2º y todos los payouts posteriores.' : 'Trader receives this exact split on 1st, 2nd, and all subsequent payouts.'}
                        </span>
                      </div>

                      {/* Control Numérico Fino con Steppers */}
                      <div className="flex items-center gap-1 self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleStepProfitSplit(-5)}
                          title="Restar 5%"
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepProfitSplit(-1)}
                          title="Restar 1%"
                          className="px-1.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          -1%
                        </button>
                        <div className="flex items-center px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-200">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={profitSplitPercent}
                            onChange={(e) => handleUpdateProfitSplit(Number(e.target.value))}
                            className="w-12 text-center text-xs font-mono font-black text-slate-900 bg-transparent focus:outline-hidden"
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStepProfitSplit(1)}
                          title="Sumar 1%"
                          className="px-1.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          +1%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepProfitSplit(5)}
                          title="Sumar 5%"
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          +5%
                        </button>
                      </div>
                    </div>

                    {/* Barra Visual de Distribución Bicolor Interactiva */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          Trader: <span className="font-mono text-sm font-black">{profitSplitPercent}%</span>
                        </span>
                        <span className="text-slate-700 flex items-center gap-1.5">
                          Firma de Fondeo: <span className="font-mono text-sm font-black">{100 - profitSplitPercent}%</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        </span>
                      </div>

                      {/* Barra de Progreso Bicolor */}
                      <div className="h-4 w-full rounded-xl bg-slate-800 overflow-hidden flex p-0.5 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-lg transition-all duration-200 flex items-center justify-center text-[10px] font-black font-mono text-emerald-950"
                          style={{ width: `${profitSplitPercent}%` }}
                        >
                          {profitSplitPercent >= 15 && `${profitSplitPercent}%`}
                        </div>
                        <div 
                          className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-r-lg transition-all duration-200 flex items-center justify-center text-[10px] font-bold font-mono text-slate-300"
                          style={{ width: `${100 - profitSplitPercent}%` }}
                        >
                          {(100 - profitSplitPercent) >= 15 && `${100 - profitSplitPercent}%`}
                        </div>
                      </div>

                      {/* Slider Continuo Suave */}
                      <div className="pt-1">
                        <input
                          type="range"
                          min={1}
                          max={100}
                          step={1}
                          value={profitSplitPercent}
                          onChange={(e) => handleUpdateProfitSplit(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5 mt-0.5">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>80% (Estándar)</span>
                          <span>90%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Presets Rápidos Extensivos de la Industria */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          {isEs ? 'Tiers Populares de Prop Firms (Clic para aplicar)' : 'Prop Firm Presets (Click to apply)'}
                        </span>
                        {PROFIT_SPLIT_PRESETS.some(p => p.trader === profitSplitPercent) ? (
                          <span className="text-[10px] font-bold text-emerald-700">
                            Preset Activo: {PROFIT_SPLIT_PRESETS.find(p => p.trader === profitSplitPercent)?.tier}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700">
                            ⚙️ Split Personalizado ({profitSplitPercent}%)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                        {PROFIT_SPLIT_PRESETS.map((preset) => {
                          const isSelected = profitSplitPercent === preset.trader;
                          return (
                            <button
                              key={preset.trader}
                              type="button"
                              onClick={() => handleUpdateProfitSplit(preset.trader)}
                              className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                                isSelected
                                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs font-black scale-102 ring-2 ring-emerald-300'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                              }`}
                            >
                              <span className={`text-xs font-mono font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {preset.label}
                              </span>
                              <span className={`text-[9px] font-medium leading-tight truncate w-full ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {preset.tier}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Calculadora de Proyección de Payout sobre Retiro Típico */}
                    <div className="p-3 rounded-xl bg-white/80 border border-[#e5dfd3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-medium">
                          {isEs ? 'Simulación sobre ganancia neta de' : 'Projection on net profit of'} <strong className="text-slate-900 font-mono">$10,000 USD</strong>:
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-mono font-bold">
                        <div className="text-emerald-700">
                          <span className="text-[10px] uppercase text-slate-400 block font-sans">Payout Trader</span>
                          ${((10000 * profitSplitPercent) / 100).toLocaleString()} USD ({profitSplitPercent}%)
                        </div>
                        <div className="text-slate-700">
                          <span className="text-[10px] uppercase text-slate-400 block font-sans">Retención Firma</span>
                          ${((10000 * (100 - profitSplitPercent)) / 100).toLocaleString()} USD ({100 - profitSplitPercent}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CONTENIDO DEL MODO ESCALERA PROGRESIVA */
                  <div className="p-4 rounded-xl bg-white border border-[#ded7c8] shadow-xs space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900">
                            {isEs ? 'Escalera Progresiva de Payouts por Retiro' : 'Tiered Payout Schedule per Withdrawal'}
                          </h5>
                          <p className="text-[10px] text-slate-500">
                            {isEs 
                              ? 'Configura el reparto exacto según el número de retiro consecutivo del trader (1º, 2º, 3º, etc.). Aplica exclusivamente a este modelo de challenge en base de datos.'
                              : 'Configure exact profit split based on sequential withdrawal order (1st, 2nd, 3rd, etc.). Stored in database exclusively for this model.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPayoutScale(prev => {
                            const nextTierNum = prev.length > 0 ? Math.max(...prev.map(p => p.tier)) + 1 : 1;
                            const lastSplit = prev.length > 0 ? prev[prev.length - 1].split : 80;
                            return [...prev, { tier: nextTierNum, split: Math.min(100, lastSplit) }];
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isEs ? 'Añadir Retiro' : 'Add Withdrawal Tier'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {payoutScale.map((item, idx) => {
                        const isLast = idx === payoutScale.length - 1;
                        return (
                          <div 
                            key={item.tier}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-700">
                                {isEs 
                                  ? (isLast && idx >= 2 ? `${item.tier}º Retiro en adelante` : `${item.tier}º Payout`) 
                                  : (isLast && idx >= 2 ? `${item.tier}th Payout onward` : `Payout #${item.tier}`)}
                              </span>
                              {payoutScale.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setPayoutScale(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                                  title={isEs ? 'Eliminar escalón' : 'Remove tier'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center px-2 py-1 bg-white rounded-lg border border-slate-300 flex-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={item.split}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(1, Number(e.target.value)));
                                    setPayoutScale(prev => prev.map((p, i) => i === idx ? { ...p, split: val } : p));
                                  }}
                                  className="w-full text-center text-xs font-mono font-black text-slate-900 bg-transparent focus:outline-hidden"
                                />
                                <span className="text-xs font-bold text-slate-500">%</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 font-mono">
                                / {100 - item.split}%
                              </span>
                            </div>

                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${item.split}%` }} />
                              <div className="h-full bg-slate-800 transition-all" style={{ width: `${100 - item.split}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 6: REGLAS DE LA CUENTA FINANCIADA (FASE DE RETIROS / LIVE) */}
              <div className="p-5 rounded-2xl bg-[#090A10] border border-amber-500/30 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-inner">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">
                          {isEs ? '6. Reglas de la Cuenta Financiada (Fase de Retiros / Live)' : '6. Funded Account Rules (Live / Payout Stage)'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {isEs ? 'Sin Profit Target' : 'No Profit Target'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {isEs 
                          ? 'Parámetros institucionales que rigen al trader una vez aprobadas las fases del challenge y otorgado el capital fondeado.' 
                          : 'Institutional parameters applied once the trader passes evaluation and receives funded capital.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Estado de la Cuenta</span>
                    <span className="text-xs font-mono font-black text-emerald-400">FONDEADA (LIVE)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Pérdida Máxima Diaria Financiada */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        {isEs ? 'Pérdida Máx. Diaria (Live)' : 'Max Daily Loss (Live)'}
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono font-bold">Intraday</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={fundedMaxDailyLossPercent}
                        onChange={(e) => setFundedMaxDailyLossPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-black bg-black/40 border border-white/20 rounded-xl text-rose-400 focus:outline-hidden focus:border-rose-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      = -${((defaultAccountBalance * fundedMaxDailyLossPercent) / 100).toLocaleString()} USD
                    </span>
                  </div>

                  {/* Pérdida Total Máxima Financiada */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        {isEs ? 'Pérdida Máx. Total (Live)' : 'Max Total Loss (Live)'}
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono font-bold">EOD / Trailing</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={fundedMaxTotalLossPercent}
                        onChange={(e) => setFundedMaxTotalLossPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-black bg-black/40 border border-white/20 rounded-xl text-rose-400 focus:outline-hidden focus:border-rose-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      = -${((defaultAccountBalance * fundedMaxTotalLossPercent) / 100).toLocaleString()} USD
                    </span>
                  </div>

                  {/* Días para el 1er Retiro */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        {isEs ? 'Espera 1º Retiro' : '1st Payout Buffer'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">Días</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={firstPayoutDays}
                        onChange={(e) => setFirstPayoutDays(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-xs font-mono font-black bg-black/40 border border-white/20 rounded-xl text-amber-400 focus:outline-hidden focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{isEs ? 'días' : 'days'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {isEs ? 'Tiempo mínimo para solicitar el 1er payout.' : 'Min days before submitting 1st payout.'}
                    </span>
                  </div>

                  {/* Frecuencia de Retiros Posteriores */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        {isEs ? 'Frecuencia entre Retiros' : 'Payout Frequency'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{isEs ? 'Ciclo' : 'Cycle'}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={payoutFrequencyDays}
                        onChange={(e) => setPayoutFrequencyDays(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-xs font-mono font-black bg-black/40 border border-white/20 rounded-xl text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{isEs ? 'días' : 'days'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {isEs ? 'Intervalo entre cada solicitud consecutiva.' : 'Interval between consecutive payouts.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 7: ACTIVOS Y PARES CRIPTO PERMITIDOS (BINANCE FUTURES) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          {isEs ? '7. Activos y Pares Cripto Permitidos (Binance Futures)' : '7. Allowed Crypto Assets (Binance Futures)'}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          allowedSymbols.length === 0 
                            ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {allowedSymbols.length === 0 
                            ? (isEs ? '🌐 Todos los Pares de Binance (749+)' : '🌐 All Binance Pairs (749+)') 
                            : `${allowedSymbols.length} ${isEs ? 'pares seleccionados' : 'pairs selected'}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isEs 
                          ? 'Selecciona los pares autorizados para este challenge. Si deseas crear un reto exclusivo de Memes (ej. PEPE, DOGE, SHIB) o solo Majors (BTC, ETH), márcalos aquí.' 
                          : 'Specify approved trading pairs for this challenge. Ideal for creating Meme-only (PEPE, DOGE) or Major-only challenges.'}
                      </p>
                    </div>
                  </div>

                  {/* Botón de Sincronización en Vivo con API de Binance */}
                  <button
                    type="button"
                    onClick={handleSyncBinanceSymbols}
                    disabled={isSyncingSymbols}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto disabled:opacity-50"
                    title={isEs ? 'Consultar endpoint público fapi.binance.com para sincronizar los últimos pares listados' : 'Sync latest listed pairs directly from Binance API'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncingSymbols ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSymbols ? (isEs ? 'Sincronizando Binance...' : 'Syncing Binance...') : (isEs ? 'Sincronizar Binance (API)' : 'Sync Binance (API)')}</span>
                  </button>
                </div>

                {/* Presets Rápidos de 1 Clic para Activos Cripto */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {isEs ? 'Presets Rápidos de Activos (Clic para aplicar)' : 'Quick Asset Presets (Click to apply)'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyPresetSymbols('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        allowedSymbols.length === 0
                          ? 'bg-[#0F172A] text-white border-slate-900 shadow-2xs font-black'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>🌐</span>
                      <span>{isEs ? 'Todos los Pares (749+)' : 'All Pairs (749+)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetSymbols('MAJORS')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-white border-amber-200 text-amber-900 hover:bg-amber-50"
                    >
                      <span>💎</span>
                      <span>{isEs ? 'Solo Top Majors (BTC, ETH, SOL...)' : 'Top Majors (BTC, ETH, SOL...)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetSymbols('MEMES')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100"
                    >
                      <span>🐕</span>
                      <span>{isEs ? 'Meme Titans (PEPE, DOGE, SHIB, FLOKI...)' : 'Meme Titans (PEPE, DOGE, SHIB...)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetSymbols('DEFI')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-cyan-50 border-cyan-200 text-cyan-900 hover:bg-cyan-100"
                    >
                      <span>⚡</span>
                      <span>{isEs ? 'DeFi Tokens (UNI, AAVE, LINK...)' : 'DeFi Tokens (UNI, AAVE...)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetSymbols('AI')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                    >
                      <span>🤖</span>
                      <span>{isEs ? 'AI Tokens (TAO, RENDER, FET...)' : 'AI Tokens (TAO, RENDER...)'}</span>
                    </button>

                    {allowedSymbols.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSymbolSelection}
                        className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer ml-auto"
                      >
                        {isEs ? 'Restablecer a Todos' : 'Reset to All'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Buscador de Pares y Filtro de Categoría */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    {/* Buscador */}
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={symbolSearchQuery}
                        onChange={(e) => setSymbolSearchQuery(e.target.value)}
                        placeholder={isEs ? 'Buscar por símbolo o ticker (ej: PEPE, DOGE, BTC, SOL)...' : 'Search by symbol or ticker (e.g. PEPE, DOGE, BTC)...'}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    {/* Filtro por Categoría */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {(['ALL', 'MEME', 'MAJOR', 'DEFI', 'AI', 'LAYER1'] as const).map(catKey => {
                        const isCatSelected = symbolCategoryFilter === catKey;
                        const labelMap = {
                          ALL: isEs ? 'Todos' : 'All',
                          MEME: '🐕 Memes',
                          MAJOR: '💎 Majors',
                          DEFI: '⚡ DeFi',
                          AI: '🤖 AI',
                          LAYER1: '🌐 L1/L2'
                        };
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => setSymbolCategoryFilter(catKey)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                              isCatSelected
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {labelMap[catKey]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Búsquedas Recientes (Memoización y acceso en 1 tap) */}
                  {recentSearches.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap px-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {isEs ? 'Recientes:' : 'Recent:'}
                      </span>
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSymbolSearchQuery(term)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          {term}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          marketSymbolsService.clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-[9px] text-slate-400 hover:text-rose-500 ml-1 cursor-pointer font-bold"
                        title={isEs ? 'Borrar historial' : 'Clear history'}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-200 gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isEs 
                        ? `Mostrando ${filteredCryptoSymbols.length} pares de Binance` 
                        : `Showing ${filteredCryptoSymbols.length} Binance pairs`}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllFilteredSymbols}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                      >
                        {isEs ? 'Seleccionar Filtrados' : 'Select Filtered'}
                      </button>

                      {selectedFilteredCount > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={deselectAllFilteredSymbols}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                          >
                            {isEs ? `Desmarcar Filtrados (${selectedFilteredCount})` : `Deselect Filtered (${selectedFilteredCount})`}
                          </button>
                        </>
                      )}

                      {allowedSymbols.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={deselectAllSymbols}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                          >
                            {isEs ? `Desmarcar Todos (${allowedSymbols.length})` : `Deselect All (${allowedSymbols.length})`}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tabla / Grid de Activos Cripto Seleccionables */}
                  <div className="max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
                    {filteredCryptoSymbols.slice(0, 120).map(s => {
                      const isSelected = allowedSymbols.includes(s.symbol);
                      const catBadge = {
                        MEME: 'bg-purple-100 text-purple-900 border-purple-200',
                        MAJOR: 'bg-amber-100 text-amber-900 border-amber-200',
                        AI: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                        DEFI: 'bg-cyan-100 text-cyan-900 border-cyan-200',
                        LAYER1: 'bg-blue-100 text-blue-900 border-blue-200',
                        OTHERS: 'bg-slate-100 text-slate-700 border-slate-200'
                      }[s.category];

                      return (
                        <div
                          key={s.symbol}
                          onClick={() => toggleSymbolSelection(s.symbol)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                              : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Manifiesto por el contenedor
                              className="w-3.5 h-3.5 rounded-xs text-amber-600 accent-amber-600 pointer-events-none"
                            />
                            <div className="truncate">
                              <span className="text-xs font-mono font-black text-slate-900 block truncate leading-tight">
                                {s.displayName}
                              </span>
                              <span className={`text-[8px] font-bold px-1 py-0.2 rounded border inline-block leading-none mt-0.5 ${catBadge}`}>
                                {s.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredCryptoSymbols.length > 120 && (
                    <p className="text-[10px] text-slate-400 text-center italic">
                      {isEs ? `Usa el buscador para filtrar entre los ${filteredCryptoSymbols.length} pares disponibles.` : `Use search to filter across all ${filteredCryptoSymbols.length} available pairs.`}
                    </p>
                  )}
                </div>
              </div>

              {/* SECCIÓN 8: MODIFICADORES & ADD-ONS DEL MODELO (CUSTOM ADD-ONS) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 font-black">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          {isEs ? '8. Modificadores & Add-Ons del Modelo (Custom Add-Ons)' : '8. Model Modifiers & Add-Ons'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                          {customAddons.filter(a => a.isActive).length} {isEs ? 'activos' : 'active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isEs 
                          ? 'Configura los add-ons opcionales ofrecidos al trader en la Landing. Cada add-on modifica dinámicamente las reglas del motor de riesgo y ajusta el precio de la cuenta.' 
                          : 'Configure optional upgrades shown on the checkout page. Each add-on dynamically alters risk engine rules and prices.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `addon_${Date.now()}`;
                      const newAddon: ChallengeAddon = {
                        id: newId,
                        targetRule: 'max_leverage',
                        modifierType: 'MULTIPLY_VALUE',
                        modifierValue: 1.5,
                        nameEn: 'Custom Boost Upgrade',
                        nameEs: 'Nuevo Modificador Personalizado',
                        descriptionEn: 'Custom rule modifier for this challenge',
                        descriptionEs: 'Modificador personalizado de reglas para este reto',
                        priceDeltaPct: 0.15,
                        minPriceUSDT: 10,
                        iconName: 'Zap',
                        isActive: true
                      };
                      setCustomAddons(prev => [...prev, newAddon]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Añadir Add-On' : 'Add Add-On'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {customAddons.map((addon, aIdx) => (
                    <div 
                      key={addon.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        addon.isActive 
                          ? 'bg-purple-50/40 border-purple-300/80 shadow-2xs' 
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addon.isActive}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, isActive: checked } : a));
                            }}
                            className="w-4 h-4 rounded-xs text-purple-600 accent-purple-600 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-black text-slate-900">
                            {isEs ? addon.nameEs : addon.nameEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomAddons(prev => prev.filter((_, i) => i !== aIdx));
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isEs ? 'Eliminar este add-on' : 'Delete add-on'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2.5 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block">
                            {isEs ? 'Nombre (Español)' : 'Name (Spanish)'}
                          </label>
                          <input
                            type="text"
                            value={addon.nameEs}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, nameEs: val } : a));
                            }}
                            className="w-full px-2 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block">
                            {isEn ? 'Name (English)' : 'Nombre (Inglés)'}
                          </label>
                          <input
                            type="text"
                            value={addon.nameEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, nameEn: val } : a));
                            }}
                            className="w-full px-2 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block">
                            {isEs ? 'Incremento de Precio (% del Plan)' : 'Price Markup (% of Plan)'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={Math.round((addon.priceDeltaPct || 0) * 100)}
                              onChange={(e) => {
                                const val = Number(e.target.value) / 100;
                                setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, priceDeltaPct: val } : a));
                              }}
                              className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block">
                            {isEs ? 'Precio Mínimo (USDT)' : 'Minimum Price (USDT)'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={addon.minPriceUSDT || 0}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, minPriceUSDT: val } : a));
                              }}
                              className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USDT</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-xs">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">
                          {isEs ? 'Regla de Riesgo que Modifica' : 'Target Risk Rule'}
                        </label>
                        <select
                          value={addon.targetRule}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setCustomAddons(prev => prev.map((a, i) => i === aIdx ? { ...a, targetRule: val } : a));
                          }}
                          className="w-full px-2 py-1 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                        >
                          <option value="max_leverage">Apalancamiento Máximo (Leverage Boost)</option>
                          <option value="max_total_drawdown_percent">Drawdown Total Máximo (+% Shield)</option>
                          <option value="profit_split_percent">Reparto de Beneficio (Profit Split Boost)</option>
                          <option value="payout_frequency">Frecuencia de Retiro (Weekly Accelerated)</option>
                          <option value="weekend_holding_allowed">Operativa en Fin de Semana Permitida</option>
                          <option value="mandatory_stop_loss">Exención de Stop Loss Obligatorio</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Inferior de Guardado */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  {isEs 
                    ? `Configuración activa para ${sizeTiers.length} ${sizeTiers.length === 1 ? 'tamaño' : 'tamaños'} de cuenta.` 
                    : `Active configuration for ${sizeTiers.length} account ${sizeTiers.length === 1 ? 'size' : 'sizes'}.`}
                </div>

                <div className="flex items-center gap-3">
                  {(onDeleteRule || onDeleteRules) && activeGroup && (
                    <button
                      onClick={(e) => handleDeleteModelGroup(activeGroup, e)}
                      disabled={isDeleting}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
                      title={isEs ? 'Eliminar este modelo de challenge de la base de datos' : 'Delete this challenge model from the database'}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>{isDeleting ? (isEs ? 'Eliminando...' : 'Deleting...') : (isEs ? 'Eliminar Modelo' : 'Delete Model')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleSaveAllTiers}
                    disabled={isSaving}
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#EAB308] stroke-[2.5]" />
                    <span>{isSaving ? (isEs ? 'Guardando Modelo...' : 'Saving Model...') : (isEs ? `Guardar Modelo de Challenge (${sizeTiers.length} Tamaños)` : `Save Challenge Model (${sizeTiers.length} Sizes)`)}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: PROBADOR DE REGLAS EN VIVO (LIVE SANDBOX & SIMULATOR)  */}
          {/* ================================================================= */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              
              {/* Tarjeta de Estado de la Cuenta Simulada */}
              <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-white">
                          SIM-ACCOUNT: {name || 'Challenge Activo'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          simStatus === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                            : simStatus === 'BREACHED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                              : simStatus === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        }`}>
                          {simStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-slate-400 font-mono">
                          Motor Risk Daemon: <strong className="text-emerald-400">ONLINE (RAM 24/7)</strong> | Latencia sub-1ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas del Simulador */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateRollover}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      title={isEs ? 'Simular cambio de día 00:00 UTC' : 'Simulate 00:00 UTC day rollover'}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEs ? 'Rollover 00:00 UTC' : 'UTC Rollover'}</span>
                    </button>

                    <button
                      onClick={handleResetSimulator}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/60 text-xs font-bold text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
                      title={isEs ? 'Reiniciar simulación' : 'Reset simulator'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isEs ? 'Reset' : 'Reset'}</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* CONTROL MANUAL DE ESTRÉS DE CAPITAL & PnL (SLIDER INTERACTIVO + DISPARADORES) */}
                {/* ========================================================================= */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                        Control Manual de Estrés de Capital & PnL Flotante
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Variación Manual: <span className={manualStressUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {manualStressUsd >= 0 ? `+$${manualStressUsd.toLocaleString()}` : `-$${Math.abs(manualStressUsd).toLocaleString()}`} USD ({simManualStressPct >= 0 ? `+${simManualStressPct.toFixed(1)}%` : `${simManualStressPct.toFixed(1)}%`})
                      </span>
                    </span>
                  </div>

                  {/* Botones de Estrés Rápido de 1 Clic */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimManualStressPct(-Number((maxDailyLossPercent + 0.5).toFixed(1)))}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-200 text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                      <span>Brecha Diaria (-{(maxDailyLossPercent + 0.5).toFixed(1)}%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimManualStressPct(-Number((maxTotalDrawdownPercent + 0.5).toFixed(1)))}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/90 border border-rose-700 text-rose-100 text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>Brecha Total (-{(maxTotalDrawdownPercent + 0.5).toFixed(1)}%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimManualStressPct(profitTargetPercent > 0 ? profitTargetPercent : 10)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700 text-emerald-200 text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      <span>Meta Profit (+{profitTargetPercent > 0 ? profitTargetPercent : 10}%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimManualStressPct(0)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-400" />
                      <span>Neutral (0% Estrés)</span>
                    </button>
                  </div>

                  {/* Deslizador Continuo de Estrés (-25% a +25%) */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min={-25}
                      max={25}
                      step={0.1}
                      value={simManualStressPct}
                      onChange={(e) => setSimManualStressPct(parseFloat(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
                      <span className="text-rose-400 font-bold">-25% (Extremo)</span>
                      <span className="text-rose-300">-{maxTotalDrawdownPercent}% (Max DD)</span>
                      <span className="text-slate-300 font-bold">0% Neutral</span>
                      <span className="text-emerald-300">+{profitTargetPercent}% (Target)</span>
                      <span className="text-emerald-400 font-bold">+25% (Extremo)</span>
                    </div>
                  </div>
                </div>

                {/* Métricas Principales de Equidad y Drawdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Balance Cerrado</span>
                    <span className="text-lg font-mono font-black text-white">${simBalance.toLocaleString()}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Equidad Flotante</span>
                    <span className={`text-lg font-mono font-black ${totalFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${simEquity.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      ({totalFloatingPnl >= 0 ? `+$${totalFloatingPnl.toFixed(2)}` : `-$${Math.abs(totalFloatingPnl).toFixed(2)}`})
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Drawdown Diario ({drawdownType})</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-lg font-mono font-black ${simDailyLossPct >= maxDailyLossPercent ? 'text-rose-500' : 'text-slate-200'}`}>
                        {simDailyLossPct.toFixed(2)}%
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ {maxDailyLossPercent}%</span>
                    </div>
                    {/* Barra de Progresión de Riesgo Diario */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                      <div 
                        className={`h-full transition-all duration-200 ${
                          simDailyLossPct >= maxDailyLossPercent ? 'bg-rose-500' : simDailyLossPct >= maxDailyLossPercent * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (simDailyLossPct / (maxDailyLossPercent || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Drawdown Total</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-lg font-mono font-black ${simTotalLossPct >= maxTotalDrawdownPercent ? 'text-rose-500' : 'text-slate-200'}`}>
                        {simTotalLossPct.toFixed(2)}%
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ {maxTotalDrawdownPercent}%</span>
                    </div>
                    {/* Barra de Progresión de Riesgo Total */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                      <div 
                        className={`h-full transition-all duration-200 ${
                          simTotalLossPct >= maxTotalDrawdownPercent ? 'bg-rose-500' : simTotalLossPct >= maxTotalDrawdownPercent * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (simTotalLossPct / (maxTotalDrawdownPercent || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner de Reparto Estimado en Vivo (Profit Split) */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-400 font-medium">Profit Split de la Cuenta:</span>
                    <span className="font-mono font-black text-emerald-400">{profitSplitPercent}% Trader</span>
                    <span className="text-slate-600">/</span>
                    <span className="font-mono font-bold text-slate-300">{100 - profitSplitPercent}% Firma</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Payout Trader:</span>
                      <span className="text-emerald-400 font-black">
                        ${(Math.max(0, simBalance - defaultAccountBalance) * profitSplitPercent / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Margen Firma:</span>
                      <span className="text-slate-300 font-bold">
                        ${(Math.max(0, simBalance - defaultAccountBalance) * (100 - profitSplitPercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barras de Progreso: Objetivo de Ganancia y Días Operados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">
                        {modelType === 'INSTANT_FUNDING' ? 'Fondeo Directo (Sin Target)' : `Objetivo de Ganancia (+${profitTargetPercent}%)`}
                      </span>
                      <span className="font-mono text-emerald-400">
                        {modelType === 'INSTANT_FUNDING' ? 'Activo' : `${simProfitPct.toFixed(2)}% / ${profitTargetPercent}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, (simProfitPct / profitTargetPercent) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Días Mínimos Calificados</span>
                      <span className="font-mono text-amber-400">
                        {simTradingDays} / {minTradingDays} días
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (simTradingDays / (minTradingDays || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Creación de Orden Simulada (Para Probar Reglas en Vivo con Precios Binance) */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-black text-[#0F172A]">
                      {isEs ? 'Simulador de Órdenes & Precios en Vivo' : 'Order Simulator & Live Prices'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      BTC: ${livePrices.BTCUSDT?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ETH: ${livePrices.ETHUSDT?.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={handleManualRefreshPrices}
                      disabled={isSyncingPrices}
                      className="px-2.5 py-1 text-[11px] font-sans font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={isEs ? 'Actualizar precios manualmente de Binance' : 'Manually fetch Binance prices'}
                    >
                      <RefreshCw className={`w-3 h-3 text-amber-600 ${isSyncingPrices ? 'animate-spin' : ''}`} />
                      <span>{isSyncingPrices ? (isEs ? 'Actualizando...' : 'Updating...') : (isEs ? 'Actualizar' : 'Refresh')}</span>
                    </button>
                  </div>
                </div>

                {/* Parámetros de la Orden de Prueba */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Activo</label>
                    <select
                      value={simOrderSymbol}
                      onChange={(e) => setSimOrderSymbol(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl"
                    >
                      <option value="BTCUSDT">BTC/USDT (${livePrices.BTCUSDT?.toLocaleString()})</option>
                      <option value="ETHUSDT">ETH/USDT (${livePrices.ETHUSDT?.toLocaleString()})</option>
                      <option value="SOLUSDT">SOL/USDT (${livePrices.SOLUSDT?.toLocaleString()})</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Sentido</label>
                    <div className="grid grid-cols-2 gap-1 bg-[#fbf9f5] p-1 rounded-xl border border-slate-300">
                      <button
                        type="button"
                        onClick={() => setSimOrderSide('LONG')}
                        className={`py-1 rounded-lg text-xs font-black transition-all ${
                          simOrderSide === 'LONG' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        LONG
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimOrderSide('SHORT')}
                        className={`py-1 rounded-lg text-xs font-black transition-all ${
                          simOrderSide === 'SHORT' ? 'bg-rose-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        SHORT
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tamaño (Unidades)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={simOrderUnits}
                      onChange={(e) => setSimOrderUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Apalancamiento</label>
                    <input
                      type="number"
                      value={simOrderLeverage}
                      onChange={(e) => setSimOrderLeverage(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#fbf9f5] border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Parámetros de SL y TP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={simOrderHasSl}
                          onChange={(e) => setSimOrderHasSl(e.target.checked)}
                          className="rounded-sm text-amber-600"
                        />
                        <span>Configurar Stop Loss</span>
                      </label>
                      <span className="font-mono font-bold text-rose-700">
                        {calculatedSlPrice ? `$${calculatedSlPrice.toLocaleString()}` : 'Sin SL'}
                      </span>
                    </div>
                    {simOrderHasSl && (
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.1"
                        value={simOrderSlDistancePct}
                        onChange={(e) => setSimOrderSlDistancePct(Number(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={simOrderHasTp}
                          onChange={(e) => setSimOrderHasTp(e.target.checked)}
                          className="rounded-sm text-amber-600"
                        />
                        <span>Configurar Take Profit</span>
                      </label>
                      <span className="font-mono font-bold text-emerald-700">
                        {calculatedTpPrice ? `$${calculatedTpPrice.toLocaleString()}` : 'Sin TP'}
                      </span>
                    </div>
                    {simOrderHasTp && (
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={simOrderTpDistancePct}
                        onChange={(e) => setSimOrderTpDistancePct(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    )}
                  </div>
                </div>

                {/* Botones de Acción de Prueba */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleTestPreTradeValidation}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <span>{isEs ? 'Validar Pre-Trade (Check Rules)' : 'Validate Pre-Trade'}</span>
                  </button>

                  <button
                    onClick={handleExecuteSimulatedOrder}
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>{isEs ? 'Ejecutar Orden Simulada' : 'Execute Simulated Order'}</span>
                  </button>
                </div>
              </div>

              {/* Posiciones Abiertas en el Simulador */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    {isEs ? `Posiciones Abiertas en Simulador (${simPositions.length})` : `Open Simulated Positions (${simPositions.length})`}
                  </span>
                </div>

                <div className="space-y-2">
                  {simPositions.map(pos => {
                    const liveP = livePrices[pos.symbol] || pos.currentPrice;
                    const diff = pos.side === 'LONG' ? (liveP - pos.entryPrice) : (pos.entryPrice - liveP);
                    const pnl = Number((diff * pos.sizeUnits).toFixed(2));

                    return (
                      <div
                        key={pos.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-[#fbf9f5] flex items-center justify-between gap-3 text-xs font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            pos.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {pos.side} {pos.leverage}x
                          </span>
                          <span className="font-extrabold text-slate-900">{pos.symbol}</span>
                          <span className="font-mono text-slate-500">{pos.sizeUnits} unidades</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Precio / Entrada</span>
                            <span className="font-mono font-bold text-slate-800">${liveP.toLocaleString()}</span>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-[10px] text-slate-400 block font-bold">PnL Flotante</span>
                            <span className={`font-mono font-black ${pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {pnl >= 0 ? `+$${pnl}` : `-$${Math.abs(pnl)}`}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCloseSimPosition(pos.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {simPositions.length === 0 && (
                    <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
                      <span className="text-xs text-slate-500 font-medium">
                        {isEs ? 'No hay operaciones abiertas. Pulsa "Ejecutar Orden Simulada" para probar el motor de riesgo.' : 'No open positions. Click "Execute Simulated Order" to test.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SUITE DE PRUEBAS INSTITUCIONALES REGLA POR REGLA (CONECTADA AL SERVIDOR)  */}
              {/* ========================================================================= */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                        <span>{isEs ? 'Suite de Pruebas Institucionales Regla por Regla' : 'Rule-by-Rule Institutional Test Suite'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {isEs ? 'Verificación Server en RAM' : 'Server RAM Verified'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isEs 
                          ? 'Prueba de forma individual cada una de las 13 reglas institucionales para certificar que el motor las ejecuta con precisión y diagnostica infracciones.' 
                          : 'Test each institutional rule individually to certify that the engine executes them with precision.'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-500 self-start sm:self-auto bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    ⚡ Servidor WebSocket & API: 8080
                  </span>
                </div>

                {/* Grid de Tarjetas de Prueba Regla por Regla */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  
                  {/* REGLA 1: PÉRDIDA DIARIA */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                        1. Drawdown Diario ({drawdownType})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Límite: -{maxDailyLossPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Calcula la pérdida del día frente a la base ({drawdownType === 'EOD' ? 'Equidad 00:00 UTC' : 'High Watermark'}). Al rebasarlo, congela y descalifica.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={testingRuleType === 'MAX_DAILY_DRAWDOWN'}
                        onClick={() => executeRuleTest('MAX_DAILY_DRAWDOWN')}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{testingRuleType === 'MAX_DAILY_DRAWDOWN' ? 'Evaluando...' : 'Probar Infracción Diaria'}</span>
                      </button>
                    </div>
                    {ruleTestResults['MAX_DAILY_DRAWDOWN'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MAX_DAILY_DRAWDOWN'].status === 'BREACHED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MAX_DAILY_DRAWDOWN'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MAX_DAILY_DRAWDOWN'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MAX_DAILY_DRAWDOWN'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 2: PÉRDIDA TOTAL */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        2. Drawdown Total Acumulado
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Límite: -{maxTotalDrawdownPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Pérdida acumulada absoluta respecto al balance de partida (${defaultAccountBalance.toLocaleString()} USD). Infracción definitiva.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={testingRuleType === 'MAX_TOTAL_DRAWDOWN'}
                        onClick={() => executeRuleTest('MAX_TOTAL_DRAWDOWN')}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{testingRuleType === 'MAX_TOTAL_DRAWDOWN' ? 'Evaluando...' : 'Probar Infracción Total'}</span>
                      </button>
                    </div>
                    {ruleTestResults['MAX_TOTAL_DRAWDOWN'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MAX_TOTAL_DRAWDOWN'].status === 'BREACHED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MAX_TOTAL_DRAWDOWN'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MAX_TOTAL_DRAWDOWN'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MAX_TOTAL_DRAWDOWN'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 3: STOP LOSS OBLIGATORIO */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        3. Stop Loss Obligatorio (Pre-Trade)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        mandatoryStopLoss ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {mandatoryStopLoss ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Rechaza inmediatamente en milisegundos cualquier orden en mercado o límite enviada sin precio de protección de Stop Loss.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MANDATORY_STOP_LOSS', { slPrice: null })}
                        className="px-3 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-950 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Probar Orden Sin SL (Rechazo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MANDATORY_STOP_LOSS', { slPrice: 65000 })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Probar Con SL (Aprobado)</span>
                      </button>
                    </div>
                    {ruleTestResults['MANDATORY_STOP_LOSS'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MANDATORY_STOP_LOSS'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MANDATORY_STOP_LOSS'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MANDATORY_STOP_LOSS'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MANDATORY_STOP_LOSS'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 4: REGLA ANTI-HEDGING */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-purple-600" />
                        4. Regla Anti-Hedging Bilateral
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        antiHedgingEnabled ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {antiHedgingEnabled ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Prohíbe mantener simultáneamente posiciones LONG y SHORT en el mismo par cripto o activo financiero.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('ANTI_HEDGING', { symbol: 'BTCUSDT', side: 'SHORT' })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Probar Conflicto LONG + SHORT</span>
                      </button>
                    </div>
                    {ruleTestResults['ANTI_HEDGING'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['ANTI_HEDGING'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['ANTI_HEDGING'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['ANTI_HEDGING'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['ANTI_HEDGING'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 5: LÍMITE POR ACTIVO */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        5. Límite de Posiciones por Activo
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        maxPositionsPerSymbolEnabled ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {maxPositionsPerSymbolEnabled ? `Máx: ${maxPositionsPerSymbol}` : 'Sin límite'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Restringe el número máximo de operaciones abiertas simultáneas en una misma moneda o símbolo.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MAX_POSITIONS_PER_SYMBOL', { symbol: 'BTCUSDT' })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Probar Cupo en BTCUSDT</span>
                      </button>
                    </div>
                    {ruleTestResults['MAX_POSITIONS_PER_SYMBOL'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MAX_POSITIONS_PER_SYMBOL'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MAX_POSITIONS_PER_SYMBOL'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MAX_POSITIONS_PER_SYMBOL'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MAX_POSITIONS_PER_SYMBOL'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 6: LÍMITE TOTAL DE OPERACIONES */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        6. Límite Total de Posiciones Abiertas
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        maxTotalOpenPositionsEnabled ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {maxTotalOpenPositionsEnabled ? `Máx: ${maxTotalOpenPositions}` : 'Sin límite'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Controla el número global de posiciones concurrentes permitidas en la cuenta para mitigar sobre-exposición.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MAX_TOTAL_POSITIONS')}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Probar Cupo Global de Cuenta</span>
                      </button>
                    </div>
                    {ruleTestResults['MAX_TOTAL_POSITIONS'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MAX_TOTAL_POSITIONS'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MAX_TOTAL_POSITIONS'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MAX_TOTAL_POSITIONS'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MAX_TOTAL_POSITIONS'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 7: APALANCAMIENTO MÁXIMO */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        7. Apalancamiento Máximo Autorizado
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Máx: {maxLeverage}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Rechaza en Pre-Trade cualquier orden con factor de multiplicación superior al tope institucional configurado.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MAX_LEVERAGE', { leverage: 150 })}
                        className="px-3 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-950 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Probar 150x (Debe Rechazar)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MAX_LEVERAGE', { leverage: Math.min(20, maxLeverage) })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Probar {Math.min(20, maxLeverage)}x (Aprobado)</span>
                      </button>
                    </div>
                    {ruleTestResults['MAX_LEVERAGE'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MAX_LEVERAGE'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MAX_LEVERAGE'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MAX_LEVERAGE'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MAX_LEVERAGE'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 8: DÍAS MÍNIMOS CALIFICADOS */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        8. Días Mínimos Calificados & Umbral
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {minTradingDays} días | Umbral: {minDailyProfitValue}{minDailyProfitType === 'PERCENT' ? '%' : ' USD'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Sólo contabiliza una jornada si el trader obtiene un beneficio neto mayor o igual al umbral fijado. Pérdidas no califican.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('QUALIFIED_DAYS', { dayProfitUsd: 50 })}
                        className="px-3 py-1.5 rounded-lg bg-amber-900/90 hover:bg-amber-950 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Ganancia $50 (Bajo Umbral)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRuleTest('QUALIFIED_DAYS', { dayProfitUsd: 800 })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Ganancia $800 (Califica +1 Día)</span>
                      </button>
                    </div>
                    {ruleTestResults['QUALIFIED_DAYS'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['QUALIFIED_DAYS'].status === 'ALLOWED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['QUALIFIED_DAYS'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['QUALIFIED_DAYS'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['QUALIFIED_DAYS'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 9: REGLA DE CONSISTENCIA */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-600" />
                        9. Regla de Consistencia ({consistencyRulePercent}%)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Auditada al Payout
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Ningún día individual puede representar más del {consistencyRulePercent}% de las ganancias totales para poder retirar beneficios.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('CONSISTENCY', { totalProfitUsd: 10000, bestDayProfitUsd: 6500 })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Auditar Payout con Jornada al 65%</span>
                      </button>
                    </div>
                    {ruleTestResults['CONSISTENCY'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['CONSISTENCY'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['CONSISTENCY'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['CONSISTENCY'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['CONSISTENCY'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 10: MICROSCALPING */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        10. Duración Mínima (Anti-Microscalp)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Mínimo: {minTradeDurationSeconds}s
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Las operaciones cerradas en menos de {minTradeDurationSeconds} segundos no suman beneficio al objetivo de pase.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MICROSCALPING', { durationSeconds: 3 })}
                        className="px-3 py-1.5 rounded-lg bg-amber-900/90 hover:bg-amber-950 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Cierre en 3s (Microscalp)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRuleTest('MICROSCALPING', { durationSeconds: 45 })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Cierre en 45s (Institucional)</span>
                      </button>
                    </div>
                    {ruleTestResults['MICROSCALPING'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['MICROSCALPING'].status === 'ALLOWED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['MICROSCALPING'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['MICROSCALPING'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['MICROSCALPING'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 11: FIN DE SEMANA (WEEKEND HOLDING) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-700" />
                        11. Cierre de Fin de Semana (Weekend Holding)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        weekendHoldingAllowed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {weekendHoldingAllowed ? 'Permitido (24/7)' : 'Prohibido'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Determina si el trader puede mantener posiciones abiertas durante el corte del fin de semana (Viernes 22:00 UTC).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('WEEKEND_HOLDING', { isWeekend: true })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Simular Mantener en Viernes Noche</span>
                      </button>
                    </div>
                    {ruleTestResults['WEEKEND_HOLDING'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['WEEKEND_HOLDING'].status === 'BREACHED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['WEEKEND_HOLDING'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['WEEKEND_HOLDING'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['WEEKEND_HOLDING'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 12: TRADING EN NOTICIAS */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        12. Restricción de Noticias (News Trading)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        newsTradingAllowed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {newsTradingAllowed ? 'Permitido' : 'Prohibido'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Controla si se autoriza abrir órdenes dentro de la ventana de alta volatilidad (FOMC / IPC / Nóminas No Agrícolas).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('NEWS_TRADING', { isNewsWindow: true, eventName: 'FOMC Rate Decision' })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Probar Orden en Ventana FOMC</span>
                      </button>
                    </div>
                    {ruleTestResults['NEWS_TRADING'] && (
                      <div className={`p-2.5 rounded-lg text-xs border font-medium ${
                        ruleTestResults['NEWS_TRADING'].status === 'REJECTED' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{ruleTestResults['NEWS_TRADING'].title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⚡ {ruleTestResults['NEWS_TRADING'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px]">{ruleTestResults['NEWS_TRADING'].reason}</p>
                      </div>
                    )}
                  </div>

                  {/* REGLA 13: PROFIT TARGET / RETO APROBADO */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#fbf9f5] space-y-2.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        13. Objetivo de Ganancia & Aprobación de Fase (PASSED)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {modelType === 'INSTANT_FUNDING' ? 'Fondeo Directo' : `Target: +${profitTargetPercent}% | Mín: ${minTradingDays} días`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Evalúa simultáneamente si el trader alcanzó el beneficio neto exigido y cumplió con el total de días mínimos de operativa calificados para certificar la cuenta como APROBADA (PASSED).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => executeRuleTest('PROFIT_TARGET')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                        <span>Simular Auditoría de Pase de Challenge</span>
                      </button>
                    </div>
                    {ruleTestResults['PROFIT_TARGET'] && (
                      <div className={`p-3 rounded-xl text-xs border font-medium ${
                        ruleTestResults['PROFIT_TARGET'].status === 'PASSED' 
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' 
                          : 'bg-blue-50 border-blue-300 text-blue-950'
                      }`}>
                        <div className="flex items-center justify-between font-black mb-1">
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-600 fill-amber-600" />
                            {ruleTestResults['PROFIT_TARGET'].title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">⚡ Server: {ruleTestResults['PROFIT_TARGET'].serverLatencyMs}ms</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{ruleTestResults['PROFIT_TARGET'].reason}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>



              {/* Registro de Auditoría y Eventos en Vivo (Log Console) */}
              <div className="p-5 rounded-2xl bg-slate-950 text-slate-300 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                  <span className="font-bold flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>AUDITORÍA EN VIVO (EVENT LOG)</span>
                  </span>
                  <span className="text-[10px]">Últimos 50 eventos</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2.5 py-1 border-b border-slate-900 last:border-none">
                      <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-black shrink-0 ${
                        log.status === 'ALLOWED' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : log.status === 'PASSED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {log.status}
                      </span>
                      <div>
                        <span className="text-slate-200 font-bold block">{log.title}</span>
                        <span className="text-slate-400 text-[11px] leading-tight block">{log.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
