import React from 'react';
import { TrendingUp, Zap, Shield, Target, DollarSign, Percent, ChevronDown, ChevronUp, X, Eye, EyeOff } from 'lucide-react';

interface TerminalOrderFormProps {
  isEs: boolean;
  selectedPair: string;
  currentPrice: number;
  demoBalance: number;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  limitPrice?: string;
  setLimitPrice?: (price: string) => void;
  amount: string;
  leverage: number;
  riskPercent: number;
  slPercent: number;
  tpPercent: number;
  orderMode: 'amount' | 'risk';
  orderSuccess: string | null;
  quickTradeEnabled: boolean;
  showChartPreview?: boolean;
  isDesktop?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
  onToggleQuickTrade: () => void;
  onToggleChartPreview?: () => void;
  setSide: (side: 'buy' | 'sell') => void;
  setOrderType: (type: 'market' | 'limit') => void;
  setAmount: (amount: string) => void;
  setLeverage: (leverage: number) => void;
  setRiskPercent: (risk: number) => void;
  setSlPercent: (sl: number) => void;
  setTpPercent: (tp: number) => void;
  setOrderMode: (mode: 'amount' | 'risk') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TerminalOrderForm: React.FC<TerminalOrderFormProps> = ({
  isEs,
  selectedPair,
  currentPrice,
  demoBalance,
  side,
  orderType,
  limitPrice,
  setLimitPrice,
  amount,
  leverage,
  riskPercent,
  slPercent,
  tpPercent,
  orderMode,
  orderSuccess,
  quickTradeEnabled,
  showChartPreview = true,
  isDesktop = false,
  isMinimized = false,
  onToggleMinimize,
  onClose,
  onToggleQuickTrade,
  onToggleChartPreview,
  setSide,
  setOrderType,
  setAmount,
  setLeverage,
  setRiskPercent,
  setSlPercent,
  setTpPercent,
  setOrderMode,
  onSubmit
}) => {
  const isLong = side === 'buy';

  const parsedLimit = parseFloat(limitPrice || '');
  const limitPriceNum = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : (currentPrice > 0 ? currentPrice : 0);
  const executionRefPrice = orderType === 'limit' && limitPriceNum > 0 ? limitPriceNum : currentPrice;

  // Cálculos de SL y TP estimados en precio basados en precio límite (si es limit) o de mercado
  const calculatedSlPrice = isLong
    ? executionRefPrice * (1 - slPercent / 100)
    : executionRefPrice * (1 + slPercent / 100);

  const calculatedTpPrice = isLong
    ? executionRefPrice * (1 + tpPercent / 100)
    : executionRefPrice * (1 - tpPercent / 100);

  // Cálculo de tamaño y riesgo institucional con apalancamiento
  const riskAmountUsd = (demoBalance * riskPercent) / 100;
  
  // En modo riesgo: el riesgo monetario es fijo = riskAmountUsd
  // notional = riskAmountUsd / (slPercent / 100)
  // margen requerido = notional / leverage
  const notionalUsd = orderMode === 'risk'
    ? (slPercent > 0 ? riskAmountUsd / (slPercent / 100) : 1000)
    : (parseFloat(amount) || 1000) * leverage;

  const requiredMarginUsd = orderMode === 'risk'
    ? Math.max(10, Math.round(notionalUsd / leverage))
    : parseFloat(amount) || 1000;

  const estimatedLossUsd = orderMode === 'risk'
    ? riskAmountUsd
    : notionalUsd * (slPercent / 100);

  const estimatedProfitUsd = notionalUsd * (tpPercent / 100);
  const currentRatioNum = slPercent > 0 ? Number((tpPercent / slPercent).toFixed(1)) : 2;

  const setRatio = (ratio: number) => {
    const nextTp = Number((slPercent * ratio).toFixed(1));
    setTpPercent(nextTp);
  };

  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-2.5 transition-all">
      {/* BARRA SUPERIOR DEL PANEL DE ORDEN (TITULO + MINIMIZAR + CERRAR) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <span className="text-[11px] font-black text-white flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>{isEs ? 'Panel de Trading' : 'Trading Order'}</span>
        </span>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded hover:bg-slate-50 text-slate-500 hover:text-white cursor-pointer"
              title={isMinimized ? (isEs ? 'Expandir panel de trading' : 'Expand trading panel') : (isEs ? 'Minimizar panel de trading' : 'Minimize trading panel')}
            >
              {isMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
              title={isEs ? 'Cerrar panel de trading' : 'Close trading panel'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {isMinimized ? (
        <div className="flex items-center justify-between py-1 text-[10px] font-mono text-slate-400">
          <span className={`px-1.5 py-0.5 rounded font-black text-white ${isLong ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {isLong ? 'LONG' : 'SHORT'} {leverage}x
          </span>
          <span className="font-bold text-white">{selectedPair}</span>
          <button
            type="button"
            onClick={onToggleMinimize}
            className="text-[9px] font-bold text-amber-700 hover:underline cursor-pointer"
          >
            {isEs ? 'Expandir' : 'Expand'}
          </button>
        </div>
      ) : (
        <>

      {/* SELECTOR COMPRA / VENTA */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-50/10">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            isLong
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-emerald-700'
          }`}
        >
          {isEs ? 'Comprar / Long' : 'Buy / Long'}
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            !isLong
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-red-700'
          }`}
        >
          {isEs ? 'Vender / Short' : 'Sell / Short'}
        </button>
      </div>

