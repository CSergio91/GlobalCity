/**
 * ZYTI Trade - MarketFeedHub
 * Orquestador singleton central de Market Data Multi-Exchange (Spot & Futuros).
 * Administra adaptadores de forma perezosa (Lazy Loading) y Reference Counting global.
 */

import { MarketType, AdapterConnectionStatus, MarketFeedEvent } from './types';
import { IMarketAdapter } from './adapters/IMarketAdapter';
import { BinanceAdapter } from './adapters/BinanceAdapter';
import { BybitAdapter } from './adapters/BybitAdapter';
import { KuCoinAdapter } from './adapters/KuCoinAdapter';
import { OKXAdapter } from './adapters/OKXAdapter';
import { SyntheticAdapter } from './adapters/SyntheticAdapter';

export class MarketFeedHub {
  private static instance: MarketFeedHub | null = null;

  private adapters: Map<string, IMarketAdapter> = new Map();
  private eventListeners: Set<(event: MarketFeedEvent) => void> = new Set();
  private adapterCleanupFns: Map<string, () => void> = new Map();

  private constructor() {}

  public static getInstance(): MarketFeedHub {
    if (!MarketFeedHub.instance) {
      MarketFeedHub.instance = new MarketFeedHub();
    }
    return MarketFeedHub.instance;
  }

  /**
   * Obtiene o instancia bajo demanda el adaptador nativo solicitado.
   */
  public getAdapter(exchangeId: string): IMarketAdapter {
    const key = exchangeId.toLowerCase();
    if (!this.adapters.has(key)) {
      let adapter: IMarketAdapter;

      switch (key) {
        case 'binance':
          adapter = new BinanceAdapter();
          break;
        case 'bybit':
          adapter = new BybitAdapter();
          break;
        case 'kucoin':
          adapter = new KuCoinAdapter();
          break;
        case 'okx':
          adapter = new OKXAdapter();
          break;
        case 'synthetic':
        default:
          adapter = new SyntheticAdapter();
          break;
      }

      // Reenviar eventos del adaptador a los oyentes del Hub
      const unsubscribeEvent = adapter.onEvent((event) => {
        this.emit(event);
      });

      this.adapters.set(key, adapter);
      this.adapterCleanupFns.set(key, unsubscribeEvent);
    }

    return this.adapters.get(key)!;
  }

  /**
   * Suscribe a un stream de mercado (Spot o Futuros) en un exchange específico.
   */
  public subscribe(
    exchangeId: string,
    symbol: string,
    timeframe: string = '15m',
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const adapter = this.getAdapter(exchangeId);
    adapter.subscribe(symbol, timeframe, subscriberId, marketType);
  }

  /**
   * Desuscribe de un stream. Si no quedan suscriptores, el adaptador aplicará debounce
   * y cerrará el socket automáticamente.
   */
  public unsubscribe(
    exchangeId: string,
    symbol: string,
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const key = exchangeId.toLowerCase();
    const adapter = this.adapters.get(key);
    if (adapter) {
      adapter.unsubscribe(symbol, subscriberId, marketType);
    }
  }

  /**
   * Obtiene el estado de conexión actual de un exchange y tipo de mercado.
   */
  public getStatus(exchangeId: string, marketType: MarketType): AdapterConnectionStatus {
    const key = exchangeId.toLowerCase();
    const adapter = this.adapters.get(key);
    if (!adapter) return 'DISCONNECTED';
    return adapter.getStatus(marketType);
  }

  /**
   * Registra un callback para recibir eventos consolidados de todos los exchanges.
   */
  public onEvent(handler: (event: MarketFeedEvent) => void): () => void {
    this.eventListeners.add(handler);
    return () => {
      this.eventListeners.delete(handler);
    };
  }

  private emit(event: MarketFeedEvent): void {
    this.eventListeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[MarketFeedHub] Error en listener:', err);
      }
    });
  }

  /**
   * Destruye todos los adaptadores y limpia los oyentes.
   */
  public destroy(): void {
    this.adapterCleanupFns.forEach((fn) => fn());
    this.adapterCleanupFns.clear();

    this.adapters.forEach((adapter) => {
      adapter.destroy();
    });
    this.adapters.clear();
    this.eventListeners.clear();
  }
}

export const marketFeedHub = MarketFeedHub.getInstance();
