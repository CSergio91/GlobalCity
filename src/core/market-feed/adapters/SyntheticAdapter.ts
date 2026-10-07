/**
 * ZYTI Trade - Synthetic / Deterministic Market Feed Adapter
 * Proveedor local offline de alta fidelidad para simulación, backtesting y desarrollo.
 * Genera ticks de Spot y Futuros con base spread realista para calibrar el motor de arbitraje de ZYTI.
 */

import { 
  MarketType, 
  AdapterConnectionStatus, 
  MarketFeedEvent, 
  KLineBar, 
  OrderBookPayload, 
  MarketStats 
} from '../types';
import { IMarketAdapter } from './IMarketAdapter';

interface SyntheticSymbolState {
  spotPrice: number;
  futuresBasisBps: number; // Basis en puntos básicos (ej. +12 bps de prima en futuros)
  high24h: number;
  low24h: number;
  open24h: number;
  volume24h: number;
  currentBar: Record<MarketType, KLineBar>;
}

export class SyntheticAdapter implements IMarketAdapter {
  public readonly exchangeId = 'synthetic';

  private status: Record<MarketType, AdapterConnectionStatus> = {
    spot: 'DISCONNECTED',
    futures: 'DISCONNECTED'
  };

  private listeners: Set<(event: MarketFeedEvent) => void> = new Set();
  private subscribers: Map<string, Set<string>> = new Map(); // `${marketType}:${symbol}` -> Set<subId>
  private symbolStates: Map<string, SyntheticSymbolState> = new Map();
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.status.spot = 'CONNECTED';
    this.status.futures = 'CONNECTED';
  }

  public getStatus(marketType: MarketType): AdapterConnectionStatus {
    return this.status[marketType];
  }

  public onEvent(handler: (event: MarketFeedEvent) => void): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private emit(event: MarketFeedEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[SyntheticAdapter] Error en listener:', err);
      }
    });
  }

  private getInitialPrice(symbol: string): number {
    const clean = symbol.toUpperCase();
    if (clean.includes('BTC')) return 96450.0;
    if (clean.includes('ETH')) return 3280.0;
    if (clean.includes('SOL')) return 215.0;
    if (clean.includes('BNB')) return 650.0;
    if (clean.includes('XRP')) return 2.45;
    return 100.0;
  }

  private getOrCreateState(symbol: string): SyntheticSymbolState {
    if (!this.symbolStates.has(symbol)) {
      const initial = this.getInitialPrice(symbol);
      const now = Date.now();
      const currentIntervalTs = Math.floor(now / 900000) * 900000;

      const initBar: KLineBar = {
        timestamp: currentIntervalTs,
        open: initial,
        high: initial,
        low: initial,
        close: initial,
        volume: 10
      };

      this.symbolStates.set(symbol, {
        spotPrice: initial,
        futuresBasisBps: 15, // +0.15% prima estándar de futuros sobre spot
        high24h: initial * 1.025,
        low24h: initial * 0.985,
        open24h: initial * 0.995,
        volume24h: 12500000,
        currentBar: {
          spot: { ...initBar },
          futures: { ...initBar, open: initial * 1.0015, close: initial * 1.0015, high: initial * 1.0015, low: initial * 1.0015 }
        }
      });
    }
    return this.symbolStates.get(symbol)!;
  }

  public subscribe(
    symbol: string,
    _timeframe: string = '15m',
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const key = `${marketType}:${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(subscriberId);
    this.getOrCreateState(symbol);

    this.ensureRunning();

    // Despachar inmediatamente primer tick
    this.dispatchTickFor(symbol, marketType);
  }

  public unsubscribe(
    symbol: string,
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const key = `${marketType}:${symbol}`;
    const set = this.subscribers.get(key);
    if (!set) return;

    set.delete(subscriberId);
    if (set.size === 0) {
      this.subscribers.delete(key);
    }

    if (this.subscribers.size === 0) {
      this.stop();
    }
  }

  private ensureRunning(): void {
    if (!this.tickInterval) {
      this.tickInterval = setInterval(() => {
        this.stepSimulation();
      }, 500); // Ticks cada 500ms
    }
  }

  private stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private stepSimulation(): void {
    const activeSymbols = new Set<string>();
    this.subscribers.forEach((subs, key) => {
      if (subs.size > 0) {
        const symbol = key.split(':')[1];
        activeSymbols.add(symbol);
      }
    });

    activeSymbols.forEach((symbol) => {
      const state = this.getOrCreateState(symbol);
      
      // Brownian motion estocástico
      const deltaPercent = (Math.random() - 0.499) * 0.0015; // Ligera oscilación +/- 0.15%
      state.spotPrice = +(state.spotPrice * (1 + deltaPercent)).toFixed(2);

      // Leve oscilación de prima de futuros (para simular arbitraje dinámico)
      const basisDelta = (Math.random() - 0.5) * 2;
      state.futuresBasisBps = Math.max(2, Math.min(30, state.futuresBasisBps + basisDelta));

      if (state.spotPrice > state.high24h) state.high24h = state.spotPrice;
      if (state.spotPrice < state.low24h) state.low24h = state.spotPrice;
      state.volume24h += Math.random() * 25000;

      // Despachar eventos a suscriptores activos
      if (this.subscribers.get(`spot:${symbol}`)?.size) {
        this.dispatchTickFor(symbol, 'spot');
      }
      if (this.subscribers.get(`futures:${symbol}`)?.size) {
        this.dispatchTickFor(symbol, 'futures');
      }
    });
  }

  private dispatchTickFor(symbol: string, marketType: MarketType): void {
    const state = this.getOrCreateState(symbol);
    const now = Date.now();

    const price = marketType === 'futures'
      ? +(state.spotPrice * (1 + state.futuresBasisBps / 10000)).toFixed(2)
      : state.spotPrice;

    // 1. Ticker Stats
    const stats: MarketStats = {
      symbol,
      exchange: this.exchangeId,
      marketType,
      lastPrice: price,
      change24h: +(((price - state.open24h) / state.open24h) * 100).toFixed(2),
      high24h: marketType === 'futures' ? +(state.high24h * 1.0015).toFixed(2) : state.high24h,
      low24h: marketType === 'futures' ? +(state.low24h * 1.0015).toFixed(2) : state.low24h,
      volume24h: +state.volume24h.toFixed(2)
    };

    this.emit({
      type: 'TICKER',
      payload: {
        exchange: this.exchangeId,
        symbol,
        marketType,
        stats
      }
    });

    // 2. KLine Bar update
    const bar = state.currentBar[marketType];
    const currentIntervalTs = Math.floor(now / 900000) * 900000;

    if (now >= bar.timestamp + 900000) {
      // Nueva vela
      bar.timestamp = currentIntervalTs;
      bar.open = price;
      bar.high = price;
      bar.low = price;
      bar.close = price;
      bar.volume = 1;
    } else {
      if (price > bar.high) bar.high = price;
      if (price < bar.low) bar.low = price;
      bar.close = price;
      bar.volume += Math.random() * 0.5;
    }

    this.emit({
      type: 'KLINE',
      payload: {
        exchange: this.exchangeId,
        symbol,
        marketType,
        bar: { ...bar }
      }
    });

    // TICK_UPDATE consolidado para terminal
    this.emit({
      type: 'TICK_UPDATE',
      payload: {
        symbol,
        bar: { ...bar },
        stats,
        exchange: this.exchangeId,
        marketType
      }
    });

    // 3. OrderBook L2 Depth (5 niveles bid / ask)
    const tickSpread = price * 0.0001;
    const rawBids = [
      [+(price - tickSpread * 1).toFixed(2), +(Math.random() * 2.5 + 0.1).toFixed(3)],
      [+(price - tickSpread * 2).toFixed(2), +(Math.random() * 4.2 + 0.5).toFixed(3)],
      [+(price - tickSpread * 3).toFixed(2), +(Math.random() * 6.1 + 1.0).toFixed(3)],
      [+(price - tickSpread * 4).toFixed(2), +(Math.random() * 8.5 + 1.2).toFixed(3)],
      [+(price - tickSpread * 5).toFixed(2), +(Math.random() * 12.0 + 2.0).toFixed(3)]
    ];

    const rawAsks = [
      [+(price + tickSpread * 1).toFixed(2), +(Math.random() * 2.5 + 0.1).toFixed(3)],
      [+(price + tickSpread * 2).toFixed(2), +(Math.random() * 4.2 + 0.5).toFixed(3)],
      [+(price + tickSpread * 3).toFixed(2), +(Math.random() * 6.1 + 1.0).toFixed(3)],
      [+(price + tickSpread * 4).toFixed(2), +(Math.random() * 8.5 + 1.2).toFixed(3)],
      [+(price + tickSpread * 5).toFixed(2), +(Math.random() * 12.0 + 2.0).toFixed(3)]
    ];

    const orderbook: OrderBookPayload = {
      symbol,
      exchange: this.exchangeId,
      marketType,
      timestamp: now,
      bids: rawBids.map((b) => ({ price: b[0], amount: b[1], total: b[1] })),
      asks: rawAsks.map((a) => ({ price: a[0], amount: a[1], total: a[1] }))
    };

    this.emit({
      type: 'ORDERBOOK_UPDATE',
      payload: orderbook
    });
  }

  public destroy(): void {
    this.stop();
    this.listeners.clear();
    this.subscribers.clear();
    this.symbolStates.clear();
  }
}