      {/* TIPO DE ORDEN */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'market'
              ? 'bg-slate-950 text-white border-slate-950'
              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderType('limit');
            if (currentPrice > 0) {
              setLimitPrice?.(currentPrice.toString());
            }
          }}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'limit'
              ? 'bg-slate-950 text-white border-slate-950'
              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Limit
        </button>
      </div>

      {/* SELECTOR MODO: MONTO FIJO VS RIESGO % CUENTA */}
      <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold">
        <button
          type="button"
          onClick={() => setOrderMode('amount')}
          className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
            orderMode === 'amount'
              ? 'bg-slate-50 text-slate-950 shadow-xs font-black'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          <span>{isEs ? 'Monto Fijo' : 'Fixed Value'}</span>
        </button>
        <button
          type="button"
          onClick={() => setOrderMode('risk')}
          className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
            orderMode === 'risk'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <Percent className="w-3 h-3" />
          <span>{isEs ? 'Riesgo Cuenta' : 'Account Risk'}</span>
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={onSubmit} className="space-y-2.5">
        {/* PRECIO LÍMITE (SOLO VISIBLE EN MODO 'LIMIT') */}
        {orderType === 'limit' && (
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
              <span className="flex items-center gap-1 text-amber-900 font-black">
                <Target className="w-3 h-3 text-amber-600" />
                <span>{isEs ? 'Precio de la Orden (USDT)' : 'Order Price (USDT)'}</span>
              </span>
              {currentPrice > 0 && limitPriceNum > 0 && (
                <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  isLong
                    ? (limitPriceNum < currentPrice
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : limitPriceNum > currentPrice
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-slate-50 text-slate-300 border-slate-200')
                    : (limitPriceNum > currentPrice
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : limitPriceNum < currentPrice
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-slate-50 text-slate-300 border-slate-200')
                }`}>
                  {isLong
                    ? (limitPriceNum < currentPrice ? 'BUY LIMIT' : limitPriceNum > currentPrice ? 'BUY STOP' : (isEs ? 'AL MERCADO' : 'AT MARKET'))
                    : (limitPriceNum > currentPrice ? 'SELL LIMIT' : limitPriceNum < currentPrice ? 'SELL STOP' : (isEs ? 'AL MERCADO' : 'AT MARKET'))}
                  {' '}
                  {limitPriceNum !== currentPrice && `${limitPriceNum > currentPrice ? '+' : ''}${(((limitPriceNum - currentPrice) / currentPrice) * 100).toFixed(2)}%`}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000001"
                value={limitPrice ?? ''}
                onChange={(e) => setLimitPrice?.(e.target.value)}
                placeholder={currentPrice.toString()}
                className="w-full pl-2.5 pr-12 py-1.5 rounded-lg border border-amber-300 bg-slate-50 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 shadow-2xs"
                required
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                USDT
              </span>
            </div>
          </div>
        )}

        {/* MONTO O RIESGO SEGÚN EL MODO */}
        {orderMode === 'amount' ? (
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
              <span>{isEs ? 'Margen / Colateral (USDT)' : 'Margin / Collateral (USDT)'}</span>
              <span className="text-slate-400 font-mono text-[9px]">
                Notional: ${(requiredMarginUsd * leverage).toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="10"
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-2.5 pr-10 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                placeholder="1000"
                required
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                USDT
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
              <span>{isEs ? 'Riesgo de Cuenta (%)' : 'Account Risk (%)'}</span>
              <span className="text-amber-600 font-mono font-black">{riskPercent}% (${riskAmountUsd.toFixed(2)})</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {[0.5, 1, 2, 3].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercent(r)}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    riskPercent === r
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-50 text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex justify-between">
              <span>Margen: ~${requiredMarginUsd.toLocaleString()} USDT</span>
              <span>Posición: ~${Math.round(notionalUsd).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* STOP LOSS (%) Y TAKE PROFIT (%) EDITABLES */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
          {/* STOP LOSS */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-red-600 mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>SL (%)</span>
              </span>
              <span className="font-mono">-${estimatedLossUsd.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <input
                type="number"
                step="any"
                min="0.1"
                max="50"
                value={slPercent}
                onChange={(e) => {
                  const val = Math.max(0.1, parseFloat(e.target.value) || 1);
                  setSlPercent(val);
                }}
                className="w-full px-2 py-0.5 text-[11px] font-mono font-bold border border-red-200 rounded bg-red-50/50 text-red-900 focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] font-bold text-red-500">%</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-0.5">
              {[1, 2, 3].map((sl) => (
                <button
                  key={sl}
                  type="button"
                  onClick={() => setSlPercent(sl)}
                  className={`py-0.5 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                    slPercent === sl ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {sl}%
                </button>
              ))}
            </div>
            <span className="text-[8.5px] font-mono text-slate-400 block truncate">
              SL: ${calculatedSlPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>

          {/* TAKE PROFIT */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 mb-0.5">
              <span className="flex items-center gap-1">
                <Target className="w-2.5 h-2.5" />
                <span>TP (%)</span>
              </span>
              <span className="font-mono">+${estimatedProfitUsd.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <input
                type="number"
                step="any"
                min="0.1"
                max="100"
                value={tpPercent}
                onChange={(e) => {
                  const val = Math.max(0.1, parseFloat(e.target.value) || 2);
                  setTpPercent(val);
                }}
                className="w-full px-2 py-0.5 text-[11px] font-mono font-bold border border-emerald-200 rounded bg-emerald-50/50 text-emerald-900 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] font-bold text-emerald-500">%</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-0.5">
              {[2, 4, 6].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTpPercent(tp)}
                  className={`py-0.5 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                    tpPercent === tp ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {tp}%
                </button>
              ))}
            </div>
            <span className="text-[8.5px] font-mono text-slate-400 block truncate">
              TP: ${calculatedTpPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>

        {/* SELECTOR DE RATIO RIESGO / BENEFICIO (LIBRE ELECCIÓN) */}
        <div className="p-1.5 rounded-lg bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[9.5px] font-mono">
            <span className="text-slate-400 font-bold">{isEs ? 'Ratio R:B Elegible:' : 'R:R Ratio:'}</span>
            <span className="font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
              1 : {currentRatioNum}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[1, 1.5, 2, 3, 4].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRatio(r)}
                className={`py-0.5 rounded text-[8.5px] font-mono font-bold border transition-all cursor-pointer ${
                  currentRatioNum === r
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-300 border-slate-200 hover:bg-amber-50'
                }`}
              >
                1:{r}
              </button>
            ))}
          </div>
        </div>

        {/* APALANCAMIENTO */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
            <span>{isEs ? 'Apalancamiento' : 'Leverage'}</span>
            <span className="text-amber-600 font-mono font-black">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5"
          />
          {/* BOTONES RÁPIDOS DE APALANCAMIENTO */}
          <div className="flex items-center gap-1 mt-1">
            {[2, 5, 10, 20, 50, 100].map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setLeverage(lev)}
                className={`flex-1 py-0.5 rounded text-[8.5px] font-mono font-bold border transition-all cursor-pointer ${
                  leverage === lev
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-amber-50'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* FEEDBACK DE ÉXITO */}
        {orderSuccess && (
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>{orderSuccess}</span>
          </div>
        )}

        {/* CHECKBOX MOSTRAR ORDEN PREVIA EN EL GRÁFICO (PERSISTENTE EN LOCALSTORAGE) */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div className="flex flex-col pr-2">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              {showChartPreview ? (
                <Eye className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isEs ? 'Ver orden en el gráfico' : 'Show order on chart'}</span>
            </span>
            <span className="text-[9px] text-slate-400 leading-tight">
              {isEs ? 'Proyectar entrada, SL y TP antes de ejecutar' : 'Preview entry, SL & TP before placing'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showChartPreview}
              onChange={onToggleChartPreview}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-50 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 cursor-pointer" />
          </label>
        </div>

        {/* CHECKBOX BOTONES FLOTANTES DE 1 TOQUE (EXCLUSIVO PARA MÓVILES < 1024px) */}
        {!isDesktop && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between lg:hidden terminal-mobile-only">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{isEs ? 'Botones Flotantes (1 Toque)' : '1-Tap Floating Buttons'}</span>
              </span>
              <span className="text-[9px] text-slate-400">
                {isEs ? 'Habilita comprar y vender directo sobre el gráfico' : 'Trade directly over chart on mobile'}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quickTradeEnabled}
                onChange={onToggleQuickTrade}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-50 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 cursor-pointer" />
            </label>
          </div>
        )}

        {/* BOTÓN SUBMIT PRINCIPAL */}
        <button
          type="submit"
          className={`w-full py-2 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 ${
            isLong
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
              : 'bg-red-600 hover:bg-red-700 active:scale-[0.99]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>
            {orderType === 'limit'
              ? `${isEs ? 'Colocar' : 'Place'} ${
                  isLong
                    ? (limitPriceNum < currentPrice ? 'Buy Limit' : limitPriceNum > currentPrice ? 'Buy Stop' : 'Buy Limit')
                    : (limitPriceNum > currentPrice ? 'Sell Limit' : limitPriceNum < currentPrice ? 'Sell Stop' : 'Sell Limit')
                } @ $${limitPriceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : isLong
                ? `${isEs ? 'Comprar' : 'Buy'} ${selectedPair.split('/')[0]}`
                : `${isEs ? 'Vender' : 'Sell'} ${selectedPair.split('/')[0]}`}
          </span>
        </button>
      </form>
      </>
      )}
    </div>
  );
};
