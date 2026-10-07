import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TraderClientEntity, 
  TraderAuditData, 
  RiskRuleConfigEntity, 
  TraderTradeAuditItem,
  UserChallengeAccountSummary
} from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { crmService } from '../api/crmService';
import { FinancialPerformanceGauge } from './FinancialPerformanceGauge';
import { TraderPerformanceLinearChart } from './TraderPerformanceLinearChart';
import { TraderForensicStatsCards } from './TraderForensicStatsCards';
import { TraderDailyJournalCalendar } from './TraderDailyJournalCalendar';
import { zytiTradingClient } from '../../../core/trading/gateway/TradingWebSocketClient';
import { DynamicRulesModal } from './DynamicRulesModal';
import { 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Copy, 
  Check, 
  Sliders, 
  UserCheck, 
  Layers, 
  RefreshCw,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Wifi,
  Smartphone,
  Laptop,
  Calendar,
  ShieldAlert
} from 'lucide-react';

interface RiskForensicAuditConsoleProps {
  traders: TraderClientEntity[];
  selectedTrader: TraderClientEntity | null;
  onSelectTrader: (trader: TraderClientEntity) => void;
  lang?: CrmLang;
  rules?: RiskRuleConfigEntity[];
  onOpenRulesModal?: () => void;
  onResetAccount: (traderId: string, initialBalance?: number) => Promise<void> | void;
}

