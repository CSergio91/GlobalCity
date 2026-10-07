/**
 * ZYTI Trade - Market Feed & Connectivity Contracts
 * Contratos neutrales y agnósticos de exchange para Spot y Futuros Perpetuos.
 * Compatibles con Web Workers, React, Node.js y motores de Arbitraje.
 */

export type MarketType = 'spot' | 'futures';

export type AdapterConnectionStatus = 
  | 'DISCONNECTED' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'RECONNECTING' 
  | 'ROTATING_24H';

export interface MarketTick {
  symbol: string;
  exchange: string;
  marketType: MarketType;
  price: number;
  timestamp: number;
  volume: number;
  side: 'buy' | 'sell';
}

export interface KLineBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total?: number;
}

export interface OrderBookPayload {
  symbol?: string;
  exchange?: string;
  marketType?: MarketType;
  timestamp?: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface MarketStats {
  symbol: string;
  exchange?: string;
  marketType?: MarketType;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate?: number; // Para futuros perpetuos
  nextFundingTime?: number;
}

export type MarketFeedCommand =
  | { type: 'SUBSCRIBE'; payload: { exchange?: string; symbol: string; timeframe?: string; marketType?: MarketType; subscriberId?: string } }
  | { type: 'UNSUBSCRIBE'; payload: { exchange?: string; symbol: string; marketType?: MarketType; subscriberId?: string } }
  | { type: 'CHANGE_TIMEFRAME'; payload: { timeframe: string } }
  | { type: 'SET_EXCHANGE'; payload: { exchange: string; marketType?: MarketType } };

export type MarketFeedEvent =
  | { type: 'TICK_UPDATE'; payload: { symbol: string; bar: KLineBar; stats: MarketStats; exchange?: string; marketType?: MarketType } }
  | { type: 'KLINE'; payload: { exchange: string; symbol: string; marketType: MarketType; bar: KLineBar } }
  | { type: 'TICKER'; payload: { exchange: string; symbol: string; marketType: MarketType; stats: MarketStats } }
  | { type: 'HISTORICAL_BARS'; payload: { symbol: string; bars: KLineBar[]; exchange?: string; marketType?: MarketType } }
  | { type: 'ORDERBOOK_UPDATE'; payload: OrderBookPayload }
  | { type: 'STATUS_CHANGE'; payload: { exchange: string; marketType: MarketType; status: AdapterConnectionStatus; message?: string } }
  | { type: 'ERROR'; payload: { exchange: string; message: string; code?: string } };

