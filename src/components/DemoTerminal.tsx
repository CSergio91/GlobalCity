import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Bot, 
  Copy, 
  RefreshCw,
  Send,
  Fuel,
  Sliders,
  Radio
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { MULTI_ASSET_MARKET_TICKS, INITIAL_CONNECTED_ACCOUNTS } from '../data/mockData';

interface DemoTerminalProps {
  onBackToLanding: () => void;
}

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram'>('overview');
  
  const [orderAmount, setOrderAmount] = useState<string>("1.0");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USDT");
  const [notification, setNotification] = useState<string | null>(null);

  const totalBalance = INITIAL_CONNECTED_ACCOUNTS.reduce((acc, curr) => acc + curr.balanceUsd, 0);

  const handleSimulateSplitOrder = (side: 'BUY' | 'SELL') => {
    setNotification(`¡Orden Multi-Exchange ${side} de ${orderAmount} ${selectedSymbol} enviada con éxito! Fragmentada en Bybit v5 (40%), OKX DMA (35%) e Hyperliquid L1 (25%).`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans">
      
      {/* Terminal Top Bar */}
      <header className="h-16 bg-[#0D0F17] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToLanding}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Web</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10" />

          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-[10px] font-mono-nums px-2 py-0.5 rounded-full bg-[#EC4899]/15 border border-[#EC4899]/30 text-[#F472B6]">
              MULTI-EXCHANGE & BROKER
            </span>
          </div>
        </div>

        {/* Global Account Summary & Language Candlestick */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div className="hidden sm:block">
            <span className="text-slate-400">Equidad Consolidada: </span>
            <span className="text-sm font-mono-nums font-bold text-white">
              ${totalBalance.toLocaleString()} USD
            </span>
          </div>
          <div className="hidden md:block">
            <span className="text-slate-400">Gas Tank: </span>
            <span className="text-sm font-mono-nums font-bold text-emerald-400">
              142.50 USDT
            </span>
          </div>
          <CandlestickLanguageSelector />
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#10121B] border-b border-white/10 px-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview' 
              ? 'border-[#E06D8A] text-white' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Portafolio Agregado</span>
        </button>

        <button
          onClick={() => setActiveTab('multiorder')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'multiorder' 
              ? 'border-[#E06D8A] text-white' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Multi-Order Splitting</span>
        </button>

        <button
          onClick={() => setActiveTab('arbitrage')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'arbitrage' 
              ? 'border-[#E06D8A] text-white' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Arbitraje Sintético L2</span>
        </button>

        <button
          onClick={() => setActiveTab('copy')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'copy' 
              ? 'border-[#E06D8A] text-white' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>Copy Trading Cruzado</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'telegram' 
              ? 'border-[#E06D8A] text-white' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Telegram Webhook Control</span>
        </button>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {INITIAL_CONNECTED_ACCOUNTS.slice(0, 3).map((acc) => (
                <div key={acc.id} className="glass-panel rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{acc.venueName}</span>
                    <span className="text-[10px] font-mono-nums px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      ONLINE ({acc.pingMs}ms)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{acc.assetClass}</div>
                  <div className="text-2xl font-extrabold font-mono-nums text-white mt-3">
                    ${acc.balanceUsd.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono-nums mt-1">
                    Margen libre: ${acc.freeMarginUsd.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Streaming Data */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <h3 className="text-base font-bold text-white mb-4">Catálogo de Activos Sincronizados en Tiempo Real</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-nums">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-sans">
                      <th className="pb-3 px-3">Símbolo</th>
                      <th className="pb-3 px-3">Precio Spot/Perp</th>
                      <th className="pb-3 px-3">Variación 24h</th>
                      <th className="pb-3 px-3">Volumen 24h</th>
                      <th className="pb-3 px-3 font-sans">Venues Sincronizados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MULTI_ASSET_MARKET_TICKS.map((t) => (
                      <tr key={t.symbol} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-3 font-bold text-white font-sans">{t.symbol}</td>
                        <td className="py-3.5 px-3 text-white">${t.price.toLocaleString()}</td>
                        <td className={`py-3.5 px-3 font-bold ${t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.change24h >= 0 ? `+${t.change24h}%` : `${t.change24h}%`}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">{t.volume24h}</td>
                        <td className="py-3.5 px-3 text-slate-400 font-sans text-xs">{t.venues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Order Splitting */}
        {activeTab === 'multiorder' && (
          <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Despacho Concurrente Asíncrono</h3>
            <p className="text-xs text-slate-400 mb-6">
              Envía una orden padre que el Smart Order Router fragmenta en milisegundos entre Bybit, OKX, cTrader y terminales MT5 sin saturar la liquidez de un solo libro.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instrumento a Operar</label>
                <select 
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-[#151724] border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
                >
                  <option value="BTC/USDT">BTC/USDT (Cripto Perpetuo)</option>
                  <option value="ETH/USDT">ETH/USDT (Cripto Perpetuo)</option>
                  <option value="EUR/USD">EUR/USD (Forex cTrader/MT5)</option>
                  <option value="XAU/USD">XAU/USD (Oro MT5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tamaño de la Orden Padre</label>
                <input 
                  type="text" 
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full bg-[#151724] border border-white/10 rounded-xl p-3 text-sm font-mono-nums font-bold text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                <div className="text-slate-400 font-medium">Distribución Calculada por el EMS:</div>
                <div className="flex justify-between font-mono-nums text-slate-300">
                  <span>Bybit Broker (40%):</span>
                  <span className="font-bold text-white">{(Number(orderAmount) * 0.40).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono-nums text-slate-300">
                  <span>OKX DMA (35%):</span>
                  <span className="font-bold text-white">{(Number(orderAmount) * 0.35).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono-nums text-slate-300">
                  <span>Hyperliquid / cTrader (25%):</span>
                  <span className="font-bold text-white">{(Number(orderAmount) * 0.25).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleSimulateSplitOrder('BUY')}
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  COMPRA CONCURRENTE (LONG)
                </button>
                <button
                  onClick={() => handleSimulateSplitOrder('SELL')}
                  className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  VENTA CONCURRENTE (SHORT)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Arbitraje */}
        {activeTab === 'arbitrage' && (
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Radar de Arbitraje Sintético Simultáneo</h3>
            <p className="text-xs text-slate-400 mb-6">
              Captura divergencias de precio entre libros L2 en tiempo real sin transferencias por blockchain.
            </p>

            <div className="p-4 rounded-2xl bg-[#141624] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">BTC/USDT: OKX DMA ➔ Bybit v5</div>
                <div className="text-xs text-slate-400 mt-1">
                  Spread Neto Calculado: <strong className="text-emerald-400 font-mono-nums">+0.274%</strong> (Deducidas comisiones taker de ambos lados)
                </div>
              </div>
              <button 
                onClick={() => {
                  setNotification("¡Arbitraje Sintético BTC/USDT ejecutado en 16ms! Fee de 0.82 USDT deducido de Gas Tank.");
                  setTimeout(() => setNotification(null), 5000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#3be0cb] cursor-pointer transition-all active:scale-95"
              >
                Disparar 1-Clic
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Copy Trading */}
        {activeTab === 'copy' && (
          <div className="glass-panel rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Puente de Replicación de Señales</h3>
            <p className="text-xs text-slate-400 mb-6">
              Configura tu cuenta Master y los brokers secundarios para replicar operaciones en tiempo real con normalización de lotaje.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Master Account: Bybit v5 (Cripto)</div>
                  <div className="text-slate-400">Origen de señales y órdenes manuales.</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono-nums">ACTIVA</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Espejo 1: cTrader Open API (Forex/CFDs)</div>
                  <div className="text-slate-400">Multiplicador: 1.0x (Traducción contratos ➔ Lotes)</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono-nums">ENLACE OK</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Espejo 2: MetaTrader 5 Terminal</div>
                  <div className="text-slate-400">Multiplicador: 0.5x (Ajustado al margen libre)</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono-nums">ENLACE OK</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Telegram */}
        {activeTab === 'telegram' && (
          <div className="glass-panel rounded-3xl p-8 border border-white/10 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Conexión Segura con Telegram Bot</h3>
            <p className="text-xs text-slate-300 mt-2 mb-6">
              Escanea el código o activa el webhook con tu identificador para recibir reportes consolidados y autorizar operaciones por chat.
            </p>
            <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 text-xs text-slate-300 font-mono-nums mb-6">
              Bot: @GlobalCityMaster_bot · Token Estado: <span className="text-emerald-400 font-bold">VINCULADO</span>
            </div>
            <button 
              onClick={() => alert("Enviando mensaje de prueba a tu cuenta de Telegram...")}
              className="px-6 py-3 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#34e2cb] cursor-pointer"
            >
              Enviar Notificación de Prueba a Telegram
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
