import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Activity, Layers } from 'lucide-react';
import { ExchangeIcon, ExchangeId } from './ExchangeIcon';
import { MarketType, AdapterConnectionStatus, MarketStats } from '../../core/market-feed/types';

export interface ExchangePairOption {
  exchange: ExchangeId;
  name: string;
  markets: MarketType[];
}

export const SUPPORTED_EXCHANGES: ExchangePairOption[] = [
  { exchange: 'binance', name: 'Binance', markets: ['futures', 'spot'] },
  { exchange: 'bybit', name: 'Bybit', markets: ['futures', 'spot'] },
  { exchange: 'kucoin', name: 'KuCoin', markets: ['futures', 'spot'] },
  { exchange: 'okx', name: 'OKX', markets: ['futures', 'spot'] },
  { exchange: 'synthetic', name: 'ZYTI Synthetic', markets: ['futures', 'spot'] }
];

interface ExchangePairSelectorProps {
  currentExchange: string;
  currentMarketType: MarketType;
  selectedPair: string;
  supportedPairs: string[];
  connectionStatus: AdapterConnectionStatus;
  stats: MarketStats;
  isEs: boolean;
  onSelectExchange: (exchange: string) => void;
  onSelectMarketType: (marketType: MarketType) => void;
  onSelectPair: (pair: string) => void;
}

export const ExchangePairSelector: React.FC<ExchangePairSelectorProps> = ({
  currentExchange,
  currentMarketType,
  selectedPair,
  supportedPairs,
  connectionStatus,
  stats,
  isEs,
  onSelectExchange,
  onSelectMarketType,
  onSelectPair
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeExchangeObj = SUPPORTED_EXCHANGES.find(
    (e) => e.exchange.toLowerCase() === currentExchange.toLowerCase()
  ) || SUPPORTED_EXCHANGES[0];

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
      case 'CONNECTING':
      case 'RECONNECTING':
      case 'ROTATING_24H':
        return 'bg-amber-500 animate-pulse';
      case 'DISCONNECTED':
      default:
        return 'bg-slate-400';
    }
  };

  const changeValue = typeof stats?.change24h === 'number' && !isNaN(stats.change24h)
    ? Number(stats.change24h.toFixed(2))
    : 0;

  const priceValue = typeof stats?.lastPrice === 'number' && !isNaN(stats.lastPrice) && stats.lastPrice > 0
    ? stats.lastPrice
    : 0;

  const formattedPrice = priceValue > 0
    ? priceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* BOTÓN DISPARADOR: PAR + RENDIMIENTO DELANTE Y PRECIO DEBAJO PARA AHORRAR ESPACIO */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:shadow-sm font-sans transition-all cursor-pointer shadow-xs select-none group shrink-0"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <ExchangeIcon exchange={currentExchange} size={16} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white ${getStatusColor()}`}
            title={`Estado: ${connectionStatus}`}
          />
        </div>

        {/* CONTENEDOR EN 2 LÍNEAS PARA AHORRAR ESPACIO: LÍNEA 1 (PAR + SEGMENTO), LÍNEA 2 (EXCHANGE + RENDIMIENTO DELANTE DEL PRECIO) */}
        <div className="flex flex-col text-left leading-tight min-w-0">
          {/* LÍNEA 1: PAR + SEGMENTO */}
          <div className="flex items-center gap-1">
            <span className="font-black text-[10px] sm:text-xs text-white tracking-tight">
              {selectedPair}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold px-0.5 sm:px-1 py-0 rounded bg-amber-100/80 text-amber-900 border border-amber-200">
              {currentMarketType === 'futures' ? 'Perp' : 'Spot'}
            </span>
          </div>

          {/* LÍNEA 2: RENDIMIENTO + PRECIO (EXCHANGE VISIBLE SOLO EN >= SM PARA PRIORIZAR ESPACIO MÓVIL) */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[9px] font-mono mt-0.5">
            <span className="hidden sm:inline text-slate-400 font-semibold truncate max-w-[60px] sm:max-w-[75px]">
              {activeExchangeObj.name}
            </span>

            {/* RENDIMIENTO DEL DÍA DELANTE DEL PRECIO */}
            <span
              className={`text-[7.5px] sm:text-[9px] font-mono font-bold px-0.5 sm:px-1 py-0.2 rounded leading-none ${
                changeValue >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {changeValue >= 0 ? '+' : ''}{changeValue.toFixed(2)}%
            </span>

            {/* PRECIO DEL ACTIVO EN VIVO */}
            <span
              className={`font-black text-[9.5px] sm:text-[11.5px] tracking-tight leading-none ${
                changeValue >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              ${formattedPrice}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-amber-600 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* DROPDOWN FLOTANTE MODERNO */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl py-3 px-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* SECCIÓN 1: SELECCIONAR EXCHANGE */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                {isEs ? 'Exchange / Proveedor' : 'Exchange / Venue'}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold">
                <Activity className="w-3 h-3" />
                Live WSS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_EXCHANGES.map((ex) => {
                const isSelected = ex.exchange.toLowerCase() === currentExchange.toLowerCase();
                return (
                  <button
                    key={ex.exchange}
                    type="button"
                    onClick={() => {
                      onSelectExchange(ex.exchange);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-amber-50/40 text-slate-300'
                    }`}
                  >
                    <ExchangeIcon exchange={ex.exchange} size={16} />
                    <span className="text-xs truncate flex-1">{ex.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 2: TIPO DE MERCADO (FUTUROS VS SPOT) */}
          <div className="mb-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                {isEs ? 'Mercado' : 'Market Segment'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                {currentMarketType === 'futures' ? 'USDT-M Perpetuals' : 'Spot Cash'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectMarketType('futures')}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentMarketType === 'futures'
                    ? 'bg-slate-50 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3 text-amber-600" />
                {isEs ? 'Futuros' : 'Futures'}
              </button>

              <button
                type="button"
                onClick={() => onSelectMarketType('spot')}
                className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentMarketType === 'spot'
                    ? 'bg-slate-50 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Spot</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: LISTA DE PARES */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                {isEs ? 'Pares Disponibles' : 'Trading Pairs'}
              </span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {supportedPairs.map((p) => {
                const isSelected = selectedPair === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onSelectPair(p);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'hover:bg-amber-50/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-mono">{p}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </>
      )}
    </div>
  );
};
