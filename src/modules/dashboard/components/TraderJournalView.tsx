import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Sparkles, 
  Tag, 
  Edit3, 
  Save, 
  X,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  BrainCircuit,
  Smile,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { UserTradingAccount } from '../TraderDashboardApp';

interface TradeLogEntry {
  id: string;
  ticket: string;
  accountNumber: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  pnlPct: number;
  rMultiple: number;
  openTime: string;
  closeTime: string;
  duration: string;
  strategyTag: string;
  psychology: 'Disciplinado' | 'Fomo' | 'Neutro' | 'Revenge Trading' | 'Excelente Ejecución';
  notes: string;
  ruleCompliant: boolean;
}

interface TraderJournalViewProps {
  accounts: UserTradingAccount[];
  selectedAccountId?: string | null;
  userDisplayName?: string;
  initialTrades?: any[];
}

export const TraderJournalView: React.FC<TraderJournalViewProps> = ({
  accounts,
  selectedAccountId,
  userDisplayName = 'Trader',
  initialTrades
}) => {
  const [filterAccount, setFilterAccount] = useState<string>(selectedAccountId || 'all');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all');
  const [filterSide, setFilterSide] = useState<'all' | 'LONG' | 'SHORT'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de nueva entrada / nota
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeEditingTrade, setActiveEditingTrade] = useState<TradeLogEntry | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [editPsychology, setEditPsychology] = useState<TradeLogEntry['psychology']>('Disciplinado');

  // Mapear operaciones reales desde PostgreSQL / Single-Fetch Bootstrap
  const mapRawTrades = (rawList: any[]): TradeLogEntry[] => {
    return rawList.map((t: any) => ({
      id: t.id || `tr_${Date.now()}`,
      ticket: t.ticket || `#${(t.id || '').slice(0, 6)}`,
      accountNumber: t.account_number || accounts[0]?.accountNumber || 'EKL-TRADER',
      symbol: t.symbol || 'BTCUSDT',
      side: (t.side || 'LONG').toUpperCase() as 'LONG' | 'SHORT',
      entryPrice: Number(t.entry_price || t.entryPrice || 0),
      exitPrice: Number(t.exit_price || t.exitPrice || 0),
      lotSize: Number(t.lot_size || t.lotSize || 1),
      pnl: Number(t.pnl || 0),
      pnlPct: Number(t.pnl_percent || t.pnlPct || 0),
      rMultiple: Number(t.r_multiple || t.rMultiple || 0),
      openTime: t.open_time || (t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'),
      closeTime: t.close_time || (t.updated_at ? new Date(t.updated_at).toLocaleDateString() : 'N/A'),
      duration: t.duration_seconds ? `${Math.round(t.duration_seconds / 60)}m` : 'Directo',
      strategyTag: t.strategy_tag || 'DMA Ejecución',
      psychology: (t.psychology || 'Disciplinado') as TradeLogEntry['psychology'],
      notes: t.notes || '',
      ruleCompliant: t.rule_compliant !== false
    }));
  };

  // CERO DATOS DEMOS: Si no hay operaciones en la base de datos, el estado inicial es []
  const [trades, setTrades] = useState<TradeLogEntry[]>(() => {
    if (Array.isArray(initialTrades) && initialTrades.length > 0) {
      return mapRawTrades(initialTrades);
    }
    try {
      const saved = localStorage.getItem('eklipse_trader_journal_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    return [];
  });

  React.useEffect(() => {
    if (Array.isArray(initialTrades)) {
      if (initialTrades.length > 0) {
        setTrades(mapRawTrades(initialTrades));
      } else {
        setTrades([]);
      }
    }
  }, [initialTrades, accounts]);

  // Guardar en localStorage ante cambios
  const saveTrades = (updated: TradeLogEntry[]) => {
    setTrades(updated);
    try {
      localStorage.setItem('eklipse_trader_journal_entries', JSON.stringify(updated));
    } catch (_) {}
  };

  // Filtrado de operaciones
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (filterAccount !== 'all' && t.accountNumber !== filterAccount) return false;
      if (filterResult === 'win' && t.pnl <= 0) return false;
      if (filterResult === 'loss' && t.pnl > 0) return false;
      if (filterSide !== 'all' && t.side !== filterSide) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchSymbol = t.symbol.toLowerCase().includes(query);
        const matchTag = t.strategyTag.toLowerCase().includes(query);
        const matchNotes = t.notes.toLowerCase().includes(query);
        const matchTicket = t.ticket.toLowerCase().includes(query);
        if (!matchSymbol && !matchTag && !matchNotes && !matchTicket) return false;
      }
      return true;
    });
  }, [trades, filterAccount, filterResult, filterSide, searchTerm]);

  // Telemetría del Diario de Trading
  const stats = useMemo(() => {
    const total = filteredTrades.length;
    if (total === 0) {
      return {
        total: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        profitFactor: 0,
        netPnl: 0,
        avgWin: 0,
        avgLoss: 0,
        rrRatio: 0,
        bestTrade: 0,
        worstTrade: 0,
        complianceRate: 100
      };
    }

    const wins = filteredTrades.filter(t => t.pnl > 0);
    const losses = filteredTrades.filter(t => t.pnl <= 0);
    const totalProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const netPnl = totalProfit - totalLoss;

    const avgWin = wins.length > 0 ? totalProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
    const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss) : (totalProfit > 0 ? 99 : 0);
    const rrRatio = avgLoss > 0 ? (avgWin / avgLoss) : (avgWin > 0 ? 3 : 0);

    const bestTrade = Math.max(...filteredTrades.map(t => t.pnl));
    const worstTrade = Math.min(...filteredTrades.map(t => t.pnl));
    const compliant = filteredTrades.filter(t => t.ruleCompliant).length;
    const complianceRate = Math.round((compliant / total) * 100);

    return {
      total,
      wins: wins.length,
      losses: losses.length,
      winRate: Math.round((wins.length / total) * 100),
      profitFactor: Number(profitFactor.toFixed(2)),
      netPnl,
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      rrRatio: Number(rrRatio.toFixed(2)),
      bestTrade,
      worstTrade,
      complianceRate
    };
  }, [filteredTrades]);

  // Guardar nota editada
  const handleSaveNotes = () => {
    if (!activeEditingTrade) return;
    const updated = trades.map(t => {
      if (t.id === activeEditingTrade.id) {
        return {
          ...t,
          notes: editNotesText,
          psychology: editPsychology
        };
      }
      return t;
    });
    saveTrades(updated);
    setIsNoteModalOpen(false);
    setActiveEditingTrade(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header con Resumen Institucional del Journal */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white/[0.06] via-[#0E1322]/90 to-[#07090F]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/25 via-purple-600/15 to-transparent border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.25)] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Diario de Trading & Auditoría Forense
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                  {stats.total} Trades Auditados
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Registra tu psicología, evalúa la consistencia del 40% y perfecciona tu ventaja operativa en cada sesión.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "Ticket,Symbol,Side,Entry,Exit,PnL,R_Multiple,Date,Strategy,Notes\n"
                  + trades.map(e => `${e.ticket},${e.symbol},${e.side},${e.entryPrice},${e.exitPrice},${e.pnl},${e.rMultiple},"${e.closeTime}","${e.strategyTag}","${e.notes}"`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Eklipse_Journal_${userDisplayName}_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-sm"
              title="Exportar registros a CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 5 Métricas Forenses de Rendimiento (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* KPI 1: Win Rate */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Win Rate</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
            <span>{stats.winRate}%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            {stats.wins}W · {stats.losses}L
          </div>
        </div>

        {/* KPI 2: Profit Factor */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Profit Factor</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300 mt-2">
            {stats.profitFactor}
          </div>
          <div className="text-[10px] font-mono text-emerald-400/90 mt-1">
            Ratio institucional
          </div>
        </div>

        {/* KPI 3: Ganancia Neta */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PnL Neto Total</div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Beneficio acumulado
          </div>
        </div>

        {/* KPI 4: Ratio R:R Medio */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">R:R Promedio</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 mt-2">
            1:{stats.rrRatio}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Media gan./pérd.
          </div>
        </div>

        {/* KPI 5: Mejor Trade */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Mejor Trade</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-2">
            +${stats.bestTrade.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Máxima ganancia
          </div>
        </div>

        {/* KPI 6: Cumplimiento de Reglas */}
        <div className="relative p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/30 before:to-transparent">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Disciplina Risk Engine</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{stats.complianceRate}%</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 mt-1">
            0 infracciones graves
          </div>
        </div>

      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl border border-white/10 bg-[#0C0F17]/90 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por par, ticket, estrategia o notas..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-white font-mono text-xs focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Account Filter */}
          {accounts.length > 1 && (
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#080B12] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Todas las Cuentas</option>
              {accounts.map(a => (
                <option key={a.id} value={a.accountNumber}>
                  {a.accountNumber} ({a.tierName})
                </option>
              ))}
            </select>
          )}

          {/* Outcome Filter */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/8 p-0.5 font-mono text-xs">
            <button
              onClick={() => setFilterResult('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterResult === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterResult('win')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterResult === 'win' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Wins
            </button>
            <button
              onClick={() => setFilterResult('loss')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterResult === 'loss' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Losses
            </button>
          </div>

          {/* Side Filter */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/8 p-0.5 font-mono text-xs">
            <button
              onClick={() => setFilterSide('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${filterSide === 'all' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              L/S
            </button>
            <button
              onClick={() => setFilterSide('LONG')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${filterSide === 'LONG' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              LONG
            </button>
            <button
              onClick={() => setFilterSide('SHORT')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${filterSide === 'SHORT' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              SHORT
            </button>
          </div>

        </div>

      </div>

      {/* 4. Tabla de Entradas de Trading */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0C0F17]/95 backdrop-blur-2xl shadow-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/[0.02] border-b border-white/8 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-4 font-bold">Ticket / Fecha</th>
                <th className="py-4 px-4 font-bold">Activo</th>
                <th className="py-4 px-4 font-bold">Dirección</th>
                <th className="py-4 px-4 font-bold">Entrada / Salida</th>
                <th className="py-4 px-4 font-bold">PnL Neto</th>
                <th className="py-4 px-4 font-bold">Retorno R</th>
                <th className="py-4 px-4 font-bold">Estrategia & Psicología</th>
                <th className="py-4 px-4 font-bold">Notas del Trader</th>
                <th className="py-4 px-4 text-right font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map((t) => {
                const isWin = t.pnl > 0;
                return (
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* Ticket / Fecha */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{t.ticket}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{t.closeTime}</span>
                        <span className="text-slate-600">({t.duration})</span>
                      </div>
                    </td>

                    {/* Activo */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{t.symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Lote: {t.lotSize}
                      </div>
                    </td>

                    {/* Dirección */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        t.side === 'LONG'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}>
                        {t.side === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{t.side}</span>
                      </span>
                    </td>

                    {/* Entrada / Salida */}
                    <td className="py-4 px-4 text-slate-300">
                      <div>In: ${t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        Out: ${t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* PnL Neto */}
                    <td className="py-4 px-4">
                      <div className={`font-bold text-sm ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWin ? '+' : ''}${t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] ${isWin ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                        {isWin ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </div>
                    </td>

                    {/* Retorno R */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        t.rMultiple >= 2 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : t.rMultiple > 0 
                            ? 'bg-emerald-500/15 text-emerald-300' 
                            : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {t.rMultiple > 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                      </span>
                    </td>

                    {/* Estrategia & Psicología */}
                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-white font-medium truncate">{t.strategyTag}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5 truncate">
                          {t.psychology}
                        </span>
                      </div>
                    </td>

                    {/* Notas */}
                    <td className="py-4 px-4 max-w-[240px]">
                      <p className="text-[11px] text-slate-300 truncate font-sans">
                        {t.notes || <span className="text-slate-600 italic">Sin notas registradas</span>}
                      </p>
                    </td>

                    {/* Acción */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveEditingTrade(t);
                          setEditNotesText(t.notes);
                          setEditPsychology(t.psychology);
                          setIsNoteModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        title="Editar notas del trade"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <div className="font-bold text-white text-sm">No se encontraron operaciones registradas</div>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Las órdenes que ejecutes en la plataforma web se sincronizarán automáticamente con tu diario.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal de Edición de Notas del Trade */}
      {isNoteModalOpen && activeEditingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#0F1424] to-[#0A0D15] p-6 sm:p-8 shadow-2xl space-y-6 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/50 before:to-transparent">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Reflexión & Notas del Trade {activeEditingTrade.ticket}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {activeEditingTrade.symbol} · {activeEditingTrade.side} · PnL: ${activeEditingTrade.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado Psicológico */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>Estado Mental / Disciplina Emocional</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                {(['Excelente Ejecución', 'Disciplinado', 'Neutro', 'Fomo', 'Revenge Trading'] as const).map(psi => (
                  <button
                    key={psi}
                    type="button"
                    onClick={() => setEditPsychology(psi)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      editPsychology === psi
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-white/[0.02] border-white/8 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {psi}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuadro de texto de notas */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300">
                Observaciones Técnicas y Conclusiones
              </label>
              <textarea
                value={editNotesText}
                onChange={(e) => setEditNotesText(e.target.value)}
                rows={4}
                placeholder="¿Por qué entraste al trade? ¿Respetaste tu Stop Loss? ¿Hubo dudas o deslizamiento?"
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
              />
            </div>

            {/* Botones de acción del modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Registro</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
