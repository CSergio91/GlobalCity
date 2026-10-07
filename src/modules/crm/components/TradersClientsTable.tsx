import React, { useState, useMemo } from 'react';
import { TraderClientEntity, UserCrmRole } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Skull, 
  Mail, 
  Send,
  UserCog
} from 'lucide-react';

interface TradersClientsTableProps {
  traders: TraderClientEntity[];
  lang?: CrmLang;
  onUpdateAccountSize: (traderId: string, newSize: number) => void;
  onUpdateTraderRole: (traderId: string, newRole: UserCrmRole) => void;
  onUpdateTraderStatus?: (traderId: string, newStatus: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN') => void;
  onResetBalance: (traderId: string, customSize?: number) => void;
  onOpenRiskEngineForTrader?: (trader: TraderClientEntity) => void;
}

export const TradersClientsTable: React.FC<TradersClientsTableProps> = ({
  traders,
  lang = 'es',
  onUpdateAccountSize,
  onUpdateTraderRole,
  onUpdateTraderStatus,
  onResetBalance,
  onOpenRiskEngineForTrader
}) => {
  const isEs = lang === 'es';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WARNING' | 'BREACHED'>('ALL');

  const filteredTraders = useMemo(() => {
    return traders.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.accountNumber.toLowerCase().includes(q) ||
        (t.telegramUsername && t.telegramUsername.toLowerCase().includes(q));

      const matchesStatus = 
        statusFilter === 'ALL' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [traders, searchQuery, statusFilter]);

  const accountSizes = [10000, 25000, 50000, 100000];
  const roleOptions: { id: UserCrmRole; label: string; badgeClass: string }[] = [
    { id: 'trader', label: 'Trader', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'soporte', label: isEs ? 'Soporte' : 'Support', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
    { id: 'admin', label: 'Admin', badgeClass: 'bg-purple-50 text-purple-900 border-purple-300 font-black' },
    { id: 'marketing', label: 'Marketing', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300' }
  ];

  return (
    <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)] transition-all">
      {/* Cabecera y Buscador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#ece7dc]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight font-sans">
              {isEs ? 'Directorio de Traders & Clientes' : 'Traders & Clients Directory'}
            </h2>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#f4efe4] text-slate-800 border border-[#ded7c8]">
              {filteredTraders.length} {isEs ? 'registrados' : 'registered'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isEs 
              ? 'Supervisión en vivo de usuarios, asignación de roles (admin, soporte, marketing) y cuentas demo.' 
              : 'Live user supervision, role assignment (admin, support, marketing) and official demo accounts.'
            }
          </p>
        </div>

        {/* Barra de Filtro y Buscador */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Buscador */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEs ? 'Buscar por nombre, email, telegram...' : 'Search by name, email, telegram...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 border border-[#dcd6ca] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors shadow-2xs"
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs font-bold text-slate-600">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-[#0F172A] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              {isEs ? 'Todos' : 'All'}
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-emerald-700'
              }`}
            >
              {isEs ? 'Activas' : 'Active'}
            </button>
            <button
              onClick={() => setStatusFilter('WARNING')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'WARNING' ? 'bg-white text-amber-800 shadow-xs' : 'hover:text-amber-700'
              }`}
            >
              {isEs ? 'Alerta' : 'Warning'}
            </button>
            <button
              onClick={() => setStatusFilter('BREACHED')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'BREACHED' ? 'bg-white text-rose-800 shadow-xs' : 'hover:text-rose-700'
              }`}
            >
              {isEs ? 'Infracción' : 'Breached'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto rounded-2xl border border-[#e5dfd3] bg-white/60 mt-4 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5dfd3] bg-[#f8f6f0]/90 text-slate-700 font-black uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">{isEs ? 'Trader / Cliente' : 'Trader / Client'}</th>
              <th className="py-3 px-3">{isEs ? 'Rol del Usuario' : 'User Role'}</th>
              <th className="py-3 px-3">{isEs ? 'N° Cuenta Demo' : 'Demo Account #'}</th>
              <th className="py-3 px-3">{isEs ? 'Tamaño Cuenta' : 'Account Size'}</th>
              <th className="py-3 px-3">{isEs ? 'Balance & Equidad' : 'Balance & Equity'}</th>
              <th className="py-3 px-3">{isEs ? 'PnL Flotante' : 'Floating PnL'}</th>
              <th className="py-3 px-3">{isEs ? 'Drawdown Diario' : 'Daily Drawdown'}</th>
              <th className="py-3 px-3">{isEs ? 'Estado Sentinela' : 'Sentinel Status'}</th>
              <th className="py-3 px-4 text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece7dc] bg-white/95">
            {filteredTraders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                  {isEs ? 'No se encontraron traders con ese criterio de búsqueda.' : 'No traders matching search query.'}
                </td>
              </tr>
            ) : (
              filteredTraders.map(trader => {
                const isProfit = trader.floatingPnl >= 0;

                return (
                  <tr key={trader.id} className="hover:bg-[#faf8f4] transition-colors">
                    {/* Trader y Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 text-slate-700 font-black text-xs shadow-2xs">
                          {trader.avatarUrl ? (
                            <img src={trader.avatarUrl} alt={trader.fullName} className="w-full h-full object-cover" />
                          ) : (
                            trader.fullName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-[#0F172A] flex items-center gap-1.5 text-xs">
                            <span className="truncate">{trader.fullName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                            {trader.provider === 'telegram' && <Send className="w-3 h-3 text-sky-600 inline shrink-0" />}
                            {trader.provider === 'google' && <Mail className="w-3 h-3 text-rose-500 inline shrink-0" />}
                            <span className="truncate">{trader.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Selector de Rol Dinámico: trader, soporte, admin, marketing */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        <select
                          value={trader.role}
                          onChange={(e) => onUpdateTraderRole(trader.id, e.target.value as UserCrmRole)}
                          className={`px-2 py-1 rounded-lg border text-xs font-black cursor-pointer focus:outline-none transition-all ${
                            trader.role === 'admin' 
                              ? 'bg-purple-100/80 border-purple-300 text-purple-900 ring-2 ring-purple-400/20'
                              : trader.role === 'soporte'
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : trader.role === 'marketing'
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {roleOptions.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* N° Cuenta Demo */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-800 font-bold text-[11px]">
                        {trader.accountNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Alta: {new Date(trader.createdAt).toLocaleDateString()}
                        {trader.tradingDaysCount !== undefined && (
                          <span className="ml-1 font-mono text-slate-500">· {trader.tradingDaysCount}d op.</span>
                        )}
                      </div>
                    </td>

                    {/* Tamaño de Cuenta (Account Size Selector) */}
                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={trader.accountSize}
                          onChange={(e) => onUpdateAccountSize(trader.id, Number(e.target.value))}
                          className="bg-[#f5f1e8] hover:bg-[#ede6d8] border border-[#dcd6ca] rounded-lg px-2 py-1 text-xs font-mono font-black text-[#0F172A] focus:outline-none focus:border-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          {accountSizes.map(size => (
                            <option key={size} value={size}>
                              ${(size / 1000).toFixed(0)}k USD
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Balance & Equidad */}
                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <div className="text-slate-900 font-black">
                        ${trader.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Eq: ${trader.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* PnL Flotante */}
                    <td className="py-3.5 px-3 font-mono text-xs">
                      <span className={`font-black ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isProfit ? '+' : ''}${trader.floatingPnl.toFixed(2)}
                      </span>
                    </td>

                    {/* Drawdown Diario */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              trader.dailyDrawdownPct > 4.0 ? 'bg-rose-600' : trader.dailyDrawdownPct > 2.5 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, (trader.dailyDrawdownPct / 5) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-700 font-bold">
                          {trader.dailyDrawdownPct}%
                        </span>
                      </div>
                      {trader.dailyStartEquity ? (
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Base UTC: ${Math.round(trader.dailyStartEquity).toLocaleString()}
                        </div>
                      ) : null}
                    </td>

                    {/* Estado Sentinela Interactivo */}
                    <td className="py-3.5 px-3">
                      <select
                        value={trader.status}
                        onChange={(e) => onUpdateTraderStatus && onUpdateTraderStatus(trader.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-black cursor-pointer focus:outline-none transition-all ${
                          trader.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : trader.status === 'WARNING'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : trader.status === 'BREACHED'
                            ? 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="ACTIVE">{isEs ? '● En Regla' : '● In Compliance'}</option>
                        <option value="WARNING">{isEs ? '▲ Alerta (80%)' : '▲ Warning'}</option>
                        <option value="BREACHED">{isEs ? '✕ Infracción' : '✕ Breached'}</option>
                        <option value="FROZEN">{isEs ? '❄ Congelada' : '❄ Frozen'}</option>
                      </select>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onOpenRiskEngineForTrader && (
                          <button
                            onClick={() => onOpenRiskEngineForTrader(trader)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            title={isEs ? 'Supervisar auditoría y reglas en Risk Engine' : 'Inspect audit in Risk Engine'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isEs ? 'Auditar' : 'Audit'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const ok = window.confirm(
                              isEs 
                                ? `¿Restablecer cuenta de ${trader.fullName} a $${trader.accountSize.toLocaleString()}? Se limpiarán las posiciones en DB y la terminal.`
                                : `Reset account of ${trader.fullName} to $${trader.accountSize.toLocaleString()}? Database and terminal will be cleared.`
                            );
                            if (ok) onResetBalance(trader.id, trader.accountSize);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={isEs ? 'Resetear balance e historial' : 'Reset balance & history'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
