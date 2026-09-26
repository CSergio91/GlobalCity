import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  Sliders,
  DollarSign
} from 'lucide-react';
import { StoredExchangeAccount, VenueMetadata } from '../types/exchange';
import { positionStorage } from '../services/positionStorage';
import { exchangeStorage } from '../services/exchangeStorage';

interface VenueOrderTicketProps {
  account: StoredExchangeAccount;
  venueMeta: VenueMetadata;
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
  initialSide: 'BUY' | 'SELL';
  onClose: () => void;
  onSuccess: (msg: string) => void;
  livePrice?: number;
}

const COMMON_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT'];

export const VenueOrderTicket: React.FC<VenueOrderTicketProps> = ({
  account,
  venueMeta,
  selectedSymbol,
  onSymbolChange,
  initialSide,
  onClose,
  onSuccess,
  livePrice = 84150
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);
  const [symbol, setSymbol] = useState(selectedSymbol || 'BTC/USDT');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState(livePrice.toString());
  const [amountUsdt, setAmountUsdt] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectivePrice = orderType === 'MARKET' ? livePrice : parseFloat(limitPrice) || livePrice;
  const numericAmountUsdt = parseFloat(amountUsdt) || 0;
  const cryptoAmount = effectivePrice > 0 ? (numericAmountUsdt / effectivePrice).toFixed(4) : '0';

  const handleQuickPercent = (pct: number) => {
    const margin = account.freeMarginUsd > 0 ? account.freeMarginUsd : 1000;
    const computed = Math.floor((margin * pct) / 100);
    setAmountUsdt(Math.max(10, computed).toString());
  };

  const handlePairChange = (newPair: string) => {
    setSymbol(newPair);
    if (onSymbolChange) {
      onSymbolChange(newPair);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmountUsdt <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      // Create position in persistent storage
      const newPos = positionStorage.addPosition({
        symbol,
        exchange: account.venueName,
        type: side === 'BUY' ? 'LONG' : 'SHORT',
        entryPrice: effectivePrice,
        size: parseFloat(cryptoAmount) || 0.01,
        notionalUsd: numericAmountUsdt,
        leverage: 1,
        margin: numericAmountUsdt
      });

      // Update free margin on exchange
      const updatedAccounts = exchangeStorage.getAccounts().map(acc => {
        if (acc.id === account.id) {
          const newFree = Math.max(0, (acc.freeMarginUsd || 0) - numericAmountUsdt);
          return { ...acc, freeMarginUsd: newFree };
        }
        return acc;
      });
      exchangeStorage.saveAccounts(updatedAccounts);

      // Dispatch Telegram notification
      try {
        window.dispatchEvent(new CustomEvent('globalcity_operation_executed', {
          detail: {
            venue: account.venueName,
            side,
            symbol,
            price: effectivePrice,
            amountUsdt: numericAmountUsdt
          }
        }));
      } catch {}

      onSuccess(`Orden ${side} ${symbol} de $${numericAmountUsdt} enviada a ${account.venueName}`);
      onClose();
    }, 450);
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0A0C14] to-[#06070B] border-t border-white/10 rounded-b-2xl animate-in fade-in duration-150 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 border"
            style={{ 
              backgroundColor: (venueMeta.color || '#38BDF8') + '25',
              borderColor: (venueMeta.color || '#38BDF8') + '50',
              color: venueMeta.color || '#38BDF8'
            }}
          >
            {account.venueName.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-white">Ticket de Ejecución Directa — {account.venueName}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {account.label}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Row 1: Side Toggle (Buy / Sell) + Pair Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Side Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                side === 'BUY'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>COMPRAR (LONG)</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>VENDER (SHORT)</span>
            </button>
          </div>

          {/* Pair Selector */}
          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={(e) => handlePairChange(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8] cursor-pointer"
            >
              {COMMON_SYMBOLS.map(s => (
                <option key={s} value={s} className="bg-[#0A0B0F] text-white">
                  {s}
                </option>
              ))}
            </select>
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-right">
              <span className="text-[9px] text-slate-500 uppercase block">Precio en Vivo</span>
              <span className="text-xs font-mono font-bold text-white">
                ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Order Type + Amount Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Order Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tipo de Orden
            </label>
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'MARKET' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Market (Taker)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'LIMIT' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Limit (Maker)
              </button>
            </div>
          </div>

          {/* Limit Price (if limit) */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Precio Límite ($)
              </label>
              <input
                type="number"
                step="any"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#38BDF8]"
                required
              />
            </div>
          )}

          {/* Amount in USDT */}
          <div className={orderType === 'LIMIT' ? '' : 'sm:col-span-2'}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Monto en USDT
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Disp: ${(account.freeMarginUsd || 0).toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amountUsdt}
                onChange={(e) => setAmountUsdt(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#38BDF8]"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                ≈ {cryptoAmount} {symbol.split('/')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Percentage Chips */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-slate-500">Fracción de Margen:</span>
          <div className="flex items-center gap-1.5">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-0.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-[10.5px] font-mono cursor-pointer transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Submit Execution Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              side === 'BUY'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-rose-500/20'
            }`}
          >
            {side === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>
              {isSubmitting 
                ? 'Transmitiendo orden al exchange...' 
                : `Ejecutar ${side} de $${numericAmountUsdt} en ${account.venueName}`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
