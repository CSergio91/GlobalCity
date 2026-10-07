import { MarketType, AdapterConnectionStatus, MarketFeedEvent } from '../types';

/**
 * Contrato único para todos los adaptadores nativos de exchange.
 * Cada adaptador gestiona internamente tanto Spot como Futuros.
 */
export interface IMarketAdapter {
  readonly exchangeId: string;

  getStatus(marketType: MarketType): AdapterConnectionStatus;

  subscribe(
    symbol: string,
    timeframe: string,
    subscriberId: string,
    marketType?: MarketType
  ): void;

  unsubscribe(
    symbol: string,
    subscriberId: string,
    marketType?: MarketType
  ): void;

  onEvent(handler: (event: MarketFeedEvent) => void): () => void;

  destroy(): void;
}
