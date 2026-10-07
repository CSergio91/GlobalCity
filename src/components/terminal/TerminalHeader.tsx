import React from 'react';
import { Cpu, Menu, Zap } from 'lucide-react';
import { UserSession, PropFirmAccount } from '../../lib/supabase';
import { MarketStats } from '../../workers/marketData.worker';
import { MarketType, AdapterConnectionStatus } from '../../core/market-feed/types';
import { ExchangePairSelector } from './ExchangePairSelector';
import { DemoAccountBalanceSelector } from './DemoAccountBalanceSelector';

interface TerminalHeaderProps {
  isEs: boolean;
  user: UserSession | null;
  selectedPair: string;
  supportedPairs: string[];
  stats: MarketStats;
  demoBalance: number;
  availableBalance?: number;
  equity?: number;
  isMobileNavOpen: boolean;
  unrealizedPnL?: number;
  positionsCount?: number;
  activeSection?: string;
  currentExchange: string;
  currentMarketType: MarketType;
  connectionStatus: AdapterConnectionStatus;
  activeAccountId?: string;
  accounts?: PropFirmAccount[];
  dailyStartEquity?: number;
  tradingDaysCount?: number;
  onSelectExchange: (exchange: string) => void;
  onSelectMarketType: (marketType: MarketType) => void;
  onSelectPair: (pair: string) => void;
  onSelectBalanceAmount: (amount: number) => void;
  onSelectAccount?: (account: PropFirmAccount | null) => void;
  onResetBalance?: () => void;
  onToggleMobileNav: () => void;
  onSelectSection?: (section: 'none' | 'exchange' | string) => void;
  onExit?: () => void;
  onOpenAuth?: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isEs,
  user,
  selectedPair,
  supportedPairs,
  stats,
  demoBalance,
  unrealizedPnL = 0,
  positionsCount = 0,
  currentExchange,
  currentMarketType,
  connectionStatus,
  activeAccountId,
  accounts,
  dailyStartEquity,
  tradingDaysCount,
  onSelectExchange,
  onSelectMarketType,
  onSelectPair,
  onSelectBalanceAmount,
  onSelectAccount,
  onResetBalance,
  onToggleMobileNav,
  onOpenAuth
}) => {
  const isPnlProfit = unrealizedPnL >= 0;

  return (
    <header className="h-10 sm:h-13 border-b border-[#ded5c5] bg-[#fbf9f4] px-1.5 sm:px-4 flex items-center justify-between shrink-0 z-50 select-none overflow-visible relative">
      {/* PARTE IZQUIERDA: SELECTOR DE EXCHANGE & PAR + PRECIO + PNL + SALDO CUENTA DEMO */}
      <div className="flex items-center gap-1 sm:gap-2.5 py-0.5 min-w-0 overflow-visible relative">
        {/* SELECTOR INTERACTIVO DE EXCHANGE (BINANCE, BYBIT, KUCOIN, OKX, ETC) Y PAR CON PRECIO INTEGRADO */}
        <ExchangePairSelector
          currentExchange={currentExchange}
          currentMarketType={currentMarketType}
          selectedPair={selectedPair}
          supportedPairs={supportedPairs}
          connectionStatus={connectionStatus}
          stats={stats}
          isEs={isEs}
          onSelectExchange={onSelectExchange}
          onSelectMarketType={onSelectMarketType}
          onSelectPair={onSelectPair}
        />

        {/* SI NO ESTÁ AUTENTICADO: BOTÓN AMARILLO INSTITUCIONAL IDÉNTICO AL HOME */}
        {!user ? (
          <button
            onClick={onOpenAuth}
            type="button"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-xl shadow-xs transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 shrink-0"
            title={isEs ? 'Iniciar sesión para operar' : 'Log in to trade'}
          >
            <Zap className="w-3.5 h-3.5 stroke-[2.5] fill-slate-950" />
            <span>{isEs ? 'Operar Ahora' : 'Sign In'}</span>
          </button>
        ) : (
          /* EQUITY TOTAL EN TIEMPO REAL: Saldo base + PnL no realizado de posiciones en vivo */
          <DemoAccountBalanceSelector
            currentBalance={demoBalance}
            unrealizedPnL={unrealizedPnL}
            isEs={isEs}
            accounts={accounts && accounts.length > 0 ? accounts : (user?.accounts || [])}
            activeAccountId={activeAccountId}
            dailyStartEquity={dailyStartEquity}
            tradingDaysCount={tradingDaysCount}
            onSelectAmount={onSelectBalanceAmount}
            onSelectAccount={onSelectAccount}
            onResetToCurrent={onResetBalance || (() => {})}
          />
        )}

        {/* PNL NO REALIZADO EN ESCRITORIO (OCULTO EN MÓVIL PORQUE SE GESTIONA ABAJO EN POSICIONES) */}
        <div className={`hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] sm:text-[10px] font-mono font-bold shrink-0 ${
          positionsCount === 0
            ? 'bg-slate-100 text-slate-500 border-slate-200'
            : isPnlProfit
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
              : 'bg-red-50 text-red-700 border-red-200 shadow-xs'
        }`}>
          <span className="text-[8.5px] text-slate-500">{isEs ? 'PnL' : 'PnL'}:</span>
          <span>{positionsCount === 0 ? '$0.00' : `${isPnlProfit ? '+' : ''}$${unrealizedPnL.toFixed(2)}`}</span>
        </div>
      </div>

      {/* PARTE DERECHA: EXCLUSIVO HAMBURGUESA MÓVIL (< 1024px) */}
      <div className="flex items-center shrink-0 ml-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden terminal-mobile-hamburger p-1.5 sm:p-2 rounded-xl text-slate-800 hover:text-slate-950 bg-white hover:bg-[#ede5d6] border border-[#ded5c5] cursor-pointer transition-all shadow-xs active:scale-95"
          title={isEs ? 'Menú ZYTI Trade' : 'ZYTI Trade Menu'}
          aria-label={isEs ? 'Abrir menú de navegación lateral' : 'Open lateral navigation menu'}
        >
          <Menu className="w-4 h-4 text-slate-800" />
        </button>
      </div>
    </header>
  );
};