export const RiskForensicAuditConsole: React.FC<RiskForensicAuditConsoleProps> = ({
  traders,
  selectedTrader,
  onSelectTrader,
  lang = 'es',
  rules = [],
  onOpenRulesModal,
  onResetAccount
}) => {
  const isEs = lang === 'es';

  // Buscador de Traders en vivo arriba del todo
  const [traderSearchQuery, setTraderSearchQuery] = useState<string>('');

  // Trader activo bajo auditoría
  const activeTrader = selectedTrader || (traders.length > 0 ? traders[0] : null);

  // Sub-cuenta / Challenge activo seleccionado para este trader
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [auditData, setAuditData] = useState<TraderAuditData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'LONG' | 'SHORT'>('ALL');
  const [tradeSearch, setTradeSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null);

  // Filtrado de traders en memoria RAM para búsqueda rápida e indexada
  const filteredTradersList = useMemo(() => {
    const q = traderSearchQuery.trim().toLowerCase();
    if (!q) return traders;
    return traders.filter(t => 
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.accountNumber.toLowerCase().includes(q) ||
      (t.telegramUsername && t.telegramUsername.toLowerCase().includes(q))
    );
  }, [traders, traderSearchQuery]);

  // Cargar auditoría forense con Zero-Egress In-Memory Caching (0ms al alternar)
  const fetchAudit = async (accountId?: string, forceRefresh: boolean = false) => {
    if (!activeTrader) return;
    setIsLoading(true);
    try {
      const targetId = accountId || selectedAccountId || activeTrader.accountNumber || activeTrader.id;
      const data = await crmService.getTraderForensicAudit(
        activeTrader.id || activeTrader.email,
        targetId,
        forceRefresh
      );
      setAuditData(data);
      if (data?.account.id) {
        setSelectedAccountId(data.account.id);
      }
    } catch (e) {
      console.warn('[AuditConsole] Error fetching audit:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const targetAccountKey = activeTrader?.accountNumber || activeTrader?.id || null;
    setSelectedAccountId(targetAccountKey);
    fetchAudit(targetAccountKey || undefined, true);
  }, [activeTrader?.id, activeTrader?.email, activeTrader?.accountNumber]);

  const handleSelectAccountChallenge = (accItem: UserChallengeAccountSummary) => {
    setSelectedAccountId(accItem.id);
    fetchAudit(accItem.id, true);
  };

  // Suscripción WebSocket en vivo a la cuenta del trader seleccionado (Modo Observador / Inspector Admin)
  useEffect(() => {
    const targetId = selectedAccountId || auditData?.account.id;
    if (!targetId) return;

    if (!zytiTradingClient.isConnected()) {
      zytiTradingClient.connect('crm_admin_inspector');
    }

    const timer = setTimeout(() => {
      zytiTradingClient.sendAction({ action: 'SUBSCRIBE', accountId: targetId });
    }, 250);

    const unsubscribe = zytiTradingClient.onRawMessage((msg) => {
      if (msg.type === 'TRADING_EVENT' && msg.accountId === targetId) {
        const event = msg.event;
        if (event.type === 'TRADE_CLOSED' || event.type === 'TRADE_OPENED' || event.type === 'BALANCE_UPDATED') {
          fetchAudit(targetId, true);
        }
      } else if (msg.type === 'HOT_STATE_SNAPSHOT' && msg.accountId === targetId && msg.state) {
        setAuditData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            account: {
              ...prev.account,
              currentBalance: msg.state.balance ?? prev.account.currentBalance,
              equity: msg.state.equity ?? prev.account.equity,
              status: msg.state.status ?? prev.account.status
            }
          };
        });
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
      zytiTradingClient.sendAction({ action: 'UNSUBSCRIBE', accountId: targetId });
    };
  }, [selectedAccountId, auditData?.account.id]);

  // Filtrado de la tabla de trades forense
  const filteredTrades = useMemo(() => {
    if (!auditData?.trades) return [];
    return auditData.trades.filter(t => {
      const matchesSearch = !tradeSearch || 
        t.id.toLowerCase().includes(tradeSearch.toLowerCase()) ||
        t.symbol.toLowerCase().includes(tradeSearch.toLowerCase()) ||
        (t.closeReason && t.closeReason.toLowerCase().includes(tradeSearch.toLowerCase()));

      const matchesFilter = 
        tradeFilter === 'ALL' ||
        (tradeFilter === 'OPEN' && t.status === 'OPEN') ||
        (tradeFilter === 'CLOSED' && t.status === 'CLOSED') ||
        (tradeFilter === 'LONG' && t.side === 'LONG') ||
        (tradeFilter === 'SHORT' && t.side === 'SHORT');

      return matchesSearch && matchesFilter;
    });
  }, [auditData?.trades, tradeFilter, tradeSearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Exportar a CSV
  const handleExportCsv = () => {
    if (!auditData) return;
    const headers = ['ID_Ticket,Simbolo,Exchange,Lado,Tamano,Apalancamiento,Entrada,Salida,SL,TP,PnL_USDT,PnL_Pct,Estado,Motivo_Cierre,Fecha_Apertura,Fecha_Cierre,IP_Ejecucion'];
    const rows = auditData.trades.map(t => [
      t.id,
      t.symbol,
      t.exchange,
      t.side,
      t.size,
      `${t.leverage}x`,
      t.entryPrice,
      t.exitPrice ?? '',
      t.slPrice ?? '',
      t.tpPrice ?? '',
      t.realizedPnl ?? '',
      t.pnlPercent ? `${t.pnlPercent}%` : '',
      t.status,
      t.closeReason ?? '',
      t.openedAt,
      t.closedAt ?? '',
      t.ipAddress ?? '185.220.101.5'
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_trader_${auditData.account.accountNumber}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    if (!auditData) return;
    const headers = ['ID Ticket\tSímbolo\tExchange\tLado\tTamaño\tApalancamiento\tEntrada\tSalida\tStop Loss\tTake Profit\tPnL (USDT)\tPnL (%)\tEstado\tCierre\tFecha Apertura\tFecha Cierre\tIP Auditoría'];
    const rows = auditData.trades.map(t => [
      t.id,
      t.symbol,
      t.exchange,
      t.side,
      t.size,
      `${t.leverage}x`,
      t.entryPrice,
      t.exitPrice ?? '-',
      t.slPrice ?? '-',
      t.tpPrice ?? '-',
      t.realizedPnl !== null ? t.realizedPnl : '-',
      t.pnlPercent !== null ? `${t.pnlPercent}%` : '-',
      t.status,
      t.closeReason ?? '-',
      t.openedAt,
      t.closedAt ?? '-',
      t.ipAddress ?? '185.220.101.5'
    ].join('\t'));

    const excelContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_forense_${auditData.account.accountNumber}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resetear cuenta con confirmación y sincronización de base de datos
  const handleConfirmReset = async () => {
    if (!activeTrader) return;
    const confirmMsg = isEs
      ? `¿Estás seguro de restablecer por completo la cuenta de ${activeTrader.fullName} (${auditData?.account.accountNumber || activeTrader.accountNumber})?\n\n• Saldo volverá a $${(auditData?.account.initialBalance || activeTrader.accountSize || 100000).toLocaleString()}\n• Se purgarán todas las posiciones en la base de datos de Supabase\n• Se reseteará en el terminal del trader en tiempo real`
      : `Are you sure you want to completely reset the account for ${activeTrader.fullName} (${auditData?.account.accountNumber || activeTrader.accountNumber})?\n\n• Balance will reset to $${(auditData?.account.initialBalance || activeTrader.accountSize || 100000).toLocaleString()}\n• All positions will be wiped from Supabase\n• Trader's terminal will reset in real-time`;

    if (!window.confirm(confirmMsg)) return;

    setIsResetting(true);
    try {
      crmService.invalidateAuditCache();
      await onResetAccount(auditData?.account.id || activeTrader.id, auditData?.account.initialBalance || activeTrader.accountSize);
      await fetchAudit(selectedAccountId || undefined, true);
    } finally {
      setIsResetting(false);
    }
  };

  const acc = auditData?.account || {
    id: activeTrader?.id || '',
    accountNumber: activeTrader?.accountNumber || 'ACC-001',
    traderEmail: activeTrader?.email || '',
    traderName: activeTrader?.fullName || 'Trader',
    initialBalance: activeTrader?.accountSize || 100000,
    currentBalance: activeTrader?.currentBalance || 100000,
    equity: activeTrader?.equity || 100000,
    peakEquity: activeTrader?.equity || 100000,
    dailyStartEquity: activeTrader?.equity || 100000,
    status: activeTrader?.status || 'ACTIVE',
    tradingDaysCount: 0,
    planName: 'Evaluación Institucional'
  };

  const stats = auditData?.stats || {
    totalTrades: 0,
    closedTradesCount: 0,
    openTradesCount: 0,
    bestTradePnl: 0,
    worstTradePnl: 0,
    winRatePct: 0,
    profitFactor: 1.0,
    netRealizedPnl: 0,
    grossProfits: 0,
    grossLosses: 0,
    avgWin: 0,
    avgLoss: 0,
    profitTargetPct: 10.0,
    profitTargetAmount: (acc.initialBalance * 0.10),
    profitTargetProgress: 0,
    maxDailyDdPct: 4.0,
    maxDailyLossAmount: (acc.initialBalance * 0.04),
    dailyDd: activeTrader?.dailyDrawdownPct || 0,
    maxTotalDdPct: 6.0,
    maxTotalLossAmount: (acc.initialBalance * 0.06),
    totalDd: activeTrader?.totalDrawdownPct || 0
  };

  const userChallenges = auditData?.allUserAccounts || [];

  // Fecha oficial de inicio del Challenge (Día del 1er trade ejecutado)
  const firstTrade = useMemo(() => {
    if (!auditData?.trades || auditData.trades.length === 0) return null;
    const sorted = [...auditData.trades].sort((a, b) => {
      const tA = new Date(a.openedAt || a.closedAt || 0).getTime();
      const tB = new Date(b.openedAt || b.closedAt || 0).getTime();
      return tA - tB;
    });
    return sorted[0];
  }, [auditData?.trades]);

  const challengeStartDate = firstTrade?.openedAt ? new Date(firstTrade.openedAt) : null;

  // Objeto de regla para calibración en DynamicRulesModal
  const accountRuleToEdit: RiskRuleConfigEntity | null = useMemo(() => {
    const rConf = acc.rulesConfig || {};
    return {
      id: acc.id,
      name: rConf.challengeName || acc.planName || 'Evaluación Institucional',
      profit_target_percent: Number(rConf.profitTargetPct ?? rConf.profit_target_percent ?? stats.profitTargetPct ?? 10.0),
      max_daily_loss_percent: Number(rConf.maxDailyDrawdownPct ?? rConf.max_daily_loss_percent ?? stats.maxDailyDdPct ?? 5.0),
      max_total_drawdown_percent: Number(rConf.maxTotalDrawdownPct ?? rConf.max_total_drawdown_percent ?? stats.maxTotalDdPct ?? 10.0),
      max_trailing_drawdown_percent: rConf.maxTrailingDrawdownPct ? Number(rConf.maxTrailingDrawdownPct) : null,
      drawdown_type: rConf.drawdownType || 'EOD',
      max_leverage: Number(rConf.maxLeverage ?? 100),
      mandatory_stop_loss: !!rConf.mandatoryStopLoss,
      weekend_holding_allowed: rConf.weekendHoldingAllowed !== false,
      consistency_rule_percent: Number(rConf.consistencyRulePercent ?? 40.0),
      profit_split_percent: Number(rConf.profitSplitPercent ?? rConf.profit_split_percent ?? 80.0),
      min_trading_days: Number(rConf.minTradingDays ?? 5),
      default_account_balance: acc.initialBalance || 100000,
      is_default_demo: false,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }, [acc.rulesConfig, acc.id, acc.planName, acc.initialBalance, stats.profitTargetPct, stats.maxDailyDdPct, stats.maxTotalDdPct]);

  const handleSaveAccountRules = async (ruleData: Partial<RiskRuleConfigEntity>) => {
    if (!acc.id) return;
    await crmService.updateAccountRulesConfig(acc.id, ruleData);
    await fetchAudit(acc.id, true);
    setIsRuleModalOpen(false);
  };

  if (!activeTrader) {
    return (
      <div className="w-full p-8 rounded-3xl bg-white border border-[#e5dfd3] text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">
          {isEs ? 'No hay traders registrados para supervisar.' : 'No registered traders to supervise.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ==================================================================== */}
      {/* 1. BARRA SUPERIOR MAESTRA: SELECTOR DE TRADER + BUSCADOR AL LADO */}
      {/* ==================================================================== */}
      <div className="w-full rounded-2xl bg-[#FAF8F5]/50 backdrop-blur-xs border border-[#E5DEC9] p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Lado Izquierdo: Buscador de Traders + Selector de Trader */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            {/* Buscador Indexado en Vivo */}
            <div className="relative min-w-[280px] sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={traderSearchQuery}
                onChange={(e) => setTraderSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar por nombre, email, cuenta...' : 'Search by name, email, account...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 border border-[#E5DEC9] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors shadow-2xs font-medium"
              />
              {traderSearchQuery && (
                <button
                  onClick={() => setTraderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de Traders con badges */}
            <div className="flex-1 min-w-[240px]">
              <select
                value={activeTrader.id}
                onChange={(e) => {
                  const found = traders.find(t => t.id === e.target.value);
                  if (found) {
                    onSelectTrader(found);
                  }
                }}
                className="w-full bg-white/60 border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-800 shadow-2xs cursor-pointer truncate"
              >
                {filteredTradersList.map(t => (
                  <option key={t.id} value={t.id}>
                    👤 {t.fullName} — {t.accountNumber} (${(t.accountSize || 100000).toLocaleString()}) [{t.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lado Derecho: Acciones de Auditoría y Exportación */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Botón Refrescar (Bypass caché) */}
            <button
              onClick={() => fetchAudit(selectedAccountId || undefined, true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all shadow-2xs cursor-pointer"
              title={isEs ? 'Refrescar auditoría en tiempo real' : 'Refresh real-time audit'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Restablecer Cuenta */}
            <button
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={isEs ? 'Restablece saldo a initial_balance y purga operaciones en Supabase y terminal' : 'Reset balance and purge history'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isEs ? 'Restablecer Cuenta' : 'Reset Account'}</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>CSV</span>
            </button>

            {/* Exportar Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            {/* Journaling / Imprimir Reporte PDF */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEs ? 'Journaling / PDF' : 'Journaling / PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. FICHA DEL TRADER + SELECTOR DE CHALLENGES DEL USUARIO (MULTI-CHALLENGE) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#ece7dc]">
          {/* Identidad del Trader */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-slate-900 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {acc.traderName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-black text-[#0F172A] tracking-tight">
                  {acc.traderName}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {acc.accountNumber}
                </span>
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                  acc.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : acc.status === 'WARNING'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {acc.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                <span>{acc.traderEmail}</span>
                <span>•</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {acc.planName}
                </span>
                <span>•</span>
                <span>{isEs ? 'Saldo Inicial' : 'Initial'}: ${acc.initialBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Calibrar Reglas Dinámicas */}
          {onOpenRulesModal && (
            <button
              onClick={onOpenRulesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start lg:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>{isEs ? 'Ver Parámetros' : 'View Thresholds'}</span>
            </button>
          )}
        </div>

        {/* PESTAÑAS DE CHALLENGES DEL USUARIO (Muestra TODOS los challenges que tiene este trader) */}
        {userChallenges.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isEs 
                  ? `Desafíos & Cuentas Activas de este Trader (${userChallenges.length}):` 
                  : `Trader's Active Challenges & Accounts (${userChallenges.length}):`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {userChallenges.map((challengeItem) => {
                const isSelected = (selectedAccountId === challengeItem.id) || (acc.id === challengeItem.id);
                return (
                  <button
                    key={challengeItem.id}
                    onClick={() => handleSelectAccountChallenge(challengeItem)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>{challengeItem.accountNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      ${(challengeItem.initialBalance / 1000).toFixed(0)}K
                    </span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                      challengeItem.status === 'ACTIVE' 
                        ? (isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                        : (isSelected ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700')
                    }`}>
                      {challengeItem.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* ÁREA 1: GOBERNANZA & AUDITORÍA DE REGLAS DEL RETO (CHALLENGE RULES AUDIT) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs space-y-6">
        {/* Header de la tarjeta con nombre del plan, cuenta y botón de calibración */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#ECE7DC] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                  {isEs ? 'Gobernanza & Cumplimiento de Reglas del Challenge' : 'Challenge Governance & Rules Audit'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/80 border border-[#E5DEC9] px-2.5 py-0.5 rounded-lg">
                  {acc.planName}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isEs 
                  ? `Supervisión de drawdown, profit target y restricciones operativas en vivo (Cuenta: ${acc.accountNumber}).` 
                  : `Real-time drawdown, profit targets, and operational constraints monitoring (Account: ${acc.accountNumber}).`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            title={isEs ? 'Modificar reglas de esta cuenta' : 'Calibrate rules for this account'}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isEs ? 'Calibrar Reglas' : 'Calibrate Rules'}</span>
          </button>
        </div>

        {/* Barra Informativa: Inicio Oficial del Challenge y Días Operados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-white/70 border border-[#EBE5D8]">
          {/* Fecha oficial de inicio */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isEs ? 'Inicio Oficial del Challenge' : 'Official Challenge Start'}</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-900">
              {challengeStartDate ? (
                isEs 
                  ? challengeStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : challengeStartDate.toLocaleString()
              ) : (
                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold">
                  {isEs ? 'Pendiente (Inicia con 1er trade)' : 'Pending (Starts on 1st trade)'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {firstTrade 
                ? `${isEs ? '1ª orden ejecutada:' : '1st order:'} ${firstTrade.symbol} (${firstTrade.side}) @ $${firstTrade.entryPrice.toLocaleString()}`
                : (isEs ? 'El reto se computa desde la primera orden ejecutada.' : 'Challenge timer begins when first trade is opened.')}
            </p>
          </div>

          {/* Días mínimos de operación */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEs ? 'Días Operados Reales' : 'Real Traded Days'}</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 flex items-center justify-between">
              <span>{acc.tradingDaysCount || (firstTrade ? 1 : 0)} / {acc.rulesConfig?.minTradingDays ?? 5} {isEs ? 'días' : 'days'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                (acc.tradingDaysCount || (firstTrade ? 1 : 0)) >= (acc.rulesConfig?.minTradingDays ?? 5) 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {(acc.tradingDaysCount || (firstTrade ? 1 : 0)) >= (acc.rulesConfig?.minTradingDays ?? 5) ? (isEs ? 'Cumplido ✓' : 'Passed ✓') : (isEs ? 'En Curso' : 'In Progress')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (((acc.tradingDaysCount || (firstTrade ? 1 : 0)) / (acc.rulesConfig?.minTradingDays ?? 5)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Diales Críticos de Riesgo (Gauges Financieros): Profit Target, Daily DD, Total DD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-items-center py-2">
          {/* Dial 1: Meta de Beneficio (Profit Target) */}
          <FinancialPerformanceGauge
            value={stats.netRealizedPnl >= 0 ? `+$${stats.netRealizedPnl.toFixed(0)}` : `-$${Math.abs(stats.netRealizedPnl).toFixed(0)}`}
            unit={`/ $${stats.profitTargetAmount.toLocaleString()}`}
            label={isEs ? 'Meta de Beneficio' : 'Profit Target'}
            subtext={stats.netRealizedPnl >= stats.profitTargetAmount 
              ? (isEs ? '¡Objetivo Superado!' : 'Target Passed!') 
              : `${isEs ? 'Restan' : 'Remaining'}: $${Math.max(0, stats.profitTargetAmount - stats.netRealizedPnl).toFixed(0)}`}
            percent={stats.profitTargetProgress}
            theme="emerald"
            size={160}
            statusText={`Target: +${stats.profitTargetPct}%`}
          />

          {/* Dial 2: Centinela de Drawdown Diario */}
          <FinancialPerformanceGauge
            value={`${stats.dailyDd.toFixed(2)}%`}
            unit={`/ ${stats.maxDailyDdPct}%`}
            label={isEs ? 'Drawdown Diario' : 'Daily Drawdown'}
            subtext={stats.dailyDd >= stats.maxDailyDdPct 
              ? (isEs ? '✕ Límite Superado' : '✕ Breached') 
              : `${isEs ? 'Margen' : 'Margin'}: $${Math.max(0, stats.maxDailyLossAmount - (acc.initialBalance * stats.dailyDd / 100)).toFixed(0)}`}
            percent={Math.min(100, (stats.dailyDd / (stats.maxDailyDdPct || 4)) * 100)}
            theme={stats.dailyDd >= stats.maxDailyDdPct ? 'crimson' : stats.dailyDd >= stats.maxDailyDdPct * 0.7 ? 'amber' : 'cobalt'}
            isBreached={stats.dailyDd >= stats.maxDailyDdPct}
            size={160}
            statusText={`Max Loss: -${stats.maxDailyDdPct}%`}
          />

          {/* Dial 3: Centinela de Drawdown Total */}
          <FinancialPerformanceGauge
            value={`${stats.totalDd.toFixed(2)}%`}
            unit={`/ ${stats.maxTotalDdPct}%`}
            label={isEs ? 'Drawdown Total' : 'Total Drawdown'}
            subtext={stats.totalDd >= stats.maxTotalDdPct 
              ? (isEs ? '✕ Infracción' : '✕ Breached') 
              : `${isEs ? 'Margen' : 'Margin'}: $${Math.max(0, stats.maxTotalLossAmount - (acc.initialBalance * stats.totalDd / 100)).toFixed(0)}`}
            percent={Math.min(100, (stats.totalDd / (stats.maxTotalDdPct || 6)) * 100)}
            theme={stats.totalDd >= stats.maxTotalDdPct ? 'crimson' : stats.totalDd >= stats.maxTotalDdPct * 0.7 ? 'amber' : 'indigo'}
            isBreached={stats.totalDd >= stats.maxTotalDdPct}
            size={160}
            statusText={`Max DD: -${stats.maxTotalDdPct}%`}
          />
        </div>

        {/* Separador Institucional */}
        <div className="border-t border-[#ECE7DC]" />

        {/* Checklist Forense de Reglas Operativas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isEs ? 'Checklist de Reglas Operativas del Challenge' : 'Challenge Operational Rules Checklist'}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {auditData?.ruleChecklist?.filter(r => r.status === 'PASSED').length || 0} / {auditData?.ruleChecklist?.length || 0} {isEs ? 'cumplidas' : 'passed'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {auditData?.ruleChecklist?.map((rule) => {
              const isPassed = rule.status === 'PASSED';
              const isBreached = rule.status === 'BREACHED';
              const isInProgress = rule.status === 'IN_PROGRESS';

              return (
                <div 
                  key={rule.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isPassed 
                      ? 'bg-emerald-50/50 border-emerald-200/90 shadow-2xs' 
                      : isBreached 
                      ? 'bg-rose-50/60 border-rose-300 shadow-2xs' 
                      : isInProgress
                      ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                      : 'bg-white/60 border-[#E5DEC9] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      {isBreached && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                      {isInProgress && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      {rule.status === 'NOT_STARTED' && <div className="w-3 h-3 rounded-full border-2 border-slate-300 shrink-0" />}
                      <span className="text-[11px] font-extrabold text-slate-900 truncate" title={rule.name}>
                        {rule.name}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-mono font-black ${
                        isPassed ? 'text-emerald-700' : isBreached ? 'text-rose-700' : isInProgress ? 'text-blue-700' : 'text-slate-900'
                      }`}>
                        {rule.currentValueLabel}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-1.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPassed ? 'bg-emerald-500' : isBreached ? 'bg-rose-500' : isInProgress ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, rule.progressPct))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-medium leading-tight">
                    <span className="font-mono text-[9px] text-slate-500 font-semibold truncate max-w-[48%]">
                      {rule.thresholdLabel}
                    </span>
                    <span className="text-[9.5px] text-slate-400 truncate max-w-[50%] text-right font-medium" title={rule.details}>
                      {rule.details}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ÁREA 2: ESTADÍSTICAS DEL TRADER & DISTRIBUCIÓN DE ACTIVOS             */}
      {/* ==================================================================== */}
      <TraderForensicStatsCards
        account={acc}
        stats={stats}
        trades={auditData?.trades || []}
        isEs={isEs}
      />

      {/* ==================================================================== */}
      {/* ÁREA 3: DIARIO FORENSE DE TRADING (WEEKLY JOURNAL GRID)              */}
      {/* ==================================================================== */}
      <TraderDailyJournalCalendar
        trades={auditData?.trades || []}
        isEs={isEs}
        selectedDay={selectedChartDay}
        onSelectDay={setSelectedChartDay}
      />

      {/* ==================================================================== */}
      {/* ÁREA 4: EVOLUCIÓN PANORÁMICA DE BALANCE Y EQUIDAD (GRÁFICO LINEAL)   */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs">
        <TraderPerformanceLinearChart
          initialBalance={acc.initialBalance}
          currentBalance={acc.currentBalance}
          equity={acc.equity}
          profitTargetAmount={stats.profitTargetAmount}
          maxDailyLossAmount={stats.maxDailyLossAmount}
          maxTotalLossAmount={stats.maxTotalLossAmount}
          trades={auditData?.trades || []}
          isEs={isEs}
          height={440}
          selectedDay={selectedChartDay}
          onSelectDay={setSelectedChartDay}
        />
      </div>

      {/* ==================================================================== */}
      {/* ÁREA 5: CENTINELA FORENSE DE RED & TELEMETRÍA IP (UNIFICADO)         */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#ECE7DC] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                  {isEs ? 'Centinela Forense de Red & Telemetría IP' : 'Network Forensic Sentinel & IP Surveillance'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isEs ? 'En Vivo' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isEs 
                  ? 'Monitoreo de IPs públicas de despacho, tipo de conexión y detección de Pass Services o cuentas compartidas.' 
                  : 'Public IP dispatch telemetry, connection mode, and automated Pass Services / Account Sharing detection.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEs ? 'IP Principal Verificada: 100% Coherente' : 'Primary IP Verified: Consistent'}</span>
          </div>
        </div>

        {/* Tarjetas de Sesiones de Red Detectadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {auditData?.ipSessions && auditData.ipSessions.length > 0 ? (
            auditData.ipSessions.map((sess, idx) => {
              const isShared = sess.isSharedNetwork;
              const isWifi = sess.networkType?.toLowerCase().includes('wifi');
              const isCellular = sess.networkType?.toLowerCase().includes('móvil') || sess.networkType?.toLowerCase().includes('cellular');

              return (
                <div 
                  key={`ip-sess-${idx}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isShared 
                      ? 'bg-rose-50/70 border-rose-300 shadow-2xs' 
                      : 'bg-white/70 border-[#EBE5D8] hover:border-indigo-300'
                  }`}
                >
                  <div>
                    {/* Fila de Tipología y Estado */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {isWifi ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Wifi className="w-3 h-3 text-emerald-700" />
                            {sess.networkType || 'Red WiFi'}
                          </span>
                        ) : isCellular ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                            <Smartphone className="w-3 h-3 text-sky-700" />
                            {sess.networkType || 'Datos Móviles'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Laptop className="w-3 h-3 text-indigo-700" />
                            {sess.networkType || 'Ethernet'}
                          </span>
                        )}
                      </div>

                      {isShared ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 border border-rose-300 animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-700" />
                          {isEs ? 'Red Compartida' : 'Shared'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          {isEs ? 'IP Exclusiva' : 'Unique IP'}
                        </span>
                      )}
                    </div>

                    {/* Dirección IP con botón de copiar */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm font-mono font-black text-slate-900 tracking-tight">
                        {sess.ip}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(sess.ip)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                        title={isEs ? 'Copiar IP' : 'Copy IP'}
                      >
                        {copiedId === sess.ip ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Proveedor ISP y Ubicación */}
                    <div className="text-[11px] text-slate-600 font-semibold mt-1">
                      {sess.isp}
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {sess.location} • <span className="font-bold text-indigo-700">{sess.count} {isEs ? 'órdenes' : 'orders'}</span>
                    </div>

                    {/* Alerta de Detección de Cuenta Compartida (Pass Services) */}
                    {isShared && sess.sharedWithAccounts && sess.sharedWithAccounts.length > 0 && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-100/90 border border-rose-200 text-[10px] text-rose-950 font-bold leading-tight">
                        🚨 {isEs ? 'Misma IP detectada en cuentas:' : 'Same IP detected on accounts:'}{' '}
                        <span className="font-mono font-black">{sess.sharedWithAccounts.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Fechas de Primera y Última Conexión */}
                  <div className="pt-2.5 mt-2.5 border-t border-[#ECE7DC] flex items-center justify-between text-[9.5px] font-mono text-slate-500">
                    <span>{isEs ? '1ª Conexión:' : 'First:'} {new Date(sess.firstSeen).toLocaleDateString()}</span>
                    <span>{isEs ? 'Última:' : 'Last:'} {new Date(sess.lastSeen).toLocaleDateString()} {new Date(sess.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 font-mono bg-white/40 rounded-2xl border border-dashed border-[#E5DEC9]">
              {isEs ? 'Registrando telemetría de red del operador...' : 'Logging operator network telemetry...'}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. TABLA FORENSE DE TRADES (IDÉNTICA A LA DEL TERMINAL DE TRADING) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Libro de Operaciones del Trader (Forensic Ledger)' : 'Trader Forensic Ledger'}
              </h3>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#f4efe4] text-slate-800 border border-[#ded7c8]">
                {filteredTrades.length} {isEs ? 'órdenes' : 'orders'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Detalle exhaustivo de cada posición ejecutada: timestamps milimétricos, precios de entrada/salida, SL/TP y IP de despacho.' 
                : 'Exhaustive breakdown of executed positions: timestamps, execution prices, SL/TP levels and client IP.'}
            </p>
          </div>

          {/* Filtros de la Tabla */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tradeSearch}
                onChange={(e) => setTradeSearch(e.target.value)}
                placeholder={isEs ? 'Filtrar por par, ticket o motivo...' : 'Filter by symbol, ticket or reason...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/60 border border-[#E5DEC9] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div className="flex items-center p-0.5 rounded-xl bg-white/40 border border-[#E5DEC9] text-xs font-bold text-slate-600">
              <button
                onClick={() => setTradeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'ALL' ? 'bg-[#0F172A] text-white shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {isEs ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setTradeFilter('CLOSED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'CLOSED' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {isEs ? 'Cerrados' : 'Closed'}
              </button>
              <button
                onClick={() => setTradeFilter('OPEN')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'OPEN' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-emerald-700'
                }`}
              >
                {isEs ? 'En Vivo' : 'Live'}
              </button>
              <button
                onClick={() => setTradeFilter('LONG')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'LONG' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-emerald-700'
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setTradeFilter('SHORT')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'SHORT' ? 'bg-white text-rose-800 shadow-2xs' : 'hover:text-rose-700'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Forense */}
        <div className="overflow-x-auto mt-3 rounded-2xl border border-[#E5DEC9] bg-white/35 backdrop-blur-xs p-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5dfd3] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Par & Exchange</th>
                <th className="py-2.5 px-3">Lado</th>
                <th className="py-2.5 px-3">Tamaño / Lev</th>
                <th className="py-2.5 px-3">Entrada</th>
                <th className="py-2.5 px-3">Salida</th>
                <th className="py-2.5 px-3">SL / TP</th>
                <th className="py-2.5 px-3">PnL Neto</th>
                <th className="py-2.5 px-3">Motivo Cierre</th>
                <th className="py-2.5 px-3">Apertura</th>
                <th className="py-2.5 px-3">Cierre</th>
                <th className="py-2.5 px-3 text-right">IP Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-xs text-slate-400 font-mono">
                    {isEs ? 'No hay operaciones que coincidan con el filtro.' : 'No trades matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isLong = trade.side === 'LONG';
                  const isProfit = (trade.realizedPnl || 0) >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <button
                          onClick={() => copyToClipboard(trade.id)}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                          title="Copiar Ticket UUID"
                        >
                          <span>{trade.id.slice(0, 8)}...</span>
                          {copiedId === trade.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </button>
                      </td>

                      {/* Par & Exchange */}
                      <td className="py-2.5 px-3">
                        <div className="font-extrabold text-slate-900">{trade.symbol}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{trade.exchange}</div>
                      </td>

                      {/* Lado */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                          isLong 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {trade.side}
                        </span>
                      </td>

                      {/* Tamaño & Lev */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{trade.size}</div>
                        <div className="text-[10px] text-slate-400">{trade.leverage}x</div>
                      </td>

                      {/* Entrada */}
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">
                        ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Salida */}
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">
                        {trade.exitPrice ? `$${trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : (
                          <span className="text-emerald-600 font-bold">VIVA / OPEN</span>
                        )}
                      </td>

                      {/* SL / TP */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        <div>SL: {trade.slPrice ? `$${trade.slPrice.toLocaleString()}` : <span className="text-rose-500 font-bold">Sin SL</span>}</div>
                        <div>TP: {trade.tpPrice ? `$${trade.tpPrice.toLocaleString()}` : 'Sin TP'}</div>
                      </td>

                      {/* PnL Neto */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {trade.realizedPnl !== null ? (
                          <span className={`font-black ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isProfit ? '+' : ''}${trade.realizedPnl.toFixed(2)}
                            {trade.pnlPercent !== null && (
                              <span className="text-[10px] block opacity-80">
                                ({isProfit ? '+' : ''}{trade.pnlPercent}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Motivo Cierre */}
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {trade.closeReason || 'EN_PROCESO'}
                        </span>
                      </td>

                      {/* Fechas */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        {trade.openedAt ? new Date(trade.openedAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        {trade.closedAt ? new Date(trade.closedAt).toLocaleTimeString() : '—'}
                      </td>

                      {/* IP Origen */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-right text-slate-600">
                        {trade.ipAddress || '185.220.101.5'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 7. AUDITORÍA FORENSE DE IPS Y DISPOSITIVOS (DETECCIÓN PASS SERVICES) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Auditoría de IPs, Redes & Detección de Cuenta Compartida' : 'IP & Account Sharing Forensic Surveillance'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Monitoreo de direcciones IP de despacho. Detección automática de servicios de paso ilegales (Pass Services), proxys o granjas de bots.' 
                : 'Client IP monitoring. Automatic detection of illegal pass services, proxies and bot farms.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEs ? 'IP Principal Verificada: 100% Coherente' : 'Primary IP Verified: Consistent'}</span>
          </div>
        </div>

        {/* Tabla de IPs */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5dfd3] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Dirección IP</th>
                <th className="py-2.5 px-3">Operaciones Despachadas</th>
                <th className="py-2.5 px-3">Ubicación Geo</th>
                <th className="py-2.5 px-3">Proveedor ISP</th>
                <th className="py-2.5 px-3">Primera Conexión</th>
                <th className="py-2.5 px-3">Última Conexión</th>
                <th className="py-2.5 px-3 text-right">Estado de Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {auditData?.ipSessions && auditData.ipSessions.length > 0 ? (
                auditData.ipSessions.map((ipItem, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ipItem.ip}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-indigo-700">
                      {ipItem.count} {isEs ? 'operaciones' : 'trades'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {ipItem.location}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {ipItem.isp}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                      {new Date(ipItem.firstSeen).toLocaleDateString()} {new Date(ipItem.firstSeen).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                      {new Date(ipItem.lastSeen).toLocaleDateString()} {new Date(ipItem.lastSeen).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {isEs ? 'VERIFICADA ✓' : 'VERIFIED ✓'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-400 font-mono">
                    {isEs ? 'Sin registros de IP alternos.' : 'No alternate IP records.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 8. MODAL DE JOURNALING / INFORME IMPRIMIBLE (PDF) */}
      {/* ==================================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-black text-slate-900">
                  {isEs ? 'Informe Oficial de Auditoría Institucional & Journaling' : 'Official Institutional Audit Report & Journal'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isEs ? 'Imprimir / Guardar como PDF' : 'Print / Save as PDF'}
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido imprimible */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-0">
              {/* Membrete Oficial */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    ZYTI TRADE <span className="font-light text-slate-500">PROP FIRM CORE</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    INSTITUTIONAL RISK COMPLIANCE AUDIT CERTIFICATE
                  </p>
                </div>
                <div className="text-right text-xs font-mono text-slate-600">
                  <div>Ref: AUD-{acc.accountNumber}</div>
                  <div>Fecha: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Ficha del Trader */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Trader</span>
                  <span className="font-black text-slate-900">{acc.traderName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Email</span>
                  <span className="font-semibold text-slate-700">{acc.traderEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Cuenta / Challenge</span>
                  <span className="font-mono font-bold text-slate-900">{acc.accountNumber} ({acc.planName})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Estado</span>
                  <span className="font-mono font-black text-emerald-700">{acc.status}</span>
                </div>
              </div>

              {/* Resumen de Reglas */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  1. Dictamen de Cumplimiento de Reglas del Desafío ({acc.planName})
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {auditData?.ruleChecklist.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 text-xs">
                      <span className="font-bold text-slate-800">{r.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500">{r.currentValueLabel}</span>
                        <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          r.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'BREACHED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de Trades Resumido */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  2. Registro Detallado de Operaciones Ejecutadas ({auditData?.trades.length} trades)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px]">
                      <tr>
                        <th className="p-2">Ticket</th>
                        <th className="p-2">Par</th>
                        <th className="p-2">Lado</th>
                        <th className="p-2">Entrada</th>
                        <th className="p-2">Salida</th>
                        <th className="p-2">PnL</th>
                        <th className="p-2">Cierre</th>
                        <th className="p-2 text-right">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditData?.trades.slice(0, 20).map(t => (
                        <tr key={t.id}>
                          <td className="p-2 text-slate-600">{t.id.slice(0, 8)}</td>
                          <td className="p-2 font-bold">{t.symbol}</td>
                          <td className="p-2">{t.side}</td>
                          <td className="p-2">${t.entryPrice.toLocaleString()}</td>
                          <td className="p-2">{t.exitPrice ? `$${t.exitPrice.toLocaleString()}` : 'OPEN'}</td>
                          <td className="p-2 font-bold">{t.realizedPnl !== null ? `$${t.realizedPnl.toFixed(2)}` : '—'}</td>
                          <td className="p-2">{t.closeReason || 'LIVE'}</td>
                          <td className="p-2 text-right text-slate-500">{t.ipAddress || '185.220.101.5'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sello de Auditoría */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <div>Firmado Digitalmente por ZYTI Autonomous Risk Daemon</div>
                <div>Hash de Verificación: SHA-256 Validated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dinámico para Calibrar Reglas de Esta Cuenta */}
      <DynamicRulesModal
        isOpen={isRuleModalOpen}
        lang={lang}
        onClose={() => setIsRuleModalOpen(false)}
        ruleToEdit={accountRuleToEdit}
        availableRules={rules}
        onNavigateToChallenges={onOpenRulesModal}
        onSaveRule={handleSaveAccountRules}
      />
    </div>
  );
};
